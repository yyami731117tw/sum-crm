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
    
    // 如果是公開路徑，直接允許訪問
    if (publicPaths.some(p => path.startsWith(p))) {
      // 如果已登入且訪問登入頁面，重定向到首頁
      if (token && path === '/login') {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return NextResponse.next()
    }

    // 如果未登入，重定向到登入頁面
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // 檢查是否為受保護的路徑
    if (protectedPaths.some(p => path.startsWith(p))) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req }) => {
        const path = req.nextUrl.pathname
        // 公開路徑不需要驗證
        if (publicPaths.some(p => path.startsWith(p))) {
          return true
        }
        // 其他頁面需要驗證
        return true
      }
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