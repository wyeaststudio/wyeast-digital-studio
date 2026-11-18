import { defineArrayMember, defineField, defineType } from 'sanity';
import { HREF_ERROR, isValidHref } from '../../validation';

/** Limited rich text for FAQ answers: paragraphs, bold, italic, lists, and links (SEO-R21). */
export const faqAnswer = defineType({
  name: 'faqAnswer',
  title: 'Answer',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Number', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'string',
                description: 'An internal path like /about, or a full https:// URL.',
                validation: (rule) =>
                  rule.required().custom((value) => (value === undefined || isValidHref(value) ? true : HREF_ERROR)),
              }),
            ],
          },
        ],
      },
    }),
  ],
});
