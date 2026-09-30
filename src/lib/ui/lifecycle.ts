/**
 * Shared page lifecycle for the ClientRouter (astro:transitions).
 *
 * Bundled module scripts execute only once per browser session, while
 * client-side navigation replaces the DOM underneath them. Registering page
 * initialization through `onPageLoad` re-runs it after every navigation
 * (including the initial load), and cleanups registered here are flushed on
 * `astro:before-swap` so observers, rAF loops, event listeners and in-flight
 * animations never leak past the page they belong to.
 */
type Cleanup = () => void;

const cleanups = new Set<Cleanup>();

document.addEventListener('astro:before-swap', () => {
  for (const cleanup of cleanups) cleanup();
  cleanups.clear();
});

/**
 * Runs `init` after every page load (initial load included). If `init`
 * returns a function it is treated as a cleanup and called before the next
 * swap away from the page.
 */
export function onPageLoad(init: () => void | Cleanup): void {
  document.addEventListener('astro:page-load', () => {
    const cleanup = init();
    if (typeof cleanup === 'function') cleanups.add(cleanup);
  });
}

/** Registers a cleanup to run on the next `astro:before-swap`. */
export function registerCleanup(cleanup: Cleanup): void {
  cleanups.add(cleanup);
}
