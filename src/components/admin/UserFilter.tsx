import { FC } from 'react'

interface FilterProps {
  filter: {
    status: string
    search: string
  }
  onFilterChange: (filter: { status: string; search: string }) => void
}

export const UserFilter: FC<FilterProps> = ({ filter, onFilterChange }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <input
          type="text"
          placeholder="搜尋使用者..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter.search}
          onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
        />
      </div>
      <div className="sm:w-48">
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter.status}
          onChange={(e) => onFilterChange({ ...filter, status: e.target.value })}
        >
          <option value="all">所有狀態</option>
          <option value="active">啟用</option>
          <option value="inactive">停用</option>
        </select>
      </div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => onFilterChange({ status: 'all', search: '' })}
      >
        重置
      </button>
    </div>
  )
} 