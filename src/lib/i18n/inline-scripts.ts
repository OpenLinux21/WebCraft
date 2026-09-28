import { DEFAULT_LOCALE } from './types';

/**
 * localStorage key for the last visited locale, written by BaseLayout and read
 * by the inline redirect scripts below.
 */
export const LOCALE_STORAGE_KEY = 'webcraft.locale';

/**
 * Inlined (unbundled) locale-detection script for the root and 404 pages.
 * The persisted locale wins; otherwise browser languages are matched.
 * Relative redirect targets keep this working under any base path.
 */
export function buildLocaleDetectScript(): string {
  const fallback = DEFAULT_LOCALE;
  return (
    `(function(){` +
    `try{` +
    `var s=localStorage.getItem('${LOCALE_STORAGE_KEY}');` +
    `if(s==='zh-CN'||s==='en'){location.replace('./'+s+'/');return;}` +
    `var ls=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||'en'];` +
    `for(var i=0;i<ls.length;i++){` +
    `var l=(ls[i]||'').toLowerCase();` +
    `if(l.indexOf('zh')===0){location.replace('./zh-CN/');return;}` +
    `if(l.indexOf('en')===0){location.replace('./en/');return;}` +
    `}` +
    `}catch(e){}` +
    `location.replace('./${fallback}/');` +
    `})();`
  );
}
