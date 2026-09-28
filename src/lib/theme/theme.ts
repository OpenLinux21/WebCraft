/**
 * Theme controller: `light` / `dark` / `system`.
 * The resolved mode is applied as `data-theme` on <html>; palettes live in
 * styles/tokens.css and `color-scheme` is switched by CSS on the same attribute.
 */
import { readLocalString, removeLocalKey, writeLocalString } from '@/lib/storage/local';

export type ThemeMode = 'light' | 'dark';
export type ThemeSetting = ThemeMode | 'system';

const THEME_STORAGE_KEY = 'webcraft.theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const VALID_SETTINGS: readonly ThemeSetting[] = ['light', 'dark', 'system'];

export function parseThemeSetting(value: unknown): ThemeSetting | null {
  return typeof value === 'string' && (VALID_SETTINGS as readonly string[]).includes(value)
    ? (value as ThemeSetting)
    : null;
}

export function getThemeSetting(): ThemeSetting {
  return parseThemeSetting(readLocalString(THEME_STORAGE_KEY)) ?? 'system';
}

export function getResolvedTheme(): ThemeMode {
  const setting = getThemeSetting();
  if (setting !== 'system') return setting;
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

function applyThemeDocument(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
}

/**
 * Idempotent bootstrap; call once from the layout script on every page.
 * Keeps following the OS palette while the setting is `system`.
 */
export function initTheme(): void {
  applyThemeDocument(getResolvedTheme());
  window.matchMedia(DARK_QUERY).addEventListener('change', (event) => {
    if (getThemeSetting() === 'system') applyThemeDocument(event.matches ? 'dark' : 'light');
  });
}

export function setThemeSetting(setting: ThemeSetting): void {
  if (parseThemeSetting(setting) === null) return;
  writeLocalString(THEME_STORAGE_KEY, setting);
  applyThemeDocument(getResolvedTheme());
  document.dispatchEvent(
    new CustomEvent('webcraft:theme-change', { detail: { setting, resolved: getResolvedTheme() } }),
  );
}

export function resetThemeSetting(): void {
  removeLocalKey(THEME_STORAGE_KEY);
  setThemeSetting('system');
}
