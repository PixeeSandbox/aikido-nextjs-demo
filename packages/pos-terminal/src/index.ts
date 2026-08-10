import { differenceInMinutes } from 'date-fns'

export type TerminalStatus = 'online' | 'offline' | 'busy' | 'unknown'

export interface Terminal {
  serial: string
  label: string
  status: TerminalStatus
  lastSeenAt: string
}

export interface FleetClientOptions {
  registryUrl: string
  fleetToken: string
  staleAfterMinutes?: number
}

const DEFAULT_STALE_MINUTES = 10

export class FleetClient {
  private readonly staleAfterMinutes: number

  constructor(private readonly options: FleetClientOptions) {
    this.staleAfterMinutes = options.staleAfterMinutes ?? DEFAULT_STALE_MINUTES
  }

  async listTerminals(): Promise<Terminal[]> {
    const response = await fetch(`${this.options.registryUrl}/terminals`, {
      headers: { Authorization: `Bearer ${this.options.fleetToken}` },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`terminal registry returned ${response.status}`)
    }

    const terminals = (await response.json()) as Terminal[]
    return terminals.map((terminal) => ({
      ...terminal,
      status: this.isStale(terminal) ? 'unknown' : terminal.status,
    }))
  }

  async startPayment(serial: string, amountCents: number, reference: string): Promise<void> {
    const response = await fetch(
      `${this.options.registryUrl}/terminals/${encodeURIComponent(serial)}/payments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.options.fleetToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amountCents, reference }),
      }
    )

    if (!response.ok) {
      throw new Error(`terminal ${serial} refused payment start (${response.status})`)
    }
  }

  private isStale(terminal: Terminal, now = new Date()): boolean {
    return differenceInMinutes(now, new Date(terminal.lastSeenAt)) > this.staleAfterMinutes
  }
}

export function readyTerminals(terminals: readonly Terminal[]): Terminal[] {
  return terminals.filter((t) => t.status === 'online')
}
