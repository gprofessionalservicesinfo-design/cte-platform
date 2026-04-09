import {
  DocumentalOutputSchema,
  DocumentalOutput,
  DOC_TYPES,
  DOC_QA_STATUSES,
} from './schema'

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(Number.isFinite(n) ? n : min, min), max)
}

// Hard business rules enforced post-parse — these override LLM decisions
// where the contract requires deterministic behaviour.
function applyBusinessRules(data: DocumentalOutput): DocumentalOutput {
  let { status, requires_human_review, rejection_reason, manual_review_reason } = data

  // Rule 1: legibility below threshold always rejects
  if (data.legibility_score < 6) {
    status             = 'rejected'
    rejection_reason   = rejection_reason
      ?? `Legibilidad insuficiente (score ${data.legibility_score}/10 — mínimo requerido: 6)`
    requires_human_review = true
  }

  // Rule 2: fraud or name mismatch always escalates regardless of confidence
  if (data.fraud_flag || data.name_mismatch_flag) {
    requires_human_review = true
    manual_review_reason  = manual_review_reason
      ?? (data.fraud_flag ? 'Señal de fraude detectada' : 'Inconsistencia de nombre detectada')
  }

  // Rule 3: low confidence always escalates
  if (data.confidence_score < 0.80) {
    requires_human_review = true
  }

  return { ...data, status, requires_human_review, rejection_reason, manual_review_reason }
}

export function normalizeDocumentalOutput(
  raw:                unknown,
  fallbackCaseId:     string,
  fallbackDocumentId: string
): { data: DocumentalOutput; normalized: boolean; issues: string[] } {
  // Happy path: validate then apply rules
  const result = DocumentalOutputSchema.safeParse(raw)
  if (result.success) {
    return { data: applyBusinessRules(result.data), normalized: false, issues: [] }
  }

  // Fallback: best-effort normalization from partial object
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const confidence    = clamp(Number(o.confidence_score), 0, 1)          || 0.4
  const rawLegibility = Math.round(Number(o.legibility_score))
  const legibility    = clamp(Number.isFinite(rawLegibility) ? rawLegibility : 5, 1, 10)
  const fraudFlag     = o.fraud_flag === true
  const nameMismatch  = o.name_mismatch_flag === true

  const validDocType = DOC_TYPES.includes(o.doc_type as typeof DOC_TYPES[number])
    ? (o.doc_type as DocumentalOutput['doc_type'])
    : 'other'

  const validStatus = DOC_QA_STATUSES.includes(o.status as typeof DOC_QA_STATUSES[number])
    ? (o.status as DocumentalOutput['status'])
    : 'requires_review'

  const data: DocumentalOutput = {
    case_id:               typeof o.case_id     === 'string' ? o.case_id     : fallbackCaseId,
    document_id:           typeof o.document_id === 'string' ? o.document_id : fallbackDocumentId,
    doc_type:              validDocType,
    legibility_score:      legibility,
    status:                legibility < 6 ? 'rejected' : validStatus,
    rejection_reason:      legibility < 6
                             ? (typeof o.rejection_reason === 'string'
                                 ? o.rejection_reason
                                 : `Legibilidad insuficiente (score ${legibility}/10)`)
                             : (typeof o.rejection_reason === 'string' ? o.rejection_reason : null),
    fraud_flag:            fraudFlag,
    duplicate_flag:        o.duplicate_flag   === true,
    name_mismatch_flag:    nameMismatch,
    expiration_flag:       o.expiration_flag  === true,
    manual_review_reason:  'Normalización aplicada — output del LLM no cumplió el schema',
    confidence_score:      confidence,
    requires_human_review: true, // fallback always escalates
    doc_version:           'documental-v1.0',
  }

  const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
  return { data, normalized: true, issues }
}
