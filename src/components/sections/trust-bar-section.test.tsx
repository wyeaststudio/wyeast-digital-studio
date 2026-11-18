import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TrustBarSection } from './trust-bar-section';

describe('TrustBarSection [PB-R14]', () => {
  it('renders the statements as an ordered-in-DOM list with decorative icons', () => {
    render(<TrustBarSection headingId="trust" section={{
      _type: 'trustBarSection', _key: 'trust', anchor: 'trust', surface: 'primary',
      items: [
        { _key: 'speed', icon: 'zap', text: 'Fast by design' },
        { _key: 'access', icon: 'accessibility', text: 'Accessible to everyone' },
      ],
    }} />);
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual(['Fast by design', 'Accessible to everyone']);
    expect(items[0].querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
