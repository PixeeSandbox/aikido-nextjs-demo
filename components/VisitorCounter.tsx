'use client'

import { useEffect, useState } from 'react'

interface OccupancyPayload {
  onSite: number
  capacity: number
}

const POLL_MS = 30_000

/** Live gate occupancy shown on the on-site kiosk build only. */
export function VisitorCounter() {
  const [occupancy, setOccupancy] = useState<OccupancyPayload | null>(null)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch('/api/legacy/orders?view=occupancy', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as OccupancyPayload
        if (!cancelled) setOccupancy(data)
      } catch {
        // Kiosk network is flaky; a missed poll is not worth surfacing.
      }
    }

    poll()
    const timer = setInterval(poll, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  if (!occupancy) return null

  const pct = Math.round((occupancy.onSite / occupancy.capacity) * 100)

  return (
    <p className="text-sm text-night-50/70" aria-live="polite">
      {occupancy.onSite} visitors on site ({pct}% of capacity)
    </p>
  )
}
