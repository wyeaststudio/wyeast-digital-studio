import { describe, expect, it } from 'vitest';
import { DEFAULT_SITE_NAME, toShellProps } from './shell-props';

describe('toShellProps [SHELL-R21, SHELL-R23]', () => {
  it('returns an empty but working shell when content is missing', () => {
    expect(toShellProps(null)).toEqual({
      siteName: DEFAULT_SITE_NAME,
      navItems: [],
      cta: null,
      footerLinks: [],
      contact: { email: null, phone: null, serviceArea: null },
      socialLinks: [],
    });
  });

  it('drops entries without a label or a valid href, and keeps parents that only have children', () => {
    const props = toShellProps({
      settings: null,
      navigation: {
        headerLinks: [
          { _key: 'a', label: 'About', href: '/about', children: null },
          { _key: 'b', label: null, href: '/x', children: null },
          { _key: 'c', label: 'Bad', href: 'javascript:alert(1)', children: null },
          {
            _key: 'd',
            label: 'Services',
            href: null,
            children: [
              { _key: 'd1', label: 'Accessibility', href: '/services/accessibility' },
              { _key: 'd2', label: 'Broken', href: 'nope' },
            ],
          },
        ],
        headerCta: { label: 'Book', href: '/contact' },
        footerLinks: [{ _key: 'f', label: 'Contact', href: '/contact' }],
      },
    });

    expect(props.navItems.map((item) => item.label)).toEqual(['About', 'Services']);
    expect(props.navItems[1].children).toEqual([
      { key: 'd1', label: 'Accessibility', href: '/services/accessibility' },
    ]);
    expect(props.cta).toEqual({ key: 'cta', label: 'Book', href: '/contact' });
    expect(props.footerLinks).toHaveLength(1);
  });

  it('builds mailto: and tel: hrefs from the contact details', () => {
    const { contact } = toShellProps({
      settings: { siteName: 'Studio', email: 'hi@example.com', phone: '(503) 555-0100', serviceArea: 'Portland', socialLinks: null },
      navigation: null,
    });
    expect(contact.email).toEqual({ label: 'hi@example.com', href: 'mailto:hi@example.com' });
    expect(contact.phone).toEqual({ label: '(503) 555-0100', href: 'tel:5035550100' });
  });
});
