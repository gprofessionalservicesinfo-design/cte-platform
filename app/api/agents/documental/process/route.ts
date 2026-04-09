import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient }   from '@/lib/supabase/server'
import { runDocumental }             from '@/lib/agents/documental/service'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  let body: { case_id?: string; document_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { case_id, document_id } = body

  if (!case_id) {
    return NextResponse.json(
      { success: false, error: 'Missing required field: case_id' },
      { status: 400 }
    )
  }

  if (!document_id) {
    return NextResponse.json(
      { success: false, error: 'Missing required field: document_id' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminServerClient()
    const result   = await runDocumental(case_id, document_id, supabase)

    if (result.skipped) {
      return NextResponse.json({ success: true, skipped: true, case_id, document_id })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[documental/process] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}
