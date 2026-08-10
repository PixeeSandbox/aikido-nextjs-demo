type Level = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 }

const threshold: Level =
  (process.env.LOG_LEVEL as Level | undefined) ??
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

const REDACTED_KEYS = new Set([
  'apiKey',
  'password',
  'passwordHash',
  'token',
  'secret',
  'authorization',
  'cardNumber',
])

function redact(context: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      REDACTED_KEYS.has(key) ? '[redacted]' : value,
    ])
  )
}

function emit(level: Level, message: string, context?: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[threshold]) return

  const line = JSON.stringify({
    level,
    message,
    ts: new Date().toISOString(),
    ...(context ? redact(context) : {}),
  })

  if (level === 'error' || level === 'warn') {
    console.error(line)
    return
  }
  process.stdout.write(`${line}\n`)
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => emit('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => emit('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => emit('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => emit('error', msg, ctx),
}
