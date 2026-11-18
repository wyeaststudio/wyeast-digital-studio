import { stegaClean } from 'next-sanity';
import type { HOME_FAQS_QUERY_RESULT, OG_DOC_QUERY_RESULT, SITE_SEO_QUERY_RESULT } from '../../../sanity.types';
import { routableTypes } from '@/lib/seo/routes';
import { sanityFetch, sanityFetchPublished } from '../fetch';
import { HOME_FAQS_QUERY, OG_DOC_QUERY, ROUTABLE_DOCS_QUERY, SITE_SEO_QUERY } from '../queries';

export type SiteSeo = NonNullable<SITE_SEO_QUERY_RESULT>;
export type HomeFaq = HOME_FAQS_QUERY_RESULT[number];

/** TypeGen reports `never` until a routable type exists (004+), so the shape is declared here. */
export type RoutableDoc = {
  _type: string;
  slug: string;
  _updatedAt: string;
  title: string | null;
  description: string | null;
};

/** SEO defaults and business details; cleaned of stega (SEO-R6). Null if Sanity is unreachable. */
export async function getSiteSeo({ publishedOnly = false }: { publishedOnly?: boolean } = {}): Promise<SiteSeo | null> {
  try {
    const fetch = publishedOnly ? sanityFetchPublished : sanityFetch;
    return stegaClean(await fetch({ query: SITE_SEO_QUERY, tags: ['siteSettings'] }));
  } catch (error) {
    console.error('Failed to load SEO settings from Sanity', error);
    return null;
  }
}

/** Every published, indexable routable document for the sitemap and llms.txt (SEO-R14, R17). */
export async function getRoutableDocs(): Promise<RoutableDoc[]> {
  const types = routableTypes();
  if (types.length === 0) return [];
  try {
    const docs = await sanityFetch({ query: ROUTABLE_DOCS_QUERY, params: { types }, tags: ['siteSettings', ...types] });
    return stegaClean(docs as RoutableDoc[]);
  } catch (error) {
    console.error('Failed to load routable documents from Sanity', error);
    return [];
  }
}

/** Published title for a document's social card, or null if it is missing or noindex (SEO-R9). */
export async function getOgTitle(type: string, slug: string): Promise<string | null> {
  try {
    const doc: OG_DOC_QUERY_RESULT = await sanityFetchPublished({
      query: OG_DOC_QUERY,
      params: { type, slug },
      tags: [type, `${type}:${slug}`],
    });
    return stegaClean(doc?.title) ?? null;
  } catch (error) {
    console.error(`Failed to load the social card title for ${type}:${slug}`, error);
    return null;
  }
}

/**
 * FAQs for the temporary home section (SEO-R23). Not cleaned: the FAQ component keeps stega for
 * Visual Editing, and the FAQPage JSON-LD builder cleans its own copy.
 */
export async function getHomeFaqs(): Promise<HomeFaq[]> {
  try {
    return await sanityFetch({ query: HOME_FAQS_QUERY, tags: ['faq'] });
  } catch (error) {
    console.error('Failed to load FAQs from Sanity', error);
    return [];
  }
}
