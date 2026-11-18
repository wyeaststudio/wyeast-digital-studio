import { describe, expect, it } from 'vitest';
import { normalizePath, pathFor, resolvePath, routableTypes, ROUTES } from './routes';

const routes = { landingPage: '/', service: '/services/' };

describe('route registry [SEO-R14]', () => {
  it('starts empty, so only the home page is routable in 003', () => {
    expect(routableTypes()).toEqual([]);
    expect(ROUTES).toEqual({});
  });

  it('builds paths for registered types only', () => {
    expect(pathFor('service', 'web-design', routes)).toBe('/services/web-design');
    expect(pathFor('landingPage', 'about', routes)).toBe('/about');
    expect(pathFor('post', 'hello', routes)).toBeNull();
    expect(pathFor('service', '', routes)).toBeNull();
  });

  it('normalizes query strings, hashes, and trailing slashes', () => {
    expect(normalizePath('/about/?title=x#top')).toBe('/about');
    expect(normalizePath('')).toBe('/');
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('services')).toBe('/services');
  });

  it('resolves home, the most specific prefix, and rejects unknown or nested paths', () => {
    expect(resolvePath('/?v=1', routes)).toEqual({ kind: 'home' });
    expect(resolvePath('/services/web-design', routes)).toEqual({ kind: 'document', type: 'service', slug: 'web-design' });
    expect(resolvePath('/services', routes)).toEqual({ kind: 'document', type: 'landingPage', slug: 'services' });
    expect(resolvePath('/a/b/c', routes)).toBeNull();
    expect(resolvePath('/about')).toBeNull();
  });
});
