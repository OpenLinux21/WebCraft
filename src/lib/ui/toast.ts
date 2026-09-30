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
    // Play the exit animation, then drop the element. The timer is a
    // fallback in case `animationend` never fires.
    toast.classList.add('toast--leaving');
    let removed = false;
    const remove = (): void => {
      if (removed) return;
      removed = true;
      toast.remove();
      if (region && region.childElementCount === 0) {
        region.remove();
        region = null;
      }
    };
    toast.addEventListener('animationend', remove, { once: true });
    window.setTimeout(remove, 400);
  }, durationMs);
}
