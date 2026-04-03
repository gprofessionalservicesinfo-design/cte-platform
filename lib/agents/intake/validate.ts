import { IntakeOutputSchema, IntakeOutput } from './schema'

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(Number.isFinite(n) ? n : min, min), max)
}

function normalizeChecklistItem(item: unknown) {
  const i = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>
  return {
    code:              typeof i.code  === 'string' ? i.code  : 'item_unknown',
    label:             typeof i.label === 'string' ? i.label : typeof i.code === 'string' ? i.code : 'Sin etiqueta',
    required:          typeof i.required === 'boolean' ? i.required : false,
    status:            'pending'               as const,
    generated_by:      'intake'                as const,
    checklist_version: 'intake-checklist-v1.0' as const,
    notes:             typeof i.notes === 'string' ? i.notes : null,
  }
}

export function normalizeIntakeOutput(
  raw: unknown,
  fallbackCaseId: string
): { data: IntakeOutput; normalized: boolean; issues: string[] } {
  // Happy path: LLM output is valid
  const result = IntakeOutputSchema.safeParse(raw)
  if (result.success) return { data: result.data, normalized: false, issues: [] }

  // Fallback: best-effort normalization from partial object
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  const c = (typeof o.cliente === 'object' && o.cliente !== null ? o.cliente : {}) as Record<string, unknown>

  const confidence  = clamp(Number(o.confidence_score), 0, 1) || 0.4
  const score       = clamp(Math.round(Number(o.intake_score)), 1, 10) || 5
  const missingData = !c.email || !c.nombre

  const validFamilies = ['LLC_Formation','Corporation_Formation','EIN_Only','Registered_Agent','Compliance','Other']

  const data: IntakeOutput = {
    case_id:               typeof o.case_id === 'string' ? o.case_id : fallbackCaseId,
    cliente: {
      nombre:           typeof c.nombre === 'string' && c.nombre ? c.nombre : 'Desconocido',
      email:            typeof c.email  === 'string' && c.email  ? c.email  : '',
      telefono:         typeof c.telefono === 'string' ? c.telefono : null,
      idioma_preferido: typeof c.idioma_preferido === 'string' ? c.idioma_preferido : 'es',
      pais_origen:      typeof c.pais_origen === 'string' ? c.pais_origen : null,
      estado_objetivo:  typeof c.estado_objetivo === 'string' ? c.estado_objetivo : null,
    },
    servicio_solicitado:   typeof o.servicio_solicitado === 'string' ? o.servicio_solicitado : 'unknown',
    service_family:        validFamilies.includes(o.service_family as string)
                            ? (o.service_family as IntakeOutput['service_family'])
                            : 'Other',
    intake_score:          score,
    score_reasoning:       typeof o.score_reasoning === 'string'
                            ? o.score_reasoning
                            : 'Generado por fallback — revisar manualmente',
    checklist_inicial:     Array.isArray(o.checklist_inicial) && o.checklist_inicial.length > 0
                            ? o.checklist_inicial.map(normalizeChecklistItem)
                            : [{
                                code: 'review_required', label: 'Revisión manual requerida',
                                required: true, status: 'pending', generated_by: 'intake',
                                checklist_version: 'intake-checklist-v1.0', notes: null,
                              }],
    siguiente_accion:      typeof o.siguiente_accion === 'string'
                            ? o.siguiente_accion
                            : 'Revisión humana requerida',
    requires_human_review: true, // fallback always flags for human review
    human_review_reason:   `Normalización aplicada — output del LLM no cumplió el schema${missingData ? ' + datos críticos faltantes' : ''}`,
    confidence_score:      confidence,
  }

  const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
  return { data, normalized: true, issues }
}
