import { PortableText, type PortableTextComponents } from '@portabletext/react';
import { SiteLink } from '@/components/layout/site-link';
import { cn } from '@/lib/utils';
import type { FaqAnswer } from '../../../sanity.types';
import { isValidHref } from '@/sanity/validation';

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
  },
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

/** Renders limited FAQ rich text (SEO-R21); unknown types, styles, lists, and marks are dropped. */
export function RichText({ value, className }: { value: FaqAnswer | null | undefined; className?: string }) {
  if (!value || value.length === 0) return null;
  return (
    <div className={cn('space-y-3', className)}>
      <PortableText value={value} components={components} onMissingComponent={false} />
    </div>
  );
}
