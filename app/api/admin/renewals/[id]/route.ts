import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const db = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** PATCH /api/admin/renewals/[id] — update a renewal (status, paid_at, notes, etc.) */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const body = await req.json()

  // Whitelist updatable fields
  const allowed = [
    'status', 'paid_at', 'notes', 'due_date',
    'estimated_cost_cents', 'stripe_payment_link',
    'compliance_plan_covers', 'is_required', 'last_reminder_at',
  ]
  const update: Record<string, any> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await db()
    .from('renewals')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ renewal: data })
}

/** DELETE /api/admin/renewals/[id] */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await db().from('renewals').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
