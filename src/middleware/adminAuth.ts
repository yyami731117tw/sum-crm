import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// 公開路由列表
const publicRoutes = ['/login', '/signup', '/terms', '/privacy']
// 需要管理員權限的路由
const adminRoutes = ['/admin', '/admin/people']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // 檢查是否是公開路由
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // 如果沒有 token，重定向到登入頁面
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 檢查是否是管理員路由
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    try {
      // 解析 JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
      const { payload } = await jwtVerify(token, secret)
      
      // 檢查用戶角色
      if (payload.role !== 'admin') {
        // 如果不是管理員，返回 403 錯誤
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            message: '僅限管理員操作' 
          }), 
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
} 