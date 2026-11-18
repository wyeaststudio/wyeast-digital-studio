import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FaqAnswer } from '../../../sanity.types';
import { RichText } from './rich-text';

const block = (key: string, children: object[], extra: object = {}) => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children,
  ...extra,
});

const span = (key: string, text: string, marks: string[] = []) => ({ _type: 'span', _key: key, text, marks });

const fixture = (...blocks: object[]) => blocks as unknown as FaqAnswer;

describe('RichText [SEO-R21]', () => {
  it('renders paragraphs with strong and em marks', () => {
    const { container } = render(
      <RichText
        value={fixture(
          block('p1', [span('s1', 'Plain '), span('s2', 'bold', ['strong']), span('s3', ' and '), span('s4', 'italic', ['em'])]),
        )}
      />,
    );

    const paragraph = container.querySelector('p');
    expect(paragraph?.textContent).toBe('Plain bold and italic');
    expect(paragraph?.querySelector('strong')?.textContent).toBe('bold');
    expect(paragraph?.querySelector('em')?.textContent).toBe('italic');
  });

  it('renders bullet and numbered lists with list items', () => {
    const { container } = render(
      <RichText
        value={fixture(
          block('b1', [span('s1', 'First bullet')], { listItem: 'bullet', level: 1 }),
          block('b2', [span('s2', 'Second bullet')], { listItem: 'bullet', level: 1 }),
          block('n1', [span('s3', 'First step')], { listItem: 'number', level: 1 }),
        )}
      />,
    );

    const ul = container.querySelector('ul');
    expect(ul).toHaveClass('list-disc');
    expect(Array.from(ul!.querySelectorAll('li')).map((li) => li.textContent)).toEqual(['First bullet', 'Second bullet']);

    const ol = container.querySelector('ol');
    expect(ol).toHaveClass('list-decimal');
    expect(Array.from(ol!.querySelectorAll('li')).map((li) => li.textContent)).toEqual(['First step']);
  });

  it('renders an internal link as an anchor to the path', () => {
    render(
      <RichText
        value={fixture(
          block('p1', [span('s1', 'See '), span('s2', 'our story', ['l1'])], {
            markDefs: [{ _key: 'l1', _type: 'link', href: '/about' }],
          }),
        )}
      />,
    );

    const link = screen.getByRole('link', { name: 'our story' });
    expect(link).toHaveAttribute('href', '/about');
    expect(link).toHaveClass('underline', 'underline-offset-4');
    expect(link).not.toHaveAttribute('target');
  });

  it('renders an external link with noopener noreferrer', () => {
    render(
      <RichText
        value={fixture(
          block('p1', [span('s1', 'Visit', ['l1'])], {
            markDefs: [{ _key: 'l1', _type: 'link', href: 'https://example.com' }],
          }),
        )}
      />,
    );

    const link = screen.getByRole('link', { name: 'Visit' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the text of a link with an invalid href without an anchor', () => {
    const { container } = render(
      <RichText
        value={fixture(
          block('p1', [span('s1', 'Click', ['l1'])], {
            markDefs: [{ _key: 'l1', _type: 'link', href: 'javascript:alert(1)' }],
          }),
        )}
      />,
    );

    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('p')?.textContent).toBe('Click');
  });

  it('drops an unknown mark but keeps its text', () => {
    const { container } = render(
      <RichText value={fixture(block('p1', [span('s1', 'Highlighted', ['highlight'])]))} />,
    );

    const paragraph = container.querySelector('p');
    expect(paragraph?.textContent).toBe('Highlighted');
    expect(paragraph?.children).toHaveLength(0);
  });

  it('renders nothing for an unknown block type', () => {
    const { container } = render(
      <RichText
        value={fixture({ _type: 'image', _key: 'img1', asset: { _ref: 'image-abc-1x1-jpg', _type: 'reference' } })}
      />,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('div')?.children).toHaveLength(0);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty array', []],
  ])('renders nothing for %s', (_label, value) => {
    const { container } = render(<RichText value={value as FaqAnswer | null | undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
