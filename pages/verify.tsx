import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'

const Verify: NextPage = () => {
  const router = useRouter()
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { token } = router.query

  useEffect(() => {
    if (!token) {
      router.push('/signup')
    }
  }, [token, router])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResendCode = async () => {
    if (countdown > 0) return
    
    setResendLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationToken: token,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendSuccess(true)
        setCountdown(60) // 60秒冷卻時間
        setTimeout(() => setResendSuccess(false), 5000)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('重新發送驗證碼時發生錯誤')
    } finally {
      setResendLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationToken: token,
          verificationCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 3000)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('驗證過程發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>驗證電子郵件 - 多元商會員管理系統</title>
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
            <h1 className="text-4xl font-bold mb-2">驗證您的帳號</h1>
            <p className="text-lg text-center max-w-md opacity-80">
              請輸入我們發送到您電子郵件的驗證碼
            </p>
          </div>
        </div>

        {/* 右側驗證表單 */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">電子郵件驗證</h2>
              <p className="mt-2 text-sm text-gray-600">
                請查看您的電子郵件信箱，輸入收到的6位數驗證碼
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {resendSuccess && (
              <div className="mb-4 p-4 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">新的驗證碼已發送至您的信箱</p>
              </div>
            )}

            {success ? (
              <div className="text-center">
                <div className="mb-4 p-4 bg-green-50 rounded-md">
                  <p className="text-sm text-green-700">驗證成功！即將為您跳轉到登入頁面...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="verificationCode" className="sr-only">
                    驗證碼
                  </label>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    required
                    maxLength={6}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-center text-2xl tracking-[1em] focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="______"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '驗證中...' : '驗證'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading || countdown > 0}
                    className={`text-sm ${
                      countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-500'
                    }`}
                  >
                    {resendLoading
                      ? '發送中...'
                      : countdown > 0
                      ? `重新發送 (${countdown}s)`
                      : '重新發送驗證碼'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Verify 