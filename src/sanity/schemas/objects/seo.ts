import { defineField, defineType } from 'sanity';
import { seoDescriptionWarning, seoTitleWarning } from '../../validation';

/** Alt text for a social image. Required once an image is set. Shared with `siteSettings.defaultOgImage`. */
export const socialImageAltField = defineField({
  name: 'alt',
  title: 'Alt text',
  type: 'string',
  validation: (rule) =>
    rule.custom((alt, context) => {
      const image = context.parent as { asset?: unknown } | undefined;
      return image?.asset && !alt ? 'Alt text is required when a social image is set.' : true;
    }),
});

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'SEO title',
      type: 'string',
      description: 'Optional. Defaults to the page title.',
      validation: (rule) => rule.custom(seoTitleWarning).warning(),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.custom(seoDescriptionWarning).warning(),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social image',
      type: 'image',
      description: 'Shown when the page is shared. Use 1200 × 630 pixels.',
      options: { hotspot: true },
      fields: [socialImageAltField],
    }),
    defineField({
      name: 'noindex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  options: { collapsible: true, collapsed: true },
});
