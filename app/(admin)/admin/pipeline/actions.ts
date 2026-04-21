'use server'

import { createAdminServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const TEST_RE = /test|example|demo|fake|prueba/i

const VALID_STATUSES = ['name_check', 'ein_processing', 'articles_filed', 'completed']

// ── Bulk: mark all test-email companies as completed ──────────────────────────

export async function bulkCompleteTestCases(): Promise<{ count: number; error?: string }> {
  const supabase = createAdminServerClient()

  // Resolve all client IDs whose linked user email matches test patterns.
  // Filtering in JS is simpler than a Supabase .or() across a foreign table.
  const { data: allClients, error: clientErr } = await supabase
    .from('clients')
    .select('id, users!inner( email )')

  if (clientErr) return { count: 0, error: clientErr.message }

  const testClientIds = (allClients ?? [])
    .filter((c: any) => TEST_RE.test(c.users?.email ?? ''))
    .map((c: any) => c.id)

  if (testClientIds.length === 0) return { count: 0 }

  const { data: updated, error: updateErr } = await supabase
    .from('companies')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .in('client_id', testClientIds)
    .neq('status', 'completed')
    .select('id')

  if (updateErr) return { count: 0, error: updateErr.message }

  const count = updated?.length ?? 0

  // Audit log — best effort, table may not exist yet
  try {
    await supabase.from('audit_logs').insert({
      actor:      'admin',
      action:     'bulk_complete_test_cases',
      metadata:   { count, test_client_ids: testClientIds },
      created_at: new Date().toISOString(),
    })
  } catch { /* swallow — audit_logs table is optional */ }

  revalidatePath('/admin/pipeline')
  return { count }
}

// ── Individual: change a single company's status ──────────────────────────────

export async function updateCaseStatus(
  companyId: string,
  newStatus: string,
): Promise<{ error?: string }> {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`)
  }

  const supabase = createAdminServerClient()

  const { error } = await supabase
    .from('companies')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', companyId)

  if (error) return { error: error.message }

  // Audit log — best effort
  try {
    await supabase.from('audit_logs').insert({
      actor:      'admin',
      action:     'update_case_status',
      metadata:   { company_id: companyId, new_status: newStatus },
      created_at: new Date().toISOString(),
    })
  } catch { /* swallow */ }

  revalidatePath('/admin/pipeline')
  return {}
}
