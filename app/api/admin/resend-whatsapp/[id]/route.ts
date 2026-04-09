import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { sendWelcomeWhatsApp, persistWhatsAppResult } from '@/lib/welcome/whatsapp'

function adminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminServerClient()

  const { data: company, error } = await supabase
    .from('companies')
    .select(`
      id, company_name, state,
      whatsapp_phone_used,
      clients ( phone, whatsapp, users ( full_name ) )
    `)
    .eq('id', params.id)
    .single()

  if (error || !company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const client = (company as any).clients
  const user   = client?.users

  // Phone resolution: previously used → client.phone → client.whatsapp
  const rawPhone =
    (company as any).whatsapp_phone_used ||
    client?.phone ||
    client?.whatsapp ||
    ''

  const customerName = user?.full_name || 'Cliente'
  const companyName  = (company as any).company_name || 'Tu empresa'
  const stateName    = (company as any).state || ''   // never WY fallback

  console.log('[admin/resend-whatsapp] company_id:    ', company.id)
  console.log('[admin/resend-whatsapp] company_name:  ', companyName)
  console.log('[admin/resend-whatsapp] state_name:    ', stateName || '(empty)')
  console.log('[admin/resend-whatsapp] customer_name: ', customerName)
  console.log('[admin/resend-whatsapp] phone_raw:     ', rawPhone || '(empty)')

  const waResult = await sendWelcomeWhatsApp({
    phone:        rawPhone,
    customerName,
    companyName,
    stateName,
  })

  const db = adminClient()
  await persistWhatsAppResult(db, company.id, waResult, rawPhone)

  if (!waResult.success) {
    const reason = waResult.send_attempted
      ? (waResult.error_message ? `code:${waResult.error_code} — ${waResult.error_message}` : 'unknown error')
      : (waResult.skip_reason ?? 'skipped')
    return NextResponse.json({ error: reason }, { status: waResult.send_attempted ? 500 : 400 })
  }

  return NextResponse.json({ success: true, sid: waResult.sid, status: waResult.status })
}
