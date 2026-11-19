import { defineField } from 'sanity';
import { altOrDecorative } from '../../validation';

export function imageWithAlt(
  name: string,
  title: string,
  { required = false, allowDecorative = false }: { required?: boolean; allowDecorative?: boolean } = {},
) {
  return defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ...(allowDecorative
        ? [
            defineField({
              name: 'decorative',
              title: 'Decorative image',
              type: 'boolean',
              initialValue: false,
              description: 'Only use for images that add no information; assistive technology will skip them.',
            }),
          ]
        : []),
    ],
    validation: (rule) => {
      const imageRule = required ? rule.required() : rule;
      return imageRule.custom((value) =>
        altOrDecorative(value && !allowDecorative ? { ...value, decorative: false } : value),
      );
    },
  });
}
