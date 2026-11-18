import { defineField, defineType } from 'sanity';
import { pageSectionsRule } from '../../validation';

export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  fields: [
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'pageSections',
      validation: (rule) => rule.required().min(1).max(20).custom(pageSectionsRule),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      description: 'The home title comes from Site settings. Only the description, social image, and search visibility apply here.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Home page', subtitle: '/' }) },
});
