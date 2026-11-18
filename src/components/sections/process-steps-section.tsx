import { ArrowRight } from 'lucide-react';
import { Icon } from './icons';
import { Section } from './section';
import { SectionHeading } from './section-heading';
import type { BlockProps } from './types';

export function ProcessStepsSection({ section, headingId, ...props }: BlockProps<'processStepsSection'>) {
  if (!section.heading) return null;
  return (
    <Section {...props} headingId={headingId} anchor={section.anchor} surface={section.surface} innerClassName="space-y-12 lg:space-y-16">
      <SectionHeading heading={section.heading} headingId={headingId} intro={section.intro} />
      <ol className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        {section.steps?.map((step, index, steps) => (
          <li key={step._key} className="relative min-w-0 flex-1 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-md bg-accent p-2 text-accent-foreground"><Icon name={step.icon} className="size-6" /></span>
              <p className="rounded-lg bg-primary px-2.5 py-0.5 text-xs text-primary-foreground">Step {String(index + 1).padStart(2, '0')}</p>
            </div>
            <h3 className="mb-2 wrap-break-word text-xl font-bold">{step.title}</h3>
            <p className="wrap-break-word text-sm leading-5 text-muted-foreground">{step.description}</p>
            {index < steps.length - 1 && <ArrowRight aria-hidden="true" className="absolute top-1/2 -right-8 hidden size-6 text-foreground lg:block" />}
          </li>
        ))}
      </ol>
    </Section>
  );
}
