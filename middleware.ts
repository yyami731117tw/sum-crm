import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 不需要登入就能訪問的頁面
const publicPages = ['/login', '/signup', '/terms', '/privacy']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 檢查是否為公開頁面
  if (publicPages.includes(pathname)) {
    return NextResponse.next()
  }

  // 檢查是否已登入
  const token = request.cookies.get('token')
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*', // 匹配所有 API 路由
  ]
} 