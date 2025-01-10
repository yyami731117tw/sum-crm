import type { NextPage } from 'next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator'
import { checkPasswordStrength } from '../utils/password'

const Signup: NextPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    birthday: ''
  })
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    birthday: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const { error: queryError } = router.query
    if (queryError) {
      const errorMessages: { [key: string]: string } = {
        google_auth_failed: 'Google 登入失敗，請重試',
        invalid_code: '無效的授權碼',
        email_not_verified: '您的 Google 帳號尚未驗證電子郵件',
        verification_email_failed: '驗證郵件發送失敗，請重試',
        signup_failed: '註冊失敗，請重試',
        google_auth_init_failed: 'Google 登入初始化失敗，請重試'
      }
      setError(errorMessages[queryError as string] || '發生錯誤，請重試')
    }
  }, [router.query])

  const validateStep = (currentStep: number) => {
    const errors = { ...formErrors }
    let isValid = true

    // 更嚴格的電子郵件驗證
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(formData.email)) {
      errors.email = '請輸入有效的電子郵件地址'
      isValid = false
    } else {
      errors.email = ''
    }

    // 密碼驗證（調整為不需要特殊字符）
    const passwordStrength = checkPasswordStrength(formData.password)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (passwordStrength.score < 2 || !passwordRegex.test(formData.password)) {
      errors.password = '密碼必須包含大小寫字母、數字，至少8個字符'
      isValid = false
    } else {
      errors.password = ''
    }

    // 姓名驗證（支持中英文）
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z\s]{2,20}$/
    if (!nameRegex.test(formData.name.trim())) {
      errors.name = '請輸入有效的姓名（2-20個字符）'
      isValid = false
    } else {
      errors.name = ''
    }

    // 手機號碼驗證（台灣手機號碼格式）
    const phoneRegex = /^09\d{8}$/
    if (!phoneRegex.test(formData.phone)) {
      errors.phone = '請輸入有效的台灣手機號碼（09開頭，共10碼）'
      isValid = false
    } else {
      errors.phone = ''
    }

    // 生日驗證
    const birthDate = new Date(formData.birthday)
    const today = new Date()
    const minAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    const maxAge = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
    
    if (isNaN(birthDate.getTime())) {
      errors.birthday = '請輸入有效的生日'
      isValid = false
    } else if (birthDate > today) {
      errors.birthday = '生日不能晚於今天'
      isValid = false
    } else if (birthDate > minAge) {
      errors.birthday = '您必須年滿18歲才能註冊'
      isValid = false
    } else if (birthDate < maxAge) {
      errors.birthday = '請輸入有效的出生日期'
      isValid = false
    } else {
      errors.birthday = ''
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 在提交前進行全面驗證
    if (!validateStep(1)) {
      // 自動捲動到第一個錯誤欄位
      const firstErrorField = Object.keys(formErrors).find(key => formErrors[key as keyof typeof formErrors] !== '')
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField)
        errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // 確保生日格式正確
          birthday: new Date(formData.birthday).toISOString().split('T')[0]
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/verify?userId=${data.userId}`)
      } else {
        setError(data.message || '註冊失敗')
      }
    } catch (err) {
      setError('網絡錯誤，請重試')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const birthdayInputProps = {
    id: 'birthday',
    name: 'birthday',
    type: 'date',
    required: true,
    value: formData.birthday,
    onChange: handleInputChange,
    className: "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>會員註冊 | 多元商</title>
      </Head>
      <div className="max-w-md w-full space-y-8 bg-white shadow-md rounded-xl p-8">
        <div className="text-center">
          <Image 
            src="/logo.png" 
            alt="多元商 Logo" 
            width={150} 
            height={50} 
            className="mx-auto mb-6"
          />
          <h2 className="text-3xl font-extrabold text-gray-900">
            會員註冊
          </h2>
          {error && (
            <div className="mt-4 text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              電子郵件
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.email && (
              <p className="mt-1 text-red-500 text-xs">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              密碼
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? '隱藏' : '顯示'}
              </button>
            </div>
            <PasswordStrengthIndicator password={formData.password} />
            {formErrors.password && (
              <p className="mt-1 text-red-500 text-xs">{formErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              姓名
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.name && (
              <p className="mt-1 text-red-500 text-xs">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              手機號碼
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.phone && (
              <p className="mt-1 text-red-500 text-xs">{formErrors.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
              生日
            </label>
            <input 
              {...birthdayInputProps} 
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                formErrors.birthday ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.birthday && (
              <p className="mt-1 text-red-500 text-xs">{formErrors.birthday}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? '處理中...' : '註冊'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            已有帳號？
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup 