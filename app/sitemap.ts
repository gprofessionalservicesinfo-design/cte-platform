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
      url: `${BASE_URL}/blog/abrir-llc-en-usa-desde-mexico`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/mejor-estado-para-abrir-llc-extranjero`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/sacar-ein-sin-ssn`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/abrir-cuenta-bancaria-usa-sin-ssn`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/impuestos-llc-no-residentes`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/llc-anonima-new-mexico`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/abrir-cuenta-mercury-bank-extranjero`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/form-5472-irs-espanol`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/alternativas-stripe-atlas`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
    {
      url: `${BASE_URL}/blog/como-sacar-itin-desde-tu-pais`,
      priority: 0.8,
      changeFrequency: 'monthly',
    },
  ]
}
