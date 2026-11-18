import { describe, expect, it } from 'vitest';
import { isValidHref } from './validation';

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
