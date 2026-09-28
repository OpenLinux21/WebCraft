import type { en } from './en';

/** Locales shipped with the app. */
export const APP_LOCALES = ['en', 'zh-CN'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

/**
 * Fallback locale when the browser language cannot be matched.
 * The user's own choice (persisted or URL-derived) always takes precedence.
 */
export const DEFAULT_LOCALE: AppLocale = 'en';

/** BCP 47 language tags used for `<html lang>` and Intl formatting. */
export const HTML_LANG: Record<AppLocale, string> = {
  en: 'en',
  'zh-CN': 'zh-CN',
};

export type Dictionary = typeof en;

type PathsOf<T> = {
  [K in keyof T & string]: T[K] extends object ? K | `${K}.${PathsOf<T[K]>}` : K;
}[keyof T & string];

/** Dot-separated key paths into the dictionary, fully typed. */
export type MessageKey = PathsOf<Dictionary>;

export type TranslationParams = Readonly<Record<string, string | number>>;

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (APP_LOCALES as readonly string[]).includes(value);
}
