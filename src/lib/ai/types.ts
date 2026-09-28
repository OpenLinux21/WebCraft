/** Core AI types shared by providers, settings and the assistant UI. */

export const AI_PROVIDERS = ['openai-compatible', 'ollama'] as const;
export type AIProviderId = (typeof AI_PROVIDERS)[number];

export interface AIConfig {
  /** Master switch; the assistant stays idle when false. */
  enabled: boolean;
  provider: AIProviderId;
  /** API root, e.g. https://api.openai.com/v1 or http://localhost:11434. */
  baseUrl: string;
  model: string;
  /** Sent as a Bearer token by the OpenAI-compatible provider; empty for none. */
  apiKey: string;
  /** Extra headers merged after defaults (can override Authorization). */
  customHeaders: Record<string, string>;
  temperature: number;
  /** null = provider default. */
  maxTokens: number | null;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  signal?: AbortSignal;
}

export type ChatDelta = { kind: 'text'; text: string } | { kind: 'done' };

export interface AIProvider {
  readonly id: AIProviderId;
  /** Streams response deltas; failures throw AIRequestError with hints. */
  chat(config: AIConfig, request: ChatRequest): AsyncIterable<ChatDelta>;
  /** Best-effort model list for the connection test. */
  listModels(config: AIConfig): Promise<string[]>;
}
