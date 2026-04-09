import type { StateData } from './state-data'

// ── Business profiles ────────────────────────────────────────────────────────

export interface StateRec {
  slug: string        // 'florida' | 'texas' | 'wyoming' | 'delaware' | 'new-mexico'
  name: string
  badge?: string      // 'Mejor opción' | 'Más popular' | undefined
  why: string         // one-sentence rationale
  hasPage: boolean    // whether /llc/[slug] exists
  ctaLabel?: string   // override default CTA text when hasPage is false
}

export interface BusinessProfile {
  id: string
  label: string
  description: string
  recs: StateRec[]
}

export const PROFILES: BusinessProfile[] = [
  {
    id: 'extranjero',
    label: 'Soy extranjero / no resido en EE.UU.',
    description: 'Vivo fuera y quiero una empresa en EE.UU.',
    recs: [
      { slug: 'wyoming', name: 'Wyoming', badge: 'Mejor opción', why: 'Privacidad, costo mínimo y cero impuesto estatal. Ideal para operar sin presencia física.', hasPage: true },
      { slug: 'florida', name: 'Florida', why: 'Hub de negocios latinos. Excelente si tienes clientes o socios en América Latina.', hasPage: true },
      { slug: 'texas', name: 'Texas', why: 'Sin impuesto estatal sobre la renta y mercado enorme. Buena opción si planeas escalar.', hasPage: true },
    ],
  },
  {
    id: 'freelancer',
    label: 'Freelancer / consultor / agencia',
    description: 'Vendo servicios profesionales a clientes.',
    recs: [
      { slug: 'wyoming', name: 'Wyoming', badge: 'Más popular', why: 'Mínima burocracia, costo bajo y privacidad. Perfecto para servicios profesionales sin sede física.', hasPage: true },
      { slug: 'florida', name: 'Florida', why: 'Ideal si tus clientes están en Latinoamérica o el mercado hispano de EE.UU.', hasPage: true },
    ],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce / Amazon / tienda online',
    description: 'Vendo productos físicos o digitales en línea.',
    recs: [
      { slug: 'wyoming', name: 'Wyoming', badge: 'Mejor opción', why: 'Sin impuesto estatal, bajo mantenimiento. Ideal para vender online sin nexo fiscal complejo.', hasPage: true },
      { slug: 'florida', name: 'Florida', why: 'Hub logístico con puertos internacionales. Buena opción si importas desde Latinoamérica.', hasPage: true },
      { slug: 'texas', name: 'Texas', why: 'Sin impuesto estatal y acceso a la mayor red de warehouses de EE.UU.', hasPage: true },
    ],
  },
  {
    id: 'startup',
    label: 'Startup / potencial de inversión',
    description: 'Mi negocio podría levantar capital externo.',
    recs: [
      { slug: 'delaware', name: 'Delaware', badge: 'Estándar del sector', why: 'El 90% de las startups con fondeo VC se forman en Delaware. Es lo que los inversionistas esperan.', hasPage: false },
      { slug: 'texas', name: 'Texas', why: 'Sin impuesto estatal y ecosistema de startups creciente en Austin y Dallas.', hasPage: true },
      { slug: 'wyoming', name: 'Wyoming', why: 'Para validar antes de formalizar en Delaware. Opción económica en etapa pre-seed.', hasPage: true },
    ],
  },
  {
    id: 'fisico',
    label: 'Negocio con presencia física en EE.UU.',
    description: 'Tengo o planeo tener local, empleados u operaciones físicas.',
    recs: [
      { slug: 'florida', name: 'Florida', badge: 'Recomendado', why: 'Si tu operación física estará en Florida o el sureste, formar aquí evita la foreign qualification.', hasPage: true },
      { slug: 'texas', name: 'Texas', why: 'El mercado más grande de EE.UU. sin impuesto estatal. Ideal para retail, restaurantes o distribución.', hasPage: true },
    ],
  },
  {
    id: 'holding',
    label: 'Holding / protección de activos / bajo mantenimiento',
    description: 'Quiero una estructura patrimonial o de bajo costo fijo.',
    recs: [
      { slug: 'wyoming', name: 'Wyoming', badge: 'Mejor opción', why: 'Privacidad de socios, protección de activos líder en EE.UU. y Annual Report de solo $60.', hasPage: true },
      { slug: 'new-mexico', name: 'New Mexico', why: 'No requiere Annual Report. La opción de menor costo de mantenimiento del país.', hasPage: false },
    ],
  },
  {
    id: 'digital',
    label: 'Coach / creador / servicios digitales',
    description: 'Cursos, contenido, membresías o servicios remotos.',
    recs: [
      { slug: 'wyoming', name: 'Wyoming', badge: 'Más popular', why: 'Sin complicaciones operativas. El mejor estado para negocios 100% digitales y creadores de contenido.', hasPage: true },
      { slug: 'florida', name: 'Florida', why: 'Excelente si tu audiencia está en el mercado latinoamericano o hispanohablante de EE.UU.', hasPage: true },
    ],
  },
  {
    id: 'importacion',
    label: 'Importación / exportación / comercio internacional',
    description: 'Compro o vendo mercancía entre países.',
    recs: [
      { slug: 'florida', name: 'Florida', badge: 'Recomendado', why: 'Puertos en Miami y Tampa, conexión directa con Latinoamérica. El hub natural de comercio internacional para latinos.', hasPage: true },
      { slug: 'texas', name: 'Texas', why: 'Frontera con México y los puertos de Houston. Ideal para comercio con México y Centroamérica.', hasPage: true },
    ],
  },
  {
    id: 'tradicional',
    label: 'Restaurante / retail / negocio físico tradicional',
    description: 'Negocio con local, empleados y clientes presenciales.',
    recs: [
      { slug: 'florida', name: 'Florida', why: 'Turismo activo, comunidad latina grande y mercado de consumo fuerte. Ideal para restaurantes y retail.', hasPage: true },
      { slug: 'texas', name: 'Texas', why: 'El mayor mercado de consumo de EE.UU. sin impuesto estatal sobre la renta. Ideal para expansión.', hasPage: true },
    ],
  },
  {
    id: 'economico',
    label: 'Quiero la opción más simple y económica',
    description: 'Prioridad: bajo costo, mínima burocracia.',
    recs: [
      { slug: 'wyoming', name: 'Wyoming', badge: 'Mejor opción', why: 'State fee $100, Annual Report $60/año. El mínimo real de costo operativo en EE.UU.', hasPage: true },
      { slug: 'new-mexico', name: 'New Mexico', why: 'State fee bajo y sin Annual Report. La opción de menor costo total de mantenimiento.', hasPage: false },
    ],
  },
]

// ── Comparison table data ─────────────────────────────────────────────────────

export interface ComparisonState {
  name: string
  slug: string
  idealFor: string
  stateFee: string
  maintenance: string
  popularAmong: string
  complexity: 'Muy baja' | 'Baja' | 'Media' | 'Alta'
  hasPage: boolean
}

export const COMPARISON_STATES: ComparisonState[] = [
  {
    name: 'Wyoming',
    slug: 'wyoming',
    idealFor: 'Digital, holding, privacidad',
    stateFee: '$100',
    maintenance: '~$60/año',
    popularAmong: 'Negocios 100% online, no residentes',
    complexity: 'Muy baja',
    hasPage: true,
  },
  {
    name: 'Florida',
    slug: 'florida',
    idealFor: 'E-commerce, servicios, clientes latinos',
    stateFee: '$125',
    maintenance: '$138.75/año',
    popularAmong: 'Emprendedores latinoamericanos',
    complexity: 'Baja',
    hasPage: true,
  },
  {
    name: 'Texas',
    slug: 'texas',
    idealFor: 'Escala, importación, B2B',
    stateFee: '$300',
    maintenance: '~$0 (Franchise Tax)',
    popularAmong: 'Negocios con operaciones en México',
    complexity: 'Media',
    hasPage: true,
  },
  {
    name: 'Delaware',
    slug: 'delaware',
    idealFor: 'Startups con inversión externa',
    stateFee: '$90',
    maintenance: '$300+/año',
    popularAmong: 'Founders que buscan VC o angels',
    complexity: 'Alta',
    hasPage: false,
  },
  {
    name: 'New Mexico',
    slug: 'new-mexico',
    idealFor: 'Holding, privacidad, bajo costo',
    stateFee: '~$50',
    maintenance: 'Sin annual report',
    popularAmong: 'Estructuras holding, privacidad total',
    complexity: 'Muy baja',
    hasPage: false,
  },
]

// ── Featured state cards (have full pages) ───────────────────────────────────

export const FEATURED_STATES = [
  {
    slug: 'florida',
    name: 'Florida',
    abbr: 'FL',
    tagline: 'El hub de negocios hispano en EE.UU.',
    highlight: 'Sin impuesto estatal · Hub latino · Conexión LATAM',
    bestFor: 'E-commerce · Servicios · Importación',
  },
  {
    slug: 'texas',
    name: 'Texas',
    abbr: 'TX',
    tagline: 'La mayor economía sin impuesto sobre la renta.',
    highlight: 'Sin income tax · Mercado enorme · Frontera con México',
    bestFor: 'Escala · B2B · Importación y exportación',
  },
  {
    slug: 'wyoming',
    name: 'Wyoming',
    abbr: 'WY',
    tagline: 'Privacidad, bajo costo y mínima burocracia.',
    highlight: 'Annual Report $60 · Privacidad total · Sin income tax',
    bestFor: 'Digital · Holding · No residentes',
  },
]
