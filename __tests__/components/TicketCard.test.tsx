import { render, screen } from '@testing-library/react'

import { TicketCard } from '@/components/TicketCard'
import type { TicketTypeDoc } from '@/lib/sanity/queries'

function doc(overrides: Partial<TicketTypeDoc> = {}): TicketTypeDoc {
  return {
    _id: 'tt-dome',
    title: 'Observatory dome',
    slug: 'observatory-dome',
    summary: 'Thirty minutes at the eyepiece of the 24-inch reflector.',
    categories: ['adult', 'child'],
    timedEntry: true,
    ...overrides,
  }
}

describe('TicketCard', () => {
  it('links to the ticket type page', () => {
    render(
      <ul>
        <TicketCard ticketType={doc()} />
      </ul>
    )
    expect(screen.getByRole('link', { name: 'Observatory dome' })).toHaveAttribute(
      'href',
      '/tickets/observatory-dome'
    )
  })

  it('lists each admission category', () => {
    render(
      <ul>
        <TicketCard ticketType={doc()} />
      </ul>
    )
    expect(screen.getByText('adult')).toBeInTheDocument()
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('flags timed entry', () => {
    render(
      <ul>
        <TicketCard ticketType={doc()} />
      </ul>
    )
    expect(screen.getByText('Timed entry')).toBeInTheDocument()
  })

  it('omits the timed-entry flag for anytime admission', () => {
    render(
      <ul>
        <TicketCard ticketType={doc({ timedEntry: false })} />
      </ul>
    )
    expect(screen.queryByText('Timed entry')).not.toBeInTheDocument()
  })

  it('renders without a summary', () => {
    render(
      <ul>
        <TicketCard ticketType={doc({ summary: undefined })} />
      </ul>
    )
    expect(screen.getByRole('heading', { name: 'Observatory dome' })).toBeInTheDocument()
  })
})
