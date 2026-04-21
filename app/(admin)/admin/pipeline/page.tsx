import { createAdminServerClient } from '@/lib/supabase/server'
import { PipelineClient } from './PipelineClient'

export type PipelineRow = {
  id:           string
  company_name: string
  email:        string
  full_name:    string | null
  state:        string | null
  entity_type:  string | null
  status:       string | null
  created_at:   string
  updated_at:   string | null
  days_stale:   number   // EXTRACT(DAY FROM NOW() - COALESCE(updated_at, created_at))
  is_test:      boolean  // email matches test|example|demo|fake|prueba
}

const TEST_RE = /test|example|demo|fake|prueba/i

export default async function PipelinePage() {
  const supabase = createAdminServerClient()

  const { data, error } = await supabase
    .from('companies')
    .select(`
      id, company_name, state, entity_type, status,
      created_at, updated_at,
      clients (
        id,
        users ( full_name, email )
      )
    `)

  if (error) {
    return (
      <div className="p-8 text-red-600 text-sm font-mono">
        Error loading pipeline: {error.message}
      </div>
    )
  }

  const rows: PipelineRow[] = (data ?? [])
    .map((c: any) => {
      const user      = c.clients?.users
      const email     = user?.email ?? ''
      const pivot     = c.updated_at ?? c.created_at
      const days_stale = Math.floor(
        (Date.now() - new Date(pivot).getTime()) / 86_400_000
      )
      return {
        id:           c.id,
        company_name: c.company_name ?? '—',
        email,
        full_name:    user?.full_name ?? null,
        state:        c.state        ?? null,
        entity_type:  c.entity_type  ?? null,
        status:       c.status       ?? null,
        created_at:   c.created_at,
        updated_at:   c.updated_at   ?? null,
        days_stale,
        is_test:      TEST_RE.test(email),
      }
    })
    // ORDER BY days_stale DESC — más atascados arriba
    .sort((a, b) => b.days_stale - a.days_stale)

  return <PipelineClient data={rows} />
}
