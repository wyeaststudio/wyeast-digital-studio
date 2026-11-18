import { defineArrayMember, defineType } from 'sanity';
import { pageSectionsRule } from '../../validation';

export const pageSections = defineType({
  name: 'pageSections',
  title: 'Sections',
  type: 'array',
  of: [
    'heroSection',
    'trustBarSection',
    'featureGridSection',
    'ctaBannerSection',
    'processStepsSection',
    'faqSection',
    'richTextSection',
    'testimonialsSection',
  ].map((type) => defineArrayMember({ type })),
  validation: (rule) => rule.max(20).custom(pageSectionsRule),
});
