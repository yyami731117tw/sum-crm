export const AUTH_ERRORS = {
  // 登入相關錯誤
  invalid_credentials: '信箱或密碼錯誤',
  account_disabled: '您的帳號已被停用，請聯繫管理員',
  account_pending: '您的帳號正在審核中，請耐心等待',
  email_not_verified: '請先驗證您的電子郵件',
  session_expired: '登入已過期，請重新登入',
  unauthorized: '請先登入後再繼續',
  
  // 註冊相關錯誤
  email_exists: '此信箱已被註冊',
  phone_exists: '此電話號碼已被註冊',
  invalid_email: '請輸入有效的電子郵件地址',
  invalid_phone: '請輸入有效的手機號碼',
  invalid_password: '密碼需要至少包含8個字符，並包含字母和數字',
  passwords_not_match: '兩次輸入的密碼不一致',
  verification_failed: '驗證碼無效或已過期',
  
  // Google 登入相關錯誤
  google_auth_failed: 'Google 登入失敗，請重試',
  google_email_not_verified: '您的 Google 帳號尚未驗證電子郵件',
  
  // 權限相關錯誤
  permission_denied: '您沒有權限執行此操作',
  role_required: '需要特定角色權限',
  
  // 一般錯誤
  network_error: '網路連線異常，請稍後再試',
  server_error: '系統發生錯誤，請稍後再試',
  unknown_error: '發生未知錯誤，請重試'
} as const

export const FORM_ERRORS = {
  required: '此欄位為必填',
  email: '請輸入有效的電子郵件地址',
  phone: '請輸入有效的手機號碼',
  password: {
    length: '密碼長度需要至少8個字符',
    format: '密碼需要包含字母和數字',
    match: '兩次輸入的密碼不一致'
  },
  name: {
    length: '姓名長度需要在2-50個字符之間',
    format: '姓名只能包含中文、英文、數字和空格'
  },
  date: '請輸入有效的日期',
  future_date: '日期不能晚於今天'
} as const

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // 如果是已知的錯誤類型，直接返回錯誤訊息
    return error.message
  }
  
  if (typeof error === 'string') {
    // 如果是字串，檢查是否為已定義的錯誤代碼
    const authError = AUTH_ERRORS[error as keyof typeof AUTH_ERRORS]
    if (authError) {
      return authError
    }
    return error
  }
  
  // 如果是其他類型，返回通用錯誤訊息
  return AUTH_ERRORS.unknown_error
} 