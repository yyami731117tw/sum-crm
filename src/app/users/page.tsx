'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TopNavbar from '@/components/TopNavbar'
import RightSidebar from '@/components/RightSidebar'
import { 
  Box,
  Container,
  Typography,
  CircularProgress,
  Card,
  Alert,
  TextField,
  Button,
  InputAdornment,
  Drawer,
  IconButton,
  Grid,
} from '@mui/material'
import { Search, Add, Close } from '@mui/icons-material'
import { toast, Toaster } from 'react-hot-toast'
import bcrypt from 'bcryptjs'

interface UserLog {
  id: string
  userId: string
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

interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  timestamp: string
  isRead: boolean
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
  password?: string
  hashedPassword?: string
  notifications?: Notification[]
}

interface NotificationCenter {
  isOpen: boolean
  unreadCount: number
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSettingsSidebarOpen, setIsSettingsSidebarOpen] = useState(false)
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false)
  const [sidebarUser, setSidebarUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [userLogs, setUserLogs] = useState<UserLog[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationCenter, setNotificationCenter] = useState<NotificationCenter>({
    isOpen: false,
    unreadCount: 0
  })
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(800)
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false)

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
    setSidebarWidth(window.innerWidth / 2)
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    // 修改權限判斷邏輯
    const isAdmin = session?.user?.email === 'admin@example.com' || session?.user?.role === 'admin'
    if (!isAdmin) {
      router.push('/')
      toast.error('只有管理員可以訪問使用者管理頁面')
      return
    }
  }, [status, session, router])

  // 新增檢查是否為管理員的函數
  const checkIsAdmin = () => {
    return session?.user?.email === 'admin@example.com' || session?.user?.role === 'admin'
  }

  // 修改初始化使用者資料的邏輯
  useEffect(() => {
    const savedUsers = localStorage.getItem('users')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      const mockUsers: User[] = [
        {
          id: '1',
          name: '系統管理員',
          email: 'admin@example.com',
          phone: '0900-000-000',
          role: 'admin',
          status: 'active',
          joinDate: '2024/01/01',
          lastLogin: '2025/2/4 上午 1:07:54',
          lineId: 'admin_123',
          address: '台北市信義區信義路五段7號',
          birthday: '1990/01/01'
        },
        {
          id: '2',
          name: '王大明',
          email: 'wang@example.com',
          phone: '0912-345-678',
          role: 'customer_service',
          status: 'active',
          joinDate: '2023/01/01',
          lastLogin: '2024/01/10',
          lineId: 'wang_123',
          address: '台北市大安區敦化南路二段100號',
          birthday: '1992/05/15'
        }
      ]
      setUsers(mockUsers)
      localStorage.setItem('users', JSON.stringify(mockUsers))
    }
  }, [])

    // 載入使用者記錄
  useEffect(() => {
    const savedLogs = localStorage.getItem('userLogs')
    if (savedLogs) {
      setUserLogs(JSON.parse(savedLogs))
    }
  }, [])

  // 載入通知
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
  }, [])

  // 計算未讀通知數量
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.isRead).length
    setNotificationCenter(prev => ({ ...prev, unreadCount }))
  }, [notifications])

  // 標記通知為已讀
  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    )
    setNotifications(updatedNotifications)
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
  }

  // 標記所有通知為已讀
  const markAllNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true
    }))
    setNotifications(updatedNotifications)
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
  }

  // 刪除通知
  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    )
    setNotifications(updatedNotifications)
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
  }

  // 清空所有通知
  const clearAllNotifications = () => {
    setNotifications([])
    localStorage.setItem('notifications', '[]')
  }

  // 取得通知圖標
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle sx={{ color: 'success.main' }} />
      case 'error':
        return <Error sx={{ color: 'error.main' }} />
      case 'warning':
        return <Warning sx={{ color: 'warning.main' }} />
      case 'info':
      default:
        return <Info sx={{ color: 'info.main' }} />
    }
  }

  // 加密密碼
  const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
  }

  // 修改通知相關函數
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      id: `notification_${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification
    }

    const updatedNotifications = [newNotification, ...notifications]
    setNotifications(updatedNotifications)
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications))

    // 更新未讀數量
    setNotificationCenter(prev => ({
      ...prev,
      unreadCount: prev.unreadCount + 1
    }))
  }

  const getRoleText = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return '管理員'
      case 'customer_service':
        return '客服'
      case 'guest':
        return '訪客'
      default:
        return '未知'
    }
  }

  const getStatusText = (status: User['status']) => {
    switch (status) {
      case 'active':
        return '啟用'
      case 'inactive':
        return '停用'
      case 'pending':
        return '待審核'
      default:
        return '未知'
    }
  }

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return { bg: '#DEF7EC', dot: '#31C48D', text: '#046C4E' }
      case 'inactive':
        return { bg: '#FEE2E2', dot: '#F87171', text: '#991B1B' }
      case 'pending':
        return { bg: '#FEF3C7', dot: '#F59E0B', text: '#92400E' }
      default:
        return { bg: '#F3F4F6', dot: '#9CA3AF', text: '#374151' }
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  )

  // 新增使用者
  const handleCreateUser = () => {
    if (!checkIsAdmin()) {
      toast.error('只有管理員可以新增使用者')
      return
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: '',
      email: '',
      phone: '',
      role: 'guest',
      status: 'pending',
      joinDate: new Date().toLocaleDateString('zh-TW'),
      lastLogin: '-'
    }
    setSidebarUser(newUser)
    setIsUserSidebarOpen(true)
    setIsEditing(true)
  }

  // 修改個人資料同步功能
  const handlePersonalInfoChange = (field: string, value: string) => {
    if (!sidebarUser) return

    // 更新使用者資料
    const updatedUser = {
      ...sidebarUser,
      [field]: value,
      lastLogin: new Date().toLocaleString('zh-TW')
    }

    // 同步更新 users 列表和 localStorage
    const updatedUsers = users.map(user => 
      user.id === sidebarUser.id ? updatedUser : user
    )

    // 更新所有相關狀態
    setSidebarUser(updatedUser)
    setUsers(updatedUsers)
    localStorage.setItem('users', JSON.stringify(updatedUsers))

    // 建立使用記錄
    const newLog: UserLog = {
      id: `log_${Date.now()}`,
      userId: sidebarUser.id,
      action: '更新使用者資料',
      timestamp: new Date().toLocaleString('zh-TW'),
      details: `更新使用者 ${sidebarUser.name} 的 ${field}`,
      operator: session?.user?.name || '系統管理員',
      changes: [{
        field,
        oldValue: String(sidebarUser[field as keyof User] || ''),
        newValue: value
      }]
    }

    const updatedLogs = [...userLogs, newLog]
    setUserLogs(updatedLogs)
    localStorage.setItem('userLogs', JSON.stringify(updatedLogs))
  }

  // 修改儲存使用者資料的函數
  const handleSaveUser = () => {
    if (!sidebarUser) return

    const timestamp = new Date().toLocaleString('zh-TW')
    const isNewUser = !users.find(u => u.id === sidebarUser.id)

    // 更新使用者資料
    const updatedUser = {
      ...sidebarUser,
      lastLogin: timestamp
    }

    // 如果有修改密碼
    if (passwordForm.newPassword && passwordForm.newPassword === passwordForm.confirmPassword) {
      const salt = bcrypt.genSaltSync(10)
      updatedUser.hashedPassword = bcrypt.hashSync(passwordForm.newPassword, salt)
    }

    // 同步更新 users 列表和 localStorage
    const updatedUsers = isNewUser 
      ? [...users, updatedUser]
      : users.map(user => user.id === sidebarUser.id ? updatedUser : user)

    // 更新所有相關狀態
    setSidebarUser(updatedUser)
    setUsers(updatedUsers)
    localStorage.setItem('users', JSON.stringify(updatedUsers))

    // 建立使用記錄
    const newLog: UserLog = {
      id: `log_${Date.now()}`,
      userId: sidebarUser.id,
      action: isNewUser ? '新增使用者' : '更新使用者資料',
      timestamp,
      details: `${isNewUser ? '新增' : '更新'}使用者：${sidebarUser.name}`,
      operator: session?.user?.name || '系統管理員'
    }

    const updatedLogs = [...userLogs, newLog]
    setUserLogs(updatedLogs)
    localStorage.setItem('userLogs', JSON.stringify(updatedLogs))

    // 發送通知
    if (isNewUser) {
      if (sidebarUser.status === 'pending') {
        // 發送給使用者的通知
        addNotification({
          userId: sidebarUser.id,
          title: '帳號審核中',
          message: '您的帳號已建立，正在等待管理員審核，審核通過後會再通知您。',
          type: 'info'
        })
        // 發送給管理員的通知
        const admins = users.filter(u => u.role === 'admin')
        admins.forEach(admin => {
          addNotification({
            userId: admin.id,
            title: '新使用者待審核',
            message: `新使用者 ${sidebarUser.name} 已註冊，請進行審核。`,
            type: 'warning'
          })
        })
      } else {
        addNotification({
          userId: sidebarUser.id,
          title: '帳號已建立',
          message: '您的帳號已建立成功，現在可以登入系統了。',
          type: 'success'
        })
      }
    } else {
      // 密碼變更通知
      if (passwordForm.newPassword) {
        addNotification({
          userId: sidebarUser.id,
          title: '密碼已更新',
          message: '您的密碼已成功更新，下次登入請使用新密碼。',
          type: 'info'
        })
      }

      // 角色變更通知
      const oldUser = users.find(u => u.id === sidebarUser.id)
      if (oldUser && oldUser.role !== sidebarUser.role) {
        addNotification({
          userId: sidebarUser.id,
          title: '角色已更新',
          message: `您的角色已從「${getRoleText(oldUser.role)}」變更為「${getRoleText(sidebarUser.role)}」。`,
          type: 'info'
        })
      }

      // 狀態變更通知
      if (oldUser && oldUser.status !== sidebarUser.status) {
        if (sidebarUser.status === 'active') {
          addNotification({
            userId: sidebarUser.id,
            title: '帳號已啟用',
            message: '您的帳號已通過審核並啟用，現在可以登入系統了。',
            type: 'success'
          })
        } else if (sidebarUser.status === 'inactive') {
          addNotification({
            userId: sidebarUser.id,
            title: '帳號已停用',
            message: '您的帳號已被停用，如有疑問請聯繫管理員。',
            type: 'error'
          })
        }
      }
    }

    // 重置表單狀態
    setPasswordForm({ newPassword: '', confirmPassword: '' })
    setIsEditing(false)
    toast.success(isNewUser ? '使用者已新增' : '使用者資料已更新')
    setIsUserSidebarOpen(false)
  }

  const generateId = () => {
    return 'id_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // 修改密碼驗證函數
  const verifyPassword = async (password: string, hashedPassword: string) => {
    return bcrypt.compare(password, hashedPassword)
  }

  const handleAvatarClick = () => {
    setIsRightSidebarOpen(true)
  }

  // 初始化通知
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        userId: 'system',
        title: '系統更新通知',
        message: '系統已完成更新，新增了使用者管理功能',
        type: 'info',
        timestamp: new Date().toISOString(),
        isRead: false
      },
      {
        id: '2',
        userId: 'system',
        title: '安全提醒',
        message: '請定期更改您的密碼以確保帳號安全',
        type: 'warning',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isRead: false
      }
    ]
    setNotifications(mockNotifications)
  }, [])

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
        onAvatarClick={() => setIsRightSidebarOpen(true)}
        pageTitle="使用者管理"
        onNotificationClick={() => setNotificationDrawerOpen(true)}
        notificationCount={notifications.filter(n => !n.isRead).length}
      />
      <RightSidebar 
        open={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        hideViewProfile={true}
        hideUserManagement={true}
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
                  使用者管理
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600', mt: 0.5 }}>
                  管理所有使用者帳號、權限和使用記錄
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
                placeholder="搜尋姓名、電子郵件、電話..."
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
                variant="contained"
                  color="primary"
                startIcon={<Add />}
                onClick={handleCreateUser}
                  sx={{
                    height: 40,
                    minWidth: 120,
                    whiteSpace: 'nowrap'
                  }}
              >
                新增使用者
              </Button>
              </Box>
            </Box>

            {/* 使用者列表 */}
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
                      <th style={{ width: '15%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        姓名
                      </th>
                      <th style={{ width: '20%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        電子郵件
                      </th>
                      <th style={{ width: '15%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        電話
                      </th>
                      <th style={{ width: '10%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        角色
                      </th>
                      <th style={{ width: '10%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        狀態
                      </th>
                      <th style={{ width: '15%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        加入日期
                      </th>
                      <th style={{ width: '15%', padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        最後登入
                      </th>
                      <th style={{ width: '8%', padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase' }}>
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr 
                          key={user.id}
                          style={{ 
                            borderTop: '1px solid #E5E7EB',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F9FAFB'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = ''
                          }}
                        >
                          <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                            {user.name}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                            {user.email}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                            {user.phone}
                          </td>
                        <td style={{ padding: '16px' }}>
                            <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: user.role === 'admin' ? '#FEF3C7' :
                                user.role === 'customer_service' ? '#DBEAFE' :
                                '#F3F4F6',
                              color: user.role === 'admin' ? '#92400E' :
                                user.role === 'customer_service' ? '#1E40AF' :
                                '#374151'
                            }}>
                              {getRoleText(user.role)}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 500,
                              backgroundColor: user.status === 'active' ? '#DCFCE7' :
                                user.status === 'inactive' ? '#FEE2E2' :
                                '#FEF9C3',
                              color: user.status === 'active' ? '#166534' :
                                user.status === 'inactive' ? '#991B1B' :
                                '#854D0E'
                            }}>
                              {getStatusText(user.status)}
                            </span>
                        </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                            {user.joinDate}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#111827' }}>
                            {user.lastLogin}
                          </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (!checkIsAdmin()) {
                                  toast.error('只有管理員可以編輯使用者資料')
                                  return
                                }
                                setSidebarUser(user)
                                setIsUserSidebarOpen(true)
                                setIsEditing(false)
                              }}
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
                            檢視
                          </button>
                        </td>
                      </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8}>
                  <Box sx={{ 
                    p: 8, 
                    textAlign: 'center',
                    color: 'text.secondary'
                  }}>
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      尚無使用者資料
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      點擊上方的「新增使用者」按鈕來建立第一筆使用者資料
                    </Typography>
                  </Box>
                        </td>
                      </tr>
                )}
                  </tbody>
                </table>
              </Box>
            </Card>
          </Container>
        </Box>
        </Box>

      {/* 使用者詳情側邊欄 */}
        <Drawer
          anchor="right"
          open={isUserSidebarOpen}
          onClose={() => {
            setIsUserSidebarOpen(false)
            setIsEditing(false)
          setShowPasswordChange(false)
          }}
          sx={{
            '& .MuiDrawer-paper': {
            width: sidebarWidth,
              boxSizing: 'border-box',
            bgcolor: '#F8F9FA',
            borderLeft: '1px solid',
            borderColor: 'grey.200',
            },
          }}
        >
        <Box sx={{ height: '100%', overflow: 'auto' }}>
          {sidebarUser && (
          <Box sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4,
                position: 'sticky',
                top: 0, 
                bgcolor: '#F8F9FA',
                zIndex: 1,
              pb: 2,
              borderBottom: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="h5" component="h2">
                  使用者詳情
              </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {isEditing ? (
                    <>
                  <Button
                    variant="contained"
                    onClick={handleSaveUser}
                        sx={{ px: 4 }}
                  >
                    儲存
                  </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                      >
                        取消
                      </Button>
                    </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                      sx={{ px: 4 }}
                  >
                    修改資料
                  </Button>
                )}
                  <IconButton onClick={() => setIsUserSidebarOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </Box>

              {/* 使用者表單內容 */}
              <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }}>
                <Box sx={{ height: '100%', overflow: 'auto', pb: 8 }}>
                  {/* 基本資料 */}
                  <Typography variant="h6" sx={{ mb: 2, color: 'grey.800', fontWeight: 'medium' }}>
                    基本資料
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="姓名"
                      value={sidebarUser.name}
                      onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                      required
                      size="small"
                        disabled={!isEditing}
                    />
                  </Grid>
                    <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="電子郵件"
                      value={sidebarUser.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      required
                      size="small"
                        disabled={!isEditing}
                    />
                  </Grid>
                    <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="電話"
                      value={sidebarUser.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      required
                      size="small"
                        disabled={!isEditing}
                    />
                  </Grid>
                    <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="角色"
                      value={sidebarUser.role}
                      onChange={(e) => handlePersonalInfoChange('role', e.target.value as User['role'])}
                      required
                      SelectProps={{
                        native: true,
                      }}
                      size="small"
                        disabled={!isEditing}
                    >
                        <option value="admin">系統管理員</option>
                        <option value="customer_service">客服人員</option>
                      <option value="guest">訪客</option>
                    </TextField>
                  </Grid>
                    <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="狀態"
                      value={sidebarUser.status}
                      onChange={(e) => handlePersonalInfoChange('status', e.target.value as User['status'])}
                      required
                      SelectProps={{
                        native: true,
                      }}
                      size="small"
                        disabled={!isEditing}
                    >
                      <option value="active">啟用</option>
                      <option value="inactive">停用</option>
                      <option value="pending">待審核</option>
                    </TextField>
                  </Grid>
                  </Grid>

                  {/* 密碼修改區塊 */}
                  {isEditing && (
                    <>
                      <Typography variant="h6" sx={{ mb: 2, mt: 4, color: 'grey.800', fontWeight: 'medium' }}>
                        密碼設定
                      </Typography>
                      <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                            type="password"
                            label="新密碼"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                            type="password"
                            label="確認新密碼"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </>
                  )}

                  {/* 其他資料 */}
                  <Typography variant="h6" sx={{ mb: 2, mt: 4, color: 'grey.800', fontWeight: 'medium' }}>
                    其他資料
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Line ID"
                      value={sidebarUser.lineId || ''}
                      onChange={(e) => handlePersonalInfoChange('lineId', e.target.value)}
                      size="small"
                      disabled={!isEditing}
                    />
                  </Grid>
                    <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="生日"
                      type="date"
                      value={sidebarUser.birthday?.replace(/\//g, '-') || ''}
                      onChange={(e) => handlePersonalInfoChange('birthday', e.target.value.replace(/-/g, '/'))}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="地址"
                      value={sidebarUser.address || ''}
                      onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                      size="small"
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>

                  {/* 最後編輯紀錄 */}
                  <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      最後登入：{sidebarUser.lastLogin || '尚未登入'}
                    </Typography>
                  </Box>

                  {/* 使用紀錄 */}
                  <Typography variant="h6" sx={{ mb: 2, mt: 4, color: 'grey.800', fontWeight: 'medium' }}>
                    使用紀錄
                  </Typography>
                  <Box sx={{ 
                    border: '1px solid',
                    borderColor: 'grey.200',
                    borderRadius: 1,
                    bgcolor: 'white'
                  }}>
                    {userLogs.length > 0 ? (
                      userLogs.map((log) => (
                          <Box
                            key={log.id}
                            sx={{
                              p: 2,
                            '&:not(:last-child)': {
                              borderBottom: '1px solid',
                              borderColor: 'grey.200'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: 'grey.900' }}>
                              {log.action}
                            </Typography>
                              <Typography variant="body2" sx={{ color: 'grey.600', mt: 0.5 }}>
                                {log.details}
                            </Typography>
                            {log.changes && log.changes.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                  {log.changes.map((change, index) => (
                                    <Typography key={index} variant="body2" sx={{ color: 'grey.600' }}>
                                      {change.field}：{change.oldValue} → {change.newValue}
                                </Typography>
                                  ))}
                              </Box>
                            )}
                          </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <Typography variant="caption" sx={{ color: 'grey.500' }}>
                                {new Date(log.timestamp).toLocaleString()}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'grey.500', mt: 0.5 }}>
                                操作者：{log.operator}
                              </Typography>
                    </Box>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center', color: 'grey.500' }}>
                        <Typography variant="body2">
                          暫無使用紀錄
                        </Typography>
                  </Box>
            )}
          </Box>
                </Box>
              </form>
              </Box>
            )}
        </Box>
      </Drawer>

      {/* 通知側邊欄 */}
        <Drawer
          anchor="right"
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 400,
              boxSizing: 'border-box',
            },
          }}
        >
        <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              pb: 2,
              borderBottom: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="h6">通知中心</Typography>
            <IconButton onClick={() => setNotificationDrawerOpen(false)}>
                  <Close />
                </IconButton>
            </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifications.map((notification) => (
              <Card
                    key={notification.id}
                    sx={{
                      p: 2,
                  backgroundColor: notification.isRead ? 'white' : 'action.hover',
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">{notification.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {new Date(notification.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                  {!notification.isRead && (
                    <Box
                        sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main'
                      }}
                    />
                  )}
                    </Box>
              </Card>
            ))}
            {notifications.length === 0 && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
                color: 'text.secondary'
              }}>
                <Typography variant="body1">目前沒有通知</Typography>
                  </Box>
              )}
            </Box>
          </Box>
        </Drawer>
    </Box>
  )
} 