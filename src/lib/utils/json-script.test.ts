import { describe, expect, it } from 'vitest';
import { serializeJsonScript } from './json-script';

describe('serializeJsonScript', () => {
  it('produces valid JSON that survives a script context', () => {
    const value = { html: '</script><img src=x onerror=alert(1)>' };
    const serialized = serializeJsonScript(value);
    expect(serialized).not.toContain('</script>');
    expect(JSON.parse(serialized)).toEqual(value);
  });

  it('escapes every < including in nested structures', () => {
    const serialized = serializeJsonScript({ a: ['<b>', { c: '<d>' }] });
    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual({ a: ['<b>', { c: '<d>' }] });
  });
});
