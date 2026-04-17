import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminServerClient()

  const { error } = await supabase
    .from('documents')
    .update({
      approval_status:   'approved',
      approved_at:       new Date().toISOString(),
      approved_by_client: true,
    })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
