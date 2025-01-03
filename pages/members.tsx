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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const diff = startX - e.pageX
      const newWidth = Math.max(400, Math.min(1200, sidebarWidth + diff))
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, startX, sidebarWidth])

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
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="bg-white shadow overflow-x-auto rounded-lg">
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
                    會員類型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    會員期限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.memberType === 'regular' ? '一般會員' : 
                       member.memberType === 'vip' ? 'VIP會員' : 
                       member.memberType === 'enterprise' ? '企業會員' : '未指定'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.membershipEndDate ? new Date(member.membershipEndDate).toLocaleDateString('zh-TW') : '永久'}
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
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div 
                className="relative w-screen"
                style={{ maxWidth: `${sidebarWidth}px` }}
              >
                <div 
                  className="absolute -ml-8 top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-l cursor-ew-resize"
                  onMouseDown={(e) => {
                    setIsResizing(true)
                    setStartX(e.pageX)
                  }}
                >
                  <div className="w-1 h-8 bg-gray-400 rounded-full" />
                </div>
                <div className="h-full flex flex-col bg-white shadow-xl overflow-hidden">
                  <div className="flex-shrink-0 px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">會員詳細資料</h3>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <span className="sr-only">關閉面板</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="px-4 py-6 sm:px-6">
                    {sidebarMember && (
                      <div className="space-y-6">
                          <section>
                            <h4 className="font-medium text-gray-900">基本資料</h4>
                            <dl className="mt-4 border-t border-gray-200">
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">會員編號</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{sidebarMember.memberNo}</dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">姓名</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{sidebarMember.name}</dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">暱稱</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{sidebarMember.nickname || '-'}</dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">身份證字號</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{sidebarMember.idNumber || '-'}</dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">性別</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {sidebarMember.gender === 'male' ? '男' : 
                                   sidebarMember.gender === 'female' ? '女' : '未指定'}
                              </dd>
                            </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">生日</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {sidebarMember.birthday ? 
                                    new Date(sidebarMember.birthday).toLocaleDateString('zh-TW') : '-'}
                              </dd>
                            </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">電話</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{sidebarMember.phone}</dd>
                            </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">電子郵件</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{sidebarMember.email || '-'}</dd>
                            </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">會員類型</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {sidebarMember.memberType === 'regular' ? '一般會員' : 
                                   sidebarMember.memberType === 'vip' ? 'VIP會員' : 
                                   sidebarMember.memberType === 'enterprise' ? '企業會員' : '未指定'}
                              </dd>
                            </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">會員期限</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  {sidebarMember.membershipEndDate ? 
                                    new Date(sidebarMember.membershipEndDate).toLocaleDateString('zh-TW') : '永久'}
                              </dd>
                            </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">狀態</dt>
                                <dd className="mt-1 sm:mt-0 sm:col-span-2">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    sidebarMember.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {sidebarMember.status === 'active' ? '啟用' : '停用'}
                                  </span>
                              </dd>
                            </div>
                          </dl>
                          </section>

                          <section className="mt-8">
                            <h4 className="font-medium text-gray-900">最近記錄</h4>
                            <div className="mt-4 flow-root">
                            <ul className="-mb-8">
                                {sidebarMemberLogs.map((log, index) => (
                                <li key={log.id}>
                                  <div className="relative pb-8">
                                      {index < sidebarMemberLogs.length - 1 && (
                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                      )}
                                    <div className="relative flex space-x-3">
                                      <div>
                                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                            <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                                          </svg>
                                        </span>
                                      </div>
                                        <div className="min-w-0 flex-1">
                                        <div>
                                            <p className="text-sm text-gray-500">{log.action}</p>
                                            <p className="mt-0.5 text-sm text-gray-900">{log.details}</p>
                                          </div>
                                          <div className="mt-2 text-sm text-gray-500">
                                            <time dateTime={log.createdAt}>{new Date(log.createdAt).toLocaleString('zh-TW')}</time>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                          </section>
                        </div>
                      )}
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 記錄模態框 */}
      {isLogModalOpen && selectedMember && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsLogModalOpen(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    變更記錄 - {selectedMember.name}
                  </h3>
                  <div className="mt-4">
                    <ul className="divide-y divide-gray-200">
                      {selectedMemberLogs.map((log) => (
                        <li key={log.id} className="py-4">
                          <div className="flex space-x-3">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">
                                  {log.action}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {new Date(log.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500">
                                {log.details}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                  onClick={() => setIsLogModalOpen(false)}
                >
                  關閉
                </button>
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