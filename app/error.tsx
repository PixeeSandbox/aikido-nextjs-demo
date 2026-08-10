'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('unhandled route error', { digest: error.digest, message: error.message })
  }, [error])

  return (
    <div className="space-y-4 py-12">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="max-w-lg text-night-50/70">
        The page failed to load. Bookings already paid for are unaffected — your confirmation email
        is the record.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-night-50/50">Reference: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="rounded border border-night-500 px-4 py-2 hover:bg-night-800"
      >
        Try again
      </button>
    </div>
  )
}
