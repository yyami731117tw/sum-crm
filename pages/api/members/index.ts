import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { getSession } from 'next-auth/react'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 檢查使用者是否已登入
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ error: '請先登入' })
  }

  try {
    switch (req.method) {
      case 'GET':
        const members = await prisma.member.findMany({
          include: {
            relatedMembers: true,
            investments: true,
            logs: {
              take: 1,
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        })
        return res.status(200).json(members)

      case 'POST':
        const newMember = await prisma.member.create({
          data: req.body,
          include: {
            relatedMembers: true,
            investments: true,
            logs: true
          }
        })
        
        // 記錄新增操作
        await prisma.memberLog.create({
          data: {
            memberId: newMember.id,
            action: '新增會員',
            details: '建立新會員資料',
            operator: req.body.operator || 'system',
            changes: {
              type: 'create',
              data: req.body
            }
          }
        })
        
        return res.status(201).json(newMember)

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: '內部伺服器錯誤' })
  }
} 