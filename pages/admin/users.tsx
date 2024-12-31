import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { MainLayout } from '@/layouts/MainLayout'
import { UserTable } from '@/components/admin/UserTable'
import { UserFilter } from '@/components/admin/UserFilter'
import Head from 'next/head'
import { AdminRoute } from '@/components/auth/AdminRoute'

interface User {
  id: string
  name: string
  email: string
  phone: string
  birthday: string
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin: string
}

const UsersPage: NextPage = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    status: 'all',
    search: ''
  })

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId: string, status: 'active' | 'inactive') => {
    try {
      await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  return (
    <AdminRoute>
      <MainLayout>
        <Head>
          <title>使用者管理 - 多元商會員管理系統</title>
        </Head>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">使用者管理</h1>
            
            <div className="mt-8">
              <UserFilter filter={filter} onFilterChange={setFilter} />
              
              <div className="mt-4">
                <UserTable 
                  users={users}
                  loading={loading}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </AdminRoute>
  )
}

export default UsersPage 