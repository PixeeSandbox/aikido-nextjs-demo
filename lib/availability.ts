import { addMinutes, format, isBefore, startOfDay } from 'date-fns'

import { prisma } from './prisma'

export interface EntrySlot {
  /** ISO timestamp for the start of the timed-entry window. */
  startsAt: string
  capacity: number
  booked: number
}

export interface SlotAvailability extends EntrySlot {
  remaining: number
  soldOut: boolean
}

const SLOT_MINUTES = 30
const FIRST_ENTRY_MINUTES = 9 * 60
const LAST_ENTRY_MINUTES = 16 * 60

export function slotStartsForDay(day: Date): Date[] {
  const base = startOfDay(day)
  const starts: Date[] = []
  for (let m = FIRST_ENTRY_MINUTES; m <= LAST_ENTRY_MINUTES; m += SLOT_MINUTES) {
    starts.push(addMinutes(base, m))
  }
  return starts
}

export function withRemaining(slot: EntrySlot): SlotAvailability {
  const remaining = Math.max(slot.capacity - slot.booked, 0)
  return { ...slot, remaining, soldOut: remaining === 0 }
}

export async function availabilityForDay(
  ticketTypeId: string,
  day: Date,
  now = new Date()
): Promise<SlotAvailability[]> {
  const rows = await prisma.entrySlot.findMany({
    where: { ticketTypeId, day: format(day, 'yyyy-MM-dd') },
    select: { startsAt: true, capacity: true, booked: true },
    orderBy: { startsAt: 'asc' },
  })

  const bySlot = new Map(rows.map((r) => [r.startsAt.toISOString(), r]))

  return slotStartsForDay(day)
    .filter((start) => !isBefore(start, now))
    .map((start) => {
      const row = bySlot.get(start.toISOString())
      return withRemaining({
        startsAt: start.toISOString(),
        capacity: row?.capacity ?? 0,
        booked: row?.booked ?? 0,
      })
    })
}

export function firstAvailable(slots: readonly SlotAvailability[]): SlotAvailability | undefined {
  return slots.find((s) => !s.soldOut)
}
