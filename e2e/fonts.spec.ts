import { expect, test } from '@playwright/test';

test.describe('Fonts [FOUND-R3]', () => {
  test('headings use Playfair Display and body uses Montserrat Alternates', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    const fontOf = (selector: string) =>
      page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontFamily);

    await expect.poll(() => fontOf('h1')).toMatch(/Playfair Display/);
    await expect.poll(() => fontOf('body')).toMatch(/Montserrat Alternates/);
  });

  test('fonts are self-hosted, with no requests to Google Fonts', async ({ page }) => {
    const googleRequests: string[] = [];
    page.on('request', (request) => {
      if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) googleRequests.push(request.url());
    });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    expect(googleRequests).toEqual([]);
  });
});
