import { describe, expect, it } from 'vitest';
import { isValidHref, seoDescriptionWarning, seoTitleWarning, uniqueRefs } from './validation';

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
