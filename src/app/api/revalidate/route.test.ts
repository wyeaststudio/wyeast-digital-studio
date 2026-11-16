// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { parseBody, revalidateTag } = vi.hoisted(() => ({
  parseBody: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock('next-sanity/webhook', () => ({ parseBody }));
vi.mock('next/cache', () => ({ revalidateTag }));

const { POST } = await import('./route');

const request = () =>
  new NextRequest('http://localhost/api/revalidate', { method: 'POST', body: '{}' });

describe('POST /api/revalidate [FOUND-R23]', () => {
  beforeEach(() => vi.stubEnv('SANITY_REVALIDATE_SECRET', 'test-secret'));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it.each([false, null])('returns 401 when the signature is %s', async (isValidSignature) => {
    parseBody.mockResolvedValue({ isValidSignature, body: { _type: 'page' } });
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('validates with the configured secret', async () => {
    parseBody.mockResolvedValue({ isValidSignature: true, body: { _type: 'page' } });
    await POST(request());
    expect(parseBody).toHaveBeenCalledWith(expect.anything(), 'test-secret');
  });

  it('revalidates the type and type:slug tags with the "max" profile', async () => {
    parseBody.mockResolvedValue({
      isValidSignature: true,
      body: { _type: 'service', slug: 'web-design' },
    });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith('service', 'max');
    expect(revalidateTag).toHaveBeenCalledWith('service:web-design', 'max');
  });

  it('returns 400 when the payload has no _type', async () => {
    parseBody.mockResolvedValue({ isValidSignature: true, body: {} });
    expect((await POST(request())).status).toBe(400);
  });

  it('returns 500 when the secret is not configured', async () => {
    vi.stubEnv('SANITY_REVALIDATE_SECRET', '');
    expect((await POST(request())).status).toBe(500);
  });
});
