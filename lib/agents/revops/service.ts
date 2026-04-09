import axios                          from 'axios'
import { randomUUID }                 from 'crypto'
import { SupabaseClient }             from '@supabase/supabase-js'
import {
  ComputedMetrics,
  BudgetStatus,
} from './schema'
import {
  parseLLMRevopsResponse,
  assembleRevopsOutput,
  computePacingStatus,
} from './validate'

export interface RevopsResult {
  success:                boolean
  report_date:            string
  run_id:                 string
  skipped?:               boolean
  report_id?:             string
  scale_pause_flag?:      string
  scale_pause_reason?:    string
  pipeline_health_score?: number
  cac_7d?:                number | null
  cac_30d?:               number | null
  roas_30d?:              number | null
  commission_due_total?:  number
  tasks_created:          string[]
  normalized:             boolean
  error?:                 string
}

function extractJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return JSON.parse(fenced[1].trim())
  return JSON.parse(text.trim())
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function buildBudgetStatus(
  budgetMonthly: number,
  spentMtd:      number,
  reportDate:    string,
  monthStart:    string
): BudgetStatus {
  const d         = new Date(reportDate)
  const year      = d.getUTCFullYear()
  const month     = d.getUTCMonth() + 1
  const totalDays = daysInMonth(year, month)
  const start     = new Date(monthStart)
  const elapsed   = Math.max(
    1,
    Math.floor((d.getTime() - start.getTime()) / 86_400_000) + 1
  )

  return {
    budget_monthly:          budgetMonthly,
    spent_mtd:               spentMtd,
    remaining:               Math.max(0, budgetMonthly - spentMtd),
    pacing_status:           computePacingStatus(spentMtd, budgetMonthly, elapsed, totalDays),
    days_remaining_in_month: totalDays - elapsed,
  }
}

function buildPrompt(
  promptText:         string,
  computedMetrics:    Record<string, unknown>,
  partnerData:        unknown[],
  growthContext:      unknown,
  renewalPipeline:    unknown[],
  scalePauseDecision: { flag: string; reason: string }
): string {
  return promptText
    .replace('{{COMPUTED_METRICS}}',     JSON.stringify(computedMetrics,    null, 2))
    .replace('{{PARTNER_DATA}}',         JSON.stringify(partnerData,        null, 2))
    .replace('{{GROWTH_CONTEXT}}',       JSON.stringify(growthContext,       null, 2))
    .replace('{{RENEWAL_PIPELINE}}',     JSON.stringify(renewalPipeline,    null, 2))
    .replace('{{SCALE_PAUSE_DECISION}}', JSON.stringify(scalePauseDecision, null, 2))
}

export async function runRevops(
  reportDateRaw: string,
  supabase:      SupabaseClient
): Promise<RevopsResult> {
  const runId      = randomUUID()
  const reportDate = reportDateRaw.split('T')[0]  // normalize to YYYY-MM-DD

  // ── 1. Idempotency gate ────────────────────────────────────────────────────
  const { error: runInsertError } = await supabase
    .from('agent_runs')
    .insert({
      id:            runId,
      agent_id:      'revops',
      version:       'revops-v1.0',
      status:        'pending',
      trigger_type:  'webhook',
      source_ref_id: reportDate,
      started_at:    new Date().toISOString(),
    })

  if (runInsertError) {
    if (runInsertError.code === '23505') {
      console.log(`[revops/service] Skipped — report_date ${reportDate} already claimed`)
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

    // ── 3. Read budget_config for current month ───────────────────────────────
    const d          = new Date(reportDate)
    const monthStart = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`

    const { data: budgetRow } = await supabase
      .from('budget_config')
      .select('budget_monthly_usd, target_cac_usd, target_roas, ops_capacity_ok')
      .eq('month', monthStart)
      .maybeSingle()

    const budgetMonthly = Number(budgetRow?.budget_monthly_usd ?? 0)
    const targetCac     = Number(budgetRow?.target_cac_usd    ?? 999_999)
    const targetRoas    = Number(budgetRow?.target_roas        ?? 3)
    const opsCapacityOk = budgetRow?.ops_capacity_ok ?? true

    // ── 4. Read spend_records (7d, 14d, 30d, MTD) ────────────────────────────
    const now      = new Date(reportDate)
    const ago7     = new Date(now); ago7.setUTCDate(ago7.getUTCDate()  - 7)
    const ago14    = new Date(now); ago14.setUTCDate(ago14.getUTCDate() - 14)
    const ago30    = new Date(now); ago30.setUTCDate(ago30.getUTCDate() - 30)
    const ago7Str  = ago7.toISOString().split('T')[0]
    const ago14Str = ago14.toISOString().split('T')[0]
    const ago30Str = ago30.toISOString().split('T')[0]

    const { data: spendAll } = await supabase
      .from('spend_records')
      .select('record_date, amount_usd, attributed_revenue, attributed_clients, campaign_id')
      .gte('record_date', ago30Str)
      .lte('record_date', reportDate)

    const spendRows = spendAll ?? []

    const spendMtd = spendRows
      .filter(r => r.record_date >= monthStart)
      .reduce((sum, r) => sum + Number(r.amount_usd), 0)

    const spend7Rows     = spendRows.filter(r => r.record_date >= ago7Str)
    const spend7d        = spend7Rows.reduce((sum, r) => sum + Number(r.amount_usd), 0)
    const clients7d      = spend7Rows.reduce((sum, r) => sum + Number(r.attributed_clients), 0)

    const spend14Rows    = spendRows.filter(r => r.record_date >= ago14Str)
    const spend14d       = spend14Rows.reduce((sum, r) => sum + Number(r.amount_usd), 0)
    const clients14d     = spend14Rows.reduce((sum, r) => sum + Number(r.attributed_clients), 0)

    const spend30d       = spendRows.reduce((sum, r) => sum + Number(r.amount_usd), 0)
    const revenue30d     = spendRows.reduce((sum, r) => sum + Number(r.attributed_revenue), 0)

    // Top campaign spend in 7d — for guardrail rule 3
    const campaignSpend7d = spend7Rows.reduce<Record<string, number>>((acc, r) => {
      const cid = r.campaign_id ?? '__none__'
      acc[cid]  = (acc[cid] ?? 0) + Number(r.amount_usd)
      return acc
    }, {})
    const topCampaignSpend7d = Math.max(0, ...Object.values(campaignSpend7d))

    // ── 5. Read payments (Stripe — amount_paid is in CENTS) ──────────────────
    const { data: payments7d } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('status', 'paid')
      .gte('paid_at', ago7.toISOString())
      .lte('paid_at', `${reportDate}T23:59:59Z`)

    const { data: payments30d } = await supabase
      .from('payments')
      .select('amount_paid')
      .eq('status', 'paid')
      .gte('paid_at', ago30.toISOString())
      .lte('paid_at', `${reportDate}T23:59:59Z`)

    const paidClients7d  = (payments7d  ?? []).length
    const paidClients30d = (payments30d ?? []).length
    const paidRevenue7d  = (payments7d  ?? []).reduce((s, r) => s + Number(r.amount_paid) / 100, 0)
    const paidRevenue30d = (payments30d ?? []).reduce((s, r) => s + Number(r.amount_paid) / 100, 0)

    // ── 6. Compute CAC / ROAS / payback ──────────────────────────────────────
    const cac7d   = paidClients7d  > 0 ? spend7d  / paidClients7d  : null
    const cac14d  = clients14d     > 0 ? spend14d / clients14d     : null
    const cac30d  = paidClients30d > 0 ? spend30d / paidClients30d : null
    const roas30d = spend30d       > 0 ? (revenue30d + paidRevenue30d) / spend30d : null
    const arpu30  = paidClients30d > 0 ? paidRevenue30d / paidClients30d : null
    const payback = arpu30 && arpu30 > 0 ? targetCac / (arpu30 / 30) : null

    // ── 7. SLA breach rate ────────────────────────────────────────────────────
    const { data: casesLast30 } = await supabase
      .from('cases')
      .select('id, status, requires_human_review')
      .gte('created_at', ago30.toISOString())

    const totalCases    = (casesLast30 ?? []).length
    const breachCount   = (casesLast30 ?? []).filter(
      c => c.status === 'failed' || c.requires_human_review === true
    ).length
    const slaBreachRate = totalCases > 0 ? breachCount / totalCases : 0

    // ── 8. Assemble ComputedMetrics ───────────────────────────────────────────
    const metrics: ComputedMetrics = {
      cac_7d:                 cac7d,
      cac_14d:                cac14d,
      cac_30d:                cac30d,
      roas_30d:               roas30d,
      payback_estimate_days:  payback,
      spend_mtd:              spendMtd,
      spend_7d:               spend7d,
      paid_clients_7d:        paidClients7d,
      paid_clients_30d:       paidClients30d,
      attributed_revenue_30d: revenue30d + paidRevenue30d,
      top_campaign_spend_7d:  topCampaignSpend7d,
      budget_monthly:         budgetMonthly,
      target_cac:             targetCac,
      target_roas:            targetRoas,
      ops_capacity_ok:        opsCapacityOk,
      sla_breach_rate:        slaBreachRate,
    }

    // ── 9. Pre-compute guardrail for prompt injection ─────────────────────────
    // We run assembleRevopsOutput with a stub LLM response purely to get the
    // guardrail decision early — so the LLM understands the scale/pause context.
    const budgetStatus   = buildBudgetStatus(budgetMonthly, spendMtd, reportDate, monthStart)
    const stubAssembly   = assembleRevopsOutput({
      reportDate,
      metrics,
      budgetStatus,
      llmResponse: {
        report_date:           reportDate,
        pipeline_health_score: 5,
        partner_roi_summary:   [],
        master_recommendation: '',
        revops_version:        'revops-v1.0',
      },
      commissionDueTotal: 0,
    })
    const earlyGuardrail = stubAssembly.guardrail

    // ── 10. Read active partners ──────────────────────────────────────────────
    const { data: partners } = await supabase
      .from('partner_registry')
      .select('id, partner_name, country, referred_leads, paid_clients, commission_due, commission_pct, pipeline_stage')
      .eq('status', 'active')
      .or('pipeline_stage.eq.active,referred_leads.gt.0')

    const activePartners     = partners ?? []
    const commissionDueTotal = activePartners.reduce(
      (sum, p) => sum + Number(p.commission_due), 0
    )

    // ── 11. Read latest growth_report ─────────────────────────────────────────
    const { data: latestGrowth } = await supabase
      .from('growth_reports')
      .select('week_start, geo_priority, service_priority, master_recommendation')
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle()

    // ── 12. Read renewal_queue pipeline ───────────────────────────────────────
    const { data: renewalRows } = await supabase
      .from('renewal_queue')
      .select('service_type, estimated_revenue, due_date, priority')
      .eq('status', 'pending')
      .order('priority', { ascending: true })
      .limit(20)

    // ── 13. Read active prompt ────────────────────────────────────────────────
    const { data: prompt, error: promptError } = await supabase
      .from('prompt_versions')
      .select('prompt_text, version_label')
      .eq('agent_id', 'revops')
      .eq('is_active', true)
      .single()

    if (promptError || !prompt) throw new Error('Active prompt for revops not found')

    // ── 14. Call LLM ─────────────────────────────────────────────────────────
    const computedMetricsForPrompt: Record<string, unknown> = {
      report_date:          reportDate,
      cac_7d:               cac7d   !== null ? `$${cac7d.toFixed(2)}`   : 'N/A',
      cac_14d:              cac14d  !== null ? `$${cac14d.toFixed(2)}`  : 'N/A',
      cac_30d:              cac30d  !== null ? `$${cac30d.toFixed(2)}`  : 'N/A',
      roas_30d:             roas30d !== null ? roas30d.toFixed(2)       : 'N/A',
      payback_days:         payback !== null ? `${payback.toFixed(0)} días` : 'N/A',
      spend_7d_usd:         `$${spend7d.toFixed(2)}`,
      spend_mtd_usd:        `$${spendMtd.toFixed(2)}`,
      budget_monthly_usd:   `$${budgetMonthly.toFixed(2)}`,
      target_cac_usd:       `$${targetCac.toFixed(2)}`,
      target_roas:          targetRoas,
      paid_clients_7d:      paidClients7d,
      paid_clients_30d:     paidClients30d,
      sla_breach_rate_pct:  `${(slaBreachRate * 100).toFixed(1)}%`,
      ops_capacity_ok:      opsCapacityOk,
    }

    const userPrompt = buildPrompt(
      prompt.prompt_text as string,
      computedMetricsForPrompt,
      activePartners,
      latestGrowth ?? { note: 'Sin reporte de growth disponible' },
      renewalRows  ?? [],
      { flag: earlyGuardrail.flag, reason: earlyGuardrail.reason }
    )

    await supabase
      .from('agent_runs')
      .update({ input_normalized_json: { report_date: reportDate, metrics: computedMetricsForPrompt } })
      .eq('id', runId)

    const llmResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model:      process.env.REVOPS_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 3072,
        system:     'You are an expert revenue operations analyst. Respond with valid JSON only — no prose, no markdown.',
        messages:   [{ role: 'user', content: userPrompt }],
      },
      {
        headers: {
          'x-api-key':         process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
          'content-type':      'application/json',
        },
        timeout: 45_000,
      }
    )

    const rawText = (llmResponse.data?.content?.[0]?.text as string) ?? ''

    let rawParsed: unknown
    try { rawParsed = extractJSON(rawText) } catch { rawParsed = {} }

    await supabase
      .from('agent_runs')
      .update({ llm_raw_output_json: { text: rawText } })
      .eq('id', runId)

    const { data: llmMsg, valid: llmValid } = parseLLMRevopsResponse(rawParsed)

    // ── 15. Assemble final output — guardrails override LLM ──────────────────
    const { data: revops, guardrail } = assembleRevopsOutput({
      reportDate,
      metrics,
      budgetStatus,
      llmResponse:        llmMsg,
      commissionDueTotal,
    })

    await supabase
      .from('agent_runs')
      .update({ llm_normalized_output_json: revops as unknown as Record<string, unknown> })
      .eq('id', runId)

    // ── 16. Upsert revops_reports ─────────────────────────────────────────────
    const { data: reportRow, error: reportError } = await supabase
      .from('revops_reports')
      .upsert(
        {
          report_date:           reportDate,
          budget_vs_actual:      revops.budget_vs_actual,
          cac_7d:                revops.cac_7d,
          cac_30d:               revops.cac_30d,
          roas_30d:              revops.roas_30d,
          payback_estimate_days: revops.payback_estimate_days,
          scale_pause_flag:      revops.scale_pause_flag,
          scale_pause_reason:    revops.scale_pause_reason,
          pipeline_health_score: revops.pipeline_health_score,
          partner_roi_summary:   revops.partner_roi_summary,
          commission_due_total:  revops.commission_due_total,
          revops_version:        revops.revops_version,
        },
        { onConflict: 'report_date' }
      )
      .select('id')
      .single()

    if (reportError || !reportRow) {
      throw new Error(`revops_reports upsert failed: ${reportError?.message}`)
    }

    const reportId = reportRow.id as string

    // ── 17. Audit logs ────────────────────────────────────────────────────────
    await supabase.from('audit_logs').insert({
      entity_type: 'case',
      entity_id:   reportId,
      action:      'revops_report_generated',
      actor:       'revops_agent',
      metadata: {
        report_date:           reportDate,
        scale_pause_flag:      revops.scale_pause_flag,
        pipeline_health_score: revops.pipeline_health_score,
        cac_7d:                revops.cac_7d,
        cac_30d:               revops.cac_30d,
        roas_30d:              revops.roas_30d,
        commission_due_total:  commissionDueTotal,
        sla_breach_rate:       slaBreachRate,
        normalized:            !llmValid,
      },
    })

    if (!llmValid) {
      console.warn('[revops/service] LLM normalization applied')
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   reportId,
        action:      'fallback_triggered',
        actor:       'revops_agent',
        metadata:    { report_date: reportDate },
      })
    }

    if (revops.scale_pause_flag === 'pause') {
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   reportId,
        action:      'spend_paused',
        actor:       'revops_agent',
        metadata:    { reason: guardrail.reason, report_date: reportDate },
      })
    }

    // ── 18. Create tasks ──────────────────────────────────────────────────────
    const tasks: { task_type: string; priority: number }[] = [
      { task_type: 'revops_report_ready', priority: 2 },
    ]

    if (revops.scale_pause_flag === 'pause') {
      tasks.push({ task_type: 'spend_pause_alert',  priority: 1 })
    } else if (revops.scale_pause_flag === 'scale') {
      tasks.push({ task_type: 'spend_scale_signal', priority: 2 })
    }

    if (commissionDueTotal > 0) {
      tasks.push({ task_type: 'partner_commissions_due', priority: 3 })
    }

    for (const task of tasks) {
      await supabase.from('agent_tasks').insert({
        agent_id:  'revops',
        case_id:   null,
        task_type: task.task_type,
        status:    'pending',
        priority:  task.priority,
        payload: {
          report_date:           reportDate,
          report_id:             reportId,
          scale_pause_flag:      revops.scale_pause_flag,
          scale_pause_reason:    guardrail.reason,
          pipeline_health_score: revops.pipeline_health_score,
          commission_due_total:  commissionDueTotal,
        },
      })
      await supabase.from('audit_logs').insert({
        entity_type: 'task',
        entity_id:   reportId,
        action:      'task_created',
        actor:       'revops_agent',
        metadata:    { task_type: task.task_type, priority: task.priority },
      })
    }

    // ── 19. Mark agent_run completed ──────────────────────────────────────────
    await supabase
      .from('agent_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', runId)

    console.log(
      `[revops/service] ${reportDate} → flag: ${revops.scale_pause_flag} | ` +
      `health: ${revops.pipeline_health_score} | cac_7d: ${cac7d?.toFixed(2) ?? 'N/A'} | ` +
      `roas_30d: ${roas30d?.toFixed(2) ?? 'N/A'} | commission: $${commissionDueTotal.toFixed(2)} | ` +
      `tasks: ${tasks.map(t => t.task_type).join(', ')}`
    )

    return {
      success:               true,
      report_date:           reportDate,
      run_id:                runId,
      report_id:             reportId,
      scale_pause_flag:      revops.scale_pause_flag,
      scale_pause_reason:    guardrail.reason,
      pipeline_health_score: revops.pipeline_health_score,
      cac_7d:                revops.cac_7d,
      cac_30d:               revops.cac_30d,
      roas_30d:              revops.roas_30d,
      commission_due_total:  revops.commission_due_total,
      tasks_created:         tasks.map(t => t.task_type),
      normalized:            !llmValid,
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[revops/service] Failed:', msg)
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
