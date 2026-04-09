import { randomUUID }             from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient }   from '@/lib/supabase/server'
import { normalizeIntakeOutput }     from '@/lib/agents/intake/validate'

export async function POST(request: NextRequest) {
  let body: { agent_id?: string; status?: string; raw_response?: string; case_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { agent_id, status, raw_response } = body

  if (!agent_id) {
    return NextResponse.json(
      { success: false, error: 'Missing required field: agent_id' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminServerClient()
    const caseUuid = body.case_id ?? randomUUID()

    // 1. Insert case record with raw LLM output
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .insert({ case_id: caseUuid, agent_id, status, raw_response })
      .select('id')
      .single()

    if (caseError) {
      console.error('[intake/save-case] Insert error:', caseError)
      return NextResponse.json({ success: false, error: caseError.message }, { status: 500 })
    }

    const caseId = caseData.id

    // 2. Parse raw_response (may be JSON string or object)
    let rawParsed: unknown = raw_response
    if (typeof raw_response === 'string') {
      try { rawParsed = JSON.parse(raw_response) } catch { rawParsed = { raw_text: raw_response } }
    }

    // 3. Validate and normalize LLM output against IntakeOutputSchema
    const { data: normalized, normalized: wasNormalized, issues } =
      normalizeIntakeOutput(rawParsed, caseUuid)

    // 4. Update case with normalized output + human review flags
    await supabase.from('cases').update({
      normalized_output:            normalized,
      confidence_score:             normalized.confidence_score,
      requires_human_review:        normalized.requires_human_review,
      normalization_applied:        wasNormalized,
      route_classification_pending: true,
      status: normalized.requires_human_review ? 'pending' : 'in_progress',
    }).eq('id', caseId)

    // 5. Audit: intake_completed
    await supabase.from('audit_logs').insert({
      entity_type: 'case',
      entity_id:   caseId,
      action:      'intake_completed',
      actor:       'intake_agent',
      metadata: {
        intake_score:     normalized.intake_score,
        confidence_score: normalized.confidence_score,
        service_family:   normalized.service_family,
        normalized:       wasNormalized,
      },
    })

    // 6. Audit: fallback_triggered (only if normalization was applied)
    if (wasNormalized) {
      console.warn('[intake/save-case] Normalization applied — issues:', issues)
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   caseId,
        action:      'fallback_triggered',
        actor:       'intake_agent',
        metadata:    { issues },
      })
    }

    // 7. Audit: human_review_flagged
    if (normalized.requires_human_review) {
      await supabase.from('audit_logs').insert({
        entity_type: 'case',
        entity_id:   caseId,
        action:      'human_review_flagged',
        actor:       'intake_agent',
        metadata: {
          reason:           normalized.human_review_reason,
          confidence_score: normalized.confidence_score,
        },
      })
    }

    // 8. Create initial tasks (Points 10)
    // review_intake and welcome_pending always created.
    // route_classification_pending always created.
    // missing_data_followup only if requires_human_review = true.
    const tasks: { task_type: string; priority: number }[] = [
      { task_type: 'review_intake',               priority: 1 },
      { task_type: 'welcome_pending',              priority: 2 },
      { task_type: 'route_classification_pending', priority: 3 },
      ...(normalized.requires_human_review
        ? [{ task_type: 'missing_data_followup', priority: 1 }]
        : []),
    ]

    for (const task of tasks) {
      await supabase.from('agent_tasks').insert({
        agent_id:  agent_id,
        case_id:   caseId,
        task_type: task.task_type,
        status:    'pending',
        priority:  task.priority,
        payload:   { case_id: caseId, service_family: normalized.service_family },
      })
      await supabase.from('audit_logs').insert({
        entity_type: 'task',
        entity_id:   caseId,
        action:      'task_created',
        actor:       'intake_agent',
        metadata:    { task_type: task.task_type, priority: task.priority },
      })
    }

    console.log(`[intake/save-case] case ${caseId} processed — score: ${normalized.intake_score} | confidence: ${normalized.confidence_score} | tasks: ${tasks.map(t => t.task_type).join(', ')}`)

    return NextResponse.json({
      success:               true,
      id:                    caseId,
      normalized:            wasNormalized,
      requires_human_review: normalized.requires_human_review,
      confidence_score:      normalized.confidence_score,
      intake_score:          normalized.intake_score,
      tasks_created:         tasks.map(t => t.task_type),
    })

  } catch (err: any) {
    console.error('[intake/save-case] Unexpected error:', err)
    return NextResponse.json({ success: false, error: err?.message ?? 'Unknown error' }, { status: 500 })
  }
}
