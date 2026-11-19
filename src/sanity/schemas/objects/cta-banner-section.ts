import { defineField } from 'sanity';
import { defineBlock } from './define-block';

export const ctaBannerSection = defineBlock({
  name: 'ctaBannerSection',
  title: 'Call-to-action banner',
  defaultSurface: 'primary',
  surfaces: ['primary', 'card', 'background'],
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.required().max(80) }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3, validation: (rule) => rule.max(240) }),
    defineField({ name: 'cta', title: 'Call to action', type: 'labelledLink', validation: (rule) => rule.required() }),
  ],
});
