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

  test('draft mode renders Visual Editing, and the disable route exits', async ({ request, baseURL }) => {
    const headers = { cookie: `__prerender_bypass=${previewModeId()}` };
    const html = await (await request.get('/', { headers })).text();
    expect(html).toContain('VisualEditing');

    const exit = await request.get('/api/draft-mode/disable', { headers, maxRedirects: 0 });
    expect(exit.status()).toBe(307);
    expect(exit.headers().location).toBe(`${baseURL}/`);
  });
});
