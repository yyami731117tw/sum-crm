/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  images: {
    domains: ['sum-crm.vercel.app'],
    unoptimized: true
  },
  // 生產環境配置
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://sum-crm.vercel.app'
  },
  // 構建配置
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // 輸出配置
  output: 'standalone',
  async redirects() {
    return []
  }
}

module.exports = nextConfig 