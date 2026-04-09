'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PROFILES, type BusinessProfile, type StateRec } from '@/lib/marketing/decision-data'
import { WA_URL } from '@/lib/marketing/state-data'

const NAVY = '#0A2540'
const RED  = '#DC2626'

function RecCard({ rec }: { rec: StateRec }) {
  const href = rec.hasPage ? `/llc/${rec.slug}` : WA_URL
  const isExternal = !rec.hasPage

  return (
    <div
      style={{
        border: rec.badge ? `2px solid ${NAVY}` : '1px solid #e2e8f0',
        borderRadius: '14px',
        position: 'relative',
      }}
      className="bg-white p-5 flex flex-col gap-3"
    >
      {rec.badge && (
        <span
          style={{ background: NAVY, color: 'white', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em', position: 'absolute', top: 14, right: 14 }}
          className="px-2.5 py-0.5 uppercase"
        >
          {rec.badge}
        </span>
      )}

      <div>
        <p
          style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: NAVY }}
          className="mb-1"
        >
          {rec.name}
        </p>
        <p className="text-sm text-slate-500 leading-relaxed">{rec.why}</p>
      </div>

      {rec.hasPage ? (
        <Link
          href={href}
          style={{ border: `1.5px solid ${NAVY}`, color: NAVY, borderRadius: '8px' }}
          className="inline-flex items-center justify-center text-xs font-semibold py-2 px-4 hover:bg-slate-50 transition-colors mt-auto"
        >
          Ver {rec.name} →
        </Link>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ border: `1.5px solid ${NAVY}`, color: NAVY, borderRadius: '8px' }}
          className="inline-flex items-center justify-center text-xs font-semibold py-2 px-4 hover:bg-slate-50 transition-colors mt-auto"
        >
          {rec.ctaLabel ?? 'Consultar esta opción'} →
        </a>
      )}
    </div>
  )
}

function ProfileButton({ profile, active, onClick }: { profile: BusinessProfile; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: active ? `2px solid ${NAVY}` : '1px solid #e2e8f0',
        borderRadius: '12px',
        background: active ? NAVY : 'white',
        color: active ? 'white' : '#334155',
        textAlign: 'left',
        transition: 'all 0.15s ease',
      }}
      className="p-4 w-full hover:border-slate-400 hover:shadow-sm"
    >
      <p className="text-sm font-semibold leading-snug">{profile.label}</p>
      <p
        className="text-xs mt-1 leading-relaxed"
        style={{ color: active ? 'rgba(255,255,255,0.65)' : '#94a3b8' }}
      >
        {profile.description}
      </p>
    </button>
  )
}

export function BusinessProfileSelector() {
  const [activeId, setActiveId] = useState<string | null>(null)

  const active = PROFILES.find(p => p.id === activeId) ?? null

  function select(id: string) {
    setActiveId(prev => (prev === id ? null : id))
  }

  return (
    <div className="space-y-8">
      {/* Profile grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROFILES.map(profile => (
          <ProfileButton
            key={profile.id}
            profile={profile}
            active={activeId === profile.id}
            onClick={() => select(profile.id)}
          />
        ))}
      </div>

      {/* Recommendation panel */}
      {active ? (
        <div
          style={{ border: '1px solid #e2e8f0', borderRadius: '18px', background: '#fafafa' }}
          className="p-6"
        >
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: RED }}>
              Tu perfil
            </p>
            <p
              style={{ fontFamily: 'var(--font-manrope), Manrope, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: NAVY }}
            >
              {active.label}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Según tu perfil, estos estados suelen ser la mejor opción:
            </p>
          </div>
          <div className={`grid gap-4 ${active.recs.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {active.recs.map(rec => (
              <RecCard key={rec.slug} rec={rec} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-5 pt-4 border-t border-slate-200">
            Trabajamos con los 50 estados. Si tu caso requiere otro estado,{' '}
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">
              consúltanos directamente
            </a>.
          </p>
        </div>
      ) : (
        <div
          style={{ border: '1.5px dashed #e2e8f0', borderRadius: '18px' }}
          className="py-10 text-center"
        >
          <p className="text-sm text-slate-400">
            Selecciona tu tipo de negocio para ver las opciones recomendadas.
          </p>
        </div>
      )}
    </div>
  )
}
