/**
 * Generates public/og.png (1200x630) — the social-share card.
 * Re-run after brand changes: `npm i --no-save sharp && node scripts/generate-og.mjs`
 * (sharp is intentionally not a pinned dependency; the image is committed).
 * Uses the same palette values as src/styles/tokens.css (light theme).
 * Renders an SVG via sharp (no browser needed).
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Buffer } from 'node:buffer';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const mono = "'IBM Plex Mono','DejaVu Sans Mono',monospace";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f2f3f5"/>

  <!-- kicker -->
  <text x="80" y="118" font-family="${mono}" font-size="26" fill="#3d6a54">$ webcraft --learn</text>

  <!-- headline -->
  <text font-family="${mono}" font-size="58" font-weight="600" fill="#191b1f" letter-spacing="-1">
    <tspan x="80" y="205">Learn front-end development</tspan>
    <tspan x="80" y="278">by writing <tspan fill="#35548f">real code</tspan><tspan fill="#35548f">_</tspan></tspan>
  </text>

  <!-- terminal window -->
  <g>
    <rect x="80" y="340" width="780" height="180" rx="8" fill="#16181d" stroke="#191b1f" stroke-width="3"/>
    <line x1="80" y1="388" x2="860" y2="388" stroke="#33363d" stroke-width="1"/>
    <circle cx="108" cy="364" r="6" fill="#a53a30"/>
    <circle cx="128" cy="364" r="6" fill="#8a5a00"/>
    <circle cx="148" cy="364" r="6" fill="#2b6a43"/>
    <text x="836" y="370" text-anchor="end" font-family="${mono}" font-size="15" fill="#8e9199">lesson-01 — live preview</text>
    <text font-family="${mono}" font-size="20" fill="#e2e3e7">
      <tspan x="104" y="432"><tspan fill="#8fd4ae">$</tspan> npm run my-first-webpage</tspan>
      <tspan x="104" y="472" fill="#c9ecd6">✓ HTML  ✓ CSS  ✓ JS — preview running in your browser</tspan>
    </text>
  </g>

  <!-- brand row -->
  <text x="80" y="586" font-family="${mono}" font-size="30" font-weight="600" fill="#191b1f">Web<tspan fill="#35548f">Craft</tspan>_</text>
  <text x="330" y="584" font-family="${mono}" font-size="22" fill="#3d6a54">24 lessons · live editor · your own AI tutor</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(join(root, 'public', 'og.png'));
console.log('public/og.png written');
