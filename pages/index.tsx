import type { NextPage } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'
import { MainLayout } from '@/layouts/MainLayout'

const Home: NextPage = () => {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  // 認證檢查
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading && !isAuthenticated) {
        await router.push('/login')
      }
    }
    checkAuth()
  }, [isAuthenticated, loading, router])

  // 載入中狀態
  if (loading) return <div>Loading...</div>

  // 主要內容
  return (
    <MainLayout title="首頁 - B2B CRM">
      <h1 className="text-2xl font-bold mb-4">
        歡迎使用 B2B CRM 平台
      </h1>
      <section className="grid gap-4">
        {/* 主要內容區塊 */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl mb-2">儀表板</h2>
          {/* 這裡可以添加儀表板內容 */}
        </div>
      </section>
    </MainLayout>
  )
}

export default Home 