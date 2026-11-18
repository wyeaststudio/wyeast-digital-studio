import { defineArrayMember, defineField, defineType } from 'sanity';
import { defineBlock } from './define-block';
import { faqAnswerBlock } from './faq-answer';

export const richTextBody = defineType({
  name: 'richTextBody',
  title: 'Rich text',
  type: 'array',
  of: [
    defineArrayMember({
      ...faqAnswerBlock,
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Heading 4', value: 'h4' },
      ],
    }),
  ],
});

export const richTextSection = defineBlock({
  name: 'richTextSection',
  title: 'Rich text',
  defaultSurface: 'background',
  surfaces: ['background', 'card'],
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.max(80) }),
    defineField({ name: 'body', title: 'Body', type: 'richTextBody', validation: (rule) => rule.required().min(1) }),
  ],
});
