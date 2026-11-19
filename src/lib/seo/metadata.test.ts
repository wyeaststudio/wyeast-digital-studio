import { describe, expect, it } from 'vitest';
import { withStega } from '@/test-utils/stega';
import type { SiteSeo } from '@/sanity/loaders/seo';
import { buildMetadata, xHandle } from './metadata';
import { isIndexableDeployment, resolveSite, SITE_DEFAULTS, SITE_URL } from './site';

const settings = {
  _updatedAt: '2026-11-17T00:00:00Z',
  siteName: 'Studio Name',
  email: null,
  phone: null,
  homeTitle: 'Studio Name | Home title',
  defaultDescription: 'Default description for every page without its own description, long enough to pass.',
  businessDescription: 'Business description.',
  addressLocality: null,
  addressRegion: null,
  areaServed: null,
  serviceArea: null,
  defaultOgImage: null,
  socialLinks: [{ platform: 'x', url: 'https://x.com/studio_name' }],
} satisfies SiteSeo;

const site = resolveSite(settings);

describe('buildMetadata [SEO-R1, R2, R3, R4, R5, R6]', () => {
  it('falls back to the Wy’east defaults when settings are null', () => {
    const meta = buildMetadata({ site: resolveSite(null), path: '/', indexable: true });
    expect(meta.title).toEqual({ absolute: SITE_DEFAULTS.homeTitle, template: `%s | ${SITE_DEFAULTS.siteName}` });
    expect(meta.description).toBe(SITE_DEFAULTS.description);
    expect(meta.openGraph?.siteName).toBe(SITE_DEFAULTS.siteName);
  });

  it('uses the absolute home title and a template for child segments', () => {
    const meta = buildMetadata({ site, path: '/', title: 'Ignored', indexable: true });
    expect(meta.title).toEqual({ absolute: 'Studio Name | Home title', template: '%s | Studio Name' });
    expect(meta.alternates?.canonical).toBe(SITE_URL);
  });

  it('builds "{page title} | {site name}" and prefers the SEO title', () => {
    expect(buildMetadata({ site, path: '/about', title: 'About', indexable: true }).title).toMatchObject({
      absolute: 'About | Studio Name',
    });
    const meta = buildMetadata({ site, path: '/about', title: 'About', seo: { title: 'About us' }, indexable: true });
    expect(meta.title).toMatchObject({ absolute: 'About us | Studio Name' });
    expect(meta.openGraph?.title).toBe('About us');
  });

  it('makes the canonical URL absolute, without a query string or trailing slash', () => {
    const meta = buildMetadata({ site, path: '/services/web-design/?utm=x', title: 'Web design', indexable: true });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/services/web-design`);
    expect(meta.openGraph?.url).toBe(`${SITE_URL}/services/web-design`);
  });

  it('returns whole openGraph, twitter, and robots objects when the page sets only a title', () => {
    const meta = buildMetadata({ site, path: '/about', title: 'About', indexable: true });
    expect(meta.openGraph).toMatchObject({
      type: 'website',
      locale: 'en_US',
      siteName: 'Studio Name',
      description: settings.defaultDescription,
      images: [{ url: expect.stringMatching(`^${SITE_URL}/og/about\\?v=`), width: 1200, height: 630, alt: 'About, Studio Name' }],
    });
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      site: '@studio_name',
      title: 'About',
      images: [{ url: expect.stringMatching(`^${SITE_URL}/og/about\\?v=`), alt: 'About, Studio Name' }],
    });
    expect(meta.robots).toMatchObject({ index: true, follow: true });
  });

  it('renders noindex, follow when seo.noindex is on', () => {
    const meta = buildMetadata({ site, path: '/draft', title: 'Draft', seo: { noindex: true }, indexable: true });
    expect(meta.robots).toMatchObject({ index: false, follow: true });
  });

  it('uses the valid site card for noindex pages without uploads while retaining page-specific metadata [PB-R5]', () => {
    const home = buildMetadata({ site, path: '/', indexable: true });
    const meta = buildMetadata({
      site, path: '/page-builder-demo', title: 'Page builder demo', seo: { noindex: true }, indexable: true,
    });
    expect(meta.openGraph?.images).toEqual(home.openGraph?.images);
    expect(meta.twitter?.images).toEqual(home.twitter?.images);
    expect(meta.openGraph?.title).toBe('Page builder demo');
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/page-builder-demo`);
  });

  it.each(['page', 'site'] as const)('preserves the %s uploaded social image for noindex pages [PB-R5]', (source) => {
    const upload = {
      asset: { _type: 'reference' as const, _ref: 'image-abc123-1200x630-jpg' },
      hotspot: null, crop: null, alt: 'Approved artwork',
    };
    const meta = buildMetadata({
      site: source === 'site' ? resolveSite({ ...settings, defaultOgImage: upload }) : site,
      path: '/page-builder-demo',
      title: 'Page builder demo',
      seo: { noindex: true, ...(source === 'page' ? { ogImage: upload } : {}) },
      indexable: true,
    });
    expect(meta.openGraph?.images).toEqual([expect.objectContaining({
      url: expect.stringContaining('cdn.sanity.io'),
      alt: 'Approved artwork',
    })]);
  });

  it.each([
    ['preview', false],
    ['development', false],
    ['production', true],
    [undefined, true],
  ])('VERCEL_ENV=%s → indexable %s', (env, expected) => {
    expect(isIndexableDeployment(env)).toBe(expected);
    const meta = buildMetadata({ site, path: '/', indexable: isIndexableDeployment(env) });
    expect(meta.robots).toMatchObject({ index: expected });
  });

  it('reads twitter:site only from an X or Twitter profile URL', () => {
    expect(xHandle(site)).toBe('@studio_name');
    expect(xHandle(resolveSite({ ...settings, socialLinks: [{ platform: 'x', url: 'https://example.com/x' }] }))).toBe(
      undefined,
    );
    expect(buildMetadata({ site: resolveSite(null), path: '/', indexable: true }).twitter).not.toHaveProperty('site', expect.anything());
  });

  it('strips stega from every input', () => {
    const stegaSite = resolveSite({
      ...settings,
      siteName: withStega('Studio Name'),
      homeTitle: withStega('Home'),
      defaultDescription: withStega('Default description'),
    });
    const meta = buildMetadata({
      site: stegaSite,
      path: '/about',
      title: withStega('About'),
      seo: { description: withStega('About description') },
      indexable: true,
    });
    const serialized = JSON.stringify(meta);
    expect(serialized).not.toMatch(/[\u200b-\u200f\u2060-\u2064\ufeff]/);
    expect(meta.title).toMatchObject({ absolute: 'About | Studio Name' });
    expect(meta.description).toBe('About description');
  });
});
