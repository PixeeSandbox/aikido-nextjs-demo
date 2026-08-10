import { NextResponse } from 'next/server'

import { availabilityForDay, firstAvailable } from '@/lib/availability'

export const runtime = 'nodejs'
export const revalidate = 60

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const ticketTypeId = params.get('ticketTypeId')
  const day = params.get('day')

  if (!ticketTypeId || !day) {
    return NextResponse.json({ error: 'ticketTypeId and day are required' }, { status: 400 })
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return NextResponse.json({ error: 'day must be YYYY-MM-DD' }, { status: 400 })
  }

  const parsed = new Date(`${day}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) {
    return NextResponse.json({ error: 'unparseable day' }, { status: 400 })
  }

  const slots = await availabilityForDay(ticketTypeId, parsed)

  return NextResponse.json(
    {
      day,
      ticketTypeId,
      slots,
      nextAvailable: firstAvailable(slots)?.startsAt ?? null,
    },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  )
}
