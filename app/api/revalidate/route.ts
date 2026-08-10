import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

import { serverEnv } from '@/lib/env'
import { logger } from '@/lib/logger'
import { revalidatePayloadSchema } from '@/lib/validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PATHS_BY_TYPE: Record<string, (slug?: string) => string[]> = {
  ticketType: (slug) => ['/', '/tickets', ...(slug ? [`/tickets/${slug}`] : [])],
  product: (slug) => ['/shop', ...(slug ? [`/shop/${slug}`] : [])],
  exhibit: () => ['/'],
  page: (slug) => (slug ? [`/${slug}`] : ['/']),
}

export async function POST(request: Request) {
  const secret = serverEnv.SANITY_REVALIDATE_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'revalidation_not_configured' }, { status: 503 })
  }

  const raw = await request.text()
  const signature = request.headers.get(SIGNATURE_HEADER_NAME)

  if (!signature || !(await isValidSignature(raw, signature, secret))) {
    return NextResponse.json({ error: 'bad_signature' }, { status: 401 })
  }

  let payload
  try {
    payload = await revalidatePayloadSchema.validate(JSON.parse(raw), { stripUnknown: true })
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 422 })
  }

  const paths = PATHS_BY_TYPE[payload._type]?.(payload.slug) ?? []
  paths.forEach((path) => revalidatePath(path))
  revalidateTag(payload._type)

  logger.info('revalidated after Sanity publish', { type: payload._type, paths })
  return NextResponse.json({ revalidated: true, paths })
}
