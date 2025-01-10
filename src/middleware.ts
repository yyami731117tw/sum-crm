import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // 已登入用戶訪問登入頁面時重定向到首頁
    if (path === '/login' && token) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // 未登入用戶訪問受保護頁面時重定向到登入頁面
    if (!token && path !== '/login') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

// 配置需要保護的路由
export const config = {
  matcher: [
    '/profile',
    '/users/:path*',
    '/settings/:path*',
    '/login'
  ]
} 