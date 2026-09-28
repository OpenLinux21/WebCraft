import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadPreviewSettings, parsePreviewSettings, savePreviewSettings } from './settings';

function createFakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => {
      map.clear();
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('preview settings', () => {
  it('defaults when nothing is stored', () => {
    vi.stubGlobal('localStorage', createFakeStorage());
    expect(loadPreviewSettings()).toEqual({ livePreviewMs: 1000 });
  });

  it('rejects invalid stored values', () => {
    expect(parsePreviewSettings({ livePreviewMs: 123 })).toBeNull();
    expect(parsePreviewSettings({ livePreviewMs: '500' })).toBeNull();
    expect(parsePreviewSettings(null)).toBeNull();
    expect(parsePreviewSettings({ livePreviewMs: 0 })).toEqual({ livePreviewMs: 0 });
  });

  it('round-trips through localStorage', () => {
    vi.stubGlobal('localStorage', createFakeStorage());
    savePreviewSettings({ livePreviewMs: 500 });
    expect(loadPreviewSettings()).toEqual({ livePreviewMs: 500 });
    savePreviewSettings({ livePreviewMs: 0 });
    expect(loadPreviewSettings()).toEqual({ livePreviewMs: 0 });
  });

  it('falls back to defaults without localStorage', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(loadPreviewSettings()).toEqual({ livePreviewMs: 1000 });
    expect(() => savePreviewSettings({ livePreviewMs: 500 })).not.toThrow();
  });
});
