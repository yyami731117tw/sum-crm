import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 定義公開路徑
const publicPaths = ['/login', '/auth/error', '/api/auth']
// 定義需要管理員權限的路徑
const adminPaths = ['/admin']
// 定義需要一般用戶權限的路徑
const userPaths = ['/members', '/contracts', '/projects']

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // 檢查是否為公開路徑或 API 路徑
    if (publicPaths.some(p => path.startsWith(p)) || path.startsWith('/api/auth')) {
      // 已登入用戶訪問登入頁面時重定向到首頁
      if (token && path === '/login') {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return NextResponse.next()
    }

    // 未登入用戶只能訪問公開頁面
    if (!token) {
      const callbackUrl = encodeURIComponent(req.url)
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url))
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
        // 允許訪問公開頁面和 API 路徑
        if (publicPaths.some(p => path.startsWith(p)) || path.startsWith('/api/auth')) {
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
    '/auth/error',
    '/admin/:path*',
    '/members/:path*',
    '/contracts/:path*',
    '/projects/:path*',
  ]
} 