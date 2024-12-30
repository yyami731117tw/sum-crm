import type { NextPage } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'

const Home: NextPage = () => {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>歡迎使用 B2B CRM 平台</h1>
    </div>
  )
}

export default Home 