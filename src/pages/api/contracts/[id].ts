import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { Contract } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: '未授權的訪問' })
  }

  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: id as string },
        include: {
          member: true,  // 包含關聯的會員信息
          logs: {
            orderBy: {
              timestamp: 'desc'
            }
          }
        }
      })

      if (!contract) {
        return res.status(404).json({ error: '找不到合約' })
      }

      return res.status(200).json(contract)
    } catch (error) {
      console.error('Error fetching contract:', error)
      return res.status(500).json({ error: '獲取合約資料時發生錯誤' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const updateData = req.body

      // 記錄變更
      const oldContract = await prisma.contract.findUnique({
        where: { id: id as string }
      })

      const updatedContract = await prisma.contract.update({
        where: { id: id as string },
        data: updateData
      })

      // 創建日誌
      await prisma.contractLog.create({
        data: {
          contractId: id as string,
          action: '更新合約',
          details: '合約資料已更新',
          operator: session.user?.name || session.user?.email || '未知用戶',
          changes: {
            old: oldContract,
            new: updatedContract
          }
        }
      })

      return res.status(200).json(updatedContract)
    } catch (error) {
      console.error('Error updating contract:', error)
      return res.status(500).json({ error: '更新合約時發生錯誤' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.contract.delete({
        where: { id: id as string }
      })

      return res.status(200).json({ message: '合約已刪除' })
    } catch (error) {
      console.error('Error deleting contract:', error)
      return res.status(500).json({ error: '刪除合約時發生錯誤' })
    }
  }

  return res.status(405).json({ error: '不支援的請求方法' })
} 