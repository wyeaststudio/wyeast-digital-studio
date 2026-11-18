import type { ClientReturn, QueryParams } from 'next-sanity';
import { cacheLife, cacheTag } from 'next/cache';
import { draftMode } from 'next/headers';
import { client } from './client';
import { getReadToken } from './server-env';

type SanityFetchOptions<Q extends string> = {
  query: Q;
  params?: QueryParams;
  tags: string[];
};

/** Published content only, even when the caller has a draft-mode cookie. */
export async function sanityFetchPublished<const Q extends string>({
  query,
  params = {},
  tags,
}: SanityFetchOptions<Q>): Promise<ClientReturn<Q>> {
  'use cache';
  cacheTag(...tags);
  cacheLife('max');
  return client.fetch(query, params);
}

/**
 * Cache tag convention (revalidated by /api/revalidate on publish):
 * - `<_type>` for collections and singletons, e.g. `page`, `siteSettings`
 * - `<_type>:<slug>` for a single routable document, e.g. `service:web-design`
 */
export async function sanityFetch<const Q extends string>({
  query,
  params = {},
  tags,
}: SanityFetchOptions<Q>): Promise<ClientReturn<Q>> {
  'use cache';
  // Draft mode bypasses 'use cache' automatically, so drafts are always fresh.
  const { isEnabled } = await draftMode();
  if (isEnabled) {
    return client
      .withConfig({
        token: getReadToken(),
        perspective: 'drafts',
        stega: { enabled: true, studioUrl: '/studio' },
      })
      .fetch(query, params);
  }

  return sanityFetchPublished({ query, params, tags });
}
