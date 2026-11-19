import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './helpers/axe';

const SECTION = 'section[aria-labelledby="homePage-faq-heading"]';

test.describe('Home builder FAQ section [PB-R18, SEO-R20, R22, R23]', () => {
  test('shows the heading and seeded questions, all collapsed', async ({ page }) => {
    await page.goto('/');
    const section = page.locator(SECTION);
    await expect(section.getByRole('heading', { level: 2, name: 'Frequently Asked Questions' })).toBeVisible();
    const details = section.locator('details');
    expect(await details.count()).toBeGreaterThan(0);
    for (const item of await details.all()) await expect(item).not.toHaveAttribute('open');
  });

  test('a question opens and closes with the keyboard', async ({ page }) => {
    await page.goto('/');
    const item = page.locator(`${SECTION} details`).first();
    const summary = item.locator('summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(item).toHaveAttribute('open');
    await expect(item.locator('p').first()).toBeVisible();
    await page.keyboard.press('Space');
    await expect(item).not.toHaveAttribute('open');
  });

  test('every question is at least 44 px tall', async ({ page }) => {
    await page.goto('/');
    for (const summary of await page.locator(`${SECTION} summary`).all()) {
      const box = await summary.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`has no WCAG A/AA violations with a question open (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.goto('/');
      await page.locator(`${SECTION} summary`).first().click();
      await expectNoA11yViolations(page, { include: SECTION });
    });
  }

  test('the chevron does not animate with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const chevron = page.locator(`${SECTION} summary svg`).first();
    const transition = await chevron.evaluate((el) => {
      const style = getComputedStyle(el);
      return { property: style.transitionProperty, duration: parseFloat(style.transitionDuration) };
    });
    expect(transition.property === 'none' || transition.duration <= 0.00001).toBe(true);
  });
});
