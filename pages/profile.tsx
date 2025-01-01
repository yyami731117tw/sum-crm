import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '../src/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface UserProfile {
  name: string
  email: string
  phone: string
  birthday: string
  joinDate: string
  investmentCount: number
  totalInvestment: number
  investmentHistory: {
    id: string
    projectName: string
    amount: number
    date: string
    status: string
  }[]
}

const ProfilePage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({
    name: '王小明',
    email: 'wang@example.com',
    phone: '0912-345-678',
    birthday: '1990/01/01',
    joinDate: '2023/01/01',
    investmentCount: 3,
    totalInvestment: 1000000,
    investmentHistory: [
      {
        id: '1',
        projectName: '科技新創A輪投資',
        amount: 500000,
        date: '2023/03/15',
        status: '進行中'
      },
      {
        id: '2',
        projectName: '生技新創B輪投資',
        amount: 300000,
        date: '2023/05/20',
        status: '已完成'
      },
      {
        id: '3',
        projectName: '電商平台C輪投資',
        amount: 200000,
        date: '2023/07/10',
        status: '進行中'
      }
    ]
  })

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
        <title>個人資料 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">個人資料</h1>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* 基本資料卡片 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">基本資料</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">姓名</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">電子郵件</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">電話</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">生日</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.birthday}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">加入日期</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.joinDate}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      編輯資料
                    </button>
                  </div>
                </div>
              </div>

              {/* 投資統計卡片 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">投資統計</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">投資次數</label>
                      <p className="mt-1 text-2xl font-semibold text-blue-600">
                        {profile.investmentCount} 次
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">投資總額</label>
                      <p className="mt-1 text-2xl font-semibold text-blue-600">
                        NT$ {profile.totalInvestment.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 投資紀錄卡片 */}
              <div className="bg-white shadow rounded-lg lg:col-span-2">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">投資紀錄</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            項目名稱
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            投資金額
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            投資日期
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            狀態
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {profile.investmentHistory.map((investment) => (
                          <tr key={investment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {investment.projectName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              NT$ {investment.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {investment.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  investment.status === '進行中'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {investment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage 