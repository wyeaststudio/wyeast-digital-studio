import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle [FOUND-R8]', () => {
  it.each([
    ['light', 'Switch to dark theme'],
    ['dark', 'Switch to light theme'],
  ] as const)('in %s mode has the accessible name "%s"', (theme, name) => {
    render(<ThemeToggle resolvedTheme={theme} onToggle={() => {}} />);
    expect(screen.getByRole('button', { name })).toBeInTheDocument();
  });

  it('calls onToggle on click, Enter, and Space', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<ThemeToggle resolvedTheme="light" onToggle={onToggle} />);

    await user.click(screen.getByRole('button'));
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onToggle).toHaveBeenCalledTimes(3);
  });

  it('has a 44px target (size-11)', () => {
    render(<ThemeToggle resolvedTheme="light" onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveClass('size-11');
  });

  it('renders a same-size, hidden placeholder before the theme is known', () => {
    render(<ThemeToggle onToggle={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    const placeholder = screen.getByTestId('theme-toggle-placeholder');
    expect(placeholder).toHaveClass('size-11');
    expect(placeholder).toHaveAttribute('aria-hidden', 'true');
  });
});
