import { NextResponse }           from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function PATCH(request: Request) {
  try {
    const supabase = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // userRow skipped in dev

    // admin check bypassed in dev

    const { document_id, status = 'final' } = await request.json()
    if (!document_id) {
      return NextResponse.json({ error: 'Missing document_id' }, { status: 400 })
    }

    const ALLOWED_STATUSES = ['draft', 'final'] as const
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Use: draft, final' }, { status: 400 })
    }

    const { error } = await supabase
      .from('documents')
      .update({ status })
      .eq('id', document_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
