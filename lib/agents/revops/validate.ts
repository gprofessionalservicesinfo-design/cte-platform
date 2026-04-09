import {
  RevopsOutputSchema,
  RevopsOutput,
  LLMRevopsResponseSchema,
  LLMRevopsResponse,
  ComputedMetrics,
  BudgetStatus,
  ScalePauseFlag,
  SCALE_PAUSE_FLAGS,
  PACING_STATUSES,
} from './schema'

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(Number.isFinite(n) ? n : min, min), max)
}

// ── Guardrails ─────────────────────────────────────────────────────────────────
// These are hardcoded business rules. The LLM has no influence over this output.
// Each rule returns { flag, reason } or null if the rule does not apply.

type GuardrailResult = { flag: ScalePauseFlag; reason: string }

function checkGuardrails(m: ComputedMetrics): GuardrailResult {
  const reasons: string[] = []

  // PAUSE rule 1: CAC 14d > target_cac * 1.20
  if (m.cac_14d !== null && m.target_cac > 0 && m.cac_14d > m.target_cac * 1.20) {
    reasons.push(
      `CAC 14d $${m.cac_14d.toFixed(2)} supera el límite (target $${m.target_cac} × 1.20 = $${(m.target_cac * 1.20).toFixed(2)})`
    )
  }

  // PAUSE rule 2: spend > 1.5x target_cac AND zero sales in that window
  if (m.target_cac > 0 && m.spend_7d > m.target_cac * 1.5 && m.paid_clients_7d === 0) {
    reasons.push(
      `Gasto 7d $${m.spend_7d.toFixed(2)} supera 1.5× CAC objetivo ($${(m.target_cac * 1.5).toFixed(2)}) sin ventas atribuidas`
    )
  }

  // PAUSE rule 3: single campaign > 30% monthly budget in 7d with no results
  if (
    m.budget_monthly > 0 &&
    m.top_campaign_spend_7d > m.budget_monthly * 0.30 &&
    m.paid_clients_7d === 0
  ) {
    reasons.push(
      `Una campaña consumió $${m.top_campaign_spend_7d.toFixed(2)} (>${(m.budget_monthly * 0.30).toFixed(2)} = 30% del presupuesto mensual) en 7 días sin resultados`
    )
  }

  // PAUSE rule 4: ops capacity flag is off
  if (!m.ops_capacity_ok) {
    reasons.push('Capacidad operativa marcada como no disponible (ops_capacity_ok = false)')
  }

  // PAUSE rule 5: SLA breach rate > 10%
  if (m.sla_breach_rate > 0.10) {
    reasons.push(
      `Tasa de incumplimiento de SLA ${(m.sla_breach_rate * 100).toFixed(1)}% supera el límite del 10%`
    )
  }

  if (reasons.length > 0) {
    return { flag: 'pause', reason: reasons.join(' | ') }
  }

  // SCALE rule: CAC 14d < target * 0.85 AND ops ok AND min 2 attributed sales
  if (
    m.cac_14d !== null &&
    m.target_cac > 0 &&
    m.cac_14d < m.target_cac * 0.85 &&
    m.ops_capacity_ok &&
    m.paid_clients_7d >= 2
  ) {
    return {
      flag:   'scale',
      reason: `CAC 14d $${m.cac_14d.toFixed(2)} < target $${m.target_cac} × 0.85 — capacidad disponible — ${m.paid_clients_7d} ventas atribuidas en 7d`,
    }
  }

  return { flag: 'hold', reason: 'Sin condiciones de escala ni pausa — mantener estrategia actual' }
}

// ── Pacing status ──────────────────────────────────────────────────────────────
export function computePacingStatus(
  spentMtd:    number,
  budgetMonthly: number,
  daysElapsed: number,
  daysInMonth: number
): BudgetStatus['pacing_status'] {
  if (budgetMonthly === 0 || daysElapsed === 0) return 'on_track'
  const expectedPace = (budgetMonthly / daysInMonth) * daysElapsed
  const ratio        = spentMtd / expectedPace
  if (ratio > 1.10) return 'over_pacing'
  if (ratio < 0.80) return 'under_pacing'
  return 'on_track'
}

// ── LLM response parser ────────────────────────────────────────────────────────
export function parseLLMRevopsResponse(
  raw: unknown
): { data: LLMRevopsResponse; valid: boolean } {
  const result = LLMRevopsResponseSchema.safeParse(raw)
  if (result.success) return { data: result.data, valid: true }

  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
  return {
    data: {
      report_date:           typeof o.report_date           === 'string' ? o.report_date : new Date().toISOString().split('T')[0],
      pipeline_health_score: clamp(Number(o.pipeline_health_score), 0, 10) || 5,
      partner_roi_summary:   Array.isArray(o.partner_roi_summary) ? o.partner_roi_summary as LLMRevopsResponse['partner_roi_summary'] : [],
      master_recommendation: typeof o.master_recommendation === 'string' ? o.master_recommendation : 'Datos insuficientes — reporte normalizado.',
      revops_version:        'revops-v1.0',
    },
    valid: false,
  }
}

// ── Full output assembler ──────────────────────────────────────────────────────
// Assembles final RevopsOutput from computed metrics + LLM response.
// scale_pause_flag is always set by applyGuardrails — never by LLM.
export function assembleRevopsOutput(opts: {
  reportDate:          string
  metrics:             ComputedMetrics
  budgetStatus:        BudgetStatus
  llmResponse:         LLMRevopsResponse
  commissionDueTotal:  number
}): { data: RevopsOutput; guardrail: GuardrailResult } {
  const guardrail = checkGuardrails(opts.metrics)

  const data: RevopsOutput = {
    report_date:           opts.reportDate,
    budget_vs_actual:      opts.budgetStatus,
    cac_7d:                opts.metrics.cac_7d,
    cac_30d:               opts.metrics.cac_30d,
    roas_30d:              opts.metrics.roas_30d,
    payback_estimate_days: opts.metrics.payback_estimate_days,
    scale_pause_flag:      guardrail.flag,      // hardcoded — LLM cannot set this
    scale_pause_reason:    guardrail.reason,
    pipeline_health_score: clamp(opts.llmResponse.pipeline_health_score, 0, 10),
    partner_roi_summary:   opts.llmResponse.partner_roi_summary,
    commission_due_total:  opts.commissionDueTotal,
    revops_version:        'revops-v1.0',
  }

  // Validate final shape
  const result = RevopsOutputSchema.safeParse(data)
  if (!result.success) {
    console.warn('[revops/validate] Final output failed schema check:', result.error.issues)
  }

  return { data, guardrail }
}

// ── Fallback normalizer for persisting partial output on error ─────────────────
export function normalizeRevopsOutput(
  raw:            unknown,
  fallbackDate:   string,
  metrics:        ComputedMetrics,
  budgetStatus:   BudgetStatus,
  commissionTotal: number
): { data: RevopsOutput; normalized: boolean; issues: string[] } {
  const fullResult = RevopsOutputSchema.safeParse(raw)
  if (fullResult.success) return { data: fullResult.data, normalized: false, issues: [] }

  const guardrail = checkGuardrails(metrics)
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const data: RevopsOutput = {
    report_date:           fallbackDate,
    budget_vs_actual:      budgetStatus,
    cac_7d:                metrics.cac_7d,
    cac_30d:               metrics.cac_30d,
    roas_30d:              metrics.roas_30d,
    payback_estimate_days: metrics.payback_estimate_days,
    scale_pause_flag:      guardrail.flag,
    scale_pause_reason:    guardrail.reason,
    pipeline_health_score: clamp(Number(o.pipeline_health_score), 0, 10) || 5,
    partner_roi_summary:   Array.isArray(o.partner_roi_summary) ? o.partner_roi_summary as RevopsOutput['partner_roi_summary'] : [],
    commission_due_total:  commissionTotal,
    revops_version:        'revops-v1.0',
  }

  const issues = fullResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
  return { data, normalized: true, issues }
}
