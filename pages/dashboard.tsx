import type { NextPage } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import Head from 'next/head'

const Dashboard: NextPage = () => {
  const router = useRouter()
  const { isAuthenticated, loading, user } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.replace('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Head>
        <title>首頁 - 多元商會員管理系統</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <DashboardNav />
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-2xl font-semibold text-gray-900">歡迎回來，{user?.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  這是您的個人儀表板，您可以在這裡查看和管理所有功能。
                </p>
              </div>
            </div>

            {/* 快速操作區 */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      👥
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          會員總數
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          0
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      📄
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          合約總數
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          0
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      📊
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          專案總數
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          0
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default Dashboard 