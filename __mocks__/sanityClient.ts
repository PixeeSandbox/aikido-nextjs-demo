import type { TicketTypeDoc } from '@/lib/sanity/queries'

export const TICKET_TYPE_FIXTURES: TicketTypeDoc[] = [
  {
    _id: 'tt-dome',
    title: 'Observatory dome',
    slug: 'observatory-dome',
    summary: 'Thirty minutes at the eyepiece of the 24-inch reflector.',
    categories: ['adult', 'child', 'senior'],
    timedEntry: true,
  },
  {
    _id: 'tt-grounds',
    title: 'Grounds & Cretaceous trail',
    slug: 'grounds-and-trail',
    summary: 'Self-guided access to the trail and outdoor exhibits.',
    categories: ['adult', 'child', 'senior', 'student', 'member'],
    timedEntry: false,
  },
]

export const sanityClient = {
  fetch: jest.fn(async (query: string) => {
    if (query.includes('_type == "ticketType"')) return TICKET_TYPE_FIXTURES
    return []
  }),
}

export function previewClient() {
  return sanityClient
}

export function clientFor() {
  return sanityClient
}
