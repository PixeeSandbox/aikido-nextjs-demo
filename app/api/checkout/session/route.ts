import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { quote } from '@/lib/pricing'
import { createCheckoutSession } from '@/lib/payments'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { parseCheckout } from '@/lib/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let payload
  try {
    payload = await parseCheckout(await request.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_payload', detail: err instanceof Error ? err.message : 'unknown' },
      { status: 422 }
    )
  }

  const session = await getServerSession(authOptions)
  const visitDate = new Date(payload.entries[0]!.visitDate)
  const { subtotalCents } = quote(payload.entries, { visitDate })

  if (subtotalCents <= 0) {
    return NextResponse.json({ error: 'zero_value_order' }, { status: 400 })
  }

  const order = await prisma.order.create({
    data: {
      email: payload.email,
      name: payload.name,
      memberId: session?.user.id ?? null,
      subtotalCents,
      giftAidOptIn: payload.giftAidOptIn,
      notes: payload.notes ?? null,
      status: 'pending',
      lines: {
        create: payload.entries.map((entry) => ({
          ticketTypeId: entry.ticketTypeId,
          category: entry.category,
          quantity: entry.quantity,
          visitDate: entry.visitDate,
        })),
      },
    },
    select: { id: true },
  })

  try {
    const checkoutSession = await createCheckoutSession({
      orderId: order.id,
      amountCents: subtotalCents,
      returnUrl: new URL('/checkout/confirmation', request.url).toString(),
      customerEmail: payload.email,
    })

    return NextResponse.json({
      orderId: order.id,
      sessionId: checkoutSession.id,
      sessionData: checkoutSession.sessionData,
    })
  } catch (err) {
    logger.error('failed to open checkout session', {
      orderId: order.id,
      detail: err instanceof Error ? err.message : 'unknown',
    })
    await prisma.order.update({ where: { id: order.id }, data: { status: 'failed' } })
    return NextResponse.json({ error: 'payment_unavailable' }, { status: 502 })
  }
}
