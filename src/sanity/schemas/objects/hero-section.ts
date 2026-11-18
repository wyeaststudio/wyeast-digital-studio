import { defineField } from 'sanity';
import { defineBlock } from './define-block';
import { imageWithAlt } from './image-with-alt';

export const heroSection = defineBlock({
  name: 'heroSection',
  title: 'Hero',
  fields: [
    defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string', validation: (rule) => rule.max(40) }),
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.required().max(80) }),
    defineField({ name: 'body', title: 'Body', type: 'text', rows: 3, validation: (rule) => rule.max(240) }),
    defineField({ name: 'primaryCta', title: 'Primary call to action', type: 'labelledLink' }),
    defineField({ name: 'secondaryCta', title: 'Secondary call to action', type: 'labelledLink' }),
    defineField({ name: 'showLockup', title: 'Show brand lockup', type: 'boolean', initialValue: false }),
    imageWithAlt('image', 'Background image', { required: true, allowDecorative: true }),
  ],
});
