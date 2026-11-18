import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RichTextSection } from './rich-text-section';
import type { BlockData } from './types';

const section: BlockData<'richTextSection'> = {
  _type: 'richTextSection', _key: 'text', anchor: 'details', surface: 'background', heading: 'More details',
  body: [{
    _type: 'block', _key: 'p', style: 'normal', markDefs: [],
    children: [{ _type: 'span', _key: 's', text: 'Readable content.', marks: [] }],
  }],
};

describe('RichTextSection [PB-R19]', () => {
  it('labels the region with its optional h2 and limits the prose line length', () => {
    render(<RichTextSection section={section} headingId="details-heading" />);
    const region = screen.getByRole('region', { name: 'More details' });
    expect(region).toHaveAttribute('id', 'details');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('More details');
    expect(screen.getByText('Readable content.').parentElement?.parentElement).toHaveClass('max-w-prose');
  });

  it('omits the heading and label when absent', () => {
    const { container } = render(<RichTextSection section={{ ...section, heading: null }} headingId="details-heading" />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(container.querySelector('section')).not.toHaveAttribute('aria-labelledby');
    expect(screen.getByText('Readable content.')).toBeInTheDocument();
  });
});
