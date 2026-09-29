/**
 * Inlined into <head> before stylesheets render so the resolved palette is
 * applied on first paint (no light/dark flash). It intentionally mirrors the
 * resolve logic of theme.ts with no dependency on bundled code — keep the two
 * in sync if the storage key or resolution rules ever change.
 */
export const NO_FLASH_SCRIPT = `(function(){try{document.documentElement.classList.add('js');var m=localStorage.getItem('webcraft.theme');var s=(m==='light'||m==='dark'||m==='system')?m:'system';var d=s==='dark'||(s==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){document.documentElement.classList.add('js');}})();`;
