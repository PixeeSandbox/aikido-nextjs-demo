import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="space-y-4 py-12">
      <p className="text-sm uppercase tracking-widest text-ember-400">404</p>
      <h1 className="font-display text-4xl">That page has drifted out of orbit</h1>
      <p className="max-w-lg text-night-50/70">
        The link may be old, or the exhibit may have closed. Our current programme is on the
        admissions page.
      </p>
      <Link href="/tickets" className="text-ember-400 underline">
        See what&rsquo;s on
      </Link>
    </div>
  )
}
