import axios from 'axios'

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    // 檢查環境變數
    const requiredEnvVars = {
      EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL,
      EMAIL_USER_ID: process.env.EMAIL_USER_ID,
      EMAIL_SERVICE_ID: process.env.EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID: process.env.EMAIL_TEMPLATE_ID
    }

    // 檢查是否所有必要的環境變數都存在
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      console.error('郵件服務配置缺失:', {
        missingVariables: missingVars,
        availableVariables: Object.fromEntries(
          Object.entries(requiredEnvVars).map(([key, value]) => [key, !!value])
        )
      })
      return {
        success: false,
        error: `郵件服務配置缺失: ${missingVars.join(', ')}`
      }
    }

    console.log('準備發送郵件:', {
      to,
      subject,
      serviceId: process.env.EMAIL_SERVICE_ID,
      templateId: process.env.EMAIL_TEMPLATE_ID,
      userId: process.env.EMAIL_USER_ID?.substring(0, 5) + '...' // 只顯示前5個字符
    })

    const response = await axios.post(
      process.env.EMAIL_SERVICE_URL!,
      {
        service_id: process.env.EMAIL_SERVICE_ID,
        template_id: process.env.EMAIL_TEMPLATE_ID,
        user_id: process.env.EMAIL_USER_ID,
        template_params: {
          to_email: to,
          from_name: '多元商會員系統',
          to_name: to.split('@')[0],
          subject,
          message: html,
          reply_to: process.env.EMAIL_FROM || 'noreply@sum-crm.vercel.app'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': process.env.NEXT_PUBLIC_BASE_URL || 'https://sum-crm.vercel.app'
        },
        timeout: 10000 // 10秒超時
      }
    )

    if (response.status === 200 && response.data) {
      console.log('郵件發送成功:', {
        to,
        subject,
        response: response.data
      })
      return {
        success: true,
        messageId: response.data
      }
    } else {
      console.error('郵件發送失敗:', {
        status: response.status,
        data: response.data
      })
      return {
        success: false,
        error: '郵件發送失敗: 伺服器回應異常'
      }
    }
  } catch (error) {
    console.error('發送郵件時發生錯誤:', error)
    
    // 詳細的錯誤日誌
    if (axios.isAxiosError(error)) {
      console.error('Axios 錯誤詳情:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      })
      
      // 根據不同的錯誤狀態返回適當的錯誤信息
      if (error.response?.status === 401) {
        return {
          success: false,
          error: '郵件服務驗證失敗，請檢查配置'
        }
      } else if (error.response?.status === 429) {
        return {
          success: false,
          error: '發送請求過於頻繁，請稍後再試'
        }
      } else if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: '郵件發送超時，請稍後再試'
        }
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : '發送郵件時發生未知錯誤'
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