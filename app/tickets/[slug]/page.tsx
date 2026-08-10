import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DatePicker } from '@/components/DatePicker'
import { formatCents, DEFAULT_TIERS, unitPriceCents } from '@/lib/pricing'
import { getTicketType, getTicketTypes } from '@/lib/sanity/queries'

export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const types = await getTicketTypes()
  return types.map((type) => ({ slug: type.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const ticketType = await getTicketType(slug)
  if (!ticketType) return { title: 'Ticket not found' }

  return {
    title: ticketType.title,
    description: ticketType.summary,
    openGraph: {
      images: [`/api/og?title=${encodeURIComponent(ticketType.title)}&kicker=Admission`],
    },
  }
}

export default async function TicketTypePage({ params }: PageProps) {
  const { slug } = await params
  const ticketType = await getTicketType(slug)
  if (!ticketType) notFound()

  const visitDate = new Date()
  const tiers = DEFAULT_TIERS.filter((tier) => ticketType.categories.includes(tier.category))

  return (
    <article className="space-y-10">
      <header className="space-y-3">
        <h1 className="font-display text-4xl">{ticketType.title}</h1>
        {ticketType.summary ? (
          <p className="max-w-2xl text-night-50/80">{ticketType.summary}</p>
        ) : null}
      </header>

      <section>
        <h2 className="mb-4 font-display text-2xl">Prices today</h2>
        <table className="w-full max-w-md text-left">
          <thead className="text-sm uppercase tracking-wide text-night-50/60">
            <tr>
              <th className="pb-2">Category</th>
              <th className="pb-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr key={tier.category} className="border-t border-night-800">
                <td className="py-2 capitalize">{tier.category}</td>
                <td className="py-2">{formatCents(unitPriceCents(tier, { visitDate }))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm text-night-50/60">
          Weekend visits carry a 15% surcharge. Booking 21 days ahead saves 8%.
        </p>
      </section>

      {ticketType.timedEntry ? (
        <section>
          <h2 className="mb-4 font-display text-2xl">Choose a date</h2>
          <DatePicker ticketTypeId={ticketType._id} />
        </section>
      ) : null}
    </article>
  )
}
