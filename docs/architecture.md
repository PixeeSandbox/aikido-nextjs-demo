# Architecture notes

## Rendering strategy

Everything visitor-facing is a server component with a revalidation window:

| Route | Strategy | Window |
|---|---|---|
| `/` | ISR | 600s |
| `/tickets`, `/tickets/[slug]` | ISR + `generateStaticParams` | 300s |
| `/shop`, `/shop/[slug]` | ISR + `generateStaticParams` | 600s |
| `/cart`, `/checkout` | Client component | — |
| `/checkout/confirmation`, `/account` | `force-dynamic` | — |
| `/studio/[[...tool]]` | `force-static`, hydrated client-side | — |

Sanity publishes hit `POST /api/revalidate`, which verifies the webhook signature and
calls `revalidatePath` for the affected routes plus `revalidateTag` for the document type.
Nothing else invalidates the cache — if content looks stale, check the webhook delivery
log before touching revalidation windows.

## Timed-entry inventory

`EntrySlot` is the source of truth for capacity, keyed `(ticketTypeId, startsAt)` with a
denormalised `day` column so the availability endpoint avoids a timezone-sensitive range
scan. Slot grid generation lives in `lib/availability.ts` and is pure — the half-hourly
09:00–16:00 grid is computed, not stored, and rows only exist for slots with capacity
assigned.

`booked` is incremented inside the order transaction, not on payment settlement. A failed
payment therefore holds inventory until the order is swept — a known trade-off that
favours not overselling the dome.

## Payments

Two paths, one PSP:

- **Online** — `lib/payments.ts` wraps the vendored `checkout-sdk` tarball. The storefront
  never sees card data; we open a hosted session and hand back `sessionData`.
- **Card present** — `@cedarwood/pos-terminal` talks to the terminal registry over the
  internal network. Terminals go `unknown` rather than `online` after 10 minutes of
  silence so a partitioned desk does not look healthy.

Settlement is webhook-driven (`POST /api/webhooks/payments`). The handler is idempotent
via a `status IN ('pending','failed')` guard on the update, so duplicate PSP deliveries
are acknowledged as no-ops instead of double-marking an order paid.

## Why both routers

`pages/api/health.ts` and `pages/api/legacy/orders.ts` stay on the Pages Router. The
readiness probe and the on-site kiosk firmware are both pinned to those paths, and the
kiosks cannot be updated remotely. Everything else moved to the App Router. Do not
"finish the migration" by moving these two without a coordinated kiosk rollout.

## Dependency policy

See the README for the pnpm 11 override rules. Two things bite repeatedly:

1. **Overrides in the wrong file.** pnpm 11 reads `overrides` from
   `pnpm-workspace.yaml`. A `pnpm.overrides` block in `package.json` is silently ignored,
   which means a transitive CVE "fix" can merge green and remediate nothing. CI rejects
   the `pnpm` key outright for this reason.
2. **Partial Next.js bumps.** `next`, `@next/third-parties`, `@next/env`, and
   `eslint-config-next` share a release line. Bumping `next` alone produces App Router
   type errors that read like unrelated breakage. `pnpm run deps:report` prints these
   four pins together so a mismatch is obvious in review.
