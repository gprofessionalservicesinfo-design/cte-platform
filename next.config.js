/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: [],
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.creatuempresausa.com' }],
        destination: 'https://creatuempresausa.com/:path*',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      { source: '/', destination: '/landing_production.html' },
    ]
  },
}

module.exports = nextConfig
