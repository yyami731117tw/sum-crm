import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '../src/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface UserProfile {
  name: string
  email: string
  phone: string
  birthday: string
  joinDate: string
}

const ProfilePage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({
    name: '王小明',
    email: 'wang@example.com',
    phone: '0912-345-678',
    birthday: '1990/01/01',
    joinDate: '2023/01/01'
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>個人資料 - MBC天使俱樂部</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">個人資料</h1>

            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">基本資料</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">姓名</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">電子郵件</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">電話</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">生日</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.birthday}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">加入日期</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.joinDate}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    編輯資料
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage 