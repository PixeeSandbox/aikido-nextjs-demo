import Image from 'next/image'

import { safeExternalUrl } from '@/lib/validation'

interface SanityImageProps {
  source: string
  alt: string
  width: number
  height?: number
  priority?: boolean
  className?: string
}

/**
 * Sanity asset URLs are configured as a remote pattern in next.config.mjs, but
 * editors can paste arbitrary URLs into image fields, so the href is sanitized
 * before it reaches next/image.
 */
export function SanityImage({
  source,
  alt,
  width,
  height,
  priority = false,
  className,
}: SanityImageProps) {
  const safe = safeExternalUrl(source)
  if (!safe) return <div className="aspect-square rounded bg-night-800" aria-hidden />

  return (
    <Image
      src={safe}
      alt={alt}
      width={width}
      height={height ?? width}
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={className ?? 'h-auto w-full rounded object-cover'}
    />
  )
}
