import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TestimonialsSection } from './testimonials-section';
import type { BlockData } from './types';

const section: BlockData<'testimonialsSection'> = {
  _type: 'testimonialsSection', _key: 'quotes', anchor: null, surface: 'card', heading: 'Client stories',
  items: [{
    _id: 'one', name: 'Example client', quote: 'Placeholder: thoughtful work.', role: 'Owner', company: 'Example company',
    photo: {
      asset: { _type: 'reference', _ref: 'image-example-2400x1350-jpg' },
      alt: 'Example portrait', hotspot: null, crop: null,
    },
  }],
};

describe('TestimonialsSection [PB-R20]', () => {
  it('renders a quote with semantic attribution and an optimized, lazy, square photo', () => {
    const { container } = render(<TestimonialsSection section={section} headingId="stories" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Client stories');
    const figure = container.querySelector('figure');
    expect(figure?.querySelector('blockquote > p')).toHaveTextContent('Placeholder: thoughtful work.');
    expect(figure?.querySelector('figcaption')).toHaveTextContent('Example clientOwner, Example company');
    const photo = screen.getByRole('img', { name: 'Example portrait' });
    expect(photo).toHaveAttribute('width', '80');
    expect(photo).toHaveAttribute('height', '80');
    expect(photo).toHaveAttribute('loading', 'lazy');
    expect(photo.getAttribute('srcset')).toContain('auto=format');
  });

  it('renders without optional fields and drops incomplete testimonials', () => {
    const { container } = render(<TestimonialsSection section={{
      ...section, heading: null,
      items: [
        { ...section.items![0], photo: null, role: null, company: null },
        { ...section.items![0], _id: 'missing-name', name: null },
        // @ts-expect-error A deleted reference can be null at runtime.
        null,
      ],
    }} headingId="stories" />);
    expect(container.querySelectorAll('figure')).toHaveLength(1);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Example client')).toBeInTheDocument();
  });
});
