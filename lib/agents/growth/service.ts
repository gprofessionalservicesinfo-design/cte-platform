import axios                    from 'axios'
import { randomUUID }           from 'crypto'
import { SupabaseClient }       from '@supabase/supabase-js'
import { normalizeGrowthOutput } from './validate'
import { ContentItem }          from './schema'

export interface GrowthResult {
  success:                         boolean
  week_start:                      string
  run_id:                          string
  skipped?:                        boolean
  report_id?:                      string
  geo_priority_count?:             number
  service_priority_count?:         number
  content_calendar_count?:         number
  landing_page_count?:             number
  master_recommendation?:          string
  organic_cost_per_lead_estimate?: number | null
  tasks_created:                   string[]
  normalized:                      boolean
  error?:                          string
}

// Strip markdown fences if LLM wraps response
function extractJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return JSON.parse(fenced[1].trim())
  return JSON.parse(text.trim())
}

// Normalize week_start to the Monday of that ISO week (YYYY-MM-DD)
function toMondayISO(input: string): string {
  const d = new Date(input)
  if (isNaN(d.getTime())) throw new Error(`Invalid week_start date: ${input}`)
  const day = d.getUTCDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = (day === 0) ? -6 : 1 - day  // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff)
  return d.toISOString().split('T')[0]
}

function buildPrompt(
  promptText:   string,
  weekContext:  Record<string, unknown>,
  priorReport:  Record<string, unknown> | null,
  routeMatrix:  unknown[]
): string {
  return promptText
    .replace('{{WEEK_CONTEXT}}',  JSON.stringify(weekContext,  null, 2))
    .replace('{{PRIOR_REPORT}}',  JSON.stringify(priorReport ?? { note: 'No hay reporte previo disponible' }, null, 2))
    .replace('{{ROUTE_MATRIX}}',  JSON.stringify(routeMatrix,  null, 2))
}

export async function runGrowth(
  weekStartRaw: string,
  supabase:     SupabaseClient
): Promise<GrowthResult> {
  const runId    = randomUUID()
  const weekStart = toMondayISO(weekStartRaw)

  // ── 1. Idempotency gate ────────────────────────────────────────────────────
  const { error: runInsertError } = await supabase
    .from('agent_runs')
    .insert({
      id:            runId,
      agent_id:      'growth',
      version:       'growth-v1.0',
      status:        'pending',
      trigger_type:  'webhook',
      source_ref_id: weekStart,
      started_at:    new Date().toISOString(),
    })

  if (runInsertError) {
    if (runInsertError.code === '23505') {
      console.log(`[growth/service] Skipped — week ${weekStart} already claimed`)
      return {
        success:      true,
        week_start:   weekStart,
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

    // ── 3. Read previous growth report (trend continuity context) ────────────
    const { data: priorRow } = await supabase
      .from('growth_reports')
      .select('week_start, geo_priority, service_priority, master_recommendation')
      .lt('week_start', weekStart)
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle()

    const priorReport = priorRow
      ? {
          week_start:          priorRow.week_start,
          geo_priority:        priorRow.geo_priority,
          service_priority:    priorRow.service_priority,
          master_recommendation: priorRow.master_recommendation,
        }
      : null

    // ── 4. Read route_matrix (service taxonomy) ───────────────────────────────
    const { data: routeMatrix, error: matrixError } = await supabase
      .from('route_matrix')
      .select('route, regulatory_notes, upsells_default, typical_days')

    if (matrixError) throw new Error(`route_matrix read failed: ${matrixError.message}`)

    // ── 5. Read active prompt ────────────────────────────────────────────────
    const { data: prompt, error: promptError } = await supabase
      .from('prompt_versions')
      .select('prompt_text, version_label')
      .eq('agent_id', 'growth')
      .eq('is_active', true)
      .single()

    if (promptError || !prompt) throw new Error('Active prompt for growth not found')

    // ── 6. Build LLM context ─────────────────────────────────────────────────
    const currentDate = new Date().toISOString().split('T')[0]
    const weekContext: Record<string, unknown> = {
      week_start:   weekStart,
      current_date: currentDate,
      note:         'Genera el reporte para la semana que inicia el lunes indicado.',
    }

    const llmInput = { week_start: weekStart, week_context: weekContext }

    await supabase
      .from('agent_runs')
      .update({ input_normalized_json: llmInput })
      .eq('id', runId)

    // ── 7. Call LLM ──────────────────────────────────────────────────────────
    const userPrompt = buildPrompt(
      prompt.prompt_text as string,
      weekContext,
      priorReport,
      routeMatrix ?? []
    )

    const llmResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model:      process.env.GROWTH_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 6144,
        system:     'You are an expert growth strategist for a US business formation company serving Latin American clients. Respond with valid JSON only — no prose, no markdown.',
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
    try { rawParsed = extractJSON(rawText) } catch { rawParsed = { raw_text: rawText } }

    await supabase
      .from('agent_runs')
      .update({ llm_raw_output_json: { text: rawText } })
      .eq('id', runId)

    // ── 8. Normalize + apply business rules ───────────────────────────────────
    const { data: growth, normalized: wasNormalized, issues } =
      normalizeGrowthOutput(rawParsed, weekStart)

    await supabase
      .from('agent_runs')
      .update({ llm_normalized_output_json: growth as unknown as Record<string, unknown> })
      .eq('id', runId)

    // ── 9. Upsert growth_reports (ON CONFLICT week_start DO UPDATE) ───────────
    const { data: reportRow, error: reportError } = await supabase
      .from('growth_reports')
      .upsert(
        {
          week_start:                     weekStart,
          geo_priority:                   growth.geo_priority,
          service_priority:               growth.service_priority,
          keyword_clusters:               growth.keyword_clusters,
          content_calendar:               growth.content_calendar,
          landing_page_recommendations:   growth.landing_page_recommendations,
          master_recommendation:          growth.master_recommendation,
          organic_cost_per_lead_estimate: growth.organic_cost_per_lead_estimate,
          growth_version:                 growth.growth_version,
        },
        { onConflict: 'week_start' }
      )
      .select('id')
      .single()

    if (reportError || !reportRow) {
      throw new Error(`growth_reports upsert failed: ${reportError?.message}`)
    }

    const reportId = reportRow.id as string

    // ── 10. Delete + re-insert content_items for this report ──────────────────
    // Delete first to ensure re-runs produce a clean slate (no duplicates).
    await supabase
      .from('content_items')
      .delete()
      .eq('growth_report_id', reportId)

    if (growth.content_calendar.length > 0) {
      const contentRows = growth.content_calendar.map((item: ContentItem) => ({
        growth_report_id: reportId,
        content_id:       item.content_id,
        type:             item.type,
        title:            item.title,
        hook:             item.hook,
        cta:              item.cta,
        target_country:   item.target_country,
        target_service:   item.target_service,
        platform:         item.platform,
        status:           item.status,
        scheduled_date:   item.scheduled_date ?? null,
      }))

      const { error: contentError } = await supabase
        .from('content_items')
        .insert(contentRows)

      if (contentError) {
        console.error('[growth/service] content_items insert error:', contentError)
      }
    }

    // ── 11. Audit logs ────────────────────────────────────────────────────────
    await supabase.from('audit_logs').insert({
      entity_type: 'case',   // growth has no case — use 'case' entity_type with report id
      entity_id:   reportId,
      action:      'growth_report_generated',
      actor:       'growth_agent',
      metadata: {
        week_start:                     weekStart,
        report_id:                      reportId,
        geo_priority_count:             growth.geo_priority.length,
        service_priority_count:         growth.service_priority.length,
        keyword_clusters_count:         growth.keyword_clusters.length,
        content_calendar_count:         growth.content_calendar.length,
        landing_page_count:             growth.landing_page_recommendations.length,
        organic_cost_per_lead_estimate: growth.organic_cost_per_lead_estimate,
        normalized:                     wasNormalized,
      },
    })

    if (wasNormalized) {
      console.warn('[growth/service] Normalization applied — issues:', issues)
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   reportId,
        action:      'fallback_triggered',
        actor:       'growth_agent',
        metadata:    { week_start: weekStart, issues },
      })
    }

    // ── 12. Create downstream tasks ───────────────────────────────────────────
    // Growth tasks have no case_id (case_id is nullable in agent_tasks).
    const tasks: { task_type: string; priority: number }[] = [
      { task_type: 'growth_report_ready',    priority: 3 },
      { task_type: 'content_calendar_ready', priority: 3 },
    ]

    for (const task of tasks) {
      await supabase.from('agent_tasks').insert({
        agent_id:  'growth',
        case_id:   null,
        task_type: task.task_type,
        status:    'pending',
        priority:  task.priority,
        payload: {
          week_start:                     weekStart,
          report_id:                      reportId,
          content_calendar_count:         growth.content_calendar.length,
          top_geo:                        growth.geo_priority[0]?.country ?? null,
          top_service:                    growth.service_priority[0]?.service ?? null,
          master_recommendation:          growth.master_recommendation,
          organic_cost_per_lead_estimate: growth.organic_cost_per_lead_estimate,
        },
      })
      await supabase.from('audit_logs').insert({
        entity_type: 'task',
        entity_id:   reportId,
        action:      'task_created',
        actor:       'growth_agent',
        metadata:    { task_type: task.task_type, priority: task.priority, week_start: weekStart },
      })
    }

    // ── 13. Mark agent_run completed ──────────────────────────────────────────
    await supabase
      .from('agent_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', runId)

    console.log(
      `[growth/service] week ${weekStart} → report: ${reportId} | ` +
      `geo: ${growth.geo_priority.length} | services: ${growth.service_priority.length} | ` +
      `calendar: ${growth.content_calendar.length} | ` +
      `landing_pages: ${growth.landing_page_recommendations.length} | ` +
      `normalized: ${wasNormalized}`
    )

    return {
      success:                        true,
      week_start:                     weekStart,
      run_id:                         runId,
      report_id:                      reportId,
      geo_priority_count:             growth.geo_priority.length,
      service_priority_count:         growth.service_priority.length,
      content_calendar_count:         growth.content_calendar.length,
      landing_page_count:             growth.landing_page_recommendations.length,
      master_recommendation:          growth.master_recommendation,
      organic_cost_per_lead_estimate: growth.organic_cost_per_lead_estimate,
      tasks_created:                  tasks.map(t => t.task_type),
      normalized:                     wasNormalized,
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[growth/service] Failed:', msg)
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
