import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { useAuth } from '../src/hooks/useAuth'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

const Login: NextPage = () => {
  const router = useRouter()
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // 如果已經登入，重定向到目標頁面或首頁
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const callbackUrl = router.query.callbackUrl as string
      router.push(callbackUrl || '/')
    }
  }, [isAuthenticated, authLoading, router])

  // 處理 URL 中的錯誤訊息
  useEffect(() => {
    const { error } = router.query
    if (error) {
      switch (error) {
        case 'account_disabled':
          setError('您的帳號已被停用，請聯繫管理員')
          break
        case 'account_pending':
          setError('您的帳號正在審核中，請耐心等待')
          break
        case 'session_expired':
          setError('登入階段已過期，請重新登入')
          break
        default:
          setError(String(error))
      }
    }
  }, [router.query])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError('')

    try {
      const result = await login(formData)

      if (!result.success) {
        setError(result.error || '登入失敗')
        return
      }

      // 登入成功後的重定向
      const callbackUrl = router.query.callbackUrl as string
      await router.push(callbackUrl || '/')
    } catch (err) {
      setError('登入時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>登入 - MBC管理系統</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={64}
                height={64}
                className="h-16 w-auto"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              登入系統
            </h2>
            {router.query.callbackUrl && (
              <p className="mt-2 text-center text-sm text-gray-600">
                請先登入以繼續訪問
              </p>
            )}
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  電子郵件
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="電子郵件"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  密碼
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="密碼"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    登入中...
                  </div>
                ) : (
                  '登入'
                )}
              </button>
            </div>
            <div className="text-center mt-4">
              <div className="text-sm">
                <span className="text-gray-500">還沒有帳號？</span>{' '}
                <button
                  onClick={() => router.push('/signup')}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  立即註冊
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Login

export async function getServerSideProps() {
  return {
    props: {},
  }
} 