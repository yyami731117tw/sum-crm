import { useEffect, useState } from 'react'
import { checkPasswordStrength, getPasswordRequirements } from '../utils/password'

interface PasswordStrengthIndicatorProps {
  password: string
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const strength = checkPasswordStrength(password)
  const requirements = getPasswordRequirements(password)

  useEffect(() => {
    if (password) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [password])

  if (!isVisible) return null

  return (
    <div className="mt-2 space-y-2">
      {/* 強度指示器 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${strength.color} transition-all duration-300`}
              style={{ width: `${(strength.score + 1) * 20}%` }}
            />
          </div>
          <span className="ml-2 text-xs text-gray-500">{strength.message}</span>
        </div>
      </div>

      {/* 密碼要求列表 */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center text-xs">
            <span className={`mr-2 ${req.met ? 'text-green-500' : 'text-gray-400'}`}>
              {req.met ? '✓' : '○'}
            </span>
            <span className={req.met ? 'text-gray-700' : 'text-gray-500'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 