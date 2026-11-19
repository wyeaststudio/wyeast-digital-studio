import type { MetadataRoute } from 'next';
import { buildSitemap } from '@/lib/seo/sitemap';
import { getRoutableDocs, getSiteSeo } from '@/sanity/loaders/seo';
import { getHomePage } from '@/sanity/loaders/pages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, docs, home] = await Promise.all([
    getSiteSeo(), getRoutableDocs(), getHomePage({ publishedOnly: true }),
  ]);
  return buildSitemap(docs, settings?._updatedAt ?? null, { homeNoindex: home?.seo?.noindex === true });
}
