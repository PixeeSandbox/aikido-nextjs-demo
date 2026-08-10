#!/usr/bin/env node
/**
 * Pre-deploy smoke check: can we reach the terminal registry and does every
 * admissions-desk terminal report in? Exits non-zero so CI blocks the deploy.
 */

const registryUrl = process.env.POS_TERMINAL_REGISTRY_URL
const fleetToken = process.env.POS_TERMINAL_FLEET_TOKEN

if (!registryUrl || !fleetToken) {
  console.error('POS_TERMINAL_REGISTRY_URL and POS_TERMINAL_FLEET_TOKEN must be set')
  process.exit(78) // EX_CONFIG
}

const EXPECTED_DESKS = ['desk-north', 'desk-south', 'desk-planetarium']
const TIMEOUT_MS = 10_000

const controller = new AbortController()
const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

try {
  const response = await fetch(`${registryUrl}/terminals`, {
    headers: { Authorization: `Bearer ${fleetToken}` },
    signal: controller.signal,
  })

  if (!response.ok) {
    console.error(`registry returned ${response.status}`)
    process.exit(1)
  }

  const terminals = await response.json()
  const byLabel = new Map(terminals.map((t) => [t.label, t]))
  const missing = EXPECTED_DESKS.filter((desk) => !byLabel.has(desk))
  const offline = EXPECTED_DESKS.filter((desk) => byLabel.get(desk)?.status === 'offline')

  if (missing.length > 0) console.error(`missing from registry: ${missing.join(', ')}`)
  if (offline.length > 0) console.error(`offline: ${offline.join(', ')}`)

  if (missing.length > 0 || offline.length > 0) process.exit(1)

  console.log(`all ${EXPECTED_DESKS.length} admissions desks reporting`)
} catch (err) {
  console.error(err instanceof Error ? err.message : 'unknown error contacting registry')
  process.exit(1)
} finally {
  clearTimeout(timer)
}
