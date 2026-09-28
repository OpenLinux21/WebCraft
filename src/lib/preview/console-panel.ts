import type { ConsoleLevel } from './protocol';

export type ConsoleEntryLevel = ConsoleLevel | 'exception';

export interface ConsolePanel {
  add(level: ConsoleEntryLevel, text: string): void;
  /** Clears all entries (called when a new preview run starts). */
  beginRun(): void;
}

const DEFAULT_MAX_ENTRIES = 200;

/**
 * Renders the console panel of a workbench. Expected markup inside `root`:
 * a `[data-console-list]` ordered list, a `[data-console-empty]` hint and an
 * optional `[data-console-clear]` button.
 */
export function createConsolePanel(
  root: HTMLElement,
  options: { emptyText: string; maxEntries?: number },
): ConsolePanel {
  const list = root.querySelector<HTMLElement>('[data-console-list]');
  const emptyHint = root.querySelector<HTMLElement>('[data-console-empty]');
  const clearButton = root.querySelector<HTMLElement>('[data-console-clear]');
  const maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;

  const setEmpty = (isEmpty: boolean): void => {
    if (emptyHint) emptyHint.hidden = !isEmpty;
    if (list) list.hidden = isEmpty;
  };
  setEmpty(true);

  const clear = (): void => {
    if (list) list.replaceChildren();
    setEmpty(true);
  };

  clearButton?.addEventListener('click', clear);

  return {
    add(level: ConsoleEntryLevel, text: string): void {
      if (!list) return;
      const entry = document.createElement('li');
      entry.className = 'console-panel__entry';
      entry.dataset.level = level;
      entry.textContent = text;
      list.appendChild(entry);
      while (list.childElementCount > maxEntries) {
        list.firstElementChild?.remove();
      }
      setEmpty(false);
      list.scrollTop = list.scrollHeight;
    },
    beginRun(): void {
      clear();
    },
  };
}
