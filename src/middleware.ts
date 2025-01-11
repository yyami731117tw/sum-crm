import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname

    // 如果用戶已登入且嘗試訪問登入頁面，重定向到首頁
    if (path === '/login' || path === '/signup') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/login'
    }
  }
)

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/profile',
    '/settings',
    '/members/:path*',
    '/contracts/:path*',
    '/projects/:path*',
    '/admin/:path*'
  ]
} 