import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 不需要登入就能訪問的頁面
const publicPages = ['/login', '/signup', '/terms', '/privacy']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 檢查是否為公開頁面
  if (publicPages.includes(pathname)) {
    return NextResponse.next()
  }

  try {
    // 檢查是否已登入
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    })

    if (!token) {
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', encodeURI(request.url))
      return NextResponse.redirect(url)
    }

    // 檢查用戶狀態
    if (token.status === 'inactive') {
      return NextResponse.redirect(new URL('/login?error=account_disabled', request.url))
    }

    if (token.status === 'pending') {
      return NextResponse.redirect(new URL('/login?error=account_pending', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(url)
  }
}

// 配置中間件匹配規則
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 