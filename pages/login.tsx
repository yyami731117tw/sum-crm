import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { useAuth } from '../src/hooks/useAuth'

const Login: NextPage = () => {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const { verified } = router.query
    if (verified) {
      setError('您的帳號已驗證，請登入')
    }
  }, [router.query])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login({ email, password, step })

      if (result.success) {
        if (step === 1 && result.exists) {
          setStep(2)
        } else if (step === 2) {
          // 登入成功，重定向由 useAuth hook 處理
          console.log('Login successful')
        }
      } else {
        setError(result.message || '登入失敗')
        if (result.error === 'NOT_REGISTERED') {
          router.push('/signup')
        }
      }
    } catch (err) {
      setError('登入時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep(1)
    setPassword('')
    setError('')
  }

  return (
    <>
      <Head>
        <title>登入 - 多元商會員管理系統</title>
      </Head>
      <div className="min-h-screen flex">
        {/* 左側歡迎區塊 */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#003B6D] text-white">
          <div className="w-full flex flex-col items-center justify-center p-12">
            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
              <Image
                src="/logo.png"
                alt="多元商 Logo"
                width={120}
                height={120}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)'
                }}
                priority
                unoptimized
              />
            </div>
            <h1 className="text-4xl font-bold mb-2">歡迎回來</h1>
            <p className="text-lg text-center max-w-md opacity-80">
              登入您的帳號以管理會員資料
            </p>
          </div>
        </div>

        {/* 右側登入表單 */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">會員登入</h2>
              <p className="mt-2 text-sm text-gray-600">
                {step === 1 ? '請輸入您的電子郵件' : '請輸入您的密碼'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 ? (
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    密碼
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    返回
                  </button>
                )}
                <div className="text-sm">
                  <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                    還沒有帳號？立即註冊
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (step === 1 ? !email : !password)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '處理中...' : (step === 1 ? '下一步' : '登入')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login 