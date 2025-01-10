/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx'],
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['sum-crm.vercel.app']
    }
  }
}

export default nextConfig 