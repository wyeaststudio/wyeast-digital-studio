import { defineArrayMember, defineField, defineType } from 'sanity';

const labelField = defineField({
  name: 'label',
  title: 'Label',
  type: 'string',
  validation: (rule) => rule.required().max(24),
});

/** A labelled link: footer links, nav children, and the header CTA. */
export const labelledLink = defineType({
  name: 'labelledLink',
  title: 'Link',
  type: 'object',
  fields: [labelField, defineField({ name: 'link', title: 'Link', type: 'siteLink', validation: (rule) => rule.required() })],
  preview: { select: { title: 'label', subtitle: 'link.href' } },
});

export const navItem = defineType({
  name: 'navItem',
  title: 'Navigation item',
  type: 'object',
  fields: [
    labelField,
    defineField({
      name: 'link',
      title: 'Link',
      type: 'siteLink',
      description: 'Optional when the item has child links.',
      validation: (rule) =>
        rule.custom((value, context) => {
          const children = (context.parent as { children?: unknown[] } | undefined)?.children;
          return value || (children && children.length > 0) ? true : 'Add a link or at least one child link.';
        }),
    }),
    defineField({
      name: 'children',
      title: 'Child links',
      type: 'array',
      description: 'Shown as a submenu. One level only.',
      // labelledLink has no children field, so nesting stops here.
      of: [defineArrayMember({ type: 'labelledLink' })],
      validation: (rule) => rule.max(8),
    }),
  ],
  preview: {
    select: { title: 'label', href: 'link.href', children: 'children' },
    prepare: ({ title, href, children }) => ({
      title,
      subtitle: Array.isArray(children) && children.length > 0 ? `${children.length} child links` : href,
    }),
  },
});
