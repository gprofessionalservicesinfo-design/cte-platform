import {
  ClasificadorOutputSchema,
  ClasificadorOutput,
  ASSIGNED_ROUTES,
  COMPLEXITY_LEVELS,
} from './schema'

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(Number.isFinite(n) ? n : min, min), max)
}

function normalizeChecklistItem(item: unknown) {
  const i = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>
  return {
    code:              typeof i.code  === 'string' ? i.code  : 'item_unknown',
    label:             typeof i.label === 'string' ? i.label : typeof i.code === 'string' ? i.code : 'Sin etiqueta',
    required:          typeof i.required === 'boolean' ? i.required : false,
    status:            'pending'                     as const,
    generated_by:      'clasificador'                as const,
    checklist_version: 'clasificador-checklist-v1.0' as const,
    notes:             typeof i.notes === 'string' ? i.notes : null,
  }
}

export function normalizeClasificadorOutput(
  raw: unknown,
  fallbackCaseId: string
): { data: ClasificadorOutput; normalized: boolean; issues: string[] } {
  // Happy path: LLM output is valid
  const result = ClasificadorOutputSchema.safeParse(raw)
  if (result.success) return { data: result.data, normalized: false, issues: [] }

  // Fallback: best-effort normalization from partial object
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const confidence   = clamp(Number(o.confidence_score), 0, 1) || 0.4
  const rawDays      = Number(o.estimated_days)

  const validRoute = ASSIGNED_ROUTES.includes(o.assigned_route as typeof ASSIGNED_ROUTES[number])
    ? (o.assigned_route as ClasificadorOutput['assigned_route'])
    : 'llc_single_member_us'

  const validComplexity = COMPLEXITY_LEVELS.includes(o.complexity as typeof COMPLEXITY_LEVELS[number])
    ? (o.complexity as ClasificadorOutput['complexity'])
    : 'Medium'

  const data: ClasificadorOutput = {
    case_id:               typeof o.case_id === 'string' ? o.case_id : fallbackCaseId,
    assigned_route:        validRoute,
    complexity:            validComplexity,
    confidence_score:      confidence,
    upsells_eligible:      Array.isArray(o.upsells_eligible)
                            ? o.upsells_eligible.filter((u): u is string => typeof u === 'string')
                            : [],
    regulatory_risks:      Array.isArray(o.regulatory_risks)
                            ? o.regulatory_risks.filter((r): r is string => typeof r === 'string')
                            : [],
    requires_human_review: true, // fallback always flags for human review
    human_review_reason:   'Normalización aplicada — output del LLM no cumplió el schema',
    checklist_additions:   Array.isArray(o.checklist_additions)
                            ? o.checklist_additions.map(normalizeChecklistItem)
                            : [],
    estimated_days:        Number.isInteger(rawDays) && rawDays > 0 ? rawDays : 7,
    next_action:           typeof o.next_action === 'string' ? o.next_action : 'Revisión humana requerida',
    route_version:         'clasificador-v1.0',
  }

  const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
  return { data, normalized: true, issues }
}
