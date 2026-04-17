import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'
import { generateDocument } from '@/lib/document-generator'
import type { GenerationRequest } from '@/lib/document-templates/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      company_id,
      doc_type,
      subtype,
      params = {},
      replace_doc_id,
    } = body

    if (!company_id) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 })
    }
    if (!doc_type) {
      return NextResponse.json({ error: 'doc_type is required' }, { status: 400 })
    }

    const supabase = createAdminServerClient()

    // ── 1. Fetch company with nested client → user ─────────────────────────
    const { data: company, error: companyErr } = await supabase
      .from('companies')
      .select(`
        id,
        company_name,
        entity_type,
        state,
        state_code,
        registered_agent,
        formation_date,
        ein,
        client_id,
        clients (
          id,
          phone,
          country,
          users (
            full_name
          )
        )
      `)
      .eq('id', company_id)
      .single()

    if (companyErr || !company) {
      console.error('[documents/generate] company fetch error:', companyErr?.message)
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const client  = (company as any).clients
    const profile = client?.users

    // ── 2. Build generation request with real DB data ──────────────────────
    const req: GenerationRequest = {
      company_id,
      doc_type,
      subtype,
      replace_doc_id,
      params: {
        // Merge any caller-supplied params on top of DB values
        registered_agent_name: company.registered_agent ?? params.registered_agent_name,
        organizer_name:        profile?.full_name        ?? params.organizer_name ?? 'CreaTuEmpresaUSA LLC',
        management_type:       params.management_type    ?? 'member_managed',
        effective_date:        params.effective_date,
        purpose:               params.purpose,
        principal_office_address: params.principal_office_address,
        registered_agent_address: params.registered_agent_address,
        organizer_address:        params.organizer_address,
        mailing_address:          params.mailing_address,
        members:                  params.members,
        managers:                 params.managers,
        fiscal_year_end:          params.fiscal_year_end,
        ...params, // allow full override from caller
      },
    }

    // ── 3. Generate PDF via lib/document-generator.ts ─────────────────────
    const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001'
    const result = await generateDocument(req, supabase, SYSTEM_USER_ID)

    // ── 4. Update the documents record with approval workflow fields ───────
    await supabase
      .from('documents')
      .update({
        approval_status: 'pending_approval',
        generated_from:  'auto',
        client_id:       client?.id ?? null,
      })
      .eq('id', result.document_id)

    console.log('[documents/generate] generated doc:', result.document_id, '| file:', result.file_name)

    return NextResponse.json({
      success:      true,
      document_id:  result.document_id,
      file_name:    result.file_name,
      storage_path: result.file_url,
      template_id:  result.template_id,
      status:       result.status,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[documents/generate]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
