import { expect, test } from '@playwright/test';

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

  test('toggle switches the theme and the choice persists across reloads', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');

    await page.getByRole('button', { name: /switch to dark theme/i }).click();
    await expect(html).toHaveClass(/\bdark\b/);

    await page.reload();
    await expect(html).toHaveClass(/\bdark\b/);
    await expect(page.getByRole('button', { name: /switch to light theme/i })).toBeVisible();
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

  test('toggle is keyboard operable [FOUND-R8]', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const button = page.getByRole('button', { name: /switch to dark theme/i });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    const box = await page.getByRole('button', { name: /switch to light theme/i }).boundingBox();
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
