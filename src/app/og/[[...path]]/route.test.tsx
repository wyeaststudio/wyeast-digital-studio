import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolvePath } from '@/lib/seo/routes';
import { SITE_DEFAULTS } from '@/lib/seo/site';
import { getOgTitle, getSiteSeo, type SiteSeo } from '@/sanity/loaders/seo';
import { GET } from './route';

vi.mock('next/og', () => ({
  ImageResponse: class extends Response {
    constructor(element: ReactElement, options: ResponseInit) {
      super(renderToStaticMarkup(element), options);
    }
  },
}));
vi.mock('@/sanity/loaders/seo', () => ({ getSiteSeo: vi.fn(), getOgTitle: vi.fn() }));
vi.mock('@/lib/seo/routes', () => ({ resolvePath: vi.fn() }));

const settings = {
  _updatedAt: '2026-11-18T00:00:00Z',
  siteName: SITE_DEFAULTS.siteName,
  homeTitle: 'Published title',
  email: null,
  phone: null,
  defaultDescription: null,
  businessDescription: null,
  addressLocality: null,
  addressRegion: null,
  areaServed: null,
  serviceArea: null,
  defaultOgImage: null,
  socialLinks: null,
} satisfies SiteSeo;

const requestCard = (path: string[] = []) =>
  GET(new Request(`https://wyeast.studio/og/${path.join('/')}`), { params: Promise.resolve({ path }) });

describe('social card route [SEO-R1, R9, R18]', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(resolvePath).mockReturnValue({ kind: 'home' });
  });

  it('requests published settings and caches a successful card', async () => {
    vi.mocked(getSiteSeo).mockResolvedValue(settings);

    const response = await requestCard();

    expect(getSiteSeo).toHaveBeenCalledWith({ publishedOnly: true });
    expect(await response.text()).toContain('Published title');
    expect(response.headers.get('Cache-Control')).toContain('immutable');
  });

  it('does not cache fallback artwork and uses recovered settings on the next request', async () => {
    vi.mocked(getSiteSeo)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...settings, homeTitle: 'Recovered title' });

    const fallback = await requestCard();
    expect(fallback.status).toBe(200);
    expect(fallback.headers.get('Cache-Control')).toBe('no-store');
    expect(await fallback.text()).toContain(SITE_DEFAULTS.siteName.replace("'", '&#x27;'));

    const recovered = await requestCard();
    expect(await recovered.text()).toContain('Recovered title');
    expect(recovered.headers.get('Cache-Control')).toContain('immutable');
  });

  it('also prevents caching document cards when settings are unavailable', async () => {
    vi.mocked(resolvePath).mockReturnValue({ kind: 'document', type: 'service', slug: 'web-design' });
    vi.mocked(getSiteSeo).mockResolvedValue(null);
    vi.mocked(getOgTitle).mockResolvedValue('Web design');

    const response = await requestCard(['services', 'web-design']);

    expect(getOgTitle).toHaveBeenCalledWith('service', 'web-design');
    expect(await response.text()).toContain('Web design');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
