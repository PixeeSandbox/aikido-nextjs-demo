'use client'

import { useFormik } from 'formik'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { EMPTY_CART } from '@/lib/cart'
import { checkoutSchema } from '@/lib/validation'

import { pushToast } from './Toast'

export function CheckoutForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const formik = useFormik({
    initialValues: { name: '', email: '', giftAidOptIn: false, notes: '' },
    validationSchema: checkoutSchema.omit(['entries']),
    onSubmit: async (values) => {
      setSubmitting(true)
      try {
        const response = await fetch('/api/checkout/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, entries: EMPTY_CART.entries }),
        })

        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string }
          throw new Error(body.error ?? `checkout failed (${response.status})`)
        }

        const { orderId } = (await response.json()) as { orderId: string }
        router.push(`/checkout/confirmation?orderId=${orderId}`)
      } catch (err) {
        pushToast({
          tone: 'error',
          message: err instanceof Error ? err.message : 'Checkout failed',
        })
      } finally {
        setSubmitting(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-5" noValidate>
      <div>
        <label className="field-label" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          className="field-input"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.name && formik.errors.name ? (
          <p className="field-error">{formik.errors.name}</p>
        ) : null}
      </div>

      <div>
        <label className="field-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="field-input"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.email && formik.errors.email ? (
          <p className="field-error">{formik.errors.email}</p>
        ) : null}
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          name="giftAidOptIn"
          type="checkbox"
          checked={formik.values.giftAidOptIn}
          onChange={formik.handleChange}
          className="mt-1"
        />
        <span>Add Gift Aid to my admission — it costs nothing extra.</span>
      </label>

      <div>
        <label className="field-label" htmlFor="notes">
          Access requirements (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="field-input"
          value={formik.values.notes}
          onChange={formik.handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-ember-500 px-5 py-3 font-medium text-night-900 disabled:opacity-60"
      >
        {submitting ? 'Opening secure payment…' : 'Pay securely'}
      </button>
    </form>
  )
}
