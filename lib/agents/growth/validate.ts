import {
  GrowthOutputSchema,
  GrowthOutput,
  ContentItem,
  CONTENT_TYPES,
  PLATFORMS,
} from './schema'

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(Number.isFinite(n) ? n : min, min), max)
}

// Minimum content calendar size enforced post-parse.
const CALENDAR_MIN = 6

// Generate placeholder content items when LLM returns fewer than CALENDAR_MIN.
function makeCalendarPlaceholder(index: number, weekStart: string): ContentItem {
  return {
    content_id:     `${weekStart}-placeholder-${String(index).padStart(3, '0')}`,
    type:           'reel',
    title:          `Contenido pendiente de revisión ${index}`,
    hook:           '¿Sabías que puedes abrir tu empresa en EE.UU. desde cualquier país?',
    cta:            'Escríbenos por WhatsApp para empezar.',
    target_country: 'México',
    target_service: 'LLC Extranjero',
    platform:       'instagram',
    status:         'planned',
    scheduled_date: null,
  }
}

// Hard business rules enforced post-parse
function applyGrowthRules(data: GrowthOutput): GrowthOutput {
  let { content_calendar, geo_priority, service_priority } = data

  // Rule 1: calendar must have at least 6 items
  if (content_calendar.length < CALENDAR_MIN) {
    console.warn(
      `[growth/validate] Calendar has ${content_calendar.length} items — padding to ${CALENDAR_MIN}`
    )
    const needed = CALENDAR_MIN - content_calendar.length
    for (let i = 0; i < needed; i++) {
      content_calendar = [
        ...content_calendar,
        makeCalendarPlaceholder(content_calendar.length + 1, data.week_start),
      ]
    }
  }

  // Rule 2: geo_priority must be non-empty
  if (geo_priority.length === 0) {
    geo_priority = [{
      country:        'México',
      priority_score: 5,
      top_service:    'LLC Extranjero',
      reasoning:      'Fallback — geo_priority estaba vacío en el output del LLM',
    }]
  }

  // Rule 3: service_priority must be non-empty
  if (service_priority.length === 0) {
    service_priority = [{
      service:         'LLC Extranjero',
      priority_score:  5,
      trend_direction: 'stable',
      reasoning:       'Fallback — service_priority estaba vacío en el output del LLM',
    }]
  }

  return { ...data, content_calendar, geo_priority, service_priority }
}

export function normalizeGrowthOutput(
  raw:               unknown,
  fallbackWeekStart: string
): { data: GrowthOutput; normalized: boolean; issues: string[] } {
  // Happy path: validate then apply rules
  const result = GrowthOutputSchema.safeParse(raw)
  if (result.success) {
    return { data: applyGrowthRules(result.data), normalized: false, issues: [] }
  }

  // Fallback: best-effort normalization from partial object
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const safeArray = (val: unknown) => Array.isArray(val) ? val : []

  // Salvage content_calendar items that have at minimum content_id + title
  const rawCalendar = safeArray(o.content_calendar)
  const calendar: ContentItem[] = rawCalendar
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null &&
        typeof (item as Record<string, unknown>).content_id === 'string'
    )
    .map((item, idx) => ({
      content_id:     String(item.content_id),
      type:           CONTENT_TYPES.includes(item.type as typeof CONTENT_TYPES[number])
                        ? (item.type as ContentItem['type'])
                        : 'reel',
      title:          typeof item.title    === 'string' ? item.title    : `Contenido ${idx + 1}`,
      hook:           typeof item.hook     === 'string' ? item.hook     : '',
      cta:            typeof item.cta      === 'string' ? item.cta      : '',
      target_country: typeof item.target_country === 'string' ? item.target_country : 'México',
      target_service: typeof item.target_service === 'string' ? item.target_service : 'LLC Extranjero',
      platform:       PLATFORMS.includes(item.platform as typeof PLATFORMS[number])
                        ? (item.platform as ContentItem['platform'])
                        : 'instagram',
      status:         'planned',
      scheduled_date: typeof item.scheduled_date === 'string' ? item.scheduled_date : null,
    }))

  const data: GrowthOutput = {
    week_start:                     typeof o.week_start === 'string' ? o.week_start : fallbackWeekStart,
    geo_priority:                   safeArray(o.geo_priority)     as GrowthOutput['geo_priority'],
    service_priority:               safeArray(o.service_priority) as GrowthOutput['service_priority'],
    keyword_clusters:               safeArray(o.keyword_clusters) as GrowthOutput['keyword_clusters'],
    content_calendar:               calendar,
    landing_page_recommendations:   safeArray(o.landing_page_recommendations) as GrowthOutput['landing_page_recommendations'],
    master_recommendation:          typeof o.master_recommendation === 'string'
                                      ? o.master_recommendation
                                      : 'Reporte normalizado — output del LLM incompleto.',
    organic_cost_per_lead_estimate: typeof o.organic_cost_per_lead_estimate === 'number'
                                      ? clamp(o.organic_cost_per_lead_estimate, 0, 1_000_000)
                                      : null,
    growth_version:                 'growth-v1.0',
  }

  const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
  // Apply rules on the fallback data too (calendar padding, empty arrays)
  return { data: applyGrowthRules(data), normalized: true, issues }
}
