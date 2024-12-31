import { FC } from 'react'
import { ErrorMessage } from '../ui/ErrorMessage'

export const AdminError: FC = () => {
  return (
    <ErrorMessage
      title="權限不足"
      message="此頁面僅限管理員操作，請聯繫系統管理員獲取權限。"
      backLink="/dashboard"
      backText="返回首頁"
    />
  )
} 