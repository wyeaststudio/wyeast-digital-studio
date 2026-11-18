import { faq } from './documents/faq';
import { page } from './documents/page';
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
  seo,
  faqAnswer,
  faqSection,
  siteLink,
  labelledLink,
  navItem,
  socialLink,
];
