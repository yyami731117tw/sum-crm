import type { NextPage } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const Login: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/')
  }, [router])

  return (
    <>
      <Head>
        <title>登入 - 多元商會員管理系統</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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