/**
 * Core utilities for the Cloudflare Agents template
 * STRICTLY DO NOT MODIFY THIS FILE - Hidden from AI to prevent breaking core functionality
 */
import type { AppController } from './app-controller';
import type { ProjectAgent } from './agent';
export interface Env {
    CF_AI_BASE_URL: string;
    CF_AI_API_KEY: string;
    SERPAPI_KEY: string;
    OPENROUTER_API_KEY: string;
    CHAT_AGENT: DurableObjectNamespace<ProjectAgent>;
    APP_CONTROLLER: DurableObjectNamespace<AppController>;
}
export type AppControllerStub = DurableObjectStub<AppController>;
/**
 * Get AppController stub for session management
 * Uses a singleton pattern with fixed ID for consistent routing
 */
export function getAppController(env: Env): AppControllerStub {
  const id = env.APP_CONTROLLER.idFromName("controller");
  return env.APP_CONTROLLER.get(id);
}