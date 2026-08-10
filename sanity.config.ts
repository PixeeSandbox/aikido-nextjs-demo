import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { publicEnv } from './lib/env'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'cedarwood-studio',
  title: 'Cedarwood Observatory',
  basePath: '/studio',
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem().title('Ticket types').child(S.documentTypeList('ticketType')),
            S.listItem().title('Exhibits').child(S.documentTypeList('exhibit')),
            S.listItem().title('Shop products').child(S.documentTypeList('product')),
            S.divider(),
            S.listItem().title('Pages').child(S.documentTypeList('page')),
          ]),
    }),
    visionTool({ defaultApiVersion: publicEnv.NEXT_PUBLIC_SANITY_API_VERSION }),
  ],
  schema: { types: schemaTypes },
  document: {
    productionUrl: async (prev, { document }) => {
      const slug = (document as { slug?: { current?: string } }).slug?.current
      if (document._type === 'ticketType' && slug) {
        return `https://cedarwoodobservatory.org/tickets/${slug}`
      }
      if (document._type === 'product' && slug) {
        return `https://cedarwoodobservatory.org/shop/${slug}`
      }
      return prev
    },
  },
})
