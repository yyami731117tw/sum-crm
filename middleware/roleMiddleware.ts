import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export function withRole(role: string | string[]) {
  return async function(req: NextRequest) {
    const session = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!session?.role) {
      return new NextResponse(
        JSON.stringify({ message: '未授權訪問' }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const roles = Array.isArray(role) ? role : [role]
    if (!roles.includes(session.role)) {
      return new NextResponse(
        JSON.stringify({ message: '權限不足' }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    return NextResponse.next()
  }
} 