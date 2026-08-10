import { CheckoutClient, type CheckoutSession, type SessionRequest } from 'checkout-sdk'

import { serverEnv } from './env'
import { logger } from './logger'

let client: CheckoutClient | undefined

function checkout(): CheckoutClient {
  client ??= new CheckoutClient({
    merchantId: serverEnv.CHECKOUT_MERCHANT_ID,
    apiKey: serverEnv.CHECKOUT_API_KEY,
    environment: serverEnv.CHECKOUT_ENVIRONMENT,
    timeoutMs: 12_000,
  })
  return client
}

export interface CreateSessionInput {
  orderId: string
  amountCents: number
  currency?: string
  returnUrl: string
  customerEmail?: string
}

export async function createCheckoutSession({
  orderId,
  amountCents,
  currency = 'USD',
  returnUrl,
  customerEmail,
}: CreateSessionInput): Promise<CheckoutSession> {
  if (amountCents <= 0) {
    throw new Error('Cannot open a checkout session for a zero-value order')
  }

  const request: SessionRequest = {
    reference: orderId,
    amount: { value: amountCents, currency },
    returnUrl,
    shopperEmail: customerEmail,
    countryCode: 'US',
  }

  const session = await checkout().createSession(request)
  logger.info('checkout session opened', { orderId, sessionId: session.id })
  return session
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = serverEnv.CHECKOUT_WEBHOOK_SECRET
  if (!secret || !signature) return false
  return checkout().verifySignature(rawBody, signature, secret)
}

export type PaymentOutcome = 'authorised' | 'refused' | 'pending' | 'cancelled'

export function normalizeOutcome(raw: string): PaymentOutcome {
  switch (raw.toLowerCase()) {
    case 'authorised':
    case 'authorized':
    case 'settled':
      return 'authorised'
    case 'refused':
    case 'error':
      return 'refused'
    case 'cancelled':
    case 'canceled':
      return 'cancelled'
    default:
      return 'pending'
  }
}
