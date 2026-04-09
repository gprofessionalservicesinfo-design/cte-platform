import {
  MasterOutputSchema,
  MasterOutput,
  CapacityFlags,
  BudgetFlags,
  AgentStatus,
  HealthInputs,
  ESCALATION_SEVERITIES,
} from './schema'

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(Number.isFinite(n) ? n : min, min), max)
}

// ── Operational health score ───────────────────────────────────────────────────
// Weighted composite computed in TypeScript — injected as a fact into the LLM.
// LLM never recalculates this.
//
// Weights:
//   25% — case backlog score    (0-10: 10 = no backlog, 0 = 50+ open cases)
//   20% — human review burden   (0-10: 10 = 0 pending, 0 = 20+ pending)
//   20% — avg case age          (0-10: 10 = <1 day, 0 = >14 days)
//   15% — comm delivery rate    (0-10: linear from delivery rate 0-1)
//   20% — revops pipeline health (0-10: direct from revops_reports)

export function computeHealthScore(inputs: HealthInputs): number {
  const backlogScore = clamp(10 - (inputs.casesBacklogCount / 5), 0, 10)
  const hrScore      = clamp(10 - (inputs.humanReviewPendingCount / 2), 0, 10)
  const ageScore     = clamp(10 - (inputs.avgCaseAgeDays / 1.4), 0, 10)
  const commScore    = clamp(inputs.commDeliveryRate * 10, 0, 10)
  const revopsScore  = clamp(inputs.revopsPipelineHealth, 0, 10)

  const weighted =
    backlogScore * 0.25 +
    hrScore      * 0.20 +
    ageScore     * 0.20 +
    commScore    * 0.15 +
    revopsScore  * 0.20

  return Math.round(weighted * 10) / 10  // 1 decimal
}

// ── do_not_scale_reason ────────────────────────────────────────────────────────
// Set by service guardrails — LLM cannot unset or override this.
export function buildDoNotScaleReason(
  scalePauseFlag:   string | null,
  scalePauseReason: string | null,
  opsSaturated:     boolean
): string | null {
  if (scalePauseFlag === 'pause' && scalePauseReason) {
    return scalePauseReason
  }
  if (opsSaturated) {
    return 'Capacidad operativa saturada — no escalar hasta resolver backlog'
  }
  return null
}

// ── LLM response parser (subset of full output) ───────────────────────────────
function parseLLMFields(raw: unknown): {
  executive_summary:    string
  critical_escalations: MasterOutput['critical_escalations']
  weekly_priorities:    MasterOutput['weekly_priorities']
  partner_alerts:       MasterOutput['partner_alerts']
  valid:                boolean
} {
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const escalations = Array.isArray(o.critical_escalations)
    ? (o.critical_escalations as unknown[]).filter(
        (e): e is MasterOutput['critical_escalations'][number] =>
          typeof e === 'object' && e !== null &&
          typeof (e as Record<string, unknown>).type     === 'string' &&
          typeof (e as Record<string, unknown>).reason   === 'string' &&
          ESCALATION_SEVERITIES.includes(
            (e as Record<string, unknown>).severity as typeof ESCALATION_SEVERITIES[number]
          )
      )
    : []

  const partnerAlerts = Array.isArray(o.partner_alerts)
    ? (o.partner_alerts as unknown[]).filter(
        (p): p is MasterOutput['partner_alerts'][number] =>
          typeof p === 'object' && p !== null &&
          typeof (p as Record<string, unknown>).partner_id   === 'string' &&
          typeof (p as Record<string, unknown>).partner_name === 'string'
      )
    : []

  const priorities = (o.weekly_priorities as Record<string, unknown> | null) ?? {}

  const valid =
    typeof o.executive_summary === 'string' &&
    escalations.length >= 0 &&
    typeof priorities.ops_focus === 'string'

  return {
    executive_summary: typeof o.executive_summary === 'string'
      ? o.executive_summary
      : 'Reporte generado con datos del sistema. Revisar métricas adjuntas.',
    critical_escalations: escalations,
    weekly_priorities: {
      ops_focus:          typeof priorities.ops_focus        === 'string' ? priorities.ops_focus        : 'Revisar casos con revisión humana pendiente.',
      commercial_focus:   typeof priorities.commercial_focus === 'string' ? priorities.commercial_focus : 'Activar seguimiento de partners con mayor ROI.',
      top_priority_cases: Array.isArray(priorities.top_priority_cases) ? priorities.top_priority_cases as string[] : [],
      top_priority_tasks: Array.isArray(priorities.top_priority_tasks) ? priorities.top_priority_tasks as string[] : [],
    },
    partner_alerts: partnerAlerts,
    valid,
  }
}

// ── Full output assembler ──────────────────────────────────────────────────────
export function assembleMasterOutput(opts: {
  reportDate:          string
  healthScore:         number
  doNotScaleReason:    string | null
  capacityFlags:       CapacityFlags
  budgetFlags:         BudgetFlags
  agentStatus:         AgentStatus
  llmFields:           ReturnType<typeof parseLLMFields>
}): MasterOutput {
  return {
    report_date:              opts.reportDate,
    operational_health_score: opts.healthScore,
    executive_summary:        opts.llmFields.executive_summary,
    critical_escalations:     opts.llmFields.critical_escalations,
    weekly_priorities:        opts.llmFields.weekly_priorities,
    capacity_flags:           opts.capacityFlags,
    budget_flags:             opts.budgetFlags,
    partner_alerts:           opts.llmFields.partner_alerts,
    do_not_scale_reason:      opts.doNotScaleReason,
    agent_status_summary:     opts.agentStatus,
    master_version:           'master-v1.0',
  }
}

export { parseLLMFields }

// ── Fallback normalizer ────────────────────────────────────────────────────────
export function normalizeMasterOutput(
  raw:             unknown,
  fallbackDate:    string,
  healthScore:     number,
  doNotScale:      string | null,
  capacityFlags:   CapacityFlags,
  budgetFlags:     BudgetFlags,
  agentStatus:     AgentStatus
): { data: MasterOutput; normalized: boolean; issues: string[] } {
  const fullResult = MasterOutputSchema.safeParse(raw)
  if (fullResult.success) return { data: fullResult.data, normalized: false, issues: [] }

  const llmFields = parseLLMFields(raw)
  const data      = assembleMasterOutput({
    reportDate:       fallbackDate,
    healthScore,
    doNotScaleReason: doNotScale,
    capacityFlags,
    budgetFlags,
    agentStatus,
    llmFields,
  })

  const issues = fullResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
  return { data, normalized: true, issues }
}
