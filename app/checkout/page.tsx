import type { Metadata } from 'next'

import { CheckoutForm } from '@/components/CheckoutForm'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="text-night-50/70">
        Tickets are emailed as a single PDF with one QR code per admission. Bring it on your phone
        or printed — either scans at the gate.
      </p>
      <CheckoutForm />
    </div>
  )
}
