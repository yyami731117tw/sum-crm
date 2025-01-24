import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// 定義需要保護的路徑
const protectedPaths = [
  '/admin',
  '/members',
  '/contracts',
  '/projects'
]

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const token = req.nextauth.token
    
    // 如果是根路徑且未登入，重定向到登入頁面
    if (path === '/' && !token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // 如果是登入頁面且已登入，重定向到首頁
    if (path === '/login' && token) {
      return NextResponse.redirect(new URL('/', req.url))
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
        // 登入頁面和 API 路徑不需要驗證
        if (path === '/login' || path.startsWith('/api/auth')) {
          return true
        }
        // 其他頁面按照默認邏輯處理
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