import { ChevronDown } from 'lucide-react';
import { RichText } from '@/components/rich-text/rich-text';
import type { VisibleFaq } from '@/lib/page-sections';
import { Section, type SectionProps } from './section';
import { SectionHeading } from './section-heading';

export type FaqItem = VisibleFaq;

export type FaqSectionProps = {
  eyebrow?: string | null;
  heading: string;
  intro?: string | null;
  items: FaqItem[];
  /** Id for the heading, so several FAQ sections on one page stay unique. */
  headingId?: string;
  anchor?: SectionProps['anchor'];
  surface?: SectionProps['surface'];
  'data-sanity'?: string;
};

const focusRing =
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current';

function FaqColumn({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <details key={item._id} className="group border-b border-current/20 lg:last:border-b-0">
          <summary
            className={`flex min-h-11 cursor-pointer list-none items-center gap-2.5 rounded-md py-4 text-sm font-medium [&::-webkit-details-marker]:hidden ${focusRing}`}
          >
            <span className="flex-1">{item.question}</span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 motion-safe:transition-transform group-open:rotate-180"
            />
          </summary>
          <RichText
            value={item.answer}
            className="pb-4 text-sm leading-6 [&_a]:rounded-sm [&_a]:underline [&_a]:underline-offset-4 [&_a]:outline-none [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-current"
          />
        </details>
      ))}
    </div>
  );
}

/**
 * FAQ block (SEO-R20, R22). Native disclosures need no client JS, and answers stay in the
 * server-rendered HTML. Items split into two columns in DOM order, so reading order matches the visual order.
 */
export function FaqSection({ eyebrow, heading, intro, items, headingId = 'faq-heading', surface = 'primary', anchor, ...props }: FaqSectionProps) {
  if (items.length === 0) return null;
  const half = Math.ceil(items.length / 2);

  return (
    <Section {...props} headingId={headingId} surface={surface} anchor={anchor} innerClassName="flex flex-col gap-10 lg:gap-16">
      <SectionHeading heading={heading} headingId={headingId} eyebrow={eyebrow} intro={intro} />
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-12">
        <FaqColumn items={items.slice(0, half)} />
        {items.length > half && <FaqColumn items={items.slice(half)} />}
      </div>
    </Section>
  );
}
