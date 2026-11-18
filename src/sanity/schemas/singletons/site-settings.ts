import { CogIcon } from '@sanity/icons/Cog';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { socialImageAltField } from '../objects/seo';
import { seoDescriptionWarning, seoTitleWarning } from '../../validation';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'seo', title: 'SEO and business' },
  ],
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'string',
      group: 'general',
      description: 'Used in the footer copyright line and in social link names.',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({ name: 'email', title: 'Contact email', type: 'string', group: 'general', validation: (rule) => rule.email() }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      group: 'general',
      description: 'Shown as written, for example (503) 555-0100.',
      validation: (rule) =>
        rule.regex(/^\+?[\d\s().-]{7,20}$/, { name: 'phone number' }),
    }),
    defineField({
      name: 'serviceArea',
      title: 'Service area',
      type: 'string',
      group: 'general',
      description: 'For example "Portland, Oregon and the Pacific Northwest".',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'general',
      of: [defineArrayMember({ type: 'socialLink' })],
      validation: (rule) =>
        rule.max(8).custom((links) => {
          const platforms = (links ?? []).map((link) => (link as { platform?: string }).platform);
          return new Set(platforms).size === platforms.length ? true : 'Each platform can only be added once.';
        }),
    }),
    defineField({
      name: 'homeTitle',
      title: 'Home page title',
      type: 'string',
      group: 'seo',
      description: 'Used as the absolute title of the home page.',
      validation: (rule) => [rule.required().error(), rule.custom(seoTitleWarning).warning()],
    }),
    defineField({
      name: 'defaultDescription',
      title: 'Default meta description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Used for pages that have no description of their own.',
      validation: (rule) => [rule.required().error(), rule.custom(seoDescriptionWarning).warning()],
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default social image',
      type: 'image',
      group: 'seo',
      description: 'Shown when a page has no social image of its own. Use 1200 × 630 pixels.',
      options: { hotspot: true },
      fields: [socialImageAltField],
    }),
    defineField({
      name: 'businessDescription',
      title: 'Business description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Used in the business structured data and the llms.txt summary.',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'addressLocality',
      title: 'City',
      type: 'string',
      group: 'seo',
      description: 'For example "Portland".',
    }),
    defineField({
      name: 'addressRegion',
      title: 'State or region',
      type: 'string',
      group: 'seo',
      description: 'Two-letter state code, for example "OR".',
      validation: (rule) => rule.regex(/^[A-Za-z]{2}$/, { name: 'two-letter state code' }),
    }),
    defineField({
      name: 'areaServed',
      title: 'Areas served',
      type: 'array',
      group: 'seo',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.max(6),
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
