import { useState, useEffect } from 'react'

export function useMembersCache<T>(cacheKey: string) {
  const [cache, setCache] = useState<T | null>(null)

  useEffect(() => {
    // 從 localStorage 讀取快取
    const cachedData = localStorage.getItem(cacheKey)
    if (cachedData) {
      try {
        setCache(JSON.parse(cachedData))
      } catch (error) {
        console.error('快取解析錯誤:', error)
      }
    }
  }, [cacheKey])

  const updateCache = (data: T) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data))
      setCache(data)
    } catch (error) {
      console.error('快取更新錯誤:', error)
    }
  }

  const clearCache = () => {
    localStorage.removeItem(cacheKey)
    setCache(null)
  }

  return {
    cache,
    updateCache,
    clearCache
  }
} 