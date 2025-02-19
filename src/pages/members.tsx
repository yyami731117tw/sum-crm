import type { NextPage } from 'next'
import type { ReactElement } from 'react'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { MainNav } from '@/components/layout/MainNav'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { Staff } from '@/data/staffs'
import { mockStaffs } from '@/data/staffs'
import { useMembersCache } from '@/hooks/useMembersCache'
import { config } from '@/utils/config'
import { PATHS } from '@/utils/paths'

interface Member {
  id: string
  memberNo: string
  name: string
  nickname?: string
  phone: string
  email: string
  lineId?: string
  address?: string
  status: '一般會員' | 'VIP會員' | '天使會員' | '股東' | '合作' | '黑名單'
  notes?: string
  createdAt: string
  updatedAt: string
  serviceStaff?: string
  joinDate?: string
  remainingDays?: number
  hasMembershipPeriod?: boolean
  idNumber?: string
  birthday?: string
  age?: number
  gender?: '男' | '女'
  nationality?: string
  occupation?: string
  dietaryHabits?: string
  isUSCitizen?: boolean
  idCardFront?: string
  idCardBack?: string
  emergencyContact?: string
  emergencyRelation?: string
  emergencyPhone?: string
  membershipStartDate?: string
  membershipEndDate?: string
  relationships?: Array<{
    memberId: string
    type: string
  }>
  referrer?: string
  memberCategory?: 'VIP' | '天使'
  expertise?: string[]
  taboos?: string[]
  familyStatus?: string
  education?: '高中以下' | '高中職' | '專科' | '大學' | '碩士' | '博士'
  investments?: Array<{
    id: string
    projectName: string
    amount: number
    date: string
    status: string
    contractId: string
  }>
  joinCondition?: '舊會員' | '會員體驗' | '200萬財力審查'
}

interface MemberLog {
  id: string
  memberId: string
  action: string
  timestamp: string
  details: string
  operator: string
  changes?: {
    field: string
    oldValue: string
    newValue: string
  }[]
}

interface User {
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

const MembersPage = (): ReactElement => {
  const { session, status } = useAuth()
  const loading = status === 'loading'
  const user = session?.user
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [users, setUsers] = useState<User[]>([])
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
  const [staffs, setStaffs] = useState<Staff[]>([])

  // 使用快取 hook
  const membersCache = useMembersCache<Member[]>(config.cacheKeys.members)
  const memberLogsCache = useMembersCache<MemberLog[]>(config.cacheKeys.memberLogs)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const diff = e.clientX - startX
      setSidebarWidth(Math.max(400, Math.min(window.innerWidth - 100, sidebarWidth + diff)))
      setStartX(e.clientX)
    }
  }, [isResizing, startX, sidebarWidth])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', stopResizing)
  }, [handleMouseMove])

  const handleStartResizing = useCallback((e: React.MouseEvent) => {
    setIsResizing(true)
    setStartX(e.clientX)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', stopResizing)
  }, [handleMouseMove, stopResizing])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (members.length > 0) {
      membersCache.updateCache(members)
    }
  }, [members, membersCache])

  useEffect(() => {
    setSidebarWidth(window.innerWidth / 2)
  }, [])

  // 初始化人員資料
  useEffect(() => {
    setStaffs(mockStaffs.filter((staff: Staff) => staff.status === 'active'))
  }, [])

  // 模擬加載使用者數據
  useEffect(() => {
    // TODO: 替換為實際的 API 調用
    const mockUsers: User[] = [
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
    setUsers(mockUsers)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', stopResizing)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', stopResizing)
    }
  }, [isResizing, handleMouseMove, stopResizing]) // 添加依賴

  const generateMemberNo = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    // 從 localStorage 獲取當前年份的最大序號
    const currentYear = new Date().getFullYear().toString();
    const existingMembers = members.filter(m => m.memberNo.startsWith(year));
    const maxSeq = existingMembers.length > 0
      ? Math.max(...existingMembers.map(m => parseInt(m.memberNo.slice(-4))))
      : 0;
    const nextSeq = (maxSeq + 1).toString().padStart(4, '0');
    return `${year}${nextSeq}`;
  };

  const handleCreateMember = () => {
    const newMember: Member = {
      id: '',  // 留空，等儲存時生成
      memberNo: generateMemberNo(),
      name: '',  // 必填
      phone: '',  // 必填
      email: '',  // 必填
      status: '一般會員',  // 必填
      createdAt: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      updatedAt: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
    }
    setSidebarMember(newMember)
    setSidebarMemberLogs([])
    setIsSidebarOpen(true)
  }

  const handleViewMember = (member: Member) => {
    setSidebarMember(member)
    
    // 如果是新會員（id 為空），則不顯示變更紀錄
    if (!member.id) {
      setSidebarMemberLogs([])
    setIsSidebarOpen(true)
      return
    }
    
    // 從 localStorage 讀取變更紀錄
    const savedLogs = localStorage.getItem('memberLogs')
    if (savedLogs) {
      const allLogs: MemberLog[] = JSON.parse(savedLogs)
      // 篩選出當前會員的變更紀錄，並按時間排序
      const memberLogs = allLogs
        .filter(log => log.memberId === member.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setSidebarMemberLogs(memberLogs)
    } else {
      setSidebarMemberLogs([])
    }
    
    setIsSidebarOpen(true)
  }

  const handleSaveMember = () => {
    if (!sidebarMember) return

    // 檢查必填欄位
    if (!sidebarMember.name || !sidebarMember.phone || !sidebarMember.idNumber) {
      alert('請填寫必填欄位：姓名、電話、身分證字號')
      return
    }

    // 檢查身分證字號是否重複
    const isDuplicateIdNumber = members.some(member => 
      member.id !== sidebarMember.id && 
      member.idNumber === sidebarMember.idNumber
    )

    if (isDuplicateIdNumber) {
      alert('此身分證字號已存在，請確認後重新輸入')
      return
    }

    const now = new Date()
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    // 從 localStorage 讀取現有的變更紀錄
    const savedLogs = localStorage.getItem('memberLogs')
    const allLogs: MemberLog[] = savedLogs ? JSON.parse(savedLogs) : []

    // 如果是新會員
    if (!sidebarMember.id || sidebarMember.id === '') {
      const newMember = {
        ...sidebarMember,
        id: generateId(),
      }
      setMembers(prevMembers => [...prevMembers, newMember])

      // 記錄新增會員的變更
      const newLog: MemberLog = {
        id: generateId(),
        memberId: newMember.id,
        action: '新增會員',
        timestamp,
        details: `新增會員：${newMember.name}（${newMember.memberNo}）`,
        operator: user?.name || '系統管理員'
      }
      
      // 更新 localStorage 中的變更紀錄
      const updatedLogs = [newLog, ...allLogs]
      localStorage.setItem('memberLogs', JSON.stringify(updatedLogs))
      setSidebarMemberLogs(prevLogs => [newLog, ...prevLogs])
    } else {
      // 如果是編輯現有會員
      const oldMember = members.find(m => m.id === sidebarMember.id)
      if (oldMember) {
        // 比較變更的欄位
        const changes: { field: string; oldValue: string; newValue: string }[] = []
        Object.entries(sidebarMember).forEach(([key, value]) => {
          const oldValue = oldMember[key as keyof Member]
          if (oldValue !== value) {
            // 處理特殊型別的顯示
            let displayOldValue = Array.isArray(oldValue) ? oldValue.join(', ') : String(oldValue || '')
            let displayNewValue = Array.isArray(value) ? value.join(', ') : String(value || '')

            // 處理布林值的顯示
            if (typeof oldValue === 'boolean') displayOldValue = oldValue ? '是' : '否'
            if (typeof value === 'boolean') displayNewValue = value ? '是' : '否'

            changes.push({
              field: key,
              oldValue: displayOldValue,
              newValue: displayNewValue
            })
          }
        })

        if (changes.length > 0) {
          const newLog: MemberLog = {
            id: generateId(),
            memberId: sidebarMember.id,
            action: '更新會員資料',
            timestamp,
            details: `更新會員：${sidebarMember.name}（${sidebarMember.memberNo}）的資料`,
            operator: user?.name || '系統管理員',
            changes
          }
          
          // 更新 localStorage 中的變更紀錄
          const updatedLogs = [newLog, ...allLogs]
          localStorage.setItem('memberLogs', JSON.stringify(updatedLogs))
          setSidebarMemberLogs(prevLogs => [newLog, ...prevLogs])
        }
      }

      setMembers(prevMembers => prevMembers.map(member =>
        member.id === sidebarMember.id ? sidebarMember : member
      ))
    }

    setIsSidebarOpen(false)
    setSidebarMember(null)
  }

  // 生成唯一 ID
  const generateId = () => {
    return 'id_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // 計算年齡
  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday.replace(/\//g, '-'))
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // 當生日變更時更新年齡
  const handleBirthdayChange = (birthday: string) => {
    const formattedBirthday = birthday.replace(/-/g, '/')
    const age = calculateAge(formattedBirthday)
    setSidebarMember({
      ...sidebarMember!,
      birthday: formattedBirthday,
      age
    })
  }

  const handleFileUpload = async (file: File, type: 'front' | 'back') => {
    // TODO: 實作檔案上傳 API
    // 這裡先模擬上傳成功，返回檔案 URL
    const mockUrl = `https://example.com/uploads/${file.name}`
    setSidebarMember({
      ...sidebarMember!,
      [type === 'front' ? 'idCardFront' : 'idCardBack']: mockUrl
    })
  }

  // 計算剩餘天數
  const calculateRemainingDays = (endDate: string): number => {
    const end = new Date(endDate.replace(/\//g, '-'))
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // 當會員期限變更時更新剩餘天數
  const handleMembershipEndDateChange = (endDate: string) => {
    if (!sidebarMember) return
    const formattedEndDate = endDate.replace(/-/g, '/')
    const remainingDays = calculateRemainingDays(formattedEndDate)
    setSidebarMember({
      ...sidebarMember,
      membershipEndDate: formattedEndDate,
      remainingDays
    })
  }

  type MemberStatus = 'enabled' | 'review' | 'active' | 'disabled'

  // 計算會員狀態
  const getMemberStatus = (member: Member): MemberStatus => {
    // 如果是黑名單，直接返回停用
    if (member.status === '黑名單') {
      return 'disabled'
    }

    // 檢查是否需要審查
    // VIP會員需要上傳身分證
    if ((member.status === 'VIP會員' || member.status === '天使會員') && 
        (!member.idCardFront || !member.idCardBack)) {
      return 'review'
    }

    // 檢查活躍條件
    // 1. 有投資紀錄
    // 2. 會員期限內
    const hasInvestments = member.investments && member.investments.length > 0
    const isWithinMembership = member.hasMembershipPeriod && 
                              member.remainingDays !== undefined && 
                              member.remainingDays > 0

    if (hasInvestments || isWithinMembership) {
      return 'active'
    }

    // 預設為啟用
    return 'enabled'
  }

  const getStatusBadgeColor = (member: Member) => {
    const memberStatus = getMemberStatus(member)
    switch (memberStatus) {
      case 'enabled':
        return 'bg-green-100 text-green-800'
      case 'review':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'disabled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (member: Member) => {
    const memberStatus = getMemberStatus(member)
    switch (memberStatus) {
      case 'enabled':
        return '啟用'
      case 'review':
        return '審查'
      case 'active':
        return '活躍'
      case 'disabled':
        return '停用'
      default:
        return '啟用'
    }
  }

  const getRemainingDaysColor = (days: number | undefined, hasMembershipPeriod: boolean | undefined) => {
    if (!hasMembershipPeriod) return 'text-gray-600'  // 無期限：灰色
    if (days === undefined || days <= 0) return 'text-red-800 font-medium'  // 已到期：深紅色
    if (days <= 15) return 'text-red-600'  // 15天內：紅色
    if (days <= 30) return 'text-orange-500'  // 30天內：橘色
    return 'text-gray-600'  // 正常：灰色
  }

  const getRemainingDaysMessage = (days: number | undefined, hasMembershipPeriod: boolean | undefined) => {
    if (!hasMembershipPeriod) return ''  // 無期限不顯示訊息
    if (days === undefined || days <= 0) return ''  // 已到期不顯示額外訊息
    if (days <= 15) return '確認是否續約'  // 15天內
    if (days <= 30) return '即將到期'  // 30天內
    return ''  // 正常不顯示額外訊息
  }

  const getRemainingDaysDisplay = (days: number | undefined, hasMembershipPeriod: boolean | undefined) => {
    if (!hasMembershipPeriod) return '無期限'
    if (days === undefined || days <= 0) return '已到期'
    return `剩餘 ${days} 天`
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  )

  const startResizing = (e: React.MouseEvent) => {
    setIsResizing(true)
    setStartX(e.clientX)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', stopResizing)
  }

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
        <title>會員管理 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen bg-gray-100 pt-16">
      <MainNav />

        <div className="py-10">
          <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                會員管理
              </h1>
          </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                {/* 搜尋和新增區 */}
                <div className="mb-6 flex justify-between items-center">
                  <div className="max-w-lg flex-1 mr-4">
                    <label htmlFor="search" className="sr-only">搜尋會員</label>
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
                        placeholder="搜尋會員編號、姓名或電話"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateMember}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    新增會員
                  </button>
          </div>

          {/* 會員列表 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    會員資料
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    會員類型
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    電話
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    服務專員
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    加入時間
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    會員期限
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                      <div className="text-sm font-medium text-gray-900">
                            <button
                              onClick={() => handleViewMember(member)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                            >
                        {member.name}
                            </button>
                      </div>
                          <div className="text-sm text-gray-500">會員編號：{member.memberNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {users.find(user => user.id === member.serviceStaff)?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getStatusBadgeColor(member)
                      }`}>
                        {getStatusText(member)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className={getRemainingDaysColor(member.remainingDays, member.hasMembershipPeriod)}>
                          {getRemainingDaysDisplay(member.remainingDays, member.hasMembershipPeriod)}
                        </div>
                        {getRemainingDaysMessage(member.remainingDays, member.hasMembershipPeriod) && (
                          <div className={`text-sm ${getRemainingDaysColor(member.remainingDays, member.hasMembershipPeriod)}`}>
                            {getRemainingDaysMessage(member.remainingDays, member.hasMembershipPeriod)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewMember(member)}
                        className="text-green-600 hover:text-green-900"
                      >
                        使用記錄
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                  {(!members || members.length === 0) && (
                    <div className="text-center py-8 text-sm text-gray-500">
                      尚無會員資料
                    </div>
                  )}
                </div>
          </div>
        </div>
      </main>
        </div>
      </div>

      {/* 使用記錄 Modal */}
      {isLogModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  使用記錄
                </h3>
                <div className="space-y-4">
                  {selectedMemberLogs.map(log => (
                    <div key={log.id} className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <p className="text-sm text-gray-500">{log.details}</p>
                          {log.changes && (
                            <div className="mt-2 space-y-1">
                              {log.changes.map((change, index) => (
                                <p key={index} className="text-sm text-gray-500">
                                  {change.field}: {change.oldValue} → {change.newValue}
                                </p>
                              ))}
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mt-1">操作人員：{log.operator}</p>
                        </div>
                        <p className="text-sm text-gray-500">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 側邊會員詳細資料 */}
      {isSidebarOpen && sidebarMember && (
        <div className="fixed inset-0 overflow-hidden z-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                 onClick={() => setIsSidebarOpen(false)}></div>
            <section className="absolute inset-y-0 right-0 max-w-full flex">
              <div 
                className="absolute inset-y-0 left-0 w-4 cursor-ew-resize bg-transparent hover:bg-blue-200 hover:bg-opacity-50 transition-colors"
                onMouseDown={handleStartResizing}
              >
                <div className="absolute inset-y-0 left-1/2 w-1 bg-gray-300"></div>
              </div>
              <div className="relative flex" style={{ width: `${sidebarWidth}px` }}>
                <div className="flex-1 h-full flex flex-col bg-white shadow-xl overflow-y-auto">
                  {/* 標題列 */}
                  <div className="px-4 py-4 sm:px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xl font-medium text-blue-600">
                              {sidebarMember.name[0]}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {sidebarMember.name}
                            {sidebarMember.nickname && (
                              <span className="ml-2 text-base text-gray-500">
                                ({sidebarMember.nickname})
                              </span>
                            )}
                      </h2>
                          <div className="mt-1 flex items-center space-x-4">
                            <p className="text-sm text-gray-500">
                              會員編號：{sidebarMember.memberNo}
                            </p>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              getStatusBadgeColor(sidebarMember)
                            }`}>
                              {getStatusText(sidebarMember)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                          className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <span className="sr-only">關閉</span>
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 會員資料 */}
                  <div className="flex-1 px-4 py-6 sm:px-6 overflow-y-auto bg-gray-50">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                      {/* 基本資料 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200">基本資料</h3>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">會員編號</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.memberNo}
                            disabled
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">會員類型</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.status}
                            onChange={(e) => setSidebarMember({...sidebarMember, status: e.target.value as Member['status']})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="一般會員">一般會員</option>
                            <option value="VIP會員">VIP會員</option>
                            <option value="天使會員">天使會員</option>
                            <option value="股東">股東</option>
                            <option value="合作">合作</option>
                            <option value="黑名單">黑名單</option>
                          </select>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          姓名 <span className="text-red-500">*</span>
                        </dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.name}
                            onChange={(e) => setSidebarMember({...sidebarMember, name: e.target.value})}
                            required
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">暱稱</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.nickname || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, nickname: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">性別</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.gender}
                            onChange={(e) => setSidebarMember({...sidebarMember, gender: e.target.value as '男' | '女'})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="男">男</option>
                            <option value="女">女</option>
                          </select>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          身分證字號 <span className="text-red-500">*</span>
                        </dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.idNumber}
                            onChange={(e) => setSidebarMember({...sidebarMember, idNumber: e.target.value})}
                            required
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">生日</dt>
                        <dd className="mt-1">
                          <input
                            type="date"
                            value={sidebarMember.birthday?.replace(/\//g, '-') || ''}
                            onChange={(e) => handleBirthdayChange(e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">年齡</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.age || ''}
                            disabled
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">國籍</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.nationality || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, nationality: e.target.value as Member['nationality']})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            <option value="台灣 Taiwan">台灣 Taiwan</option>
                            <option value="馬來西亞 Malaysia">馬來西亞 Malaysia</option>
                            <option value="中國 China">中國 China</option>
                            <option value="香港 Hong Kong">香港 Hong Kong</option>
                            <option value="澳洲 Australia">澳洲 Australia</option>
                            <option value="日本 Japan">日本 Japan</option>
                          </select>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">職業</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.occupation || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, occupation: e.target.value as Member['occupation']})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            <option value="家管">家管</option>
                            <option value="軍公教">軍公教</option>
                            <option value="製造業">製造業</option>
                            <option value="服務業">服務業</option>
                            <option value="農業">農業</option>
                            <option value="科技業">科技業</option>
                            <option value="金融保險">金融保險</option>
                            <option value="商業貿易">商業貿易</option>
                            <option value="公共事業">公共事業</option>
                          </select>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">飲食習慣</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.dietaryHabits || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, dietaryHabits: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="例：素食、不吃海鮮"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">是否為美國公民</dt>
                        <dd className="mt-1">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isUSCitizen"
                              checked={sidebarMember.isUSCitizen || false}
                              onChange={(e) => setSidebarMember({...sidebarMember, isUSCitizen: e.target.checked})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isUSCitizen" className="ml-2 block text-sm text-gray-900">
                              是
                            </label>
                          </div>
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">身分證影本</dt>
                        <dd className="mt-1">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="mb-2 text-sm text-gray-500">正面</p>
                              {sidebarMember.idCardFront ? (
                                <div className="relative">
                                  <img
                                    src={sidebarMember.idCardFront}
                                    alt="身分證正面"
                                    className="h-32 w-48 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setSidebarMember({...sidebarMember, idCardFront: undefined})}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                              ) : (
                                <div className="flex justify-center items-center w-48 h-32 border-2 border-gray-300 border-dashed rounded-lg">
                                  <label className="relative cursor-pointer">
                                    <div className="text-center">
                                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      <p className="mt-1 text-sm text-gray-600">點擊上傳</p>
                  </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'front')}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                        <div>
                              <p className="mb-2 text-sm text-gray-500">反面</p>
                              {sidebarMember.idCardBack ? (
                                <div className="relative">
                                  <img
                                    src={sidebarMember.idCardBack}
                                    alt="身分證反面"
                                    className="h-32 w-48 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setSidebarMember({...sidebarMember, idCardBack: undefined})}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-100 p-1 text-red-600 hover:bg-red-200"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center items-center w-48 h-32 border-2 border-gray-300 border-dashed rounded-lg">
                                  <label className="relative cursor-pointer">
                                    <div className="text-center">
                                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      <p className="mt-1 text-sm text-gray-600">點擊上傳</p>
                                    </div>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'back')}
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                              </dd>
                            </div>

                      {/* 聯絡資訊 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">聯絡資訊</h3>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          電話 <span className="text-red-500">*</span>
                        </dt>
                        <dd className="mt-1">
                          <input
                            type="tel"
                            value={sidebarMember.phone}
                            onChange={(e) => setSidebarMember({...sidebarMember, phone: e.target.value})}
                            required
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                              </dd>
                            </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">電子郵件</dt>
                        <dd className="mt-1">
                          <input
                            type="email"
                            value={sidebarMember.email || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, email: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                              </dd>
                            </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">LINE ID</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.lineId || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, lineId: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                              </dd>
                            </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">通訊地址</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.address || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, address: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                              </dd>
                            </div>

                      {/* 緊急聯絡人 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">緊急聯絡人</h3>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">姓名</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.emergencyContact || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, emergencyContact: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                              </dd>
                            </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">關係</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.emergencyRelation || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, emergencyRelation: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                              </dd>
                            </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">電話</dt>
                        <dd className="mt-1">
                          <input
                            type="tel"
                            value={sidebarMember.emergencyPhone || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, emergencyPhone: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                        </div>

                      {/* 會員資訊 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">會員資訊</h3>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">加入時間</dt>
                        <dd className="mt-1">
                          <input
                            type="date"
                            value={sidebarMember.joinDate?.replace(/\//g, '-') || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, joinDate: e.target.value.replace(/-/g, '/')})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">入會條件</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.joinCondition || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, joinCondition: e.target.value as Member['joinCondition']})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            <option value="舊會員">舊會員</option>
                            <option value="會員體驗">會員體驗</option>
                            <option value="200萬財力審查">200萬財力審查</option>
                          </select>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">服務專員</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.serviceStaff || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, serviceStaff: e.target.value})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            {users
                              .filter(user => user.status === 'active' && (user.role === 'admin' || user.role === 'staff'))
                              .map(user => (
                                <option key={user.id} value={user.id}>
                                  {user.name} ({user.role === 'admin' ? '管理員' : '客服人員'})
                                </option>
                              ))
                            }
                          </select>
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">會員期限</dt>
                        <dd className="mt-1">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={sidebarMember.hasMembershipPeriod || false}
                                onChange={(e) => setSidebarMember({...sidebarMember, hasMembershipPeriod: e.target.checked})}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 text-sm text-gray-700">設定會員期限</label>
                            </div>
                            {sidebarMember.hasMembershipPeriod && (
                              <>
                                <input
                                  type="date"
                                  value={sidebarMember.membershipStartDate?.replace(/\//g, '-') || ''}
                                  onChange={(e) => setSidebarMember({...sidebarMember, membershipStartDate: e.target.value.replace(/-/g, '/')})}
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="開始日期"
                                />
                                <input
                                  type="date"
                                  value={sidebarMember.membershipEndDate?.replace(/\//g, '-') || ''}
                                  onChange={(e) => handleMembershipEndDateChange(e.target.value)}
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="結束日期"
                                />
                                <div className={`text-sm ${getRemainingDaysColor(sidebarMember.remainingDays, sidebarMember.hasMembershipPeriod)}`}>
                                  {getRemainingDaysDisplay(sidebarMember.remainingDays, sidebarMember.hasMembershipPeriod)}
                                  {getRemainingDaysMessage(sidebarMember.remainingDays, sidebarMember.hasMembershipPeriod) && (
                                    <span className="ml-2">
                                      ({getRemainingDaysMessage(sidebarMember.remainingDays, sidebarMember.hasMembershipPeriod)})
                                        </span>
                                  )}
                                      </div>
                              </>
                            )}
                                        </div>
                        </dd>
                                        </div>

                      {/* 關係人資訊 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">關係人資訊</h3>
                                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">關係人</dt>
                        <dd className="mt-1">
                          <div className="border border-gray-200 rounded-md">
                            {(sidebarMember?.relationships || []).length > 0 ? (
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">關係</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">會員編號</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {(sidebarMember?.relationships || []).map((relationship, index) => {
                                    const relatedMember = members.find(m => m.id === relationship.memberId)
                                    return (
                                      <tr key={`relationship-${index}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                          <select
                                            value={relationship.memberId}
                                            onChange={(e) => {
                                              if (!sidebarMember) return
                                              const newRelationships = [...sidebarMember.relationships || []]
                                              newRelationships[index] = {
                                                ...relationship,
                                                memberId: e.target.value
                                              }
                                              setSidebarMember({
                                                ...sidebarMember,
                                                relationships: newRelationships
                                              })
                                              
                                              // 更新對方的關係人資訊
                                              const targetMember = members.find(m => m.id === e.target.value)
                                              if (targetMember) {
                                                const updatedMembers = members.map(m => {
                                                  if (m.id === e.target.value) {
                                                    return {
                                                      ...m,
                                                      relationships: [
                                                        ...(m.relationships || []),
                                                        {
                                                          memberId: sidebarMember.id,
                                                          type: relationship.type
                                                        }
                                                      ]
                                                    }
                                                  }
                                                  return m
                                                })
                                                setMembers(updatedMembers)
                                              }
                                            }}
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                          >
                                            <option value="">請選擇會員</option>
                                            {members
                                              .filter(m => m.id !== sidebarMember?.id)
                                              .map(member => (
                                                <option key={member.id} value={member.id}>
                                                  {member.name} ({member.memberNo})
                                                </option>
                                              ))
                                            }
                                          </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          <input
                                            type="text"
                                            value={relationship.type}
                                            onChange={(e) => {
                                              if (!sidebarMember) return
                                              const newRelationships = [...sidebarMember.relationships || []]
                                              newRelationships[index] = {
                                                ...relationship,
                                                type: e.target.value
                                              }
                                              setSidebarMember({
                                                ...sidebarMember,
                                                relationships: newRelationships
                                              })
                                              
                                              // 更新對方的關係人資訊
                                              const targetMember = members.find(m => m.id === relationship.memberId)
                                              if (targetMember) {
                                                const updatedMembers = members.map(m => {
                                                  if (m.id === relationship.memberId) {
                                                    return {
                                                      ...m,
                                                      relationships: m.relationships?.map(r => 
                                                        r.memberId === sidebarMember.id 
                                                          ? { ...r, type: e.target.value }
                                                          : r
                                                      )
                                                    }
                                                  }
                                                  return m
                                                })
                                                setMembers(updatedMembers)
                                              }
                                            }}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="請輸入關係"
                                          />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {relatedMember?.memberNo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (!sidebarMember) return
                                              const newRelationships = [...sidebarMember.relationships || []]
                                              newRelationships.splice(index, 1)
                                              setSidebarMember({
                                                ...sidebarMember,
                                                relationships: newRelationships
                                              })
                                              
                                              // 更新對方的關係人資訊
                                              const targetMember = members.find(m => m.id === relationship.memberId)
                                              if (targetMember) {
                                                const updatedMembers = members.map(m => {
                                                  if (m.id === relationship.memberId) {
                                                    return {
                                                      ...m,
                                                      relationships: m.relationships?.filter(r => 
                                                        r.memberId !== sidebarMember.id
                                                      )
                                                    }
                                                  }
                                                  return m
                                                })
                                                setMembers(updatedMembers)
                                              }
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                          >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            ) : (
                              <div className="text-center py-4 text-sm text-gray-500">尚無關係人資料</div>
                            )}
                                    </div>
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => {
                                if (!sidebarMember) return
                                const newRelationship = {
                                  memberId: '',
                                  type: ''
                                }
                                setSidebarMember({
                                  ...sidebarMember,
                                  relationships: [...(sidebarMember.relationships || []), newRelationship]
                                })
                              }}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              新增關係人
                            </button>
                                  </div>
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">介紹人</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.referrer || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, referrer: e.target.value})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            {members.map(member => (
                              <option key={member.id} value={member.id}>{member.name} ({member.memberNo})</option>
                            ))}
                          </select>
                        </dd>
                          </div>

                      {/* VIP 會員資訊 */}
                      {(sidebarMember.memberCategory === 'VIP' || sidebarMember.memberCategory === '天使') && (
                        <>
                          <div className="sm:col-span-2">
                            <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">VIP 會員資訊</h3>
                        </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">專長</dt>
                            <dd className="mt-1">
                              <input
                                type="text"
                                value={sidebarMember.expertise?.join(', ') || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, expertise: e.target.value.split(',').map(s => s.trim())})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="請用逗號分隔多個專長"
                              />
                            </dd>
                      </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">禁忌</dt>
                            <dd className="mt-1">
                              <input
                                type="text"
                                value={sidebarMember.taboos?.join(', ') || ''}
                                onChange={(e) => setSidebarMember({...sidebarMember, taboos: e.target.value.split(',').map(s => s.trim())})}
                                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="請用逗號分隔多個禁忌"
                              />
                            </dd>
                          </div>
                        </>
                      )}

                      {/* 其他資訊 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">其他資訊</h3>
                  </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">家庭狀況</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.familyStatus || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, familyStatus: e.target.value})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="例：已婚、育有2子"
                          />
                        </dd>
                </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">學歷</dt>
                        <dd className="mt-1">
                          <select
                            value={sidebarMember.education || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, education: e.target.value as Member['education']})}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">請選擇</option>
                            <option value="高中以下">高中以下</option>
                            <option value="高中職">高中職</option>
                            <option value="專科">專科</option>
                            <option value="大學">大學</option>
                            <option value="碩士">碩士</option>
                            <option value="博士">博士</option>
                          </select>
                        </dd>
              </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">專長</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.expertise?.join(', ') || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, expertise: e.target.value.split(',').map(s => s.trim())})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="請用逗號分隔多個專長"
                          />
                        </dd>
            </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">禁忌</dt>
                        <dd className="mt-1">
                          <input
                            type="text"
                            value={sidebarMember.taboos?.join(', ') || ''}
                            onChange={(e) => setSidebarMember({...sidebarMember, taboos: e.target.value.split(',').map(s => s.trim())})}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="請用逗號分隔多個禁忌"
                          />
                        </dd>
          </div>

                      {/* 投資履歷 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">投資履歷</h3>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  投資項目
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  金額
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  日期
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  狀態
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                  <span className="sr-only">操作</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {sidebarMember.investments?.map((investment) => (
                                <tr key={investment.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {investment.projectName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${investment.amount.toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {investment.date}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      investment.status === '進行中' ? 'bg-green-100 text-green-800' :
                                      investment.status === '已結束' ? 'bg-gray-100 text-gray-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {investment.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                      href={`/admin/contracts/${investment.contractId}`}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      查看合約
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {(!sidebarMember.investments || sidebarMember.investments.length === 0) && (
                            <div className="text-center py-4 text-sm text-gray-500">
                              尚無投資紀錄
        </div>
      )}
    </div>
                      </div>

                      {/* 變更紀錄 */}
                      <div className="sm:col-span-2">
                        <h3 className="text-lg font-medium text-gray-900 pb-3 border-b border-gray-200 mt-8">變更紀錄</h3>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="max-h-40 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">時間</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">操作</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">內容</th>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">操作人</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {sidebarMemberLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {log.timestamp}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                                    {log.action}
                                  </td>
                                  <td className="px-3 py-2 text-xs text-gray-500">
                                    <div>{log.details}</div>
                                    {log.changes && (
                                      <div className="text-xs text-gray-400">
                                        {log.changes.map((change, index) => (
                                          <div key={index}>
                                            {change.field}: {change.oldValue} → {change.newValue}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                    {log.operator}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {sidebarMemberLogs.length === 0 && (
                            <div className="text-center py-3 text-sm text-gray-500">
                              尚無變更紀錄
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 按鈕區 */}
                      <div className="sm:col-span-2 mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={handleSaveMember}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          儲存
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsSidebarOpen(false)}
                          className="inline-flex items-center justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          取消
                        </button>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  )
}

export default MembersPage as NextPage 