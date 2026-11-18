import { describe, expect, it } from 'vitest';
import { withStega } from '@/test-utils/stega';
import { fnv1a, ogCardPath, resolveOgImage } from './og';
import { SITE_URL } from './site';

const upload = {
  asset: { _ref: 'image-abc123-2400x1260-png' },
  hotspot: { x: 0.5, y: 0.5, width: 1, height: 1 },
  alt: 'Team at work',
};

describe('resolveOgImage [SEO-R8]', () => {
  it('uses the page upload, cropped to 1200×630, with the editor’s alt text', () => {
    const image = resolveOgImage({ title: 'About', siteName: 'Studio', path: '/about', seoImage: upload });
    expect(image.url).toMatch(/^https:\/\/cdn\.sanity\.io\/images\/test1234\/production\/abc123-2400x1260\.png\?/);
    expect(image.url).toContain('w=1200');
    expect(image.url).toContain('h=630');
    expect(image.url).toContain('fit=crop');
    expect(image).toMatchObject({ width: 1200, height: 630, alt: 'Team at work' });
  });

  it('falls back to the site default upload, and to "{title}, {siteName}" when it has no alt', () => {
    const image = resolveOgImage({
      title: 'About',
      siteName: 'Studio',
      path: '/about',
      seoImage: null,
      defaultImage: { ...upload, alt: null },
    });
    expect(image.url).toContain('cdn.sanity.io');
    expect(image.alt).toBe('About, Studio');
  });

  it('generates a versioned card URL when there is no upload', () => {
    const image = resolveOgImage({ title: 'About', siteName: 'Studio', path: '/about' });
    expect(image.url).toBe(`${SITE_URL}/og/about?v=${fnv1a('About\u0000Studio')}`);
    expect(image.alt).toBe('About, Studio');
    expect(resolveOgImage({ title: 'Home', siteName: 'Studio', path: '/' }).url).toMatch(`${SITE_URL}/og?v=`);
  });

  it('changes the version when the title changes', () => {
    const a = resolveOgImage({ title: 'About', siteName: 'Studio', path: '/about' }).url;
    const b = resolveOgImage({ title: 'About us', siteName: 'Studio', path: '/about' }).url;
    expect(a).not.toBe(b);
  });

  it('ignores stega in titles, so draft mode does not change the version or alt', () => {
    const clean = resolveOgImage({ title: 'About', siteName: 'Studio', path: '/about' });
    expect(resolveOgImage({ title: withStega('About'), siteName: withStega('Studio'), path: '/about' })).toEqual(clean);
  });

  it('maps the home page to /og', () => {
    expect(ogCardPath('/')).toBe('/og');
    expect(ogCardPath('/services/web-design')).toBe('/og/services/web-design');
  });
});
