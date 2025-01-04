import { useState, useEffect, useCallback } from 'react'
import { Member } from '@prisma/client'

export function useMembersCache() {
  const [data, setData] = useState<Member[] | null>(null)
  const [loading, setLoading] = useState(true)

  const loadFromCache = useCallback(() => {
    const cached = localStorage.getItem('members')
    if (cached) {
      try {
        return JSON.parse(cached) as Member[]
      } catch (error) {
        console.error('解析快取資料失敗:', error)
        return null
      }
    }
    return null
  }, [])

  const updateCache = useCallback((newData: Member[]) => {
    setData(newData)
    localStorage.setItem('members', JSON.stringify(newData))
  }, [])

  useEffect(() => {
    const cached = loadFromCache()
    if (cached) {
      setData(cached)
    }
    setLoading(false)
  }, [loadFromCache])

  return { data, loading, updateCache, loadFromCache }
} 