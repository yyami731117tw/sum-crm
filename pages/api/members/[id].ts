import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { getSession } from 'next-auth/react'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 檢查使用者是否已登入
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ error: '請先登入' })
  }

  const { id } = req.query

  try {
    switch (req.method) {
      case 'GET':
        const member = await prisma.member.findUnique({
          where: { id: String(id) },
          include: {
            relatedMembers: true,
            investments: true,
            logs: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        })
        if (!member) {
          return res.status(404).json({ error: '找不到會員' })
        }
        return res.status(200).json(member)

      case 'PUT':
        const updatedMember = await prisma.member.update({
          where: { id: String(id) },
          data: req.body,
          include: {
            relatedMembers: true,
            investments: true,
            logs: true
          }
        })
        
        // 記錄變更
        if (req.body.changes) {
          await prisma.memberLog.create({
            data: {
              memberId: String(id),
              action: '更新會員資料',
              details: `修改了 ${Object.keys(req.body.changes).length} 個欄位`,
              operator: req.body.operator || 'system',
              changes: req.body.changes
            }
          })
        }
        
        return res.status(200).json(updatedMember)

      default:
        res.setHeader('Allow', ['GET', 'PUT'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: '內部伺服器錯誤' })
  }
} 