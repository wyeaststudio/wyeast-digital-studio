import type { MetadataRoute } from 'next';
import { buildSitemap } from '@/lib/seo/sitemap';
import { getRoutableDocs, getSiteSeo } from '@/sanity/loaders/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, docs] = await Promise.all([getSiteSeo(), getRoutableDocs()]);
  return buildSitemap(docs, settings?._updatedAt ?? null);
}
