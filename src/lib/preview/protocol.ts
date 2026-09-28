/**
 * Message protocol between the sandboxed preview iframe and the app.
 * The iframe runs with an opaque origin (sandbox without allow-same-origin),
 * so `event.origin` is always "null" — authenticity is established by the
 * shared random token plus an `event.source` check in the listener.
 */

export const PREVIEW_MESSAGE_SOURCE = 'webcraft-preview';

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface PreviewReadyMessage {
  source: typeof PREVIEW_MESSAGE_SOURCE;
  token: string;
  kind: 'ready';
}

export interface PreviewConsoleMessage {
  source: typeof PREVIEW_MESSAGE_SOURCE;
  token: string;
  kind: 'console';
  level: ConsoleLevel;
  text: string;
}

export interface PreviewErrorMessage {
  source: typeof PREVIEW_MESSAGE_SOURCE;
  token: string;
  kind: 'error';
  message: string;
  line: number | null;
  column: number | null;
}

export interface PreviewRejectionMessage {
  source: typeof PREVIEW_MESSAGE_SOURCE;
  token: string;
  kind: 'unhandledrejection';
  message: string;
}

export type PreviewInboundMessage =
  PreviewReadyMessage | PreviewConsoleMessage | PreviewErrorMessage | PreviewRejectionMessage;

const CONSOLE_LEVELS: readonly ConsoleLevel[] = ['log', 'info', 'warn', 'error', 'debug'];

export function isConsoleLevel(value: unknown): value is ConsoleLevel {
  return typeof value === 'string' && (CONSOLE_LEVELS as readonly string[]).includes(value);
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Validates an untrusted postMessage payload against the protocol. */
export function parsePreviewMessage(
  data: unknown,
  expectedToken: string,
): PreviewInboundMessage | null {
  if (typeof data !== 'object' || data === null) return null;
  const record = data as Record<string, unknown>;
  if (record['source'] !== PREVIEW_MESSAGE_SOURCE || record['token'] !== expectedToken) return null;

  switch (record['kind']) {
    case 'ready':
      return { source: PREVIEW_MESSAGE_SOURCE, token: expectedToken, kind: 'ready' };
    case 'console': {
      if (!isConsoleLevel(record['level']) || typeof record['text'] !== 'string') return null;
      return {
        source: PREVIEW_MESSAGE_SOURCE,
        token: expectedToken,
        kind: 'console',
        level: record['level'],
        text: record['text'],
      };
    }
    case 'error': {
      if (typeof record['message'] !== 'string') return null;
      return {
        source: PREVIEW_MESSAGE_SOURCE,
        token: expectedToken,
        kind: 'error',
        message: record['message'],
        line: numberOrNull(record['line']),
        column: numberOrNull(record['column']),
      };
    }
    case 'unhandledrejection': {
      if (typeof record['message'] !== 'string') return null;
      return {
        source: PREVIEW_MESSAGE_SOURCE,
        token: expectedToken,
        kind: 'unhandledrejection',
        message: record['message'],
      };
    }
    default:
      return null;
  }
}
