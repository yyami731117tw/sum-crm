/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  images: {
    domains: ['sum-crm.vercel.app', 'localhost'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_BASE_URL: 'https://sum-crm.vercel.app'
  }
}

module.exports = nextConfig 