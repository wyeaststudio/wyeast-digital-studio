import { ChevronDown } from 'lucide-react';
import { RichText } from '@/components/rich-text/rich-text';
import type { FaqAnswer } from '../../../sanity.types';

export type FaqItem = { _id: string; question: string; answer: FaqAnswer | null };

export type FaqSectionProps = {
  eyebrow?: string | null;
  heading: string;
  intro?: string | null;
  items: FaqItem[];
  /** Id for the heading, so several FAQ sections on one page stay unique. */
  headingId?: string;
};

const focusRing =
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground';

function FaqColumn({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <details key={item._id} className="group border-b border-primary-foreground/20 lg:last:border-b-0">
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
            className="pb-4 text-sm leading-6 [&_a]:rounded-sm [&_a]:underline [&_a]:underline-offset-4 [&_a]:outline-none [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-primary-foreground"
          />
        </details>
      ))}
    </div>
  );
}

/**
 * FAQ block on the primary surface (SEO-R20, R22). Native disclosures need no client JS, and answers stay in the
 * server-rendered HTML. Items split into two columns in DOM order, so reading order matches the visual order.
 */
export function FaqSection({ eyebrow, heading, intro, items, headingId = 'faq-heading' }: FaqSectionProps) {
  if (items.length === 0) return null;
  const half = Math.ceil(items.length / 2);

  return (
    <section aria-labelledby={headingId} className="bg-primary px-6 py-16 text-primary-foreground lg:py-28">
      <div className="mx-auto flex max-w-300 flex-col gap-10 lg:gap-16">
        <div className="mx-auto flex max-w-200 flex-col items-center gap-3 text-center lg:gap-4">
          {eyebrow && (
            <p className="rounded-lg border border-primary-foreground/40 px-2.5 py-0.5 text-xs font-medium">{eyebrow}</p>
          )}
          <h2 id={headingId} className="font-heading text-3xl leading-9 lg:text-4xl lg:leading-10">
            {heading}
          </h2>
          {intro && <p className="text-sm leading-5 lg:text-base lg:leading-6">{intro}</p>}
        </div>
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-12">
          <FaqColumn items={items.slice(0, half)} />
          {items.length > half && <FaqColumn items={items.slice(half)} />}
        </div>
      </div>
    </section>
  );
}
