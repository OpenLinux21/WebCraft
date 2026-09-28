import { describe, expect, it } from 'vitest';
import { createTranslator, resolveLocaleFromBrowser } from './core';
import { en } from './en';
import { zhCN } from './zh-CN';

type Leaf = { path: string; value: string; placeholders: string[] };

function collectLeaves(node: unknown, prefix: string, out: Leaf[]): void {
  if (typeof node === 'string') {
    const placeholders = [...node.matchAll(/\{(\w+)\}/g)].map((m) => m[1] ?? '').sort();
    out.push({ path: prefix, value: node, placeholders });
    return;
  }
  if (typeof node === 'object' && node !== null) {
    for (const [key, child] of Object.entries(node)) {
      collectLeaves(child, prefix ? `${prefix}.${key}` : key, out);
    }
  }
}

function leavesOf(dict: unknown): Map<string, Leaf> {
  const leaves: Leaf[] = [];
  collectLeaves(dict, '', leaves);
  return new Map(leaves.map((leaf) => [leaf.path, leaf]));
}

describe('dictionary parity', () => {
  const enLeaves = leavesOf(en);
  const zhLeaves = leavesOf(zhCN);

  it('has exactly the same message keys in every locale', () => {
    expect([...zhLeaves.keys()].sort()).toEqual([...enLeaves.keys()].sort());
  });

  it('has matching placeholders for every message', () => {
    for (const [path, enLeaf] of enLeaves) {
      const zhLeaf = zhLeaves.get(path);
      expect(zhLeaf, `missing zh-CN translation for ${path}`).toBeDefined();
      expect(zhLeaf?.placeholders, `placeholder mismatch for ${path}`).toEqual(enLeaf.placeholders);
    }
  });

  it('has no empty translations', () => {
    for (const leaf of enLeaves.values()) {
      expect(leaf.value.trim(), `empty en value at ${leaf.path}`).not.toBe('');
    }
    for (const leaf of zhLeaves.values()) {
      expect(leaf.value.trim(), `empty zh-CN value at ${leaf.path}`).not.toBe('');
    }
  });
});

describe('createTranslator', () => {
  it('resolves nested keys and interpolates params', () => {
    const t = createTranslator('en');
    expect(t.t('courses.moduleNames.css')).toBe('CSS basics');
    expect(t.t('common.minutesShort', { minutes: 12 })).toBe('12 min');
  });

  it('translates in zh-CN', () => {
    const t = createTranslator('zh-CN');
    expect(t.t('common.appName')).toBe('WebCraft');
    expect(t.t('nav.courses')).toBe('课程');
  });

  it('keeps unknown params untouched', () => {
    const t = createTranslator('en');
    expect(t.t('common.minutesShort')).toBe('{minutes} min');
  });
});

describe('resolveLocaleFromBrowser', () => {
  it('maps Chinese variants to zh-CN', () => {
    expect(resolveLocaleFromBrowser(['zh-TW', 'en-US'])).toBe('zh-CN');
    expect(resolveLocaleFromBrowser(['ZH'])).toBe('zh-CN');
  });

  it('maps English variants to en', () => {
    expect(resolveLocaleFromBrowser(['en-GB', 'fr'])).toBe('en');
  });

  it('falls back to the default locale for unsupported languages', () => {
    expect(resolveLocaleFromBrowser(['fr', 'de'])).toBe('en');
    expect(resolveLocaleFromBrowser([])).toBe('en');
  });
});
