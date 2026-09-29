import { expect, test, type Page } from '@playwright/test';

/**
 * Smoke tests for the core user journeys. They run against the production
 * build served by `astro preview` (started automatically by the config).
 */

const EDITOR_BOOT = '.monaco-editor';

async function openPlayground(page: Page): Promise<void> {
  await page.goto('/en/playground/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(EDITOR_BOOT, { timeout: 20_000 });
}

async function focusEditor(page: Page): Promise<void> {
  await page.evaluate(() => {
    const area = document.querySelector<HTMLElement>('.monaco-editor textarea.inputarea');
    area?.focus();
  });
}

test('root redirects by browser language', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForURL('**/en/', { timeout: 5_000 });
  await expect(page).toHaveURL(/\/en\/$/);
});

test('home hero and localized navigation render', async ({ page }) => {
  await page.goto('/en/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toContainText('Learn front-end development');
  await page.goto('/zh-CN/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('nav')).toContainText('课程');
  await expect(page.locator('nav')).toContainText('训练场');
});

test('theme toggle cycles light and dark', async ({ page }) => {
  await page.goto('/en/', { waitUntil: 'domcontentloaded' });
  const toggle = page.locator('[data-theme-toggle]');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('playground runs code and captures console output', async ({ page }) => {
  await openPlayground(page);
  await expect(page.locator('[data-console-list] li')).toContainText('Playground is ready!', {
    timeout: 10_000,
  });
});

test('live preview updates after typing in the editor', async ({ page }) => {
  await openPlayground(page);
  await page.click('[data-tab="javascript"]');
  await focusEditor(page);
  await page.keyboard.type('console.warn("typed-by-e2e");');
  const consoleList = page.locator('[data-console-list]');
  await expect(consoleList).toContainText('typed-by-e2e', { timeout: 10_000 });
  await expect(consoleList.locator('li[data-level="warn"]').first()).toContainText('typed-by-e2e');
});

test('lesson renders objectives, exercise and a working status card', async ({ page }) => {
  await page.goto('/en/courses/01-html-doc-structure/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.lesson-objectives')).toBeVisible();
  await expect(page.locator('.exercise')).toBeVisible();
  await expect(page.locator('[data-lesson-status]')).toBeVisible();

  const statusCard = page.locator('[data-lesson-status]');
  await statusCard.locator('[data-action="start"]').click();
  await expect(statusCard).toHaveAttribute('data-status', 'inProgress');
  await statusCard.locator('[data-action="complete"]').click();
  await expect(statusCard).toHaveAttribute('data-status', 'completed');

  // Progress persists in IndexedDB across reloads.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-lesson-status]')).toHaveAttribute('data-status', 'completed');
  await statusCard.locator('[data-action="reset"]').click();
  await expect(statusCard).toHaveAttribute('data-status', 'notStarted');
});

test('course list reflects lesson progress', async ({ page }) => {
  await page.goto('/en/courses/02-html-text-semantic/', { waitUntil: 'domcontentloaded' });
  const statusCard = page.locator('[data-lesson-status]');
  await statusCard.locator('[data-action="start"]').click();

  await page.goto('/en/courses/', { waitUntil: 'domcontentloaded' });
  const badge = page.locator(
    '[data-lesson-progress-badge][data-lesson-id="02-html-text-semantic"]',
  );
  await expect(badge).toHaveAttribute('data-status', 'inProgress');
  await expect(badge).toContainText('In progress');

  // Clean up so later runs start fresh.
  await page.goto('/en/courses/02-html-text-semantic/', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-lesson-status]').locator('[data-action="reset"]').click();
});

test('exercise hints reveal progressively', async ({ page }) => {
  await page.goto('/en/courses/04-css-selectors-cascade/', { waitUntil: 'domcontentloaded' });
  const hints = page.locator('[data-hints] details[data-hint]');
  const hintCount = await hints.count();
  expect(hintCount).toBeGreaterThanOrEqual(1);
  await expect(hints.nth(1)).toBeHidden();
  await hints.first().locator('summary').click();
  await expect(hints.nth(1)).toBeVisible();
});

test('settings page shows all sections and the language switch navigates', async ({ page }) => {
  await page.goto('/en/settings/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main')).toContainText('AI assistant');
  await expect(page.locator('main')).toContainText('Backup & restore');
  await expect(page.locator('main')).toContainText('Data');

  // MWC select: open the menu, then pick the option. Playwright's default
  // actionability check misjudges options inside the MWC menu popover, so the
  // option click uses force (the element is measurably visible when open).
  const languageSelect = page.locator('[data-setting="language"]');
  // Hydration race: retry the click until the MWC menu is really open.
  await expect(async () => {
    await languageSelect.click();
    await page.waitForFunction(
      () =>
        (document.querySelector('[data-setting="language"]') as { open?: boolean } | null)?.open ===
        true,
      undefined,
      { timeout: 2_000 },
    );
  }).toPass({ timeout: 15_000 });
  await languageSelect.locator('md-select-option[value="zh-CN"]').click({ force: true });
  await page.waitForURL('**/zh-CN/settings/', { timeout: 10_000 });
  await expect(page.locator('h1')).toContainText('设置');
});

test('builtin challenge opens a per-task workspace via ?task=', async ({ page }) => {
  await page.goto('/en/playground/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(EDITOR_BOOT, { timeout: 20_000 });

  // Add a starter challenge and open its workspace.
  await page.locator('[data-tasks-builtin]').click();
  const title = page.locator('.tasks-panel__title').first();
  await expect(title).toBeVisible();
  await title.click();

  const banner = page.locator('[data-task-banner]');
  await expect(banner).toBeVisible();
  await expect(banner.locator('[data-task-title]')).toContainText(/./);
  await expect(page.locator('[data-workbench]')).toHaveAttribute('data-draft-key', /task-[0-9a-f]/);
  // URL carries the task id; the back link returns to free mode.
  await expect(page).toHaveURL(/\?task=[0-9a-f]/);
  await banner.locator('.task-banner__back').click();
  await expect(banner).toBeHidden();
  await expect(page).toHaveURL(/\/playground\/\??$/);
});

test('lesson page exposes a table of contents that scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('/en/courses/09-css-grid/', { waitUntil: 'domcontentloaded' });
  const toc = page.locator('[data-toc]');
  await expect(toc).toBeVisible();
  const firstLink = toc.locator('[data-toc-link]').first();
  await firstLink.click();
  // The hash updates and smooth-scrolls below the sticky header; wait for
  // the scroll animation to settle before asserting.
  await expect(page).toHaveURL(/#/);
  await expect
    .poll(
      async () => {
        const current = await page.evaluate(() => window.scrollY);
        await page.waitForTimeout(150);
        return Math.abs((await page.evaluate(() => window.scrollY)) - current);
      },
      { timeout: 5_000 },
    )
    .toBeLessThan(2);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
});
