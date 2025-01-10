/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx'],
  output: 'standalone',
  experimental: {
    serverActions: true,
  }
}

export default nextConfig 