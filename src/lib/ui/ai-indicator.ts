/**
 * Terminal-flavored DOM builders shared by the AI tutor surfaces (lesson and
 * playground panels plus the global overlay).
 */

/** Waiting state: the localized label trailed by three blinking blocks. */
export function buildThinkingIndicator(label: string): HTMLElement {
  const wrap = document.createElement('span');
  wrap.className = 'ai-panel__thinking';
  const text = document.createElement('span');
  text.textContent = label;
  const blocks = document.createElement('span');
  blocks.className = 'ai-thinking-blocks';
  blocks.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i += 1) blocks.appendChild(document.createElement('i'));
  wrap.append(text, blocks);
  return wrap;
}

/** Blinking block cursor appended to a bubble while a reply streams in. */
export function buildStreamCursor(): HTMLElement {
  const cursor = document.createElement('span');
  cursor.className = 'ai-stream-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.textContent = '▊';
  return cursor;
}
