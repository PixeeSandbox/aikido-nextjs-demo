import type { LineItem, TicketCategory } from './pricing'

export interface CartEntry extends LineItem {
  ticketTypeId: string
  visitDate: string
  label: string
}

export interface Cart {
  entries: CartEntry[]
  updatedAt: string
}

export const EMPTY_CART: Cart = { entries: [], updatedAt: new Date(0).toISOString() }

const MAX_QUANTITY_PER_ENTRY = 12
const MAX_ENTRIES = 20

function entryKey(entry: Pick<CartEntry, 'ticketTypeId' | 'visitDate' | 'category'>): string {
  return `${entry.ticketTypeId}|${entry.visitDate}|${entry.category}`
}

export function addEntry(cart: Cart, entry: CartEntry, now = new Date()): Cart {
  const key = entryKey(entry)
  const existing = cart.entries.find((e) => entryKey(e) === key)

  if (!existing && cart.entries.length >= MAX_ENTRIES) {
    throw new Error('Cart is full')
  }

  const entries = existing
    ? cart.entries.map((e) =>
        entryKey(e) === key
          ? { ...e, quantity: Math.min(e.quantity + entry.quantity, MAX_QUANTITY_PER_ENTRY) }
          : e
      )
    : [...cart.entries, { ...entry, quantity: Math.min(entry.quantity, MAX_QUANTITY_PER_ENTRY) }]

  return { entries, updatedAt: now.toISOString() }
}

export function removeEntry(cart: Cart, key: string, now = new Date()): Cart {
  return {
    entries: cart.entries.filter((e) => entryKey(e) !== key),
    updatedAt: now.toISOString(),
  }
}

export function setQuantity(cart: Cart, key: string, quantity: number, now = new Date()): Cart {
  if (quantity <= 0) return removeEntry(cart, key, now)

  return {
    entries: cart.entries.map((e) =>
      entryKey(e) === key ? { ...e, quantity: Math.min(quantity, MAX_QUANTITY_PER_ENTRY) } : e
    ),
    updatedAt: now.toISOString(),
  }
}

export function totalAdmissions(cart: Cart): number {
  return cart.entries.reduce((sum, e) => sum + e.quantity, 0)
}

export function categoriesInCart(cart: Cart): TicketCategory[] {
  return [...new Set(cart.entries.map((e) => e.category))]
}

/** Distinct visit dates, ascending — a cart may span multiple days. */
export function visitDates(cart: Cart): string[] {
  return [...new Set(cart.entries.map((e) => e.visitDate))].sort()
}
