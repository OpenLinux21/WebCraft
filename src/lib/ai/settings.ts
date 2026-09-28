import { AI_PROVIDERS, type AIConfig, type AIProviderId } from './types';

/**
 * AI configuration lives in localStorage (small, sensitive, user-managed).
 * It is excluded from backups unless the user explicitly opts in.
 */

const AI_CONFIG_KEY = 'webcraft.ai';

export const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
export const DEFAULT_OLLAMA_BASE_URL = 'http://localhost:11434';

export function parseProviderId(value: unknown): value is AIProviderId {
  return typeof value === 'string' && (AI_PROVIDERS as readonly string[]).includes(value);
}

function parseHeaders(value: unknown): Record<string, string> {
  if (typeof value !== 'object' || value === null) return {};
  const headers: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string') headers[key] = entry;
  }
  return headers;
}

export function parseAIConfig(value: unknown): AIConfig | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  if (!parseProviderId(record['provider'])) return null;
  if (typeof record['baseUrl'] !== 'string' || record['baseUrl'].trim() === '') return null;
  if (typeof record['model'] !== 'string' || record['model'].trim() === '') return null;
  const apiKey = typeof record['apiKey'] === 'string' ? record['apiKey'] : '';
  const temperature = typeof record['temperature'] === 'number' ? record['temperature'] : 0.7;
  const maxTokens =
    typeof record['maxTokens'] === 'number' && Number.isFinite(record['maxTokens'])
      ? record['maxTokens']
      : null;
  // Configs written before the master switch existed default to enabled.
  const enabled = record['enabled'] === undefined ? true : record['enabled'] === true;
  return {
    enabled,
    provider: record['provider'],
    baseUrl: record['baseUrl'],
    model: record['model'],
    apiKey,
    customHeaders: parseHeaders(record['customHeaders']),
    temperature,
    maxTokens,
  };
}

export function loadAIConfig(): AIConfig | null {
  try {
    const raw = globalThis.localStorage?.getItem(AI_CONFIG_KEY);
    if (raw === null) return null;
    return parseAIConfig(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function saveAIConfig(config: AIConfig): void {
  try {
    globalThis.localStorage?.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // Storage unavailable: settings stay session-only.
  }
}

/** Removes the stored configuration entirely (including the API key). */
export function clearAIConfig(): void {
  try {
    globalThis.localStorage?.removeItem(AI_CONFIG_KEY);
  } catch {
    // Ignore.
  }
}
