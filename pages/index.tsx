import type { NextPage } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { MainLayout } from '@/layouts/MainLayout'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PaymentList } from '@/components/dashboard/PaymentList'

const Home: NextPage = () => {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              多元商會員管理系統
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              歡迎回來！這是您的業務概覽。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="本月收入"
              value="$23,456"
              trend="+12.5%"
              icon="currency"
            />
            <StatsCard
              title="活躍客戶"
              value="1,234"
              trend="+4.3%"
              icon="users"
            />
            <StatsCard
              title="轉換率"
              value="32.8%"
              trend="+2.1%"
              icon="chart"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                最近交易
              </h2>
              <PaymentList />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                待處理事項
              </h2>
              <div className="space-y-4">
                {/* 待辦事項列表 */}
                <p className="text-gray-500">暫無待處理事項</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  )
}

export default Home 