import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '../src/hooks/useAuth'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { DashboardNav } from '../components/dashboard/DashboardNav'

const Projects: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

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
        <title>項目管理 - MBC管理系統</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <DashboardNav />
        
        {/* 主要內容區 */}
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                項目管理
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              {/* 這裡添加項目管理的內容 */}
              <div className="px-4 py-8 sm:px-0">
                <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
                  {/* 項目管理內容將在這裡添加 */}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default Projects 