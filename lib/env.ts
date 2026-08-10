import { loadEnvConfig } from '@next/env'
import * as yup from 'yup'

// Route handlers and scripts can both reach this module; @next/env makes the
// .env resolution order identical in either context.
if (!process.env.NEXT_RUNTIME) {
  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production')
}

const serverSchema = yup.object({
  DATABASE_URL: yup.string().required(),
  NEXTAUTH_SECRET: yup.string().min(16).required(),
  NEXTAUTH_URL: yup.string().url().required(),
  EMAIL_SERVER: yup.string().optional(),
  SANITY_API_READ_TOKEN: yup.string().optional(),
  SANITY_REVALIDATE_SECRET: yup.string().optional(),
  CHECKOUT_MERCHANT_ID: yup.string().required(),
  CHECKOUT_API_KEY: yup.string().required(),
  CHECKOUT_ENVIRONMENT: yup
    .mixed<'sandbox' | 'live'>()
    .oneOf(['sandbox', 'live'])
    .default('sandbox'),
  CHECKOUT_WEBHOOK_SECRET: yup.string().optional(),
  POS_TERMINAL_REGISTRY_URL: yup.string().url().optional(),
  POS_TERMINAL_FLEET_TOKEN: yup.string().optional(),
})

const publicSchema = yup.object({
  NEXT_PUBLIC_SANITY_PROJECT_ID: yup.string().required(),
  NEXT_PUBLIC_SANITY_DATASET: yup.string().default('production'),
  NEXT_PUBLIC_SANITY_API_VERSION: yup.string().default('2026-01-15'),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: yup.string().optional(),
})

export type ServerEnv = yup.InferType<typeof serverSchema>
export type PublicEnv = yup.InferType<typeof publicSchema>

function parse<T>(schema: yup.Schema<T>, label: string): T {
  try {
    return schema.validateSync(process.env, { abortEarly: false, stripUnknown: true })
  } catch (err) {
    const issues = err instanceof yup.ValidationError ? err.errors.join('; ') : String(err)
    throw new Error(`Invalid ${label} environment: ${issues}`)
  }
}

// Public env is safe to evaluate eagerly — it is inlined at build time anyway.
export const publicEnv: PublicEnv = parse(publicSchema, 'public')

let cachedServerEnv: ServerEnv | undefined

export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, key: string) {
    cachedServerEnv ??= parse(serverSchema, 'server')
    return cachedServerEnv[key as keyof ServerEnv]
  },
})
