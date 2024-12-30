/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['tsx', 'ts'],
  env: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV
  },
  // 配置模塊解析
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  }
}

module.exports = nextConfig 