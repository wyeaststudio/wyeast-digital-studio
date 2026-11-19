import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// Next regenerates the draft-mode cookie value on every build; read it from the build under test.
const previewModeId = (): string =>
  JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8')).preview.previewModeId;

test.describe('Draft mode [FOUND-R12, FOUND-R13]', () => {
  test('rejects enable requests without a valid preview secret', async ({ request }) => {
    const response = await request.get('/api/draft-mode/enable?sanity-preview-secret=invalid');
    expect([401, 500]).toContain(response.status());
  });

  test('public pages do not include Visual Editing', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).not.toContain('VisualEditing');
  });

  test('social cards are identical with and without a draft-mode cookie [SEO-R9]', async ({ request }) => {
    const published = await request.get('/og');
    const preview = await request.get('/og', { headers: { cookie: `__prerender_bypass=${previewModeId()}` } });
    expect(published.status()).toBe(200);
    expect(preview.status()).toBe(200);
    expect(preview.headers()['content-type']).toBe('image/png');
    expect((await preview.body()).equals(await published.body())).toBe(true);
  });

  test('draft mode renders Visual Editing, and the disable route exits', async ({ request, baseURL }) => {
    const headers = { cookie: `__prerender_bypass=${previewModeId()}` };
    const html = await (await request.get('/', { headers })).text();
    expect(html).toContain('VisualEditing');

    const exit = await request.get('/api/draft-mode/disable', { headers, maxRedirects: 0 });
    expect(exit.status()).toBe(307);
    expect(exit.headers().location).toBe(`${baseURL}/`);
  });

  test('draft mode renders the demo page with section editing attributes [PB-R7]', async ({ request }) => {
    const response = await request.get('/page-builder-demo', {
      headers: { cookie: `__prerender_bypass=${previewModeId()}` },
    });
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('VisualEditing');
    expect(html).toMatch(/<h1\b/);
    expect(html).toContain('data-sanity="id=page-builder-demo');
    expect(html).toContain('path=sections:hero');
    expect(html).toContain('"@type":"FAQPage"');
  });
});
