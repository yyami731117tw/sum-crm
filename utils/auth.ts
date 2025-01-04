import Cookies from 'js-cookie'
import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
const COOKIE_NAME = 'token'

export interface UserSession {
  id: string
  email: string
  name: string
  image: string
  role: string
  googleId: string
}

export async function createSession(user: UserSession) {
  return await prisma.userSession.create({
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      googleId: user.googleId
    }
  })
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