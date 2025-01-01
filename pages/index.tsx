import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '../src/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const Home: NextPage = () => {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('登出時發生錯誤:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>首頁 - MBC天使俱樂部管理系統</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        {/* 頂部導航欄 */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <img
                    className="h-8 w-auto"
                    src="/logo.png"
                    alt="MBC Logo"
                  />
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <a
                    href="#"
                    className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    首頁
                  </a>
                  <a
                    href="/members"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    會員管理
                  </a>
                  <a
                    href="/investments"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    投資項目
                  </a>
                  <a
                    href="/contracts"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    合約管理
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLoggingOut ? '登出中...' : '登出'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* 主要內容區 */}
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                歡迎回來，{user.name}
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              {/* 這裡可以添加儀表板內容 */}
              <div className="px-4 py-8 sm:px-0">
                <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
                  {/* 儀表板內容將在這裡添加 */}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default Home 