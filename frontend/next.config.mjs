/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    proxyTimeout: 300000, // 5 minutes to prevent 500 errors on long research pipeline runs
  },
}

export default nextConfig
