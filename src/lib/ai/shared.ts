/**
 * Shared-AI configuration: in `serve:shared` mode the site ships a
 * `shared-ai.json` (published by scripts/serve-shared.mjs) that lets every
 * visitor use the tutor without configuring their own provider.
 */

const SHARED_CONFIG_URL = 'shared-ai.json';

let cache: Promise<unknown> | null = null;

function parseSharedConfig(raw: unknown): unknown {
  // Validation mirror of the server-side check; the exact AIConfig typing is
  // restored by callers via loadAIConfig-compatible consumers.
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;
  if (record['enabled'] !== true) return null;
  return record;
}

/**
 * Fetches the shared config once per page load. Resolves null when absent
 * (normal static deploys) or malformed.
 */
export function fetchSharedConfig(): Promise<unknown> {
  cache ??= (async () => {
    try {
      const response = await fetch(SHARED_CONFIG_URL, { cache: 'no-store' });
      if (!response.ok) return null;
      return parseSharedConfig(await response.json());
    } catch {
      return null;
    }
  })();
  return cache;
}

/**
 * Boots shared mode: fetches shared-ai.json and, when present, installs it
 * as the effective AI configuration before any UI reads it. Called from
 * BaseLayout on every page; safe to race with panel init because the AI
 * panels re-check config at request time.
 */
export async function bootSharedAI(): Promise<void> {
  const { parseAIConfig, setSharedAIConfig } = await import('./settings');
  const raw = await fetchSharedConfig();
  if (raw === null) {
    setSharedAIConfig(null);
    return;
  }
  setSharedAIConfig(parseAIConfig(raw));
}
