import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // 公開路由列表
  const publicRoutes = ['/login']
  
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 