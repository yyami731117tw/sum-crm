import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只允許 GET 請求' })
  }

  try {
    const totalMembers = await prisma.member.count()
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const newMembersThisMonth = await prisma.member.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    })

    const pendingInvestments = await prisma.investment.count({
      where: {
        status: 'pending'
      }
    })

    const recentMemberLogs = await prisma.memberLog.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        member: {
          select: {
            name: true
          }
        }
      }
    })

    return res.status(200).json({
      totalMembers,
      newMembersThisMonth,
      pendingTasks: pendingInvestments,
      recentActivities: recentMemberLogs.map(log => ({
        id: log.id,
        type: 'member',
        action: log.action,
        target: log.member.name,
        date: log.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('獲取統計數據錯誤:', error)
    return res.status(500).json({ message: '獲取統計數據時發生錯誤' })
  }
} 