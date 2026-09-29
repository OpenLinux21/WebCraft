/**
 * Minimal, injection-safe Markdown renderer for AI tutor replies.
 *
 * Security model: the input is NEVER parsed as HTML. Every character goes
 * into text nodes (`createElement` + `textContent` only — no innerHTML, no
 * `insertAdjacentHTML`), so `<script>` and friends always render as literal
 * text. Supported syntax is a deliberate subset:
 *
 *   ``` fenced code blocks ```   `inline code`   **bold**   *italic*
 *   [text](https://… only)       - / * unordered lists   1. ordered lists
 *   > blockquotes                ### headings (rendered as h3/h4)
 *
 * Lines that do not match a block construct become paragraphs; existing
 * newlines inside a paragraph are preserved by the transcript's pre-wrap.
 */

const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const UNORDERED_PATTERN = /^\s*[-*]\s+(.*)$/;
const ORDERED_PATTERN = /^\s*\d+[.)]\s+(.*)$/;

interface CodeFence {
  readonly kind: 'code';
  readonly lang: string;
  readonly lines: string[];
}

interface OtherBlock {
  readonly kind: 'heading' | 'ul' | 'ol' | 'blockquote' | 'paragraph';
  readonly lines: string[];
}

type Block = CodeFence | OtherBlock;

/** Single-pass scanner: pairs fences and groups the remaining block types. */
function scanBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.split('\n');
  let index = 0;
  const paragraph: string[] = [];
  let list: { kind: 'ul' | 'ol'; lines: string[] } | null = null;

  const flushParagraph = (): void => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', lines: paragraph.splice(0) });
    }
  };
  const flushList = (): void => {
    if (list) {
      blocks.push({ kind: list.kind, lines: list.lines.splice(0) });
      list = null;
    }
  };
  const push = (block: Block): void => {
    flushParagraph();
    flushList();
    blocks.push(block);
  };

  while (index < lines.length) {
    const line = lines[index] ?? '';
    const fence = /^```(\w*)\s*$/.exec(line.trim());

    if (fence) {
      const lang = fence[1] ?? '';
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test((lines[index] ?? '').trim())) {
        codeLines.push(lines[index] ?? '');
        index += 1;
      }
      index += 1; // consume the closing fence (or EOF)
      push({ kind: 'code', lang, lines: codeLines });
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      flushList();
      index += 1;
      continue;
    }

    const heading = HEADING_PATTERN.exec(line);
    if (heading) {
      push({ kind: 'heading', lines: [heading[2] ?? ''] });
      index += 1;
      continue;
    }

    const unordered = UNORDERED_PATTERN.exec(line);
    if (unordered) {
      flushParagraph();
      if (!list || list.kind !== 'ul') {
        flushList();
        list = { kind: 'ul', lines: [] };
      }
      list.lines.push(unordered[1] ?? '');
      index += 1;
      continue;
    }

    const ordered = ORDERED_PATTERN.exec(line);
    if (ordered) {
      flushParagraph();
      if (!list || list.kind !== 'ol') {
        flushList();
        list = { kind: 'ol', lines: [] };
      }
      list.lines.push(ordered[1] ?? '');
      index += 1;
      continue;
    }

    if (line.startsWith('>')) {
      flushParagraph();
      flushList();
      const quote: string[] = [];
      while (index < lines.length && (lines[index] ?? '').startsWith('>')) {
        quote.push((lines[index] ?? '').replace(/^>\s?/, ''));
        index += 1;
      }
      push({ kind: 'blockquote', lines: quote });
      continue;
    }

    flushList();
    paragraph.push(line);
    index += 1;
  }

  flushParagraph();
  flushList();
  return blocks;
}

const SAFE_URL = /^https?:\/\//i;

/** Renders inline syntax (`code`, **bold**, *italic*, links) into a parent. */
function renderInline(parent: Node, text: string): void {
  const code = /`([^`]+)`/.exec(text);
  if (code?.index !== undefined) {
    renderInline(parent, text.slice(0, code.index));
    const element = document.createElement('code');
    element.textContent = code[1] ?? '';
    parent.appendChild(element);
    renderInline(parent, text.slice(code.index + code[0].length));
    return;
  }

  const link = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(text);
  if (link?.index !== undefined) {
    const url = link[2] ?? '';
    if (SAFE_URL.test(url)) {
      renderInline(parent, text.slice(0, link.index));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = link[1] ?? url;
      parent.appendChild(anchor);
      renderInline(parent, text.slice(link.index + link[0].length));
      return;
    }
  }

  const bold = /\*\*([^*]+)\*\*/.exec(text);
  if (bold?.index !== undefined) {
    renderInline(parent, text.slice(0, bold.index));
    const element = document.createElement('strong');
    renderInline(element, bold[1] ?? '');
    parent.appendChild(element);
    renderInline(parent, text.slice(bold.index + bold[0].length));
    return;
  }

  const italic = /\*([^*]+)\*/.exec(text);
  if (italic?.index !== undefined) {
    renderInline(parent, text.slice(0, italic.index));
    const element = document.createElement('em');
    renderInline(element, italic[1] ?? '');
    parent.appendChild(element);
    renderInline(parent, text.slice(italic.index + italic[0].length));
    return;
  }

  if (text !== '') {
    parent.appendChild(document.createTextNode(text));
  }
}

function renderInlineLine(parent: Node, text: string): void {
  // A single line of inline content; trailing/leading space is preserved by
  // the transcript's pre-wrap where it matters.
  renderInline(parent, text);
}

/** Renders markdown text into a detached <div> ready to be appended. */
export function renderMarkdownToElement(text: string): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'ai-markdown';

  for (const block of scanBlocks(text)) {
    if (block.kind === 'code') {
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      if (block.lang !== '') code.dataset.lang = block.lang;
      code.textContent = block.lines.join('\n');
      pre.appendChild(code);
      container.appendChild(pre);
      continue;
    }

    if (block.kind === 'heading') {
      const level = document.createElement('h4');
      renderInlineLine(level, block.lines[0] ?? '');
      container.appendChild(level);
      continue;
    }

    if (block.kind === 'ul' || block.kind === 'ol') {
      const list = document.createElement(block.kind);
      for (const line of block.lines) {
        const item = document.createElement('li');
        renderInlineLine(item, line);
        list.appendChild(item);
      }
      container.appendChild(list);
      continue;
    }

    if (block.kind === 'blockquote') {
      const quote = document.createElement('blockquote');
      const paragraph = document.createElement('p');
      renderInlineLine(paragraph, block.lines.join('\n'));
      quote.appendChild(paragraph);
      container.appendChild(quote);
      continue;
    }

    const paragraph = document.createElement('p');
    renderInlineLine(paragraph, block.lines.join('\n'));
    container.appendChild(paragraph);
  }

  return container;
}
