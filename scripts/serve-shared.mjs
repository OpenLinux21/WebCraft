// @ts-check
/**
 * Shared-AI mode server: serves dist/ on 127.0.0.1:2020 (plain http, easy
 * to reverse-proxy) and, when a shared AI configuration exists, publishes
 * it to the site so every visitor can use the tutor without setting up
 * their own provider.
 *
 * Usage:
 *   1. Build first: `npm run build`
 *   2. Optional: create shared-ai.config.json next to package.json:
 *      { "provider": "openai-compatible", "baseUrl": "…", "model": "…",
 *        "apiKey": "…", "temperature": 0.7 }
 *   3. `npm run serve:shared`
 *
 * SECURITY: the shared config (including the API key) is written into
 * dist/shared-ai.json and is therefore readable by every visitor of the
 * site. This mode is meant for trusted environments (home lab, classroom,
 * intranet) — never publish it on the public internet.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const PORT = Number(process.env.SHARED_PORT ?? 2020);
const HOST = process.env.SHARED_HOST ?? '127.0.0.1';

if (!existsSync(distDir) || !statSync(distDir).isDirectory()) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

/** Minimal validation mirroring src/lib/ai/settings.ts parseAIConfig(). */
function parseSharedConfig(raw) {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw;
  const provider = record['provider'];
  if (provider !== 'openai-compatible' && provider !== 'ollama') return null;
  for (const key of ['baseUrl', 'model']) {
    if (typeof record[key] !== 'string' || record[key].trim() === '') return null;
  }
  return {
    enabled: true,
    provider,
    baseUrl: record['baseUrl'],
    model: record['model'],
    apiKey: typeof record['apiKey'] === 'string' ? record['apiKey'] : '',
    customHeaders:
      typeof record['customHeaders'] === 'object' && record['customHeaders'] !== null
        ? record['customHeaders']
        : {},
    temperature: typeof record['temperature'] === 'number' ? record['temperature'] : 0.7,
    maxTokens: typeof record['maxTokens'] === 'number' ? record['maxTokens'] : null,
  };
}

// Publish the shared AI config (if any) into the served output.
const configPath = join(rootDir, 'shared-ai.config.json');
if (existsSync(configPath)) {
  try {
    const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
    const config = parseSharedConfig(raw);
    if (!config) {
      console.error(
        '[shared-ai] shared-ai.config.json is not a valid AI config — publishing the site WITHOUT shared AI.',
      );
    } else {
      writeFileSync(join(distDir, 'shared-ai.json'), JSON.stringify(config));
      console.log(`[shared-ai] Publishing shared tutor: ${config.provider} / ${config.model}`);
      console.log('[shared-ai] WARNING: the API key is visible to every visitor of this site.');
    }
  } catch (error) {
    console.error(
      `[shared-ai] Could not read shared-ai.config.json (${error instanceof Error ? error.message : String(error)}) — serving WITHOUT shared AI.`,
    );
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

const server = createServer((request, response) => {
  const method = request.method ?? 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);

  // Prevent path traversal: resolve inside dist/ only.
  const resolved = normalize(join(distDir, pathname));
  if (!resolved.startsWith(distDir)) {
    response.writeHead(403).end();
    return;
  }

  let filePath = resolved;
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }
  if (!existsSync(filePath)) {
    // SPA-ish fallback to the 404 page (which redirects by locale).
    filePath = join(distDir, '404.html');
  }
  if (!existsSync(filePath)) {
    response.writeHead(404).end('Not found');
    return;
  }

  const type = MIME[extname(filePath)] ?? 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': type });
  if (method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
});

server.listen(PORT, HOST, () => {
  console.log(`WebCraft (shared mode) serving ${distDir}`);
  console.log(`  → http://${HOST}:${PORT}/`);
  if (!existsSync(configPath)) {
    console.log('No shared-ai.config.json found — serving without a shared tutor.');
  }
});
