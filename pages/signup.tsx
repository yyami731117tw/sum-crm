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

  return (
    <>
      <Head>
        <title>註冊 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen flex">
        {/* 左側歡迎區塊 */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#003B6D] text-white">
          <div className="w-full flex flex-col items-center justify-center p-12">
            <Image
              src="/logo.png"
              alt="MBC Logo"
              width={120}
              height={120}
              className="mb-8"
              unoptimized
            />
            <h1 className="text-4xl font-bold mb-4">歡迎您成為</h1>
            <h2 className="text-3xl font-bold mb-8">MBC天使俱樂部的夥伴</h2>
            <p className="text-lg text-center max-w-md opacity-80">
              加入我們的天使投資社群，開啟無限可能
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