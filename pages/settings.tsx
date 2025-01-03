import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const Settings: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    notifyEmail: true,
    notifyLine: true,
    language: 'zh-TW',
    theme: 'light'
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 實作儲存設定的 API 調用
    console.log('儲存設定:', formData)
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
        <title>系統設定 - MBC管理系統</title>
      </Head>
      <div className="min-h-screen bg-gray-100 pt-16">
        <DashboardNav />
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                系統設定
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <form onSubmit={handleSubmit} className="p-6">
                  {/* 通知設定 */}
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">通知設定</h2>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="notifyEmail"
                          type="checkbox"
                          checked={formData.notifyEmail}
                          onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notifyEmail" className="ml-2 block text-sm text-gray-900">
                          接收電子郵件通知
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="notifyLine"
                          type="checkbox"
                          checked={formData.notifyLine}
                          onChange={(e) => setFormData({ ...formData, notifyLine: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notifyLine" className="ml-2 block text-sm text-gray-900">
                          接收 LINE 通知
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 介面設定 */}
                  <div className="mb-8">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">介面設定</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                          語言
                        </label>
                        <select
                          id="language"
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="zh-TW">繁體中文</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                          主題
                        </label>
                        <select
                          id="theme"
                          value={formData.theme}
                          onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="light">淺色</option>
                          <option value="dark">深色</option>
                          <option value="system">跟隨系統</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 儲存按鈕 */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      儲存設定
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default Settings 