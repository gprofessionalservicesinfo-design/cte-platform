/**
 * POST /api/client/request-doc-changes
 * Client requests changes to a document. Saves a mail_item for the admin.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // Cookie-based auth (ES256 workaround)
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()
  let userId: string | null = null
  try {
    const tokenName = 'sb-rhprcuqhuesorrncswjs-auth-token'
    const raw = cookieStore.get(tokenName)?.value
      || cookieStore.get(`${tokenName}.0`)?.value
    if (raw) {
      const d = JSON.parse(decodeURIComponent(raw))
      const token = d?.access_token || raw
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      userId = payload?.sub ?? null
    }
  } catch {}
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { company_id, doc_id, note } = await req.json()
  if (!company_id || !doc_id || !note) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const db = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Verify company belongs to this user
  const { data: company } = await db
    .from('companies')
    .select('id, company_name, clients!inner(user_id)')
    .eq('id', company_id)
    .eq('clients.user_id', userId)
    .maybeSingle()

  if (!company) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Get doc info for the title
  const { data: doc } = await db
    .from('documents')
    .select('type')
    .eq('id', doc_id)
    .maybeSingle()

  const docLabel = doc?.type === 'operating_agreement' ? 'Operating Agreement' : 'Articles of Organization'

  // Insert into mail_items as inbound message for admin visibility
  await db.from('mail_items').insert({
    company_id,
    title:       `🔄 Solicitud de cambios — ${docLabel}`,
    sender:      'Cliente',
    description: note,
    direction:   'inbound',
    channel:     'system',
    sent_by:     userId,
    category:    'document_changes',
    is_read:     false,
    created_at:  new Date().toISOString(),
  })

  // Update doc status to flag changes requested
  await db.from('documents').update({ approval_status: 'changes_requested' }).eq('id', doc_id)

  return NextResponse.json({ ok: true })
}
