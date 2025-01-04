import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { logger } from '@/utils/logger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const data = req.body

      // 驗證必要欄位
      const requiredFields = ['contractNo', 'projectName', 'memberId', 'amount', 'signDate', 'startDate', 'endDate']
      const missingFields = requiredFields.filter(field => !data[field])

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `缺少必要欄位: ${missingFields.join(', ')}`
        })
      }

      // 創建新合約
      const newContract = await prisma.contract.create({
        data: {
          contractNo: data.contractNo,
          projectName: data.projectName,
          memberId: data.memberId,
          memberName: data.memberName,
          memberNo: data.memberNo,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          bankAccount: data.bankAccount,
          signDate: new Date(data.signDate),
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          status: data.status || '進行中',
          invoiceInfo: data.invoiceInfo,
          notes: data.notes,
          contractFile: data.contractFile,
          attachments: data.attachments,
          createdAt: new Date()
        }
      })

      return res.status(201).json(newContract)

    } catch (error) {
      logger.error('創建合約失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
      return res.status(500).json({ message: '創建合約失敗，請稍後再試' })
    }
  }

  if (req.method === 'GET') {
    try {
      const contracts = await prisma.contract.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })

      return res.status(200).json(contracts)

    } catch (error) {
      logger.error('獲取合約列表失敗', { error: error instanceof Error ? error : new Error('Unknown error') })
      return res.status(500).json({ message: '獲取合約列表失敗，請稍後再試' })
    }
  }

  return res.status(405).json({ message: '方法不允許' })
} 