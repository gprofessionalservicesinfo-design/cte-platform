import Link from 'next/link'

const NAVY = '#0A2540'

export function MarketingFooter() {
  return (
    <footer style={{ background: NAVY }} className="text-white">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <p
              style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.15rem' }}
              className="mb-3"
            >
              CreaTuEmpresa<span style={{ color: '#DC2626' }}>USA</span>
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Formamos empresas en EE.UU. para emprendedores latinoamericanos. 100% remoto, en español.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Servicios
            </p>
            <ul className="space-y-2">
              {[
                { label: 'Formación de LLC', href: '/#pricing' },
                { label: 'Formación de Corporation', href: '/#pricing' },
                { label: 'Obtención de EIN', href: '/ein-extranjeros' },
                { label: 'Dirección comercial', href: '/#pricing' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guías */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Guías
            </p>
            <ul className="space-y-2">
              {[
                { label: 'LLC en Florida', href: '/llc/florida' },
                { label: 'LLC en Texas', href: '/llc/texas' },
                { label: 'LLC en Wyoming', href: '/llc/wyoming' },
                { label: 'LLC vs Corp vs DBA', href: '/comparar' },
                { label: 'EIN para extranjeros', href: '/ein-extranjeros' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Empresa
            </p>
            <ul className="space-y-2">
              {[
                { label: 'Iniciar sesión', href: '/login' },
                { label: 'Privacidad', href: '/privacidad' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            &copy; {new Date().getFullYear()} CreaTuEmpresaUSA. Servicio administrativo — no asesoría legal.
          </p>
          <div className="flex gap-5">
            <Link href="/privacidad" className="text-xs hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
