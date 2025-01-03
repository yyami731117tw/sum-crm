import type { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { DashboardNav } from '@/components/dashboard/DashboardNav'
import Image from 'next/image'

interface UserProfile {
  id: string
  name: string
  email: string
  nickname?: string | null
  phone: string
  lineId?: string | null
  address?: string | null
  birthday?: string | null
  role: string
  status: string
  image?: string | null
}

const Profile: NextPage = () => {
  const { user, loading, updateUser } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      setProfile({
        ...user,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        lineId: user.lineId || '',
        address: user.address || '',
        birthday: user.birthday || '',
        image: user.image || ''
      })
      if (user.image) {
        setPreviewImage(user.image)
      }
    }
  }, [user])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 檢查檔案大小（限制為 5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('檔案大小不能超過 5MB')
        return
      }

      // 檢查檔案類型
      if (!file.type.startsWith('image/')) {
        alert('請上傳圖片檔案')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!profile || !updateUser) return
    setIsSaving(true)
    try {
      // 如果有新的頭像，先上傳圖片
      let imageUrl = profile.image
      if (previewImage && previewImage !== profile.image) {
        const formData = new FormData()
        const file = fileInputRef.current?.files?.[0]
        if (file) {
          formData.append('image', file)
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          if (!uploadResponse.ok) {
            throw new Error('圖片上傳失敗')
          }
          const { url } = await uploadResponse.json()
          imageUrl = url
        }
      }

      // 更新個人資料
      const success = await updateUser({
        ...profile,
        image: imageUrl
      })

      if (!success) {
        throw new Error('更新失敗')
      }

      setIsEditing(false)
    } catch (error) {
      console.error('更新個人資料失敗:', error)
      alert('更新失敗，請稍後再試')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>個人資料 - MBC管理系統</title>
      </Head>
      <div className="min-h-screen bg-gray-100 pt-16">
        <DashboardNav />
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">
                個人資料
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-5">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">個人資料</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">您的個人資料和設定</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      編輯資料
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isSaving ? '儲存中...' : '儲存'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setPreviewImage(profile.image || null)
                        }}
                        disabled={isSaving}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        取消
                      </button>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    {/* 頭像上傳 */}
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">頭像</dt>
                      <dd className="mt-1">
                        <div className="flex items-center space-x-6">
                          <div className="flex-shrink-0">
                            {previewImage ? (
                              <Image
                                src={previewImage}
                                alt="頭像預覽"
                                width={96}
                                height={96}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {isEditing && (
                            <div>
                              <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                更換頭像
                              </button>
                              {previewImage && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewImage(null)
                                    if (fileInputRef.current) {
                                      fileInputRef.current.value = ''
                                    }
                                  }}
                                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  移除頭像
                                </button>
                              )}
                              <p className="mt-2 text-sm text-gray-500">
                                建議使用 1:1 比例的圖片，檔案大小不超過 5MB
                              </p>
                            </div>
                          )}
                        </div>
                      </dd>
                    </div>

                    {/* 角色和狀態 */}
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">角色</dt>
                      <dd className="mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          profile.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          profile.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.role === 'admin' ? '管理員' :
                           profile.role === 'staff' ? '客服人員' :
                           '訪客'}
                        </span>
                      </dd>
                    </div>

                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">狀態</dt>
                      <dd className="mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          profile.status === 'active' ? 'bg-green-100 text-green-800' :
                          profile.status === 'inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {profile.status === 'active' ? '啟用' :
                           profile.status === 'inactive' ? '停用' :
                           '待審核'}
                        </span>
                      </dd>
                    </div>

                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">姓名</dt>
                      <dd className="mt-1">
                        <p className="text-sm text-gray-900">{profile.name}</p>
                      </dd>
                    </div>

                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">暱稱</dt>
                      <dd className="mt-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.nickname || ''}
                            onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{profile.nickname || '-'}</p>
                        )}
                      </dd>
                    </div>

                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">電子郵件</dt>
                      <dd className="mt-1">
                        <p className="text-sm text-gray-900">{profile.email}</p>
                      </dd>
                    </div>

                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">電話</dt>
                      <dd className="mt-1">
                        {isEditing ? (
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{profile.phone || '-'}</p>
                        )}
                      </dd>
                    </div>

                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Line ID</dt>
                      <dd className="mt-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.lineId || ''}
                            onChange={(e) => setProfile({ ...profile, lineId: e.target.value })}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{profile.lineId || '-'}</p>
                        )}
                      </dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">地址</dt>
                      <dd className="mt-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.address || ''}
                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{profile.address || '-'}</p>
                        )}
                      </dd>
                    </div>

                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">生日</dt>
                      <dd className="mt-1">
                        {isEditing ? (
                          <input
                            type="date"
                            value={profile.birthday || ''}
                            onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">{profile.birthday || '-'}</p>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default Profile 

export async function getServerSideProps() {
  return {
    props: {},
  }
} 