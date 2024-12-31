import type { NextPage } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'

const Login: NextPage = () => {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // 認證狀態檢查
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        await router.push('/')
      }
    }
    checkAuth()
  }, [isAuthenticated, router])

  // 主要內容
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          登入
        </h1>
        <form className="space-y-4">
          {/* 登入表單內容 */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="請輸入電子郵件"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              密碼
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="請輸入密碼"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            登入
          </button>
        </form>
      </div>
    </main>
  )
}

export default Login 