import type { Metadata } from 'next'

import { TicketCard } from '@/components/TicketCard'
import { getTicketTypes } from '@/lib/sanity/queries'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Admission & tickets',
  description: 'Timed-entry admission, planetarium shows, and annual membership.',
}

export default async function TicketsPage() {
  const ticketTypes = await getTicketTypes()
  const timed = ticketTypes.filter((t) => t.timedEntry)
  const anytime = ticketTypes.filter((t) => !t.timedEntry)

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <h1 className="font-display text-4xl">Admission &amp; tickets</h1>
        <p className="max-w-2xl text-night-50/80">
          Dome and planetarium entries are timed to keep viewing groups small. Grounds and trail
          admission can be used any time during opening hours.
        </p>
      </header>

      <section>
        <h2 className="mb-4 font-display text-2xl">Timed entry</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {timed.map((type) => (
            <TicketCard key={type._id} ticketType={type} />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl">Any time during opening hours</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {anytime.map((type) => (
            <TicketCard key={type._id} ticketType={type} />
          ))}
        </ul>
      </section>
    </div>
  )
}
