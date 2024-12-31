import { NextApiRequest, NextApiResponse } from 'next'
import { verify } from 'jsonwebtoken'

interface DecodedToken {
  userId: string
  role: string
}

export function adminAuth(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({ message: '未授權訪問' })
      }

      const decoded = verify(token, process.env.JWT_SECRET!) as DecodedToken

      if (decoded.role !== 'admin') {
        return res.status(403).json({ message: '權限不足' })
      }

      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ message: '未授權訪問' })
    }
  }
} 