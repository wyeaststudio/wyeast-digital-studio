import { describe, expect, it } from 'vitest';
import { sanityImageLoader, urlForImage } from './sanity-image';

describe('Sanity images [PB-R13]', () => {
  it('crops towards the hotspot and preserves that crop across responsive widths', () => {
    const src = urlForImage({
      asset: { _ref: 'image-example-2400x1350-jpg' },
      hotspot: { x: 0.8, y: 0.5, width: 0.1, height: 0.1 },
    }).width(800).height(800).fit('crop').url();
    const url = new URL(sanityImageLoader({ src, width: 400, quality: 80 }));
    expect(url.searchParams.get('rect')).toBe('1050,0,1350,1350');
    expect(url.searchParams.get('w')).toBe('400');
    expect(url.searchParams.get('h')).toBe('400');
    expect(url.searchParams.get('q')).toBe('80');
    expect(url.searchParams.get('auto')).toBe('format');
  });

  it('uses the editor crop and default quality without inventing a height', () => {
    const src = urlForImage({
      asset: { _ref: 'image-example-2400x1350-jpg' },
      crop: { left: 0.25, right: 0, top: 0, bottom: 0 },
    }).url();
    const url = new URL(sanityImageLoader({ src, width: 600 }));
    expect(url.searchParams.get('rect')).toBe('600,0,1800,1350');
    expect(url.searchParams.get('q')).toBe('75');
    expect(url.searchParams.has('h')).toBe(false);
  });
});
