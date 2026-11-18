import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageSections } from '@/components/sections/page-sections';
import { JsonLd } from '@/components/seo/json-ld';
import { faqPageForSections } from '@/lib/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { isIndexableDeployment, resolveSite } from '@/lib/seo/site';
import { getPage, getPageSlugs } from '@/sanity/loaders/pages';
import { getSiteSeo } from '@/sanity/loaders/seo';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPageSlugs();
  return (slugs.length ? slugs : ['__placeholder__']).map((slug) => ({ slug }));
}

async function loadPage(params: Props['params']) {
  const { slug } = await params;
  if (slug === '__placeholder__') notFound();
  const page = await getPage(slug);
  if (!page) notFound();
  return { page, slug };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ page, slug }, settings] = await Promise.all([loadPage(params), getSiteSeo()]);
  return buildMetadata({
    site: resolveSite(settings),
    path: `/${slug}`,
    title: page.title,
    seo: page.seo,
    indexable: isIndexableDeployment(),
  });
}

export default async function Page({ params }: Props) {
  const { page } = await loadPage(params);
  return (
    <>
      <PageSections sections={page.sections} title={page.title ?? ''} documentId={page._id} documentType="page" />
      <JsonLd data={faqPageForSections(page.sections)} />
    </>
  );
}
