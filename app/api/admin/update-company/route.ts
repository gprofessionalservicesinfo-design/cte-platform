import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { companyId, company_name, entity_type, state, formation_date, registered_agent, banking_setup_enabled } = await req.json()

  if (!companyId) {
    return NextResponse.json({ error: 'Missing companyId' }, { status: 400 })
  }

  const supabase = createAdminServerClient()

  const update: Record<string, any> = {}
  if (company_name !== undefined)           update.company_name           = company_name
  if (entity_type !== undefined)            update.entity_type            = entity_type
  if (state !== undefined)                  update.state                  = state
  if (formation_date !== undefined)         update.formation_date         = formation_date || null
  if (registered_agent !== undefined)       update.registered_agent       = registered_agent
  if (banking_setup_enabled !== undefined)  update.banking_setup_enabled  = banking_setup_enabled

  const { error } = await supabase
    .from('companies')
    .update(update)
    .eq('id', companyId)

  if (error) {
    console.error('[admin/update-company]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
