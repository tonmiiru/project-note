import { DurableObject } from 'cloudflare:workers';
import type { ProjectInfo, User, UserTier } from './types';
import type { Env } from './core-utils';
import { getSupabaseClient } from './supabase';
const TIER_LIMITS: Record<UserTier, { projects: number }> = {
  free: { projects: 1 },
  plus: { projects: 5 },
};
export class AppController extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  async createProject(name: string, user: any): Promise<ProjectInfo | { error: string; limit: number }> {
    const supabase = getSupabaseClient(this.env);
    // In a real app, user tier would be in your DB. Here we assume it's on the user object.
    const userTier: UserTier = user.user_metadata?.tier || 'free';
    const limit = TIER_LIMITS[userTier].projects;
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    if (countError) {
      console.error('Error counting projects:', countError);
      throw countError;
    }
    if (count !== null && count >= limit) {
      return { error: 'Project limit reached', limit };
    }
    const now = new Date();
    const newProjectData = {
      name,
      user_id: user.id,
      summary_usage: {
        count: 0,
        resetDate: now.toISOString().split('T')[0],
      },
      created_at: now.toISOString(),
      last_active: now.toISOString(),
    };
    const { data, error } = await supabase
      .from('projects')
      .insert(newProjectData)
      .select()
      .single();
    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }
    return {
      id: data.id,
      name: data.name,
      userId: data.user_id,
      createdAt: new Date(data.created_at).getTime(),
      lastActive: new Date(data.last_active).getTime(),
      summaryUsage: data.summary_usage,
    };
  }
  async listProjects(userId: string): Promise<ProjectInfo[]> {
    const supabase = getSupabaseClient(this.env);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('last_active', { ascending: false });
    if (error) {
      console.error('Error listing projects:', error);
      throw error;
    }
    return data.map(p => ({
      id: p.id,
      name: p.name,
      userId: p.user_id,
      createdAt: new Date(p.created_at).getTime(),
      lastActive: new Date(p.last_active).getTime(),
      summaryUsage: p.summary_usage,
    }));
  }
  async getProject(projectId: string): Promise<ProjectInfo | null> {
    const supabase = getSupabaseClient(this.env);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error getting project:', error);
      throw error;
    }
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      userId: data.user_id,
      createdAt: new Date(data.created_at).getTime(),
      lastActive: new Date(data.last_active).getTime(),
      summaryUsage: data.summary_usage,
    };
  }
  async updateProject(project: ProjectInfo): Promise<void> {
    const supabase = getSupabaseClient(this.env);
    const { error } = await supabase
      .from('projects')
      .update({
        name: project.name,
        last_active: new Date(project.lastActive).toISOString(),
        summary_usage: project.summaryUsage,
      })
      .eq('id', project.id);
    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }
}