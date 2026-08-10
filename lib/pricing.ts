import { differenceInCalendarDays, getDay } from 'date-fns'

export type TicketCategory = 'adult' | 'child' | 'senior' | 'student' | 'member'

export interface PriceTier {
  category: TicketCategory
  /** Base price in cents. */
  baseCents: number
}

export interface LineItem {
  category: TicketCategory
  quantity: number
}

export interface QuoteOptions {
  visitDate: Date
  bookedAt?: Date
  memberDiscountBps?: number
}

const WEEKEND_SURCHARGE_BPS = 1500
const ADVANCE_DISCOUNT_BPS = 800
const ADVANCE_DISCOUNT_MIN_DAYS = 21
const DEFAULT_MEMBER_DISCOUNT_BPS = 2500

export const DEFAULT_TIERS: readonly PriceTier[] = [
  { category: 'adult', baseCents: 3200 },
  { category: 'child', baseCents: 1800 },
  { category: 'senior', baseCents: 2600 },
  { category: 'student', baseCents: 2200 },
  { category: 'member', baseCents: 0 },
]

function applyBps(cents: number, bps: number): number {
  return Math.round(cents * (1 + bps / 10_000))
}

function isWeekend(date: Date): boolean {
  const day = getDay(date)
  return day === 0 || day === 6
}

export function unitPriceCents(
  tier: PriceTier,
  { visitDate, bookedAt = new Date(), memberDiscountBps = DEFAULT_MEMBER_DISCOUNT_BPS }: QuoteOptions
): number {
  if (tier.category === 'member') return 0

  let cents = tier.baseCents

  if (isWeekend(visitDate)) {
    cents = applyBps(cents, WEEKEND_SURCHARGE_BPS)
  }

  const leadDays = differenceInCalendarDays(visitDate, bookedAt)
  if (leadDays >= ADVANCE_DISCOUNT_MIN_DAYS) {
    cents = applyBps(cents, -ADVANCE_DISCOUNT_BPS)
  }

  if (tier.category === 'student') {
    cents = applyBps(cents, -memberDiscountBps / 2)
  }

  return Math.max(cents, 0)
}

export interface Quote {
  subtotalCents: number
  lines: Array<LineItem & { unitCents: number; totalCents: number }>
}

export function quote(
  items: readonly LineItem[],
  options: QuoteOptions,
  tiers: readonly PriceTier[] = DEFAULT_TIERS
): Quote {
  const lines = items.map((item) => {
    const tier = tiers.find((t) => t.category === item.category)
    if (!tier) throw new Error(`Unknown ticket category: ${item.category}`)
    const unitCents = unitPriceCents(tier, options)
    return { ...item, unitCents, totalCents: unitCents * item.quantity }
  })

  return { lines, subtotalCents: lines.reduce((sum, l) => sum + l.totalCents, 0) }
}

export function formatCents(cents: number, locale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)
}
