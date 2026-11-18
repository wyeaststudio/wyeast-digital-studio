import { faq } from './documents/faq';
import { page } from './documents/page';
import { testimonial } from './documents/testimonial';
import { iconName } from './objects/icon-name';
import { ctaBannerSection } from './objects/cta-banner-section';
import { featureGridSection } from './objects/feature-grid-section';
import { heroSection } from './objects/hero-section';
import { pageSections } from './objects/page-sections';
import { processStepsSection } from './objects/process-steps-section';
import { richTextBody, richTextSection } from './objects/rich-text-section';
import { testimonialsSection } from './objects/testimonials-section';
import { trustBarSection } from './objects/trust-bar-section';
import { faqAnswer } from './objects/faq-answer';
import { faqSection } from './objects/faq-section';
import { navItem, labelledLink } from './objects/nav-item';
import { seo } from './objects/seo';
import { siteLink } from './objects/site-link';
import { socialLink } from './objects/social-link';
import { singletonTypes } from './singletons';

export const schemaTypes = [
  ...singletonTypes,
  page,
  faq,
  testimonial,
  iconName,
  pageSections,
  heroSection,
  trustBarSection,
  featureGridSection,
  ctaBannerSection,
  processStepsSection,
  richTextBody,
  richTextSection,
  testimonialsSection,
  seo,
  faqAnswer,
  faqSection,
  siteLink,
  labelledLink,
  navItem,
  socialLink,
];
