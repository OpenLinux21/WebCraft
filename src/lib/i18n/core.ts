import { en } from './en';
import { zhCN } from './zh-CN';
import { DEFAULT_LOCALE } from './types';
import type { AppLocale, Dictionary, MessageKey, TranslationParams } from './types';

export { APP_LOCALES, DEFAULT_LOCALE, HTML_LANG, isAppLocale } from './types';
export type { AppLocale, Dictionary, MessageKey, TranslationParams } from './types';

const DICTIONARIES: Record<AppLocale, Dictionary> = { en, 'zh-CN': zhCN };

export interface Translator {
  readonly locale: AppLocale;
  t(key: MessageKey, params?: TranslationParams): string;
}

function lookup(dict: Dictionary, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(PLACEHOLDER_PATTERN, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export function getDictionary(locale: AppLocale): Dictionary {
  return DICTIONARIES[locale];
}

export function createTranslator(locale: AppLocale): Translator {
  const dict = DICTIONARIES[locale];
  return {
    locale,
    t(key, params) {
      // Dictionary parity is enforced by tests, so the en fallback only guards
      // against future locales with a temporarily incomplete dictionary.
      const template = lookup(dict, key) ?? lookup(DICTIONARIES.en, key) ?? key;
      return interpolate(template, params);
    },
  };
}

/** Picks a supported locale from browser language tags (most preferred first). */
export function resolveLocaleFromBrowser(candidates: readonly string[]): AppLocale {
  for (const tag of candidates) {
    const lower = tag.toLowerCase();
    if (lower.startsWith('zh')) return 'zh-CN';
    if (lower.startsWith('en')) return 'en';
  }
  return DEFAULT_LOCALE;
}

/** Derives the app locale from a BCP 47 tag such as a document `lang`. */
export function localeFromLanguageTag(tag: string): AppLocale {
  return tag.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

export function formatNumber(locale: AppLocale, value: number): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDateTime(locale: AppLocale, date: Date): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
