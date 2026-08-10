# Cedarwood Observatory

Public-facing storefront and admissions system for the Cedarwood Observatory & Science
Park. Next.js App Router front end, Sanity Studio for editorial content, Prisma/Postgres
for orders and timed-entry inventory, and a vendored card-present SDK for on-site
terminals.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| CMS | Sanity v5, Studio mounted at `/studio` |
| Database | Postgres via Prisma 5 |
| Auth | NextAuth (credentials + magic link) |
| Styling | Tailwind + styled-components (Sanity UI requires the latter) |
| Images | `sharp` for OG rendering and ticket-PDF thumbnails |
| Payments | `checkout-sdk` (vendored tarball), `@cedarwood/pos-terminal` for card-present |
| Tests | Jest + Testing Library, Playwright for e2e |
| Package manager | pnpm 11 workspace |

## Getting started

```bash
nvm use                # Node 24, pinned in .nvmrc
pnpm install
cp .env.example .env
docker compose -f docker-compose-postgres.yml up -d
pnpm run apply-migration
pnpm dev
```

The app runs at http://localhost:3000, the Studio at http://localhost:3000/studio.

## Repository layout

```
app/                 App Router routes, route handlers, Studio mount
components/          Presentational + client components
lib/                 Server-side helpers (auth, prisma, sanity, pricing, images)
pages/api/           Two legacy Pages Router endpoints kept for external callers
prisma/              Split schema; concatenated into schema.prisma at build time
migrations/          Checked-in SQL migrations
schemas/             Sanity document + object schemas
packages/            pnpm workspace members (checkout-sdk, pos-terminal)
scripts/             Build/CI helper scripts
e2e/                 Playwright specs
```

## A note on the Prisma schema

`prisma/schema.prisma` is **generated**, not authored. `pnpm run make-prisma-schema`
concatenates `prisma/base.prisma` with everything in `prisma/models/`. Edit the parts,
never the concatenation — the generated file is gitignored.

## Dependency management

This is a **pnpm 11** workspace, which changes where resolution settings live:

- `overrides`, `allowBuilds`, `minimumReleaseAgeExclude`, and
  `ignoredOptionalDependencies` all live in **`pnpm-workspace.yaml`**.
- A `"pnpm"` key in `package.json` is **ignored** by pnpm 11. If you need to force a
  transitive dependency to a patched version, add it to the `overrides:` block in
  `pnpm-workspace.yaml` — putting it in `package.json` will look correct in review and
  silently do nothing.

The Next.js packages are version-locked as a set. `next`, `@next/third-parties`,
`@next/env`, and `eslint-config-next` must be bumped together; mixing minor lines
produces confusing build-time type errors in the App Router.

The two `file:` tarball dependencies under `packages/` are card-present SDKs distributed
by our payments vendor under NDA and are not on the public registry. They are excluded
from `minimumReleaseAge` checks because they carry no registry publish timestamp.

## Scripts worth knowing

| Script | Does |
|---|---|
| `pnpm run type-check` | `tsc --noEmit` across the workspace |
| `pnpm run deps:report` | Prints direct vs transitive dependency counts per workspace |
| `pnpm run validate:terminals` | Smoke-checks POS terminal reachability before a deploy |
| `pnpm run test:e2e:staging` | Runs Playwright against staging |
