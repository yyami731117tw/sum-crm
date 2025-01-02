import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface Member {
  id: string
  memberNo: string
  name: string
  phone: string
  gender: '男' | '女'
  nickname?: string
  idNumber: string
  birthday: string
  joinDate: string
  status: 'active' | 'inactive'
  email?: string
  lineId?: string
  address?: string
  memberType: '一般會員' | 'VIP會員'
  joinCondition?: string
  occupation?: string
  notes?: string
  idCardFront?: string
  idCardBack?: string
}

interface MemberLog {
  id: string
  memberId: string
  action: string
  timestamp: string
  details: string
}

const MemberDetailPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id } = router.query
  const [member, setMember] = useState<Member | null>(null)
  const [memberLogs, setMemberLogs] = useState<MemberLog[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (id) {
      // TODO: 替換為實際的 API 調用
      const mockMember: Member = {
        id: '1',
        memberNo: 'M001',
        name: '王小明',
        phone: '0912-345-678',
        gender: '男',
        nickname: '小明',
        idNumber: 'A123456789',
        birthday: '1990/01/01',
        joinDate: '2024/01/01',
        status: 'active',
        email: 'ming@example.com',
        lineId: 'ming_123',
        address: '台北市信義區信義路五段7號',
        memberType: '一般會員',
        joinCondition: '官網註冊',
        occupation: '工程師',
        notes: '對投資很有興趣'
      }
      setMember(mockMember)

      // 模擬從API獲取會員記錄
      const mockLogs: MemberLog[] = [
        {
          id: '1',
          memberId: '1',
          action: '更新個人資料',
          timestamp: '2024/01/15 14:30:00',
          details: '修改電話號碼'
        },
        {
          id: '2',
          memberId: '1',
          action: '參加活動',
          timestamp: '2024/01/14 11:20:00',
          details: '參加投資說明會'
        }
      ]
      setMemberLogs(mockLogs)
    }
  }, [id])

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!member) return
    // TODO: 實作更新會員資料的 API 調用
    setIsEditModalOpen(false)
  }

  const getStatusBadgeColor = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return '啟用'
      case 'inactive':
        return '停用'
      default:
        return status
    }
  }

  if (loading || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{member.name} - 會員詳細資料 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <DashboardNav />
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <button
                      onClick={() => router.back()}
                      className="mr-4 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                    <h1 className="text-3xl font-bold leading-tight text-gray-900">
                      會員詳細資料
                    </h1>
                  </div>
                </div>
                <div className="flex">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    編輯資料
                  </button>
                </div>
              </div>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xl font-medium text-blue-600">
                            {member.name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {member.name}
                          {member.nickname && ` (${member.nickname})`}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          會員編號：{member.memberNo}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">會員類型</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.memberType}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">狀態</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getStatusBadgeColor(member.status)
                          }`}>
                            {getStatusText(member.status)}
                          </span>
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">加入時間</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.joinDate}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">入會條件</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.joinCondition || '-'}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">身分證字號</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.idNumber}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">生日</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.birthday}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">性別</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.gender}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">電話</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.phone}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">電子郵件</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.email || '-'}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">LINE ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.lineId || '-'}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">通訊地址</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.address || '-'}</dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">職業</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.occupation || '-'}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">備註</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{member.notes || '-'}</dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">身分證影本</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="mb-2 text-sm text-gray-500">正面</p>
                              {member.idCardFront ? (
                                <div className="relative aspect-[1.6/1] bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={member.idCardFront}
                                    alt="身分證正面"
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center aspect-[1.6/1] bg-gray-100 rounded-lg">
                                  <span className="text-gray-400">尚未上傳</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="mb-2 text-sm text-gray-500">反面</p>
                              {member.idCardBack ? (
                                <div className="relative aspect-[1.6/1] bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={member.idCardBack}
                                    alt="身分證反面"
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center aspect-[1.6/1] bg-gray-100 rounded-lg">
                                  <span className="text-gray-400">尚未上傳</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* 使用記錄 */}
                <div className="mt-8">
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        使用記錄
                      </h3>
                    </div>
                    <div className="border-t border-gray-200">
                      <div className="divide-y divide-gray-200">
                        {memberLogs.map(log => (
                          <div key={log.id} className="px-4 py-4 sm:px-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                <p className="text-sm text-gray-500">{log.details}</p>
                              </div>
                              <p className="text-sm text-gray-500">{log.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 編輯會員 Modal */}
      {isEditModalOpen && member && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpdateMember}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    編輯會員資料
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        會員編號
                      </label>
                      <input
                        type="text"
                        value={member.memberNo}
                        readOnly
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        姓名
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => setMember({...member, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        電話
                      </label>
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => setMember({...member, phone: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        性別
                      </label>
                      <select
                        value={member.gender}
                        onChange={(e) => setMember({...member, gender: e.target.value as '男' | '女'})}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        會員類型
                      </label>
                      <select
                        value={member.memberType}
                        onChange={(e) => setMember({...member, memberType: e.target.value as '一般會員' | 'VIP會員'})}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="一般會員">一般會員</option>
                        <option value="VIP會員">VIP會員</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        身分證字號
                      </label>
                      <input
                        type="text"
                        value={member.idNumber}
                        onChange={(e) => setMember({...member, idNumber: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        生日
                      </label>
                      <input
                        type="date"
                        value={member.birthday.replace(/\//g, '-')}
                        onChange={(e) => setMember({...member, birthday: e.target.value.replace(/-/g, '/')})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        電子郵件
                      </label>
                      <input
                        type="email"
                        value={member.email || ''}
                        onChange={(e) => setMember({...member, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        LINE ID
                      </label>
                      <input
                        type="text"
                        value={member.lineId || ''}
                        onChange={(e) => setMember({...member, lineId: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        通訊地址
                      </label>
                      <input
                        type="text"
                        value={member.address || ''}
                        onChange={(e) => setMember({...member, address: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        職業
                      </label>
                      <input
                        type="text"
                        value={member.occupation || ''}
                        onChange={(e) => setMember({...member, occupation: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        入會條件
                      </label>
                      <input
                        type="text"
                        value={member.joinCondition || ''}
                        onChange={(e) => setMember({...member, joinCondition: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        備註
                      </label>
                      <textarea
                        value={member.notes || ''}
                        onChange={(e) => setMember({...member, notes: e.target.value})}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    儲存
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MemberDetailPage 