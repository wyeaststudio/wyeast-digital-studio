import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT, PAGE_SLUGS_QUERY_RESULT } from '../../../sanity.types';
import { sanityFetch, sanityFetchPublished } from '../fetch';
import { HOME_PAGE_QUERY, PAGE_QUERY, PAGE_SLUGS_QUERY } from '../queries';

export async function getHomePage({ publishedOnly = false }: { publishedOnly?: boolean } = {}): Promise<HOME_PAGE_QUERY_RESULT> {
  try {
    const fetch = publishedOnly ? sanityFetchPublished : sanityFetch;
    return await fetch({ query: HOME_PAGE_QUERY, tags: ['homePage', 'faq', 'testimonial'] });
  } catch (error) {
    console.error('Failed to load the home page from Sanity', error);
    return null;
  }
}

export async function getPage(slug: string): Promise<PAGE_QUERY_RESULT> {
  try {
    return await sanityFetch({ query: PAGE_QUERY, params: { slug }, tags: ['page', `page:${slug}`, 'faq', 'testimonial'] });
  } catch (error) {
    console.error(`Failed to load page "${slug}" from Sanity`, error);
    return null;
  }
}

export async function getPageSlugs(): Promise<PAGE_SLUGS_QUERY_RESULT> {
  try {
    return await sanityFetch({ query: PAGE_SLUGS_QUERY, tags: ['page'] });
  } catch (error) {
    console.error('Failed to load page slugs from Sanity', error);
    return [];
  }
}
