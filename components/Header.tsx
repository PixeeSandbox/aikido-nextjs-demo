import Link from 'next/link'

const NAV = [
  { href: '/tickets', label: 'Tickets' },
  { href: '/shop', label: 'Shop' },
  { href: '/cart', label: 'Basket' },
  { href: '/account', label: 'Account' },
] as const

export function Header() {
  return (
    <header className="starfield border-b border-night-800">
      <div className="mx-auto flex w-full max-w-content items-center justify-between px-4 py-5">
        <Link href="/" className="font-display text-xl leading-none">
          Cedarwood
          <span className="block text-xs uppercase tracking-widest text-ember-400">
            Observatory
          </span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex gap-5 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-ember-400">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
