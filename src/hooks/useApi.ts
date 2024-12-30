import { useState } from 'react'
import { config } from '@/utils/config'
import type { ApiResponse } from '@/types'

export function useApi<T>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async (endpoint: string): Promise<ApiResponse<T>> => {
    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}${endpoint}`)
      const data = await response.json()
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { fetchData, loading, error }
} 