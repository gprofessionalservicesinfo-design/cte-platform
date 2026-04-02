import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

function adminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { company_id, ...fields } = body

  if (!company_id) {
    return NextResponse.json({ error: 'Missing company_id' }, { status: 400 })
  }

  const allowed = [
    'address_status',
    'address_provider',
    'address_plan_type',
    'address_created_at',
    'address_activated_at',
    'address_renewal_date',
    'address_notes',
    'address_external_id',
    'address_service_enabled',
    'address_service_type',
    'address_service_period',
  ]

  const update: Record<string, any> = {}
  for (const key of allowed) {
    if (fields[key] !== undefined) update[key] = fields[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = adminClient()
  const { error } = await supabase.from('companies').update(update).eq('id', company_id)

  if (error) {
    console.error('[update-address-status]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
