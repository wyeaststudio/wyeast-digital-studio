import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SiteFooterProps } from './site-footer';
import { SiteFooter } from './site-footer';

const full: SiteFooterProps = {
  siteName: "Wy'east Digital Studio",
  year: 2027,
  footerLinks: [
    { key: 'about', label: 'About', href: '/about' },
    { key: 'contact', label: 'Contact', href: '/contact' },
  ],
  contact: {
    email: { label: 'hello@example.com', href: 'mailto:hello@example.com' },
    phone: { label: '(503) 555-0100', href: 'tel:5035550100' },
    serviceArea: 'Portland, Oregon and the Pacific Northwest',
  },
  socialLinks: [{ key: 'li', platform: 'linkedin', href: 'https://www.linkedin.com/company/example' }],
};

const empty: SiteFooterProps = {
  siteName: "Wy'east Digital Studio",
  year: 2027,
  footerLinks: [],
  contact: { email: null, phone: null, serviceArea: null },
  socialLinks: [],
};

describe('SiteFooter [SHELL-R17, R18, R19, R23]', () => {
  it('renders the footer nav, contact details in an address, and social links', () => {
    render(<SiteFooter {...full} />);

    const nav = screen.getByRole('navigation', { name: 'Footer' });
    expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual(['About', 'Contact']);

    const address = screen.getByText('Portland, Oregon and the Pacific Northwest').closest('address');
    expect(address).not.toBeNull();
    expect(within(address!).getByRole('link', { name: 'hello@example.com' })).toHaveAttribute('href', 'mailto:hello@example.com');
    expect(within(address!).getByRole('link', { name: '(503) 555-0100' })).toHaveAttribute('href', 'tel:5035550100');

    expect(screen.getByRole('link', { name: "Wy'east Digital Studio on LinkedIn" })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/company/example',
    );
  });

  it('shows the copyright with the given year and site name', () => {
    render(<SiteFooter {...full} />);
    expect(screen.getByText("© 2027 Wy'east Digital Studio. All rights reserved.")).toBeInTheDocument();
  });

  it('renders only the logo and copyright when there is no content', () => {
    const { container } = render(<SiteFooter {...empty} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(container.querySelector('address')).toBeNull();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
