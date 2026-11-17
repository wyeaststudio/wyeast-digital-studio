import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DesktopNav } from './desktop-nav';
import { navItemsFixture } from './fixtures';

const services = () => screen.getByRole('button', { name: 'Services' });

describe('DesktopNav submenu [SHELL-R5, SHELL-R6]', () => {
  it('opens on click and shows the overview and child links', async () => {
    const user = userEvent.setup();
    render(<DesktopNav items={navItemsFixture} currentPath="/" />);
    expect(services()).toHaveAttribute('aria-expanded', 'false');

    await user.click(services());

    expect(services()).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('link', { name: 'Services overview' })).toHaveAttribute('href', '/services');
    expect(screen.getByRole('link', { name: 'Accessibility' })).toHaveAttribute('href', '/services/accessibility');
  });

  it.each(['{Enter}', ' '])('opens with %s and closes with Escape, returning focus', async (key) => {
    const user = userEvent.setup();
    render(<DesktopNav items={navItemsFixture} currentPath="/" />);
    services().focus();

    await user.keyboard(key);
    expect(services()).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(services()).toHaveAttribute('aria-expanded', 'false');
    expect(services()).toHaveFocus();
  });

  it('marks the parent when a child page is current', () => {
    render(<DesktopNav items={navItemsFixture} currentPath="/services/accessibility" />);
    expect(services()).toHaveAttribute('aria-current', 'true');
  });
});
