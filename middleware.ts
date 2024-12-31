import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 簡單的內存存儲，生產環境應該使用 Redis
const rateLimits = new Map<string, { count: number; timestamp: number }>()

// 配置
const WINDOW_SIZE = 60 * 1000 // 1分鐘
const MAX_REQUESTS = 100 // 每個窗口最大請求數
const AUTH_MAX_REQUESTS = 5 // 身份驗證相關請求的限制

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const path = request.nextUrl.pathname
  
  // 檢查是否是身份驗證相關的請求
  const isAuthRequest = path.startsWith('/api/auth/')
  const limit = isAuthRequest ? AUTH_MAX_REQUESTS : MAX_REQUESTS

  // 獲取當前時間
  const now = Date.now()

  // 清理過期的記錄
  for (const [key, value] of rateLimits.entries()) {
    if (now - value.timestamp > WINDOW_SIZE) {
      rateLimits.delete(key)
    }
  }

  // 獲取或創建請求記錄
  const key = `${ip}:${path}`
  const record = rateLimits.get(key) || { count: 0, timestamp: now }

  // 如果記錄已過期，重置計數
  if (now - record.timestamp > WINDOW_SIZE) {
    record.count = 0
    record.timestamp = now
  }

  // 增加請求計數
  record.count++
  rateLimits.set(key, record)

  // 檢查是否超過限制
  if (record.count > limit) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: '請求過於頻繁，請稍後再試'
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (record.timestamp + WINDOW_SIZE).toString()
        }
      }
    )
  }

  // 添加速率限制信息到響應頭
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set(
    'X-RateLimit-Remaining',
    Math.max(0, limit - record.count).toString()
  )
  response.headers.set(
    'X-RateLimit-Reset',
    (record.timestamp + WINDOW_SIZE).toString()
  )

  return response
}

export const config = {
  matcher: [
    '/api/:path*', // 匹配所有 API 路由
  ]
} 