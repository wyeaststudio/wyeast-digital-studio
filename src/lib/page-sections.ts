import { toPlainText } from '@portabletext/react';
import { stegaClean } from 'next-sanity';
import type { BlockData, PageSection } from '@/components/sections/types';
import { isValidHref } from '@/sanity/validation';

const hasText = (value: string | null | undefined): boolean => Boolean(stegaClean(value)?.trim());
type FaqEntry = NonNullable<BlockData<'faqSection'>['items']>[number];
export type VisibleFaq = FaqEntry & { question: string };

export function visibleFaqs(items: BlockData<'faqSection'>['items']): VisibleFaq[] {
  return (items ?? []).filter((item): item is VisibleFaq =>
    Boolean(item && hasText(item.question) && stegaClean(toPlainText(item.answer ?? [])).trim()),
  );
}

/** Drafts can bypass Studio-required rules; don't render partially populated blocks. */
export function isRenderableSection(section: PageSection | null | undefined): section is PageSection {
  if (!section?._key) return false;
  switch (section._type) {
    case 'heroSection':
      return hasText(section.heading) && Boolean(section.image?.asset?._ref) &&
        (section.image?.decorative === true || hasText(section.image?.alt));
    case 'trustBarSection':
      return Boolean(section.items?.length && section.items.every((item) => item && hasText(item.text) && hasText(item.icon)));
    case 'featureGridSection':
      return hasText(section.heading) && Boolean(section.cards?.length && section.cards.every((card) =>
        card && hasText(card.title) && hasText(card.description) && hasText(card.icon),
      ));
    case 'ctaBannerSection':
      return hasText(section.heading) && hasText(section.cta?.label) && isValidHref(stegaClean(section.cta?.href));
    case 'processStepsSection':
      return hasText(section.heading) && Boolean(section.steps?.length && section.steps.every((step) =>
        step && hasText(step.title) && hasText(step.description) && hasText(step.icon),
      ));
    case 'faqSection':
      return hasText(section.heading) && visibleFaqs(section.items).length > 0;
    case 'richTextSection':
      return Boolean(section.body?.length && stegaClean(toPlainText(section.body)).trim());
    case 'testimonialsSection':
      return Boolean(section.items?.some((item) => item && hasText(item.quote) && hasText(item.name)));
    default:
      return false;
  }
}
