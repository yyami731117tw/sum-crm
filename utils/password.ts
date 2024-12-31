export interface PasswordStrength {
  score: number // 0-4
  message: string
  color: string
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0
  const checks = {
    length: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password)
  }

  // 基本分數
  if (checks.length) score++
  if (checks.hasLetter && checks.hasNumber) score++
  if (checks.hasUpperCase && checks.hasLowerCase) score++

  // 額外加分項
  if (checks.hasSpecial) score++
  if (password.length >= 12) score = Math.min(score + 1, 4)

  const strengthMap: Record<number, PasswordStrength> = {
    0: {
      score: 0,
      message: '非常弱',
      color: 'bg-red-500'
    },
    1: {
      score: 1,
      message: '弱',
      color: 'bg-orange-500'
    },
    2: {
      score: 2,
      message: '中等',
      color: 'bg-yellow-500'
    },
    3: {
      score: 3,
      message: '強',
      color: 'bg-green-500'
    },
    4: {
      score: 4,
      message: '非常強',
      color: 'bg-green-600'
    }
  }

  return strengthMap[score]
}

export function getPasswordRequirements(password: string) {
  return [
    {
      text: '至少8個字符',
      met: password.length >= 8
    },
    {
      text: '包含字母',
      met: /[a-zA-Z]/.test(password)
    },
    {
      text: '包含數字',
      met: /\d/.test(password)
    },
    {
      text: '包含大寫和小寫字母',
      met: /[A-Z]/.test(password) && /[a-z]/.test(password)
    },
    {
      text: '建議：包含特殊字符 (!@#$%^&*) 可提高安全性',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ]
} 