import { defineArrayMember, defineField } from 'sanity';
import { defineBlock } from './define-block';

export const processStepsSection = defineBlock({
  name: 'processStepsSection',
  title: 'Process steps',
  defaultSurface: 'background',
  surfaces: ['background', 'card', 'primary'],
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.required().max(80) }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3, validation: (rule) => rule.max(240) }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'processStep',
          type: 'object',
          fields: [
            defineField({ name: 'icon', title: 'Icon', type: 'iconName', validation: (rule) => rule.required() }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required().max(40) }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3, validation: (rule) => rule.required().max(200) }),
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
      validation: (rule) => rule.required().min(2).max(6),
    }),
  ],
});
