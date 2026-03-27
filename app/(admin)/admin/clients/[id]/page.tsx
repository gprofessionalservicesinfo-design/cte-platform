import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createAdminServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/client/status-badge'
import { StatusWorkflow } from '@/components/admin/status-workflow'
import { DocumentUpload } from '@/components/admin/document-upload'
import { DocumentGeneratorPanel } from '@/components/admin/document-generator-panel'
import { NotesPanel } from '@/components/admin/notes-panel'
import { EINEditor } from '@/components/admin/ein-editor'
import { PaymentPanel } from '@/components/admin/payment-panel'
import { DocumentChecklist } from '@/components/admin/document-checklist'
import { CrmOpsPanel } from '@/components/admin/crm-ops-panel'
import { ChevronLeft, Building2, User, Mail, CreditCard, ClipboardList, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { InvoiceRow } from '@/components/billing/invoice-table'

interface PageProps {
  params: { id: string }
}

export default async function AdminClientDetailPage({ params }: PageProps) {
  const supabase = createAdminServerClient()

  // Read session from cookie (production fix)
  let user: any = null
  if (process.env.NODE_ENV !== 'development') {
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const t = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token')
    const t0 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.0')
    const t1 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.1')
    let raw = t?.value || (t0?.value ? t0.value + (t1?.value ?? '') : null)
    if (raw) {
      try {
        const d = JSON.parse(decodeURIComponent(raw))
        if (d?.user) user = d.user
        else if (d?.access_token) {
          const p = JSON.parse(Buffer.from(d.access_token.split('.')[1], 'base64').toString())
          if (p?.sub) user = { id: p.sub, email: p.email }
        }
      } catch {}
    }
    if (!user) redirect('/login')
  }

  // Load company with nested client → user join
  const { data: company, error } = await supabase
    .from('companies')
    .select(`
      *,
      clients (
        id,
        phone,
        whatsapp,
        country,
        city,
        preferred_language,
        referral_source,
        internal_notes,
        created_at,
        users (
          id,
          full_name,
          email,
          role,
          created_at
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !company) notFound()

  const client = company.clients as any
  const profile = client?.users

  // Load documents, notes, mail_items, status_history, payments in parallel
  const [
    { data: documents },
    { data: notes },
    { data: mail },
    { data: statusHistory },
    { data: payments },
  ] = await Promise.all([
    supabase
      .from('documents')
      .select('id, type, file_name, file_size, mime_type, status, template_id, generated_at, created_at')
      .eq('company_id', params.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('notes')
      .select('id, content, pinned, created_at, users(full_name, email)')
      .eq('company_id', params.id)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('mail_items')
      .select('*')
      .eq('company_id', params.id)
      .order('received_at', { ascending: false }),
    supabase
      .from('status_history')
      .select('id, old_status, new_status, note, created_at, users(full_name)')
      .eq('company_id', params.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('payments')
      .select('*')
      .eq('company_id', params.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2 text-gray-500">
            <Link href="/admin/clients">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Clients
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{company.company_name}</h1>
            <StatusBadge status={company.status} />
          </div>
          <p className="text-gray-500 mt-1 text-sm">
            {company.entity_type} · {company.state} · Created {formatDate(company.created_at)}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="divide-y divide-gray-100 text-sm">
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Entity Type</dt>
                  <dd className="font-medium text-gray-900">{company.entity_type}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Registered Agent</dt>
                  <dd className="font-medium text-gray-900">{company.registered_agent}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Formation Date</dt>
                  <dd className="font-medium text-gray-900">
                    {company.formation_date ? formatDate(company.formation_date) : 'Pending'}
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Package</dt>
                  <dd className="font-medium text-gray-900 capitalize">
                    {company.package ?? '—'}
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Order Reference</dt>
                  <dd className="font-mono text-xs text-gray-600">
                    {company.order_reference ?? '—'}
                  </dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Stripe Customer</dt>
                  <dd className="font-mono text-xs text-gray-600">
                    {company.stripe_customer_id ?? '—'}
                  </dd>
                </div>
              </dl>

              {/* EIN Editor */}
              <div className="pt-2 border-t">
                <EINEditor companyId={company.id} currentEIN={company.ein} />
              </div>
            </CardContent>
          </Card>

          {/* Client Profile */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Client Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-gray-100 text-sm">
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Name</dt>
                  <dd className="font-medium text-gray-900">{profile?.full_name ?? '—'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium text-gray-900">{profile?.email ?? '—'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="text-gray-700">{client?.phone ?? '—'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Country</dt>
                  <dd className="text-gray-700">{client?.country ?? '—'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Referral</dt>
                  <dd className="text-gray-700">{client?.referral_source ?? '—'}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-gray-500">Member since</dt>
                  <dd className="text-gray-700">
                    {profile?.created_at ? formatDate(profile.created_at) : '—'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesPanel
                companyId={company.id}
                adminId={user?.id ?? 'dev-admin'}
                initialNotes={(notes as any) ?? []}
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Status Workflow */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Formation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusWorkflow
                companyId={company.id}
                currentStatus={company.status}
                statusHistory={(statusHistory as any) ?? []}
              />
            </CardContent>
          </Card>

          {/* Document Generator */}
          <DocumentGeneratorPanel
            company={{
              id:               company.id,
              name:             company.company_name,
              state:            company.state,
              state_code:       company.state_code ?? '',
              entity_type:      company.entity_type,
              registered_agent: company.registered_agent,
            }}
            existingDocs={(documents as any) ?? []}
          />

          {/* Manual Document Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Manual Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUpload
                companyId={company.id}
                initialDocs={((documents as any) ?? []).filter((d: any) => !d.template_id)}
              />
            </CardContent>
          </Card>

          {/* Mail */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                Mail ({mail?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!mail || mail.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No mail items yet.</p>
              ) : (
                <div className="space-y-2">
                  {mail.map((item: any) => (
                    <div
                      key={item.id}
                      className={`rounded-lg border p-3 text-sm ${
                        item.is_read ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium ${item.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                            {item.title}
                          </p>
                          {item.sender && (
                            <p className="text-xs text-gray-400 mt-0.5">From: {item.sender}</p>
                          )}
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        {!item.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {formatDate(item.received_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Document Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-gray-500" />
                Document Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentChecklist
                clientType={
                  client?.country && !['US', 'USA', 'United States'].includes((client.country as string).trim())
                    ? 'foreign'
                    : 'us'
                }
              />
            </CardContent>
          </Card>

          {/* CRM Ops Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                CRM & Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CrmOpsPanel
                companyId={company.id}
                currentPkg={company.package}
                country={client?.country}
                clientName={profile?.full_name}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Billing & Payments ─────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            Billing & Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentPanel
            company={{
              id:                 company.id,
              package:            company.package,
              service_fee:        company.service_fee,
              state_fee:          company.state_fee,
              addons_total:       company.addons_total,
              total_paid:         company.total_paid,
              stripe_customer_id: company.stripe_customer_id,
              stripe_session_id:  company.stripe_session_id,
              order_reference:    company.order_reference,
              created_at:         company.created_at,
            }}
            invoices={(payments as InvoiceRow[]) ?? []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
