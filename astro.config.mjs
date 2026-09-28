// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';

// Deployment base path, e.g. BASE_PATH=/webcraft/ for GitHub Pages project sites.
// The default build works when unzipped at the root of any static host.
const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig({
  output: 'static',
  base: basePath,
  integrations: [mdx()],
  build: {
    // Bundled asset URLs must live under the same base for subdirectory deploys.
    assetsPrefix: basePath === '/' ? undefined : basePath,
  },
});
