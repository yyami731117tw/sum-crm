import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

const Login: NextPage = () => {
  const router = useRouter()
  const { isAuthenticated, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShowRegisterPrompt(false)
    setLoading(true)

    try {
      const result = await login({ 
        email, 
        password,
        step: showPassword ? 2 : 1 
      })

      if (!result.success) {
        if (result.notRegistered) {
          setShowRegisterPrompt(true)
        } else if (result.exists) {
          setShowPassword(true)
          setError('')
        }
        setError(result.error || '登入失敗')
      }
    } catch (err) {
      setError('登入時發生錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>登入 - 多元商會員管理系統</title>
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 relative">
              <Image
                src="/logo.png"
                alt="MBC Logo"
                width={96}
                height={96}
                priority
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              MBC天使俱樂部
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Multi-Business Club Angel System
            </p>
          </div>
          
          {/* 標題 */}
          <h2 className="mt-4 text-center text-2xl font-semibold text-gray-900">
            登入
          </h2>

          {/* 錯誤提示 */}
          {error && (
            <div className={`rounded-md ${showRegisterPrompt ? 'bg-blue-50' : 'bg-red-50'} p-4`}>
              <div className={`text-sm ${showRegisterPrompt ? 'text-blue-700' : 'text-red-700'}`}>
                {error}
                {showRegisterPrompt && (
                  <div className="mt-2">
                    <Link
                      href="/signup"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      立即註冊 →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 登入表單 */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={showPassword}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="請輸入您的電子郵件"
              />
            </div>

            {/* 密碼輸入框 */}
            {showPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  密碼
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請輸入密碼"
                />
              </div>
            )}

            {/* 繼續按鈕 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '處理中...' : showPassword ? '登入' : '繼續'}
            </button>

            {/* 分隔線 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>

            {/* Google 登入按鈕 */}
            <div>
              <button
                type="button"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                使用 Google 帳號登入
              </button>
            </div>
          </form>

          {/* 註冊連結 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              還沒有帳號？{' '}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                立即註冊
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login 