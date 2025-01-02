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
  const session = request.cookies.get('session')?.value
  
  // 如果沒有 session，重定向到登入頁面
  if (!session && authRequiredPages.some(page => request.nextUrl.pathname.startsWith(page))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // 解析 session 獲取用戶資訊
    // TODO: 實作實際的 session 解析邏輯
    const user = JSON.parse(atob(session || ''))

    // 檢查用戶狀態
    if (user.status === 'inactive') {
      // 停用狀態的用戶重定向到登入頁面
      if (!pendingAllowedPages.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    if (user.status === 'pending') {
      // 待審核狀態的用戶只能訪問特定頁面
      if (!pendingAllowedPages.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // 檢查管理員權限
    if (adminOnlyPages.some(page => request.nextUrl.pathname.startsWith(page)) && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    // session 解析失敗，清除 cookie 並重定向到登入頁面
    if (authRequiredPages.some(page => request.nextUrl.pathname.startsWith(page))) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('session')
      return response
    }
    return NextResponse.next()
  }
} 