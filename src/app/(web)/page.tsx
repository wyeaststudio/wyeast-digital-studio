import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqSection } from '@/components/sections/faq-section';
import { JsonLd } from '@/components/seo/json-ld';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { faqPage } from '@/lib/seo/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { isIndexableDeployment, resolveSite } from '@/lib/seo/site';
import { getHomeFaqs, getSiteSeo } from '@/sanity/loaders/seo';

const checklist = [
  'Thoughtful brand-led web experiences',
  'Flexible content management with Sanity',
  'Built for accessibility, discoverability, and growth',
];

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ site: resolveSite(await getSiteSeo()), path: '/', indexable: isIndexableDeployment() });
}

export default async function HomePage() {
  const faqs = await getHomeFaqs();

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 pt-32 pb-16 text-foreground">
        <div className="w-full max-w-3xl space-y-6 text-center">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Wy&apos;east Digital Studio
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              We craft websites that feel clear, modern, and built to grow.
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              From strategy to launch, we design and build digital experiences that help brands show up with confidence.
            </p>
          </div>

          <Card className="border-border bg-card text-left">
            <CardHeader>
              <CardTitle>What this studio is shaping</CardTitle>
              <CardDescription>
                A polished foundation for storytelling, content publishing, and launch-ready growth.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul
                className="list-disc space-y-2 pl-6 text-sm text-muted-foreground"
                aria-label="Template readiness checklist"
              >
                {checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                {/* Plain <a>: next/link would prefetch the multi-MB Studio bundle. */}
                <a href="/studio" target="_blank" rel="noreferrer" className={buttonVariants({ variant: 'default' })}>
                  Open Sanity Studio
                </a>

                <Link href="/sitemap.xml" className={buttonVariants({ variant: 'outline' })}>
                  Preview sitemap
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Temporary FAQ wiring so the block is testable end to end; 005 replaces it with the home page builder (SEO-R23). */}
      <FaqSection
        eyebrow="FAQ"
        heading="Frequently Asked Questions"
        intro="Answering common queries about our engineering standards, launch timelines, custom technology stack, and ongoing partnerships."
        items={faqs}
      />
      {faqs.length > 0 && <JsonLd data={faqPage(faqs)} />}
    </>
  );
}
