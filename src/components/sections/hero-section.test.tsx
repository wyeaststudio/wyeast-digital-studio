import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroSection } from './hero-section';
import type { BlockData } from './types';

const hero: BlockData<'heroSection'> = {
  _type: 'heroSection', _key: 'hero', anchor: null, surface: null,
  eyebrow: 'Crafted here', heading: 'Where Vision Meets the Summit', body: 'Built for your goals.',
  showLockup: true,
  primaryCta: { label: 'Book a call', href: '/contact' },
  secondaryCta: { label: 'Explore services', href: '/services' },
  image: {
    asset: { _type: 'reference', _ref: 'image-example-2400x1350-jpg' },
    alt: 'Mount Hood at sunrise', decorative: false, crop: null, hotspot: null, dimensions: null,
    lqip: 'data:image/jpeg;base64,example',
  },
};

describe('HeroSection [PB-R9, PB-R13]', () => {
  it('renders the h1, body, lockup and two CTAs', () => {
    const { container } = render(<HeroSection section={hero} headingId="hero-heading" />);
    expect(screen.getByRole('region', { name: hero.heading! })).toContainElement(screen.getByRole('heading', { level: 1 }));
    expect(screen.getByText('Crafted here')).toBeInTheDocument();
    expect(screen.getByText('Built for your goals.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book a call' })).toHaveAttribute('href', '/contact');
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('preloads art-directed responsive images, with eager loading, high priority and an LQIP background', () => {
    const { container } = render(<HeroSection section={hero} headingId="hero-heading" />);
    const image = screen.getByAltText('Mount Hood at sunrise');
    expect(image).toHaveAttribute('sizes', '100vw');
    expect(image).toHaveAttribute('fetchpriority', 'high');
    expect(image).toHaveAttribute('loading', 'eager');
    expect(image.getAttribute('srcset')).toContain('auto=format');
    expect(image).toHaveStyle({ position: 'absolute', height: '100%', width: '100%' });
    expect(container.querySelectorAll('link[rel="preload"][media]')).toHaveLength(2);
    expect(container.querySelector('source')).toHaveAttribute('media', '(width >= 64rem)');
    expect(container.querySelector('[style*="background-image"]')).toHaveStyle({
      backgroundImage: 'url("data:image/jpeg;base64,example")',
    });
  });

  it('uses empty alt for decorative images, omits absent optional content and unsafe CTAs', () => {
    const { container } = render(<HeroSection section={{
      ...hero, showLockup: false, eyebrow: null, body: null,
      image: { ...hero.image!, decorative: true, lqip: null },
      primaryCta: { label: 'Unsafe', href: 'javascript:alert(1)' }, secondaryCta: null,
    }} headingId="hero-heading" />);
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
