import { sanitizeUrl } from '@braintree/sanitize-url'
import DOMPurify from 'isomorphic-dompurify'
import * as yup from 'yup'

export const TICKET_CATEGORIES = ['adult', 'child', 'senior', 'student', 'member'] as const

export const cartEntrySchema = yup.object({
  ticketTypeId: yup.string().trim().min(1).required(),
  visitDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'visitDate must be YYYY-MM-DD')
    .required(),
  category: yup.mixed<(typeof TICKET_CATEGORIES)[number]>().oneOf(TICKET_CATEGORIES).required(),
  quantity: yup.number().integer().min(1).max(12).required(),
})

export const checkoutSchema = yup.object({
  email: yup.string().email().required(),
  name: yup.string().trim().min(2).max(120).required(),
  entries: yup.array().of(cartEntrySchema).min(1).max(20).required(),
  giftAidOptIn: yup.boolean().default(false),
  notes: yup.string().max(500).optional(),
})

export const revalidatePayloadSchema = yup.object({
  _type: yup.string().required(),
  slug: yup.string().optional(),
})

export type CheckoutPayload = yup.InferType<typeof checkoutSchema>
export type CartEntryPayload = yup.InferType<typeof cartEntrySchema>

/** Editorial rich text arrives from Sanity; strip anything script-like before render. */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'blockquote'],
    ALLOWED_ATTR: ['href', 'title'],
  })
}

export function safeExternalUrl(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined
  const cleaned = sanitizeUrl(raw.trim())
  return cleaned === 'about:blank' ? undefined : cleaned
}

export async function parseCheckout(body: unknown): Promise<CheckoutPayload> {
  return checkoutSchema.validate(body, { abortEarly: false, stripUnknown: true })
}
