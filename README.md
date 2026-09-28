# WebCraft

**A privacy-first, fully static learning platform for web design and front-end programming.**

[简体中文说明 →](./README.zh-CN.md)

Unzip and deploy — no server, no accounts, no telemetry. Your progress, code and settings live only in your browser; AI requests go straight from your browser to the service **you** configure.

## Why WebCraft

- **Unzip-and-deploy.** The production build is plain HTML/CSS/JS. Drop `dist/` (or the packaged zip) onto GitHub Pages, Cloudflare Pages, Netlify, Vercel static, Nginx, Apache — any static host — and it works. Internal links are relative, so a `BASE_PATH=/sub-path/ npm run build` works in subdirectories too.
- **Privacy by design.** Zero telemetry, zero analytics, zero project-side accounts. Learning progress, editor drafts, playground records, settings and AI configuration are stored in your browser (IndexedDB + localStorage) and never sent anywhere unless *you* explicitly export or transmit them.
- **Your AI, your keys.** The AI tutor talks directly from your browser to Ollama or any OpenAI-compatible API you configure. WebCraft ships with no built-in API keys and no relay server — requests never pass through project infrastructure.
- **Real practice, safely sandboxed.** Every lesson has an HTML/CSS/JS workbench (Monaco) with a live preview running in a sandboxed iframe (`allow-scripts` only — no `allow-same-origin`, no `eval` on the host page), console capture and runtime error reporting.
- **Bilingual & themeable.** Complete English and 简体中文 interfaces (route-prefixed, SEO-friendly) with light / dark / system themes built on Material Design 3 tokens.

## The curriculum — 24 lessons

From your first HTML tag to a complete interactive app, difficulty ramping from beginner to intermediate:

| Module | Lessons | Topics |
| --- | --- | --- |
| HTML basics | 1–3 | document structure & tags · text & semantics · links, images, lists & media |
| CSS basics | 4–7 | selectors, cascade & inheritance · box model · colors, fonts & typography · positioning, stacking & overflow |
| Layout & responsive | 8–11 | Flexbox · Grid · media queries & responsive design · transitions & animations |
| JavaScript | 12–16 | variables, types & operators · functions, scope & closures · conditionals & loops · arrays & objects · async basics (promises & timers, offline only) |
| DOM & interaction | 17–20 | querying & manipulating the DOM · events · forms & client-side validation · web storage |
| Advanced topics | 21–24 | accessibility (semantics, keyboard, ARIA) · Material Design 3 (tokens & dynamic color) · web components · capstone: an interactive task board |

Every lesson includes learning objectives, explained concepts with runnable examples, an exercise with starter code, three progressive hints, a reference solution you can load into the editor, and completion tracking.

## The AI tutor

In the Playground, the tutor can generate challenges, review your code, give staged hints, debug with you and explain concepts — five modes (**Hint / Explain / Review / Debug / New challenge**) plus free chat. System prompts are localized and instruct the model **not** to hand over complete solutions.

**Configure it once in Settings → AI assistant:**

1. **Provider** — *Ollama (local)* or *OpenAI-compatible API*.
2. **Base URL** — e.g. `http://localhost:11434` (Ollama) or `https://api.openai.com/v1`.
3. **Model name** — e.g. `qwen2.5-coder:7b` or `gpt-4o-mini`.
4. **API key** — stored only in this browser, sent only to the service you configure. Optional custom headers, temperature and max tokens.
5. **Test connection** — verifies reachability and lists available models.

Requests are streamed (SSE / NDJSON), abortable, and made **directly from your browser** to your provider. The API key is excluded from backups unless you explicitly opt in.

> **CORS & mixed content.** Browsers enforce cross-origin rules. For Ollama, start it with `OLLAMA_ORIGINS` set to this site's origin (or `*`). If this page is served over HTTPS, browsers block requests to `http://` endpoints (mixed content) — use an `https://` endpoint or run Ollama behind one.

## Local data & backup

- **Storage:** IndexedDB for progress, drafts and playground records (with an in-memory fallback); localStorage for simple settings and the AI configuration. A `StorageAdapter` interface keeps the layer swappable (e.g. a user-provided cloud adapter), with no cloud behavior by default.
- **Backup:** Settings → *Backup & restore* exports everything as a versioned, human-readable JSON file (`webcraft-backup-<timestamp>.json`) and imports it back with schema validation, a migration registry and per-entry guards. Corrupted entries are dropped; newer schema versions are rejected with a clear message. **The API key is excluded unless you explicitly tick "include sensitive settings".**
- **Delete everything:** Settings → *Data* wipes all local data after confirmation.

## Getting started

Requirements: **Node.js ≥ 20** and npm.

```bash
npm install        # install dependencies
npm run dev        # dev server with HMR
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run package    # build + zip dist/ → release/webcraft-v<version>.zip
```

Quality gates (all wired into `npm run verify`):

```bash
npm run lint        # ESLint (flat config, TS + Astro plugins)
npm run typecheck   # astro check (TypeScript strictest)
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright smoke suite against the production build
npm run format      # Prettier
```

Unit tests cover the i18n dictionaries (key & placeholder parity), storage guards and repositories, backup export/import/migrations, AI request builders & stream parsers, the preview message protocol and document builder, the progress state machine and content integrity. The Playwright suite covers the core journeys: language redirect, theming, the workbench, console capture, lesson progress persistence, progressive hints and the settings language switch.

## Deployment

The default build assumes the site root. `npm run package` produces a zip whose files sit at the archive root — unzip it into any web root and you are done.

**Sub-directory deployments** (e.g. GitHub Pages project sites) rebuild with a base path:

```bash
BASE_PATH=/my-repo/ npm run build && npm run package
```

Internal links are relative, so pages work at any depth; the base path relocates the hashed build assets. Verified against a plain static server at both `/` and a sub-path.

## Project structure

```
src/
  content.config.ts              # content collections + zod schema
  content/
    courses/{en,zh-CN}/*.mdx     # 24 bilingual lessons
    exercises/<lessonId>/        # starter + solution code per lesson
  lib/
    i18n/                        # typed dictionaries, translator, locale detection
    theme/                       # MD3 tokens, light/dark/system controller
    storage/                     # adapters (IndexedDB/memory), repos, settings
    backup/                      # versioned export/import + migrations
    editor/                      # Monaco integration (lazy-loaded)
    preview/                     # sandbox document builder, message protocol, console
    ai/                          # provider abstraction (OpenAI-compatible + Ollama), prompts
    courses/                     # schema, progress state machine, content helpers
    playground/                  # challenge task types
    utils/                       # debounce, tokens, misc helpers
  components/                    # Astro components (workbench, panels, sections)
  layouts/                       # BaseLayout (SEO meta, no-flash theme script)
  pages/                         # root redirect, 404, [locale]/{home,courses,lesson,playground,settings}
scripts/package.mjs              # zip packaging
e2e/                             # Playwright smoke suite
```

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` | Astro dev server |
| `build` | Production build → `dist/` |
| `preview` | Serve the production build |
| `package` | Build + zip → `release/` |
| `test` / `test:watch` | Vitest unit tests |
| `test:e2e` | Playwright smoke suite |
| `lint` / `lint:fix` | ESLint |
| `format` / `format:check` | Prettier |
| `typecheck` | `astro check` |
| `verify` | lint + typecheck + test + build |

## Security notes

- User code runs in a sandboxed iframe (`allow-scripts`, **no** `allow-same-origin`) via `srcdoc`; the host page never `eval`s user code. Inbound messages are authenticated with a per-run random token plus an `event.source` check.
- The AI key is stored in localStorage, entered in a password field, redacted from logs and error messages, and excluded from backups unless you explicitly opt in.
- Zero third-party requests at runtime: fonts, the editor and all assets are bundled locally.
- All data stays on-device. The only network calls ever made are the AI requests you initiate to your own provider.

## Contributing

Small, focused commits with [Conventional Commits](https://www.conventionalcommits.org/) messages (`feat:`, `fix:`, `docs:`, `test:`, `chore:`) — one commit, one concern. Run `npm run verify` before committing. UI strings, lesson metadata and content must exist in **both** locales (the i18n parity and content integrity tests enforce this).

## License

[MIT](./LICENSE)
