import { MenuIcon } from '@sanity/icons/Menu';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'headerLinks',
      title: 'Header links',
      type: 'array',
      of: [defineArrayMember({ type: 'navItem' })],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'headerCta',
      title: 'Header call to action',
      type: 'labelledLink',
      description: 'The highlighted button in the header, for example "Book Appointment".',
    }),
    defineField({
      name: 'footerLinks',
      title: 'Footer links',
      type: 'array',
      of: [defineArrayMember({ type: 'labelledLink' })],
      validation: (rule) => rule.max(8),
    }),
  ],
  preview: { prepare: () => ({ title: 'Navigation' }) },
});
