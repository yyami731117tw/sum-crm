import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 公開路由列表
const publicRoutes = ['/login', '/signup', '/terms', '/privacy']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const { pathname } = request.nextUrl

  // 檢查是否是公開路由
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // 如果沒有 token，重定向到登入頁面
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// 配置需要進行中間件檢查的路徑
export const config = {
  matcher: [
    /*
     * 匹配所有路徑，除了：
     * 1. /api 路由（API 路由有自己的權限控制）
     * 2. /_next 靜態文件
     * 3. /favicon.ico, /logo.png 等靜態資源
     */
    '/((?!api|_next|favicon.ico|logo.png|logo-white.png).*)',
  ],
} 