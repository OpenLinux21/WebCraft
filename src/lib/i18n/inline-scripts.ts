import { DEFAULT_LOCALE } from './types';

/**
 * localStorage key for the last visited locale, written by BaseLayout and read
 * by the inline redirect scripts below.
 */
export const LOCALE_STORAGE_KEY = 'webcraft.locale';

/**
 * Inlined (unbundled) locale-detection script for the root and 404 pages.
 * The persisted locale wins; otherwise browser languages are matched.
 *
 * `base` must come from import.meta.env.BASE_URL so the targets are
 * absolute: the 404 page is served at arbitrary nested paths, where
 * relative targets like './en/' would redirect deeper and deeper
 * (/blog/post/en/en/… — an unbounded loop).
 *
 * `delayMs` defers the redirect so a styled 404 stays visible long enough
 * to be read; the root page keeps the default (0, instant).
 */
export function buildLocaleDetectScript(base: string = '/', delayMs = 0): string {
  const root = base.endsWith('/') ? base : `${base}/`;
  const fallback = DEFAULT_LOCALE;
  const go =
    `function(){` +
    `try{` +
    `var s=localStorage.getItem('${LOCALE_STORAGE_KEY}');` +
    `if(s==='zh-CN'||s==='en'){location.replace('${root}'+s+'/');return;}` +
    `var ls=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||'en'];` +
    `for(var i=0;i<ls.length;i++){` +
    `var l=(ls[i]||'').toLowerCase();` +
    `if(l.indexOf('zh')===0){location.replace('${root}zh-CN/');return;}` +
    `if(l.indexOf('en')===0){location.replace('${root}en/');return;}` +
    `}` +
    `}catch(e){}` +
    `location.replace('${root}${fallback}/');` +
    `}`;
  return (
    `(function(){var go=${go};` +
    (delayMs > 0 ? `setTimeout(go, ${delayMs});` : `go();`) +
    `})();`
  );
}
