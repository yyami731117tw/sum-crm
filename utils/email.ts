import axios from 'axios'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    if (!process.env.EMAIL_SERVICE_URL || !process.env.EMAIL_API_KEY) {
      console.error('郵件服務配置缺失')
      return {
        success: false,
        error: '郵件服務未正確配置'
      }
    }

    const response = await axios.post(process.env.EMAIL_SERVICE_URL, {
      service_id: 'service_default',
      template_id: 'template_default',
      user_id: process.env.EMAIL_API_KEY,
      template_params: {
        to_email: to,
        from_name: '多元商會員系統',
        to_name: to.split('@')[0],
        subject,
        message: html,
        reply_to: process.env.EMAIL_FROM
      }
    })

    if (response.status === 200) {
      console.log('郵件發送成功:', { to, subject })
      return {
        success: true,
        messageId: response.data.messageId
      }
    } else {
      console.error('郵件發送失敗:', response.data)
      return {
        success: false,
        error: '郵件發送失敗'
      }
    }
  } catch (error) {
    console.error('發送郵件時發生錯誤:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '發送郵件失敗'
    }
  }
}

export function generateVerificationEmailContent(
  name: string,
  verificationCode: string
) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>歡迎加入多元商會員系統</h2>
      <p>親愛的 ${name}：</p>
      <p>感謝您註冊成為我們的會員。請使用以下驗證碼完成註冊：</p>
      <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
        ${verificationCode}
      </div>
      <p>此驗證碼將在30分鐘後失效。</p>
      <p>如果這不是您本人的操作，請忽略此郵件。</p>
      <p>祝您使用愉快！</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">此為系統自動發送的郵件，請勿直接回覆。</p>
    </div>
  `
} 