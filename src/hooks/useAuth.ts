import { useState, useEffect } from 'react'
import type { ApiResponse } from '@/types'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          // 驗證token
          setIsAuthenticated(true)
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return { isAuthenticated, loading }
} 