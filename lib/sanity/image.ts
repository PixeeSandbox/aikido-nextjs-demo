import imageUrlBuilder from '@sanity/image-url'
import type { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder'

import { sanityClient } from './client'

const builder = imageUrlBuilder(sanityClient)

export type SanityImageSource = Parameters<typeof builder.image>[0]

export function urlFor(source: SanityImageSource): ImageUrlBuilder {
  return builder.image(source).auto('format').fit('max')
}

export interface SrcSetEntry {
  width: number
  url: string
}

const BREAKPOINTS = [480, 768, 1024, 1440, 1920] as const

export function srcSet(source: SanityImageSource): SrcSetEntry[] {
  return BREAKPOINTS.map((width) => ({ width, url: urlFor(source).width(width).url() }))
}

export function srcSetAttribute(source: SanityImageSource): string {
  return srcSet(source)
    .map(({ width, url }) => `${url} ${width}w`)
    .join(', ')
}
