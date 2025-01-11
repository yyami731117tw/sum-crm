import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // 允許訪問的公開路徑
  const publicPaths = [
    '/auth/login',
    '/api/auth/login',
    '/favicon.ico',
    '/_next',
    '/static'
  ]

  // 檢查是否是公開路徑
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // API 路由的驗證
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '未授權的訪問' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
    try {
      verify(token, process.env.NEXTAUTH_SECRET || '')
      return NextResponse.next()
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ success: false, error: '登入已過期' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
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
    // 清除無效的 token
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico|.*\\.).*)',
    '/api/:path*'
  ]
} 