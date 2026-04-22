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
      // www → non-www canonical
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.creatuempresausa.com' }],
        destination: 'https://creatuempresausa.com/:path*',
        permanent: true,
      },
      // Legal page consolidation — preserve SEO juice from old URL
      { source: '/aviso-legal', destination: '/legal/disclaimer', permanent: true },
      // Legacy blog URL redirects — recover SEO juice
      { source: '/blog/abrir-cuenta-bancaria-usa',           destination: '/blog/abrir-cuenta-bancaria-usa-sin-ssn',              permanent: true },
      { source: '/blog/como-elegir-estado-para-tu-llc',      destination: '/blog/mejor-estado-para-abrir-llc-extranjero',         permanent: true },
      { source: '/blog/ein-para-extranjeros',                destination: '/blog/sacar-ein-sin-ssn',                              permanent: true },
      { source: '/blog/impuestos-llc-extranjeros',           destination: '/blog/impuestos-llc-no-residentes',                    permanent: true },
      { source: '/blog/llc-en-usa-guia-completa',            destination: '/blog/abrir-llc-en-usa-desde-mexico',                  permanent: true },
    ]
  },
  async rewrites() {
    return [
      { source: '/', destination: '/landing_production.html' },
    ]
  },
}

module.exports = nextConfig
