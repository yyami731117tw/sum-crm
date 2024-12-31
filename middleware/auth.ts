import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verify, JwtPayload } from 'jsonwebtoken'

interface DecodedToken extends JwtPayload {
  id: string
  email: string
  name: string
  role: string
}

// 公開路由列表
const publicRoutes = ['/login', '/signup', '/verify', '/api/auth/login', '/api/auth/signup', '/api/auth/verify']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 檢查是否是公開路由
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // 獲取 token
  const token = request.cookies.get('token')?.value

  if (!token) {
    // 如果是 API 請求，返回 401 錯誤
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ message: '未授權的訪問' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }
    // 否則重定向到登入頁面
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // 驗證 token
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = await verify(token, secret) as DecodedToken
    
    // 將用戶信息添加到請求中
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.id)
    requestHeaders.set('x-user-role', decoded.role)

    // 繼續請求
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    return response
  } catch (error) {
    console.error('Token verification failed:', error)
    
    // 清除無效的 token
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    
    return response
  }
}

// 配置中間件匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路徑，除了：
     * - api/auth/* (身份驗證相關的 API)
     * - _next/static (靜態文件)
     * - _next/image (圖片優化 API)
     * - favicon.ico (瀏覽器圖標)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
} 