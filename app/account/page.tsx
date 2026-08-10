import { getServerSession } from 'next-auth'
import type { Metadata } from 'next'
import Link from 'next/link'

import { authOptions, hasStaffAccess, membershipIsActive } from '@/lib/auth'
import { formatCents } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your account',
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="font-display text-4xl">Sign in</h1>
        <p className="text-night-50/70">
          We&rsquo;ll email you a sign-in link. Staff should use the credentials form.
        </p>
        <Link href="/api/auth/signin" className="text-ember-400 underline">
          Continue to sign in
        </Link>
      </div>
    )
  }

  const orders = await prisma.order.findMany({
    where: { memberId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, createdAt: true, status: true, subtotalCents: true },
  })

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-4xl">Your account</h1>
        <p className="text-night-50/70">{session.user.email}</p>
        {membershipIsActive(session) ? (
          <p className="text-sm text-moss-400">
            Membership active until {session.user.membershipExpiresAt?.slice(0, 10)}
          </p>
        ) : (
          <p className="text-sm text-night-50/60">No active membership</p>
        )}
      </header>

      {hasStaffAccess(session) ? (
        <p className="rounded border border-night-500 bg-night-800 p-3 text-sm">
          Staff access enabled — the{' '}
          <Link href="/studio" className="text-ember-400 underline">
            content studio
          </Link>{' '}
          is available.
        </p>
      ) : null}

      <section>
        <h2 className="mb-3 font-display text-2xl">Recent bookings</h2>
        {orders.length === 0 ? (
          <p className="text-night-50/60">No bookings yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {orders.map((order) => (
              <li key={order.id} className="flex justify-between border-b border-night-800 pb-2">
                <span className="font-mono">{order.id.slice(0, 8)}</span>
                <span>{order.createdAt.toISOString().slice(0, 10)}</span>
                <span className="capitalize">{order.status}</span>
                <span>{formatCents(order.subtotalCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
