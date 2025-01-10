/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx'],
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['sum-crm.vercel.app', 'sum-nvutq547j-sums-projects-84746e7b.vercel.app']
    }
  }
}

export default nextConfig 