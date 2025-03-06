'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TopNavbar from '@/components/TopNavbar'
import RightSidebar from '@/components/RightSidebar'
import { 
  Box,
  Container,
  Typography,
  CircularProgress,
  Card,
  Alert,
  Drawer,
  IconButton,
  Grid,
  TextField,
  Button,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  DialogActions,
  Chip,
} from '@mui/material'
import { Close, Search, Add, Upload, Description } from '@mui/icons-material'
import { toast, Toaster } from 'react-hot-toast'
import { styled } from '@mui/material/styles'

// 自定義 Link 組件
const StyledLink = styled('a')({
  display: 'flex',
  alignItems: 'center',
  color: 'primary.main',
  textDecoration: 'none',
  fontSize: '0.875rem',
  flexGrow: 1,
  '&:hover': {
    textDecoration: 'underline'
  }
})

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
  interests?: string
  passportNo?: string
  passportName?: string
  lastEditor?: string
  isSelected?: boolean
  attachments?: {
    name: string
    url: string
  }[]
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
  role: 'admin' | 'customer_service' | 'guest'
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  lastLogin: string
  lineId?: string
  address?: string
  birthday?: string
}

interface Contract {
  id: string
  contractNo: string
  projectName: string
  memberId: string
  memberName: string
  memberNo: string
  amount: number
  paymentMethod: string
  bankAccount: string
  signDate: string
  startDate: string
  endDate: string
  status: string
  invoiceInfo: string
  notes: string
  contractFile?: string
  attachments?: Array<{
    name: string
    url: string
  }>
}

interface NewMember {
  name: string
  email: string
  phone: string
  serviceStaff: string
  notes: string
}

export default function MembersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [selectedMemberLogs, setSelectedMemberLogs] = useState<MemberLog[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [isMemberSidebarOpen, setIsMemberSidebarOpen] = useState(false)
  const [isSettingsSidebarOpen, setIsSettingsSidebarOpen] = useState(false)
  const [sidebarMember, setSidebarMember] = useState<Member | null>(null)
  const [sidebarWidth, setSidebarWidth] = useState(800)
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [sidebarMemberLogs, setSidebarMemberLogs] = useState<MemberLog[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [availableStaff, setAvailableStaff] = useState<User[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [memberContracts, setMemberContracts] = useState<Contract[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newMember, setNewMember] = useState<NewMember>({
    name: '',
    email: '',
    phone: '',
    serviceStaff: '',
    notes: ''
  })

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
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    setSidebarWidth(window.innerWidth / 2)
  }, [])

  // 載入可用的服務人員
  useEffect(() => {
    const savedUsers = localStorage.getItem('users')
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers)
      setUsers(parsedUsers)
      // 過濾出活躍的使用者作為可用的服務人員
      const staff = parsedUsers.filter((user: User) => 
        user.status === 'active'
      )
      setAvailableStaff(staff)
    }
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
  }, [isResizing, handleMouseMove, stopResizing])

  // 在 useEffect 中加載已保存的會員資料
  useEffect(() => {
    const savedMembers = localStorage.getItem('members')
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers))
    }
  }, [])

  // 載入合約資料
  useEffect(() => {
    const savedContracts = localStorage.getItem('contracts')
    if (savedContracts) {
      setContracts(JSON.parse(savedContracts))
    }
  }, [])

  // 當選擇會員時，更新該會員的合約列表
  useEffect(() => {
    if (sidebarMember) {
      const userContracts = contracts.filter(contract => contract.memberId === sidebarMember.id)
      setMemberContracts(userContracts)
    } else {
      setMemberContracts([])
    }
  }, [sidebarMember, contracts])

  // 添加事件監聽
  useEffect(() => {
    const handleOpenMemberSidebar = (event: CustomEvent) => {
      const member = event.detail
      if (member) {
        setSidebarMember(member)
        setIsEditing(false)
        setIsMemberSidebarOpen(true)
      }
    }

    window.addEventListener('openMemberSidebar', handleOpenMemberSidebar as EventListener)
    
    return () => {
      window.removeEventListener('openMemberSidebar', handleOpenMemberSidebar as EventListener)
    }
  }, [])

  const generateMemberNo = () => {
    const year = new Date().getFullYear().toString().slice(-2)
    const existingMembers = members.filter(m => m.memberNo.startsWith(year))
    const maxSeq = existingMembers.length > 0
      ? Math.max(...existingMembers.map(m => parseInt(m.memberNo.slice(-4))))
      : 0
    const nextSeq = (maxSeq + 1).toString().padStart(4, '0')
    return `${year}${nextSeq}`
  }

  // 處理新增會員
  const handleCreateMember = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 驗證必填欄位
      if (!sidebarMember?.name || !sidebarMember?.serviceStaff) {
        throw new Error('請填寫所有必要欄位')
      }

      const timestamp = new Date().toISOString()
      const member: Member = {
        id: `member_${Date.now()}`,
      memberNo: generateMemberNo(),
        name: sidebarMember.name,
        phone: sidebarMember.phone || '',
        email: sidebarMember.email || '',
      status: '一般會員',
        serviceStaff: sidebarMember.serviceStaff,
        notes: sidebarMember.notes || '',
        createdAt: timestamp,
        updatedAt: timestamp,
        // 保留所有可選欄位
        idNumber: sidebarMember.idNumber || '',
        birthday: sidebarMember.birthday || '',
        age: sidebarMember.age,
        gender: sidebarMember.gender,
        nationality: sidebarMember.nationality || '',
        occupation: sidebarMember.occupation || '',
        address: sidebarMember.address || '',
        lineId: sidebarMember.lineId || '',
        emergencyContact: sidebarMember.emergencyContact || '',
        emergencyRelation: sidebarMember.emergencyRelation || '',
        emergencyPhone: sidebarMember.emergencyPhone || '',
        idCardFront: sidebarMember.idCardFront || '',
        idCardBack: sidebarMember.idCardBack || '',
        attachments: sidebarMember.attachments || []
      }

      // 更新會員列表
      const updatedMembers = [...members, member]
      setMembers(updatedMembers)
      localStorage.setItem('members', JSON.stringify(updatedMembers))

      // 發送通知給服務專員
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]')
      const staffMember = availableStaff.find(staff => staff.id === member.serviceStaff)
      
      // 只發送新會員通知，移除跟進提醒
      const newMemberNotification = {
        id: `notification_${Date.now()}_new`,
        type: 'new_member',
        title: '新會員通知',
        message: `新會員 ${member.name} (${member.memberNo}) 已建立`,
        targetId: member.id,
        targetType: 'member',
        isRead: false,
        createdAt: timestamp,
        assignedTo: member.serviceStaff
      }
      
      const updatedNotifications = [newMemberNotification, ...notifications]
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications))

      // 立即觸發新通知事件
      const event = new CustomEvent('newNotification', { detail: newMemberNotification })
      window.dispatchEvent(event)

      // 顯示成功訊息，包含服務專員資訊
      toast.success(`會員建立成功，已通知服務專員 ${staffMember?.name || ''}`)
      setIsMemberSidebarOpen(false)
      setSidebarMember(null)
      setIsEditing(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : '建立會員時發生錯誤')
      toast.error(error instanceof Error ? error.message : '建立會員時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewMember = (member: Member) => {
    setSidebarMember(member)
    setIsEditing(false)  // 初始設定為不可編輯
    
    if (!member.id) {
      setSidebarMemberLogs([])
      setIsMemberSidebarOpen(true)
      return
    }
    
    const savedLogs = localStorage.getItem('memberLogs')
    if (savedLogs) {
      const allLogs: MemberLog[] = JSON.parse(savedLogs)
      const memberLogs = allLogs
        .filter(log => log.memberId === member.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setSidebarMemberLogs(memberLogs)
    } else {
      setSidebarMemberLogs([])
    }
    
    setIsMemberSidebarOpen(true)
  }

  const handleSaveMember = () => {
    if (!sidebarMember) return

    if (!sidebarMember.name || !sidebarMember.phone || !sidebarMember.idNumber) {
      toast.error('請填寫必填欄位：姓名、電話、身分證字號')
      return
    }

    const isDuplicateIdNumber = members.some(member => 
      member.id !== sidebarMember.id && 
      member.idNumber === sidebarMember.idNumber
    )

    if (isDuplicateIdNumber) {
      toast.error('此身分證字號已存在，請確認後重新輸入')
      return
    }

    const now = new Date()
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    let updatedMembers: Member[]
    let updatedUsers = [...users]

    if (!sidebarMember.id) {
      const newMember = {
        ...sidebarMember,
        id: generateId(),
        createdAt: timestamp,
        updatedAt: timestamp
      }
      updatedMembers = [...members, newMember]
      
      // 如果是新會員且有 email，同步建立使用者資料
      if (newMember.email && !users.some(user => user.email === newMember.email)) {
        const newUser: User = {
          id: generateId(),
          name: newMember.name,
          email: newMember.email,
          phone: newMember.phone,
          role: 'guest',
          status: 'active',
          joinDate: timestamp,
          lastLogin: timestamp,
          lineId: newMember.lineId,
          address: newMember.address,
          birthday: newMember.birthday
        }
        updatedUsers = [...users, newUser]
        localStorage.setItem('users', JSON.stringify(updatedUsers))
        setUsers(updatedUsers)
      }
      
      const newLog: MemberLog = {
        id: generateId(),
        memberId: newMember.id,
        action: '新增會員',
        timestamp,
        details: `新增會員：${newMember.name}（${newMember.memberNo}）`,
        operator: session?.user?.name || '系統管理員'
      }
      
      const savedLogs = localStorage.getItem('memberLogs')
      const allLogs: MemberLog[] = savedLogs ? JSON.parse(savedLogs) : []
      const updatedLogs = [newLog, ...allLogs]
      localStorage.setItem('memberLogs', JSON.stringify(updatedLogs))
      setSidebarMemberLogs(prevLogs => [newLog, ...prevLogs])
    } else {
      const oldMember = members.find(m => m.id === sidebarMember.id)
      updatedMembers = members.map(member =>
        member.id === sidebarMember.id ? { ...sidebarMember, updatedAt: timestamp } : member
      )
      
      // 如果會員資料有更新，同步更新使用者資料
      if (oldMember && sidebarMember.email) {
        updatedUsers = users.map(user => 
          user.email === sidebarMember.email 
            ? {
                ...user,
                name: sidebarMember.name,
                phone: sidebarMember.phone,
                lineId: sidebarMember.lineId,
                address: sidebarMember.address,
                birthday: sidebarMember.birthday
              }
            : user
        )
        localStorage.setItem('users', JSON.stringify(updatedUsers))
        setUsers(updatedUsers)
      }
      
      if (oldMember) {
        const changes: { field: string; oldValue: string; newValue: string }[] = []
        Object.entries(sidebarMember).forEach(([key, value]) => {
          const oldValue = oldMember[key as keyof Member]
          if (oldValue !== value) {
            changes.push({
              field: key,
              oldValue: String(oldValue || ''),
              newValue: String(value || '')
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
            operator: session?.user?.name || '系統管理員',
            changes
          }
          
          const savedLogs = localStorage.getItem('memberLogs')
          const allLogs: MemberLog[] = savedLogs ? JSON.parse(savedLogs) : []
          const updatedLogs = [newLog, ...allLogs]
          localStorage.setItem('memberLogs', JSON.stringify(updatedLogs))
          setSidebarMemberLogs(prevLogs => [newLog, ...prevLogs])
        }
      }
    }

    // 保存更新後的會員資料
    localStorage.setItem('members', JSON.stringify(updatedMembers))
    setMembers(updatedMembers)
    
    toast.success('會員資料已儲存')
    setIsMemberSidebarOpen(false)
    setSidebarMember(null)
  }

  const generateId = () => {
    return 'id_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
  }

  const calculateAge = (birthday: string) => {
    if (!birthday) return undefined
    const birthDate = new Date(birthday.replace(/\//g, '-'))
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleBirthdayChange = (birthday: string) => {
    const formattedBirthday = birthday.replace(/-/g, '/')
    const age = calculateAge(formattedBirthday)
    setSidebarMember({
      ...sidebarMember!,
      birthday: formattedBirthday,
      age
    })
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files?.length || !sidebarMember) return

    const newFiles = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }))

    const updatedMember = {
      ...sidebarMember,
      attachments: [...(sidebarMember.attachments || []), ...newFiles]
    }

    setSidebarMember(updatedMember)

    // 更新 members 陣列
    const updatedMembers = members.map(m => 
      m.id === sidebarMember.id ? updatedMember : m
    )
    setMembers(updatedMembers)
    localStorage.setItem('members', JSON.stringify(updatedMembers))
  }

  const handleRemoveFile = (index: number) => {
    if (!sidebarMember) return

    const updatedMember = {
      ...sidebarMember,
      attachments: sidebarMember.attachments?.filter((_, i) => i !== index)
    }

    setSidebarMember(updatedMember)

    // 更新 members 陣列
    const updatedMembers = members.map(m => 
      m.id === sidebarMember.id ? updatedMember : m
    )
    setMembers(updatedMembers)
    localStorage.setItem('members', JSON.stringify(updatedMembers))
  }

  const calculateRemainingDays = (endDate: string | undefined): number | undefined => {
    if (!endDate) return undefined
    const end = new Date(endDate.replace(/\//g, '-'))
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

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

  const getMemberStatus = (member: Member): MemberStatus => {
    // 1. 如果是黑名單，直接返回停用
    if (member.status === '黑名單') {
      return 'disabled'
    }

    // 2. 檢查是否需要審查(VIP會員及天使會員需要上傳身分證)
    if ((member.status === 'VIP會員' || member.status === '天使會員') && 
        (!member.idCardFront || !member.idCardBack)) {
      return 'review'
    }

    // 3. 檢查活躍條件(近半年內有投資紀錄)
    const hasRecentInvestment = member.investments?.some(investment => {
      const investmentDate = new Date(investment.date.replace(/\//g, '-'))
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      return investmentDate >= sixMonthsAgo
    })

    if (hasRecentInvestment) {
      return 'active'
    }

    // 4. 預設為啟用
    return 'enabled'
  }

  const getStatusBadgeColor = (status: MemberStatus): string => {
    switch (status) {
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

  const getStatusText = (status: MemberStatus): string => {
    switch (status) {
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
    if (!hasMembershipPeriod) return 'text-gray-600'
    if (days === undefined || days <= 0) return 'text-red-900'
    if (days <= 15) return 'text-red-600'
    if (days <= 30) return 'text-orange-500'
    return 'text-gray-600'
  }

  const getRemainingDaysMessage = (days: number | undefined, hasMembershipPeriod: boolean | undefined) => {
    if (!hasMembershipPeriod) return ''
    if (days === undefined || days <= 0) return ''  // 已到期不顯示訊息
    if (days <= 15) return '確認是否續約'
    if (days <= 30) return '即將到期'
    return ''
  }

  const getRemainingDaysDisplay = (days: number | undefined, hasMembershipPeriod: boolean | undefined) => {
    if (!hasMembershipPeriod) return '無期限'
    if (days === undefined || days <= 0) return '已到期'
    return `剩餘 ${days} 天`
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm) ||
    (member.idNumber && member.idNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedMembers(filteredMembers.map(member => member.id))
    } else {
      setSelectedMembers([])
    }
  }

  const handleSelectMember = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, memberId])
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId))
      setSelectAll(false)
    }
  }

  const checkIsAdmin = () => {
    return session?.user?.email === 'admin@example.com' || session?.user?.role === 'admin'
  }

  const handleBatchDownload = () => {
    if (!checkIsAdmin()) {
      toast.error('只有管理員可以使用批次下載功能')
      return
    }

    const membersToDownload = selectedMembers.length > 0
      ? members.filter(member => selectedMembers.includes(member.id))
      : members

    const csvContent = [
      ['會員編號', '姓名', '電話', '會員類型', '狀態', '會員期限', '服務專員'],
      ...membersToDownload.map(member => [
        member.memberNo,
        member.name,
        member.phone,
        member.status,
        getStatusText(getMemberStatus(member)),
        member.membershipEndDate || '無期限',
        users.find(user => user.id === member.serviceStaff)?.name || '-'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `會員資料_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handlePersonalInfoChange = (field: string, value: string) => {
    if (!sidebarMember) return

    // 不允許修改的欄位
    const restrictedFields = ['lineId', 'birthday', 'address']
    if (restrictedFields.includes(field)) return

    // 更新會員資料
    const updatedMember = {
      ...sidebarMember,
      [field]: value
    }
    setSidebarMember(updatedMember)

    // 更新 members 陣列
    const updatedMembers = members.map(m => 
      m.id === sidebarMember.id ? updatedMember : m
    )
    setMembers(updatedMembers)
    localStorage.setItem('members', JSON.stringify(updatedMembers))

    // 如果有對應的使用者資料，同步更新
    if (sidebarMember.email) {
      const updatedUsers = users.map(user => 
        user.email === sidebarMember.email 
          ? { ...user, [field]: value }
          : user
      )
      setUsers(updatedUsers)
      localStorage.setItem('users', JSON.stringify(updatedUsers))
    }
  }

  // 取得狀態標籤顏色
  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case '進行中':
        return { bg: '#DEF7EC', text: '#046C4E' }
      case '已完成':
        return { bg: '#E1EFFE', text: '#1E429F' }
      case '已終止':
        return { bg: '#FDE8E8', text: '#9B1C1C' }
      case '待審核':
        return { bg: '#FEF3C7', text: '#92400E' }
      default:
        return { bg: '#F3F4F6', text: '#374151' }
    }
  }

  // 處理身分證檔案上傳
  const handleIdCardUpload = (file: File | null, type: 'front' | 'back') => {
    if (!file || !sidebarMember) return

    const updatedMember = {
      ...sidebarMember,
      [type === 'front' ? 'idCardFront' : 'idCardBack']: URL.createObjectURL(file)
    }

    setSidebarMember(updatedMember)
    const updatedMembers = members.map(m => 
      m.id === sidebarMember.id ? updatedMember : m
    )
    setMembers(updatedMembers)
    localStorage.setItem('members', JSON.stringify(updatedMembers))
  }

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Box>
      <Toaster position="top-right" />
      <TopNavbar 
        onAvatarClick={() => setIsSettingsSidebarOpen(true)}
        pageTitle="會員管理"
      />
      <RightSidebar 
        open={isSettingsSidebarOpen} 
        onClose={() => setIsSettingsSidebarOpen(false)} 
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#F7F9FC',
          minHeight: '100vh',
          pt: '64px'
        }}
      >
        <Box sx={{ py: 3 }}>
          <Container maxWidth="lg">
            {/* 頁面標題 */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3 
            }}>
              <Box>
                <Typography variant="h5" sx={{ color: 'grey.900', fontWeight: 600 }}>
                  會員管理
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600', mt: 0.5 }}>
                  管理所有會員資料、狀態和使用記錄
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* 搜尋區 */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="搜尋會員編號、姓名、電話、身分證字號..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                        搜尋
                      </Typography>
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleBatchDownload}
                  disabled={!checkIsAdmin()}
                  sx={{ 
                    height: 40,
                    minWidth: 120,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {selectedMembers.length > 0 ? `下載已選 (${selectedMembers.length})` : '下載全部'}
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="csv-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        try {
                          const csvData = event.target?.result as string
                          const rows = csvData.split('\n').map(row => row.split(','))
                          const headers = rows[0]
                          
                          // 驗證CSV格式
                          if (!headers.includes('會員編號') || !headers.includes('姓名') || !headers.includes('電話')) {
                            toast.error('CSV格式不正確，請確保包含必要欄位')
                            return
                          }

                          const newMembers = rows.slice(1).map(row => {
                            const memberData: Partial<Member> = {
                              id: generateId(),
                              memberNo: row[headers.indexOf('會員編號')],
                              name: row[headers.indexOf('姓名')],
                              phone: row[headers.indexOf('電話')],
                              status: row[headers.indexOf('會員類型')] as Member['status'],
                              createdAt: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
                              updatedAt: new Date().toISOString().split('T')[0].replace(/-/g, '/')
                            }
                            return memberData as Member
                          })

                          setMembers(prevMembers => [...prevMembers, ...newMembers])
                          toast.success(`成功匯入 ${newMembers.length} 筆會員資料`)
                        } catch (error) {
                          console.error('匯入失敗:', error)
                          toast.error('匯入失敗，請確認檔案格式是否正確')
                        }
                      }
                      reader.readAsText(file)
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor="csv-upload"
                  sx={{ 
                    height: 40,
                    minWidth: 120,
                    whiteSpace: 'nowrap'
                  }}
                >
                  批次上傳
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => {
                    setSidebarMember({
                      id: '',
                      memberNo: '',
                      name: '',
                      phone: '',
                      email: '',
                      status: '一般會員',
                      createdAt: '',
                      updatedAt: '',
                      serviceStaff: ''
                    })
                    setIsEditing(true)
                    setIsMemberSidebarOpen(true)
                  }}
                  sx={{ 
                    height: 40,
                    minWidth: 120,
                    whiteSpace: 'nowrap'
                  }}
                >
                  新增會員
                </Button>
              </Box>
            </Box>

            {/* 會員列表 */}
            <Card sx={{ 
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#F9FAFB' }}>
                    <tr>
                      <th style={{ width: '4%', padding: '12px 16px', textAlign: 'center' }}>
                        <Checkbox
                          checked={selectAll}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          size="small"
                        />
                      </th>
                      <th style={{ width: '12%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        會員編號
                      </th>
                      <th style={{ width: '12%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        姓名
                      </th>
                      <th style={{ width: '12%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        電話
                      </th>
                      <th style={{ width: '12%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        會員類型
                      </th>
                      <th style={{ width: '12%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        狀態
                      </th>
                      <th style={{ width: '20%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        會員期限
                      </th>
                      <th style={{ width: '12%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        服務專員
                      </th>
                      <th style={{ width: '8%', padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.id} style={{ borderTop: '1px solid #E5E7EB', transition: 'background-color 0.15s' }}>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <Checkbox
                            checked={selectedMembers.includes(member.id)}
                            onChange={(e) => handleSelectMember(member.id, e.target.checked)}
                            size="small"
                          />
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                          {member.memberNo}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                          {member.name}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                          {member.phone}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: member.status === 'VIP會員' ? '#FEF3C7' :
                              member.status === '天使會員' ? '#F3E8FF' :
                              member.status === '黑名單' ? '#FEE2E2' :
                              '#DBEAFE',
                            color: member.status === 'VIP會員' ? '#92400E' :
                              member.status === '天使會員' ? '#6B21A8' :
                              member.status === '黑名單' ? '#991B1B' :
                              '#1E40AF'
                          }}>
                            {member.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {(() => {
                            const status = getMemberStatus(member)
                            const colors = {
                              enabled: { bg: '#DEF7EC', dot: '#31C48D', text: '#046C4E' },
                              review: { bg: '#FEF3C7', dot: '#F59E0B', text: '#92400E' },
                              active: { bg: '#DBEAFE', dot: '#3B82F6', text: '#1E40AF' },
                              disabled: { bg: '#FEE2E2', dot: '#F87171', text: '#991B1B' }
                            }
                            const color = colors[status]
                            return (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                fontSize: '12px',
                                fontWeight: 500,
                                backgroundColor: color.bg,
                                color: color.text
                              }}>
                                <span style={{
                                  width: '8px',
                                  height: '8px',
                                  marginRight: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: color.dot
                                }}></span>
                                {getStatusText(status)}
                              </span>
                            )
                          })()}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {member.membershipEndDate ? (
                              <>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  color: !member.remainingDays ? '#7F1D1D' :
                                    member.remainingDays <= 15 ? '#DC2626' :
                                    member.remainingDays <= 30 ? '#EA580C' :
                                    '#4B5563'
                                }}>
                                  {getRemainingDaysDisplay(member.remainingDays, true)}
                                </div>
                                {getRemainingDaysMessage(member.remainingDays, true) && (
                                  <div style={{
                                    fontSize: '12px',
                                    marginTop: '2px',
                                    color: !member.remainingDays ? '#7F1D1D' :
                                      member.remainingDays <= 15 ? '#DC2626' :
                                      member.remainingDays <= 30 ? '#EA580C' :
                                      '#4B5563'
                                  }}>
                                    {getRemainingDaysMessage(member.remainingDays, true)}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div style={{ fontSize: '14px', color: '#6B7280' }}>無期限</div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#F3F4F6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              color: '#4B5563'
                            }}>
                              {availableStaff.find(user => user.id === member.serviceStaff)?.name?.[0] || '-'}
                            </div>
                            <div style={{ marginLeft: '12px', fontSize: '14px', color: '#111827' }}>
                              {availableStaff.find(user => user.id === member.serviceStaff)?.name || '-'}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleViewMember(member)}
                            style={{
                              border: 'none',
                              background: 'none',
                              padding: 0,
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#2563EB',
                              cursor: 'pointer'
                            }}
                          >
                            編輯
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!members || members.length === 0) && (
                  <Box sx={{ 
                    p: 8, 
                    textAlign: 'center',
                    color: 'text.secondary'
                  }}>
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      尚無會員資料
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      點擊上方的「新增會員」按鈕來建立第一筆會員資料
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Container>
        </Box>
      </Box>

      {/* 會員資料側邊欄 */}
      <Drawer
        anchor="right"
        open={isMemberSidebarOpen}
        onClose={() => {
          setIsMemberSidebarOpen(false)
          setSidebarMember(null)
          setIsEditing(false)
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          {/* 側邊欄內容 */}
          <Box sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: '1px solid',
              borderColor: 'grey.200',
              p: 2
            }}>
              <Typography variant="h6">
                {sidebarMember?.id ? '會員詳情' : '新增會員'}
                </Typography>
              <IconButton onClick={() => {
                setIsMemberSidebarOpen(false)
                setSidebarMember(null)
                setIsEditing(false)
              }}>
                  <Close />
                </IconButton>
            </Box>
            
            {/* 會員表單內容 */}
            {sidebarMember && (
              <form onSubmit={(e) => { 
                e.preventDefault()
                if (!sidebarMember.id) {
                  handleCreateMember()
                } else {
                  handleSaveMember()
                }
              }}>
                <Box sx={{ height: 'calc(100% - 120px)', overflow: 'auto', pb: 2 }}>
                  {/* 會員資格 */}
                  <Typography variant="h6" sx={{ mb: 2, color: 'grey.800', fontWeight: 'medium' }}>
                    會員資格
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="會員狀態"
                        value={sidebarMember.status}
                        onChange={(e) => setSidebarMember({...sidebarMember, status: e.target.value as Member['status']})}
                        required
                        SelectProps={{
                          native: true,
                        }}
                        size="small"
                      >
                        <option value="一般會員">一般會員</option>
                        <option value="VIP會員">VIP會員</option>
                        <option value="天使會員">天使會員</option>
                        <option value="股東">股東</option>
                        <option value="合作">合作</option>
                        <option value="黑名單">黑名單</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="加入條件"
                        value={sidebarMember.joinCondition || ''}
                        onChange={(e) => {
                          const value = e.target.value as Member['joinCondition']
                          if (value !== '舊會員') {
                            setSidebarMember({
                              ...sidebarMember,
                              joinCondition: value,
                              memberNo: generateMemberNo()
                            })
                          } else {
                            setSidebarMember({
                              ...sidebarMember,
                              joinCondition: value,
                              memberNo: ''
                            })
                          }
                        }}
                        SelectProps={{
                          native: true,
                        }}
                        size="small"
                      >
                        <option value=""></option>
                        <option value="舊會員">舊會員</option>
                        <option value="會員體驗">會員體驗</option>
                        <option value="200萬財力審查">200萬財力審查</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="會員期限開始"
                        type="date"
                        value={sidebarMember.membershipStartDate?.replace(/\//g, '-') || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, membershipStartDate: e.target.value.replace(/-/g, '/')})}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="會員期限結束"
                        type="date"
                        value={sidebarMember.membershipEndDate?.replace(/\//g, '-') || ''}
                        onChange={(e) => handleMembershipEndDateChange(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="剩餘天數"
                        value={sidebarMember.remainingDays !== undefined ? `${sidebarMember.remainingDays} 天` : '無期限'}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="服務專員"
                        name="serviceStaff"
                        value={sidebarMember?.serviceStaff || ''}
                        onChange={(e) => {
                          if (sidebarMember) {
                            const updatedMember = {
                              ...sidebarMember,
                              serviceStaff: e.target.value
                            }
                            setSidebarMember(updatedMember)
                            
                            // 更新 members 陣列
                            const updatedMembers = members.map(m => 
                              m.id === sidebarMember.id ? updatedMember : m
                            )
                            setMembers(updatedMembers)
                            localStorage.setItem('members', JSON.stringify(updatedMembers))
                          }
                        }}
                        SelectProps={{
                          native: true,
                        }}
                        size="small"
                      >
                        <option value="">請選擇服務專員</option>
                        {availableStaff.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name}
                          </option>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="推薦人"
                        value={sidebarMember.referrer || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, referrer: e.target.value})}
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  {/* 基本資料 */}
                  <Typography variant="h6" sx={{ mb: 2, mt: 4, color: 'grey.800', fontWeight: 'medium' }}>
                    基本資料
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="會員編號"
                        value={sidebarMember.memberNo}
                        onChange={(e) => setSidebarMember({...sidebarMember, memberNo: e.target.value})}
                        disabled={sidebarMember.joinCondition !== '舊會員'}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="姓名"
                        value={sidebarMember.name}
                        onChange={(e) => setSidebarMember({...sidebarMember, name: e.target.value})}
                        required
                        error={!sidebarMember.name}
                        helperText={!sidebarMember.name ? '請輸入姓名' : ''}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="暱稱"
                        value={sidebarMember.nickname || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, nickname: e.target.value})}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="身分證字號"
                        value={sidebarMember.idNumber || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, idNumber: e.target.value})}
                        required
                        error={!sidebarMember.idNumber}
                        helperText={!sidebarMember.idNumber ? '請輸入身分證字號' : ''}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="電話"
                        value={sidebarMember.phone}
                        onChange={(e) => setSidebarMember({...sidebarMember, phone: e.target.value})}
                        required
                        error={!sidebarMember.phone}
                        helperText={!sidebarMember.phone ? '請輸入電話' : ''}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="電子郵件"
                        type="email"
                        value={sidebarMember.email}
                        onChange={(e) => setSidebarMember({...sidebarMember, email: e.target.value})}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="LINE ID"
                        value={sidebarMember.lineId || ''}
                        onChange={(e) => handlePersonalInfoChange('lineId', e.target.value)}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="生日"
                        type="date"
                        value={sidebarMember.birthday || ''}
                        onChange={(e) => handlePersonalInfoChange('birthday', e.target.value)}
                        disabled
                        size="small"
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="地址"
                        value={sidebarMember.address || ''}
                        onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                        disabled
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  {/* 個人資料 */}
                  <Typography variant="h6" sx={{ mb: 2, mt: 4, color: 'grey.800', fontWeight: 'medium' }}>
                    個人資料
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="暱稱"
                        value={sidebarMember.nickname || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, nickname: e.target.value})}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="性別"
                        value={sidebarMember.gender || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, gender: e.target.value as '男' | '女'})}
                        SelectProps={{
                          native: true,
                        }}
                        size="small"
                      >
                        <option value=""></option>
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="飲食習慣"
                        placeholder="例：素食、不吃海鮮"
                        value={sidebarMember.dietaryHabits || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, dietaryHabits: e.target.value})}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="學歷"
                        value={sidebarMember.education || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, education: e.target.value as Member['education']})}
                        SelectProps={{
                          native: true,
                        }}
                        size="small"
                      >
                        <option value=""></option>
                        <option value="高中以下">高中以下</option>
                        <option value="高中職">高中職</option>
                        <option value="專科">專科</option>
                        <option value="大學">大學</option>
                        <option value="碩士">碩士</option>
                        <option value="博士">博士</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="國籍"
                        value={sidebarMember.nationality || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, nationality: e.target.value})}
                        SelectProps={{
                          native: true,
                        }}
                        size="small"
                      >
                        <option value=""></option>
                        <option value="台灣">台灣</option>
                        <option value="中國">中國</option>
                        <option value="香港">香港</option>
                        <option value="日本">日本</option>
                        <option value="韓國">韓國</option>
                        <option value="新加坡">新加坡</option>
                        <option value="馬來西亞">馬來西亞</option>
                        <option value="美國">美國</option>
                        <option value="加拿大">加拿大</option>
                        <option value="其他">其他</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={sidebarMember.isUSCitizen || false}
                              onChange={(e) => setSidebarMember({...sidebarMember, isUSCitizen: e.target.checked})}
                            />
                          }
                          label="是否為美國公民"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="護照英文姓名"
                        value={sidebarMember.passportName || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, passportName: e.target.value})}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="護照號碼"
                        value={sidebarMember.passportNo || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, passportNo: e.target.value})}
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  {/* 身分證上傳 */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        身分證正面
                      </Typography>
                      {sidebarMember.idCardFront ? (
                        <Box sx={{ position: 'relative', mb: 1 }}>
                          <Box
                            component="img"
                            src={sidebarMember.idCardFront}
                            alt="身分證正面"
                            sx={{
                              width: '100%',
                              height: '140px',
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.300'
                            }}
                          />
                          {/* 浮水印 */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(255, 255, 255, 0.5)',
                              pointerEvents: 'none',
                              transform: 'rotate(-30deg)',
                              userSelect: 'none'
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                color: 'rgba(0, 0, 0, 0.3)',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              MBC會員審查專用
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const updatedMember = {
                                ...sidebarMember,
                                idCardFront: ''
                              }
                              setSidebarMember(updatedMember)
                              const updatedMembers = members.map(m => 
                                m.id === sidebarMember.id ? updatedMember : m
                              )
                              setMembers(updatedMembers)
                              localStorage.setItem('members', JSON.stringify(updatedMembers))
                            }}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.9)'
                              }
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            height: '140px',
                            border: '2px dashed',
                            borderColor: 'grey.300',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1
                          }}
                        >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                              if (file) handleIdCardUpload(file, 'front')
                        }}
                        style={{ display: 'none' }}
                        id="idCardFront"
                      />
                          <label htmlFor="idCardFront" style={{ width: '100%', height: '100%' }}>
                            <Box
                              sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Upload sx={{ color: 'grey.400', mb: 1 }} />
                              <Typography variant="caption" color="text.secondary">
                                點擊上傳正面照片
                        </Typography>
                            </Box>
                          </label>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        身分證背面
                      </Typography>
                      {sidebarMember.idCardBack ? (
                        <Box sx={{ position: 'relative', mb: 1 }}>
                          <Box
                            component="img"
                            src={sidebarMember.idCardBack}
                            alt="身分證背面"
                            sx={{
                              width: '100%',
                              height: '140px',
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.300'
                            }}
                          />
                          {/* 浮水印 */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(255, 255, 255, 0.5)',
                              pointerEvents: 'none',
                              transform: 'rotate(-30deg)',
                              userSelect: 'none'
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                color: 'rgba(0, 0, 0, 0.3)',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              MBC會員審查專用
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const updatedMember = {
                                ...sidebarMember,
                                idCardBack: ''
                              }
                              setSidebarMember(updatedMember)
                              const updatedMembers = members.map(m => 
                                m.id === sidebarMember.id ? updatedMember : m
                              )
                              setMembers(updatedMembers)
                              localStorage.setItem('members', JSON.stringify(updatedMembers))
                            }}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.9)'
                              }
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            height: '140px',
                            border: '2px dashed',
                            borderColor: 'grey.300',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1
                          }}
                        >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                              if (file) handleIdCardUpload(file, 'back')
                        }}
                        style={{ display: 'none' }}
                        id="idCardBack"
                      />
                          <label htmlFor="idCardBack" style={{ width: '100%', height: '100%' }}>
                            <Box
                              sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Upload sx={{ color: 'grey.400', mb: 1 }} />
                              <Typography variant="caption" color="text.secondary">
                                點擊上傳背面照片
                        </Typography>
                            </Box>
                          </label>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* 其他資料 */}
                  <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'grey.800', fontWeight: 'medium' }}>
                      其他資料
                  </Typography>

                    {/* 備註欄位 */}
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="備註"
                        multiline
                        rows={4}
                        value={sidebarMember.notes || ''}
                        onChange={(e) => setSidebarMember({...sidebarMember, notes: e.target.value})}
                        sx={{ mb: 2, width: '100%' }}
                      />
                    </Box>

                    {/* 附件上傳區域 */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        附件
                      </Typography>
                      <input
                        type="file"
                        id="member-files"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                      <label htmlFor="member-files">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<Upload />}
                          sx={{ mb: 2 }}
                        >
                          上傳附件
                        </Button>
                      </label>
                      {sidebarMember.attachments?.map((file, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <StyledLink
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Description sx={{ fontSize: 16, mr: 0.5 }} />
                            {file.name}
                          </StyledLink>
                              <IconButton
                                size="small"
                            onClick={() => handleRemoveFile(index)}
                              >
                            <Close fontSize="small" />
                              </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* 合約記錄 */}
                  <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'grey.800', fontWeight: 'medium' }}>
                      合約記錄
                  </Typography>
                    {memberContracts.length > 0 ? (
                      memberContracts.map((contract, index) => (
                        <Box 
                          key={index} 
                          onClick={() => router.push(`/contracts?id=${contract.id}`)}
                          sx={{ 
                            mb: 2,
                            p: 1.5,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'grey.100',
                              borderColor: 'grey.300'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                              {contract.contractNo}
                  </Typography>
                            <Chip
                              label={contract.status}
                        size="small"
                              sx={{ 
                                height: '20px',
                                fontSize: '0.75rem',
                                bgcolor: getStatusColor(contract.status).bg,
                                color: getStatusColor(contract.status).text
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {contract.projectName}
                  </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                              {contract.amount.toLocaleString('zh-TW', { 
                                style: 'currency', 
                                currency: 'TWD',
                                maximumFractionDigits: 0
                              })}
                    </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(contract.signDate).toLocaleDateString('zh-TW')}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ 
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        border: '1px dashed',
                        borderColor: 'grey.300'
                      }}>
                        <Typography variant="body2" color="text.secondary">
                          尚無合約記錄
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* 編輯記錄 */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      編輯記錄
                      {sidebarMemberLogs.length > 10 && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          (顯示最新10筆)
                        </Typography>
                      )}
                    </Typography>
                    {sidebarMemberLogs
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 10)
                      .map((log, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            mb: 1.5,
                            p: 1.5,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: 'grey.600' }}>
                              {new Date(log.timestamp).toLocaleString('zh-TW', {
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                              {log.operator}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'primary.main' }}>
                              {log.action}
                            </Typography>
                          </Box>
                          {log.changes?.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {log.changes.map((change, idx) => (
                                <Box key={idx} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: 'grey.600' }}>
                                    {change.field}:
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'error.main', textDecoration: 'line-through' }}>
                                    {change.oldValue || '(空白)'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'grey.600' }}>→</Typography>
                                  <Typography variant="caption" sx={{ color: 'success.main' }}>
                                    {change.newValue || '(空白)'}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </Box>
                      ))}
                  </Box>
                </Box>

                {/* 底部固定區域 */}
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  borderTop: '1px solid',
                  borderColor: 'grey.200',
                  bgcolor: 'background.paper',
                  p: 2
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {checkIsAdmin() && (
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => {
                          if (window.confirm('確定要刪除此會員嗎？此操作無法復原。')) {
                            const updatedMembers = members.filter(m => m.id !== sidebarMember?.id)
                            setMembers(updatedMembers)
                            localStorage.setItem('members', JSON.stringify(updatedMembers))
                            setIsMemberSidebarOpen(false)
                            setSidebarMember(null)
                            toast.success('會員已刪除')
                          }
                        }}
                        sx={{ 
                          fontSize: '0.75rem',
                          opacity: 0.75,
                          '&:hover': {
                            opacity: 1
                          }
                        }}
                      >
                        刪除會員
                      </Button>
                    )}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsMemberSidebarOpen(false)}
                      >
                        取消
                      </Button>
                      <Button
                        variant="contained"
                        type="submit"
                      >
                        儲存
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </form>
            )}
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
} 