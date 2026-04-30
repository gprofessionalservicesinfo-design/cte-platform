export interface UnsplashPhoto {
  id: string
  urls: { regular: string; small: string }
  alt_description: string | null
  description: string | null
  user: {
    name: string
    links: { html: string }
  }
}

// Maps common Spanish blog keywords → English Unsplash queries that return good results
const KEYWORD_PATTERNS: [RegExp, string][] = [
  [/5472|irs.*multa|multa.*irs/i,             'IRS tax compliance documents penalty business'],
  [/form\s*5472/i,                             'IRS tax form foreign business documents'],
  [/\bein\b/i,                                 'business registration government documents USA'],
  [/llc.*forma|forma.*llc|abrir.*llc|crear.*llc/i, 'LLC business formation entrepreneur startup'],
  [/cuenta bancaria|bank.*account/i,           'business bank account finance entrepreneur'],
  [/mercury|banking.*usa|cuenta.*usa/i,        'online business bank account fintech'],
  [/impuesto|tax.*llc|llc.*tax|fiscal/i,       'business taxes accounting finance documents'],
  [/\bitin\b/i,                                'tax identification document USA government'],
  [/stripe|alternativa.*pago|plataforma.*pago/i, 'online payment startup business technology'],
  [/new mexico|wyoming|delaware.*llc/i,        'USA state government business registration'],
  [/no residente|extranjero|foreign.*owner/i,  'international business entrepreneur global'],
  [/privacidad|anon|privacy/i,                 'business privacy protection security'],
  [/compliance|cumplimiento|sancion/i,         'business compliance legal documents USA'],
  [/agente registrado|registered agent/i,      'business legal agent documents office'],
  [/llc\b/i,                                   'LLC business formation documents USA'],
]

const CATEGORY_FALLBACKS: Record<string, string> = {
  'Formación LLC':  'business formation entrepreneur USA startup',
  'Compliance':     'business compliance legal documents USA',
  'Legal & Compliance': 'business legal compliance documents',
  'EIN':            'business registration documents USA government',
  'Banca USA':      'business bank account finance USA',
  'Impuestos':      'business taxes accounting USA',
  'ITIN':           'tax identification document USA',
  'Privacidad':     'privacy anonymous business protection',
  'Comparativa':    'business comparison research entrepreneur',
  'Elegir Estado':  'USA state map business formation',
  'Mercury Bank':   'online business bank account fintech',
}

function buildQuery(keyword: string, focusKeyword: string, category: string): string {
  const combined = `${keyword} ${focusKeyword} ${category}`
  for (const [pattern, query] of KEYWORD_PATTERNS) {
    if (pattern.test(combined)) return query
  }
  return CATEGORY_FALLBACKS[category] ?? 'entrepreneur business startup USA professional'
}

export async function fetchArticleImages(
  keyword: string,
  focusKeyword: string,
  category: string,
  count = 5
): Promise<UnsplashPhoto[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey || accessKey.startsWith('your_')) return []

  const query = buildQuery(keyword, focusKeyword, category)
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&content_filter=high`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 86400 },
    })
    if (!res.ok) {
      console.error(`[unsplash] ${res.status} — query: "${query}"`)
      return []
    }
    const data = await res.json()
    return (data.results ?? []) as UnsplashPhoto[]
  } catch (err) {
    console.error('[unsplash] fetch failed:', err)
    return []
  }
}
