import type { AppLocale } from '@/lib/i18n/types';

/** Canonical absolute paths for every page, always with a trailing slash. */
export function homePath(locale: AppLocale): string {
  return `/${locale}/`;
}

export function coursesPath(locale: AppLocale): string {
  return `/${locale}/courses/`;
}

export function lessonPath(locale: AppLocale, lessonId: string): string {
  return `/${locale}/courses/${lessonId}/`;
}

export function playgroundPath(locale: AppLocale): string {
  return `/${locale}/playground/`;
}

export function settingsPath(locale: AppLocale): string {
  return `/${locale}/settings/`;
}

function segments(path: string): string[] {
  return path.split('/').filter((part) => part.length > 0);
}

/**
 * Turns a site-absolute `target` into a path relative to `fromPathname`.
 * Relative internal links keep the built site working under any base path
 * without a rebuild.
 */
export function relativeHref(target: string, fromPathname: string): string {
  const targetSegs = segments(target);
  const fromSegs = segments(fromPathname);
  let common = 0;
  while (
    common < targetSegs.length &&
    common < fromSegs.length &&
    targetSegs[common] === fromSegs[common]
  ) {
    common += 1;
  }
  const ups = fromSegs.length - common;
  const downs = targetSegs.slice(common);
  const prefix = ups === 0 ? './' : '../'.repeat(ups);
  return `${prefix}${downs.join('/')}${downs.length > 0 ? '/' : ''}`;
}

/** Rewrites the locale prefix of a localized pathname, e.g. /en/x/ -> /zh-CN/x/. */
export function swapLocaleSegment(pathname: string, from: AppLocale, to: AppLocale): string {
  const rest = pathname.replace(new RegExp(`^/${from}(?=/|$)`), '');
  const tail = rest.length > 0 && rest !== '/' ? rest : '/';
  return `/${to}${tail}`;
}
