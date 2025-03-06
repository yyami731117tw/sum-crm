import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// 定義需要保護的路徑
const protectedPaths = [
  '/admin',
  '/members',
  '/contracts',
  '/projects',
  '/'
]

// 定義公開路徑
const publicPaths = [
  '/login',
  '/signup',
  '/api/auth',
  '/api/trpc'
]

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const isAuth = !!req.nextauth.token
    
    // 處理公開路徑
    if (publicPaths.some(path => pathname.startsWith(path))) {
      // 如果已登入且嘗試訪問登入頁面，重定向到首頁
      if (isAuth && pathname === '/login') {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return NextResponse.next()
    }

    // 處理受保護路徑
    if (protectedPaths.some(path => pathname.startsWith(path))) {
      if (!isAuth) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      return NextResponse.next()
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
  matcher: ['/((?!api/trpc|_next/static|_next/image|favicon.ico).*)']
} 