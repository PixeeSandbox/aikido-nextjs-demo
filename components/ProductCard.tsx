import Link from 'next/link'

import { formatCents } from '@/lib/pricing'
import type { ProductDoc } from '@/lib/sanity/queries'

import { SanityImage } from './SanityImage'

export function ProductCard({ product }: { product: ProductDoc }) {
  return (
    <li className="rounded-lg border border-night-500 p-4">
      {product.heroImage ? (
        <SanityImage
          source={product.heroImage.url}
          alt={product.heroImage.alt ?? product.title}
          width={480}
        />
      ) : (
        <div className="aspect-square rounded bg-night-800" />
      )}

      <h3 className="mt-3 font-display text-lg">
        <Link href={`/shop/${product.slug}`} className="hover:text-ember-400">
          {product.title}
        </Link>
      </h3>
      <p className="mt-1 text-night-50/80">{formatCents(product.priceCents)}</p>
      {!product.inStock ? (
        <p className="mt-1 text-xs uppercase tracking-wide text-night-50/50">Unavailable</p>
      ) : null}
    </li>
  )
}
