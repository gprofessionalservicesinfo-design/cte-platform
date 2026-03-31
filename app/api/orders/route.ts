import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

function adminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email = body?.customer?.email ?? body?.email ?? ''
  if (!email) {
    return NextResponse.json({ error: 'Missing email in payload' }, { status: 400 })
  }

  const supabase = adminClient()

  const { error } = await supabase.from('pending_orders').upsert(
    {
      email:      email.toLowerCase().trim(),
      payload:    body,
      claimed_at: null,
    },
    { onConflict: 'email' }
  )

  if (error) {
    console.error('[api/orders] Supabase error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[api/orders] Order saved for:', email)
  return NextResponse.json({ ok: true, result_status: 'registered' })
}
