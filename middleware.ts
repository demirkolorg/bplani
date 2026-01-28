import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
// Rate limiting temporarily disabled for debugging
// import { loginRateLimit, apiRateLimit, getClientIdentifier } from '@/lib/rate-limit'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

const PUBLIC_PATHS = ['/login', '/api/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get client identifier for rate limiting (temporarily unused)
  // const clientId = getClientIdentifier(request)

  // Rate limit for login endpoint (temporarily disabled for debugging)
  // TODO: Re-enable after fixing login issue
  /*
  if (pathname === '/api/auth/login') {
    const { success, limit, remaining, reset } = await loginRateLimit.limit(clientId)

    if (!success) {
      return NextResponse.json(
        {
          error: 'Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            resetAt: new Date(reset).toISOString(),
            limit,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset),
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          }
        }
      )
    }
  }
  */

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

    // Rate limit for API endpoints (after authentication) - temporarily disabled
    // TODO: Re-enable after fixing login issue
    /*
    if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
      const { success, limit, remaining, reset } = await apiRateLimit.limit(clientId)

      if (!success) {
        return NextResponse.json(
          {
            error: 'API rate limit aşıldı. Lütfen bekleyin.',
            code: 'RATE_LIMIT_EXCEEDED',
            details: {
              resetAt: new Date(reset).toISOString(),
              limit,
            },
            timestamp: new Date().toISOString(),
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': String(remaining),
              'X-RateLimit-Reset': String(reset),
              'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
            }
          }
        )
      }

      // Add rate limit headers to successful requests
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', String(limit))
      response.headers.set('X-RateLimit-Remaining', String(remaining))
      response.headers.set('X-RateLimit-Reset', String(reset))
      return response
    }
    */

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
