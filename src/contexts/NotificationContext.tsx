'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  timestamp: string
  isRead: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // 從 localStorage 載入通知
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    } else {
      // 初始化預設通知
      const defaultNotifications: Notification[] = [
        {
          id: '1',
          userId: 'system',
          title: '新帳號審核通知',
          message: '有新的使用者帳號等待審核，請至使用者管理頁面進行審核。',
          type: 'warning',
          timestamp: new Date().toISOString(),
          isRead: false
        },
        {
          id: '2',
          userId: 'system',
          title: '系統更新通知',
          message: '系統已完成更新，新增了使用者管理功能',
          type: 'info',
          timestamp: new Date().toISOString(),
          isRead: false
        },
        {
          id: '3',
          userId: 'system',
          title: '安全提醒',
          message: '請定期更改您的密碼以確保帳號安全',
          type: 'warning',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isRead: false
        }
      ]
      setNotifications(defaultNotifications)
      localStorage.setItem('notifications', JSON.stringify(defaultNotifications))
    }
  }, [])

  // 儲存通知到 localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications))
  }, [notifications])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    )
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isDrawerOpen,
        setIsDrawerOpen,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
} 