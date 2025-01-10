import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'
import { logger } from '@/utils/logger'
import { Prisma, Contract } from '@prisma/client'

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
      const contract = await prisma.safeQuery<Contract>('contract', 'findUnique', {
        where: { id },
        include: {
          member: true,  // 包含關聯的會員信息
          logs: true     // 包含合約日誌
        }
      })

      if (!contract) {
        return res.status(404).json({ message: '找不到合約' })
      }

      return res.status(200).json(contract)

    } catch (error) {
      logger.error('獲取合約失敗', { 
        error: error instanceof Error ? error : new Error('Unknown error'),
        contractId: id
      })
      return res.status(500).json({ message: '獲取合約失敗，請稍後再試' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const data = req.body

      const updateData: Prisma.ContractUpdateInput = {
        projectName: data.projectName,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        bankAccount: data.bankAccount,
        signDate: new Date(data.signDate),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status,
        invoiceInfo: data.invoiceInfo,
        notes: data.notes,
        contractFile: data.contractFile,
        attachments: data.attachments,
        updatedAt: new Date()
      }

      const contract = await prisma.safeQuery<Contract>('contract', 'update', {
        where: { id },
        data: updateData
      })

      if (!contract) {
        return res.status(404).json({ message: '更新合約失敗' })
      }

      return res.status(200).json(contract)

    } catch (error) {
      logger.error('更新合約失敗', { 
        error: error instanceof Error ? error : new Error('Unknown error'),
        contractId: id
      })
      return res.status(500).json({ message: '更新合約失敗，請稍後再試' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const result = await prisma.safeQuery<Contract>('contract', 'delete', {
        where: { id }
      })

      if (!result) {
        return res.status(404).json({ message: '刪除合約失敗' })
      }

      return res.status(204).end()

    } catch (error) {
      logger.error('刪除合約失敗', { 
        error: error instanceof Error ? error : new Error('Unknown error'),
        contractId: id
      })
      return res.status(500).json({ message: '刪除合約失敗，請稍後再試' })
    }
  }

  return res.status(405).json({ message: '方法不允許' })
} 