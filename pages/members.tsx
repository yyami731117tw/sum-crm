import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

const MembersPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>會員資料 - MBC天使俱樂部</title>
      </Head>
      <div>
        <DashboardNav />
        <main className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">會員資料</h1>
          
          {/* 個人資料卡片 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">基本資料</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">姓名</label>
                      <p className="mt-1 text-sm text-gray-900">王小明</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">電子郵件</label>
                      <p className="mt-1 text-sm text-gray-900">example@email.com</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">電話</label>
                      <p className="mt-1 text-sm text-gray-900">0912-345-678</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">生日</label>
                      <p className="mt-1 text-sm text-gray-900">1990/01/01</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">投資紀錄</h3>
                  <p className="text-sm text-gray-500">尚無投資紀錄</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {}
  }
}

export default MembersPage 