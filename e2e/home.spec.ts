import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './helpers/axe';

test.describe('Home [FOUND-R18]', () => {
  test('has no WCAG A/AA violations in light mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expectNoA11yViolations(page);
  });

  test('has no WCAG A/AA violations in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expectNoA11yViolations(page);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`hovered primary button keeps accessible contrast (${colorScheme}) [FOUND-R1]`, async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.goto('/');
      const button = page.getByRole('main').getByRole('link', { name: 'Book Appointment', exact: true });
      await button.hover();
      await expectNoA11yViolations(page, { include: 'main section:first-child a[href="/contact"]', rules: ['color-contrast', 'color-contrast-enhanced'] });
    });
  }

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`loads without console errors or hydration mismatches (${colorScheme}) [FOUND-R19]`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.emulateMedia({ colorScheme });
      await page.goto('/', { waitUntil: 'networkidle' });
      expect(errors).toEqual([]);
    });
  }
});
