/**
 * GET  /api/admin/addon-services?companyId=xxx  — list services for company
 * POST /api/admin/addon-services                — create a service
 * PATCH /api/admin/addon-services               — update a service
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 })
  const db = createAdminServerClient()
  const { data, error } = await db
    .from('addon_services')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ services: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { company_id, service_type, price, expires_at, notes } = body
  if (!company_id || !service_type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const db = createAdminServerClient()
  const { data, error } = await db
    .from('addon_services')
    .insert({ company_id, service_type, price: price ?? null, expires_at: expires_at ?? null, notes: notes ?? null, status: 'pending' })
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ service: data })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const db = createAdminServerClient()
  const { data, error } = await db
    .from('addon_services')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ service: data })
}
