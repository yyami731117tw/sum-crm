import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// 定義需要保護的路徑
const protectedPaths = [
  '/admin',
  '/members',
  '/contracts',
  '/projects'
]

// 定義公開路徑
const publicPaths = [
  '/login',
  '/api/auth'
]

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const token = req.nextauth.token

    // 如果是登入頁面
    if (path === '/login') {
      if (token) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return NextResponse.next()
    }

    // 如果是 API 路徑，允許訪問
    if (path.startsWith('/api/')) {
      return NextResponse.next()
    }

    // 未登入用戶重定向到登入頁面
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true
    }
  }
)

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/members/:path*',
    '/contracts/:path*',
    '/projects/:path*'
  ]
} 