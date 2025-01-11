import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const token = req.nextauth?.token
    const isAuth = !!token
    const userRole = token?.role as string

    // 已登入用戶訪問認證相關頁面時重定向到首頁
    if (isAuth && (path.startsWith('/auth/'))) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // 管理員權限檢查
    if (path.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // 一般用戶權限檢查
    if (path.startsWith('/members') || path.startsWith('/contracts') || path.startsWith('/projects')) {
      if (!isAuth) {
        return NextResponse.redirect(new URL('/auth/login', req.url))
      }
      
      if (userRole !== 'ADMIN' && userRole !== 'USER') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        // 允許訪問認證相關頁面
        if (path.startsWith('/auth/')) {
          return true
        }
        // 其他頁面需要驗證
        return !!token
      }
    },
    pages: {
      signIn: '/auth/login'
    }
  }
)

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/profile',
    '/settings',
    '/members/:path*',
    '/contracts/:path*',
    '/projects/:path*',
    '/admin/:path*'
  ]
} 