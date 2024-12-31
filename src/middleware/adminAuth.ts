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