import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-night-800 py-10 text-sm text-night-50/60">
      <div className="mx-auto flex w-full max-w-content flex-col gap-4 px-4 sm:flex-row sm:justify-between">
        <div>
          <p>Cedarwood Observatory &amp; Science Park</p>
          <p>Ridge Road, Cedarwood · Open Wed–Sun, 09:00–17:00</p>
        </div>
        <nav aria-label="Footer">
          <ul className="space-y-1">
            <li>
              <Link href="/accessibility" className="hover:text-ember-400">
                Accessibility
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-ember-400">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/schools" className="hover:text-ember-400">
                Schools programme
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
