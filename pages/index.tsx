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
    const checkAuth = async () => {
      if (!loading && !isAuthenticated) {
        await router.push('/login')
      }
    }
    checkAuth()
  }, [isAuthenticated, loading, router])

  if (loading) return <div>Loading...</div>

  return (
    <MainLayout title="儀表板 - B2B CRM">
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <main className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">
              Ohtok Connectlay Starboard
            </h1>
            <p className="mt-2 text-gray-600">
              即時監控您的業務數據和關鍵指標
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="總收入"
              value="$2.73"
              icon="currency"
              trend="+2.5%"
            />
            <StatsCard
              title="活躍用戶"
              value="1,234"
              icon="users"
              trend="+12.3%"
            />
            <StatsCard
              title="轉換率"
              value="24.8%"
              icon="chart"
              trend="+3.2%"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">付款概覽</h2>
              <PaymentList />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">最近活動</h2>
              {/* 活動列表組件 */}
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  )
}

export default Home 