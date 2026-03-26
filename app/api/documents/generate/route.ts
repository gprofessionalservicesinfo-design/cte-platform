import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const params = body.params ?? {}
    const management_structure = params.management_type ?? body.management_structure ?? 'member-managed'
    const members = params.members ?? body.members ?? []
    const organizer_name = params.organizer_name ?? body.organizer_name ?? null
    const organizer_address = params.organizer_address ?? body.organizer_address ?? null
    const purpose = params.purpose ?? body.purpose ?? null
    const effective_date = params.effective_date ?? body.effective_date ?? null

    if (!body.company_id || !body.doc_type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { data: company, error: companyErr } = await supabase
      .from('companies')
      .select('id, company_name, state, state_code, entity_type, registered_agent')
      .eq('id', body.company_id)
      .single()

    if (companyErr || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const effectiveDate = effective_date
      ? new Date(effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : date

    let html = ''

    if (body.doc_type === 'articles') {
      html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Georgia,serif;font-size:12pt;margin:1in;line-height:1.6}
h1{text-align:center;font-size:15pt;text-transform:uppercase;margin-bottom:6px}
h2{font-size:11pt;text-transform:uppercase;margin-top:20px}
.draft{color:red;text-align:center;font-size:9pt;font-weight:bold;margin-bottom:12px}
.center{text-align:center}.sig{border-top:1px solid #000;width:240px;margin-top:36px}
</style></head><body>
<p class="draft">DRAFT — FOR REVIEW ONLY — NOT A FILED LEGAL DOCUMENT</p>
<h1>Articles of Organization</h1>
<h1>${company.company_name}</h1>
<p class="center">A ${company.state} Limited Liability Company &nbsp;|&nbsp; Effective: ${effectiveDate}</p>
<h2>Article I — Name</h2>
<p>The name of the LLC is <strong>${company.company_name}</strong>.</p>
<h2>Article II — Registered Agent</h2>
<p>${company.registered_agent ?? 'CreaTuEmpresaUSA LLC'}, State of ${company.state}.</p>
<h2>Article III — Management</h2>
<p>This LLC shall be <strong>${management_structure === 'manager-managed' ? 'Manager-Managed' : 'Member-Managed'}</strong>.</p>
<h2>Article IV — Purpose</h2>
<p>${purpose ?? 'To engage in any lawful act or activity for which an LLC may be organized.'}</p>
<h2>Article V — Organizer</h2>
<p>${organizer_name ?? 'CreaTuEmpresaUSA LLC'}<br>${organizer_address ?? '850 New Burton Rd, Dover, DE 19904'}</p>
<div style="margin-top:48px"><div class="sig"></div><p>Organizer: ${organizer_name ?? 'CreaTuEmpresaUSA LLC'} &nbsp; Date: ${date}</p></div>
</body></html>`
    } else {
      const memberRows = members.map((m: any) =>
        `<tr><td>${m.name}</td><td>${m.address}</td><td>${m.ownership_percentage ?? m.ownership_pct ?? 0}%</td><td>${m.capital_contribution ? '$'+m.capital_contribution : '-'}</td></tr>`
      ).join('')
      html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Georgia,serif;font-size:12pt;margin:1in;line-height:1.6}
h1{text-align:center;font-size:15pt;text-transform:uppercase;margin-bottom:6px}
h2{font-size:11pt;text-transform:uppercase;margin-top:20px}
.draft{color:red;text-align:center;font-size:9pt;font-weight:bold;margin-bottom:12px}
.center{text-align:center}table{width:100%;border-collapse:collapse;margin:12px 0}
th,td{border:1px solid #000;padding:6px;text-align:left}th{background:#f0f0f0}
.sig{border-top:1px solid #000;width:240px;margin-top:36px}
</style></head><body>
<p class="draft">DRAFT — FOR REVIEW ONLY — NOT A FILED LEGAL DOCUMENT</p>
<h1>Operating Agreement</h1>
<h1>${company.company_name}</h1>
<p class="center">A ${company.state} Limited Liability Company &nbsp;|&nbsp; Effective: ${effectiveDate}</p>
<h2>Article I — Formation</h2>
<p>This Operating Agreement is entered into as of ${effectiveDate} for <strong>${company.company_name}</strong>, organized under the laws of ${company.state}.</p>
<h2>Article II — Members and Ownership</h2>
<table><tr><th>Member</th><th>Address</th><th>Ownership</th><th>Capital</th></tr>${memberRows}</table>
<h2>Article III — Management</h2>
<p><strong>${management_structure === 'manager-managed' ? 'Manager-Managed' : 'Member-Managed'}</strong>.</p>
<h2>Article IV — Distributions</h2>
<p>Distributions shall be made to Members in proportion to their ownership percentages.</p>
<h2>Article V — Dissolution</h2>
<p>The Company shall dissolve upon unanimous written consent of all Members.</p>
<div style="margin-top:48px">${members.map((m: any) => `<div class="sig"></div><p>Member: ${m.name}</p>`).join('<br>')}</div>
</body></html>`
    }

    const { data: docRow } = await supabase.from('documents').insert({
      company_id: body.company_id,
      uploaded_by: '00000000-0000-0000-0000-000000000001',
      type: body.doc_type === 'articles' ? 'articles' : 'operating_agreement',
      file_name: body.doc_type + '_draft_' + Date.now() + '.html',
      file_url: 'drafts/' + body.company_id + '/' + body.doc_type + '_' + Date.now() + '.html',
      file_size: html.length,
      mime_type: 'text/html',
      status: 'draft',
    }).select('id').single()

    return NextResponse.json({ success: true, html, document_id: docRow?.id, file_name: body.doc_type + '_draft.html', status: 'draft' })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[documents/generate]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
