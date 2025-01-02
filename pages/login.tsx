import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { useAuth } from '../src/hooks/useAuth'
import Link from 'next/link'

const Login: NextPage = () => {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // 自動登入並跳轉
    const autoLogin = async () => {
      try {
        setLoading(true)
        setError('')
        const result = await login({ email: 'admin@mbc.com', password: 'Admin123' })
        if (result?.error) {
          setError('登入失敗，請稍後再試')
        }
      } catch (error) {
        console.error('Login error:', error)
        setError('登入失敗，請稍後再試')
      } finally {
        setLoading(false)
      }
    }
    autoLogin()
  }, [login])

  return (
    <>
      <Head>
        <title>登入 - 多元商會員管理系統</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="多元商 Logo"
                width={100}
                height={100}
                priority
                className="h-20 w-auto"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {loading ? '登入中...' : '登入您的帳號'}
            </h2>
            {error && (
              <p className="mt-2 text-center text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Login

export async function getServerSideProps() {
  return {
    props: {},
  }
} 