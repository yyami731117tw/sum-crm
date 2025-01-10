import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname

    // 已登入用戶訪問登入頁面時重定向到首頁
    if (path === '/login') {
      return NextResponse.redirect(new URL('/', req.url))
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
    '/',              // 首頁
    '/profile',       // 個人資料
    '/users/:path*',  // 用戶管理
    '/members/:path*', // 會員管理
    '/settings/:path*', // 系統設置
    '/login'          // 登入頁面
  ]
} 