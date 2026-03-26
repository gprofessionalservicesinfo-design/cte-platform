// ─── Billing constants ────────────────────────────────────────────────────────
// Single source of truth for plans and add-ons across the dashboard.

export const PACKAGE_LABELS: Record<string, string> = {
  starter:      'Plan Starter',
  professional: 'Plan Professional',
  premium:      'Plan Premium',
}

export const PACKAGE_COLORS: Record<string, string> = {
  starter:      'bg-slate-100 text-slate-700',
  professional: 'bg-blue-100 text-blue-700',
  premium:      'bg-violet-100 text-violet-700',
}

// Add-on catalog — prices must stay in sync with pricing-config.js on the
// marketing site. `included_in` lists package IDs where this is already bundled.
export const ADDONS = [
  {
    id:           'ein',
    label:        'EIN Application',
    description:  'IRS EIN obtención para tu LLC. Tramitamos el formulario SS-4.',
    price:        99,
    period:       '',
    included_in:  ['professional', 'premium'],
    wa_msg:       'Hola, quiero agregar la Tramitación de EIN ($99) a mi orden.',
    icon:         'hash',
  },
  {
    id:           'reg_agent',
    label:        'Registered Agent',
    description:  'Renovación anual del agente registrado en tu estado.',
    price:        99,
    period:       '/año',
    included_in:  [],
    wa_msg:       'Hola, quiero renovar mi Registered Agent ($99/año).',
    icon:         'shield',
  },
  {
    id:           'op_agreement',
    label:        'Operating Agreement',
    description:  'Acuerdo operativo personalizado para tu LLC.',
    price:        79,
    period:       '',
    included_in:  ['professional', 'premium'],
    wa_msg:       'Hola, necesito un Operating Agreement completo ($79).',
    icon:         'file-text',
  },
  {
    id:           'virtual_addr',
    label:        'Dirección Virtual USA',
    description:  'Dirección comercial en EE.UU. para correspondencia oficial.',
    price:        99,
    period:       '/año',
    included_in:  ['premium'],
    wa_msg:       'Hola, quiero agregar una Dirección Virtual en EE.UU. ($99/año).',
    icon:         'map-pin',
  },
  {
    id:           'banking',
    label:        'Asesoría Bancaria',
    description:  'Apertura de cuenta Mercury o Relay para tu LLC.',
    price:        79,
    period:       '',
    included_in:  ['professional', 'premium'],
    wa_msg:       'Hola, quiero asesoría para abrir una cuenta bancaria para mi LLC ($79).',
    icon:         'landmark',
  },
  {
    id:           'itin',
    label:        'Asistencia ITIN',
    description:  'Solicitud de ITIN (Individual Tax ID) ante el IRS.',
    price:        149,
    period:       '',
    included_in:  [],
    wa_msg:       'Hola, necesito asistencia para obtener mi ITIN ($149).',
    icon:         'user-check',
  },
  {
    id:           'annual_report',
    label:        'Annual Report Filing',
    description:  'Presentación del reporte anual ante el estado.',
    price:        79,
    period:       '',
    included_in:  [],
    wa_msg:       'Hola, necesito que gestionen mi Annual Report este año ($79).',
    icon:         'calendar-check',
  },
  {
    id:           'cert_copy',
    label:        'Copia Certificada',
    description:  'Copia certificada de tus documentos de formación.',
    price:        49,
    period:       '',
    included_in:  [],
    wa_msg:       'Hola, necesito una Copia Certificada de mis documentos ($49).',
    icon:         'stamp',
  },
] as const

export type AddonId = (typeof ADDONS)[number]['id']

export const WHATSAPP_NUMBER = '19046248859'

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

// Format Stripe amount (cents → dollars)
export function formatAmount(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100)
}

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  paid:           'Pagado',
  open:           'Pendiente',
  draft:          'Borrador',
  void:           'Anulado',
  uncollectible:  'Incobrable',
}

export const INVOICE_STATUS_COLOR: Record<string, string> = {
  paid:           'bg-green-100 text-green-700',
  open:           'bg-yellow-100 text-yellow-700',
  draft:          'bg-gray-100 text-gray-500',
  void:           'bg-gray-100 text-gray-400 line-through',
  uncollectible:  'bg-red-100 text-red-700',
}
