/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: [],
  async rewrites() {
    return [
      { source: '/', destination: '/landing_production.html' },
    ]
  },
}

module.exports = nextConfig
