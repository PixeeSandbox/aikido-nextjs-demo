import type { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/lib/prisma'

interface HealthPayload {
  status: 'ok' | 'degraded'
  database: 'up' | 'down'
  commit: string | null
  uptimeSeconds: number
}

/**
 * Kept on the Pages Router: the uptime monitor and the Kubernetes readiness probe
 * were both configured against this path years before the App Router migration.
 */
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<HealthPayload>
) {
  let database: 'up' | 'down' = 'up'

  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    database = 'down'
  }

  res.status(database === 'up' ? 200 : 503).json({
    status: database === 'up' ? 'ok' : 'degraded',
    database,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    uptimeSeconds: Math.round(process.uptime()),
  })
}
