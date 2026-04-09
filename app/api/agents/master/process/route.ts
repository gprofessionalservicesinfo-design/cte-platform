import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient }   from '@/lib/supabase/server'
import { runMaster }                 from '@/lib/agents/master/service'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  let body: { report_date?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { report_date } = body

  if (!report_date) {
    return NextResponse.json(
      { success: false, error: 'Missing required field: report_date' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminServerClient()
    const result   = await runMaster(report_date, supabase)

    if (result.skipped) {
      return NextResponse.json({ success: true, skipped: true, report_date: result.report_date })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[master/process] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}
