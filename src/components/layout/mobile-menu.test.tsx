import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ctaFixture, navItemsFixture } from './fixtures';
import { MobileMenu } from './mobile-menu';

function Harness({ onOpenChange = () => {} }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <MobileMenu
      items={navItemsFixture}
      cta={ctaFixture}
      currentPath="/services/accessibility"
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpenChange(next);
      }}
      themeSwitch={<div>theme switch</div>}
    />
  );
}

const openMenu = () => screen.getByRole('button', { name: 'Open menu' });

describe('MobileMenu [SHELL-R13, R14, R15]', () => {
  it('has a 44px "Open menu" button that reports its expanded state', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(openMenu()).toHaveClass('size-11');
    expect(openMenu()).toHaveAttribute('aria-expanded', 'false');
    await user.click(openMenu());
    // While the modal is open, everything outside it (including the trigger) is inert.
    expect(screen.getByRole('button', { name: 'Open menu', hidden: true })).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens a dialog named "Menu" with nested links, the CTA, and the theme switch', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(openMenu());

    const dialog = await screen.findByRole('dialog', { name: 'Menu' });
    const nav = within(dialog).getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Accessibility' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'High Performance' })).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Book Appointment' })).toHaveAttribute('href', '/contact');
    expect(within(dialog).getByText('theme switch')).toBeInTheDocument();
  });

  it.each([
    ['"Close menu"', async (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Close menu' }))],
    ['Escape', async (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Escape}')],
    ['a link', async (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('link', { name: 'About' }))],
  ])('closes with %s', async (_name, close) => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);
    await user.click(openMenu());
    await screen.findByRole('dialog');

    await close(user);

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
