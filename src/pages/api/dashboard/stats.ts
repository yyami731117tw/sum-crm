import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { logger } from '@/utils/logger'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth.config'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    // 檢查用戶會話
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ message: '未授權訪問' })
    }

    // 生成 ETag
    const timestamp = new Date().toISOString().slice(0, 16) // 精確到分鐘
    const etag = Buffer.from(timestamp).toString('base64')
    
    // 檢查客戶端的 If-None-Match 標頭
    const clientEtag = req.headers['if-none-match']
    if (clientEtag === etag) {
      return res.status(304).end()
    }

    // 並行執行所有查詢以提高性能
    const [
      totalMembers,
      newMembersThisMonth,
      pendingTasks,
      recentActivities
    ] = await Promise.all([
      // 獲取會員總數
      prisma.member.count(),

      // 獲取本月新增會員數
      prisma.member.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // 獲取待處理合約數
      prisma.contract.count({
        where: {
          status: '進行中'
        }
      }),

      // 獲取最近活動（限制5筆）
      prisma.memberLog.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          action: true,
          createdAt: true,
          memberId: true
        }
      })
    ])

    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      type: 'member',
      action: activity.action,
      memberId: activity.memberId,
      date: activity.createdAt.toISOString()
    }))

    // 設置響應標頭
    res.setHeader('ETag', etag)
    res.setHeader('Cache-Control', 'private, no-cache, must-revalidate')

    return res.status(200).json({
      totalMembers,
      newMembersThisMonth,
      pendingTasks,
      recentActivities: formattedActivities,
      timestamp
    })

  } catch (error) {
    logger.error('獲取儀表板統計失敗', { 
      error: error instanceof Error ? error.message : '未知錯誤',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // 設置響應標頭以防止緩存錯誤響應
    res.setHeader('Cache-Control', 'no-store')
    return res.status(500).json({ 
      message: '獲取儀表板統計失敗，請稍後再試',
      timestamp: new Date().toISOString()
    })
  }
} 