import { describe, expect, it } from 'vitest';
import { buildPreviewDocument } from './document';
import { isConsoleLevel, parsePreviewMessage, PREVIEW_MESSAGE_SOURCE } from './protocol';

const TOKEN = 'abc123';

describe('parsePreviewMessage', () => {
  it('accepts valid console messages', () => {
    const message = {
      source: PREVIEW_MESSAGE_SOURCE,
      token: TOKEN,
      kind: 'console',
      level: 'warn',
      text: 'careful',
    };
    expect(parsePreviewMessage(message, TOKEN)).toEqual(message);
  });

  it('accepts ready, error and unhandledrejection messages', () => {
    expect(
      parsePreviewMessage({ source: PREVIEW_MESSAGE_SOURCE, token: TOKEN, kind: 'ready' }, TOKEN),
    ).toMatchObject({ kind: 'ready' });
    expect(
      parsePreviewMessage(
        { source: PREVIEW_MESSAGE_SOURCE, token: TOKEN, kind: 'error', message: 'boom', line: 1 },
        TOKEN,
      ),
    ).toMatchObject({ kind: 'error', line: 1, column: null });
    expect(
      parsePreviewMessage(
        { source: PREVIEW_MESSAGE_SOURCE, token: TOKEN, kind: 'unhandledrejection', message: 'x' },
        TOKEN,
      ),
    ).toMatchObject({ kind: 'unhandledrejection' });
  });

  it('rejects wrong tokens, sources and malformed payloads', () => {
    const wrongToken = { source: PREVIEW_MESSAGE_SOURCE, token: 'nope', kind: 'ready' };
    expect(parsePreviewMessage(wrongToken, TOKEN)).toBeNull();
    const wrongSource = { source: 'other', token: TOKEN, kind: 'ready' };
    expect(parsePreviewMessage(wrongSource, TOKEN)).toBeNull();
    expect(parsePreviewMessage('string', TOKEN)).toBeNull();
    expect(parsePreviewMessage(null, TOKEN)).toBeNull();
    expect(
      parsePreviewMessage(
        {
          source: PREVIEW_MESSAGE_SOURCE,
          token: TOKEN,
          kind: 'console',
          level: 'verbose',
          text: '',
        },
        TOKEN,
      ),
    ).toBeNull();
    expect(
      parsePreviewMessage(
        { source: PREVIEW_MESSAGE_SOURCE, token: TOKEN, kind: 'error', message: 42 },
        TOKEN,
      ),
    ).toBeNull();
    expect(
      parsePreviewMessage({ source: PREVIEW_MESSAGE_SOURCE, token: TOKEN, kind: 'other' }, TOKEN),
    ).toBeNull();
  });
});

describe('isConsoleLevel', () => {
  it('checks levels', () => {
    expect(isConsoleLevel('log')).toBe(true);
    expect(isConsoleLevel('verbose')).toBe(false);
    expect(isConsoleLevel(1)).toBe(false);
  });
});

describe('buildPreviewDocument', () => {
  it('embeds capture script, user code and the shared token', () => {
    const doc = buildPreviewDocument(
      { html: '<p>hi</p>', css: 'p{}', js: 'console.log(1)' },
      TOKEN,
    );
    expect(doc).toContain(TOKEN);
    expect(doc).toContain('<p>hi</p>');
    expect(doc).toContain('<style>\np{}\n</style>');
    expect(doc).toContain('console.log(1)');
    expect(doc.indexOf('webcraft-preview')).toBeLessThan(doc.indexOf('<p>hi</p>'));
    expect(doc).toMatch(/^<!DOCTYPE html>/);
  });

  it('escapes closing tags inside user code', () => {
    const doc = buildPreviewDocument(
      { html: '', css: 'a::after{content:"</style"}', js: 'const s = "</script>";' },
      TOKEN,
    );
    expect(doc).toContain('<\\/script');
    expect(doc).toContain('<\\/style');
    expect(doc).not.toContain('"</script>"');
  });
});
