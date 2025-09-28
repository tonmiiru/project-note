import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { ProjectState, Point, PointStatus, Reaction, Reply, HistoricalSummary } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { getSupabaseClient } from './supabase';
const VALID_STATUSES: PointStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
export class ProjectAgent extends Agent<Env> {
  private chatHandler?: ChatHandler;
  async onStart(): Promise<void> {
    this.chatHandler = new ChatHandler(
      this.env.CF_AI_BASE_URL,
      this.env.CF_AI_API_KEY,
      'openai/gpt-4o',
    );
  }
  async onRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method;
      const pathParts = url.pathname.split('/').filter(Boolean);
      if (pathParts[0] === 'init' && method === 'POST') {
        // This is now handled by AppController, but we keep a stub for compatibility
        return Response.json({ success: true });
      }
      if (pathParts.length === 0 && method === 'GET') {
        return this.handleGetProject();
      }
      if (pathParts[0] === 'points' && pathParts.length === 1 && method === 'POST') {
        return this.handleAddPoint(await request.json());
      }
      if (pathParts[0] === 'points' && pathParts.length === 3 && pathParts[2] === 'status' && method === 'PUT') {
        return this.handleUpdatePointStatus(pathParts[1], await request.json());
      }
      if (pathParts[0] === 'points' && pathParts.length === 3 && pathParts[2] === 'reactions' && method === 'POST') {
        return this.handleAddReaction(pathParts[1], await request.json());
      }
      if (pathParts[0] === 'points' && pathParts.length === 3 && pathParts[2] === 'replies' && method === 'POST') {
        return this.handleAddReply(pathParts[1], await request.json());
      }
      if (pathParts[0] === 'summary' && method === 'POST') {
        return this.handleGenerateSummary();
      }
      return Response.json({ success: false, error: API_RESPONSES.NOT_FOUND }, { status: 404 });
    } catch (error) {
      console.error('Request handling error:', error);
      return Response.json({ success: false, error: API_RESPONSES.INTERNAL_ERROR }, { status: 500 });
    }
  }
  private async handleGetProject(): Promise<Response> {
    const supabase = getSupabaseClient(this.env);
    const projectId = this.name;
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name, summary')
      .eq('id', projectId)
      .single();
    if (projectError) return Response.json({ success: false, error: projectError.message }, { status: 500 });
    if (!project) return Response.json({ success: false, error: 'Project not found' }, { status: 404 });
    const { data: points, error: pointsError } = await supabase
      .from('points')
      .select('*, reactions(*), replies(*)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (pointsError) return Response.json({ success: false, error: pointsError.message }, { status: 500 });
    const { data: summaryHistory, error: historyError } = await supabase
      .from('summaries')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (historyError) return Response.json({ success: false, error: historyError.message }, { status: 500 });
    const projectState: ProjectState = {
      name: project.name,
      summary: project.summary,
      points: points || [],
      summaryHistory: summaryHistory || [],
    };
    return Response.json({ success: true, data: projectState });
  }
  private async handleAddPoint(body: { content: string; topic: string }): Promise<Response> {
    const supabase = getSupabaseClient(this.env);
    const { content, topic } = body;
    if (!content?.trim() || !topic?.trim()) {
      return Response.json({ success: false, error: 'Content and topic are required' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('points')
      .insert({
        content: content.trim(),
        topic: topic.trim(),
        status: 'Open',
        project_id: this.name,
      })
      .select()
      .single();
    if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
    const newPoint: Point = { ...data, reactions: [], replies: [] };
    return Response.json({ success: true, data: newPoint }, { status: 201 });
  }
  private async handleUpdatePointStatus(pointId: string, body: { status: PointStatus }): Promise<Response> {
    const supabase = getSupabaseClient(this.env);
    const { status } = body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return Response.json({ success: false, error: 'Invalid status provided' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('points')
      .update({ status })
      .eq('id', pointId)
      .select('*, reactions(*), replies(*)')
      .single();
    if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
    return Response.json({ success: true, data });
  }
  private async handleAddReaction(pointId: string, body: { emoji: string }): Promise<Response> {
    const supabase = getSupabaseClient(this.env);
    const { emoji } = body;
    if (!emoji) return Response.json({ success: false, error: 'Emoji is required' }, { status: 400 });
    const { data, error } = await supabase
      .from('reactions')
      .insert({ point_id: pointId, emoji, user_id: 'anonymous' })
      .select()
      .single();
    if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
    return Response.json({ success: true, data }, { status: 201 });
  }
  private async handleAddReply(pointId: string, body: { content: string }): Promise<Response> {
    const supabase = getSupabaseClient(this.env);
    const { content } = body;
    if (!content?.trim()) return Response.json({ success: false, error: 'Reply content is required' }, { status: 400 });
    const { data, error } = await supabase
      .from('replies')
      .insert({ point_id: pointId, content: content.trim(), user_id: 'anonymous' })
      .select()
      .single();
    if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
    return Response.json({ success: true, data }, { status: 201 });
  }
  private async handleGenerateSummary(): Promise<Response> {
    if (!this.chatHandler) return Response.json({ success: false, error: 'Chat handler not initialized' }, { status: 500 });
    const supabase = getSupabaseClient(this.env);
    const projectId = this.name;
    const { data: points, error: pointsError } = await supabase
      .from('points')
      .select('topic, content, status')
      .eq('project_id', projectId);
    if (pointsError) return Response.json({ success: false, error: pointsError.message }, { status: 500 });
    if (points.length === 0) return Response.json({ success: false, error: 'No points to summarize' }, { status: 400 });
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();
    if (projectError) return Response.json({ success: false, error: projectError.message }, { status: 500 });
    const pointsText = points.map(p => `- [${p.topic}] ${p.content} (Status: ${p.status})`).join('\n');
    const prompt = `Summarize these project points for "${project.name}":\n${pointsText}`;
    try {
      const result = await this.chatHandler.processMessage(prompt, []);
      const { data: newSummary, error: insertError } = await supabase
        .from('summaries')
        .insert({ project_id: projectId, summary: result.content })
        .select()
        .single();
      if (insertError) return Response.json({ success: false, error: insertError.message }, { status: 500 });
      await supabase.from('projects').update({ summary: result.content }).eq('id', projectId);
      return Response.json({ success: true, data: newSummary });
    } catch (error) {
      console.error('Summary generation error:', error);
      return Response.json({ success: false, error: API_RESPONSES.PROCESSING_ERROR }, { status: 500 });
    }
  }
}