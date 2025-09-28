export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
// --- PointFlow Specific Types ---
export type PointStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type UserTier = 'free' | 'plus';
export interface Reaction {
  id: string;
  emoji: string;
  userId: string; // 'anonymous' for now
}
export interface Reply {
  id: string;
  content: string;
  userId: string; // 'anonymous' for now
  createdAt: string; // ISO 8601 string
}
export interface Point {
  id: string;
  content: string;
  topic: string;
  status: PointStatus;
  createdAt: string; // ISO 8601 string
  reactions: Reaction[];
  replies: Reply[];
}
export interface Topic {
  id: string;
  name: string;
}
export interface HistoricalSummary {
  id: string;
  summary: string;
  createdAt: string; // ISO 8601 string
}
export interface ProjectState {
  name: string;
  points: Point[];
  summary: string | null;
  summaryHistory: HistoricalSummary[];
}
export interface SummaryUsage {
  count: number;
  resetDate: string; // ISO 8601 Date string (YYYY-MM-DD)
}
export interface ProjectInfo {
  id: string;
  name: string;
  userId: string;
  createdAt: number;
  lastActive: number;
  summaryUsage: SummaryUsage;
}
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  tier: UserTier;
}
// --- Original Template Types (kept for reference) ---
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  id: string;
  toolCalls?: ToolCall[];
}
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}
export interface WeatherResult {
  location: string;
  temperature: number;
  condition: string;
}
export interface ErrorResult {
  error: string;
}
export interface ChatState {
  messages: Message[];
  sessionId: string;
  isProcessing: boolean;
  model: string;
  streamingMessage?: string;
}