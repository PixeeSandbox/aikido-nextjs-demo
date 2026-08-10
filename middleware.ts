import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'

const STAFF_ONLY_PREFIXES = ['/studio']
const AUTHED_PREFIXES = ['/account']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const needsStaff = STAFF_ONLY_PREFIXES.some((p) => pathname.startsWith(p))
  const needsAuth = needsStaff || AUTHED_PREFIXES.some((p) => pathname.startsWith(p))

  if (!needsAuth) return NextResponse.next()

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const signIn = new URL('/api/auth/signin', request.url)
    signIn.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signIn)
  }

  if (needsStaff && token.role !== 'staff' && token.role !== 'admin') {
    return NextResponse.rewrite(new URL('/not-found', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/studio/:path*'],
}
