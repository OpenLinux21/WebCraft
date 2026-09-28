/**
 * Minimal safe localStorage helpers.
 * Never throw: in private mode or when storage is disabled the preference
 * simply stays session-only instead of breaking the page.
 */

export function readLocalString(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeLocalString(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Storage unavailable (quota, disabled, private mode): ignore.
  }
}

export function removeLocalKey(key: string): void {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // Ignore.
  }
}

/** Reads and parses a JSON value; returns null when absent or malformed. */
export function readLocalJson<T>(key: string, parse: (value: unknown) => T | null): T | null {
  const raw = readLocalString(key);
  if (raw === null) return null;
  try {
    return parse(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeLocalJson(key: string, value: unknown): void {
  try {
    writeLocalString(key, JSON.stringify(value));
  } catch {
    // Unserializable value: ignore.
  }
}
