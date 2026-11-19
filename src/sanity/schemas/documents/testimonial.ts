import { defineField, defineType } from 'sanity';
import { testimonialPermission } from '../../validation';
import { imageWithAlt } from '../objects/image-with-alt';

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (rule) => rule.required().max(400) }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (rule) => rule.required().max(60) }),
    defineField({ name: 'role', title: 'Role', type: 'string', validation: (rule) => rule.max(60) }),
    defineField({ name: 'company', title: 'Company', type: 'string', validation: (rule) => rule.max(60) }),
    imageWithAlt('photo', 'Photo'),
    defineField({
      name: 'permission',
      title: 'I have permission to publish this testimonial',
      type: 'boolean',
      initialValue: false,
      validation: (rule) => rule.required().custom(testimonialPermission),
    }),
  ],
  preview: { select: { title: 'name', subtitle: 'company', media: 'photo' } },
});
