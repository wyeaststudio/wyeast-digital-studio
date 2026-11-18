import { createDataAttribute } from 'next-sanity';
import { isRenderableSection, visibleFaqs } from '@/lib/page-sections';
import { dataset, projectId } from '@/sanity/env';
import { CtaBannerSection } from './cta-banner-section';
import { FaqSection } from './faq-section';
import { FeatureGridSection } from './feature-grid-section';
import { HeroSection } from './hero-section';
import { PageHeader } from './page-header';
import { ProcessStepsSection } from './process-steps-section';
import { RichTextSection } from './rich-text-section';
import { TestimonialsSection } from './testimonials-section';
import { TrustBarSection } from './trust-bar-section';
import type { PageSection } from './types';

type PageSectionsProps = {
  sections: readonly PageSection[] | null | undefined;
  title: string;
  documentId: string;
  documentType: 'homePage' | 'page';
};

export function PageSections({ sections, title, documentId, documentType }: PageSectionsProps) {
  const first = sections?.[0];
  const hasHero = first?._type === 'heroSection' && isRenderableSection(first);
  const dataAttribute = createDataAttribute({ id: documentId, type: documentType, projectId, dataset, baseUrl: '/studio' });

  return (
    <>
      {!hasHero && <PageHeader title={title} />}
      {sections?.map((section, index) => {
        if (!isRenderableSection(section) || (section._type === 'heroSection' && index !== 0)) {
          console.warn('Skipping incomplete, misplaced, or unknown page section', { documentId, key: section?._key });
          return null;
        }
        const props = {
          headingId: `${documentId}-${section._key}-heading`,
          'data-sanity': dataAttribute(['sections', { _key: section._key }]),
        };
        switch (section._type) {
          case 'heroSection': return <HeroSection key={section._key} section={section} {...props} />;
          case 'trustBarSection': return <TrustBarSection key={section._key} section={section} {...props} />;
          case 'featureGridSection': return <FeatureGridSection key={section._key} section={section} {...props} />;
          case 'ctaBannerSection': return <CtaBannerSection key={section._key} section={section} {...props} />;
          case 'processStepsSection': return <ProcessStepsSection key={section._key} section={section} {...props} />;
          case 'richTextSection': return <RichTextSection key={section._key} section={section} {...props} />;
          case 'testimonialsSection': return <TestimonialsSection key={section._key} section={section} {...props} />;
          case 'faqSection':
            if (!section.heading) return null;
            return <FaqSection
              key={section._key} {...props} anchor={section.anchor} surface={section.surface ?? 'primary'}
              heading={section.heading} eyebrow={section.eyebrow} intro={section.intro} items={visibleFaqs(section.items)}
            />;
        }
      })}
    </>
  );
}
