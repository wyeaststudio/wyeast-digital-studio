import { defineArrayMember, defineField } from 'sanity';
import { defineBlock } from './define-block';

export const featureGridSection = defineBlock({
  name: 'featureGridSection',
  title: 'Feature grid',
  defaultSurface: 'background',
  surfaces: ['background', 'card', 'primary'],
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string', validation: (rule) => rule.max(40) }),
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.required().max(80) }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3, validation: (rule) => rule.max(240) }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'featureCard',
          type: 'object',
          fields: [
            defineField({ name: 'icon', title: 'Icon', type: 'iconName', validation: (rule) => rule.required() }),
            defineField({ name: 'badge', title: 'Badge', type: 'string', validation: (rule) => rule.max(12) }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required().max(60) }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3, validation: (rule) => rule.required().max(240) }),
            defineField({ name: 'link', title: 'Link', type: 'labelledLink' }),
          ],
          preview: { select: { title: 'title', subtitle: 'badge' } },
        }),
      ],
      validation: (rule) => rule.required().min(2).max(9),
    }),
  ],
});
