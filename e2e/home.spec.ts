import { test } from '@playwright/test';
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
});
