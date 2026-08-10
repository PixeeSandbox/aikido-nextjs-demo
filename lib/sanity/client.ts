import { createClient, type SanityClient } from '@sanity/client'

import { publicEnv, serverEnv } from '../env'

const baseConfig = {
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: publicEnv.NEXT_PUBLIC_SANITY_API_VERSION,
} as const

/** CDN-backed client for published content. Safe in RSC and the browser. */
export const sanityClient: SanityClient = createClient({
  ...baseConfig,
  useCdn: true,
  perspective: 'published',
})

/** Token-authenticated client that can read drafts. Server-only. */
export function previewClient(): SanityClient {
  const token = serverEnv.SANITY_API_READ_TOKEN
  if (!token) {
    throw new Error('SANITY_API_READ_TOKEN is required for preview reads')
  }

  return createClient({
    ...baseConfig,
    useCdn: false,
    token,
    perspective: 'drafts',
    stega: { enabled: true, studioUrl: '/studio' },
  })
}

export function clientFor({ preview }: { preview: boolean }): SanityClient {
  return preview ? previewClient() : sanityClient
}
