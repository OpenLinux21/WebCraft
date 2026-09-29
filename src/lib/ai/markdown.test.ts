// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { renderMarkdownToElement } from './markdown';

describe('renderMarkdownToElement', () => {
  it('renders paragraphs and preserves line breaks', () => {
    const el = renderMarkdownToElement('first line\nsecond line');
    expect(el.querySelectorAll('p')).toHaveLength(1);
    expect(el.querySelector('p')?.textContent).toContain('first line\nsecond line');
  });

  it('renders fenced code blocks with textContent only', () => {
    const el = renderMarkdownToElement('```js\nconst a = "<script>";\n```');
    const pre = el.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre?.querySelector('code')?.dataset.lang).toBe('js');
    expect(pre?.textContent).toBe('const a = "<script>";');
  });

  it('treats an unclosed fence as code to the end', () => {
    const el = renderMarkdownToElement('before\n```\nstill code');
    expect(el.querySelector('pre')?.textContent).toBe('still code');
    expect(el.querySelector('p')?.textContent).toContain('before');
  });

  it('never parses HTML — script tags stay literal text', () => {
    const el = renderMarkdownToElement('<script>alert(1)</script> **bold**');
    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('strong')?.textContent).toBe('bold');
    expect(el.textContent).toContain('<script>alert(1)</script>');
  });

  it('renders inline code, bold, italic and links', () => {
    const el = renderMarkdownToElement('use `grid-template` and **bold** plus *soft* text');
    expect(el.querySelector('code')?.textContent).toBe('grid-template');
    expect(el.querySelector('strong')?.textContent).toBe('bold');
    expect(el.querySelector('em')?.textContent).toBe('soft');
  });

  it('renders only http(s) links with noopener', () => {
    const el = renderMarkdownToElement('[site](https://example.com) [bad](javascript:alert(1))');
    const links = [...el.querySelectorAll('a')];
    expect(links).toHaveLength(1);
    expect(links[0]?.href).toBe('https://example.com/');
    expect(links[0]?.rel).toContain('noopener');
    expect(el.textContent).toContain('[bad](javascript:alert(1))');
  });

  it('renders lists and headings', () => {
    const el = renderMarkdownToElement('- one\n- two\n\n1. first\n2. second\n\n### Title');
    expect(el.querySelector('ul')?.children).toHaveLength(2);
    expect(el.querySelector('ol')?.children).toHaveLength(2);
    expect(el.querySelector('h4')?.textContent).toBe('Title');
  });

  it('renders blockquotes', () => {
    const el = renderMarkdownToElement('> quoted line');
    expect(el.querySelector('blockquote')?.textContent).toContain('quoted line');
  });
});
