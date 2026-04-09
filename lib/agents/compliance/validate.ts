import {
  ComplianceOutputSchema,
  ComplianceOutput,
  COMPLIANCE_RISK_LEVELS,
} from './schema'

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(Number.isFinite(n) ? n : min, min), max)
}

// Hard business rules enforced post-parse — these override LLM decisions
// where the contract requires deterministic behaviour.
function applyBusinessRules(data: ComplianceOutput): ComplianceOutput {
  let { requires_human_review, human_review_reason } = data

  // Rule 1: critical risk always escalates to human review
  if (data.compliance_risk_level === 'critical') {
    requires_human_review = true
    human_review_reason   = human_review_reason ?? 'Riesgo de cumplimiento crítico detectado'
  }

  // Rule 2: low confidence always escalates
  if (data.confidence_score < 0.75) {
    requires_human_review = true
    human_review_reason   = human_review_reason
      ?? `Confianza insuficiente (${data.confidence_score.toFixed(2)} — mínimo requerido: 0.75)`
  }

  return { ...data, requires_human_review, human_review_reason }
}

export function normalizeComplianceOutput(
  raw:            unknown,
  fallbackCaseId: string
): { data: ComplianceOutput; normalized: boolean; issues: string[] } {
  // Happy path: validate then apply rules
  const result = ComplianceOutputSchema.safeParse(raw)
  if (result.success) {
    return { data: applyBusinessRules(result.data), normalized: false, issues: [] }
  }

  // Fallback: best-effort normalization from partial object
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const confidence = clamp(Number(o.confidence_score), 0, 1) || 0.4

  const validRisk = COMPLIANCE_RISK_LEVELS.includes(
    o.compliance_risk_level as typeof COMPLIANCE_RISK_LEVELS[number]
  )
    ? (o.compliance_risk_level as ComplianceOutput['compliance_risk_level'])
    : 'high'

  // Salvage any obligations that at minimum have a code field
  const obligations = Array.isArray(o.obligations)
    ? o.obligations.filter(
        (ob): ob is ComplianceOutput['obligations'][number] =>
          typeof ob === 'object' &&
          ob !== null &&
          typeof (ob as Record<string, unknown>).code === 'string'
      )
    : []

  // Salvage any renewal entries that at minimum have a service_type field
  const renewalQueue = Array.isArray(o.renewal_revenue_queue)
    ? o.renewal_revenue_queue.filter(
        (r): r is ComplianceOutput['renewal_revenue_queue'][number] =>
          typeof r === 'object' &&
          r !== null &&
          typeof (r as Record<string, unknown>).service_type === 'string'
      )
    : []

  const data: ComplianceOutput = {
    case_id:               typeof o.case_id        === 'string' ? o.case_id        : fallbackCaseId,
    estado_objetivo:       typeof o.estado_objetivo === 'string' ? o.estado_objetivo : 'unknown',
    assigned_route:        typeof o.assigned_route  === 'string' ? o.assigned_route  : 'unknown',
    obligations:           obligations,
    renewal_revenue_queue: renewalQueue,
    compliance_risk_level: validRisk,
    requires_human_review: true, // fallback always escalates
    human_review_reason:   'Normalización aplicada — output del LLM no cumplió el schema',
    rule_version:          'compliance-v1.0',
    source_updated_at:     new Date().toISOString(),
    confidence_score:      confidence,
  }

  const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
  return { data, normalized: true, issues }
}
