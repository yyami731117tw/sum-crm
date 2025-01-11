import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const isAuth = !!req.nextauth?.token

    // 已登入用戶訪問登入或註冊頁面時重定向到首頁
    if (isAuth && (path === '/login' || path === '/signup')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token
      }
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