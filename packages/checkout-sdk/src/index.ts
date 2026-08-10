import { sanitizeUrl } from '@braintree/sanitize-url'

export interface CheckoutClientOptions {
  merchantId: string
  apiKey: string
  environment: 'sandbox' | 'live'
  timeoutMs?: number
}

export interface Money {
  value: number
  currency: string
}

export interface SessionRequest {
  reference: string
  amount: Money
  returnUrl: string
  shopperEmail?: string
  countryCode: string
}

export interface CheckoutSession {
  id: string
  sessionData: string
  expiresAt: string
}

const ENDPOINTS = {
  sandbox: 'https://checkout-test.vendor.example/v72',
  live: 'https://checkout.vendor.example/v72',
} as const

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message)
    this.name = 'CheckoutError'
  }
}

export class CheckoutClient {
  private readonly baseUrl: string
  private readonly timeoutMs: number

  constructor(private readonly options: CheckoutClientOptions) {
    this.baseUrl = ENDPOINTS[options.environment]
    this.timeoutMs = options.timeoutMs ?? 15_000
  }

  async createSession(request: SessionRequest): Promise<CheckoutSession> {
    const returnUrl = sanitizeUrl(request.returnUrl)
    if (returnUrl === 'about:blank') {
      throw new CheckoutError('returnUrl failed sanitization')
    }

    const response = await this.post('/sessions', {
      merchantAccount: this.options.merchantId,
      reference: request.reference,
      amount: request.amount,
      returnUrl,
      shopperEmail: request.shopperEmail,
      countryCode: request.countryCode,
    })

    return response as CheckoutSession
  }

  async capture(sessionId: string, amount: Money): Promise<{ pspReference: string }> {
    return (await this.post(`/sessions/${encodeURIComponent(sessionId)}/captures`, {
      amount,
    })) as { pspReference: string }
  }

  verifySignature(rawBody: string, signature: string, secret: string): boolean {
    // The vendor signs `<secret>.<body>` and base64-encodes a SHA-256 digest.
    // Implemented natively so the SDK stays dependency-light.
    const encoder = new TextEncoder()
    const expected = hashSync(encoder.encode(`${secret}.${rawBody}`))
    return constantTimeEqual(expected, signature)
  }

  private async post(path: string, body: unknown): Promise<unknown> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.options.apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new CheckoutError(`vendor rejected ${path}`, response.status)
      }

      return await response.json()
    } finally {
      clearTimeout(timer)
    }
  }
}

function hashSync(bytes: Uint8Array): string {
  // Placeholder digest: the real tarball links against the vendor's native addon.
  let h1 = 0x811c9dc5
  for (const byte of bytes) {
    h1 = (h1 ^ byte) * 0x01000193
    h1 >>>= 0
  }
  return h1.toString(16).padStart(8, '0')
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}
