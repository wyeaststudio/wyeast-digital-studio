import type { Metadata } from 'next';
import { PageSections } from '@/components/sections/page-sections';
import { JsonLd } from '@/components/seo/json-ld';
import { faqPageForSections } from '@/lib/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { isIndexableDeployment, resolveSite } from '@/lib/seo/site';
import { getHomePage } from '@/sanity/loaders/pages';
import { getSiteSeo } from '@/sanity/loaders/seo';

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSeo()]);
  return buildMetadata({
    site: resolveSite(settings),
    path: '/',
    seo: home?.seo,
    indexable: isIndexableDeployment(),
  });
}

export default async function HomePage() {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSeo()]);

  return (
    <>
      <PageSections
        sections={home?.sections}
        title={resolveSite(settings).homeTitle}
        documentId={home?._id ?? 'homePage'}
        documentType="homePage"
      />
      <JsonLd data={faqPageForSections(home?.sections)} />
    </>
  );
}
