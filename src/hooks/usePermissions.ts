import { useState } from 'react'
import type { ApiResponse } from '@/types'

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([])

  const fetchPermissions = async () => {
    // 實現權限獲取邏輯
  }

  return { permissions, fetchPermissions }
} 