import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { DashboardNav } from '@/components/dashboard/DashboardNav'

interface Member {
  id: string
  memberNo: string
  name: string
  nickname?: string
  gender: string
  phone: string
  email?: string
  birthday: string
  age?: number
  address?: string
  idNumber: string
  status: string
  memberType: string
  membershipStartDate?: string
  membershipEndDate?: string
  remainingDays?: number
  occupation?: string
  lineId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface MemberLog {
  id: string
  memberId: string
  action: string
  details: string
  operator: string
  changes?: {
    field: string
    oldValue: string
    newValue: string
  }[]
  createdAt: string
}

const MembersPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [selectedMemberLogs, setSelectedMemberLogs] = useState<MemberLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarMember, setSidebarMember] = useState<Member | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState(800)
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [sidebarMemberLogs, setSidebarMemberLogs] = useState<MemberLog[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    // 從 API 載入會員資料
    const loadMembers = async () => {
      try {
        const response = await fetch('/api/members', {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error('讀取會員資料失敗')
        }
        const data = await response.json()
        setMembers(data)
      } catch (error) {
        console.error('讀取會員資料失敗:', error)
      }
    }

    loadMembers()
  }, [loading, user, router])

  const handleViewMember = (member: Member) => {
    setSidebarMember(member)
    setIsSidebarOpen(true)
    loadMemberLogs(member.id)
  }

  const handleViewLogs = (member: Member) => {
    setSelectedMember(member)
    loadMemberLogs(member.id)
    setIsLogModalOpen(true)
  }

  const loadMemberLogs = async (memberId: string) => {
    try {
      const response = await fetch(`/api/members/${memberId}/logs`)
      if (!response.ok) {
        throw new Error('讀取記錄失敗')
      }
      const logs = await response.json()
      setSidebarMemberLogs(logs)
    } catch (error) {
      console.error('讀取記錄失敗:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>會員管理 - MBC管理系統</title>
      </Head>

      <DashboardNav />

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">會員管理</h1>
            <button
              onClick={() => setIsCreateMode(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              新增會員
            </button>
          </div>

          {/* 搜尋欄 */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="搜尋會員..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 會員列表 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    會員編號
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    電話
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    加入日期
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.memberNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {member.name}
                      </div>
                      {member.nickname && (
                        <div className="text-sm text-gray-500">
                          {member.nickname}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status === 'active' ? '啟用' : '停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewMember(member)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => handleViewLogs(member)}
                        className="text-green-600 hover:text-green-900"
                      >
                        記錄
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 側邊欄 */}
      {isSidebarOpen && (
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">
                        會員詳細資料
                      </h2>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <span className="sr-only">關閉面板</span>
                        <svg
                          className="h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 relative flex-1 px-4 sm:px-6">
                    {/* 會員詳細資料內容 */}
                    {sidebarMember && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            基本資料
                          </h3>
                          <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                            <div className="py-3 flex justify-between text-sm">
                              <dt className="text-gray-500">會員編號</dt>
                              <dd className="text-gray-900">
                                {sidebarMember.memberNo}
                              </dd>
                            </div>
                            <div className="py-3 flex justify-between text-sm">
                              <dt className="text-gray-500">姓名</dt>
                              <dd className="text-gray-900">
                                {sidebarMember.name}
                              </dd>
                            </div>
                            <div className="py-3 flex justify-between text-sm">
                              <dt className="text-gray-500">暱稱</dt>
                              <dd className="text-gray-900">
                                {sidebarMember.nickname || '-'}
                              </dd>
                            </div>
                            <div className="py-3 flex justify-between text-sm">
                              <dt className="text-gray-500">電話</dt>
                              <dd className="text-gray-900">
                                {sidebarMember.phone}
                              </dd>
                            </div>
                            <div className="py-3 flex justify-between text-sm">
                              <dt className="text-gray-500">電子郵件</dt>
                              <dd className="text-gray-900">
                                {sidebarMember.email || '-'}
                              </dd>
                            </div>
                            <div className="py-3 flex justify-between text-sm">
                              <dt className="text-gray-500">LINE ID</dt>
                              <dd className="text-gray-900">
                                {sidebarMember.lineId || '-'}
                              </dd>
                            </div>
                            <div className="py-3 flex justify-between text-sm">
                              <dt className="text-gray-500">地址</dt>
                              <dd className="text-gray-900">
                                {sidebarMember.address || '-'}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            變更記錄
                          </h3>
                          <div className="mt-2 flow-root">
                            <ul className="-mb-8">
                              {sidebarMemberLogs.map((log, logIdx) => (
                                <li key={log.id}>
                                  <div className="relative pb-8">
                                    {logIdx !== sidebarMemberLogs.length - 1 ? (
                                      <span
                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                        aria-hidden="true"
                                      />
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                      <div>
                                        <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                                          <svg
                                            className="h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                          >
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path
                                              fillRule="evenodd"
                                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </span>
                                      </div>
                                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                          <p className="text-sm text-gray-500">
                                            {log.action}
                                          </p>
                                          <p className="text-sm text-gray-900">
                                            {log.details}
                                          </p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                          <time dateTime={log.createdAt}>
                                            {new Date(
                                              log.createdAt
                                            ).toLocaleString()}
                                          </time>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MembersPage

export async function getServerSideProps() {
  return {
    props: {},
  }
} 