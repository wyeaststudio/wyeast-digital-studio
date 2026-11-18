import { describe, expect, it } from 'vitest';
import {
  altOrDecorative,
  isValidAnchor,
  isValidHref,
  isValidPageSlug,
  pageSectionsRule,
  seoDescriptionWarning,
  seoTitleWarning,
  uniqueRefs,
} from './validation';

describe('isValidHref [SHELL-R21]', () => {
  it.each(['/', '/about', '/services/web-design#faq', 'https://x.com/a', 'https://www.linkedin.com/company/wyeast'])(
    'accepts %s',
    (href) => expect(isValidHref(href)).toBe(true),
  );

  it.each([
    '',
    'about',
    '//evil.com',
    'http://x.com',
    'mailto:a@b.c',
    'javascript:alert(1)',
    'https://',
    '/has space',
    undefined,
  ])('rejects %s', (href) => expect(isValidHref(href)).toBe(false));
});

describe('seoTitleWarning [SEO-R7]', () => {
  it('accepts titles up to 60 characters and missing titles', () => {
    expect(seoTitleWarning('a'.repeat(60))).toBe(true);
    expect(seoTitleWarning(undefined)).toBe(true);
  });

  it('warns over 60 characters', () => {
    expect(seoTitleWarning('a'.repeat(61))).toEqual(expect.stringContaining('61 now'));
  });
});

describe('seoDescriptionWarning [SEO-R7]', () => {
  it.each([70, 160])('accepts a %i character description', (length) => {
    expect(seoDescriptionWarning('a'.repeat(length))).toBe(true);
  });

  it.each([69, 161])('warns on a %i character description', (length) => {
    expect(seoDescriptionWarning('a'.repeat(length))).toEqual(expect.any(String));
  });

  it.each([undefined, '', '   '])('warns when the description is missing (%j)', (value) => {
    expect(seoDescriptionWarning(value)).toEqual(expect.any(String));
  });
});

describe('uniqueRefs [SEO-R19]', () => {
  it('accepts distinct references and empty lists', () => {
    expect(uniqueRefs([{ _ref: 'a' }, { _ref: 'b' }])).toBe(true);
    expect(uniqueRefs([])).toBe(true);
    expect(uniqueRefs(undefined)).toBe(true);
  });

  it('rejects a repeated reference', () => {
    expect(uniqueRefs([{ _ref: 'a' }, { _ref: 'b' }, { _ref: 'a' }])).toEqual(expect.any(String));
  });
});

describe('isValidPageSlug [PB-R1, PB-R2]', () => {
  it.each(['a', '2026', 'page-builder-demo', 'services', 'about', 'process', 'contact', 'a'.repeat(60)])(
    'accepts the single-segment slug %s',
    (slug) => expect(isValidPageSlug(slug)).toBe(true),
  );

  it.each(['studio', 'api', 'og', 'sitemap.xml', 'robots.txt', 'llms.txt', 'favicon.ico', 'brand', '_next'])(
    'rejects the reserved path %s',
    (slug) => expect(isValidPageSlug(slug)).toBe(false),
  );

  it.each([
    '',
    'a'.repeat(61),
    'About',
    '/about',
    'services/web-design',
    'two words',
    'two--hyphens',
    '-leading',
    'trailing-',
    'under_score',
    'café',
    'about?preview=true',
    'about#team',
    'about\n',
    undefined,
    null,
    123,
  ])('rejects malformed or missing slugs (%j)', (slug) => expect(isValidPageSlug(slug)).toBe(false));
});

describe('isValidAnchor [PB-R11]', () => {
  it.each(['booking', 'next-steps', '2026', 'studio', 'a'.repeat(40)])('accepts %s', (anchor) => {
    expect(isValidAnchor(anchor)).toBe(true);
  });

  it.each(['', 'a'.repeat(41), 'Booking', '#booking', 'book now', 'book/now', 'book_now', 'café', 'booking\n', null, undefined])(
    'rejects unsafe, overlong, or missing anchors (%j)',
    (anchor) => expect(isValidAnchor(anchor)).toBe(false),
  );
});

describe('pageSectionsRule [PB-R9, PB-R11]', () => {
  it('accepts a first hero with distinct anchors or no anchors', () => {
    expect(
      pageSectionsRule([
        { _type: 'heroSection', anchor: 'intro' },
        { _type: 'faqSection', anchor: 'faq' },
        { _type: 'ctaBannerSection' },
        { _type: 'richTextSection' },
      ]),
    ).toBe(true);
  });

  it('accepts pages without a hero, empty arrays, and optional unset sections', () => {
    expect(pageSectionsRule([{ _type: 'faqSection' }])).toBe(true);
    expect(pageSectionsRule([])).toBe(true);
    expect(pageSectionsRule(undefined)).toBe(true);
  });

  it.each([
    [{ _type: 'faqSection' }, { _type: 'heroSection' }],
    [{ _type: 'heroSection' }, { _type: 'heroSection' }],
  ])('rejects a hero outside the first position or a second hero (%j)', (...sections) => {
    expect(pageSectionsRule(sections)).toEqual(expect.stringContaining('hero'));
  });

  it('rejects duplicate anchors across different section types', () => {
    expect(
      pageSectionsRule([
        { _type: 'heroSection', anchor: 'booking' },
        { _type: 'ctaBannerSection', anchor: 'booking' },
      ]),
    ).toEqual(expect.stringContaining('anchor'));
  });

  it('leaves empty anchors and incomplete items to their field validators', () => {
    expect(pageSectionsRule([null, {}, { anchor: '' }, { anchor: '' }])).toBe(true);
    expect(pageSectionsRule([null, { _type: 'heroSection' }])).toEqual(expect.stringContaining('hero'));
  });
});

describe('altOrDecorative [PB-R13, PB-R20]', () => {
  it('accepts meaningful alt text or an explicitly decorative image', () => {
    expect(altOrDecorative({ alt: 'Mount Hood above the clouds' })).toBe(true);
    expect(altOrDecorative({ alt: 'Portrait of the client', decorative: false })).toBe(true);
    expect(altOrDecorative({ decorative: true })).toBe(true);
    expect(altOrDecorative({ alt: '', decorative: true })).toBe(true);
  });

  it.each([{}, { alt: '' }, { alt: ' \n ' }, { alt: 123 }, { decorative: false }, { decorative: 'true' }])(
    'requires alt text unless decorative is explicitly true (%j)',
    (image) => expect(altOrDecorative(image)).toEqual(expect.stringContaining('alt text')),
  );

  it('allows an absent optional image so required fields can use their own rule', () => {
    expect(altOrDecorative(undefined)).toBe(true);
    expect(altOrDecorative(null)).toBe(true);
  });
});
