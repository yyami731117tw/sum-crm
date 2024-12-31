import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // 公開路由列表
  const publicRoutes = ['/login']
  // API 路由
  const apiRoutes = ['/api/auth/login', '/api/auth/logout', '/api/auth/verify']
  // 靜態資源路徑
  const staticRoutes = ['/logo.svg', '/favicon.ico']
  
  // 如果是 API 路由或靜態資源，直接允許訪問
  if (apiRoutes.includes(pathname) || staticRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // 如果是公開路由，已登入則導向首頁
  if (publicRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 如果不是公開路由且未登入，導向登入頁
  if (!publicRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
} 