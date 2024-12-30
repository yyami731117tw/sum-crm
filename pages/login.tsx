import type { NextPage } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/hooks/useAuth'

const Login: NextPage = () => {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  return (
    <div>
      <h1>登入</h1>
      {/* 添加登入表單 */}
    </div>
  )
}

export default Login 