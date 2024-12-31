import type { NextPage } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

const Signup: NextPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    birthday: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/login?registered=true')
      } else {
        setError(data.message || '註冊失敗')
      }
    } catch (err) {
      setError('註冊時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    // TODO: 實現 Google 註冊
    window.location.href = '/api/auth/google'
  }

  return (
    <>
      <Head>
        <title>註冊 - 多元商會員管理系統</title>
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
            <h1 className="text-4xl font-bold mb-4">歡迎您成為</h1>
            <h2 className="text-3xl font-bold mb-8">我們的夥伴</h2>
            <p className="text-lg text-center max-w-md opacity-80">
              共享知識、共想未來、共響事業
            </p>
          </div>
        </div>

        {/* 右側註冊表單 */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">開始使用</h2>
              <p className="mt-2 text-sm text-gray-600">
                已經有帳號了？{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-500">
                  登入
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Google 註冊按鈕 */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                使用 Google 帳號註冊
              </button>
            </div>

            {/* 分隔線 */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 電子郵件 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  電子郵件
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* 密碼 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  密碼
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {/* 姓名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  姓名
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* 電話 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  電話
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* 生日 */}
              <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
                  生日
                </label>
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                />
              </div>

              {/* 註冊按鈕 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? '處理中...' : '註冊'}
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-500 text-center">
              點擊註冊即表示您同意我們的{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                服務條款
              </Link>
              {' '}和{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                隱私政策
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Signup 