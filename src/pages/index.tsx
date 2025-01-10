import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { MainNav } from '@/components/layout/MainNav'
import { Alert, CircularProgress } from '@mui/material'

interface DashboardStats {
  totalMembers: number
  newMembersThisMonth: number
  pendingTasks: number
  recentActivities: {
    id: string
    type: string
    action: string
    target: string
    date: string
  }[]
}

const IndexPage: NextPage = () => {
  const { session, status } = useAuth()
  const loading = status === 'loading'
  const user = session?.user
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    newMembersThisMonth: 0,
    pendingTasks: 0,
    recentActivities: []
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) {
          throw new Error('獲取統計數據失敗')
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('獲取統計數據失敗:', error)
        setError('獲取統計數據失敗，請稍後再試')
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchStats()
      // 設置定時刷新（每5分鐘）
      const interval = setInterval(fetchStats, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>首頁 - MBC管理系統</title>
      </Head>
      <div className="min-h-screen bg-gray-100 pt-16">
        <MainNav />
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold leading-tight text-gray-900 mb-2">
                      歡迎回來，{user.name || '使用者'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                      祝您有個美好的一天！讓我們一起創造更多價值。
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-medium text-gray-900">
                      {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                    </p>
                  </div>
                </div>
              </div>
              {error && (
                <Alert severity="error" className="mb-4">
                  {error}
                </Alert>
              )}
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <CircularProgress />
                  </div>
                ) : (
                  <>
                    {/* 統計卡片區域 */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {/* 會員總數 */}
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                  會員總數
                                </dt>
                                <dd className="flex items-baseline">
                                  <div className="text-2xl font-semibold text-gray-900">
                                    {stats.totalMembers}
                                  </div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 本月新增會員 */}
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                  本月新增會員
                                </dt>
                                <dd className="flex items-baseline">
                                  <div className="text-2xl font-semibold text-gray-900">
                                    {stats.newMembersThisMonth}
                                  </div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 待處理事項 */}
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                  待處理事項
                                </dt>
                                <dd className="flex items-baseline">
                                  <div className="text-2xl font-semibold text-gray-900">
                                    {stats.pendingTasks}
                                  </div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 最近活動 */}
                    <div className="mt-8">
                      <h2 className="text-lg leading-6 font-medium text-gray-900">
                        最近活動
                      </h2>
                      <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-md">
                        <ul role="list" className="divide-y divide-gray-200">
                          {stats.recentActivities.length > 0 ? (
                            stats.recentActivities.map((activity) => (
                              <li key={activity.id} className="p-4">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {activity.action}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {activity.target}
                                    </p>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(activity.date).toLocaleDateString('zh-TW')}
                                  </div>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="p-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    暫無活動記錄
                                  </p>
                                </div>
                              </div>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default IndexPage 