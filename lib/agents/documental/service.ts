import axios                           from 'axios'
import { randomUUID }                  from 'crypto'
import { SupabaseClient }              from '@supabase/supabase-js'
import { normalizeDocumentalOutput }   from './validate'
import { DOC_TYPE_CHECKLIST_MAP, DocumentalOutput } from './schema'

export interface DocumentalResult {
  success:                boolean
  case_id:                string
  document_id:            string
  run_id:                 string
  skipped?:               boolean
  doc_type?:              string
  legibility_score?:      number
  status?:                string
  requires_human_review?: boolean
  confidence_score?:      number
  tasks_created:          string[]
  normalized:             boolean
  error?:                 string
}

// Compound idempotency key — one review run per document per case
function makeSourceRef(caseId: string, documentId: string): string {
  return `${caseId}::${documentId}`
}

// Strip markdown fences if LLM wraps response
function extractJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return JSON.parse(fenced[1].trim())
  return JSON.parse(text.trim())
}

function buildPrompt(
  promptText: string,
  documentMetadata: Record<string, unknown>,
  caseContext:      Record<string, unknown>
): string {
  return promptText
    .replace('{{DOCUMENT_METADATA}}', JSON.stringify(documentMetadata, null, 2))
    .replace('{{CASE_CONTEXT}}',      JSON.stringify(caseContext,      null, 2))
}

// Find checklist items matching the document's doc_type and update their status.
// Operates on a copy of the checklist array — does not mutate input.
function updateChecklistItems(
  items:    unknown[],
  docType:  string,
  qaStatus: string
): { updated: unknown[]; matched: boolean } {
  const targetCodes = DOC_TYPE_CHECKLIST_MAP[docType] ?? []
  if (targetCodes.length === 0) return { updated: items, matched: false }

  let matched = false
  const newStatus = qaStatus === 'accepted'
    ? 'accepted'
    : qaStatus === 'rejected'
      ? 'rejected'
      : 'requires_review'

  const updated = items.map((item) => {
    const i = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>
    if (typeof i.code === 'string' && targetCodes.includes(i.code)) {
      matched = true
      return { ...i, status: newStatus }
    }
    return item
  })

  return { updated, matched }
}

// Compute acceptance rate from all reviewed documents for this case (via case.id internal)
async function computeFirstPassRate(
  internalCaseId: string,
  supabase:       SupabaseClient
): Promise<{ rate: number; allDone: boolean }> {
  const { data: docs } = await supabase
    .from('documents')
    .select('qa_status')
    .eq('case_id', internalCaseId)

  if (!docs || docs.length === 0) return { rate: 0, allDone: false }

  const total    = docs.length
  const accepted = docs.filter(d => d.qa_status === 'accepted').length
  const pending  = docs.filter(d => d.qa_status === 'pending').length

  return {
    rate:    accepted / total,
    allDone: pending === 0,
  }
}

export async function runDocumental(
  caseId:     string,   // external UUID (cases.case_id)
  documentId: string,   // primary key (public.documents.id)
  supabase:   SupabaseClient
): Promise<DocumentalResult> {
  const runId     = randomUUID()
  const sourceRef = makeSourceRef(caseId, documentId)

  // ── 1. Idempotency gate ────────────────────────────────────────────────────
  const { error: runInsertError } = await supabase
    .from('agent_runs')
    .insert({
      id:            runId,
      agent_id:      'documental',
      version:       'documental-v1.0',
      status:        'pending',
      trigger_type:  'webhook',
      source_ref_id: sourceRef,
      started_at:    new Date().toISOString(),
    })

  if (runInsertError) {
    if (runInsertError.code === '23505') {
      console.log(`[documental/service] Skipped — document ${documentId} already claimed`)
      return {
        success:      true,
        case_id:      caseId,
        document_id:  documentId,
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

    // ── 3. Read document record ──────────────────────────────────────────────
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id, company_id, file_name, file_url, file_size, mime_type, type, created_at')
      .eq('id', documentId)
      .single()

    if (docError || !doc) throw new Error(`Document not found: ${documentId}`)

    // ── 4. Read case (by external case_id) ──────────────────────────────────
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select('id, case_id, normalized_output, clasificador_output, requires_human_review')
      .eq('case_id', caseId)
      .single()

    if (caseError || !caseRow) throw new Error(`Case not found: ${caseId}`)
    const internalCaseId = caseRow.id as string

    // ── 5. Read active prompt ────────────────────────────────────────────────
    const { data: prompt, error: promptError } = await supabase
      .from('prompt_versions')
      .select('prompt_text, version_label')
      .eq('agent_id', 'documental')
      .eq('is_active', true)
      .single()

    if (promptError || !prompt) throw new Error('Active prompt for documental not found')

    // ── 6. Build LLM context ─────────────────────────────────────────────────
    const normalized = caseRow.normalized_output as Record<string, unknown> | null
    const classified = caseRow.clasificador_output as Record<string, unknown> | null
    const cliente    = (normalized?.cliente as Record<string, unknown> | null) ?? {}

    const documentMetadata: Record<string, unknown> = {
      document_id:    documentId,
      file_name:      doc.file_name,
      mime_type:      doc.mime_type ?? 'unknown',
      file_size:      doc.file_size ?? 0,
      file_size_kb:   doc.file_size ? Math.round(doc.file_size / 1024) : 0,
      doc_type_hint:  doc.type ?? 'other',
      storage_path:   doc.file_url,
      uploaded_at:    doc.created_at,
    }

    const intakeChecklist   = (normalized?.checklist_inicial      as unknown[]) ?? []
    const clasifChecklist   = (classified?.checklist_additions    as unknown[]) ?? []
    const allChecklistItems = [...intakeChecklist, ...clasifChecklist]

    const caseContext: Record<string, unknown> = {
      case_id:            caseId,
      client_name:        cliente.nombre          ?? 'Desconocido',
      client_email:       cliente.email           ?? '',
      pais_origen:        cliente.pais_origen     ?? null,
      estado_objetivo:    cliente.estado_objetivo ?? null,
      servicio_solicitado: normalized?.servicio_solicitado ?? '',
      assigned_route:     classified?.assigned_route      ?? null,
      complexity:         classified?.complexity          ?? null,
      expected_documents: allChecklistItems
        .filter((item) => {
          const i = item as Record<string, unknown>
          return i.required === true && i.status !== 'accepted'
        })
        .map((item) => {
          const i = item as Record<string, unknown>
          return { code: i.code, label: i.label }
        }),
    }

    const llmInput = { documentMetadata, caseContext }

    await supabase
      .from('agent_runs')
      .update({ input_normalized_json: llmInput })
      .eq('id', runId)

    // ── 7. Mark case as QA in progress ─────────────────────────────────────
    await supabase
      .from('cases')
      .update({ documents_qa_pending: true })
      .eq('id', internalCaseId)

    // ── 8. Call LLM ──────────────────────────────────────────────────────────
    const userPrompt = buildPrompt(
      prompt.prompt_text as string,
      documentMetadata,
      caseContext
    )

    const llmResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model:      process.env.DOCUMENTAL_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 1024,
        system:     'You are an expert document quality analyst. Respond with valid JSON only — no prose, no markdown.',
        messages:   [{ role: 'user', content: userPrompt }],
      },
      {
        headers: {
          'x-api-key':         process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
          'content-type':      'application/json',
        },
        timeout: 30_000,
      }
    )

    const rawText = (llmResponse.data?.content?.[0]?.text as string) ?? ''

    let rawParsed: unknown
    try { rawParsed = extractJSON(rawText) } catch { rawParsed = { raw_text: rawText } }

    await supabase
      .from('agent_runs')
      .update({ llm_raw_output_json: { text: rawText } })
      .eq('id', runId)

    // ── 9. Normalize + enforce business rules ─────────────────────────────────
    const { data: reviewed, normalized: wasNormalized, issues } =
      normalizeDocumentalOutput(rawParsed, caseId, documentId)

    await supabase
      .from('agent_runs')
      .update({ llm_normalized_output_json: reviewed as unknown as Record<string, unknown> })
      .eq('id', runId)

    // ── 10. Update document record ────────────────────────────────────────────
    await supabase
      .from('documents')
      .update({
        case_id:               internalCaseId,
        doc_type:              reviewed.doc_type,
        storage_path:          doc.file_url,
        legibility_score:      reviewed.legibility_score,
        qa_status:             reviewed.status,
        rejection_reason:      reviewed.rejection_reason,
        fraud_flag:            reviewed.fraud_flag,
        duplicate_flag:        reviewed.duplicate_flag,
        name_mismatch_flag:    reviewed.name_mismatch_flag,
        expiration_flag:       reviewed.expiration_flag,
        manual_review_reason:  reviewed.manual_review_reason,
        confidence_score:      reviewed.confidence_score,
        requires_human_review: reviewed.requires_human_review,
        doc_version:           reviewed.doc_version,
        reviewed_at:           new Date().toISOString(),
        reviewed_by:           'documental_agent',
      })
      .eq('id', documentId)

    // ── 11. Update checklist in case ─────────────────────────────────────────
    let checklistUpdated = false
    {
      const { updated: updatedIntake, matched: intakeMatched } = updateChecklistItems(
        intakeChecklist, reviewed.doc_type, reviewed.status
      )
      const { updated: updatedClasif, matched: clasifMatched } = updateChecklistItems(
        clasifChecklist, reviewed.doc_type, reviewed.status
      )

      checklistUpdated = intakeMatched || clasifMatched

      if (intakeMatched && normalized) {
        await supabase
          .from('cases')
          .update({
            normalized_output: { ...normalized, checklist_inicial: updatedIntake },
          })
          .eq('id', internalCaseId)
      }

      if (clasifMatched && classified) {
        await supabase
          .from('cases')
          .update({
            clasificador_output: { ...classified, checklist_additions: updatedClasif },
          })
          .eq('id', internalCaseId)
      }
    }

    // ── 12. Compute first-pass rate + mark QA done if all reviewed ───────────
    const { rate, allDone } = await computeFirstPassRate(internalCaseId, supabase)

    const caseQAUpdate: Record<string, unknown> = {
      documents_first_pass_rate: rate,
    }
    if (allDone) {
      caseQAUpdate.documents_qa_pending      = false
      caseQAUpdate.documents_qa_completed_at = new Date().toISOString()
    }
    await supabase.from('cases').update(caseQAUpdate).eq('id', internalCaseId)

    // ── 13. Audit logs ────────────────────────────────────────────────────────
    await supabase.from('audit_logs').insert({
      entity_type: 'case',
      entity_id:   internalCaseId,
      action:      'document_reviewed',
      actor:       'documental_agent',
      metadata: {
        document_id:      documentId,
        doc_type:         reviewed.doc_type,
        legibility_score: reviewed.legibility_score,
        qa_status:        reviewed.status,
        confidence_score: reviewed.confidence_score,
        fraud_flag:       reviewed.fraud_flag,
        name_mismatch:    reviewed.name_mismatch_flag,
        checklist_updated: checklistUpdated,
        normalized:       wasNormalized,
      },
    })

    if (wasNormalized) {
      console.warn('[documental/service] Normalization applied — issues:', issues)
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   internalCaseId,
        action:      'fallback_triggered',
        actor:       'documental_agent',
        metadata:    { document_id: documentId, issues },
      })
    }

    if (reviewed.requires_human_review) {
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   internalCaseId,
        action:      'human_review_flagged',
        actor:       'documental_agent',
        metadata: {
          document_id:     documentId,
          reason:          reviewed.manual_review_reason,
          fraud_flag:      reviewed.fraud_flag,
          name_mismatch:   reviewed.name_mismatch_flag,
          confidence_score: reviewed.confidence_score,
        },
      })
    }

    // ── 14. Create downstream tasks ───────────────────────────────────────────
    const tasks: { task_type: string; priority: number }[] = []

    if (reviewed.status === 'rejected') {
      tasks.push({ task_type: 'document_rejected',        priority: 1 })
    } else if (reviewed.status === 'requires_review') {
      tasks.push({ task_type: 'document_requires_review', priority: 2 })
    } else if (reviewed.status === 'accepted') {
      tasks.push({ task_type: 'document_accepted',        priority: 4 })
    }

    if (reviewed.requires_human_review) {
      tasks.push({ task_type: 'document_human_review',   priority: 1 })
    }

    if (allDone) {
      tasks.push({ task_type: 'documents_qa_completed',  priority: 3 })
    }

    for (const task of tasks) {
      await supabase.from('agent_tasks').insert({
        agent_id:  'documental',
        case_id:   internalCaseId,
        task_type: task.task_type,
        status:    'pending',
        priority:  task.priority,
        payload: {
          case_id:          caseId,
          document_id:      documentId,
          doc_type:         reviewed.doc_type,
          qa_status:        reviewed.status,
          rejection_reason: reviewed.rejection_reason,
          fraud_flag:       reviewed.fraud_flag,
          name_mismatch:    reviewed.name_mismatch_flag,
        },
      })
      await supabase.from('audit_logs').insert({
        entity_type: 'task',
        entity_id:   internalCaseId,
        action:      'task_created',
        actor:       'documental_agent',
        metadata:    { task_type: task.task_type, document_id: documentId, priority: task.priority },
      })
    }

    // ── 15. Mark agent_run completed ──────────────────────────────────────────
    await supabase
      .from('agent_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', runId)

    console.log(
      `[documental/service] doc ${documentId} → type: ${reviewed.doc_type} | ` +
      `legibility: ${reviewed.legibility_score} | qa_status: ${reviewed.status} | ` +
      `confidence: ${reviewed.confidence_score} | human_review: ${reviewed.requires_human_review} | ` +
      `pass_rate: ${(rate * 100).toFixed(0)}% | tasks: ${tasks.map(t => t.task_type).join(', ')}`
    )

    return {
      success:               true,
      case_id:               caseId,
      document_id:           documentId,
      run_id:                runId,
      doc_type:              reviewed.doc_type,
      legibility_score:      reviewed.legibility_score,
      status:                reviewed.status,
      requires_human_review: reviewed.requires_human_review,
      confidence_score:      reviewed.confidence_score,
      tasks_created:         tasks.map(t => t.task_type),
      normalized:            wasNormalized,
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[documental/service] Failed:', msg)
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
