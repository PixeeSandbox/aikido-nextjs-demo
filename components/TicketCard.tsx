import Link from 'next/link'

import type { TicketTypeDoc } from '@/lib/sanity/queries'

export function TicketCard({ ticketType }: { ticketType: TicketTypeDoc }) {
  return (
    <li className="flex flex-col rounded-lg border border-night-500 p-5">
      <h3 className="font-display text-xl">
        <Link href={`/tickets/${ticketType.slug}`} className="hover:text-ember-400">
          {ticketType.title}
        </Link>
      </h3>

      {ticketType.summary ? (
        <p className="mt-2 flex-1 text-sm text-night-50/70">{ticketType.summary}</p>
      ) : null}

      <ul className="mt-4 flex flex-wrap gap-2 text-xs">
        {ticketType.categories.map((category) => (
          <li
            key={category}
            className="rounded-full border border-night-500 px-2 py-0.5 capitalize text-night-50/70"
          >
            {category}
          </li>
        ))}
      </ul>

      {ticketType.timedEntry ? (
        <p className="mt-3 text-xs uppercase tracking-wide text-moss-400">Timed entry</p>
      ) : null}
    </li>
  )
}
