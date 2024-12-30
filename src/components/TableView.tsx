import type { FC } from 'react'
import type { TableData } from '@/types'

interface TableViewProps {
  data: TableData[]
  onRowClick?: (id: string) => void
}

export const TableView: FC<TableViewProps> = ({ data, onRowClick }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>標題</th>
            <th>記錄數</th>
            <th>更新時間</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} onClick={() => onRowClick?.(item.id)}>
              <td>{item.title}</td>
              <td>{item.records}</td>
              <td>{item.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 