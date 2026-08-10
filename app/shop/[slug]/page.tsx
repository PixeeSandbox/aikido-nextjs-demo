import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SanityImage } from '@/components/SanityImage'
import { formatCents } from '@/lib/pricing'
import { getProduct, getProducts } from '@/lib/sanity/queries'

export const revalidate = 600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  return product ? { title: product.title } : { title: 'Product not found' }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <div>
        {product.heroImage ? (
          <SanityImage
            source={product.heroImage.url}
            alt={product.heroImage.alt ?? product.title}
            width={720}
          />
        ) : (
          <div className="aspect-square rounded bg-night-800" />
        )}
      </div>

      <div className="space-y-5">
        <h1 className="font-display text-4xl">{product.title}</h1>
        <p className="text-2xl">{formatCents(product.priceCents)}</p>
        <p className="text-sm uppercase tracking-wide text-night-50/60">
          {product.inStock ? 'In stock' : 'Currently unavailable'}
        </p>
        <button
          type="button"
          disabled={!product.inStock}
          className="rounded bg-ember-500 px-5 py-3 font-medium text-night-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to basket
        </button>
      </div>
    </article>
  )
}
