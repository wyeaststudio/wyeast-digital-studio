import { describe, expect, it } from 'vitest';
import { isCurrentPath, itemIsCurrent } from './is-current-path';

describe('isCurrentPath [SHELL-R5]', () => {
  it.each([
    ['/', '/', true],
    ['/', '/about', false],
    ['/about', '/about', true],
    ['/about', '/about/', true],
    ['/services', '/services/web-design', true],
    ['/service', '/services', false],
    ['/about#team', '/about', true],
    ['https://x.com/about', '/about', false],
    [null, '/', false],
  ] as const)('href %s on %s → %s', (href, current, expected) => {
    expect(isCurrentPath(href, current)).toBe(expected);
  });

  it('marks a parent item when one of its children is current', () => {
    const services = {
      key: 's',
      label: 'Services',
      href: null,
      children: [{ key: 'a', label: 'Accessibility', href: '/services/accessibility' }],
    };
    expect(itemIsCurrent(services, '/services/accessibility')).toBe(true);
    expect(itemIsCurrent(services, '/about')).toBe(false);
  });
});
