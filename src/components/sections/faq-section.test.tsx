import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FaqSection, type FaqItem } from './faq-section';

const answer = (text: string): FaqItem['answer'] => [
  {
    _key: 'b1',
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _key: 's1', _type: 'span', marks: [], text }],
  },
];

const items: FaqItem[] = ['One?', 'Two?', 'Three?', 'Four?', 'Five?'].map((question, index) => ({
  _id: `faq-${index}`,
  question,
  answer: answer(`Answer ${index + 1}.`),
}));

describe('FaqSection [SEO-R20, R22]', () => {
  it('renders a labelled section with the eyebrow, an h2, and the intro', () => {
    render(<FaqSection eyebrow="FAQ" heading="Frequently Asked Questions" intro="Common queries." items={items} />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Frequently Asked Questions' });
    expect(screen.getByRole('region', { name: 'Frequently Asked Questions' })).toContainElement(heading);
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Common queries.')).toBeInTheDocument();
  });

  it('keeps DOM order across the two columns, first half then second half', () => {
    const { container } = render(<FaqSection heading="FAQ" items={items} />);
    const columns = container.querySelectorAll('.grid > div');
    expect(columns).toHaveLength(2);
    expect([...columns[0].querySelectorAll('summary')].map((s) => s.textContent)).toEqual(['One?', 'Two?', 'Three?']);
    expect([...columns[1].querySelectorAll('summary')].map((s) => s.textContent)).toEqual(['Four?', 'Five?']);
  });

  it('renders every item collapsed, with its answer already in the markup', () => {
    const { container } = render(<FaqSection heading="FAQ" items={items} />);
    const details = [...container.querySelectorAll('details')];
    expect(details).toHaveLength(5);
    expect(details.every((d) => !d.open)).toBe(true);
    expect(details[0].textContent).toContain('Answer 1.');
  });

  it('renders nothing without items', () => {
    const { container } = render(<FaqSection heading="FAQ" items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('omits the optional eyebrow and intro', () => {
    render(<FaqSection heading="FAQ heading" items={items.slice(0, 1)} />);
    expect(screen.queryByText('FAQ')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('FAQ heading');
  });
});
