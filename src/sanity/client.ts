import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from './env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Next's data cache (via 'use cache' in fetch.ts) handles caching; the CDN would delay webhook revalidation.
  useCdn: false,
  perspective: 'published',
  stega: { studioUrl: '/studio' },
});
