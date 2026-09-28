import { AIRequestError, describeFetchError } from './errors';
import { parseOllamaDeltas } from './sse';
import type { AIConfig, AIProvider, ChatDelta, ChatRequest } from './types';

export function buildOllamaChatUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  return `${trimmed}/api/chat`;
}

export function buildOllamaTagsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  return `${trimmed}/api/tags`;
}

export function buildOllamaChatBody(config: AIConfig, messages: ChatRequest['messages']): unknown {
  const options: Record<string, unknown> = {};
  if (Number.isFinite(config.temperature)) options['temperature'] = config.temperature;
  if (config.maxTokens !== null && config.maxTokens > 0) options['num_predict'] = config.maxTokens;
  return {
    model: config.model,
    messages,
    stream: true,
    options,
  };
}

/** Ollama native /api/chat protocol (NDJSON stream, no API key). */
export class OllamaProvider implements AIProvider {
  readonly id = 'ollama' as const;

  async *chat(config: AIConfig, request: ChatRequest): AsyncIterable<ChatDelta> {
    let response: Response;
    try {
      response = await fetch(buildOllamaChatUrl(config.baseUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildOllamaChatBody(config, request.messages)),
        signal: request.signal ?? null,
      });
    } catch (error: unknown) {
      const described = describeFetchError(error);
      throw new AIRequestError(described.message, described.hint, { cause: error });
    }
    if (!response.ok || response.body === null) {
      throw new AIRequestError(`Ollama answered with HTTP ${response.status}`);
    }
    for await (const text of parseOllamaDeltas(response.body)) {
      yield { kind: 'text', text };
    }
    yield { kind: 'done' };
  }

  async listModels(config: AIConfig): Promise<string[]> {
    let response: Response;
    try {
      response = await fetch(buildOllamaTagsUrl(config.baseUrl));
    } catch (error: unknown) {
      const described = describeFetchError(error);
      throw new AIRequestError(described.message, described.hint, { cause: error });
    }
    if (!response.ok) {
      throw new AIRequestError(`Ollama answered with HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    if (typeof payload !== 'object' || payload === null) return [];
    const models = (payload as Record<string, unknown>)['models'];
    if (!Array.isArray(models)) return [];
    return models
      .map((entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as Record<string, unknown>)['name'] === 'string'
          ? ((entry as Record<string, unknown>)['name'] as string)
          : '',
      )
      .filter((name) => name !== '');
  }
}
