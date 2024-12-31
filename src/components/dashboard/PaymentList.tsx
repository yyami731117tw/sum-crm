import type { FC } from 'react'

export const PaymentList: FC = () => {
  const payments = [
    {
      id: 1,
      name: '系統維護費用',
      amount: '$64',
      status: 'completed',
      date: '2024-03-15'
    },
    {
      id: 2,
      name: '服務器託管費用',
      amount: '$128',
      status: 'pending',
      date: '2024-03-14'
    },
    {
      id: 3,
      name: '軟件授權費用',
      amount: '$256',
      status: 'completed',
      date: '2024-03-13'
    }
  ]

  return (
    <div className="space-y-4">
      {payments.map(payment => (
        <div
          key={payment.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div>
            <h4 className="font-medium text-gray-900">
              {payment.name}
            </h4>
            <p className="text-sm text-gray-500">{payment.date}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-900">
              {payment.amount}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                payment.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {payment.status === 'completed' ? '已完成' : '處理中'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
} 