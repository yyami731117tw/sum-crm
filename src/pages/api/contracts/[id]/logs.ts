import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { logger } from '@/utils/logger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: '無效的合約 ID' })
  }

  if (req.method === 'GET') {
    try {
      const logs = await prisma.contractLog.findMany({
        where: {
          contractId: id
        },
        orderBy: {
          timestamp: 'desc'
        }
      })

      return res.status(200).json(logs)

    } catch (error) {
      logger.error('獲取合約日誌失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
      return res.status(500).json({ message: '獲取合約日誌失敗，請稍後再試' })
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body

      // 驗證必要欄位
      const requiredFields = ['action', 'details', 'operator']
      const missingFields = requiredFields.filter(field => !data[field])

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `缺少必要欄位: ${missingFields.join(', ')}`
        })
      }

      // 創建日誌
      const log = await prisma.contractLog.create({
        data: {
          contractId: id,
          action: data.action,
          details: data.details,
          operator: data.operator,
          changes: data.changes
        }
      })

      return res.status(201).json(log)

    } catch (error) {
      logger.error('創建合約日誌失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
      return res.status(500).json({ message: '創建合約日誌失敗，請稍後再試' })
    }
  }

  return res.status(405).json({ message: '方法不允許' })
} 