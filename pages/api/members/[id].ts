import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ error: '請先登入' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: '無效的會員 ID' })
  }

  try {
    switch (req.method) {
      case 'GET':
        const member = await prisma.member.findUnique({
          where: { id },
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
          where: { id },
          data: req.body,
          include: {
            relatedMembers: true,
            investments: true,
            logs: true
          }
        })

        // 記錄更新操作
        await prisma.memberLog.create({
          data: {
            memberId: id,
            action: '更新會員資料',
            details: '更新會員資料',
            operator: session.user.name || '系統管理員',
            changes: {
              type: 'update',
              data: req.body
            }
          }
        })

        return res.status(200).json(updatedMember)

      case 'DELETE':
        const deletedMember = await prisma.member.delete({
          where: { id }
        })

        // 記錄刪除操作
        await prisma.memberLog.create({
          data: {
            memberId: id,
            action: '刪除會員',
            details: '刪除會員資料',
            operator: session.user.name || '系統管理員',
            changes: {
              type: 'delete',
              data: deletedMember
            }
          }
        })

        return res.status(200).json(deletedMember)

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: '內部伺服器錯誤' })
  }
} 