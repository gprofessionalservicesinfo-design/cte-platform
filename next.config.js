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
      // /wizard → conversion funnel (MarketingNav links here)
      { source: '/wizard', destination: '/oferta', permanent: false },
      // Legacy SPA (?page=*) — escape hatch to new Next.js routes
      // Query-string rules must come before the bare /index_final.html rule
      { source: '/index_final.html', has: [{ type: 'query', key: 'page', value: 'wizard' }],      destination: '/oferta', permanent: true },
      { source: '/index_final.html', has: [{ type: 'query', key: 'page', value: 'blog' }],        destination: '/blog',   permanent: true },
      { source: '/index_final.html', has: [{ type: 'query', key: 'page', value: 'guias' }],       destination: '/blog',   permanent: true },
      { source: '/index_final.html', has: [{ type: 'query', key: 'page', value: 'servicios' }],   destination: '/',       permanent: true },
      { source: '/index_final.html', has: [{ type: 'query', key: 'page', value: 'precios' }],     destination: '/',       permanent: true },
      { source: '/index_final.html', has: [{ type: 'query', key: 'page', value: 'testimonios' }], destination: '/',       permanent: true },
      { source: '/index_final.html', has: [{ type: 'query', key: 'page', value: 'faq' }],         destination: '/',       permanent: true },
      { source: '/index_final.html', has: [{ type: 'query', key: 'page', value: 'contacto' }],    destination: '/',       permanent: true },
      // Bare /index_final.html (no query string) → home
      { source: '/index_final.html', destination: '/', permanent: true },
    ]
  },
  // No rewrites needed — app/page.tsx serves the home page directly
  // extracting content from landing_production.html at build time.
}

module.exports = nextConfig
