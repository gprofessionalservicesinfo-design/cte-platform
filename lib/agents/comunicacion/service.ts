import axios                         from 'axios'
import { randomUUID }                from 'crypto'
import { SupabaseClient }            from '@supabase/supabase-js'
import { parseLLMMessageResponse }   from './validate'
import { TASK_TYPE_TO_TEMPLATE }     from './schema'
import { sendWhatsAppMessage }       from './channels/whatsapp'
import { sendEmailMessage }          from './channels/email'

export interface ComunicacionResult {
  success:             boolean
  case_id:             string
  task_id:             string
  run_id:              string
  skipped?:            boolean
  channel?:            string
  delivery_status?:    string
  template_used?:      string
  language?:           string
  confidence_score?:   number
  skip_reason?:        string
  tasks_created:       string[]
  normalized:          boolean
  error?:              string
}

// Strip markdown fences if LLM wraps response
function extractJSON(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return JSON.parse(fenced[1].trim())
  return JSON.parse(text.trim())
}

function buildPrompt(
  promptText:   string,
  caseContext:  Record<string, unknown>,
  taskType:     string,
  templateHint: string
): string {
  return promptText
    .replace('{{CASE_CONTEXT}}',   JSON.stringify(caseContext, null, 2))
    .replace('{{TASK_TYPE}}',      taskType)
    .replace('{{TEMPLATE_HINT}}',  templateHint)
}

// Is the current UTC time inside a quiet window?
// Handles overnight ranges e.g. 22:00–08:00.
function isInQuietHours(
  quietStart: string | null,
  quietEnd:   string | null
): boolean {
  if (!quietStart || !quietEnd) return false

  const now      = new Date()
  const nowMins  = now.getUTCHours() * 60 + now.getUTCMinutes()

  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + (m ?? 0)
  }

  const startMins = toMins(quietStart)
  const endMins   = toMins(quietEnd)

  // Overnight range (e.g. 22:00 → 08:00)
  if (startMins > endMins) return nowMins >= startMins || nowMins < endMins
  return nowMins >= startMins && nowMins < endMins
}

export async function runComunicacion(
  caseId:   string,   // external UUID (cases.case_id)
  taskId:   string,   // agent_tasks.id (primary key)
  supabase: SupabaseClient
): Promise<ComunicacionResult> {
  const runId = randomUUID()

  // ── 1. Idempotency gate ────────────────────────────────────────────────────
  const { error: runInsertError } = await supabase
    .from('agent_runs')
    .insert({
      id:            runId,
      agent_id:      'comunicacion',
      version:       'comunicacion-v1.0',
      status:        'pending',
      trigger_type:  'webhook',
      source_ref_id: taskId,
      started_at:    new Date().toISOString(),
    })

  if (runInsertError) {
    if (runInsertError.code === '23505') {
      console.log(`[comunicacion/service] Skipped — task ${taskId} already claimed`)
      return {
        success:      true,
        case_id:      caseId,
        task_id:      taskId,
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

    // ── 3. Read task ─────────────────────────────────────────────────────────
    const { data: task, error: taskError } = await supabase
      .from('agent_tasks')
      .select('id, case_id, task_type, payload, status')
      .eq('id', taskId)
      .single()

    if (taskError || !task) throw new Error(`Task not found: ${taskId}`)

    // task.case_id is the internal cases.id (UUID)
    const internalCaseId = task.case_id as string
    const taskType       = task.task_type as string
    const taskPayload    = (task.payload ?? {}) as Record<string, unknown>

    // ── 4. Read case ─────────────────────────────────────────────────────────
    const { data: caseRow, error: caseError } = await supabase
      .from('cases')
      .select(
        'id, case_id, normalized_output, clasificador_output, compliance_output, ' +
        'assigned_route, complexity, compliance_risk_level, requires_human_review'
      )
      .eq('id', internalCaseId)
      .single()

    if (caseError || !caseRow) throw new Error(`Case not found (internal id): ${internalCaseId}`)

    const normalized   = caseRow.normalized_output  as Record<string, unknown> | null
    const classified   = caseRow.clasificador_output as Record<string, unknown> | null
    const cliente      = (normalized?.cliente        as Record<string, unknown> | null) ?? {}

    // ── 5. Resolve contact (phone + email) ───────────────────────────────────
    // Primary: contacts table (populated by intake/webhook).
    // Fallback: normalized_output.cliente fields.
    const { data: contactRow } = await supabase
      .from('contacts')
      .select('full_name, email, phone')
      .or(`company_id.eq.${internalCaseId},client_id.eq.${internalCaseId}`)
      .maybeSingle()

    const clientName  = (contactRow?.full_name as string | null)
                          ?? (cliente.nombre    as string | null)
                          ?? 'Cliente'
    const clientEmail = (contactRow?.email     as string | null)
                          ?? (cliente.email     as string | null)
                          ?? null
    const clientPhone = (contactRow?.phone     as string | null)
                          ?? (cliente.telefono  as string | null)
                          ?? (cliente.whatsapp  as string | null)
                          ?? null

    // ── 6. Read client preferences ────────────────────────────────────────────
    const { data: prefs } = await supabase
      .from('client_preferences')
      .select('opt_out_whatsapp, opt_out_email, preferred_language, quiet_hours_start, quiet_hours_end')
      .eq('case_id', internalCaseId)
      .maybeSingle()

    const optOutWhatsApp = prefs?.opt_out_whatsapp  ?? false
    const optOutEmail    = prefs?.opt_out_email     ?? false
    const language       = (prefs?.preferred_language as 'es' | 'en' | null) ?? 'es'
    const quietStart     = (prefs?.quiet_hours_start as string | null) ?? null
    const quietEnd       = (prefs?.quiet_hours_end   as string | null) ?? null

    // ── 7. Opt-out gate ───────────────────────────────────────────────────────
    const bothOptedOut = optOutWhatsApp && optOutEmail
    if (bothOptedOut) {
      const skipResult = {
        success:             true,
        case_id:             caseId,
        task_id:             taskId,
        run_id:              runId,
        channel:             'skipped',
        delivery_status:     'skipped',
        template_used:       'none',
        language,
        confidence_score:    1.0,
        skip_reason:         'Client opted out of all channels',
        tasks_created:       [],
        normalized:          false,
      }
      await supabase.from('communication_log').insert({
        case_id:             internalCaseId,
        task_id:             taskId,
        channel:             'skipped',
        template_used:       null,
        message_sent:        null,
        language,
        delivery_status:     'skipped',
        skip_reason:         'opt_out_all',
        opt_out_checked:     true,
        quiet_hours_checked: false,
      })
      await supabase.from('agent_tasks').update({ status: 'done' }).eq('id', taskId)
      await supabase.from('agent_runs').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', runId)
      console.log(`[comunicacion/service] task ${taskId} SKIPPED — opt_out_all`)
      return skipResult
    }

    // ── 8. Read active base prompt ────────────────────────────────────────────
    const { data: basePrompt, error: promptError } = await supabase
      .from('prompt_versions')
      .select('prompt_text')
      .eq('agent_id', 'comunicacion')
      .eq('is_active', true)
      .single()

    if (promptError || !basePrompt) throw new Error('Active prompt for comunicacion not found')

    // ── 9. Fetch template hint by task_type + language ────────────────────────
    const templateMap    = TASK_TYPE_TO_TEMPLATE[taskType]
    const templateLabel  = templateMap?.[language] ?? templateMap?.es ?? 'welcome_es'

    const { data: templateRow } = await supabase
      .from('prompt_versions')
      .select('prompt_text')
      .eq('agent_id', 'comunicacion')
      .eq('version_label', templateLabel)
      .maybeSingle()

    const templateHint = (templateRow?.prompt_text as string | null) ?? templateLabel

    // ── 10. Build LLM context and call Claude ─────────────────────────────────
    const caseContext: Record<string, unknown> = {
      case_id:               caseId,
      client_name:           clientName,
      client_email:          clientEmail,
      preferred_language:    language,
      assigned_route:        caseRow.assigned_route        ?? classified?.assigned_route ?? null,
      complexity:            caseRow.complexity            ?? classified?.complexity     ?? null,
      estado_objetivo:       cliente.estado_objetivo                                    ?? null,
      pais_origen:           cliente.pais_origen                                        ?? null,
      compliance_risk_level: caseRow.compliance_risk_level                              ?? null,
      servicio_solicitado:   normalized?.servicio_solicitado                            ?? null,
      task_type:             taskType,
      task_payload:          taskPayload,
    }

    const userPrompt = buildPrompt(
      basePrompt.prompt_text as string,
      caseContext,
      taskType,
      templateHint
    )

    await supabase
      .from('agent_runs')
      .update({ input_normalized_json: { case_id: caseId, task_id: taskId, task_type: taskType } })
      .eq('id', runId)

    const llmResponse = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model:      process.env.COMUNICACION_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 1024,
        system:     'You are an expert client communication specialist. Respond with valid JSON only — no prose, no markdown.',
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

    const { data: llmMsg, valid: llmValid } = parseLLMMessageResponse(rawParsed)

    if (!llmValid) {
      console.warn('[comunicacion/service] LLM response fallback applied')
    }

    await supabase
      .from('agent_runs')
      .update({ llm_normalized_output_json: llmMsg as unknown as Record<string, unknown> })
      .eq('id', runId)

    // ── 11. Resolve effective channel (apply opt-out + quiet hours) ───────────
    const inQuietHours    = isInQuietHours(quietStart, quietEnd)
    const quietHoursBlock = inQuietHours && !optOutWhatsApp // only relevant if WA not already opted out

    const canSendWhatsApp = !optOutWhatsApp && !inQuietHours && !!clientPhone
    const canSendEmail    = !optOutEmail                    && !!clientEmail

    let effectiveChannel: 'whatsapp' | 'email' | 'both' | 'skipped'
    if      (canSendWhatsApp && canSendEmail)  effectiveChannel = 'both'
    else if (canSendWhatsApp)                   effectiveChannel = 'whatsapp'
    else if (canSendEmail)                      effectiveChannel = 'email'
    else                                        effectiveChannel = 'skipped'

    // ── 12. Send messages ─────────────────────────────────────────────────────
    let waSuccess    = false
    let emailSuccess = false
    let skipReason: string | null = null

    const message = llmMsg.message
    const subject = llmMsg.subject ?? `Actualización de tu caso — CreaTuEmpresaUSA`

    if (effectiveChannel === 'skipped') {
      skipReason = !clientPhone && !clientEmail
        ? 'No contact info available'
        : quietHoursBlock
          ? 'Quiet hours — WhatsApp blocked; no email available'
          : 'All channels unavailable'
    }

    if (effectiveChannel === 'whatsapp' || effectiveChannel === 'both') {
      const wa = await sendWhatsAppMessage(clientPhone!, message)
      waSuccess = wa.success
      if (!wa.success) console.warn('[comunicacion/service] WhatsApp send failed:', wa.error)
    }

    if (effectiveChannel === 'email' || effectiveChannel === 'both') {
      const em = await sendEmailMessage({
        to:       clientEmail!,
        name:     clientName,
        subject,
        bodyText: message,
      })
      emailSuccess = em.success
      if (!em.success) console.warn('[comunicacion/service] Email send failed:', em.error)
    }

    const deliveryStatus =
      effectiveChannel === 'skipped'
        ? 'skipped'
        : (waSuccess || emailSuccess)
          ? 'sent'
          : 'failed'

    // ── 13. Log to communication_log ─────────────────────────────────────────
    await supabase.from('communication_log').insert({
      case_id:             internalCaseId,
      task_id:             taskId,
      channel:             effectiveChannel,
      template_used:       templateLabel,
      message_sent:        message,
      language:            llmMsg.language,
      delivery_status:     deliveryStatus,
      skip_reason:         skipReason,
      opt_out_checked:     true,
      quiet_hours_checked: true,
    })

    // ── 14. Update case ───────────────────────────────────────────────────────
    await supabase
      .from('cases')
      .update({
        last_communication_at: new Date().toISOString(),
        communication_channel: effectiveChannel,
      })
      .eq('id', internalCaseId)

    // ── Audit logs ────────────────────────────────────────────────────────────
    await supabase.from('audit_logs').insert({
      entity_type: 'case',
      entity_id:   internalCaseId,
      action:      'communication_sent',
      actor:       'comunicacion_agent',
      metadata: {
        task_id:          taskId,
        task_type:        taskType,
        channel:          effectiveChannel,
        template_used:    templateLabel,
        language:         llmMsg.language,
        delivery_status:  deliveryStatus,
        confidence_score: llmMsg.confidence_score,
        quiet_hours:      inQuietHours,
        skip_reason:      skipReason,
      },
    })

    if (deliveryStatus === 'failed') {
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   internalCaseId,
        action:      'communication_failed',
        actor:       'comunicacion_agent',
        metadata:    { task_id: taskId, task_type: taskType, channel: effectiveChannel },
      })
    }

    // ── Mark task done ────────────────────────────────────────────────────────
    await supabase.from('agent_tasks').update({ status: 'done' }).eq('id', taskId)

    // ── 15. Mark agent_run completed ──────────────────────────────────────────
    await supabase
      .from('agent_runs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', runId)

    console.log(
      `[comunicacion/service] task ${taskId} (${taskType}) → ` +
      `channel: ${effectiveChannel} | status: ${deliveryStatus} | ` +
      `template: ${templateLabel} | lang: ${llmMsg.language} | ` +
      `confidence: ${llmMsg.confidence_score}`
    )

    return {
      success:           true,
      case_id:           caseId,
      task_id:           taskId,
      run_id:            runId,
      channel:           effectiveChannel,
      delivery_status:   deliveryStatus,
      template_used:     templateLabel,
      language:          llmMsg.language,
      confidence_score:  llmMsg.confidence_score,
      skip_reason:       skipReason ?? undefined,
      tasks_created:     [],
      normalized:        !llmValid,
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[comunicacion/service] Failed:', msg)
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
