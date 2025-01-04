import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export function getGoogleAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  })
}

export async function verifyGoogleToken(token: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    return ticket.getPayload()
  } catch (error) {
    console.error('Google token verification failed:', error)
    return null
  }
}

export async function getGoogleTokens(code: string) {
  try {
    const { tokens } = await client.getToken(code)
    return tokens
  } catch (error) {
    console.error('Failed to get Google tokens:', error)
    return null
  }
} 