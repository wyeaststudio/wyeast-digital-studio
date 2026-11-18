import { HelpCircleIcon } from '@sanity/icons/HelpCircle';
import { defineField, defineType } from 'sanity';

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (rule) => [
        rule.required().max(120).error(),
        rule
          .custom((value) =>
            typeof value !== 'string' || value.endsWith('?') ? true : 'Questions usually end with "?".',
          )
          .warning(),
      ],
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'faqAnswer',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'question' },
    prepare: ({ title }) => ({ title: title ?? 'Untitled question' }),
  },
});
