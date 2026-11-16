import { defineField, defineType } from 'sanity';

export const page = defineType({
  name: 'page',
  type: 'document',
  title: 'Page Content',
  fields: [defineField({ name: 'title', type: 'string', title: 'Title' })],
});
