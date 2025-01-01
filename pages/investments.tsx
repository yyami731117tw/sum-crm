import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '../src/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface Investment {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  investorCount: number
  status: 'active' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  category: string
}

const InvestmentsPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: '1',
      name: '科技新創A輪投資',
      description: '專注於AI技術開發的新創公司',
      targetAmount: 10000000,
      currentAmount: 7500000,
      investorCount: 15,
      status: 'active',
      startDate: '2023/01/01',
      endDate: '2023/12/31',
      category: '科技'
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

  const getStatusColor = (status: Investment['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Investment['status']) => {
    switch (status) {
      case 'active':
        return '進行中'
      case 'completed':
        return '已完成'
      case 'cancelled':
        return '已取消'
      default:
        return '未知'
    }
  }

  return (
    <>
      <Head>
        <title>投資項目 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">投資項目</h1>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                新增項目
              </button>
            </div>

            {/* 投資項目列表 */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {investments.map((investment) => (
                <div
                  key={investment.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {investment.name}
                      </h3>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          investment.status
                        )}`}
                      >
                        {getStatusText(investment.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      {investment.description}
                    </p>
                    <div className="mt-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-blue-600">
                              募資進度
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-blue-600">
                              {Math.round(
                                (investment.currentAmount / investment.targetAmount) * 100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                          <div
                            style={{
                              width: `${Math.round(
                                (investment.currentAmount / investment.targetAmount) * 100
                              )}%`
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          ></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">目標金額</span>
                          <p className="font-medium text-gray-900">
                            NT$ {investment.targetAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">已募金額</span>
                          <p className="font-medium text-gray-900">
                            NT$ {investment.currentAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">投資人數</span>
                          <p className="font-medium text-gray-900">
                            {investment.investorCount} 人
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">投資類別</span>
                          <p className="font-medium text-gray-900">
                            {investment.category}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        查看詳情
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InvestmentsPage 