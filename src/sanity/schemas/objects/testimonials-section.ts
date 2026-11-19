import { defineArrayMember, defineField } from 'sanity';
import { uniqueRefs } from '../../validation';
import { defineBlock } from './define-block';

export const testimonialsSection = defineBlock({
  name: 'testimonialsSection',
  title: 'Testimonials',
  defaultSurface: 'card',
  surfaces: ['card', 'background', 'primary'],
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.max(80) }),
    defineField({
      name: 'items',
      title: 'Testimonials',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'testimonial' }],
          options: { filter: 'permission == true' },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(3).custom(uniqueRefs),
    }),
  ],
});
