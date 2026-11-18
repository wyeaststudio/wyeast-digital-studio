import { PortableText, type PortableTextBlockComponent, type PortableTextComponents } from '@portabletext/react';
import { SiteLink } from '@/components/layout/site-link';
import { cn } from '@/lib/utils';
import type { FaqAnswer, RichTextBody } from '../../../sanity.types';
import { isValidHref } from '@/sanity/validation';

const FaqBlock: PortableTextBlockComponent = ({ children }) => <p>{children}</p>;
const ProseBlock: PortableTextBlockComponent = ({ children, value }) => {
  if (value.style === 'h3') return <h3 className="pt-4 text-2xl leading-8">{children}</h3>;
  if (value.style === 'h4') return <h4 className="pt-3 text-xl leading-7">{children}</h4>;
  return <p>{children}</p>;
};

const components: PortableTextComponents = {
  block: FaqBlock,
  list: {
    bullet: ({ children }) => <ul className="list-disc space-y-1 pl-6">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal space-y-1 pl-6">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => {
      const href: unknown = value?.href;
      if (!isValidHref(href)) return <>{children}</>;
      return (
        <SiteLink href={href} className="underline underline-offset-4">
          {children}
        </SiteLink>
      );
    },
  },
  unknownType: () => null,
  unknownBlockStyle: ({ children }) => <p>{children}</p>,
  unknownList: ({ children }) => <ul className="list-disc space-y-1 pl-6">{children}</ul>,
  unknownListItem: ({ children }) => <li>{children}</li>,
  unknownMark: ({ children }) => <>{children}</>,
};

const proseComponents: PortableTextComponents = {
  ...components,
  block: ProseBlock,
};

/** FAQ keeps its limited styles; prose additionally allows h3/h4 (PB-R19). */
export function RichText({ value, className, variant = 'faq' }: {
  value: FaqAnswer | RichTextBody | null | undefined;
  className?: string;
  variant?: 'faq' | 'prose';
}) {
  if (!value || value.length === 0) return null;
  return (
    <div className={cn('space-y-3', className)}>
      <PortableText value={value} components={variant === 'prose' ? proseComponents : components} onMissingComponent={false} />
    </div>
  );
}
