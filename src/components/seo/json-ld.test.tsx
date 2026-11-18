import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { JsonLd } from './json-ld';

describe('JsonLd [SEO-R12]', () => {
  it('renders a JSON-LD script that parses back to the data', () => {
    const data = { '@context': 'https://schema.org', '@type': 'WebSite', name: '</script>Studio' };
    const { container } = render(<JsonLd data={data} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script?.innerHTML).not.toContain('<');
    expect(JSON.parse(script?.textContent ?? '')).toEqual(data);
  });

  it('renders nothing for null data', () => {
    const { container } = render(<JsonLd data={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
