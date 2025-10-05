import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint validation
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript validation
  },
  images: {
    domains: [
      'localhost',
      'youtube.com',
      'www.youtube.com',
      'youtu.be',
      'drive.google.com',
      'i.ytimg.com',
      'img.youtube.com'
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  outputFileTracingRoot: __dirname,
}

export default nextConfig
