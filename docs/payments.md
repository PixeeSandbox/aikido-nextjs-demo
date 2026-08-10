# Payments runbook

## Environments

| Env | `CHECKOUT_ENVIRONMENT` | Endpoint |
|---|---|---|
| Local / CI | `sandbox` | `https://checkout-test.vendor.example/v72` |
| Staging | `sandbox` | same as local, separate merchant account |
| Production | `live` | `https://checkout.vendor.example/v72` |

`CHECKOUT_MERCHANT_ID` and `CHECKOUT_API_KEY` are required at boot — `lib/env.ts` throws
if either is missing rather than failing on the first checkout attempt.

## Order lifecycle

```
pending ──webhook: authorised──> paid
   │
   ├──webhook: refused/cancelled──> failed
   │
   └──session open failed──────────> failed
```

`paidAt` and `pspReference` are only written on the transition to `paid`. An order that
reaches `failed` can be retried by the visitor; that creates a *new* order rather than
reopening the old one, so the reference in a confirmation email is always unique.

## Webhook signature verification

The vendor signs `<secret>.<rawBody>`. Verification happens against the **raw** request
text, before JSON parsing — `request.text()` then `verifyWebhookSignature`. Do not move
the `JSON.parse` above the signature check; re-serialising the body changes the bytes and
every delivery starts failing.

Unsigned or badly-signed deliveries get a 401 and are logged at `warn`. Missing
`CHECKOUT_WEBHOOK_SECRET` fails closed: `verifyWebhookSignature` returns `false`, so a
misconfigured environment rejects all webhooks rather than trusting them.

## Common failures

**`payment_unavailable` (502) from `/api/checkout/session`.**
The order row is already created and marked `failed`. Check the vendor status page, then
the `checkout session opened` log line — its absence means we never got a session id.

**Orders stuck in `pending`.**
Webhook delivery failed. The PSP retries for 24h. Confirm the endpoint is reachable and
that `CHECKOUT_WEBHOOK_SECRET` matches the vendor dashboard; a rotated secret shows up as
a wall of 401s in the logs.

**Terminal shows `unknown` in the fleet list.**
Not an error state — it means the terminal has not checked in for over 10 minutes.
`pnpm run validate:terminals` distinguishes missing-from-registry from explicitly offline
and exits non-zero for either, which is what blocks a deploy.

**Inventory held by a failed payment.**
`booked` increments at order creation. Until the sweep runs, a failed payment holds its
slots. If a session is genuinely sold out but shows availability, reconcile `EntrySlot`
against paid `OrderLine` rows for that `(ticketTypeId, visitDate)`.
