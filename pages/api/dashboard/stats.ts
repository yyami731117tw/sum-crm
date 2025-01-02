import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'

type MemberLogWithMember = {
  id: string
  memberId: string
  action: string
  createdAt: Date
  member: {
    id: string
    name: string
  }
}

type Investment = {
  id: string
  name: string
  createdAt: Date
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只允許 GET 請求' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ message: '未授權' })
    }

    // 獲取總會員數
    const totalMembers = await prisma.member.count()

    // 獲取活躍會員數（會員資格未過期的會員）
    const activeMembers = await prisma.member.count({
      where: {
        membershipEndDate: {
          gt: new Date()
        }
      }
    })

    // 獲取總投資案件數
    const totalInvestments = await prisma.investment.count()

    // 獲取最近活動
    const recentMemberActivities = await prisma.memberLog.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        member: true
      }
    }) as MemberLogWithMember[]

    const recentInvestments = await prisma.investment.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      }
    }) as Investment[]

    // 合併並排序最近活動
    const recentActivities = [
      ...recentMemberActivities.map((log: MemberLogWithMember) => ({
        id: log.id,
        type: 'member' as const,
        action: log.action,
        target: log.member.name,
        date: log.createdAt.toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      })),
      ...recentInvestments.map((investment: Investment) => ({
        id: investment.id,
        type: 'investment' as const,
        action: '新投資案',
        target: investment.name,
        date: investment.createdAt.toLocaleString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

    return res.status(200).json({
      totalMembers,
      activeMembers,
      totalInvestments,
      recentActivities
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return res.status(500).json({ message: '獲取儀表板數據時發生錯誤' })
  }
} 