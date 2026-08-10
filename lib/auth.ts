import { scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

import type { NextAuthOptions, Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'

import { prisma } from './prisma'
import { serverEnv } from './env'

export type MemberRole = 'visitor' | 'member' | 'staff' | 'admin'

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>

/** Stored hashes are `scrypt$<salt>$<hex>`; staff accounts only. */
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, expected] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !expected) return false

  const actual = await scryptAsync(password, salt, 64)
  const expectedBuf = Buffer.from(expected, 'hex')
  return actual.length === expectedBuf.length && timingSafeEqual(actual, expectedBuf)
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: MemberRole
      membershipExpiresAt?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: '/account', error: '/account' },
  providers: [
    EmailProvider({
      server: serverEnv.EMAIL_SERVER ?? '',
      from: 'tickets@cedarwoodobservatory.org',
      maxAge: 15 * 60,
    }),
    CredentialsProvider({
      name: 'Staff credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        const account = await prisma.member.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
            membershipExpiresAt: true,
          },
        })

        if (!account?.passwordHash) return null
        if (!(await verifyPassword(credentials.password, account.passwordHash))) return null

        return {
          id: account.id,
          email: account.email,
          name: account.name,
          role: account.role as MemberRole,
          membershipExpiresAt: account.membershipExpiresAt?.toISOString() ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.uid = user.id
        token.role = (user as { role?: MemberRole }).role ?? 'visitor'
        token.membershipExpiresAt =
          (user as { membershipExpiresAt?: string | null }).membershipExpiresAt ?? null
      }
      return token
    },
    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        user: {
          id: String(token.uid ?? ''),
          email: String(token.email ?? ''),
          name: token.name ?? null,
          role: (token.role as MemberRole) ?? 'visitor',
          membershipExpiresAt: (token.membershipExpiresAt as string | null) ?? null,
        },
      }
    },
  },
}

export function hasStaffAccess(session: Session | null): boolean {
  return session?.user.role === 'staff' || session?.user.role === 'admin'
}

export function membershipIsActive(session: Session | null, now = new Date()): boolean {
  const expiry = session?.user.membershipExpiresAt
  return !!expiry && new Date(expiry) > now
}
