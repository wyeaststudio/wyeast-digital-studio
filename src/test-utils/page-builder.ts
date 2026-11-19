import { evaluate, parse } from 'groq-js';
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from '../../sanity.types';
import pages from '../../sanity/seed/pages.json';
import seo from '../../sanity/seed/seo.json';
import { HOME_PAGE_QUERY, PAGE_QUERY } from '@/sanity/queries';

export async function pageBuilderFixtures() {
  const dataset = [...pages, ...seo].map((document) => {
    if (!('sections' in document)) return document;
    return {
      ...document,
      sections: document.sections?.map((section) => section._type === 'heroSection' ? {
        ...section,
        image: {
          ...section.image,
          asset: { _type: 'reference', _ref: 'image-e751ff451df3239abf8b15e64e6168c3182a0624-2400x1350-jpg' },
        },
      } : section),
    };
  });
  const homeResult = await evaluate(parse(HOME_PAGE_QUERY), { dataset });
  const demoResult = await evaluate(parse(PAGE_QUERY), { dataset, params: { slug: 'page-builder-demo' } });
  const home: HOME_PAGE_QUERY_RESULT = await homeResult.get();
  const demo: PAGE_QUERY_RESULT = await demoResult.get();
  if (!home?.sections || !demo?.sections) throw new Error('Page builder seed fixtures are missing');
  return { home, demo };
}
