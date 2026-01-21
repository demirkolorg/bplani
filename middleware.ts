import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const PUBLIC_PATHS = ['/login', '/api/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths - login sayfası ve login API
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Static files ve diğer API auth endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Token kontrolü
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    // Token geçersiz - login'e yönlendir
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
