import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const VALID_KEYS = [
  'welcome_sent',
  'formation_started',
  'ein_initiated',
  'registered_agent_confirmed',
  'address_activated',
  'banking_guidance_sent',
  'tax_ready_offered',
  'portal_reviewed',
]

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const { key, value } = body

  if (!VALID_KEYS.includes(key) || typeof value !== 'boolean') {
    return NextResponse.json({ error: 'Invalid key or value' }, { status: 400 })
  }

  // Fetch current checklist, merge, write back
  const { data, error: fetchErr } = await db()
    .from('companies')
    .select('operations_checklist')
    .eq('id', params.id)
    .single()

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })

  const current = (data?.operations_checklist as Record<string, boolean>) ?? {}
  const updated = { ...current, [key]: value }

  const { error } = await db()
    .from('companies')
    .update({ operations_checklist: updated, last_internal_update_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, checklist: updated })
}
