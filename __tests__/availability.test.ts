import { firstAvailable, slotStartsForDay, withRemaining } from '@/lib/availability'

describe('slotStartsForDay', () => {
  it('runs half-hourly from 09:00 to 16:00 inclusive', () => {
    const starts = slotStartsForDay(new Date('2026-09-16T00:00:00'))
    expect(starts).toHaveLength(15)
    expect(starts[0]!.getHours()).toBe(9)
    expect(starts.at(-1)!.getHours()).toBe(16)
  })
})

describe('withRemaining', () => {
  it('computes remaining capacity', () => {
    const slot = withRemaining({ startsAt: '2026-09-16T09:00:00Z', capacity: 40, booked: 12 })
    expect(slot.remaining).toBe(28)
    expect(slot.soldOut).toBe(false)
  })

  it('marks a full slot as sold out', () => {
    const slot = withRemaining({ startsAt: '2026-09-16T09:00:00Z', capacity: 40, booked: 40 })
    expect(slot.soldOut).toBe(true)
  })

  it('clamps oversold slots to zero rather than reporting negatives', () => {
    const slot = withRemaining({ startsAt: '2026-09-16T09:00:00Z', capacity: 40, booked: 44 })
    expect(slot.remaining).toBe(0)
    expect(slot.soldOut).toBe(true)
  })
})

describe('firstAvailable', () => {
  it('skips sold-out slots', () => {
    const slots = [
      withRemaining({ startsAt: '2026-09-16T09:00:00Z', capacity: 10, booked: 10 }),
      withRemaining({ startsAt: '2026-09-16T09:30:00Z', capacity: 10, booked: 3 }),
    ]
    expect(firstAvailable(slots)?.startsAt).toBe('2026-09-16T09:30:00Z')
  })

  it('returns undefined when everything is full', () => {
    const slots = [withRemaining({ startsAt: '2026-09-16T09:00:00Z', capacity: 5, booked: 5 })]
    expect(firstAvailable(slots)).toBeUndefined()
  })
})
