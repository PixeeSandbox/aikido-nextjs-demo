import type { Metadata } from 'next'

import { ProductCard } from '@/components/ProductCard'
import { getProducts } from '@/lib/sanity/queries'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Star charts, field guides, meteorite slices, and Cedarwood merchandise.',
}

export default async function ShopPage() {
  const products = await getProducts()
  const available = products.filter((p) => p.inStock)
  const soldOut = products.filter((p) => !p.inStock)

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="font-display text-4xl">Shop</h1>
        <p className="max-w-2xl text-night-50/80">
          Every purchase supports the observatory&rsquo;s free schools programme.
        </p>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {available.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </ul>

      {soldOut.length > 0 ? (
        <section>
          <h2 className="mb-4 font-display text-2xl text-night-50/70">Currently unavailable</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
            {soldOut.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
