import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ProjectAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, AppControllerStub } from "./core-utils";
import type { User, ProjectInfo } from './types';
import { getSupabaseClient } from "./supabase";
import { bearerAuth } from 'hono/bearer-auth';
// --- Auth Middleware ---
const authMiddleware = () => bearerAuth({
  verifyToken: async (token, c) => {
    const supabase = getSupabaseClient(c.env);
    const { data: { user } } = await supabase.auth.getUser(token);
    return user !== null;
  },
});
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // --- Authentication Routes ---
    app.post('/api/auth/signup', async (c) => {
        const supabase = getSupabaseClient(c.env);
        const { email, password } = await c.req.json();
        if (!email || !password) return c.json({ success: false, error: 'Email and password are required' }, 400);
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return c.json({ success: false, error: error.message }, 400);
        if (!data.session) return c.json({ success: false, error: 'Could not sign up user.' }, 500);
        return c.json({ success: true, data: data.session });
    });
    app.post('/api/auth/login', async (c) => {
        const supabase = getSupabaseClient(c.env);
        const { email, password } = await c.req.json();
        if (!email || !password) return c.json({ success: false, error: 'Email and password are required' }, 400);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return c.json({ success: false, error: error.message }, 401);
        return c.json({ success: true, data: data.session });
    });
    // --- Protected Routes ---
    const protectedRoutes = new Hono<{ Bindings: Env }>();
    protectedRoutes.use('*', authMiddleware());
    // --- Project Management Routes ---
    protectedRoutes.get('/api/projects', async (c) => {
        const controller = getAppController(c.env);
        const res = await controller.fetch(`https://.../list`);
        return c.json({ success: true, data: await res.json() });
    });
    protectedRoutes.post('/api/projects', async (c) => {
        const { name } = await c.req.json();
        if (!name) return c.json({ success: false, error: 'Project name is required' }, 400);
        const controller = getAppController(c.env);
        const res = await controller.fetch(`https://.../create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const newProject: ProjectInfo | { error: string } = await res.json();
        if ('error' in newProject) {
            return c.json({ success: false, error: newProject.error }, 429);
        }
        const agent = await getAgentByName<Env, ProjectAgent>(c.env.CHAT_AGENT, newProject.id);
        await agent.fetch(new Request(`https://.../init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newProject.name })
        }));
        return c.json({ success: true, data: newProject }, 201);
    });
    // --- PointFlow Project API Routes ---
    protectedRoutes.all('/api/project/:projectId/*', async (c) => {
        try {
            const projectId = c.req.param('projectId');
            const agent = await getAgentByName<Env, ProjectAgent>(c.env.CHAT_AGENT, projectId);
            const url = new URL(c.req.url);
            const basePath = `/api/project/${projectId}`;
            url.pathname = url.pathname.startsWith(basePath) ? url.pathname.substring(basePath.length) : url.pathname;
            const req = new Request(url.toString(), c.req.raw);
            return agent.fetch(req);
        } catch (error) {
            console.error('Project agent routing error:', error);
            return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
    app.route('/', protectedRoutes);
}
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    // This is a workaround to allow the agent to call back to the controller
    const controllerApp = new Hono<{ Bindings: Env }>();
    controllerApp.use('*', async (c, next) => {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) return c.json({ error: 'Unauthorized' }, 401);
        const token = authHeader.replace('Bearer ', '');
        const supabase = getSupabaseClient(c.env);
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) return c.json({ error: 'Unauthorized' }, 401);
        c.set('user', user);
        await next();
    });
    controllerApp.post('/create', async (c) => {
        const controller = getAppController(c.env);
        const { name } = await c.req.json();
        const user = c.get('user');
        const result = await controller.createProject(name, user);
        return c.json(result);
    });
    controllerApp.get('/list', async (c) => {
        const controller = getAppController(c.env);
        const user = c.get('user');
        const projects = await controller.listProjects(user.id);
        return c.json(projects);
    });
    controllerApp.get('/projects/:projectId', async (c) => {
        const controller = getAppController(c.env);
        const project = await controller.getProject(c.req.param('projectId'));
        if (!project) return c.json(null, 404);
        return c.json(project);
    });
    controllerApp.put('/projects/:projectId', async (c) => {
        const controller = getAppController(c.env);
        const project: ProjectInfo = await c.req.json();
        await controller.updateProject(project);
        return c.json({ success: true });
    });
    app.route('/', controllerApp);
}