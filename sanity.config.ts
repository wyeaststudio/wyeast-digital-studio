import { defineConfig } from 'sanity';
import { presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemas';
import { dataset, projectId } from './src/sanity/env';

export default defineConfig({
  name: 'wyeast-studio',
  title: 'Client Management Studio',
  basePath: '/studio',

  projectId,
  dataset,

  plugins: [
    structureTool(),
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
});
