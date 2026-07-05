import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { dataset, projectId } from '@/sanity/env';

export default defineConfig({
  name: 'wyeast-studio',
  title: 'Client Management Studio',
  basePath: '/studio',

  projectId,
  dataset,

  plugins: [structureTool()],

  schema: {
    types: [
      {
        name: 'page',
        type: 'document',
        title: 'Page Content',
        fields: [{ name: 'title', type: 'string', title: 'Title' }],
      },
    ],
  },
});
