import { AIRequestError, describeFetchError } from './errors';
import { parseOpenAiDeltas } from './sse';
import { redactSecrets } from './redact';
import type { AIConfig, AIProvider, ChatDelta, ChatRequest } from './types';

/** Normalizes a base URL and appends the chat completions path. */
export function buildChatCompletionUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/chat/completions')) return trimmed;
  return `${trimmed}/chat/completions`;
}

/** Normalizes a base URL for the models listing endpoint. */
export function buildModelsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  return `${trimmed}/models`;
}

/** Merges default headers, auth and user-provided custom headers. */
export function buildRequestHeaders(config: AIConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey.trim() !== '') {
    headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
  }
  return { ...headers, ...config.customHeaders };
}

export function buildChatCompletionBody(
  config: AIConfig,
  messages: ChatRequest['messages'],
): unknown {
  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    stream: true,
  };
  if (Number.isFinite(config.temperature)) body['temperature'] = config.temperature;
  if (config.maxTokens !== null && config.maxTokens > 0) body['max_tokens'] = config.maxTokens;
  return body;
}

async function postChat(config: AIConfig, request: ChatRequest): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(buildChatCompletionUrl(config.baseUrl), {
      method: 'POST',
      headers: buildRequestHeaders(config),
      body: JSON.stringify(buildChatCompletionBody(config, request.messages)),
      signal: request.signal ?? null,
    });
  } catch (error: unknown) {
    const described = describeFetchError(error);
    throw new AIRequestError(described.message, described.hint, { cause: error });
  }
  if (!response.ok || response.body === null) {
    const detail = redactSecrets(await response.text().catch(() => ''), [config.apiKey]).slice(
      0,
      300,
    );
    throw new AIRequestError(
      `The API answered with HTTP ${response.status}${detail ? `: ${detail}` : ''}`,
      response.status === 401 || response.status === 403
        ? 'Check the API key and the model name.'
        : undefined,
    );
  }
  return response;
}

/** OpenAI-compatible chat (works with local and remote compatible servers). */
export class OpenAICompatibleProvider implements AIProvider {
  readonly id = 'openai-compatible' as const;

  async *chat(config: AIConfig, request: ChatRequest): AsyncIterable<ChatDelta> {
    const response = await postChat(config, request);
    for await (const text of parseOpenAiDeltas(response.body!)) {
      yield { kind: 'text', text };
    }
    yield { kind: 'done' };
  }

  async listModels(config: AIConfig): Promise<string[]> {
    let response: Response;
    try {
      response = await fetch(buildModelsUrl(config.baseUrl), {
        headers: buildRequestHeaders(config),
      });
    } catch (error: unknown) {
      const described = describeFetchError(error);
      throw new AIRequestError(described.message, described.hint, { cause: error });
    }
    if (!response.ok) {
      throw new AIRequestError(`The API answered with HTTP ${response.status}`);
    }
    const payload: unknown = await response.json();
    if (typeof payload !== 'object' || payload === null) return [];
    const data = (payload as Record<string, unknown>)['data'];
    if (!Array.isArray(data)) return [];
    return data
      .map((entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as Record<string, unknown>)['id'] === 'string'
          ? ((entry as Record<string, unknown>)['id'] as string)
          : '',
      )
      .filter((id) => id !== '');
  }
}
