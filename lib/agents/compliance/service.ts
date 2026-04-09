import axios                           from 'axios'
import { randomUUID }                  from 'crypto'
import { SupabaseClient }              from '@supabase/supabase-js'
import { normalizeComplianceOutput }   from './validate'
import { ComplianceObligation, RenewalOpportunity } from './schema'

export interface ComplianceResult {
  success:                boolean
  case_id:                string
  run_id:                 string
  skipped?:               boolean
  compliance_risk_level?: string
  confidence_score?:      number
  requires_human_review?: boolean
  obligations_count?:     number
  renewal_queue_count?:   number
  tasks_created:          string[]
  normalized:             boolean
  error?:                 string
}

// Strip markdown fences if LLM wraps the JSON response
function extractJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return JSON.parse(fenced[1].trim())
  return JSON.parse(text.trim())
}

function buildPrompt(
  promptText:  string,
  caseData:    Record<string, unknown>,
  routeMatrix: unknown[],
  currentDate: string
): string {
  return promptText
    .replace('{{CASE_DATA}}',    JSON.stringify(caseData,    null, 2))
    .replace('{{ROUTE_MATRIX}}', JSON.stringify(routeMatrix, null, 2))
    .replace('{{CURRENT_DATE}}', currentDate)
}

export async function runCompliance(
  caseId:   string,   // external UUID (cases.case_id)
  supabase: SupabaseClient
): Promise<ComplianceResult> {
  const runId = randomUUID()

  // ── 1. Idempotency gate ────────────────────────────────────────────────────
  const { error: runInsertError } = await supabase
    .from('agent_runs')
    .insert({
      id:            runId,
      agent_id:      'compliance',
      version:       'compliance-v1.0',
      status:        'pending',
      trigger_type:  'webhook',
      source_ref_id: caseId,
      started_at:    new Date().toISOString(),
    })

  if (runInsertError) {
    if (runInsertError.code === '23505') {
      console.log(`[compliance/service] Skipped — case ${caseId} already claimed`)
      return {
        success:      true,
        case_id:      caseId,
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

    // ── 3. Read case (by external case_id) ──────────────────────────────────
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select(
        'id, case_id, assigned_route, complexity, normalized_output, clasificador_output, ' +
        'requires_human_review, confidence_score, compliance_risk_level'
      )
      .eq('case_id', caseId)
      .single()

    if (caseError || !caseRow) throw new Error(`Case not found: ${caseId}`)
    const internalId = caseRow.id as string

    // ── 4. Read active prompt ────────────────────────────────────────────────
    const { data: prompt, error: promptError } = await supabase
      .from('prompt_versions')
      .select('prompt_text, version_label')
      .eq('agent_id', 'compliance')
      .eq('is_active', true)
      .single()

    if (promptError || !prompt) throw new Error('Active prompt for compliance not found')

    // ── 5. Read route_matrix for regulatory context ──────────────────────────
    const { data: routeMatrix, error: matrixError } = await supabase
      .from('route_matrix')
      .select('route, regulatory_notes, typical_days, upsells_default')

    if (matrixError) throw new Error(`route_matrix read failed: ${matrixError.message}`)

    // ── 6. Build LLM context ─────────────────────────────────────────────────
    const normalized  = caseRow.normalized_output  as Record<string, unknown> | null
    const classified  = caseRow.clasificador_output as Record<string, unknown> | null
    const cliente     = (normalized?.cliente as Record<string, unknown> | null) ?? {}

    const caseData: Record<string, unknown> = {
      case_id:               caseId,
      assigned_route:        caseRow.assigned_route       ?? classified?.assigned_route ?? 'unknown',
      complexity:            caseRow.complexity           ?? classified?.complexity     ?? 'unknown',
      estado_objetivo:       cliente.estado_objetivo      ?? 'unknown',
      pais_origen:           cliente.pais_origen          ?? 'unknown',
      client_name:           cliente.nombre               ?? 'Desconocido',
      servicio_solicitado:   normalized?.servicio_solicitado ?? '',
      requires_human_review: caseRow.requires_human_review ?? false,
      // Surface document flags for risk assessment
      documents_summary: {
        fraud_flag_present:        classified?.fraud_flag         ?? false,
        name_mismatch_present:     classified?.name_mismatch_flag ?? false,
        documents_qa_pending:      (normalized as Record<string, unknown> | null)?.documents_qa_pending ?? true,
      },
      regulatory_risks:     classified?.regulatory_risks  ?? [],
      upsells_eligible:     classified?.upsells_eligible  ?? [],
    }

    const llmInput = { case_id: caseId, case_data: caseData }

    await supabase
      .from('agent_runs')
      .update({ input_normalized_json: llmInput })
      .eq('id', runId)

    // ── 7. Call LLM ──────────────────────────────────────────────────────────
    const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const userPrompt  = buildPrompt(
      prompt.prompt_text as string,
      caseData,
      routeMatrix ?? [],
      currentDate
    )

    const llmResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model:      process.env.COMPLIANCE_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 4096,
        system:     'You are an expert business compliance analyst. Respond with valid JSON only — no prose, no markdown, no legal advice.',
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
    try { rawParsed = extractJSON(rawText) } catch { rawParsed = { raw_text: rawText } }

    await supabase
      .from('agent_runs')
      .update({ llm_raw_output_json: { text: rawText } })
      .eq('id', runId)

    // ── 8. Normalize + enforce business rules ─────────────────────────────────
    const { data: compliance, normalized: wasNormalized, issues } =
      normalizeComplianceOutput(rawParsed, caseId)

    await supabase
      .from('agent_runs')
      .update({ llm_normalized_output_json: compliance as unknown as Record<string, unknown> })
      .eq('id', runId)

    // ── 9. Upsert compliance_timeline rows ────────────────────────────────────
    // One row per obligation per case. ON CONFLICT updates in place so re-runs
    // are safe and the timeline reflects the latest LLM assessment.
    if (compliance.obligations.length > 0) {
      const timelineRows = compliance.obligations.map((ob: ComplianceObligation) => ({
        case_id:          internalId,
        obligation_code:  ob.code,
        obligation_label: ob.label,
        due_date:         ob.due_date ?? null,
        frequency:        ob.frequency,
        status:           ob.status,
        priority:         ob.priority,
        notes:            ob.notes ?? null,
      }))

      const { error: timelineError } = await supabase
        .from('compliance_timeline')
        .upsert(timelineRows, { onConflict: 'case_id,obligation_code' })

      if (timelineError) {
        console.error('[compliance/service] compliance_timeline upsert error:', timelineError)
      }
    }

    // ── 10. Upsert renewal_queue rows ─────────────────────────────────────────
    if (compliance.renewal_revenue_queue.length > 0) {
      const renewalRows = compliance.renewal_revenue_queue.map((r: RenewalOpportunity) => ({
        case_id:                 internalId,
        service_type:            r.service_type,
        due_date:                r.due_date ?? null,
        estimated_revenue:       r.estimated_revenue,
        priority:                r.priority,
        auto_notify_days_before: r.auto_notify_days_before,
        status:                  'pending',
      }))

      const { error: renewalError } = await supabase
        .from('renewal_queue')
        .upsert(renewalRows, { onConflict: 'case_id,service_type' })

      if (renewalError) {
        console.error('[compliance/service] renewal_queue upsert error:', renewalError)
      }
    }

    // ── 11. Update case ───────────────────────────────────────────────────────
    const inheritedHumanReview = !!caseRow.requires_human_review
    const humanReview = compliance.requires_human_review || inheritedHumanReview

    await supabase
      .from('cases')
      .update({
        compliance_risk_level:   compliance.compliance_risk_level,
        compliance_completed_at: new Date().toISOString(),
        compliance_rule_version: compliance.rule_version,
        compliance_output:       compliance as unknown as Record<string, unknown>,
        requires_human_review:   humanReview,
        status:                  humanReview ? 'pending' : 'in_progress',
      })
      .eq('id', internalId)

    // ── 12. Audit logs ────────────────────────────────────────────────────────
    await supabase.from('audit_logs').insert({
      entity_type: 'case',
      entity_id:   internalId,
      action:      'compliance_completed',
      actor:       'compliance_agent',
      metadata: {
        assigned_route:        compliance.assigned_route,
        estado_objetivo:       compliance.estado_objetivo,
        compliance_risk_level: compliance.compliance_risk_level,
        confidence_score:      compliance.confidence_score,
        obligations_count:     compliance.obligations.length,
        renewal_queue_count:   compliance.renewal_revenue_queue.length,
        normalized:            wasNormalized,
      },
    })

    if (wasNormalized) {
      console.warn('[compliance/service] Normalization applied — issues:', issues)
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   internalId,
        action:      'fallback_triggered',
        actor:       'compliance_agent',
        metadata:    { issues },
      })
    }

    if (compliance.requires_human_review) {
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   internalId,
        action:      'human_review_flagged',
        actor:       'compliance_agent',
        metadata: {
          reason:                compliance.human_review_reason,
          compliance_risk_level: compliance.compliance_risk_level,
          confidence_score:      compliance.confidence_score,
        },
      })
    }

    // ── 13. Create downstream tasks ───────────────────────────────────────────
    const tasks: { task_type: string; priority: number }[] = [
      { task_type: 'compliance_review_pending', priority: 2 },
    ]

    if (compliance.requires_human_review) {
      tasks.push({ task_type: 'compliance_human_review', priority: 1 })
    }

    if (compliance.compliance_risk_level === 'critical') {
      tasks.push({ task_type: 'compliance_critical_risk', priority: 1 })
    }

    for (const task of tasks) {
      await supabase.from('agent_tasks').insert({
        agent_id:  'compliance',
        case_id:   internalId,
        task_type: task.task_type,
        status:    'pending',
        priority:  task.priority,
        payload: {
          case_id:               caseId,
          assigned_route:        compliance.assigned_route,
          compliance_risk_level: compliance.compliance_risk_level,
          obligations_count:     compliance.obligations.length,
          renewal_queue_count:   compliance.renewal_revenue_queue.length,
        },
      })
      await supabase.from('audit_logs').insert({
        entity_type: 'task',
        entity_id:   internalId,
        action:      'task_created',
        actor:       'compliance_agent',
        metadata:    { task_type: task.task_type, priority: task.priority },
      })
    }

    // ── 14. Mark agent_run completed ──────────────────────────────────────────
    await supabase
      .from('agent_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', runId)

    console.log(
      `[compliance/service] case ${internalId} → risk: ${compliance.compliance_risk_level} | ` +
      `obligations: ${compliance.obligations.length} | renewals: ${compliance.renewal_revenue_queue.length} | ` +
      `confidence: ${compliance.confidence_score} | human_review: ${humanReview} | ` +
      `tasks: ${tasks.map(t => t.task_type).join(', ')}`
    )

    return {
      success:               true,
      case_id:               caseId,
      run_id:                runId,
      compliance_risk_level: compliance.compliance_risk_level,
      confidence_score:      compliance.confidence_score,
      requires_human_review: humanReview,
      obligations_count:     compliance.obligations.length,
      renewal_queue_count:   compliance.renewal_revenue_queue.length,
      tasks_created:         tasks.map(t => t.task_type),
      normalized:            wasNormalized,
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[compliance/service] Failed:', msg)
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
