import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ctaFixture, navItemsFixture } from './fixtures';
import { SiteHeader } from './site-header';

vi.mock('next/navigation', () => ({ usePathname: () => '/about' }));

describe('SiteHeader [SHELL-R3, R4, R5, R7, R23]', () => {
  it('links the logo home with the site name', () => {
    render(<SiteHeader siteName="Wy'east Digital Studio" navItems={navItemsFixture} cta={ctaFixture} />);
    expect(screen.getByRole('link', { name: "Wy'east Digital Studio, home" })).toHaveAttribute('href', '/');
  });

  it('renders the main nav in order and marks the current page', () => {
    render(<SiteHeader siteName="Site" navItems={navItemsFixture} cta={ctaFixture} />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const entries = [...nav.querySelectorAll(':scope > ul > li > a, :scope > ul > li > button')].map((el) => el.textContent?.trim());
    expect(entries).toEqual(['Home', 'Services', 'About', 'Contact']);
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('renders the CTA as a 44px link', () => {
    render(<SiteHeader siteName="Site" navItems={navItemsFixture} cta={ctaFixture} />);
    const cta = screen.getByRole('link', { name: 'Book Appointment' });
    expect(cta).toHaveAttribute('href', '/contact');
    expect(cta).toHaveClass('h-11');
  });

  it('still renders the logo and theme switch without content', () => {
    render(<SiteHeader siteName="Site" navItems={[]} cta={null} />);
    expect(screen.getByRole('link', { name: 'Site, home' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
  });
});
