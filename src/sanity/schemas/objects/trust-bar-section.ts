import { defineArrayMember, defineField } from 'sanity';
import { defineBlock } from './define-block';

export const trustBarSection = defineBlock({
  name: 'trustBarSection',
  title: 'Trust bar',
  defaultSurface: 'primary',
  surfaces: ['primary', 'background', 'card'],
  fields: [
    defineField({
      name: 'items',
      title: 'Statements',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'trustItem',
          type: 'object',
          fields: [
            defineField({ name: 'icon', title: 'Icon', type: 'iconName', validation: (rule) => rule.required() }),
            defineField({ name: 'text', title: 'Statement', type: 'string', validation: (rule) => rule.required().max(60) }),
          ],
          preview: { select: { title: 'text' } },
        }),
      ],
      validation: (rule) => rule.required().min(2).max(4),
    }),
  ],
});
