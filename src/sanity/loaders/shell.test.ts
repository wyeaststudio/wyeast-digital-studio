import { afterEach, describe, expect, it, vi } from 'vitest';
import { sanityFetch } from '../fetch';
import { getShell } from './shell';

vi.mock('../fetch', () => ({ sanityFetch: vi.fn() }));

const mockFetch = vi.mocked(sanityFetch);

describe('getShell [SHELL-R22, SHELL-R23]', () => {
  afterEach(() => vi.restoreAllMocks());

  it('fetches with the siteSettings and navigation cache tags', async () => {
    const shell = { settings: null, navigation: null };
    mockFetch.mockResolvedValueOnce(shell);
    await expect(getShell()).resolves.toBe(shell);
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ tags: ['siteSettings', 'navigation'] }));
  });

  it('returns null instead of throwing when Sanity is unreachable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('network down'));
    await expect(getShell()).resolves.toBeNull();
  });
});
