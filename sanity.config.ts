import { defineConfig } from 'sanity';
import { defineDocuments, defineLocations, presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemas';
import { SINGLETON_TYPES } from './src/sanity/schemas/singletons';
import { structure } from './src/sanity/structure';
import { dataset, projectId } from './src/sanity/env';

const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  name: 'wyeast-studio',
  title: 'Client Management Studio',
  basePath: '/studio',

  projectId,
  dataset,

  plugins: [
    structureTool({ structure }),
    presentationTool({
      resolve: {
        mainDocuments: defineDocuments([
          { route: '/', filter: '_type == "homePage" && _id == "homePage"' },
          { route: '/:slug', filter: '_type == "page" && slug.current == $slug' },
        ]),
        locations: {
          homePage: defineLocations({ locations: [{ title: 'Home page', href: '/' }] }),
          page: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: doc?.slug ? [{ title: doc.title || 'Untitled page', href: `/${doc.slug}` }] : [],
            }),
          }),
        },
      },
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
  ],

  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },

  document: {
    actions: (actions, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : actions,
  },
});
