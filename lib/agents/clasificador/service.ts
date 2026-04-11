import axios                            from 'axios'
import { randomUUID }                   from 'crypto'
import { SupabaseClient }               from '@supabase/supabase-js'
import { normalizeClasificadorOutput }  from './validate'

export interface ClasificadorResult {
  success:                boolean
  case_id:                string
  run_id:                 string
  skipped?:               boolean
  assigned_route?:        string
  complexity?:            string
  confidence_score?:      number
  requires_human_review?: boolean
  estimated_days?:        number
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
  casePayload: Record<string, unknown>,
  routeMatrix: unknown[]
): string {
  return promptText
    .replace('{{CASE_DATA}}',    JSON.stringify(casePayload,  null, 2))
    .replace('{{ROUTE_MATRIX}}', JSON.stringify(routeMatrix,  null, 2))
}

export async function runClasificador(
  caseId:   string,
  supabase: SupabaseClient
): Promise<ClasificadorResult> {
  const runId = randomUUID()

  // ── 1. Idempotency gate ──────────────────────────────────────────────────
  // UNIQUE(agent_id, source_ref_id) in agent_runs prevents double-processing.
  const { error: runInsertError } = await supabase
    .from('agent_runs')
    .insert({
      id:            runId,
      agent_id:      'clasificador',
      version:       'clasificador-v1.0',
      status:        'pending',
      trigger_type:  'webhook',
      source_ref_id: caseId,
      started_at:    new Date().toISOString(),
    })

  if (runInsertError) {
    if (runInsertError.code === '23505') {
      // Duplicate constraint hit — already processed or in flight, skip silently
      console.log(`[clasificador/service] Skipped — case ${caseId} already claimed`)
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
    // ── 2. Mark running ────────────────────────────────────────────────────
    await supabase
      .from('agent_runs')
      .update({ status: 'running' })
      .eq('id', runId)

    // ── 3. Read case ───────────────────────────────────────────────────────
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, case_id, normalized_output, requires_human_review, confidence_score, status')
      .or(`id.eq.${caseId},case_id.eq.${caseId}`)
      .single()

    if (caseError || !caseRow) {
      throw new Error(`Case not found: ${caseId}`)
    }
    const internalId = caseRow.id as string

    // ── 4. Read active prompt ──────────────────────────────────────────────
    const { data: prompt, error: promptError } = await supabase
      .from('prompt_versions')
      .select('prompt_text, version_label')
      .eq('agent_id', 'clasificador')
      .eq('is_active', true)
      .single()

    if (promptError || !prompt) {
      throw new Error('Active prompt for clasificador not found in prompt_versions')
    }

    // ── 5. Read route_matrix for LLM context ──────────────────────────────
    const { data: routeMatrix, error: matrixError } = await supabase
      .from('route_matrix')
      .select('route, checklist_template, required_documents, typical_days, upsells_default, regulatory_notes')

    if (matrixError) {
      throw new Error(`route_matrix read failed: ${matrixError.message}`)
    }

    // ── 6. Build LLM input and store it ───────────────────────────────────
    const llmInput = {
      case_id:    caseId,
      expediente: caseRow.normalized_output,
    }
    const userPrompt = buildPrompt(
      prompt.prompt_text as string,
      llmInput,
      routeMatrix ?? []
    )

    await supabase
      .from('agent_runs')
      .update({ input_normalized_json: llmInput })
      .eq('id', runId)

    // ── 7. Call LLM ────────────────────────────────────────────────────────
    const llmResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model:      process.env.CLASIFICADOR_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 2048,
        system:     'You are an expert business formation classifier. Respond with valid JSON only — no prose, no markdown, no explanation.',
        messages:   [{ role: 'user', content: userPrompt }],
      },
      {
        headers: {
          'x-api-key':         process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
          'content-type':      'application/json',
        },
        timeout: 50_000,
      }
    )

    const rawText = (llmResponse.data?.content?.[0]?.text as string) ?? ''

    let rawParsed: unknown
    try {
      rawParsed = extractJSON(rawText)
    } catch {
      rawParsed = { raw_text: rawText }
    }

    await supabase
      .from('agent_runs')
      .update({ llm_raw_output_json: { text: rawText } })
      .eq('id', runId)

    // ── 8. Validate and normalize ──────────────────────────────────────────
    const { data: classified, normalized: wasNormalized, issues } =
      normalizeClasificadorOutput(rawParsed, caseId)

    await supabase
      .from('agent_runs')
      .update({ llm_normalized_output_json: classified as unknown as Record<string, unknown> })
      .eq('id', runId)

    // ── 9. Update case — extend, never overwrite Intake fields ────────────
    const humanReview = classified.requires_human_review || !!caseRow.requires_human_review
    await supabase
      .from('cases')
      .update({
        assigned_route:               classified.assigned_route,
        complexity:                   classified.complexity,
        route_confidence_score:       classified.confidence_score,
        estimated_days:               classified.estimated_days,
        route_classified_at:          new Date().toISOString(),
        route_version:                classified.route_version,
        route_classification_pending: false,
        clasificador_output:          classified as unknown as Record<string, unknown>,
        requires_human_review:        humanReview,
        status:                       humanReview ? 'pending' : 'in_progress',
      })
      .eq('id', internalId)

    // ── 10. Audit — route_classification_completed ─────────────────────────
    await supabase.from('audit_logs').insert({
      entity_type: 'case',
      entity_id:   internalId,
      action:      'route_classification_completed',
      actor:       'clasificador_agent',
      metadata: {
        assigned_route:   classified.assigned_route,
        complexity:       classified.complexity,
        confidence_score: classified.confidence_score,
        estimated_days:   classified.estimated_days,
        upsells_eligible: classified.upsells_eligible,
        regulatory_risks: classified.regulatory_risks,
        normalized:       wasNormalized,
      },
    })

    if (wasNormalized) {
      console.warn('[clasificador/service] Normalization applied — issues:', issues)
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   internalId,
        action:      'fallback_triggered',
        actor:       'clasificador_agent',
        metadata:    { issues },
      })
    }

    if (classified.requires_human_review) {
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   internalId,
        action:      'human_review_flagged',
        actor:       'clasificador_agent',
        metadata: {
          reason:           classified.human_review_reason,
          confidence_score: classified.confidence_score,
        },
      })
    }

    // ── 11. Create downstream tasks ────────────────────────────────────────
    const tasks: { task_type: string; priority: number }[] = [
      { task_type: 'route_classification_completed', priority: 2 },
      ...(classified.requires_human_review
        ? [{ task_type: 'clasificador_human_review', priority: 1 }]
        : []),
    ]

    for (const task of tasks) {
      await supabase.from('agent_tasks').insert({
        agent_id:  'clasificador',
        case_id:   internalId,
        task_type: task.task_type,
        status:    'pending',
        priority:  task.priority,
        payload: {
          case_id:        caseId,
          assigned_route: classified.assigned_route,
          complexity:     classified.complexity,
        },
      })
      await supabase.from('audit_logs').insert({
        entity_type: 'task',
        entity_id:   internalId,
        action:      'task_created',
        actor:       'clasificador_agent',
        metadata:    { task_type: task.task_type, priority: task.priority },
      })
    }

    // ── 12. Mark agent_run completed ───────────────────────────────────────
    await supabase
      .from('agent_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', runId)

    console.log(
      `[clasificador/service] case ${internalId} → route: ${classified.assigned_route} | ` +
      `complexity: ${classified.complexity} | confidence: ${classified.confidence_score} | ` +
      `days: ${classified.estimated_days} | human_review: ${humanReview} | ` +
      `tasks: ${tasks.map(t => t.task_type).join(', ')}`
    )

    return {
      success:               true,
      case_id:               caseId,
      run_id:                runId,
      assigned_route:        classified.assigned_route,
      complexity:            classified.complexity,
      confidence_score:      classified.confidence_score,
      requires_human_review: humanReview,
      estimated_days:        classified.estimated_days,
      tasks_created:         tasks.map(t => t.task_type),
      normalized:            wasNormalized,
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[clasificador/service] Failed:', msg)
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
