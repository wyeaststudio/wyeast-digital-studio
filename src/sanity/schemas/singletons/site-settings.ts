import { CogIcon } from '@sanity/icons/Cog';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'string',
      description: 'Used in the footer copyright line and in social link names.',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({ name: 'email', title: 'Contact email', type: 'string', validation: (rule) => rule.email() }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      description: 'Shown as written, for example (503) 555-0100.',
      validation: (rule) =>
        rule.regex(/^\+?[\d\s().-]{7,20}$/, { name: 'phone number' }),
    }),
    defineField({
      name: 'serviceArea',
      title: 'Service area',
      type: 'string',
      description: 'For example "Portland, Oregon and the Pacific Northwest".',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      of: [defineArrayMember({ type: 'socialLink' })],
      validation: (rule) =>
        rule.max(8).custom((links) => {
          const platforms = (links ?? []).map((link) => (link as { platform?: string }).platform);
          return new Set(platforms).size === platforms.length ? true : 'Each platform can only be added once.';
        }),
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
