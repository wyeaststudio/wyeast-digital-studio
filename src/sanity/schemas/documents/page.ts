import { defineField, defineType } from 'sanity';
import { isValidPageSlug } from '../../validation';

export const page = defineType({
  name: 'page',
  type: 'document',
  title: 'Page',
  fields: [
    defineField({ name: 'title', type: 'string', title: 'Title', validation: (rule) => rule.required().max(80) }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 60 },
      description: 'One lowercase path segment, like about or web-design. App and asset paths are reserved.',
      validation: (rule) =>
        rule.required().custom((value) =>
          value === undefined || isValidPageSlug(value.current)
            ? true
            : 'Use 1-60 lowercase letters or digits separated by single hyphens, and avoid reserved paths.',
        ),
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
    defineField({ name: 'sections', title: 'Sections', type: 'pageSections' }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare: ({ title, slug }) => ({ title: title ?? 'Untitled page', subtitle: slug ? `/${slug}` : 'No slug' }),
  },
});
