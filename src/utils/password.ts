interface PasswordStrength {
  score: number
  feedback: {
    warning: string
    suggestions: string[]
  }
}

interface PasswordRequirement {
  label: string
  met: boolean
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0
  const feedback = {
    warning: '',
    suggestions: [] as string[]
  }

  if (!password) {
    return { score, feedback }
  }

  // 檢查長度
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.suggestions.push('密碼長度至少需要8個字符')
  }

  // 檢查是否包含數字
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.suggestions.push('加入數字可以提高密碼強度')
  }

  // 檢查是否包含小寫字母
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.suggestions.push('加入小寫字母可以提高密碼強度')
  }

  // 檢查是否包含大寫字母
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.suggestions.push('加入大寫字母可以提高密碼強度')
  }

  // 檢查是否包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.suggestions.push('加入特殊字符可以提高密碼強度')
  }

  // 根據分數給出警告
  if (score < 2) {
    feedback.warning = '密碼強度太弱'
  } else if (score < 3) {
    feedback.warning = '密碼強度一般'
  } else if (score < 4) {
    feedback.warning = '密碼強度良好'
  } else {
    feedback.warning = '密碼強度很強'
  }

  return { score, feedback }
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      label: '至少8個字符',
      met: password.length >= 8
    },
    {
      label: '包含數字',
      met: /\d/.test(password)
    },
    {
      label: '包含小寫字母',
      met: /[a-z]/.test(password)
    },
    {
      label: '包含大寫字母',
      met: /[A-Z]/.test(password)
    },
    {
      label: '包含特殊字符',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ]
} 