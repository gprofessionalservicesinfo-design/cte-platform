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
      // /wizard → SPA checkout funnel in public/index_final.html
      { source: '/wizard', destination: '/index_final.html?page=wizard', permanent: false },
      // Legacy SPA (?page=*) — escape hatch to new Next.js routes
      // NOTE: ?page=wizard is intentionally NOT redirected — static file must be reachable
      // because plan buttons on the landing call /index_final.html?page=wizard&plan=X
      // and that SPA posts to /api/stripe/create-checkout-public.
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
