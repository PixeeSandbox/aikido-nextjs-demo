import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/lib/prisma'

const SITE_CAPACITY = 1400

/**
 * Legacy endpoint consumed by the on-site kiosk firmware, which cannot be
 * updated remotely. Do not change the response shape without coordinating a
 * kiosk rollout — see docs/architecture.md.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  if (req.query.view === 'occupancy') {
    const today = new Date().toISOString().slice(0, 10)
    const scanned = await prisma.orderLine.aggregate({
      where: { visitDate: today },
      _sum: { quantity: true },
    })

    res.status(200).json({
      onSite: scanned._sum.quantity ?? 0,
      capacity: SITE_CAPACITY,
    })
    return
  }

  const orders = await prisma.order.findMany({
    where: { status: 'paid' },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, email: true, subtotalCents: true, createdAt: true },
  })

  res.status(200).json({ orders })
}
