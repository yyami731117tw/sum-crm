import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // 允許訪問的公開路徑
  const publicPaths = ['/auth/login', '/api/auth/login']
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // API 路由的驗證
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json(
        { error: '未授權的訪問' },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  // 頁面路由的驗證
  if (!token) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  try {
    verify(token, process.env.NEXTAUTH_SECRET || '')
    return NextResponse.next()
  } catch (error) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('error', '登入已過期，請重新登入')
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico|.*\\.).*)',
    '/api/:path*'
  ]
} 