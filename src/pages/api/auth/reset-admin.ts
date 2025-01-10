import type { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允許 POST 請求' })
  }

  try {
    // 檢查是否已存在管理員帳號
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@mbc.com' }
    })

    const hashedPassword = await hash('admin123', 12)

    if (admin) {
      // 更新現有管理員密碼
      admin = await prisma.user.update({
        where: { email: 'admin@mbc.com' },
        data: {
          password: hashedPassword,
          status: 'active',
          role: 'admin',
          emailVerified: new Date(),
          name: 'Admin'
        }
      })
      console.log('管理員帳號已更新:', admin.email)
    } else {
      // 創建新管理員帳號
      admin = await prisma.user.create({
        data: {
          email: 'admin@mbc.com',
          name: 'Admin',
          password: hashedPassword,
          status: 'active',
          role: 'admin',
          emailVerified: new Date()
        }
      })
      console.log('管理員帳號已創建:', admin.email)
    }

    return res.status(200).json({
      success: true,
      message: '管理員帳號已重設',
      data: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        status: admin.status
      }
    })
  } catch (error) {
    console.error('重設管理員錯誤:', error)
    return res.status(500).json({
      success: false,
      message: '重設管理員過程發生錯誤',
      error: error instanceof Error ? error.message : '未知錯誤'
    })
  }
} 