import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withStega } from '@/test-utils/stega';
import { Section } from './section';
import { PageHeader } from './page-header';

describe('Section [PB-R8, PB-R10, PB-R11]', () => {
  it.each([
    ['background', 'bg-background', 'text-foreground'],
    ['card', 'bg-card', 'text-card-foreground'],
    ['primary', 'bg-primary', 'text-primary-foreground'],
  ] as const)('labels the %s surface, preserves the edit attribute and cleans the anchor', (surface, bg, fg) => {
    render(
      <Section surface={surface} anchor={withStega('services')} headingId="title" data-sanity="edit">
        <h2 id="title">Our services</h2>
      </Section>,
    );
    const region = screen.getByRole('region', { name: 'Our services' });
    expect(region).toHaveAttribute('id', 'services');
    expect(region).toHaveAttribute('data-sanity', 'edit');
    expect(region).toHaveClass(bg, fg);
  });

  it('does not label a section that has no heading', () => {
    const { container } = render(<Section>Content</Section>);
    expect(container.querySelector('section')).not.toHaveAttribute('aria-labelledby');
  });

  it('provides the fallback page h1 [PB-R9]', () => {
    render(<PageHeader title="About us" />);
    expect(screen.getByRole('heading', { level: 1, name: 'About us' })).toBeInTheDocument();
  });
});
