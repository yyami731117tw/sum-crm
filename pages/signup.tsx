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

    if (currentStep === 1) {
      // 驗證電子郵件
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.email = '請輸入有效的電子郵件地址'
        isValid = false
      } else {
        errors.email = ''
      }

      // 驗證密碼
      const passwordStrength = checkPasswordStrength(formData.password)
      if (passwordStrength.score < 1) {
        errors.password = '密碼需要至少包含8個字符，並包含字母和數字'
        isValid = false
      } else {
        errors.password = ''
      }
    }

    if (currentStep === 2) {
      // 驗證姓名
      if (formData.name.length < 2) {
        errors.name = '請輸入完整姓名'
        isValid = false
      } else {
        errors.name = ''
      }

      // 驗證電話
      if (!formData.phone.match(/^09\d{8}$/)) {
        errors.phone = '請輸入有效的手機號碼'
        isValid = false
      } else {
        errors.phone = ''
      }

      // 驗證生日
      const birthDate = new Date(formData.birthday)
      const today = new Date()
      if (birthDate > today) {
        errors.birthday = '生日不能晚於今天'
        isValid = false
      } else {
        errors.birthday = ''
      }
    }

    setFormErrors(errors)
    return isValid
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(step)) {
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/verify?token=${data.verificationToken}`)
      } else {
        setError(data.message || '註冊失敗')
      }
    } catch (err) {
      setError('註冊時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/google'
  }

  const handleLogin = () => {
    window.location.href = '/login'
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            {/* 電子郵件 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* 密碼 */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <PasswordStrengthIndicator password={formData.password} />
              {formErrors.password && (
                <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
              )}
            </div>
          </>
        )

      case 2:
        return (
          <>
            {/* 姓名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
              )}
            </div>

            {/* 電話 */}
            <div className="mt-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                電話
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  formErrors.phone ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {formErrors.phone && (
                <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
              )}
            </div>

            {/* 生日 */}
            <div className="mt-4">
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
                生日
              </label>
              <input
                id="birthday"
                name="birthday"
                type="date"
                required
                className={`mt-1 block w-full px-3 py-2 border ${
                  formErrors.birthday ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              />
              {formErrors.birthday && (
                <p className="mt-1 text-xs text-red-500">{formErrors.birthday}</p>
              )}
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Head>
        <title>註冊 - 多元商會員管理系統</title>
      </Head>
      <div className="min-h-screen flex">
        {/* 左側歡迎區塊 */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#003B6D] text-white">
          <div className="w-full flex flex-col items-center justify-center p-12">
            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
              <Image
                src="/logo.png"
                alt="多元商 Logo"
                width={120}
                height={120}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)'
                }}
                priority
                unoptimized
              />
            </div>
            <h1 className="text-4xl font-bold mb-2">歡迎您</h1>
            <h2 className="text-3xl font-bold mb-8">成為我們的夥伴</h2>
            <p className="text-lg text-center max-w-md opacity-80">
              共享知識、共想未來、共響事業
            </p>
          </div>
        </div>

        {/* 右側註冊表單 */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">開始使用</h2>
              <p className="mt-2 text-sm text-gray-600">
                已經有帳號了？{' '}
                <button
                  onClick={handleLogin}
                  className="text-blue-600 hover:text-blue-500"
                >
                  登入
                </button>
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* 進度指示器 */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    1
                  </div>
                  <div className="ml-2 text-sm font-medium text-gray-700">帳號設定</div>
                </div>
                <div className="flex-1 h-1 mx-4 bg-gray-200">
                  <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: `${step > 1 ? '100%' : '0%'}` }} />
                </div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    2
                  </div>
                  <div className="ml-2 text-sm font-medium text-gray-700">個人資料</div>
                </div>
              </div>
            </div>

            {/* Google 註冊按鈕 */}
            {step === 1 && (
              <>
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                      />
                    </svg>
                    使用 Google 帳號註冊
                  </button>
                </div>

                {/* 分隔線 */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">或</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
              {renderStepContent()}

              <div className="flex justify-between space-x-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    上一步
                  </button>
                )}
                <button
                  type={step === 2 ? 'submit' : 'button'}
                  onClick={step === 1 ? handleNext : undefined}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? '處理中...' : step === 1 ? '下一步' : '註冊'}
                </button>
              </div>
            </form>

            <div className="mt-4 text-sm text-gray-600">
              點擊「註冊」即表示您同意我們的
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 mx-1">
                服務條款
              </Link>
              和
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 mx-1">
                隱私政策
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Signup 