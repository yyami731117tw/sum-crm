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
          role: 'admin'
        }
      })
    } else {
      // 創建新管理員帳號
      admin = await prisma.user.create({
        data: {
          email: 'admin@mbc.com',
          name: 'Admin',
          password: hashedPassword,
          status: 'active',
          role: 'admin'
        }
      })
    }

    return res.status(200).json({
      message: '管理員帳號已重設',
      email: admin.email
    })
  } catch (error) {
    console.error('重設管理員錯誤:', error)
    return res.status(500).json({ message: '重設管理員過程發生錯誤' })
  }
} 