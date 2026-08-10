import {
  addEntry,
  EMPTY_CART,
  removeEntry,
  setQuantity,
  totalAdmissions,
  visitDates,
  type CartEntry,
} from '@/lib/cart'

function entry(overrides: Partial<CartEntry> = {}): CartEntry {
  return {
    ticketTypeId: 'tt-dome',
    visitDate: '2026-09-16',
    category: 'adult',
    quantity: 2,
    label: 'Observatory dome',
    ...overrides,
  }
}

const KEY = 'tt-dome|2026-09-16|adult'

describe('addEntry', () => {
  it('adds a new entry', () => {
    const cart = addEntry(EMPTY_CART, entry())
    expect(cart.entries).toHaveLength(1)
    expect(totalAdmissions(cart)).toBe(2)
  })

  it('merges quantities for a matching type/date/category', () => {
    const cart = addEntry(addEntry(EMPTY_CART, entry()), entry({ quantity: 3 }))
    expect(cart.entries).toHaveLength(1)
    expect(totalAdmissions(cart)).toBe(5)
  })

  it('keeps entries separate when the date differs', () => {
    const cart = addEntry(addEntry(EMPTY_CART, entry()), entry({ visitDate: '2026-09-17' }))
    expect(cart.entries).toHaveLength(2)
  })

  it('caps a merged quantity at twelve', () => {
    const cart = addEntry(addEntry(EMPTY_CART, entry({ quantity: 10 })), entry({ quantity: 10 }))
    expect(totalAdmissions(cart)).toBe(12)
  })

  it('rejects a twenty-first distinct entry', () => {
    const full = Array.from({ length: 20 }).reduce<ReturnType<typeof addEntry>>(
      (cart, _, index) => addEntry(cart, entry({ visitDate: `2026-10-${String(index + 1).padStart(2, '0')}` })),
      EMPTY_CART
    )
    expect(() => addEntry(full, entry({ visitDate: '2026-11-01' }))).toThrow(/Cart is full/)
  })
})

describe('setQuantity', () => {
  it('updates the matching entry', () => {
    const cart = setQuantity(addEntry(EMPTY_CART, entry()), KEY, 5)
    expect(totalAdmissions(cart)).toBe(5)
  })

  it('removes the entry when set to zero', () => {
    const cart = setQuantity(addEntry(EMPTY_CART, entry()), KEY, 0)
    expect(cart.entries).toHaveLength(0)
  })
})

describe('removeEntry', () => {
  it('is a no-op for an unknown key', () => {
    const cart = removeEntry(addEntry(EMPTY_CART, entry()), 'nope')
    expect(cart.entries).toHaveLength(1)
  })
})

describe('visitDates', () => {
  it('returns distinct dates in ascending order', () => {
    const cart = addEntry(
      addEntry(addEntry(EMPTY_CART, entry({ visitDate: '2026-09-18' })), entry()),
      entry({ visitDate: '2026-09-17', category: 'child' })
    )
    expect(visitDates(cart)).toEqual(['2026-09-16', '2026-09-17', '2026-09-18'])
  })
})
