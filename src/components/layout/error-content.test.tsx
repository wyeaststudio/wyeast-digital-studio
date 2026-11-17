import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import GlobalError from '@/app/global-error';
import { ErrorContent } from './error-content';

vi.mock('@/app/fonts', () => ({
  montserratAlternates: { variable: 'font-montserrat' },
  playfairDisplay: { variable: 'font-playfair' },
}));

describe('ErrorContent [SHELL-R25]', () => {
  it('shows the heading and a home link, and retries on "Try again"', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorContent onRetry={onRetry} digest="abc123" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Reference: abc123')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe('GlobalError [SHELL-R25, SHELL-R26]', () => {
  // next-themes reads the OS preference; jsdom doesn't implement matchMedia.
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));

  it('renders a standalone document with a title, the heading, and the retry button, but not the error message', () => {
    const error = Object.assign(new Error('secret database password leaked'), { digest: 'd1' });
    const html = renderToStaticMarkup(<GlobalError error={error} unstable_retry={() => {}} />);

    expect(html).toMatch(/^<html lang="en"/);
    expect(html).toContain("<title>Something went wrong | Wy&#x27;east Digital Studio</title>");
    expect(html).toContain('<h1 class="text-4xl font-bold">Something went wrong</h1>');
    expect(html).toContain('Try again');
    expect(html).not.toContain('secret database password');
  });
});
