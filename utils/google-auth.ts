import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture: string
  verified_email: boolean
}

export async function getGoogleAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
    prompt: 'consent'
  })
}

export async function getGoogleUserInfo(code: string): Promise<GoogleUserInfo> {
  const { tokens } = await client.getToken(code)
  client.setCredentials(tokens)

  const response = await fetch(
    'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch user info from Google')
  }

  return response.json()
} 