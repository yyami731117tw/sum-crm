import type { FC } from 'react'

interface StatsCardProps {
  title: string
  value: string
  icon: 'currency' | 'users' | 'chart'
  trend: string
}

export const StatsCard: FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'currency':
        return '💰'
      case 'users':
        return '👥'
      case 'chart':
        return '📈'
      default:
        return '📊'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{getIcon()}</span>
        <span className="text-green-500 text-sm font-medium">
          {trend}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
} 