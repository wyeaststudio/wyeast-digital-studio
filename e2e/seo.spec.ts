import { expect, test, type APIRequestContext } from '@playwright/test';

/** Width and height from a PNG's IHDR chunk. */
function pngSize(buffer: Buffer): { width: number; height: number } {
  expect(buffer.subarray(1, 4).toString('ascii')).toBe('PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function fetchPath(request: APIRequestContext, absolute: string) {
  const url = new URL(absolute);
  return request.get(`${url.pathname}${url.search}`);
}

test.describe('SEO head tags [SEO-R1, R2, R8]', () => {
  test('home has complete metadata and no template text', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Wy.east Digital Studio/);
    const head = page.locator('head');
    await expect(head.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/);
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/?$/);
    await expect(head.locator('meta[property="og:title"]')).toHaveAttribute('content', /Wy.east/);
    await expect(head.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /.+/);
    await expect(head.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    expect(await page.content()).not.toMatch(/agency template/i);
  });

  test('og:image is a 1200×630 PNG, ignores ?title=, and unknown paths 404 [SEO-R9]', async ({ page, request }) => {
    await page.goto('/');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();

    const card = await fetchPath(request, ogImage!);
    expect(card.status()).toBe(200);
    expect(card.headers()['content-type']).toBe('image/png');
    const body = await card.body();
    expect(pngSize(body)).toEqual({ width: 1200, height: 630 });

    const injected = await request.get('/og?title=Injected');
    expect(injected.status()).toBe(200);
    expect((await injected.body()).equals(body)).toBe(true);

    expect((await request.get('/og/nope')).status()).toBe(404);
  });
});

test.describe('Structured data [SEO-R10, R13]', () => {
  test('JSON-LD parses, and FAQPage questions equal the visible questions', async ({ page }) => {
    await page.goto('/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const data = blocks.map((text) => JSON.parse(text));
    const graph = data.find((item) => item['@graph'])['@graph'];
    expect(graph.map((node: { '@type': string }) => node['@type'])).toEqual(['ProfessionalService', 'WebSite']);

    const faq = data.find((item) => item['@type'] === 'FAQPage');
    const names = faq.mainEntity.map((question: { name: string }) => question.name);
    const visible = await page.locator('section[aria-labelledby="faq-heading"] summary').allTextContents();
    expect(names.length).toBeGreaterThan(0);
    expect(names).toEqual(visible.map((text) => text.trim()));
  });

  test('the 404 page is noindex', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
  });
});

test.describe('Crawler files [SEO-R14, R16, R17]', () => {
  test('sitemap.xml lists the home page', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');
    expect(await response.text()).toMatch(/<loc>https?:\/\/[^<]+<\/loc>/);
  });

  test('robots.txt blocks AI training crawlers and the Studio, and links the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    const text = await response.text();
    expect(text).toMatch(/User-Agent: GPTBot[\s\S]*?Disallow: \/\n/);
    expect(text).toContain('Disallow: /studio');
    expect(text).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
  });

  test('llms.txt is Markdown with the site name and a Pages section', async ({ request }) => {
    const response = await request.get('/llms.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('text/plain; charset=utf-8');
    const text = await response.text();
    expect(text.startsWith('# ')).toBe(true);
    expect(text).toContain('\n> ');
    expect(text).toContain('## Pages');
  });
});
