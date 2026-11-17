import { defineField, defineType } from 'sanity';
import { HREF_ERROR, isValidHref } from '../../validation';

export const siteLink = defineType({
  name: 'siteLink',
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
  options: { collapsible: false },
});
