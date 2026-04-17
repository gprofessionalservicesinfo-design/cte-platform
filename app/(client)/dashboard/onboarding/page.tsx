'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, ChevronLeft, ChevronRight, Plus, Trash2, Building2 } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface Member {
  full_name:            string
  address:              string
  country:              string
  ownership_percentage: number | ''
}

interface FormData {
  // Step 1 — business
  business_activity: string
  alternate_name_1:  string
  alternate_name_2:  string
  // Step 2 — members
  members: Member[]
  // Step 3 — addresses
  principal_office_address: string
  mailing_same:             boolean
  mailing_address:          string
}

const emptyMember = (): Member => ({
  full_name:            '',
  address:              '',
  country:              '',
  ownership_percentage: '',
})

const STEPS = [
  { number: 1, label: 'Tu empresa'     },
  { number: 2, label: 'Miembros'       },
  { number: 3, label: 'Dirección'      },
  { number: 4, label: 'Confirmación'   },
]

// ── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep]         = useState(1)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [userFullName, setUserFullName] = useState('')
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors]     = useState<Record<string, string>>({})

  const [form, setForm] = useState<FormData>({
    business_activity:        '',
    alternate_name_1:         '',
    alternate_name_2:         '',
    members:                  [emptyMember()],
    principal_office_address: '',
    mailing_same:             true,
    mailing_address:          '',
  })

  // ── Load company + pre-fill ──────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const fullName = profile?.full_name ?? ''
      setUserFullName(fullName)

      const { data: clientRow } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!clientRow) { setLoading(false); return }

      const { data: company } = await supabase
        .from('companies')
        .select('id, company_name, onboarding_completed, business_activity, alternate_name_1, alternate_name_2, principal_office_address, mailing_address')
        .eq('client_id', clientRow.id)
        .order('created_at')
        .limit(1)
        .maybeSingle()

      if (!company) { setLoading(false); return }

      if (company.onboarding_completed) {
        router.push('/dashboard')
        return
      }

      setCompanyId(company.id)
      setCompanyName(company.company_name ?? '')

      // Pre-fill from any existing partial data + user name
      const { data: existingMembers } = await supabase
        .from('company_members')
        .select('*')
        .eq('company_id', company.id)
        .order('is_primary', { ascending: false })

      const prefillMembers: Member[] = existingMembers && existingMembers.length > 0
        ? existingMembers.map(m => ({
            full_name:            m.full_name ?? '',
            address:              m.address   ?? '',
            country:              m.country   ?? '',
            ownership_percentage: m.ownership_percentage ?? '',
          }))
        : [{ full_name: fullName, address: '', country: '', ownership_percentage: 100 }]

      setForm(prev => ({
        ...prev,
        business_activity:        company.business_activity        ?? '',
        alternate_name_1:         company.alternate_name_1         ?? '',
        alternate_name_2:         company.alternate_name_2         ?? '',
        principal_office_address: company.principal_office_address ?? '',
        mailing_address:          company.mailing_address          ?? '',
        mailing_same:             !company.mailing_address || company.mailing_address === company.principal_office_address,
        members:                  prefillMembers,
      }))

      setLoading(false)
    }
    load()
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────────

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e })
  }

  function setMemberField(idx: number, field: keyof Member, value: string | number) {
    setForm(prev => {
      const members = [...prev.members]
      members[idx] = { ...members[idx], [field]: value }
      return { ...prev, members }
    })
    if (errors[`member_${idx}_${field}`]) {
      setErrors(prev => { const e = { ...prev }; delete e[`member_${idx}_${field}`]; return e })
    }
  }

  function addMember() {
    setForm(prev => ({ ...prev, members: [...prev.members, { ...emptyMember(), ownership_percentage: '' }] }))
  }

  function removeMember(idx: number) {
    setForm(prev => ({ ...prev, members: prev.members.filter((_, i) => i !== idx) }))
  }

  // ── Validation per step ──────────────────────────────────────────────────

  function validate(): boolean {
    const e: Record<string, string> = {}

    if (step === 1) {
      if (!form.business_activity.trim()) e.business_activity = 'Este campo es requerido'
    }

    if (step === 2) {
      form.members.forEach((m, i) => {
        if (!m.full_name.trim())  e[`member_${i}_full_name`]  = 'Nombre requerido'
        if (!m.country.trim())    e[`member_${i}_country`]    = 'País requerido'
        if (m.ownership_percentage === '' || Number(m.ownership_percentage) <= 0)
          e[`member_${i}_ownership_percentage`] = 'Porcentaje requerido'
      })
      const total = form.members.reduce((sum, m) => sum + Number(m.ownership_percentage || 0), 0)
      if (Math.abs(total - 100) > 0.01) e.ownership_total = `El total debe ser 100% (actual: ${total}%)`
    }

    if (step === 3) {
      if (!form.principal_office_address.trim()) e.principal_office_address = 'Este campo es requerido'
      if (!form.mailing_same && !form.mailing_address.trim()) e.mailing_address = 'Este campo es requerido'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (validate()) setStep(s => s + 1)
  }
  function back() {
    setErrors({})
    setStep(s => s - 1)
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!companyId) return
    setSubmitting(true)

    const mailingAddr = form.mailing_same
      ? form.principal_office_address
      : form.mailing_address

    // 1. Update companies
    const { error: companyErr } = await supabase
      .from('companies')
      .update({
        business_activity:        form.business_activity,
        alternate_name_1:         form.alternate_name_1   || null,
        alternate_name_2:         form.alternate_name_2   || null,
        principal_office_address: form.principal_office_address,
        mailing_address:          mailingAddr,
        onboarding_completed:     true,
        onboarding_completed_at:  new Date().toISOString(),
      })
      .eq('id', companyId)

    if (companyErr) {
      setErrors({ submit: companyErr.message })
      setSubmitting(false)
      return
    }

    // 2. Delete existing members and re-insert
    await supabase.from('company_members').delete().eq('company_id', companyId)

    const memberRows = form.members.map((m, i) => ({
      company_id:           companyId,
      full_name:            m.full_name,
      address:              m.address || null,
      country:              m.country || null,
      ownership_percentage: Number(m.ownership_percentage) || 0,
      capital_contribution: '$0.00',
      role:                 'member',
      is_primary:           i === 0,
    }))

    const { error: membersErr } = await supabase
      .from('company_members')
      .insert(memberRows)

    if (membersErr) {
      setErrors({ submit: membersErr.message })
      setSubmitting(false)
      return
    }

    router.push('/dashboard?onboarding=done')
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!companyId) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">No se encontró tu empresa. Contacta soporte.</p>
      </div>
    )
  }

  const totalPct = form.members.reduce((sum, m) => sum + Number(m.ownership_percentage || 0), 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="rounded-2xl bg-[#0A2540] text-white px-6 py-7">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-300 mb-1">Información de tu empresa</p>
        <h1 className="text-xl sm:text-2xl font-bold">{companyName}</h1>
        <p className="text-blue-200 text-sm mt-1">Completa estos datos para que podamos preparar tus documentos legales.</p>
      </div>

      {/* Progress bar */}
      <div className="px-1">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > s.number
                    ? 'bg-green-500 text-white'
                    : step === s.number
                      ? 'bg-[#0A2540] text-white'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}>
                  {step > s.number ? <CheckCircle2 className="h-4 w-4" /> : s.number}
                </div>
                <span className={`text-xs mt-1 font-medium hidden sm:block ${step === s.number ? 'text-[#0A2540]' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 transition-colors ${step > s.number ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">Paso {step} de {STEPS.length}</p>
      </div>

      {/* ── Step 1 — Tu empresa ─────────────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardContent className="pt-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Tu empresa</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Cuál es la actividad principal de tu negocio? <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={form.business_activity}
                onChange={e => setField('business_activity', e.target.value)}
                placeholder="Ej: Consultoría de marketing digital para empresas de América Latina"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.business_activity ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.business_activity && <p className="text-red-500 text-xs mt-1">{errors.business_activity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre alternativo #1
                <span className="text-gray-400 font-normal ml-1">(opcional — por si el nombre principal no está disponible)</span>
              </label>
              <input
                type="text"
                value={form.alternate_name_1}
                onChange={e => setField('alternate_name_1', e.target.value)}
                placeholder="Ej: Mi Empresa Digital LLC"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre alternativo #2
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <input
                type="text"
                value={form.alternate_name_2}
                onChange={e => setField('alternate_name_2', e.target.value)}
                placeholder="Ej: MD Consulting LLC"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2 — Miembros ───────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Miembros / Dueños</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  Math.abs(totalPct - 100) < 0.01
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  Total: {totalPct}%
                </span>
              </div>
              {errors.ownership_total && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
                  <p className="text-red-600 text-sm">{errors.ownership_total}</p>
                </div>
              )}
              <p className="text-sm text-gray-500 mb-5">
                Lista a todos los dueños/miembros de la LLC. El total de porcentajes debe ser exactamente 100%.
              </p>

              <div className="space-y-5">
                {form.members.map((m, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Miembro {idx + 1}{idx === 0 ? ' (principal)' : ''}
                      </span>
                      {form.members.length > 1 && (
                        <button
                          onClick={() => removeMember(idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={m.full_name}
                        onChange={e => setMemberField(idx, 'full_name', e.target.value)}
                        placeholder="Nombre Apellido"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`member_${idx}_full_name`] ? 'border-red-400' : 'border-gray-300'}`}
                      />
                      {errors[`member_${idx}_full_name`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`member_${idx}_full_name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                      <input
                        type="text"
                        value={m.address}
                        onChange={e => setMemberField(idx, 'address', e.target.value)}
                        placeholder="Calle, Ciudad, Estado/Provincia, Código Postal"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          País <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={m.country}
                          onChange={e => setMemberField(idx, 'country', e.target.value)}
                          placeholder="Ej: México"
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`member_${idx}_country`] ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errors[`member_${idx}_country`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`member_${idx}_country`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          % de participación <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            value={m.ownership_percentage}
                            onChange={e => setMemberField(idx, 'ownership_percentage', e.target.value === '' ? '' : parseFloat(e.target.value))}
                            placeholder="100"
                            className={`w-full border rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[`member_${idx}_ownership_percentage`] ? 'border-red-400' : 'border-gray-300'}`}
                          />
                          <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                        </div>
                        {errors[`member_${idx}_ownership_percentage`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`member_${idx}_ownership_percentage`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addMember}
                className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 rounded-xl py-3 text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar otro miembro
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Step 3 — Dirección ──────────────────────────────────────────── */}
      {step === 3 && (
        <Card>
          <CardContent className="pt-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Dirección de tu empresa</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección de la oficina principal <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Puede ser tu dirección personal, una dirección virtual o la de tu negocio. No tiene que estar en EE.UU.
              </p>
              <input
                type="text"
                value={form.principal_office_address}
                onChange={e => setField('principal_office_address', e.target.value)}
                placeholder="Calle 123, Ciudad, Estado/Provincia, País"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.principal_office_address ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.principal_office_address && (
                <p className="text-red-500 text-xs mt-1">{errors.principal_office_address}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-medium mb-1">¿Necesitas dirección en EE.UU.?</p>
              <p className="text-xs text-blue-600">
                Si no tienes una dirección física en Estados Unidos, nosotros podemos proveer una dirección comercial profesional en tu estado. Contacta a tu asesor para más información.
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.mailing_same}
                  onChange={e => setField('mailing_same', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">La dirección postal es la misma que la principal</span>
              </label>
            </div>

            {!form.mailing_same && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.mailing_address}
                  onChange={e => setField('mailing_address', e.target.value)}
                  placeholder="Calle 456, Ciudad, Estado/Provincia, País"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.mailing_address ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.mailing_address && (
                  <p className="text-red-500 text-xs mt-1">{errors.mailing_address}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step 4 — Confirmación ────────────────────────────────────────── */}
      {step === 4 && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirma tu información</h2>

              <div className="space-y-4">
                {/* Business */}
                <SummarySection title="Tu empresa">
                  <SummaryRow label="Actividad principal"  value={form.business_activity} />
                  {form.alternate_name_1 && <SummaryRow label="Nombre alternativo #1" value={form.alternate_name_1} />}
                  {form.alternate_name_2 && <SummaryRow label="Nombre alternativo #2" value={form.alternate_name_2} />}
                </SummarySection>

                {/* Members */}
                <SummarySection title="Miembros">
                  {form.members.map((m, i) => (
                    <div key={i} className={i > 0 ? 'pt-3 border-t border-gray-100' : ''}>
                      <SummaryRow label={`Miembro ${i + 1}`}        value={m.full_name} />
                      {m.address && <SummaryRow label="Dirección"   value={m.address} />}
                      {m.country && <SummaryRow label="País"        value={m.country} />}
                      <SummaryRow label="Participación"             value={`${m.ownership_percentage}%`} />
                    </div>
                  ))}
                </SummarySection>

                {/* Addresses */}
                <SummarySection title="Dirección">
                  <SummaryRow label="Oficina principal" value={form.principal_office_address} />
                  <SummaryRow
                    label="Dirección postal"
                    value={form.mailing_same ? '(igual que la principal)' : form.mailing_address}
                  />
                </SummarySection>
              </div>
            </CardContent>
          </Card>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#0A2540] hover:bg-[#0d3060] disabled:opacity-50 text-white font-bold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Confirmar y enviar
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Navigation buttons ──────────────────────────────────────────── */}
      {step < 4 && (
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={back}
              className="flex items-center gap-1.5 px-5 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#0A2540] hover:bg-[#0d3060] text-white font-bold py-3 rounded-xl transition-colors"
          >
            {step === 3 ? 'Revisar' : 'Continuar'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 4 && (
        <button
          onClick={back}
          className="flex items-center gap-1.5 px-5 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors w-full justify-center"
        >
          <ChevronLeft className="h-4 w-4" />
          Editar información
        </button>
      )}
    </div>
  )
}

// ── Summary sub-components ────────────────────────────────────────────────────

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}
