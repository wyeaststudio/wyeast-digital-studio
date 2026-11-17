import { expect, test, type Page } from '@playwright/test';

/** Returns a theme option, opening the mobile menu first when the switch lives inside it. */
async function themeOption(page: Page, name: string) {
  const openMenu = page.getByRole('button', { name: 'Open menu' });
  if (await openMenu.isVisible()) await openMenu.click();
  return page.getByRole('group', { name: 'Theme' }).getByRole('button', { name }).filter({ visible: true });
}

test.describe('Theming [FOUND-R6, FOUND-R7]', () => {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`follows the OS preference (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto('/');
      const html = page.locator('html');
      if (colorScheme === 'dark') await expect(html).toHaveClass(/\bdark\b/);
      else await expect(html).not.toHaveClass(/\bdark\b/);
    });
  }

  test('the switch applies a choice that persists across reloads [SHELL-R12]', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');

    await (await themeOption(page, 'Dark theme')).click();
    await expect(html).toHaveClass(/\bdark\b/);

    await page.reload();
    await expect(html).toHaveClass(/\bdark\b/);
    await expect(await themeOption(page, 'Dark theme')).toHaveAttribute('aria-pressed', 'true');
  });

  test('"System" follows the OS preference [SHELL-R12]', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('theme', 'light');
        sessionStorage.setItem('seeded', '1');
      }
    });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/\bdark\b/);

    await (await themeOption(page, 'System theme')).click();
    await expect(html).toHaveClass(/\bdark\b/);
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(html).not.toHaveClass(/\bdark\b/);
  });

  test('applies the saved theme before first paint (no flash)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
      document.addEventListener('DOMContentLoaded', () => {
        (window as unknown as { classAtDomReady: string }).classAtDomReady =
          document.documentElement.className;
      });
    });
    await page.goto('/');
    const classAtDomReady = await page.evaluate(
      () => (window as unknown as { classAtDomReady: string }).classAtDomReady,
    );
    expect(classAtDomReady).toMatch(/\bdark\b/);
  });

  test('the switch is keyboard operable with 44px options [SHELL-R11]', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const dark = await themeOption(page, 'Dark theme');
    await dark.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    const box = await dark.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('Reduced motion [FOUND-R9]', () => {
  test('disables transitions when the user prefers reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const duration = await page
      .getByRole('link', { name: /open sanity studio/i })
      .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
    expect(duration).toBeLessThan(0.001);
  });
});
