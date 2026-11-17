import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeSwitch } from './theme-switch';

const NAMES = ['Light theme', 'System theme', 'Dark theme'];

describe('ThemeSwitch [SHELL-R11, SHELL-R12]', () => {
  it('is a group labelled "Theme" with three named options, each 44px', () => {
    render(<ThemeSwitch value="system" onChange={() => {}} />);
    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    for (const name of NAMES) {
      expect(screen.getByRole('button', { name })).toHaveClass('size-11');
    }
  });

  it('exposes the selected option as pressed', () => {
    render(<ThemeSwitch value="dark" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Dark theme' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Light theme' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with the chosen option from pointer and keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ThemeSwitch value="light" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Dark theme' }));
    screen.getByRole('button', { name: 'System theme' }).focus();
    await user.keyboard('{Enter}');

    expect(onChange.mock.calls).toEqual([['dark'], ['system']]);
  });

  it('keeps the current choice when the pressed option is pressed again', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ThemeSwitch value="light" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Light theme' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders the same-size options, disabled, until the theme is known', () => {
    render(<ThemeSwitch onChange={() => {}} />);
    for (const name of NAMES) {
      const option = screen.getByRole('button', { name });
      expect(option).toHaveClass('size-11');
      expect(option).toBeDisabled();
    }
  });
});
