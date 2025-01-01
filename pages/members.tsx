import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '../src/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  birthday: string
  joinDate: string
  investmentCount: number
  totalInvestment: number
  status: 'active' | 'inactive'
}

const MembersPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: '王小明',
      email: 'wang@example.com',
      phone: '0912-345-678',
      birthday: '1990/01/01',
      joinDate: '2023/01/01',
      investmentCount: 3,
      totalInvestment: 1000000,
      status: 'active'
    },
    // 可以添加更多測試數據
  ])

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
        <title>會員資料 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">會員資料</h1>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                新增會員
              </button>
            </div>

            {/* 會員列表 */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {members.map((member) => (
                  <li key={member.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-lg">
                                {member.name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-8">
                          <div className="flex flex-col items-end">
                            <div className="text-sm font-medium text-gray-900">
                              投資次數
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.investmentCount} 次
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-sm font-medium text-gray-900">
                              投資總額
                            </div>
                            <div className="text-sm text-gray-500">
                              NT$ {member.totalInvestment.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.status === 'active' ? '正常' : '停用'}
                            </span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-900">
                            查看詳情
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MembersPage 