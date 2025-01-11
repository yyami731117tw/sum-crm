import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// 定義公開路徑
const publicPaths = ['/login', '/auth/error']
// 定義需要管理員權限的路徑
const adminPaths = ['/admin']
// 定義需要一般用戶權限的路徑
const userPaths = ['/members', '/contracts', '/projects']

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // 檢查是否為公開路徑
    if (publicPaths.some(p => path.startsWith(p))) {
      // 已登入用戶訪問公開頁面時重定向到首頁
      if (token) {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return NextResponse.next()
    }

    // 未登入用戶只能訪問公開頁面
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const userRole = token.role as string

    // 檢查管理員權限
    if (adminPaths.some(p => path.startsWith(p)) && userRole !== 'ADMIN') {
      console.log(`Unauthorized access to admin path: ${path} by role: ${userRole}`)
      return NextResponse.redirect(new URL('/', req.url))
    }

    // 檢查一般用戶權限
    if (userPaths.some(p => path.startsWith(p)) && 
        userRole !== 'ADMIN' && userRole !== 'USER') {
      console.log(`Unauthorized access to user path: ${path} by role: ${userRole}`)
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        // 允許訪問公開頁面
        if (publicPaths.some(p => path.startsWith(p))) {
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
    /*
     * 匹配所有需要保護的路徑:
     * - 根路徑
     * - 登入相關路徑
     * - 管理員路徑
     * - 用戶路徑
     */
    '/',
    '/login',
    '/auth/:path*',
    '/admin/:path*',
    '/members/:path*',
    '/contracts/:path*',
    '/projects/:path*',
    // 排除靜態資源和API路徑
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
} 