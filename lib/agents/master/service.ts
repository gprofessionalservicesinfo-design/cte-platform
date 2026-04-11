import axios                    from 'axios'
import { randomUUID }           from 'crypto'
import { SupabaseClient }       from '@supabase/supabase-js'
import {
  CapacityFlags,
  BudgetFlags,
  AgentStatus,
  HealthInputs,
  Escalation,
} from './schema'
import {
  computeHealthScore,
  buildDoNotScaleReason,
  parseLLMFields,
  assembleMasterOutput,
} from './validate'

// Ops saturation threshold: if backlog > 30 open cases, flag as saturated
const OPS_SATURATION_THRESHOLD = 30
// Stale report warning threshold in days
const STALE_REPORT_DAYS = 7

export interface MasterResult {
  success:                   boolean
  report_date:               string
  run_id:                    string
  skipped?:                  boolean
  report_id?:                string
  operational_health_score?: number
  do_not_scale_reason?:      string | null
  scale_pause_flag?:         string
  escalations_count?:        number
  tasks_created:             string[]
  normalized:                boolean
  error?:                    string
}

function extractJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return JSON.parse(fenced[1].trim())
  return JSON.parse(text.trim())
}

function buildPrompt(
  promptText:        string,
  reportDate:        string,
  healthMetrics:     Record<string, unknown>,
  revopsSnapshot:    unknown,
  growthSnapshot:    unknown,
  escalationSignals: unknown[],
  agentStatus:       unknown,
  doNotScale:        string | null
): string {
  return promptText
    .replace('{{REPORT_DATE}}',        reportDate)
    .replace('{{HEALTH_METRICS}}',     JSON.stringify(healthMetrics,     null, 2))
    .replace('{{REVOPS_SNAPSHOT}}',    JSON.stringify(revopsSnapshot,    null, 2))
    .replace('{{GROWTH_SNAPSHOT}}',    JSON.stringify(growthSnapshot,    null, 2))
    .replace('{{ESCALATION_SIGNALS}}', JSON.stringify(escalationSignals, null, 2))
    .replace('{{AGENT_STATUS}}',       JSON.stringify(agentStatus,       null, 2))
    .replace('{{DO_NOT_SCALE}}',       JSON.stringify(
      doNotScale
        ? { active: true,  reason: doNotScale }
        : { active: false, reason: null },
      null, 2
    ))
}

export async function runMaster(
  reportDateRaw: string,
  supabase:      SupabaseClient
): Promise<MasterResult> {
  const runId      = randomUUID()
  const reportDate = reportDateRaw.split('T')[0]

  // ── 1. Idempotency gate ────────────────────────────────────────────────────
  const { error: runInsertError } = await supabase
    .from('agent_runs')
    .insert({
      id:            runId,
      agent_id:      'master',
      version:       'master-v1.0',
      status:        'pending',
      trigger_type:  'webhook',
      source_ref_id: reportDate,
      started_at:    new Date().toISOString(),
    })

  if (runInsertError) {
    if (runInsertError.code === '23505') {
      console.log(`[master/service] Skipped — report_date ${reportDate} already claimed`)
      return {
        success:      true,
        report_date:  reportDate,
        run_id:       runId,
        skipped:      true,
        tasks_created: [],
        normalized:   false,
      }
    }
    throw new Error(`agent_runs insert failed: ${runInsertError.message}`)
  }

  try {
    // ── 2. Mark running ──────────────────────────────────────────────────────
    await supabase.from('agent_runs').update({ status: 'running' }).eq('id', runId)

    // ── 3. Read cases — backlog counts, avg age, human review ────────────────
    const { data: openCases } = await supabase
      .from('cases')
      .select('id, case_id, status, requires_human_review, compliance_risk_level, created_at, route_classification_pending, documents_qa_pending')
      .in('status', ['pending', 'in_progress'])

    const cases              = openCases ?? []
    const casesBacklogCount  = cases.length
    const humanReviewPending = cases.filter(c => c.requires_human_review === true).length
    const criticalRiskCases  = cases.filter(c => c.compliance_risk_level === 'critical')
    const highRiskCases      = cases.filter(c => c.compliance_risk_level === 'high')
    const classifPending     = cases.filter(c => c.route_classification_pending === true).length
    const docsPending        = cases.filter(c => c.documents_qa_pending === true).length

    // Avg age in days for open cases
    const now       = new Date()
    const avgCaseAgeDays = cases.length > 0
      ? cases.reduce((sum, c) => {
          const age = (now.getTime() - new Date(c.created_at).getTime()) / 86_400_000
          return sum + age
        }, 0) / cases.length
      : 0

    const opsSaturated = casesBacklogCount >= OPS_SATURATION_THRESHOLD

    // ── 4. Read agent_tasks — pending counts by task_type ────────────────────
    const { data: pendingTasks } = await supabase
      .from('agent_tasks')
      .select('task_type, agent_id')
      .eq('status', 'pending')

    const tasks                = pendingTasks ?? []
    const intakePending        = tasks.filter(t => t.agent_id === 'intake').length
    const communicationsPending = tasks.filter(t => t.agent_id === 'comunicacion').length
    const compliancePending    = tasks.filter(t => t.agent_id === 'compliance').length

    // ── 5. Read latest revops_report ─────────────────────────────────────────
    const { data: latestRevops } = await supabase
      .from('revops_reports')
      .select('report_date, scale_pause_flag, scale_pause_reason, cac_7d, pipeline_health_score, budget_vs_actual, commission_due_total')
      .order('report_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    const revopsAge = latestRevops
      ? Math.floor((now.getTime() - new Date(latestRevops.report_date).getTime()) / 86_400_000)
      : null

    if (revopsAge !== null && revopsAge > STALE_REPORT_DAYS) {
      console.warn(`[master/service] revops_report is ${revopsAge} days old — data may be stale`)
    }

    const scalePauseFlag   = (latestRevops?.scale_pause_flag as string | null) ?? 'hold'
    const scalePauseReason = (latestRevops?.scale_pause_reason as string | null) ?? null
    const cac7d            = latestRevops?.cac_7d !== null ? Number(latestRevops?.cac_7d) : null
    const revopsPipeHealth = Number(latestRevops?.pipeline_health_score ?? 5)
    const budgetVsActual   = latestRevops?.budget_vs_actual as Record<string, unknown> | null

    // ── 6. Read latest growth_report ─────────────────────────────────────────
    const { data: latestGrowth } = await supabase
      .from('growth_reports')
      .select('week_start, geo_priority, service_priority, master_recommendation')
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle()

    const growthAge = latestGrowth
      ? Math.floor((now.getTime() - new Date(latestGrowth.week_start).getTime()) / 86_400_000)
      : null

    if (growthAge !== null && growthAge > STALE_REPORT_DAYS) {
      console.warn(`[master/service] growth_report is ${growthAge} days old — data may be stale`)
    }

    // ── 7. Read compliance obligations due in 30 days ─────────────────────────
    const in30d = new Date(now); in30d.setUTCDate(in30d.getUTCDate() + 30)
    const { data: complianceDue } = await supabase
      .from('compliance_timeline')
      .select('obligation_code, obligation_label, due_date, priority')
      .eq('status', 'pending')
      .lte('due_date', in30d.toISOString().split('T')[0])
      .order('priority', { ascending: true })
      .limit(10)

    // ── 8. Read renewal_queue due in 30 days ──────────────────────────────────
    const { data: renewalsDue } = await supabase
      .from('renewal_queue')
      .select('service_type, estimated_revenue, due_date, priority')
      .eq('status', 'pending')
      .lte('due_date', in30d.toISOString().split('T')[0])
      .order('priority', { ascending: true })
      .limit(10)

    const renewalsDue30d       = (renewalsDue ?? []).length
    const renewalRevenue30d    = (renewalsDue ?? []).reduce(
      (sum, r) => sum + Number(r.estimated_revenue), 0
    )

    // ── 9. Read communication_log delivery rate (last 7 days) ─────────────────
    const ago7 = new Date(now); ago7.setUTCDate(ago7.getUTCDate() - 7)
    const { data: commLogs } = await supabase
      .from('communication_log')
      .select('delivery_status')
      .gte('sent_at', ago7.toISOString())

    const commTotal    = (commLogs ?? []).length
    const commSent     = (commLogs ?? []).filter(c => c.delivery_status === 'sent').length
    const commDelivery = commTotal > 0 ? commSent / commTotal : 1 // default 100% if no data

    // ── 10. Read partners missing owner or next_step ───────────────────────────
    const { data: problemPartners } = await supabase
      .from('partner_registry')
      .select('id, partner_name, owner, next_step, pipeline_stage, commission_due')
      .eq('status', 'active')

    const partnersNoOwner    = (problemPartners ?? []).filter(p => !p.owner)
    const partnersNoNextStep = (problemPartners ?? []).filter(p => p.owner && !p.next_step)
    const partnersCommDue    = (problemPartners ?? []).filter(p => Number(p.commission_due) > 0)

    // ── 11. Read budget_config for current month ───────────────────────────────
    const monthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`
    const { data: budgetRow } = await supabase
      .from('budget_config')
      .select('budget_monthly_usd, target_cac_usd, ops_capacity_ok')
      .eq('month', monthStart)
      .maybeSingle()

    const targetCac     = Number(budgetRow?.target_cac_usd ?? null) || null
    const opsCapacityOk = budgetRow?.ops_capacity_ok ?? true

    // ── 12. Compute health score + flags (TypeScript — not LLM) ───────────────
    const healthInputs: HealthInputs = {
      casesBacklogCount:       casesBacklogCount,
      avgCaseAgeDays:          avgCaseAgeDays,
      humanReviewPendingCount: humanReviewPending,
      commDeliveryRate:        commDelivery,
      revopsPipelineHealth:    revopsPipeHealth,
    }
    const healthScore = computeHealthScore(healthInputs)

    const effectiveOpsSaturated = opsSaturated || !opsCapacityOk

    const doNotScaleReason = buildDoNotScaleReason(
      scalePauseFlag,
      scalePauseReason,
      effectiveOpsSaturated
    )

    const capacityFlags: CapacityFlags = {
      ops_saturated:               effectiveOpsSaturated,
      cases_backlog_count:         casesBacklogCount,
      avg_case_age_days:           Math.round(avgCaseAgeDays * 10) / 10,
      human_review_pending_count:  humanReviewPending,
    }

    const budgetFlags: BudgetFlags = {
      scale_pause_flag: (scalePauseFlag as BudgetFlags['scale_pause_flag']) ?? 'hold',
      current_cac_7d:   cac7d,
      target_cac:       targetCac,
      budget_pacing:    (budgetVsActual?.pacing_status as string) ?? 'unknown',
    }

    const agentStatus: AgentStatus = {
      intake_pending:          intakePending,
      classification_pending:  classifPending,
      documents_pending:       docsPending,
      compliance_pending:      compliancePending,
      communications_pending:  communicationsPending,
      renewals_due_30d:        renewalsDue30d,
      human_review_pending:    humanReviewPending,
    }

    // ── 13. Build raw escalation signals (TypeScript — LLM enriches) ──────────
    const escalationSignals: Escalation[] = []

    // Critical risk cases
    for (const c of criticalRiskCases.slice(0, 5)) {
      escalationSignals.push({
        type:               'critical_compliance_risk',
        severity:           'critical',
        case_id:            String(c.case_id),
        agent_id:           'compliance',
        reason:             'Riesgo de cumplimiento crítico detectado en el caso',
        recommended_action: 'Revisar caso inmediatamente y contactar al cliente.',
      })
    }

    // RevOps PAUSE flag
    if (scalePauseFlag === 'pause' && scalePauseReason) {
      escalationSignals.push({
        type:               'spend_pause_active',
        severity:           'critical',
        case_id:            null,
        agent_id:           'revops',
        reason:             scalePauseReason,
        recommended_action: 'Revisar guardrails de RevOps y confirmar pausa de pauta.',
      })
    }

    // High risk cases
    for (const c of highRiskCases.slice(0, 3)) {
      escalationSignals.push({
        type:               'high_compliance_risk',
        severity:           'high',
        case_id:            String(c.case_id),
        agent_id:           'compliance',
        reason:             'Riesgo de cumplimiento alto — revisión humana pendiente',
        recommended_action: 'Asignar a especialista de compliance en 24h.',
      })
    }

    // Human review backlog high
    if (humanReviewPending > 5) {
      escalationSignals.push({
        type:               'human_review_backlog',
        severity:           'high',
        case_id:            null,
        agent_id:           'intake',
        reason:             `${humanReviewPending} casos con revisión humana pendiente`,
        recommended_action: 'Priorizar revisión de casos — asignar recursos adicionales.',
      })
    }

    // Ops saturation
    if (effectiveOpsSaturated) {
      escalationSignals.push({
        type:               'ops_capacity_saturated',
        severity:           'high',
        case_id:            null,
        agent_id:           'master',
        reason:             `Backlog de ${casesBacklogCount} casos abiertos supera el umbral operativo`,
        recommended_action: 'No escalar adquisición. Reducir backlog antes de nuevas campañas.',
      })
    }

    // Partners without owner
    for (const p of partnersNoOwner.slice(0, 3)) {
      escalationSignals.push({
        type:               'partner_no_owner',
        severity:           'medium',
        case_id:            null,
        agent_id:           'revops',
        reason:             `Partner "${p.partner_name}" no tiene owner asignado`,
        recommended_action: 'Asignar owner comercial y definir next_step.',
      })
    }

    // Comm delivery rate low
    if (commDelivery < 0.90 && commTotal > 0) {
      escalationSignals.push({
        type:               'comm_delivery_low',
        severity:           'low',
        case_id:            null,
        agent_id:           'comunicacion',
        reason:             `Tasa de entrega de mensajes: ${(commDelivery * 100).toFixed(1)}% (últimos 7 días)`,
        recommended_action: 'Revisar configuración de Twilio/Resend y números de teléfono en base de datos.',
      })
    }

    // ── 14. Read active prompt ────────────────────────────────────────────────
    const { data: prompt, error: promptError } = await supabase
      .from('prompt_versions')
      .select('prompt_text, version_label')
      .eq('agent_id', 'master')
      .eq('is_active', true)
      .single()

    if (promptError || !prompt) throw new Error('Active prompt for master not found')

    // ── 15. Call LLM ─────────────────────────────────────────────────────────
    const healthMetrics: Record<string, unknown> = {
      operational_health_score: healthScore,
      cases_backlog_count:      casesBacklogCount,
      avg_case_age_days:        Math.round(avgCaseAgeDays * 10) / 10,
      human_review_pending:     humanReviewPending,
      comm_delivery_rate_7d:    `${(commDelivery * 100).toFixed(1)}%`,
      revops_pipeline_health:   revopsPipeHealth,
      renewals_due_30d:         renewalsDue30d,
      renewal_revenue_30d_usd:  `$${renewalRevenue30d.toFixed(0)}`,
      ops_saturated:            effectiveOpsSaturated,
      compliance_obligations_due_30d: (complianceDue ?? []).length,
    }

    const partnerAlertInputs = [
      ...partnersNoOwner.map(p => ({ ...p, alert_type: 'no_owner' })),
      ...partnersNoNextStep.map(p => ({ ...p, alert_type: 'no_next_step' })),
      ...partnersCommDue.map(p => ({ ...p, alert_type: 'commission_due' })),
    ].slice(0, 10)

    const userPrompt = buildPrompt(
      prompt.prompt_text as string,
      reportDate,
      healthMetrics,
      latestRevops ?? { note: 'Sin reporte RevOps disponible' },
      latestGrowth  ?? { note: 'Sin reporte Growth disponible' },
      escalationSignals,
      agentStatus,
      doNotScaleReason
    )

    await supabase
      .from('agent_runs')
      .update({ input_normalized_json: { report_date: reportDate, health_metrics: healthMetrics } })
      .eq('id', runId)

    const llmResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model:      process.env.MASTER_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 4096,
        system:     'You are the CEO Brain of a US business formation company. Respond with valid JSON only — no prose, no markdown.',
        messages:   [{ role: 'user', content: userPrompt }],
      },
      {
        headers: {
          'x-api-key':         process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
          'content-type':      'application/json',
        },
        timeout: 120_000,
      }
    )

    const rawText = (llmResponse.data?.content?.[0]?.text as string) ?? ''

    let rawParsed: unknown
    try { rawParsed = extractJSON(rawText) } catch { rawParsed = {} }

    await supabase
      .from('agent_runs')
      .update({ llm_raw_output_json: { text: rawText } })
      .eq('id', runId)

    const llmFields = parseLLMFields(rawParsed)
    const wasNormalized = !llmFields.valid

    // ── 16. Assemble final output — system values override LLM ───────────────
    const master = assembleMasterOutput({
      reportDate,
      healthScore,
      doNotScaleReason,
      capacityFlags,
      budgetFlags,
      agentStatus,
      llmFields,
    })

    await supabase
      .from('agent_runs')
      .update({ llm_normalized_output_json: master as unknown as Record<string, unknown> })
      .eq('id', runId)

    // ── 17. Upsert master_reports ─────────────────────────────────────────────
    const { data: reportRow, error: reportError } = await supabase
      .from('master_reports')
      .upsert(
        {
          report_date:              reportDate,
          operational_health_score: master.operational_health_score,
          executive_summary:        master.executive_summary,
          critical_escalations:     master.critical_escalations,
          weekly_priorities:        master.weekly_priorities,
          capacity_flags:           master.capacity_flags,
          budget_flags:             master.budget_flags,
          partner_alerts:           master.partner_alerts,
          do_not_scale_reason:      master.do_not_scale_reason,
          agent_status_summary:     master.agent_status_summary,
          master_version:           master.master_version,
        },
        { onConflict: 'report_date' }
      )
      .select('id')
      .single()

    if (reportError || !reportRow) {
      throw new Error(`master_reports upsert failed: ${reportError?.message}`)
    }

    const reportId = reportRow.id as string

    // ── 18. Audit logs ────────────────────────────────────────────────────────
    await supabase.from('audit_logs').insert({
      entity_type: 'case',
      entity_id:   reportId,
      action:      'master_report_generated',
      actor:       'master_agent',
      metadata: {
        report_date:              reportDate,
        operational_health_score: master.operational_health_score,
        escalations_count:        master.critical_escalations.length,
        do_not_scale:             !!doNotScaleReason,
        scale_pause_flag:         scalePauseFlag,
        human_review_pending:     humanReviewPending,
        cases_backlog:            casesBacklogCount,
        normalized:               wasNormalized,
      },
    })

    if (wasNormalized) {
      console.warn('[master/service] LLM normalization applied')
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   reportId,
        action:      'fallback_triggered',
        actor:       'master_agent',
        metadata:    { report_date: reportDate },
      })
    }

    // ── 19. Create downstream tasks ───────────────────────────────────────────
    const taskDefs: { task_type: string; priority: number }[] = [
      { task_type: 'master_report_ready', priority: 2 },
    ]

    const hasCritical = master.critical_escalations.some(e => e.severity === 'critical')
    if (hasCritical) {
      taskDefs.push({ task_type: 'escalation_critical', priority: 1 })
    }

    if (doNotScaleReason) {
      taskDefs.push({ task_type: 'do_not_scale_alert', priority: 1 })
    }

    if (effectiveOpsSaturated) {
      taskDefs.push({ task_type: 'capacity_review', priority: 2 })
    }

    for (const t of taskDefs) {
      await supabase.from('agent_tasks').insert({
        agent_id:  'master',
        case_id:   null,
        task_type: t.task_type,
        status:    'pending',
        priority:  t.priority,
        payload: {
          report_date:              reportDate,
          report_id:                reportId,
          operational_health_score: master.operational_health_score,
          do_not_scale_reason:      doNotScaleReason,
          escalations_count:        master.critical_escalations.length,
        },
      })
      await supabase.from('audit_logs').insert({
        entity_type: 'task',
        entity_id:   reportId,
        action:      'task_created',
        actor:       'master_agent',
        metadata:    { task_type: t.task_type, priority: t.priority },
      })
    }

    // ── 20. Mark agent_run completed ──────────────────────────────────────────
    await supabase
      .from('agent_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', runId)

    console.log(
      `[master/service] ${reportDate} → health: ${master.operational_health_score} | ` +
      `flag: ${scalePauseFlag} | escalations: ${master.critical_escalations.length} | ` +
      `do_not_scale: ${!!doNotScaleReason} | backlog: ${casesBacklogCount} | ` +
      `human_review: ${humanReviewPending} | tasks: ${taskDefs.map(t => t.task_type).join(', ')}`
    )

    return {
      success:                  true,
      report_date:              reportDate,
      run_id:                   runId,
      report_id:                reportId,
      operational_health_score: master.operational_health_score,
      do_not_scale_reason:      doNotScaleReason,
      scale_pause_flag:         scalePauseFlag,
      escalations_count:        master.critical_escalations.length,
      tasks_created:            taskDefs.map(t => t.task_type),
      normalized:               wasNormalized,
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[master/service] Failed:', msg)
    await supabase
      .from('agent_runs')
      .update({
        status:        'failed',
        error_message: msg,
        completed_at:  new Date().toISOString(),
      })
      .eq('id', runId)
    throw err
  }
}
