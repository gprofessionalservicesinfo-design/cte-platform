import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const {
    companyId,
    company_name, entity_type, state, formation_date, registered_agent,
    banking_setup_enabled, address_service_enabled, address_service_type, address_service_period,
    bookkeeping_status, bookkeeping_tool_selected, bookkeeping_notes,
    registered_agent_name, registered_agent_address,
    organizer_name, organizer_address,
    principal_office_address, mailing_address,
  } = await req.json()

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
  if (banking_setup_enabled !== undefined)   update.banking_setup_enabled   = banking_setup_enabled
  if (address_service_enabled !== undefined) update.address_service_enabled = address_service_enabled
  if (address_service_type !== undefined)    update.address_service_type    = address_service_type || null
  if (address_service_period !== undefined)   update.address_service_period   = address_service_period || null
  if (bookkeeping_status !== undefined)       update.bookkeeping_status       = bookkeeping_status
  if (bookkeeping_tool_selected !== undefined) update.bookkeeping_tool_selected = bookkeeping_tool_selected
  if (bookkeeping_notes !== undefined)        update.bookkeeping_notes        = bookkeeping_notes
  if (registered_agent_name !== undefined)    update.registered_agent_name    = registered_agent_name    || null
  if (registered_agent_address !== undefined) update.registered_agent_address = registered_agent_address || null
  if (organizer_name !== undefined)           update.organizer_name           = organizer_name           || null
  if (organizer_address !== undefined)        update.organizer_address        = organizer_address        || null
  if (principal_office_address !== undefined) update.principal_office_address = principal_office_address || null
  if (mailing_address !== undefined)          update.mailing_address          = mailing_address          || null

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
