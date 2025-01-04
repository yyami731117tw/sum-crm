import { useState } from 'react'
import { config } from '@/utils/config'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const get = async (endpoint: string) => {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch(`${config.api.baseUrl}${endpoint}`)
      const data = await response.json()
      return data
    } catch (err) {
      setError(err as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const post = async (endpoint: string, body: any) => {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      return data
    } catch (err) {
      setError(err as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const put = async (endpoint: string, body: any) => {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      return data
    } catch (err) {
      setError(err as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const del = async (endpoint: string) => {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      return data
    } catch (err) {
      setError(err as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    get,
    post,
    put,
    del,
  }
} 