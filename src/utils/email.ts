import nodemailer from 'nodemailer'
import { logger } from './logger'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

interface EmailResult {
  success: boolean
  error?: string
}

// 創建郵件傳輸器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<EmailResult> {
  try {
    await transporter.sendMail({
      from: `"多元商會員系統" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })

    return { success: true }
  } catch (error) {
    logger.error('發送郵件失敗', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '發送郵件失敗',
    }
  }
}

export function generateVerificationEmailContent(name: string, code: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>親愛的 ${name} 您好：</h2>
      <p>感謝您註冊多元商會員系統。請使用以下驗證碼完成電子郵件驗證：</p>
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="letter-spacing: 5px; color: #333;">${code}</h1>
      </div>
      <p>此驗證碼將在 30 分鐘後失效。</p>
      <p>如果您沒有註冊多元商會員系統，請忽略此郵件。</p>
      <hr style="margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        此為系統自動發送的郵件，請勿直接回覆。<br>
        如有任何問題，請聯繫客服人員。
      </p>
    </div>
  `
} 