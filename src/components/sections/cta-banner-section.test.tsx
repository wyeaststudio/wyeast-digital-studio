import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CtaBannerSection } from './cta-banner-section';
import type { BlockData } from './types';

const section: BlockData<'ctaBannerSection'> = {
  _type: 'ctaBannerSection', _key: 'cta', anchor: 'booking', surface: 'primary',
  heading: 'Have a project in mind?', body: 'Let us build it together.',
  cta: { label: 'Schedule consultation', href: '/contact' },
};

describe('CtaBannerSection [PB-R16]', () => {
  it('labels the rounded panel with its h2 and renders the CTA', () => {
    render(<CtaBannerSection headingId="booking-heading" section={section} />);
    expect(screen.getByRole('region', { name: section.heading! })).toHaveAttribute('id', 'booking');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(section.heading!);
    expect(screen.getByText(section.body!)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Schedule consultation' })).toHaveAttribute('href', '/contact');
  });

  it('skips an unsafe CTA', () => {
    const { container } = render(<CtaBannerSection headingId="cta" section={{
      ...section, cta: { label: 'Unsafe', href: 'javascript:alert(1)' },
    }} />);
    expect(container).toBeEmptyDOMElement();
  });
});
