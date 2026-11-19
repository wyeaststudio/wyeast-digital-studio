import { defineArrayMember, defineField } from 'sanity';
import { uniqueRefs } from '../../validation';
import { defineBlock } from './define-block';

export const faqSection = defineBlock({
  name: 'faqSection',
  title: 'FAQ section',
  defaultSurface: 'primary',
  surfaces: ['primary', 'background', 'card'],
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Small label above the heading, for example "FAQ".',
      validation: (rule) => rule.max(24),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: 'faqs',
      title: 'Questions',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'faq' }] })],
      validation: (rule) => rule.required().min(1).max(12).custom(uniqueRefs),
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({
      title: title ?? 'FAQ section',
      subtitle: 'FAQ section',
    }),
  },
});
