let region: HTMLElement | null = null;

function ensureRegion(): HTMLElement {
  if (region) return region;
  region = document.createElement('div');
  region.className = 'toast-region';
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  document.body.appendChild(region);
  return region;
}

/** Shows a transient, screen-reader-announced message at the bottom. */
export function showToast(message: string, durationMs = 2500): void {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  ensureRegion().appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
    if (region && region.childElementCount === 0) {
      region.remove();
      region = null;
    }
  }, durationMs);
}
