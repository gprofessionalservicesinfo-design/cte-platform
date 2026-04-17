/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Keep pdfkit out of the webpack bundle so it can resolve its own
  // built-in AFM font files at runtime on Vercel (Lambda layer).
  serverExternalPackages: ['pdfkit'],
  async rewrites() {
    return [
      { source: '/', destination: '/landing_production.html' },
    ]
  },
}

module.exports = nextConfig
