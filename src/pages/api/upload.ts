import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const uploadDir = path.join(process.cwd(), 'public/uploads')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '不支援的請求方法' })
  }

  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ message: '請先登入' })
  }

  try {
    // 確保上傳目錄存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      uploadDir,
      keepExtensions: true,
      filter: ({ mimetype }: { mimetype: string | null }) => {
        // 只允許圖片
        return mimetype?.includes('image/') || false
      },
    })

    const [fields, files] = await form.parse(req)
    const file = files.image?.[0]

    if (!file) {
      return res.status(400).json({ message: '未找到上傳的檔案' })
    }

    // 生成相對路徑的 URL
    const relativeUrl = `/uploads/${path.basename(file.filepath)}`

    return res.status(200).json({
      url: relativeUrl
    })
  } catch (error) {
    console.error('檔案上傳失敗:', error)
    return res.status(500).json({ message: '檔案上傳失敗' })
  }
} 