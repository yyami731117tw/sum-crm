import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // 檢查必要欄位
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '請填寫所有必要欄位' },
        { status: 400 }
      )
    }

    // 檢查 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '無效的電子郵件格式' },
        { status: 400 }
      )
    }

    // 從 localStorage 獲取現有使用者
    const savedUsers = localStorage.getItem('users')
    const users = savedUsers ? JSON.parse(savedUsers) : []

    // 檢查 email 是否已存在
    if (users.some((user: any) => user.email === email)) {
      return NextResponse.json(
        { error: '此電子郵件已被註冊' },
        { status: 400 }
      )
    }

    // 建立新使用者
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: hashedPassword,
      role: 'guest',
      status: 'pending',
      joinDate: new Date().toISOString(),
      lastLogin: null
    }

    // 儲存新使用者
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))

    // 添加審核通知
    const savedNotifications = localStorage.getItem('notifications')
    const notifications = savedNotifications ? JSON.parse(savedNotifications) : []
    
    const newNotification = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'system',
      title: '新帳號待審核',
      message: `新使用者 ${name} (${email}) 已註冊，等待管理員審核。`,
      type: 'warning',
      timestamp: new Date().toISOString(),
      isRead: false
    }
    
    notifications.unshift(newNotification)
    localStorage.setItem('notifications', JSON.stringify(notifications))

    return NextResponse.json(
      { 
        message: '註冊成功，請等待管理員審核後即可登入',
        user: { ...newUser, password: undefined }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('註冊失敗:', error)
    return NextResponse.json(
      { error: '註冊失敗，請稍後再試' },
      { status: 500 }
    )
  }
} 