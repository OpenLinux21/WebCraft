// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

// Deployment base path, e.g. BASE_PATH=/webcraft/ for GitHub Pages project sites.
// The default build works when unzipped at the root of any static host.
// The value is normalized: missing or misplaced slashes and empty strings
// are repaired so a malformed BASE_PATH cannot produce broken asset URLs.
const rawBasePath = process.env.BASE_PATH?.trim();
const basePath =
  rawBasePath && rawBasePath !== '/' ? `/${rawBasePath.replace(/^\/+|\/+$/g, '')}/` : '/';

export default defineConfig({
  output: 'static',
  base: basePath,
  integrations: [mdx()],
  build: {
    // Bundled asset URLs must live under the same base for subdirectory deploys.
    assetsPrefix: basePath === '/' ? undefined : basePath,
  },
});
