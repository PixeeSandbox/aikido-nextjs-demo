'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { CartDrawer } from '@/components/CartDrawer'
import { EMPTY_CART, totalAdmissions, visitDates, type Cart } from '@/lib/cart'
import { formatCents, quote } from '@/lib/pricing'

export default function CartPage() {
  const [cart, setCart] = useState<Cart>(EMPTY_CART)

  const summary = useMemo(() => {
    const dates = visitDates(cart)
    if (dates.length === 0) return { subtotalCents: 0 }
    return quote(cart.entries, { visitDate: new Date(dates[0]!) })
  }, [cart])

  if (cart.entries.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-4xl">Your basket is empty</h1>
        <Link href="/tickets" className="text-ember-400 underline">
          Browse admission types
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl">Your basket</h1>
      <p className="text-night-50/70">{totalAdmissions(cart)} admissions</p>

      <CartDrawer cart={cart} onChange={setCart} />

      <div className="border-t border-night-800 pt-4 text-xl">
        Subtotal: <strong>{formatCents(summary.subtotalCents)}</strong>
      </div>

      <Link
        href="/checkout"
        className="inline-block rounded bg-ember-500 px-5 py-3 font-medium text-night-900"
      >
        Continue to checkout
      </Link>
    </div>
  )
}
