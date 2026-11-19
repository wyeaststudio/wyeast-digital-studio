import { expect, test } from '@playwright/test';
import seeds from '../sanity/seed/pages.json';
import { expectNoA11yViolations } from './helpers/axe';

type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };
declare global {
  interface Window {
    readPageBuilderShifts: () => number[];
  }
}

const pages = [
  { path: '/', id: 'homePage' },
  { path: '/page-builder-demo', id: 'page-builder-demo' },
] as const;

for (const { path, id } of pages) {
  test.describe(`Page builder ${path}`, () => {
    test('renders seeded sections in order with one h1 and no skipped heading levels [PB-R2, R4, R9, R22, R23]', async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      const seed = seeds.find((document) => document._id === id);
      expect(seed?.sections?.length).toBeGreaterThan(0);
      const attributes = await page.locator('main > section').evaluateAll((sections) =>
        sections.map((section) => section.getAttribute('data-sanity')),
      );
      expect(attributes).toEqual(seed!.sections!.map((section) =>
        expect.stringContaining(`path=sections:${section._key};`),
      ));
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveCount(1);
      const levels = await page.getByRole('main').locator('h1,h2,h3,h4,h5,h6').evaluateAll((headings) =>
        headings.map((heading) => Number(heading.tagName.slice(1))),
      );
      expect(levels[0]).toBe(1);
      levels.slice(1).forEach((level, index) => expect(level).toBeLessThanOrEqual(levels[index] + 1));
    });

    test('feature-card links include the card title and have 44px targets [PB-R15]', async ({ page }) => {
      await page.goto(path);
      const cards = page.locator(`section[aria-labelledby="${id}-features-heading"] article`);
      expect(await cards.count()).toBeGreaterThan(0);
      for (const card of await cards.all()) {
        const title = await card.getByRole('heading', { level: 3 }).innerText();
        const link = card.getByRole('link');
        await expect(link).toHaveAccessibleName(new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        const box = await link.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('reserves hero space before the image loads and stays within the CLS budget [PB-R13]', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Layout Instability API is supported by Chromium.');
      await page.addInitScript(() => {
        const values: number[] = [];
        const record = (entries: PerformanceEntry[]) => {
          for (const entry of entries as LayoutShiftEntry[]) {
            if (!entry.hadRecentInput) values.push(entry.value);
          }
        };
        const observer = new PerformanceObserver((list) => record(list.getEntries()));
        observer.observe({ type: 'layout-shift', buffered: true });
        window.readPageBuilderShifts = () => {
          record(observer.takeRecords());
          return values;
        };
      });
      let releaseImages!: () => void;
      const imagesReady = new Promise<void>((resolve) => { releaseImages = resolve; });
      await page.route('https://cdn.sanity.io/images/**', async (route) => {
        await imagesReady;
        await route.continue();
      });
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      const hero = page.locator('main > section').first();
      const before = await hero.boundingBox();
      expect(await hero.locator('picture img').evaluate((img: HTMLImageElement) => img.complete)).toBe(false);
      releaseImages();
      const image = hero.locator('picture img');
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ));
      const after = await hero.boundingBox();
      expect(before).not.toBeNull();
      expect(after).toEqual(before);
      const shifts = await page.evaluate(() => window.readPageBuilderShifts());
      expect(shifts.reduce((sum, value) => sum + value, 0), `Layout shifts: ${JSON.stringify(shifts)}`).toBeLessThanOrEqual(0.1);
    });

    for (const colorScheme of ['light', 'dark'] as const) {
      test(`has zero axe violations in ${colorScheme} mode [PB-R10, R23]`, async ({ page }) => {
        await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        await expectNoA11yViolations(page);
      });
    }
  });
}

test('demo metadata is page-specific, its social image loads, and crawler files exclude it [PB-R5, R23]', async ({ page, request }) => {
  await page.goto('/page-builder-demo');
  await expect(page).toHaveTitle(/^Page builder demo \| /);
  const head = page.locator('head');
  await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/page-builder-demo$/);
  await expect(head.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  const image = await head.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toMatch(/^https?:\/\//);
  const imageUrl = new URL(image!);
  const response = await request.get(imageUrl.hostname === 'cdn.sanity.io' ? image! : `${imageUrl.pathname}${imageUrl.search}`);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/^image\//);
  for (const file of ['/sitemap.xml', '/llms.txt']) {
    const crawlerFile = await request.get(file);
    expect(crawlerFile.status()).toBe(200);
    expect(await crawlerFile.text()).not.toContain('/page-builder-demo');
  }
});

test('demo anchor link scrolls to the section [PB-R11]', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/page-builder-demo');
  const target = page.locator('section#details');
  expect(await target.evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThan(500);
  await page.getByRole('link', { name: 'Explore the details', exact: true }).click();
  await expect(page).toHaveURL(/\/page-builder-demo#details$/);
  await expect.poll(() => target.evaluate((element) =>
    Math.abs(element.getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)),
  )).toBeLessThan(2);
});

test('CMS links avoid speculative route requests and still navigate on click [PB-R12]', async ({ page }) => {
  const speculative: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.searchParams.has('_rsc') && url.pathname !== '/') speculative.push(url.pathname);
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('main').getByRole('link', { name: 'Booking details coming soon', exact: true }).hover();
  await page.waitForLoadState('networkidle');
  expect(speculative).toEqual([]);

  await page.goto('/page-builder-demo');
  await page.getByRole('link', { name: 'Visit the home page', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Thoughtful websites. Built to help your business grow.' })).toBeVisible();
});

test('unknown slug returns the site 404 and noindex [PB-R3]', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: /page not found/i })).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
});
