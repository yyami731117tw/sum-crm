import type { NextPage } from 'next'
import Head from 'next/head'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

const ContractsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>合約管理 - MBC天使俱樂部</title>
      </Head>
      <div>
        <DashboardNav />
        <main className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">合約管理</h1>
          
          {/* 合約列表 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">合約列表</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  新增合約
                </button>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {/* 合約列表內容 */}
              <p className="text-gray-500 text-center py-8">尚無合約資料</p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default ContractsPage 