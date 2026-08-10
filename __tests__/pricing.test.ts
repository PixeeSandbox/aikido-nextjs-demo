import { DEFAULT_TIERS, formatCents, quote, unitPriceCents } from '@/lib/pricing'

const adult = DEFAULT_TIERS.find((t) => t.category === 'adult')!
const member = DEFAULT_TIERS.find((t) => t.category === 'member')!

// 2026-09-16 is a Wednesday; 2026-09-19 is a Saturday.
const WEEKDAY = new Date('2026-09-16T10:00:00Z')
const WEEKEND = new Date('2026-09-19T10:00:00Z')
const BOOKED_AT = new Date('2026-09-15T10:00:00Z')

describe('unitPriceCents', () => {
  it('returns the base price for a weekday visit booked at short notice', () => {
    expect(unitPriceCents(adult, { visitDate: WEEKDAY, bookedAt: BOOKED_AT })).toBe(3200)
  })

  it('applies the weekend surcharge', () => {
    expect(unitPriceCents(adult, { visitDate: WEEKEND, bookedAt: BOOKED_AT })).toBe(3680)
  })

  it('applies the advance discount at 21 days lead time', () => {
    const bookedAt = new Date('2026-08-26T10:00:00Z')
    expect(unitPriceCents(adult, { visitDate: WEEKDAY, bookedAt })).toBe(2944)
  })

  it('does not apply the advance discount at 20 days lead time', () => {
    const bookedAt = new Date('2026-08-27T10:00:00Z')
    expect(unitPriceCents(adult, { visitDate: WEEKDAY, bookedAt })).toBe(3200)
  })

  it('always prices member admission at zero', () => {
    expect(unitPriceCents(member, { visitDate: WEEKEND, bookedAt: BOOKED_AT })).toBe(0)
  })
})

describe('quote', () => {
  it('sums line totals', () => {
    const result = quote(
      [
        { category: 'adult', quantity: 2 },
        { category: 'child', quantity: 1 },
      ],
      { visitDate: WEEKDAY, bookedAt: BOOKED_AT }
    )

    expect(result.lines).toHaveLength(2)
    expect(result.subtotalCents).toBe(3200 * 2 + 1800)
  })

  it('throws on an unknown category', () => {
    expect(() =>
      quote([{ category: 'adult', quantity: 1 }], { visitDate: WEEKDAY }, [])
    ).toThrow(/Unknown ticket category/)
  })
})

describe('formatCents', () => {
  it('renders whole and fractional dollars', () => {
    expect(formatCents(3200)).toBe('$32.00')
    expect(formatCents(2944)).toBe('$29.44')
  })
})
