import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeatureGridSection } from './feature-grid-section';
import type { BlockData } from './types';

const section: BlockData<'featureGridSection'> = {
  _type: 'featureGridSection', _key: 'features', anchor: null, surface: 'background',
  eyebrow: 'Capabilities', heading: 'Built with care', intro: 'Every detail matters.',
  cards: [
    { _key: 'a', icon: 'accessibility', badge: 'A11Y', title: 'Accessibility', description: 'For everyone.',
      link: { label: 'Learn about this capability', href: '/services/accessibility' } },
    { _key: 'b', icon: 'zap', badge: null, title: 'Performance', description: 'Fast by design.', link: null },
  ],
};

describe('FeatureGridSection [PB-R9, PB-R15]', () => {
  it('renders the eyebrow, h2, intro, badges and h3 cards', () => {
    render(<FeatureGridSection section={section} headingId="features" />);
    expect(screen.getByText('Capabilities')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Built with care');
    expect(screen.getByText('Every detail matters.')).toBeInTheDocument();
    expect(screen.getByText('A11Y')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 }).map((node) => node.textContent)).toEqual(['Accessibility', 'Performance']);
    expect(screen.getByText('Fast by design.')).toBeInTheDocument();
  });

  it('adds the card title to the link name, reserves a 44px target and hides its icon', () => {
    render(<FeatureGridSection section={section} headingId="features" />);
    const link = screen.getByRole('link', { name: 'Learn about this capability: Accessibility' });
    expect(link).toHaveAttribute('href', '/services/accessibility');
    expect(link).toHaveClass('min-h-11');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
