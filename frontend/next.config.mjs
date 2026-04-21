import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
