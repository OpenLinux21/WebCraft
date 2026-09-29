// @ts-check
/**
 * Packages dist/ into a deployable zip: `release/webcraft-v<version>.zip`.
 * The archive contains the files at its root, so unzipping it into any
 * static host's web root is enough. Run via `npm run package`.
 */
import { createRequire } from 'node:module';
import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// archiver ships as CommonJS; createRequire is the reliable ESM interop path.
const require = createRequire(import.meta.url);
const archiver = require('archiver');

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const releaseDir = join(rootDir, 'release');

if (!existsSync(distDir)) {
  console.error('dist/ not found — run `npm run build` first (or `npm run package`).');
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
const zipName = `webcraft-v${packageJson['version']}.zip`;
const zipPath = join(releaseDir, zipName);

await mkdir(releaseDir, { recursive: true });

const output = createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });
archive.pipe(output);
// Files land at the archive root: unzip directly into the web root.
archive.directory(distDir, false);

const completed = new Promise((resolve, reject) => {
  output.on('close', resolve);
  output.on('error', reject);
  archive.on('error', reject);
});

try {
  await archive.finalize();
  await completed;
} catch (error) {
  archive.abort();
  // Never leave a truncated zip behind.
  await rm(zipPath, { force: true }).catch(() => undefined);
  console.error(
    `Failed to create ${zipName}: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}

const { size } = await stat(zipPath);
const fileCount = await countFiles(distDir);
console.log(`Created ${zipName}: ${fileCount} files, ${(size / 1024 / 1024).toFixed(1)} MB.`);

async function countFiles(dir) {
  let count = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      count += await countFiles(join(dir, entry.name));
    } else {
      count += 1;
    }
  }
  return count;
}
