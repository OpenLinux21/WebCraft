/**
 * Pure stream parsers for chat completions. Unit tested with fake streams;
 * independent from fetch and providers.
 */

interface OpenAiChunk {
  choices?: Array<{ delta?: { content?: unknown } }>;
}

function extractOpenAiDeltaText(data: string): string {
  try {
    const chunk = JSON.parse(data) as OpenAiChunk;
    const content = chunk.choices?.[0]?.delta?.content;
    return typeof content === 'string' ? content : '';
  } catch {
    return '';
  }
}

interface OllamaChunk {
  message?: { content?: unknown };
  done?: unknown;
}

function extractOllamaDeltaText(data: string): { text: string; done: boolean } {
  try {
    const chunk = JSON.parse(data) as OllamaChunk;
    const content = chunk.message?.content;
    return {
      text: typeof content === 'string' ? content : '',
      done: chunk.done === true,
    };
  } catch {
    return { text: '', done: false };
  }
}

/** Yields complete `data:` payload lines of an SSE stream. */
export async function* sseDataLines(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<string, void, void> {
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });
    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).replace(/\r$/, '');
      buffer = buffer.slice(newlineIndex + 1);
      if (line.startsWith('data:')) {
        yield line.slice(5).trim();
      }
      newlineIndex = buffer.indexOf('\n');
    }
  }
}

/** Yields text deltas from an OpenAI-compatible SSE stream. */
export async function* parseOpenAiDeltas(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<string, void, void> {
  for await (const data of sseDataLines(stream)) {
    if (data === '[DONE]') return;
    if (data === '') continue;
    const text = extractOpenAiDeltaText(data);
    if (text !== '') yield text;
  }
}

/** Yields text deltas from an Ollama NDJSON stream. */
export async function* parseOllamaDeltas(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<string, void, void> {
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });
    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line !== '') {
        const { text, done } = extractOllamaDeltaText(line);
        if (done) return;
        if (text !== '') yield text;
      }
      newlineIndex = buffer.indexOf('\n');
    }
  }
}

/** Test helper: builds a ReadableStream from string chunks. */
export function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}
