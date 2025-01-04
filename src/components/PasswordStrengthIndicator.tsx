import { useEffect, useState } from 'react'
import { checkPasswordStrength, getPasswordRequirements } from '@/utils/password'

interface PasswordStrengthIndicatorProps {
  password: string
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const [strength, setStrength] = useState({ score: 0, feedback: { warning: '', suggestions: [] } })
  const [requirements, setRequirements] = useState<Array<{ label: string; met: boolean }>>([])

  useEffect(() => {
    setStrength(checkPasswordStrength(password))
    setRequirements(getPasswordRequirements(password))
  }, [password])

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
        return 'bg-gray-200'
      case 1:
        return 'bg-red-500'
      case 2:
        return 'bg-yellow-500'
      case 3:
        return 'bg-blue-500'
      default:
        return 'bg-green-500'
    }
  }

  return (
    <div className="mt-1 space-y-2">
      {/* 強度指示器 */}
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>

      {/* 密碼要求列表 */}
      <ul className="space-y-1 text-sm">
        {requirements.map((req, index) => (
          <li
            key={index}
            className={`flex items-center space-x-2 ${
              req.met ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {req.met ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>

      {/* 警告和建議 */}
      {strength.feedback.warning && (
        <p className="text-sm text-gray-600">{strength.feedback.warning}</p>
      )}
      {strength.feedback.suggestions.length > 0 && (
        <ul className="text-sm text-gray-600 list-disc list-inside">
          {strength.feedback.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PasswordStrengthIndicator 