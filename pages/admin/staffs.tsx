import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Staff {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'staff' | 'guest'
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  lastLogin: string
  lineId?: string
  address?: string
  birthday?: string
}

const StaffsPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // 模擬加載人員數據
  useEffect(() => {
    const mockStaffs: Staff[] = [
      {
        id: '1',
        name: '王大明',
        email: 'wang@example.com',
        phone: '0912-345-678',
        role: 'admin',
        status: 'active',
        joinDate: '2023/01/01',
        lastLogin: '2024/01/10',
        lineId: 'wang_123',
        address: '台北市信義區信義路五段7號',
        birthday: '1990/01/01'
      },
      {
        id: '2',
        name: '李小華',
        email: 'lee@example.com',
        phone: '0923-456-789',
        role: 'staff',
        status: 'active',
        joinDate: '2023/03/15',
        lastLogin: '2024/01/09',
        lineId: 'lee_456',
        address: '台北市大安區敦化南路二段100號',
        birthday: '1992/05/15'
      }
    ]
    setStaffs(mockStaffs)
  }, [])

  const getStatusBadgeColor = (status: Staff['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: Staff['role']) => {
    switch (role) {
      case 'admin':
        return '管理員'
      case 'staff':
        return '客服人員'
      default:
        return '訪客'
    }
  }

  const getStatusText = (status: Staff['status']) => {
    switch (status) {
      case 'active':
        return '啟用'
      case 'inactive':
        return '停用'
      default:
        return '待審核'
    }
  }

  const filteredStaffs = staffs.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.phone.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>人員管理 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <DashboardNav />
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                人員管理
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                {/* 搜尋和新增區 */}
                <div className="mb-6 flex justify-between items-center">
                  <div className="max-w-lg flex-1 mr-4">
                    <label htmlFor="search" className="sr-only">搜尋人員</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="search"
                        id="search"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="搜尋姓名、Email或電話"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {/* TODO: 實作新增人員功能 */}}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    新增人員
                  </button>
                </div>

                {/* 人員列表 */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          人員資料
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          角色
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          狀態
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          加入時間
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          最後登入
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">操作</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStaffs.map((staff) => (
                        <tr key={staff.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-lg font-medium text-blue-600">
                                    {staff.name[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {staff.name}
                                </div>
                                <div className="text-sm text-gray-500">{staff.email}</div>
                                <div className="text-sm text-gray-500">{staff.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getRoleText(staff.role)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              getStatusBadgeColor(staff.status)
                            }`}>
                              {getStatusText(staff.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {staff.joinDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {staff.lastLogin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {/* TODO: 實作編輯功能 */}}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() => {/* TODO: 實作停用功能 */}}
                              className="text-red-600 hover:text-red-900"
                            >
                              {staff.status === 'active' ? '停用' : '啟用'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!staffs || staffs.length === 0) && (
                    <div className="text-center py-8 text-sm text-gray-500">
                      尚無人員資料
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default StaffsPage 