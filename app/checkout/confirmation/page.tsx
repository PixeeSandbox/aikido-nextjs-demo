import type { Metadata } from 'next'
import Link from 'next/link'

import { formatCents } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Booking confirmed',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          email: true,
          status: true,
          subtotalCents: true,
          lines: { select: { category: true, quantity: true, visitDate: true } },
        },
      })
    : null

  if (!order) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-4xl">We couldn&rsquo;t find that booking</h1>
        <p className="text-night-50/70">
          If you were charged, your confirmation email has the details. Otherwise, please{' '}
          <Link href="/tickets" className="text-ember-400 underline">
            start a new booking
          </Link>
          .
        </p>
      </div>
    )
  }

  const settled = order.status === 'paid'

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">
        {settled ? 'Booking confirmed' : 'Payment still processing'}
      </h1>
      <p className="text-night-50/80">
        {settled
          ? `Your tickets are on the way to ${order.email}.`
          : 'Your bank has not confirmed the payment yet. We will email you as soon as it settles.'}
      </p>

      <dl className="space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-night-50/60">Reference</dt>
          <dd className="font-mono">{order.id}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-night-50/60">Total</dt>
          <dd>{formatCents(order.subtotalCents)}</dd>
        </div>
      </dl>

      <ul className="space-y-1 text-sm text-night-50/80">
        {order.lines.map((line, index) => (
          <li key={`${line.category}-${index}`}>
            {line.quantity} × <span className="capitalize">{line.category}</span> — {line.visitDate}
          </li>
        ))}
      </ul>
    </div>
  )
}
