import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // 已登入用戶訪問登入頁面時重定向到首頁
    if (token && path === '/auth/login') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // 檢查權限
    if (token) {
      const userRole = token.role as string

      // 管理員權限檢查
      if (path.startsWith('/admin') && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }

      // 一般用戶權限檢查
      if ((path.startsWith('/members') || path.startsWith('/contracts') || path.startsWith('/projects')) 
          && userRole !== 'ADMIN' && userRole !== 'USER') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 允許訪問登入頁面
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        // 其他頁面需要驗證
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/admin/:path*',
    '/members/:path*',
    '/contracts/:path*',
    '/projects/:path*'
  ]
} 