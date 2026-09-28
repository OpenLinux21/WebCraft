import { describe, expect, it } from 'vitest';
import { parseThemeSetting } from './theme';

describe('parseThemeSetting', () => {
  it('accepts valid settings', () => {
    expect(parseThemeSetting('light')).toBe('light');
    expect(parseThemeSetting('dark')).toBe('dark');
    expect(parseThemeSetting('system')).toBe('system');
  });

  it('rejects junk values', () => {
    expect(parseThemeSetting('blue')).toBeNull();
    expect(parseThemeSetting('')).toBeNull();
    expect(parseThemeSetting(42)).toBeNull();
    expect(parseThemeSetting(null)).toBeNull();
    expect(parseThemeSetting(undefined)).toBeNull();
  });
});
