import { ArrowUpRight } from 'lucide-react';
import { stegaClean } from 'next-sanity';
import { SiteLink } from '@/components/layout/site-link';
import { isValidHref } from '@/sanity/validation';
import { Icon } from './icons';
import { Section } from './section';
import { SectionHeading } from './section-heading';
import type { BlockProps } from './types';

export function FeatureGridSection({ section, headingId, ...props }: BlockProps<'featureGridSection'>) {
  if (!section.heading) return null;
  return (
    <Section {...props} headingId={headingId} anchor={section.anchor} surface={section.surface} innerClassName="space-y-12 lg:space-y-16">
      <SectionHeading heading={section.heading} headingId={headingId} eyebrow={section.eyebrow} intro={section.intro} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {section.cards?.map((card) => {
          const href = stegaClean(card.link?.href);
          return (
            <article key={card._key} className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-md bg-accent p-2 text-accent-foreground"><Icon name={card.icon} className="size-5" /></span>
                {card.badge && <p className="rounded-lg bg-primary px-2.5 py-0.5 text-xs text-primary-foreground">{card.badge}</p>}
              </div>
              <h3 className="wrap-break-word text-xl font-bold">{card.title}</h3>
              <p className="text-sm leading-5 text-muted-foreground">{card.description}</p>
              {card.link?.label && isValidHref(href) && (
                <SiteLink href={href} className="mt-auto inline-flex min-h-11 items-center gap-1 self-start rounded-sm text-xs font-medium uppercase underline-offset-4 hover:underline">
                  <span>{card.link.label}<span className="sr-only">: {card.title}</span></span>
                  <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                </SiteLink>
              )}
            </article>
          );
        })}
      </div>
    </Section>
  );
}
