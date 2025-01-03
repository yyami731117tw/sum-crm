import Cookies from 'js-cookie'
import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
const COOKIE_NAME = 'token'

export interface UserSession {
  id: string
  email: string
  name: string
  role: string
  status: string
  nickname?: string | null
  phone?: string | null
  lineId?: string | null
  address?: string | null
  birthday?: string | null
  image?: string | null
  googleId?: string
}

export async function createSession(user: UserSession) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  // 設置 cookie
  Cookies.set(COOKIE_NAME, token, {
    expires: 1, // 1天
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  return token
}

export async function getSession(): Promise<UserSession | null> {
  const token = Cookies.get(COOKIE_NAME)

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const session = payload as unknown as UserSession

    // 驗證會話數據的完整性
    if (!isValidSession(session)) {
      throw new Error('Invalid session data')
    }

    return session
  } catch (error) {
    clearSession()
    return null
  }
}

export function clearSession() {
  Cookies.remove(COOKIE_NAME, { path: '/' })
}

// 驗證會話數據是否包含所有必要字段
function isValidSession(session: any): session is UserSession {
  return (
    typeof session === 'object' &&
    typeof session.id === 'string' &&
    typeof session.email === 'string' &&
    typeof session.name === 'string' &&
    typeof session.role === 'string' &&
    (session.picture === undefined || typeof session.picture === 'string') &&
    (session.googleId === undefined || typeof session.googleId === 'string')
  )
} 