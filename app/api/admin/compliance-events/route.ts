/**
 * GET  /api/admin/compliance-events?companyId=xxx  — list events
 * GET  /api/admin/compliance-events?all=true       — all events (calendar)
 * POST /api/admin/compliance-events                — create event
 * PATCH /api/admin/compliance-events               — update event
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get('companyId')
  const all       = req.nextUrl.searchParams.get('all')
  const db = createAdminServerClient()

  if (all) {
    const { data, error } = await db
      .from('compliance_events')
      .select('*, companies(company_name, id)')
      .order('due_date', { ascending: true })
      .limit(200)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ events: data ?? [] })
  }

  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 })
  const { data, error } = await db
    .from('compliance_events')
    .select('*')
    .eq('company_id', companyId)
    .order('due_date', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ events: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { company_id, event_type, due_date, notes } = body
  if (!company_id || !event_type || !due_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const db = createAdminServerClient()
  const { data, error } = await db
    .from('compliance_events')
    .insert({ company_id, event_type, due_date, notes: notes ?? null })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ event: data })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const db = createAdminServerClient()
  const { data, error } = await db
    .from('compliance_events')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ event: data })
}
