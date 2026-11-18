import { defineField, defineType } from 'sanity';

export const SOCIAL_PLATFORMS = [
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'Instagram', value: 'instagram' },
  { title: 'Facebook', value: 'facebook' },
  { title: 'GitHub', value: 'github' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'Bluesky', value: 'bluesky' },
  { title: 'X', value: 'x' },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]['value'];

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: { list: [...SOCIAL_PLATFORMS] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Profile URL',
      type: 'url',
      validation: (rule) => rule.required().uri({ scheme: ['https'] }),
    }),
  ],
  preview: { select: { title: 'platform', subtitle: 'url' } },
});
