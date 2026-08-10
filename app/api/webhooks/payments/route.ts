import { NextResponse } from 'next/server'

import { logger } from '@/lib/logger'
import { normalizeOutcome, verifyWebhookSignature } from '@/lib/payments'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface WebhookBody {
  reference?: string
  resultCode?: string
  pspReference?: string
}

export async function POST(request: Request) {
  const raw = await request.text()

  if (!verifyWebhookSignature(raw, request.headers.get('x-checkout-signature'))) {
    logger.warn('rejected payment webhook with bad signature')
    return NextResponse.json({ error: 'bad_signature' }, { status: 401 })
  }

  let body: WebhookBody
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'malformed_json' }, { status: 400 })
  }

  if (!body.reference || !body.resultCode) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const outcome = normalizeOutcome(body.resultCode)
  const status = outcome === 'authorised' ? 'paid' : outcome === 'pending' ? 'pending' : 'failed'

  const updated = await prisma.order.updateMany({
    where: { id: body.reference, status: { in: ['pending', 'failed'] } },
    data: { status, pspReference: body.pspReference ?? null, paidAt: status === 'paid' ? new Date() : null },
  })

  if (updated.count === 0) {
    // Duplicate delivery or an already-settled order; acknowledge so the PSP stops retrying.
    logger.info('payment webhook was a no-op', { reference: body.reference, outcome })
  }

  return NextResponse.json({ received: true, outcome })
}
