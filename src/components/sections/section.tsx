import type { ComponentProps } from 'react';
import { stegaClean } from 'next-sanity';
import { cn } from '@/lib/utils';
import type { Surface } from './types';

export const surfaceClasses: Record<Surface, string> = {
  background: 'bg-background text-foreground',
  card: 'bg-card text-card-foreground',
  primary: 'bg-primary text-primary-foreground',
};

export type SectionProps = Omit<ComponentProps<'section'>, 'id'> & {
  anchor?: string | null;
  surface?: Surface | null;
  headingId?: string;
  innerClassName?: string;
  'data-sanity'?: string;
};

export function Section({
  anchor, surface = 'background', headingId, children, className, innerClassName, ...props
}: SectionProps) {
  return (
    <section
      {...props}
      id={anchor ? stegaClean(anchor) : undefined}
      aria-labelledby={headingId}
      className={cn(
        'px-6 py-16 lg:py-28 [&_a]:focus-visible:outline-current [&_summary]:focus-visible:outline-current',
        surfaceClasses[stegaClean(surface) ?? 'background'],
        className,
      )}
    >
      <div className={cn('mx-auto max-w-300', innerClassName)}>{children}</div>
    </section>
  );
}
