import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import {
  STATE_OBLIGATIONS,
  REGISTERED_AGENT_RENEWAL_CENTS,
  COMPLIANCE_PLAN_CENTS,
  BOI_REPORT_CENTS,
  calcDueDate,
} from '@/lib/renewals/state-obligations'

const db = () => createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** GET /api/admin/renewals — list all renewals with filters */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status    = searchParams.get('status')
  const companyId = searchParams.get('company_id')
  const type      = searchParams.get('type')
  const dueBefore = searchParams.get('due_before')  // ISO date

  let query = db()
    .from('renewals')
    .select(`
      *,
      companies (
        id, company_name, state, entity_type, formation_date, package,
        clients (
          id,
          users ( full_name, email )
        )
      )
    `)
    .order('due_date', { ascending: true })

  if (status)    query = query.eq('status', status)
  if (companyId) query = query.eq('company_id', companyId)
  if (type)      query = query.eq('type', type)
  if (dueBefore) query = query.lte('due_date', dueBefore)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ renewals: data ?? [] })
}

/** POST /api/admin/renewals — create a renewal record */
export async function POST(req: Request) {
  const body = await req.json()
  const {
    company_id,
    type,
    label,
    description,
    due_date,
    estimated_cost_cents,
    is_required,
    compliance_plan_covers,
    stripe_payment_link,
    notes,
  } = body

  if (!company_id || !type || !label || !due_date) {
    return NextResponse.json(
      { error: 'company_id, type, label, due_date are required' },
      { status: 400 }
    )
  }

  const { data, error } = await db()
    .from('renewals')
    .insert({
      company_id,
      type,
      label,
      description: description || null,
      due_date,
      estimated_cost_cents: estimated_cost_cents ?? 0,
      is_required: is_required ?? true,
      compliance_plan_covers: compliance_plan_covers ?? false,
      stripe_payment_link: stripe_payment_link || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ renewal: data }, { status: 201 })
}

/**
 * POST /api/admin/renewals?action=seed_company
 * Automatically generates the standard renewal schedule for a newly formed company.
 * Call this after a company's formation is marked complete.
 */
export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'seed_company') {
    const { company_id } = await req.json()
    if (!company_id) return NextResponse.json({ error: 'company_id required' }, { status: 400 })

    const { data: company, error: cErr } = await db()
      .from('companies')
      .select('id, state, formation_date, package')
      .eq('id', company_id)
      .single()

    if (cErr || !company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    const { state, formation_date, package: pkg } = company
    const stateKey = (state || '').toUpperCase()
    const stateObl = STATE_OBLIGATIONS[stateKey]
    const records: any[] = []

    // 1. Registered Agent renewal (every year)
    if (formation_date) {
      const raDate = calcDueDate(formation_date, 'anniversary', 1)
      records.push({
        company_id,
        type: 'registered_agent',
        label: 'Registered Agent – Renovación Anual',
        description: 'Renovación anual del servicio de Registered Agent. Requerido por ley para mantener tu empresa activa.',
        due_date: raDate.toISOString().split('T')[0],
        estimated_cost_cents: REGISTERED_AGENT_RENEWAL_CENTS,
        is_required: true,
        compliance_plan_covers: false,
      })
    }

    // 2. State annual/periodic report
    if (stateObl && stateObl.annual_report.required && formation_date) {
      const { due_date_logic, fee_cents, label: rLabel, description: rDesc } = stateObl.annual_report
      const reportDate = calcDueDate(formation_date, due_date_logic, 1)
      records.push({
        company_id,
        type: due_date_logic === 'biennial' ? 'periodic_report' : 'annual_report',
        label: rLabel,
        description: rDesc,
        due_date: reportDate.toISOString().split('T')[0],
        estimated_cost_cents: fee_cents,
        is_required: true,
        compliance_plan_covers: true, // covered by our Compliance Plan
      })
    }

    // 3. Franchise tax (DE and similar)
    if (stateObl?.franchise_tax?.required && formation_date) {
      const { due_date_logic, fee_cents, label: fLabel, description: fDesc } = stateObl.franchise_tax
      const ftDate = calcDueDate(formation_date, due_date_logic, 1)
      records.push({
        company_id,
        type: 'franchise_tax',
        label: fLabel,
        description: fDesc,
        due_date: ftDate.toISOString().split('T')[0],
        estimated_cost_cents: fee_cents,
        is_required: true,
        compliance_plan_covers: false,
      })
    }

    // 4. BOI Report (FinCEN) — required for companies formed after Jan 1 2024
    if (formation_date && new Date(formation_date) >= new Date('2024-01-01')) {
      // Companies formed in 2024+ must file within 90 days of formation
      const boiDate = new Date(formation_date)
      boiDate.setDate(boiDate.getDate() + 90)
      const today = new Date()
      // Only add if not yet past
      if (boiDate >= today) {
        records.push({
          company_id,
          type: 'boi_report',
          label: 'BOI Report – FinCEN (Requerido Federalmente)',
          description: 'Beneficial Ownership Information report requerido por el FinCEN para empresas formadas después del 1ero de enero de 2024. Presentación única dentro de los 90 días de formación.',
          due_date: boiDate.toISOString().split('T')[0],
          estimated_cost_cents: BOI_REPORT_CENTS,
          is_required: true,
          compliance_plan_covers: false,
        })
      }
    }

    // 5. Compliance Plan renewal (if client has it)
    const hasPlan = pkg === 'premium' || pkg === 'growth'
    if (hasPlan && formation_date) {
      const cpDate = calcDueDate(formation_date, 'anniversary', 1)
      records.push({
        company_id,
        type: 'compliance_plan',
        label: 'Plan de Cumplimiento – Renovación Anual',
        description: 'Renovación de tu Plan de Cumplimiento anual. Incluye recordatorios automáticos, seguimiento de deadlines y soporte prioritario.',
        due_date: cpDate.toISOString().split('T')[0],
        estimated_cost_cents: COMPLIANCE_PLAN_CENTS,
        is_required: false,
        compliance_plan_covers: false,
      })
    }

    if (records.length === 0) {
      return NextResponse.json({ message: 'No renewals to seed', seeded: 0 })
    }

    const { data: inserted, error: iErr } = await db()
      .from('renewals')
      .insert(records)
      .select()

    if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 })
    return NextResponse.json({ message: 'Renewals seeded', seeded: inserted?.length ?? 0, renewals: inserted })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
