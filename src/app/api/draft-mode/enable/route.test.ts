// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const { draftMode } = vi.hoisted(() => ({ draftMode: vi.fn() }));
vi.mock('next/headers', () => ({ draftMode }));

vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'test-project');
const { GET } = await import('./route');

describe('GET /api/draft-mode/enable [FOUND-R13]', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('rejects requests without a valid preview secret and leaves draft mode off', async () => {
    vi.stubEnv('SANITY_API_READ_TOKEN', 'test-token');
    const response = await GET(new Request('http://localhost/api/draft-mode/enable'));
    expect(response.status).toBe(401);
    expect(draftMode).not.toHaveBeenCalled();
  });

  it('returns 500 when the read token is not configured', async () => {
    vi.stubEnv('SANITY_API_READ_TOKEN', '');
    const response = await GET(new Request('http://localhost/api/draft-mode/enable'));
    expect(response.status).toBe(500);
  });
});
