import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { logger } from '@/utils/logger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允許' })
  }

  try {
    // 獲取會員總數
    const totalMembers = await prisma.member.count()

    // 獲取本月新增會員數
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const newMembersThisMonth = await prisma.member.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // 獲取待處理合約數
    const pendingTasks = await prisma.contract.count({
      where: {
        status: '進行中'
      }
    })

    // 獲取最近活動
    const recentActivities = await prisma.memberLog.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        member: true
      }
    })

    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      type: 'member',
      action: activity.action,
      target: `${activity.member.name} (${activity.member.memberNo})`,
      date: activity.createdAt.toISOString()
    }))

    return res.status(200).json({
      totalMembers,
      newMembersThisMonth,
      pendingTasks,
      recentActivities: formattedActivities
    })

  } catch (error) {
    logger.error('獲取儀表板統計失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
    return res.status(500).json({ message: '獲取儀表板統計失敗，請稍後再試' })
  }
} 