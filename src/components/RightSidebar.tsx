'use client'

import { Fragment, useEffect } from 'react'
import { useState } from 'react'
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Switch,
  Avatar,
  Button,
  Grid,
  TextField,
  Paper
} from '@mui/material'
import {
  Person,
  Settings,
  Notifications,
  Security,
  Palette,
  Help,
  ExitToApp,
  ChevronRight,
  ArrowBack,
  People
} from '@mui/icons-material'
import { signOut, useSession } from 'next-auth/react'
import { toast, Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface RightSidebarProps {
  open: boolean
  onClose: () => void
}

interface ProfileFormData {
  name: string
  email: string
  phone: string
  lineId: string
  address: string
  birthday: string
  nickname: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function RightSidebar({ open, onClose }: RightSidebarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
    lineId: session?.user?.lineId || '',
    address: session?.user?.address || '',
    birthday: session?.user?.birthday || '',
    nickname: session?.user?.nickname || ''
  })
  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [memberCount, setMemberCount] = useState(0)

  // 修改 useEffect 來同步所有資料
  useEffect(() => {
    const handleStorageChange = () => {
      if (session?.user?.email) {
        const savedUsers = localStorage.getItem('users')
        const users = savedUsers ? JSON.parse(savedUsers) : []
        const currentUser = users.find((user: any) => user.email === session.user?.email)
        
        if (currentUser) {
          const formattedBirthday = currentUser.birthday ? currentUser.birthday.split('T')[0] : ''
          
          setFormData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            lineId: currentUser.lineId || '',
            address: currentUser.address || '',
            birthday: formattedBirthday,
            nickname: currentUser.nickname || ''
          })
        }
      }
    }

    // 添加事件監聽器
    window.addEventListener('storage', handleStorageChange)
    
    // 初始載入資料
    handleStorageChange()

    // 清理事件監聽器
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [session?.user?.email])

  // 計算服務會員數量
  useEffect(() => {
    if (session?.user?.email) {
      const members = JSON.parse(localStorage.getItem('members') || '[]')
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      
      // 找到當前用戶的 ID
      const currentUser = users.find((user: { email: string; id: string }) => user.email === session.user.email)
      if (currentUser) {
        // 計算由該服務專員負責的會員數量
        const count = members.filter((member: { serviceStaff: string }) => member.serviceStaff === currentUser.id).length
        setMemberCount(count)
      }
    }
  }, [session])

  const checkIsAdmin = () => {
    return session?.user?.email === 'admin@example.com' || session?.user?.role === 'admin'
  }

  const handleUserManagementClick = () => {
    if (!checkIsAdmin()) {
      toast.error('只有管理員可以訪問使用者管理頁面')
      return
    }
    router.push('/users')
    onClose()
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const savedUsers = localStorage.getItem('users')
      const users = savedUsers ? JSON.parse(savedUsers) : []
      
      // 修正生日格式處理
      const formattedData = {
        ...formData,
        birthday: formData.birthday || null
      }
      
      const updatedUsers = users.map((user: any) => {
        if (user.email === session?.user?.email) {
          return {
            ...user,
            ...formattedData,
            lastModified: new Date().toISOString()
          }
        }
        return user
      })

      localStorage.setItem('users', JSON.stringify(updatedUsers))
      
      // 手動觸發資料更新
      handleStorageChange()
      
      toast.success('個人資料更新成功')
      setIsEditing(false)
    } catch (error) {
      toast.error('更新失敗，請稍後再試')
    }
  }

  const handleCancelEdit = () => {
    const savedUsers = localStorage.getItem('users')
    const users = savedUsers ? JSON.parse(savedUsers) : []
    const currentUser = users.find((user: any) => user.email === session?.user?.email)
    
    if (currentUser) {
      // 直接使用原始生日格式
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        lineId: currentUser.lineId || '',
        address: currentUser.address || '',
        birthday: currentUser.birthday || '',
        nickname: currentUser.nickname || ''
      })
    }
    setIsEditing(false)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('新密碼與確認密碼不符')
      return
    }
    try {
      // TODO: 實作更改密碼的 API 呼叫
      toast.success('密碼更新成功')
      setShowChangePassword(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast.error('密碼更新失敗，請稍後再試')
    }
  }

  const handleStorageChange = () => {
    if (session?.user?.email) {
      const savedUsers = localStorage.getItem('users')
      const users = savedUsers ? JSON.parse(savedUsers) : []
      const currentUser = users.find((user: any) => user.email === session.user?.email)
      
      if (currentUser) {
        // 直接使用原始生日格式
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          lineId: currentUser.lineId || '',
          address: currentUser.address || '',
          birthday: currentUser.birthday || '',
          nickname: currentUser.nickname || ''
        })
      }
    }
  }

  const menuItems = [
    {
      icon: <Person />,
      text: '個人資料',
      onClick: () => setShowProfile(true)
    },
    {
      icon: <Settings />,
      text: '帳號設定',
      onClick: () => setShowAccountSettings(true)
    },
    {
      icon: <Security />,
      text: '隱私與安全',
      onClick: () => {}
    },
    {
      icon: <Notifications />,
      text: '通知設定',
      onClick: () => {},
      switch: {
        checked: notifications,
        onChange: () => setNotifications(!notifications)
      }
    },
    {
      icon: <Palette />,
      text: '深色模式',
      onClick: () => {},
      switch: {
        checked: darkMode,
        onChange: () => setDarkMode(!darkMode)
      }
    },
    {
      icon: <Help />,
      text: '幫助與支援',
      onClick: () => {}
    }
  ]

  if (showChangePassword) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 600,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setShowChangePassword(false)} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6">更改密碼</Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
              <form onSubmit={handlePasswordSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="目前密碼"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="新密碼"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="確認新密碼"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <Button
                        variant="outlined"
                        onClick={() => setShowChangePassword(false)}
                      >
                        取消
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                      >
                        更新密碼
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Box>
        </Box>
      </Drawer>
    )
  }

  if (showAccountSettings) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 600,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setShowAccountSettings(false)} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6">帳號設定</Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Security />
                  </ListItemIcon>
                  <ListItemText 
                    primary="更改密碼"
                    secondary="定期更改密碼以確保帳號安全"
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setShowChangePassword(true)}
                  >
                    更改
                  </Button>
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText 
                    primary="電子郵件通知"
                    secondary="接收系統更新和重要通知"
                  />
                  <Switch
                    edge="end"
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemIcon>
                    <People />
                  </ListItemIcon>
                  <ListItemText 
                    primary="語言設定"
                    secondary="選擇您偏好的語言"
                  />
                  <Button
                    endIcon={<ChevronRight />}
                    sx={{ color: 'text.secondary' }}
                  >
                    繁體中文
                  </Button>
                </ListItem>
              </List>
            </Paper>
          </Box>
        </Box>
      </Drawer>
    )
  }

  if (showProfile) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 600,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setShowProfile(false)} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6">個人資料</Typography>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: 'grey.700' }}>
                      基本資料
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="姓名"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="電話"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="暱稱"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, color: 'grey.700' }}>
                      其他資料
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Line ID"
                      name="lineId"
                      value={formData.lineId}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="生日"
                      name="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={handleInputChange}
                      disabled={!isEditing}
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
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>
                </Grid>
                
                {isEditing ? (
                  <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                      onClick={handleCancelEdit}
                      fullWidth
                          >
                            取消
                          </Button>
                          <Button
                      type="submit"
                            variant="contained"
                      fullWidth
                          >
                            儲存
                          </Button>
                  </Box>
                ) : (
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(true)}
                      fullWidth
                    >
                      編輯資料
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                      姓名、Email、電話如需修改請聯繫管理員
                    </Typography>
                  </Box>
                )}
              </form>
            </Paper>
          </Box>
        </Box>
      </Drawer>
    )
  }

  return (
    <Fragment>
      <Toaster position="top-right" />
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* 個人資料區域 */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            pb: 3,
            borderBottom: '1px solid',
            borderColor: 'grey.200'
          }}>
              <Avatar 
                sx={{ 
                width: 80, 
                height: 80,
                mb: 2,
                  bgcolor: 'primary.main',
                fontSize: '2rem'
                }}
              >
              {formData.name?.[0] || 'U'}
              </Avatar>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {formData.name || '使用者'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {formData.email || ''}
            </Typography>
            
            {/* 服務會員數量 */}
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'primary.50',
              px: 2,
              py: 1,
              borderRadius: 1,
              mb: 2
            }}>
              <Typography variant="body2" color="primary.main">
                服務會員數量：
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                {memberCount}
              </Typography>
              <Typography variant="body2" color="primary.main">
                位
                </Typography>
            </Box>

            {/* 個人資料編輯表單 */}
            {showProfile && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 2, color: 'grey.700' }}>
                        基本資料
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="姓名"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="電話"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="暱稱"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mb: 2, mt: 2, color: 'grey.700' }}>
                        其他資料
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Line ID"
                        name="lineId"
                        value={formData.lineId}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="生日"
                        name="birthday"
                        type="date"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        disabled={!isEditing}
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
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  
                  {isEditing ? (
                    <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                        fullWidth
                      >
                        取消
                      </Button>
            <Button
                        type="submit"
                        variant="contained"
              fullWidth
                      >
                        儲存
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 3 }}>
                      <Button
              variant="outlined"
                        onClick={() => setIsEditing(true)}
                        fullWidth
                      >
                        編輯資料
                      </Button>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                        姓名、Email、電話如需修改請聯繫管理員
                      </Typography>
                    </Box>
                  )}
                </form>
              </Box>
            )}

            {/* 修改密碼表單 */}
            {showChangePassword && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <form onSubmit={handlePasswordSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="password"
                        label="目前密碼"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="password"
                        label="新密碼"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="password"
                        label="確認新密碼"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    更新密碼
            </Button>
                </form>
              </Box>
            )}
          </Box>

          {/* 設定選單 */}
          <List sx={{ pt: 0 }}>
            {menuItems.map((item, index) => (
              <div key={item.text}>
                <ListItem 
                  disablePadding
                  secondaryAction={item.switch ? (
                    <Switch
                      edge="end"
                      checked={item.switch.checked}
                      onChange={item.switch.onChange}
                    />
                  ) : null}
                >
                  <ListItemButton 
                    onClick={item.onClick}
                    sx={{
                      '&.Mui-disabled': {
                        opacity: 0.5,
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'grey.500' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.9rem'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {index < menuItems.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </div>
            ))}
          </List>

          {/* 登出按鈕 */}
          <Box sx={{ 
            p: 2, 
            mt: 'auto',
            borderTop: 1,
            borderColor: 'divider',
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.paper'
          }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              size="large"
            >
              登出
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Fragment>
  )
} 