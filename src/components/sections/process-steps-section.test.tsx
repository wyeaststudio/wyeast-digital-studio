import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProcessStepsSection } from './process-steps-section';

describe('ProcessStepsSection [PB-R9, PB-R17]', () => {
  it('renders numbered steps in an ol, h3 titles and decorative connecting arrows', () => {
    const { container } = render(<ProcessStepsSection headingId="process" section={{
      _type: 'processStepsSection', _key: 'process', anchor: null, surface: 'background',
      heading: 'Our process', intro: 'A clear path.',
      steps: ['Audit', 'Build', 'Launch'].map((title, index) => ({
        _key: String(index), title, description: `${title} with care.`, icon: 'target',
      })),
    }} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Our process');
    expect(screen.getByText('A clear path.')).toBeInTheDocument();
    const list = screen.getByRole('list');
    expect(list.tagName).toBe('OL');
    const items = within(list).getAllByRole('listitem');
    expect(items.map((item) => within(item).getByRole('heading', { level: 3 }).textContent)).toEqual(['Audit', 'Build', 'Launch']);
    items.forEach((item, index) => expect(item).toHaveTextContent(`Step 0${index + 1}`));
    const arrows = container.querySelectorAll('.lucide-arrow-right');
    expect(arrows).toHaveLength(2);
    arrows.forEach((arrow) => expect(arrow).toHaveAttribute('aria-hidden', 'true'));
  });
});
