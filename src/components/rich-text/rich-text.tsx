import { PortableText, type PortableTextBlockComponent, type PortableTextComponents } from '@portabletext/react';
import { SiteLink } from '@/components/layout/site-link';
import { cn } from '@/lib/utils';
import type { FaqAnswer, RichTextBody } from '../../../sanity.types';
import { isValidHref } from '@/sanity/validation';

const FaqBlock: PortableTextBlockComponent = ({ children }) => <p>{children}</p>;

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

function proseComponents(value: FaqAnswer | RichTextBody, headingLevel: 2 | 3): PortableTextComponents {
  const headings = new Map<string, 'h2' | 'h3' | 'h4'>();
  let hasParent = false;
  for (const block of value) {
    if (block._type !== 'block') continue;
    if (block.style === 'h3') hasParent = true;
    if (block.style !== 'h3' && block.style !== 'h4') continue;
    // Leading h4 siblings stay at the starting level until an h3 establishes their parent.
    const nested = block.style === 'h4' && hasParent;
    headings.set(block._key, headingLevel === 2 ? (nested ? 'h3' : 'h2') : (nested ? 'h4' : 'h3'));
  }
  const ProseBlock: PortableTextBlockComponent = ({ children, value: block }) => {
    const className = block.style === 'h4' ? 'pt-3 text-xl leading-7' : 'pt-4 text-2xl leading-8';
    switch (block._key === undefined ? undefined : headings.get(block._key)) {
      case 'h2': return <h2 className={className}>{children}</h2>;
      case 'h3': return <h3 className={className}>{children}</h3>;
      case 'h4': return <h4 className={className}>{children}</h4>;
      default: return <p>{children}</p>;
    }
  };
  return { ...components, block: ProseBlock };
}

/** FAQ keeps its limited styles; prose gives authored h3/h4 contextual semantic levels (PB-R19). */
export function RichText({ value, className, variant = 'faq', headingLevel = 3 }: {
  value: FaqAnswer | RichTextBody | null | undefined;
  className?: string;
  variant?: 'faq' | 'prose';
  headingLevel?: 2 | 3;
}) {
  if (!value || value.length === 0) return null;
  return (
    <div className={cn('space-y-3', className)}>
      <PortableText value={value} components={variant === 'prose' ? proseComponents(value, headingLevel) : components} onMissingComponent={false} />
    </div>
  );
}
