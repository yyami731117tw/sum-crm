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

  // 檢查是否已登入
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })
  
  if (!session) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
} 