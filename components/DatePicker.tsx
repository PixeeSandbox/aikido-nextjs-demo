'use client'

import { addDays, format } from 'date-fns'
import { useEffect, useState } from 'react'

import type { SlotAvailability } from '@/lib/availability'

const DAYS_AHEAD = 30

interface AvailabilityResponse {
  slots: SlotAvailability[]
  nextAvailable: string | null
}

export function DatePicker({ ticketTypeId }: { ticketTypeId: string }) {
  const [day, setDay] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [slots, setSlots] = useState<SlotAvailability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ ticketTypeId, day })
    fetch(`/api/tickets/availability?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`availability lookup failed (${res.status})`)
        return res.json() as Promise<AvailabilityResponse>
      })
      .then((data) => setSlots(data.slots))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Could not load availability')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [ticketTypeId, day])

  const options = Array.from({ length: DAYS_AHEAD }, (_, i) =>
    format(addDays(new Date(), i), 'yyyy-MM-dd')
  )

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="field-label">Visit date</span>
        <select
          value={day}
          onChange={(event) => setDay(event.target.value)}
          className="field-input max-w-xs"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {format(new Date(option), 'EEE d MMM yyyy')}
            </option>
          ))}
        </select>
      </label>

      {loading ? <p className="text-sm text-night-50/60">Checking availability…</p> : null}
      {error ? <p className="field-error">{error}</p> : null}

      {!loading && !error ? (
        <ul className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <li key={slot.startsAt}>
              <button
                type="button"
                disabled={slot.soldOut}
                className="rounded border border-night-500 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                {format(new Date(slot.startsAt), 'HH:mm')}
                <span className="ml-2 text-xs text-night-50/50">
                  {slot.soldOut ? 'full' : `${slot.remaining} left`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
