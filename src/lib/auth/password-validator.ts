export interface PasswordStrength {
  score: number // 0-4
  isStrong: boolean
  feedback: string[]
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 8
  private static readonly MAX_LENGTH = 50

  public static validate(password: string): PasswordStrength {
    const feedback: string[] = []
    let score = 4

    // 檢查長度
    if (password.length < this.MIN_LENGTH) {
      feedback.push(`密碼長度至少需要 ${this.MIN_LENGTH} 個字符`)
      score--
    }
    if (password.length > this.MAX_LENGTH) {
      feedback.push(`密碼長度不能超過 ${this.MAX_LENGTH} 個字符`)
      score--
    }

    // 檢查是否包含數字
    if (!/\d/.test(password)) {
      feedback.push('密碼需要包含至少一個數字')
      score--
    }

    // 檢查是否包含小寫字母
    if (!/[a-z]/.test(password)) {
      feedback.push('密碼需要包含至少一個小寫字母')
      score--
    }

    // 檢查是否包含大寫字母
    if (!/[A-Z]/.test(password)) {
      feedback.push('密碼需要包含至少一個大寫字母')
      score--
    }

    // 檢查是否包含特殊字符
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('密碼需要包含至少一個特殊字符')
      score--
    }

    // 確保分數在 0-4 範圍內
    score = Math.max(0, Math.min(4, score))

    return {
      score,
      isStrong: score >= 3,
      feedback: feedback.length > 0 ? feedback : ['密碼強度良好']
    }
  }

  public static getStrengthLabel(score: number): string {
    switch (score) {
      case 0:
        return '非常弱'
      case 1:
        return '弱'
      case 2:
        return '一般'
      case 3:
        return '強'
      case 4:
        return '非常強'
      default:
        return '未知'
    }
  }
} 