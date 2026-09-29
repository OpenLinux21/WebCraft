import { getAIProvider } from './provider';
import { describeFetchError } from './errors';
import { AIRequestError } from './errors';
import type { AIConfig, ChatMessage } from './types';

export interface AssistantTurnOptions {
  config: AIConfig;
  messages: ChatMessage[];
  signal?: AbortSignal;
  /** Called after each delta with the full reply text so far. */
  onDelta?: (fullText: string) => void;
}

export interface AssistantTurnResult {
  replyText: string;
  aborted: boolean;
}

/**
 * Streams one assistant turn — the shared runtime for every AI surface
 * (playground panel, global overlay). Failures always surface as
 * AIRequestError (with hints); aborts resolve with `aborted: true` and
 * whatever text arrived before the abort.
 */
export async function runAssistantTurn(
  options: AssistantTurnOptions,
): Promise<AssistantTurnResult> {
  let replyText = '';
  try {
    const provider = getAIProvider(options.config.provider);
    for await (const delta of provider.chat(options.config, {
      messages: options.messages,
      ...(options.signal ? { signal: options.signal } : {}),
    })) {
      if (delta.kind === 'done') break;
      replyText += delta.text;
      options.onDelta?.(replyText);
    }
    return { replyText, aborted: false };
  } catch (error: unknown) {
    if (options.signal?.aborted) return { replyText, aborted: true };
    const described = describeFetchError(error);
    throw new AIRequestError(described.message, described.hint, { cause: error });
  }
}
