import { describe, expect, it } from 'vitest';
import type { FaqAnswer } from '../../../sanity.types';
import type { HomeFaq } from '@/sanity/loaders/seo';
import { withStega } from '@/test-utils/stega';
import { SITE_URL, absoluteUrl, resolveSite, type ResolvedSite } from './site';
import { breadcrumbList, compact, faqPage, serializeJsonLd, siteGraph } from './json-ld';

const site: ResolvedSite = {
  siteName: "Wy'east Digital Studio",
  homeTitle: "Wy'east Digital Studio | Accessible Websites in Portland, OR",
  description: 'Accessible websites for Portland businesses.',
  businessDescription: 'A Portland, Oregon web studio.',
  email: 'hello@example.com',
  phone: '(503) 555-0100',
  serviceArea: null,
  addressLocality: 'Portland',
  addressRegion: 'OR',
  addressCountry: 'US',
  areaServed: ['Portland, Oregon', 'Pacific Northwest'],
  socialLinks: [{ platform: 'linkedin', url: 'https://www.linkedin.com/company/example' }],
  defaultOgImage: null,
  updatedAt: null,
};

const bare: ResolvedSite = {
  ...site,
  email: null,
  phone: null,
  areaServed: [],
  socialLinks: [],
};

const block = (key: string, text: string, extra: object = {}): FaqAnswer[number] => ({
  _type: 'block',
  _key: key,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: `${key}-s`, text, marks: [] }],
  ...extra,
});

const faqs: HomeFaq[] = [
  {
    _id: 'faq-1',
    question: 'How long does a site take?',
    answer: [block('a1', 'Most sites launch in six to eight weeks.')],
  },
  {
    _id: 'faq-2',
    question: 'What is included?',
    answer: [
      {
        _type: 'block',
        _key: 'a2',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        markDefs: [{ _type: 'link', _key: 'l1', href: 'https://example.com/plans' }],
        children: [
          { _type: 'span', _key: 'a2-s1', text: 'Design and ', marks: [] },
          { _type: 'span', _key: 'a2-s2', text: 'a content model', marks: ['l1'] },
        ],
      },
      {
        _type: 'block',
        _key: 'a3',
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        markDefs: [],
        children: [{ _type: 'span', _key: 'a3-s', text: 'Hosting setup', marks: [] }],
      },
    ],
  },
  { _id: 'faq-3', question: 'No answer yet', answer: null },
  { _id: 'faq-4', question: '   ', answer: [block('a4', 'Orphan answer.')] },
];

function nodesOf(data: ReturnType<typeof siteGraph>) {
  return data['@graph'];
}

function hasEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value)) return value.length === 0 || value.some(hasEmptyValue);
  if (typeof value === 'object') return Object.values(value).some(hasEmptyValue);
  return false;
}

describe('siteGraph [SEO-R10]', () => {
  it('builds the business and website nodes from the site settings', () => {
    const graph = siteGraph(site);

    expect(graph['@context']).toBe('https://schema.org');
    expect(nodesOf(graph)).toEqual([
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE_URL}/#business`,
        name: "Wy'east Digital Studio",
        url: absoluteUrl('/'),
        logo: `${SITE_URL}/brand/logo.png`,
        image: `${SITE_URL}/brand/logo.png`,
        description: 'A Portland, Oregon web studio.',
        email: 'hello@example.com',
        telephone: '(503) 555-0100',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Portland',
          addressRegion: 'OR',
          addressCountry: 'US',
        },
        areaServed: [
          { '@type': 'Place', name: 'Portland, Oregon' },
          { '@type': 'Place', name: 'Pacific Northwest' },
        ],
        sameAs: ['https://www.linkedin.com/company/example'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: absoluteUrl('/'),
        name: "Wy'east Digital Studio",
        description: 'Accessible websites for Portland businesses.',
        inLanguage: 'en-US',
        publisher: { '@id': `${SITE_URL}/#business` },
      },
    ]);
  });

  it('gives the address locality and region only, with no street', () => {
    const [business] = nodesOf(siteGraph(site)) as Array<{ address: Record<string, unknown> }>;
    expect(business.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Portland',
      addressRegion: 'OR',
      addressCountry: 'US',
    });
    expect(business.address).not.toHaveProperty('streetAddress');
  });

  it('omits empty email, telephone, areaServed, and sameAs', () => {
    const [business] = nodesOf(siteGraph(bare)) as Array<Record<string, unknown>>;
    expect(business).not.toHaveProperty('email');
    expect(business).not.toHaveProperty('telephone');
    expect(business).not.toHaveProperty('areaServed');
    expect(business).not.toHaveProperty('sameAs');
  });

  it('produces a valid graph from resolveSite(null) with no empty values', () => {
    const graph = siteGraph(resolveSite(null));
    expect(nodesOf(graph).map((node) => node['@type'])).toEqual(['ProfessionalService', 'WebSite']);
    expect(hasEmptyValue(graph)).toBe(false);
    expect(nodesOf(graph)[0]).not.toHaveProperty('email');
    expect(nodesOf(graph)[0]).not.toHaveProperty('telephone');
  });

  it('strips stega from every string', () => {
    const stegaSite: ResolvedSite = {
      ...site,
      siteName: withStega("Wy'east Digital Studio"),
      email: withStega('hello@example.com'),
      areaServed: [withStega('Portland, Oregon'), withStega('Pacific Northwest')],
    };
    expect(siteGraph(stegaSite)).toEqual(siteGraph(site));
  });
});

describe('breadcrumbList [SEO-R11]', () => {
  it('numbers the items from 1 with absolute URLs', () => {
    expect(
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'Web design', path: '/services/web-design?ref=nav' },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/services` },
        { '@type': 'ListItem', position: 3, name: 'Web design', item: `${SITE_URL}/services/web-design` },
      ],
    });
  });

  it('returns null for an empty trail', () => {
    expect(breadcrumbList([])).toBeNull();
  });

  it('cleans stega from names', () => {
    const crumbs = breadcrumbList([{ name: withStega('Services'), path: '/services' }]);
    expect(crumbs?.itemListElement[0].name).toBe('Services');
  });
});

describe('faqPage [SEO-R11, R13]', () => {
  it('reduces Portable Text answers to plain text', () => {
    expect(faqPage(faqs)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How long does a site take?',
          acceptedAnswer: { '@type': 'Answer', text: 'Most sites launch in six to eight weeks.' },
        },
        {
          '@type': 'Question',
          name: 'What is included?',
          acceptedAnswer: { '@type': 'Answer', text: 'Design and a content model Hosting setup' },
        },
      ],
    });
  });

  it('returns null when no FAQ has both a question and an answer', () => {
    expect(faqPage([faqs[2], faqs[3]])).toBeNull();
    expect(faqPage([])).toBeNull();
  });

  it('cleans stega from questions and answers', () => {
    const stega: HomeFaq[] = [
      {
        _id: 'faq-s',
        question: withStega('How long does a site take?'),
        answer: [block('s1', withStega('Most sites launch in six to eight weeks.'))],
      },
    ];
    expect(faqPage(stega)).toEqual(faqPage([{ ...faqs[0], _id: 'faq-s' }]));
  });
});

describe('serializeJsonLd [SEO-R12]', () => {
  it('escapes < so a name cannot close the script element', () => {
    const data = { name: '</script><script>alert(1)</script>' };
    const json = serializeJsonLd(data);
    expect(json).not.toContain('<');
    expect(json).toContain('\\u003c/script>');
    expect(JSON.parse(json)).toEqual(data);
  });
});

describe('compact', () => {
  it('removes nested empty values and keeps falsy non-empty values', () => {
    expect(
      compact({
        a: null,
        b: undefined,
        c: '',
        d: [],
        e: {},
        f: { g: null, h: 'kept' },
        i: [null, { j: '' }, 'kept'],
        k: 0,
        l: false,
      }),
    ).toEqual({ f: { h: 'kept' }, i: ['kept'], k: 0, l: false });
  });
});
