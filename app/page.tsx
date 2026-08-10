import Link from 'next/link'

import { getExhibits, getTicketTypes } from '@/lib/sanity/queries'

export const revalidate = 600

export default async function HomePage() {
  const [ticketTypes, exhibits] = await Promise.all([getTicketTypes(), getExhibits()])
  const nowShowing = exhibits.slice(0, 3)

  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-widest text-ember-400">Open Wed–Sun</p>
        <h1 className="font-display text-5xl leading-tight">
          Twelve acres of sky, rock, and deep time
        </h1>
        <p className="max-w-2xl text-lg text-night-50/80">
          Book timed entry to the observatory dome, walk the Cretaceous trail, and catch a
          planetarium show under our 18-metre projection sky.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/tickets"
            className="rounded bg-ember-500 px-5 py-3 font-medium text-night-900 hover:bg-ember-400"
          >
            Book admission
          </Link>
          <Link href="/shop" className="rounded border border-night-500 px-5 py-3 hover:bg-night-800">
            Visit the shop
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-6 font-display text-3xl">Admission types</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ticketTypes.map((type) => (
            <li key={type._id} className="rounded-lg border border-night-500 p-5">
              <h3 className="font-display text-xl">
                <Link href={`/tickets/${type.slug}`} className="hover:text-ember-400">
                  {type.title}
                </Link>
              </h3>
              {type.summary ? (
                <p className="mt-2 text-sm text-night-50/70">{type.summary}</p>
              ) : null}
              {type.timedEntry ? (
                <p className="mt-3 text-xs uppercase tracking-wide text-moss-400">Timed entry</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-6 font-display text-3xl">Now showing</h2>
        <ul className="space-y-4">
          {nowShowing.map((exhibit) => (
            <li key={exhibit._id} className="border-b border-night-800 pb-4">
              <h3 className="font-display text-2xl">{exhibit.title}</h3>
              {exhibit.standfirst ? (
                <p className="mt-1 text-night-50/70">{exhibit.standfirst}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
