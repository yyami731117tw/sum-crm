import { useState, useEffect } from 'react'
import { config } from '@/utils/config'

interface CacheData<T> {
  data: T
  timestamp: number
}

export function useMembersCache<T>(key: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  // 從快取讀取資料
  const loadFromCache = (): T | null => {
    try {
      const cached = localStorage.getItem(key)
      if (!cached) return null

      const { data, timestamp }: CacheData<T> = JSON.parse(cached)
      const now = Date.now()

      // 檢查快取是否過期
      if (now - timestamp > config.cacheTimeout) {
        localStorage.removeItem(key)
        return null
      }

      return data
    } catch (error) {
      console.error('讀取快取失敗:', error)
      return null
    }
  }

  // 更新快取
  const updateCache = (newData: T) => {
    try {
      const cacheData: CacheData<T> = {
        data: newData,
        timestamp: Date.now()
      }
      localStorage.setItem(key, JSON.stringify(cacheData))
      setData(newData)
    } catch (error) {
      console.error('更新快取失敗:', error)
    }
  }

  // 初始化時讀取快取
  useEffect(() => {
    loadFromCache()
  }, [loadFromCache])

  return {
    data,
    loading,
    updateCache,
    loadFromCache
  }
} 