import type { MetadataRoute } from 'next'

const BASE_URL = 'https://creatuempresausa.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/`,
      priority: 1.0,
      changeFrequency: 'weekly',
    },
    {
      url: `${BASE_URL}/blog`,
      priority: 0.9,
      changeFrequency: 'weekly',
    },
    {
      url: `${BASE_URL}/blog/llc-en-usa-guia-completa`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/como-elegir-estado-para-tu-llc`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/ein-para-extranjeros`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/impuestos-llc-extranjeros`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/abrir-cuenta-bancaria-usa`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
  ]
}
