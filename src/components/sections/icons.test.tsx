import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withStega } from '@/test-utils/stega';
import { Icon } from './icons';

describe('Icon [PB-R12]', () => {
  it('renders decorative icons, including stega-encoded names', () => {
    const { container } = render(<Icon name={withStega('accessibility')} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).toHaveAttribute('focusable', 'false');
  });

  it.each(['unknown', '__proto__', null])('skips unknown name %s', (name) => {
    const { container } = render(<Icon name={name} />);
    expect(container).toBeEmptyDOMElement();
  });
});
