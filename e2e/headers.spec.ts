import { expect, test } from '@playwright/test';

test.describe('Security headers [FOUND-R14]', () => {
  test('allow same-origin framing only (for the Studio Presentation tool)', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['content-security-policy']).toContain("frame-ancestors 'self'");
    expect(headers['content-security-policy']).not.toContain("frame-ancestors 'none'");
  });
});
