'use client'

import { format } from 'date-fns'

import { removeEntry, setQuantity, type Cart } from '@/lib/cart'

interface CartDrawerProps {
  cart: Cart
  onChange: (next: Cart) => void
}

function keyFor(entry: Cart['entries'][number]): string {
  return `${entry.ticketTypeId}|${entry.visitDate}|${entry.category}`
}

export function CartDrawer({ cart, onChange }: CartDrawerProps) {
  return (
    <ul className="space-y-3">
      {cart.entries.map((entry) => {
        const key = keyFor(entry)
        return (
          <li
            key={key}
            className="flex flex-wrap items-center gap-4 border-b border-night-800 pb-3"
          >
            <div className="flex-1">
              <p className="font-medium">{entry.label}</p>
              <p className="text-sm text-night-50/60">
                <span className="capitalize">{entry.category}</span> ·{' '}
                {format(new Date(entry.visitDate), 'EEE d MMM yyyy')}
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <span className="sr-only">Quantity for {entry.label}</span>
              <input
                type="number"
                min={1}
                max={12}
                value={entry.quantity}
                onChange={(event) =>
                  onChange(setQuantity(cart, key, Number(event.target.value)))
                }
                className="field-input w-20"
              />
            </label>

            <button
              type="button"
              onClick={() => onChange(removeEntry(cart, key))}
              className="text-sm text-ember-400 underline"
            >
              Remove
            </button>
          </li>
        )
      })}
    </ul>
  )
}
