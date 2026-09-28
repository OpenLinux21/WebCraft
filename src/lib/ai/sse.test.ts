import { describe, expect, it } from 'vitest';
import { streamFromChunks, parseOpenAiDeltas, parseOllamaDeltas } from './sse';

async function collect(deltas: AsyncIterable<string>): Promise<string[]> {
  const chunks: string[] = [];
  for await (const text of deltas) chunks.push(text);
  return chunks;
}

describe('parseOpenAiDeltas', () => {
  it('yields deltas across chunk boundaries and stops at [DONE]', async () => {
    const stream = streamFromChunks([
      'data: {"choices":[{"delta":{"content":"He"}}]}\n\ndata: {"choices":[{"delta":{"content":"llo"}}]}\n',
      '\ndata: [DONE]\n\ndata: {"choices":[{"delta":{"content":"ignored"}}]}\n',
    ]);
    expect(await collect(parseOpenAiDeltas(stream))).toEqual(['He', 'llo']);
  });

  it('skips malformed and non-content lines', async () => {
    const stream = streamFromChunks([
      'data: {broken}\ndata: {"choices":[{"delta":{}}]}\ndata: {"choices":[{"delta":{"content":"ok"}}]}\n\n',
    ]);
    expect(await collect(parseOpenAiDeltas(stream))).toEqual(['ok']);
  });
});

describe('parseOllamaDeltas', () => {
  it('yields message content and stops when done', async () => {
    const stream = streamFromChunks([
      '{"message":{"content":"Hi"},"done":false}\n',
      '{"message":{"content":" there"},"done":false}\n',
      '{"message":{"content":"ignored"},"done":true}\n',
      '{"message":{"content":"also ignored"},"done":false}\n',
    ]);
    expect(await collect(parseOllamaDeltas(stream))).toEqual(['Hi', ' there']);
  });

  it('tolerates blank lines and malformed JSON', async () => {
    const stream = streamFromChunks(['\n{broken}\n{"message":{"content":"ok"},"done":false}\n']);
    expect(await collect(parseOllamaDeltas(stream))).toEqual(['ok']);
  });
});
