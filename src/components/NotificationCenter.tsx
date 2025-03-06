import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IconButton, Badge, Typography, Box, Button } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { PersonAdd, Description, Assignment } from '@mui/icons-material'

interface Notification {
  id: string
  type: 'new_member' | 'contract_review' | 'contract_payment' | 'contract_complete' | 'member_task'
  title: string
  message: string
  targetId: string
  targetType: 'member' | 'contract' | 'project'
  isRead: boolean
  createdAt: string
  assignedTo?: string
}

export default function NotificationCenter() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // 載入通知
  useEffect(() => {
    loadNotifications()
    
    // 設定定時更新，每5秒更新一次
    const interval = setInterval(loadNotifications, 5000)

    // 添加全域事件監聽器，處理新通知
    const handleNewNotification = (event: CustomEvent) => {
      const newNotification = event.detail
      if (newNotification) {
        setNotifications(prev => [newNotification, ...prev])
      } else {
        loadNotifications()
      }
    }

    window.addEventListener('newNotification', handleNewNotification as EventListener)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('newNotification', handleNewNotification as EventListener)
    }
  }, [])

  // 載入通知函數
  const loadNotifications = () => {
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]')
    
    // 根據時間排序，最新的在前面
    const sortedNotifications = storedNotifications.sort((a: Notification, b: Notification) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    setNotifications(sortedNotifications)
  }

  // 處理通知點擊
  const handleNotificationClick = async (notification: Notification) => {
    // 標記為已讀
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, isRead: true } : n
    )
    setNotifications(updatedNotifications)
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications))

    setIsOpen(false)

    // 根據通知類型導航到對應頁面
    switch (notification.targetType) {
      case 'member':
        await router.push(`/members`)
        // 等待路由完成後再觸發側邊欄打開
        const members = JSON.parse(localStorage.getItem('members') || '[]')
        const targetMember = members.find((m: any) => m.id === notification.targetId)
        if (targetMember) {
          // 觸發全域事件來打開會員側邊欄
          window.dispatchEvent(new CustomEvent('openMemberSidebar', { detail: targetMember }))
        }
        break
      case 'contract':
        await router.push(`/contracts?id=${notification.targetId}`)
        break
      case 'project':
        await router.push(`/projects?id=${notification.targetId}`)
        break
    }
  }

  // 清除所有已讀通知
  const clearReadNotifications = () => {
    const unreadNotifications = notifications.filter(n => !n.isRead)
    setNotifications(unreadNotifications)
    localStorage.setItem('notifications', JSON.stringify(unreadNotifications))
  }

  // 添加時間格式化函數
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return '剛剛'
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} 分鐘前`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} 小時前`
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} 天前`
    }
    return past.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderNotificationContent = (notification: Notification) => {
    const getTypeIcon = () => {
      switch (notification.type) {
        case 'new_member':
          return <PersonAdd sx={{ fontSize: '1.2rem', color: 'primary.main' }} />
        case 'contract_review':
          return <Description sx={{ fontSize: '1.2rem', color: 'warning.main' }} />
        case 'member_task':
          return <Assignment sx={{ fontSize: '1.2rem', color: 'info.main' }} />
        default:
          return <NotificationsIcon sx={{ fontSize: '1.2rem', color: 'grey.500' }} />
      }
    }

    const getTypeColor = () => {
      switch (notification.type) {
        case 'new_member':
          return 'primary.main'
        case 'contract_review':
          return 'warning.main'
        case 'member_task':
          return 'info.main'
        default:
          return 'grey.500'
      }
    }

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1.5,
        py: 1.5,
        px: 2,
        borderBottom: '1px solid',
        borderColor: 'grey.100',
        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
        transition: 'background-color 0.2s',
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}>
        <Box sx={{ 
          p: 0.75,
          borderRadius: 1,
          bgcolor: `${getTypeColor()}10`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {getTypeIcon()}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Typography variant="subtitle2" sx={{ color: getTypeColor(), flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {notification.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', flexShrink: 0 }}>
              {formatTimeAgo(notification.createdAt)}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ 
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.4'
          }}>
            {notification.message}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <IconButton onClick={() => setIsOpen(!isOpen)}>
        <Badge badgeContent={notifications.filter(n => !n.isRead).length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {isOpen && (
        <Box sx={{
          position: 'absolute',
          right: 0,
          mt: 2,
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 6,
          zIndex: 1300,
          overflow: 'hidden'
        }}>
          <Box sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">通知中心</Typography>
            {notifications.some(n => n.isRead) && (
              <Button
                size="small"
                onClick={clearReadNotifications}
                sx={{ color: 'text.secondary' }}
              >
                清除已讀
              </Button>
            )}
          </Box>
          
          <Box sx={{ maxHeight: 480, overflow: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                暫無通知
              </Box>
            ) : (
              notifications.map(notification => (
                <Box
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    cursor: 'pointer',
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  {renderNotificationContent(notification)}
                </Box>
              ))
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
} 