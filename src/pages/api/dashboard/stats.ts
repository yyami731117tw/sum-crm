import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { logger } from '@/utils/logger'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

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
          member: {
            select: {
              name: true,
              memberNo: true
            }
          }
        }
      })
    ])

    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      type: 'member',
      action: activity.action,
      target: `${activity.member.name} (${activity.member.memberNo})`,
      date: activity.createdAt.toISOString()
    }))

    // 設置快取標頭（5分鐘）
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')

    return res.status(200).json({
      totalMembers,
      newMembersThisMonth,
      pendingTasks,
      recentActivities: formattedActivities
    })

  } catch (error) {
    logger.error('獲取儀表板統計失敗', { 
      error: error instanceof Error ? error.message : '未知錯誤',
      stack: error instanceof Error ? error.stack : undefined
    })
    return res.status(500).json({ message: '獲取儀表板統計失敗，請稍後再試' })
  }
} 