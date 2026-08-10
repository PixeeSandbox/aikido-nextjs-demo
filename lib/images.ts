import sharp from 'sharp'

export type ThumbnailFormat = 'webp' | 'avif'

export interface ThumbnailOptions {
  width: number
  height?: number
  format?: ThumbnailFormat
  quality?: number
}

const MAX_SOURCE_BYTES = 12 * 1024 * 1024

/**
 * Render a ticket-confirmation or exhibit thumbnail.
 *
 * Source bytes come from Sanity's CDN or an uploaded PDF page render, never
 * directly from a visitor, but we still bound the input size so a malformed
 * asset cannot pin a serverless worker.
 */
export async function renderThumbnail(
  source: Buffer,
  { width, height, format = 'webp', quality = 78 }: ThumbnailOptions
): Promise<Buffer> {
  if (source.byteLength > MAX_SOURCE_BYTES) {
    throw new Error(`Source image too large: ${source.byteLength} bytes`)
  }

  const pipeline = sharp(source, { failOn: 'error', limitInputPixels: 40_000_000 }).resize({
    width,
    height,
    fit: height ? 'cover' : 'inside',
    withoutEnlargement: true,
  })

  return format === 'avif'
    ? pipeline.avif({ quality, effort: 3 }).toBuffer()
    : pipeline.webp({ quality, effort: 4 }).toBuffer()
}

export async function readDimensions(source: Buffer): Promise<{ width: number; height: number }> {
  const { width, height } = await sharp(source).metadata()
  if (!width || !height) {
    throw new Error('Could not read image dimensions')
  }
  return { width, height }
}

/** Aspect-correct height for a target width, rounded to an even pixel. */
export function scaledHeight(
  original: { width: number; height: number },
  targetWidth: number
): number {
  const raw = Math.round((original.height / original.width) * targetWidth)
  return raw % 2 === 0 ? raw : raw + 1
}
