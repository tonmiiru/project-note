import type { Point, ProjectState, PointStatus, ProjectInfo, User, Reaction, Reply, HistoricalSummary } from 'worker/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { Session } from '@supabase/supabase-js';
async function getAuthHeaders(): Promise<HeadersInit> {
  const session = useAuthStore.getState().session;
  if (!session?.access_token) {
    console.warn('No auth token found for API request.');
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
}
async function handleResponse<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    console.error(`API Error: ${response.status} ${response.statusText}`);
    const errorBody = await response.text();
    console.error('Error Body:', errorBody);
    return null;
  }
  try {
    const json = await response.json();
    if (json.success) {
      return json.data;
    }
    console.error('API call was not successful:', json.error);
    return null;
  } catch (e) {
    console.error('Failed to parse JSON response', e);
    return null;
  }
}
// --- Auth ---
export async function login(email: string, password: string): Promise<Session | null> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<Session>(response);
}
export async function signup(email: string, password: string): Promise<Session | null> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<Session>(response);
}
// --- Projects ---
export async function getProjects(): Promise<ProjectInfo[] | null> {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/projects', { headers });
  return handleResponse<ProjectInfo[]>(response);
}
export async function createProject(name: string): Promise<ProjectInfo | null> {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/projects', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name }),
  });
  return handleResponse<ProjectInfo>(response);
}
export async function getProject(projectId: string): Promise<ProjectState | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/project/${projectId}`, { headers });
  return handleResponse<ProjectState>(response);
}
// --- Points ---
export async function addPoint(projectId: string, content: string, topic: string): Promise<Point | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/project/${projectId}/points`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content, topic }),
  });
  return handleResponse<Point>(response);
}
export async function updatePointStatus(projectId: string, pointId: string, status: PointStatus): Promise<Point | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/project/${projectId}/points/${pointId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status }),
  });
  return handleResponse<Point>(response);
}
export async function addReaction(projectId: string, pointId: string, emoji: string): Promise<Reaction | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/project/${projectId}/points/${pointId}/reactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ emoji }),
  });
  return handleResponse<Reaction>(response);
}
export async function addReply(projectId: string, pointId: string, content: string): Promise<Reply | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/project/${projectId}/points/${pointId}/replies`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content }),
  });
  return handleResponse<Reply>(response);
}
// --- Summary ---
export async function generateSummary(projectId: string): Promise<HistoricalSummary | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`/api/project/${projectId}/summary`, {
    method: 'POST',
    headers,
  });
  return handleResponse<HistoricalSummary>(response);
}