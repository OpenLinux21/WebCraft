import { describe, expect, it } from 'vitest';
import { homePath, relativeHref, swapLocaleSegment } from './routes';

describe('relativeHref', () => {
  it('links from the locale home to the courses list', () => {
    expect(relativeHref('/zh-CN/courses/', '/zh-CN/')).toBe('./courses/');
  });

  it('climbs up from a nested lesson page', () => {
    expect(relativeHref('/zh-CN/playground/', '/zh-CN/courses/some-lesson/')).toBe(
      '../../playground/',
    );
  });

  it('links between sibling lessons', () => {
    expect(relativeHref('/zh-CN/courses/other-lesson/', '/zh-CN/courses/some-lesson/')).toBe(
      '../other-lesson/',
    );
  });

  it('produces ./ for the current page', () => {
    expect(relativeHref('/en/courses/', '/en/courses/')).toBe('./');
  });

  it('links from a deep page back to the locale home', () => {
    expect(relativeHref('/en/', '/en/settings/')).toBe('../');
  });
});

describe('swapLocaleSegment', () => {
  it('swaps the locale prefix and keeps the rest', () => {
    expect(swapLocaleSegment('/en/courses/', 'en', 'zh-CN')).toBe('/zh-CN/courses/');
  });

  it('handles the bare locale root', () => {
    expect(swapLocaleSegment('/en/', 'en', 'zh-CN')).toBe('/zh-CN/');
    expect(swapLocaleSegment('/en', 'en', 'zh-CN')).toBe('/zh-CN/');
  });
});

describe('homePath', () => {
  it('ends with a slash', () => {
    expect(homePath('en')).toBe('/en/');
  });
});
