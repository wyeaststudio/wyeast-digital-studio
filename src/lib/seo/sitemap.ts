import type { MetadataRoute } from 'next';
import type { RoutableDoc } from '@/sanity/loaders/seo';
import { absoluteUrl } from './site';
import { pathFor, ROUTES, type RouteRegistry } from './routes';

/** Indexable Home first, then every routable document with a registered path. URLs are unique. */
export function buildSitemap(
  docs: RoutableDoc[],
  settingsUpdatedAt: string | null,
  { routes = ROUTES, homeNoindex = false }: { routes?: RouteRegistry; homeNoindex?: boolean } = {},
): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  const add = (entry: MetadataRoute.Sitemap[number]) => {
    if (seen.has(entry.url)) return;
    seen.add(entry.url);
    entries.push(entry);
  };

  if (!homeNoindex) {
    add({
      url: absoluteUrl('/'),
      lastModified: settingsUpdatedAt ?? undefined,
      changeFrequency: 'monthly',
      priority: 1,
    });
  }

  for (const doc of docs) {
    const path = pathFor(doc._type, doc.slug, routes);
    if (path === null) continue;
    add({ url: absoluteUrl(path), lastModified: doc._updatedAt, priority: 0.8 });
  }

  return entries;
}
