import { stegaClean } from 'next-sanity';
import { SiteLink } from '@/components/layout/site-link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isValidHref } from '@/sanity/validation';
import { Section, surfaceClasses } from './section';
import type { BlockProps } from './types';

export function CtaBannerSection({ section, headingId, ...props }: BlockProps<'ctaBannerSection'>) {
  const href = stegaClean(section.cta?.href);
  if (!section.heading || !section.cta?.label || !isValidHref(href)) return null;
  return (
    <Section {...props} headingId={headingId} anchor={section.anchor} className="py-8 lg:py-8">
      <div className={cn(
        'flex flex-col gap-6 rounded-xl p-8 lg:flex-row lg:items-center lg:justify-between lg:p-12',
        surfaceClasses[stegaClean(section.surface) ?? 'primary'],
      )}>
        <div className="max-w-180 space-y-3">
          <h2 id={headingId} className="text-2xl font-bold">{section.heading}</h2>
          {section.body && <p className="text-sm leading-6">{section.body}</p>}
        </div>
        <SiteLink href={href} className={cn(buttonVariants({
          variant: 'outline',
          className: 'min-h-11 h-auto self-start whitespace-normal px-5 py-3 text-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current dark:bg-background dark:hover:bg-muted lg:self-center',
        }))}>{section.cta.label}</SiteLink>
      </div>
    </Section>
  );
}
