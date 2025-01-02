import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '../src/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface UserProfile {
  // 基本資料（不可編輯）
  name: string
  email: string
  phone: string
  birthday: string
  joinDate: string
  // 個人設定（可編輯）
  nickname: string
  lineId: string
  address: string
}

const ProfilePage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({
    // 基本資料
    name: '王小明',
    email: 'wang@example.com',
    phone: '0912-345-678',
    birthday: '1990/01/01',
    joinDate: '2023/01/01',
    // 個人設定
    nickname: '小明',
    lineId: 'wang_123',
    address: '台北市信義區信義路五段7號'
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    nickname: profile.nickname,
    lineId: profile.lineId,
    address: profile.address
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 實作更新個人設定的 API 調用
    setProfile(prev => ({
      ...prev,
      nickname: editForm.nickname,
      lineId: editForm.lineId,
      address: editForm.address
    }))
    setIsEditing(false)
  }

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

            {/* 基本資料（不可編輯） */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">基本資料</h2>
                  <span className="text-sm text-gray-500">（如需修改請聯繫管理員）</span>
                </div>
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
              </div>
            </div>

            {/* 個人設定（可編輯） */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">個人設定</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      編輯設定
                    </button>
                  )}
                </div>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">暱稱</label>
                        <input
                          type="text"
                          value={editForm.nickname}
                          onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">LINE ID</label>
                        <input
                          type="text"
                          value={editForm.lineId}
                          onChange={(e) => setEditForm({ ...editForm, lineId: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">通訊地址</label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false)
                          setEditForm({
                            nickname: profile.nickname,
                            lineId: profile.lineId,
                            address: profile.address
                          })
                        }}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        儲存
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">暱稱</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.nickname}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">LINE ID</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.lineId}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-500">通訊地址</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfilePage 