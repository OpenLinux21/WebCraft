import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  readLocalJson,
  readLocalString,
  removeLocalKey,
  writeLocalJson,
  writeLocalString,
} from './local';

function createFakeStorage(options?: { failWrites?: boolean }) {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (options?.failWrites) throw new Error('quota exceeded');
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

describe('local storage helpers', () => {
  it('round-trips strings', () => {
    vi.stubGlobal('localStorage', createFakeStorage());
    expect(readLocalString('missing')).toBeNull();
    writeLocalString('k', 'v');
    expect(readLocalString('k')).toBe('v');
    removeLocalKey('k');
    expect(readLocalString('k')).toBeNull();
  });

  it('returns null instead of throwing when storage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(readLocalString('k')).toBeNull();
    expect(() => writeLocalString('k', 'v')).not.toThrow();
    expect(() => removeLocalKey('k')).not.toThrow();
  });

  it('silently ignores write failures', () => {
    vi.stubGlobal('localStorage', createFakeStorage({ failWrites: true }));
    expect(() => writeLocalString('k', 'v')).not.toThrow();
    expect(() => writeLocalJson('k', { a: 1 })).not.toThrow();
  });

  it('round-trips JSON with a parse guard', () => {
    vi.stubGlobal('localStorage', createFakeStorage());
    const parse = (v: unknown) =>
      typeof v === 'object' && v !== null && 'n' in v ? (v as { n: number }) : null;
    writeLocalJson('obj', { n: 5 });
    expect(readLocalJson('obj', parse)).toEqual({ n: 5 });
    writeLocalString('bad', '{not json');
    expect(readLocalJson('bad', parse)).toBeNull();
    writeLocalJson('wrong', 'string');
    expect(readLocalJson('wrong', parse)).toBeNull();
  });
});
