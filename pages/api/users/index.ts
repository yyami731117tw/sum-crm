import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, withRole, withStatus } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    return res.status(200).json(users)
  } catch (error) {
    console.error('獲取用戶列表失敗:', error)
    return res.status(500).json({ message: '獲取用戶列表失敗' })
  }
}

// 組合多個保護：需要登入 + 管理員角色 + 帳號狀態為啟用
export default withAuth(
  withRole('admin')(
    withStatus('active')(handler)
  )
) 