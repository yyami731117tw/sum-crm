import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 定義需要登入的頁面路徑
const authRequiredPages = [
  '/dashboard',
  '/profile',
  '/projects',
  '/investments',
  '/admin'
]

// 定義只允許管理員訪問的頁面
const adminOnlyPages = [
  '/admin/users',
  '/admin/settings'
]

// 定義允許待審核用戶訪問的頁面
const pendingAllowedPages = [
  '/',
  '/login',
  '/signup',
  '/terms',
  '/privacy'
]

export async function middleware(request: NextRequest) {
  // 暫時返回 next()，允許所有訪問
  return NextResponse.next()

  /* 暫時註解掉認證邏輯
  const session = request.cookies.get('session')?.value
  
  if (!session && authRequiredPages.some(page => request.nextUrl.pathname.startsWith(page))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const user = JSON.parse(atob(session || ''))

    if (user.status === 'inactive') {
      if (!pendingAllowedPages.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    if (user.status === 'pending') {
      if (!pendingAllowedPages.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    if (adminOnlyPages.some(page => request.nextUrl.pathname.startsWith(page)) && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    if (authRequiredPages.some(page => request.nextUrl.pathname.startsWith(page))) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session')
      return response
    }
    return NextResponse.next()
  }
  */
} 