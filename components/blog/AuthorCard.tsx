export default function AuthorCard() {
  return (
    <div className="flex items-start gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl bg-gray-50 mt-12 border border-gray-100">
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-lg"
        style={{ background: 'linear-gradient(135deg, #2CB98A 0%, #2A3544 100%)' }}
      >
        CTE
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
          Escrito por
        </p>
        <p className="font-bold text-gray-900 text-base">Equipo CreaTuEmpresaUSA</p>
        <p className="text-sm text-gray-600 leading-relaxed mt-1.5">
          Especialistas en formación de empresas en EE.UU. para emprendedores de LATAM.
          Más de 500 LLCs formadas desde México, Colombia, Argentina y toda América Latina.
        </p>
      </div>
    </div>
  )
}
