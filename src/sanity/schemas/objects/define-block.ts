import { defineField, defineType, type ObjectDefinition } from 'sanity';
import { isValidAnchor } from '../../validation';

type Surface = 'background' | 'card' | 'primary';
type BlockDefinition = Pick<ObjectDefinition, 'name' | 'title' | 'icon' | 'fields' | 'preview'> & {
  defaultSurface?: Surface;
  surfaces?: readonly Surface[];
};

export function defineBlock({ defaultSurface, surfaces, fields, preview, ...definition }: BlockDefinition) {
  return defineType({
    ...definition,
    type: 'object',
    fields: [
      defineField({
        name: 'anchor',
        title: 'Anchor',
        type: 'string',
        description: 'Optional link target, like booking. Use lowercase letters, digits, or hyphens; up to 40 characters.',
        validation: (rule) =>
          rule.custom((value) =>
            value === undefined || isValidAnchor(value) ? true : 'Use 1-40 lowercase letters, digits, or hyphens.',
          ),
      }),
      ...(surfaces
        ? [
            defineField({
              name: 'surface',
              title: 'Surface',
              type: 'string',
              options: { list: [...surfaces], layout: 'radio' },
              initialValue: defaultSurface,
              validation: (rule) =>
                rule.custom((value) =>
                  value === undefined || surfaces.some((surface) => surface === value)
                    ? true
                    : 'Choose a surface from the list.',
                ),
            }),
          ]
        : []),
      ...fields,
    ],
    preview: preview ?? {
      select: { title: 'heading' },
      prepare: ({ title }) => ({ title: title ?? definition.title, subtitle: definition.title }),
    },
  });
}
