import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允許 POST 請求' })
  }

  try {
    const { file, type } = req.body
    
    if (!file || !type) {
      return res.status(400).json({ error: '缺少必要參數' })
    }

    // 從 base64 字串解析檔案
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    // 生成檔案名稱
    const timestamp = new Date().getTime()
    const filename = `${type}_${timestamp}.jpg`

    // 上傳到 Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('member-photos')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) {
      throw error
    }

    // 取得公開 URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('member-photos')
      .getPublicUrl(filename)

    return res.status(200).json({ url: publicUrl })
  } catch (error) {
    console.error('上傳失敗:', error)
    return res.status(500).json({ error: '上傳失敗' })
  }
} 