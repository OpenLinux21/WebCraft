/** Simple typed settings persisted in localStorage (IndexedDB is for records). */

export const LIVE_PREVIEW_OPTIONS = [0, 500, 1000, 2000] as const;
export type LivePreviewMs = (typeof LIVE_PREVIEW_OPTIONS)[number];

export interface PreviewSettings {
  /** Delay between the last keystroke and a preview rebuild; 0 disables. */
  livePreviewMs: LivePreviewMs;
}

export const DEFAULT_PREVIEW_SETTINGS: PreviewSettings = { livePreviewMs: 1000 };

const PREVIEW_SETTINGS_KEY = 'webcraft.preview';

export function parseLivePreviewMs(value: unknown): value is LivePreviewMs {
  return typeof value === 'number' && (LIVE_PREVIEW_OPTIONS as readonly number[]).includes(value);
}

export function parsePreviewSettings(value: unknown): PreviewSettings | null {
  if (typeof value !== 'object' || value === null) return null;
  const ms = (value as Record<string, unknown>)['livePreviewMs'];
  return parseLivePreviewMs(ms) ? { livePreviewMs: ms } : null;
}

export function loadPreviewSettings(): PreviewSettings {
  try {
    const raw = globalThis.localStorage?.getItem(PREVIEW_SETTINGS_KEY);
    if (raw === null) return DEFAULT_PREVIEW_SETTINGS;
    return parsePreviewSettings(JSON.parse(raw) as unknown) ?? DEFAULT_PREVIEW_SETTINGS;
  } catch {
    return DEFAULT_PREVIEW_SETTINGS;
  }
}

export function savePreviewSettings(settings: PreviewSettings): void {
  try {
    globalThis.localStorage?.setItem(PREVIEW_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable: settings stay session-only.
  }
}
