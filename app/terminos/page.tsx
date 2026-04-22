import Link from 'next/link'

export const metadata = {
  title: 'Términos de Servicio | CreaTuEmpresaUSA',
  description:
    'Términos y condiciones del servicio de formación empresarial de CreaTuEmpresaUSA LLC. ' +
    'Incluye cláusulas de ausencia de relación abogado-cliente y no práctica del derecho.',
}

export default function TerminosPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800 print:py-8 print:px-0">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Términos de Servicio</h1>
        <p className="text-sm text-gray-500">
          Última actualización: <strong className="text-gray-700">22 de abril de 2026</strong>
        </p>
      </div>

      {/* Amber callout */}
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 mb-10 print:border print:rounded">
        <div className="flex gap-3 items-start">
          <span className="text-xl leading-none mt-0.5" aria-hidden="true">⚠️</span>
          <div>
            <p className="font-semibold text-amber-900 text-sm leading-snug">
              AVISO IMPORTANTE: CreaTuEmpresaUSA LLC NO es una firma de abogados. Nuestros
              servicios son administrativos, no legales. Lea el aviso completo.
            </p>
            <Link
              href="/legal/disclaimer"
              className="text-amber-700 underline text-sm mt-1 inline-block hover:text-amber-900 transition-colors"
            >
              Ver aviso legal completo →
            </Link>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <nav
        className="mb-12 p-5 bg-gray-50 border border-gray-200 rounded-lg print:hidden"
        aria-label="Tabla de contenidos"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
          Contenido
        </p>
        <ol className="space-y-1.5 text-sm">
          {[
            [1,  'Naturaleza del servicio'],
            [2,  'Ausencia de Relación Abogado-Cliente'],
            [3,  'Servicios No Legales — No Práctica de Derecho'],
            [4,  'Servicios ofrecidos'],
            [5,  'Responsabilidades del cliente'],
            [6,  'Plazos de procesamiento'],
            [7,  'Pagos'],
            [8,  'Limitación de responsabilidad'],
            [9,  'Propiedad intelectual'],
            [10, 'Modificaciones'],
            [11, 'Ley aplicable'],
            [12, 'Contacto'],
          ].map(([n, title]) => (
            <li key={n}>
              <a
                href={`#sec-${n}`}
                className="text-teal-600 hover:text-teal-800 hover:underline transition-colors"
              >
                {n}. {title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── Section 1 ─────────────────────────────────────────────── */}
      <section id="sec-1" className="mb-8">
        <h2 className="text-xl font-medium mb-3">1. Naturaleza del servicio</h2>
        <p className="leading-relaxed">
          CreaTuEmpresaUSA es una empresa de servicios administrativos especializada en la
          formación de empresas en Estados Unidos. No somos un despacho de abogados ni proveemos
          asesoría legal, fiscal o contable. La información que proporcionamos es de carácter
          informativo y operativo. Para asesoría legal específica, recomendamos consultar a un
          abogado licenciado. Consulte las{' '}
          <a href="#sec-2" className="text-teal-600 underline hover:text-teal-800">
            Secciones 2
          </a>{' '}
          y{' '}
          <a href="#sec-3" className="text-teal-600 underline hover:text-teal-800">
            3
          </a>{' '}
          de estos Términos, así como nuestro{' '}
          <Link href="/legal/disclaimer" className="text-teal-600 underline hover:text-teal-800">
            Aviso Legal completo
          </Link>
          , para una descripción detallada de los límites de nuestros servicios.
        </p>
      </section>

      {/* ── Section 2 (NEW) ───────────────────────────────────────── */}
      <section id="sec-2" className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-medium mb-4">2. Ausencia de Relación Abogado-Cliente</h2>
        <div className="space-y-4 leading-relaxed">
          <p>
            <strong>2.1</strong> Al contratar los servicios de CreaTuEmpresaUSA LLC, el Cliente
            reconoce expresamente que NO se establece ninguna relación abogado-cliente
            (attorney-client relationship) entre las partes.
          </p>
          <p>
            <strong>2.2</strong> CreaTuEmpresaUSA LLC no es firma legal, bufete de abogados, ni
            proveedor de servicios jurídicos. Nuestra actividad se limita a la formación
            administrativa de entidades comerciales y tramitación ante agencias estatales y
            federales.
          </p>
          <p>
            <strong>2.3</strong> Ninguna comunicación entre el Cliente y CreaTuEmpresaUSA LLC,
            sus representantes, agentes o empleados está cubierta por el privilegio
            abogado-cliente (attorney-client privilege) bajo las leyes de los Estados Unidos ni de
            ninguna otra jurisdicción.
          </p>
          <p>
            <strong>2.4</strong> El Cliente reconoce que para obtener asesoría legal privilegiada
            debe contratar directamente con un abogado licenciado en la jurisdicción
            correspondiente. CreaTuEmpresaUSA LLC puede, a solicitud del Cliente y sin
            responsabilidad, proporcionar referencias a profesionales licenciados, pero no
            garantiza los servicios ni resultados de terceros.
          </p>
          <p>
            <strong>2.5</strong> El Cliente es el único responsable de evaluar si su situación
            particular requiere asesoría legal, fiscal o contable especializada antes, durante o
            después de contratar nuestros servicios.
          </p>
        </div>
      </section>

      {/* ── Section 3 (NEW) ───────────────────────────────────────── */}
      <section id="sec-3" className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-medium mb-4">
          3. Servicios No Legales — No Práctica de Derecho
        </h2>
        <div className="space-y-4 leading-relaxed">
          <p>
            <strong>3.1</strong> CreaTuEmpresaUSA LLC declara expresamente que sus servicios NO
            constituyen práctica del derecho en ninguna jurisdicción.
          </p>
          <p>
            <strong>3.2</strong> La preparación y presentación de documentos estandarizados de
            formación de entidades (Articles of Organization, Certificate of Formation, Operating
            Agreement), la solicitud de números de identificación fiscal (EIN), y la designación
            de Registered Agent son actividades administrativas reconocidas como NO constitutivas
            de práctica legal bajo la normativa de los estados de los Estados Unidos donde
            operamos.
          </p>
          <p>
            <strong>3.3</strong> CreaTuEmpresaUSA LLC no interpreta leyes, no redacta documentos
            legales personalizados según circunstancias particulares del cliente, no representa
            clientes ante tribunales o agencias en calidad de asesor legal, y no emite opiniones
            legales.
          </p>
          <p>
            <strong>3.4</strong> Si el Cliente requiere servicios que excedan el alcance
            administrativo aquí descrito, deberá contratarlos con profesionales licenciados por
            su propia cuenta y riesgo.
          </p>
        </div>
      </section>

      {/* ── Section 4 (was 2) ─────────────────────────────────────── */}
      <section id="sec-4" className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-medium mb-3">4. Servicios ofrecidos</h2>
        <p className="leading-relaxed">
          Nuestros servicios incluyen: formación de LLC y Corporation, obtención de EIN,
          asistencia con ITIN, agente registrado, y gestión administrativa de cumplimiento. El
          alcance exacto de cada servicio se detalla en el plan contratado al momento del pago.
        </p>
      </section>

      {/* ── Section 5 (was 3) ─────────────────────────────────────── */}
      <section id="sec-5" className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-medium mb-3">5. Responsabilidades del cliente</h2>
        <p className="leading-relaxed">
          El cliente es responsable de proporcionar información veraz, completa y actualizada.
          CreaTuEmpresaUSA no se responsabiliza por retrasos, rechazos o errores derivados de
          información incorrecta proporcionada por el cliente. El cliente acepta que los tiempos
          de procesamiento dependen de las autoridades estatales y federales correspondientes.
        </p>
      </section>

      {/* ── Section 6 (was 4) ─────────────────────────────────────── */}
      <section id="sec-6" className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-medium mb-3">6. Plazos de procesamiento</h2>
        <p className="leading-relaxed">
          Los plazos indicados son estimados basados en tiempos habituales de las agencias
          gubernamentales. CreaTuEmpresaUSA no garantiza tiempos específicos de aprobación, ya
          que estos dependen exclusivamente de las autoridades competentes. Informaremos al
          cliente sobre el estado de su trámite a través del portal y por WhatsApp.
        </p>
      </section>

      {/* ── Section 7 (was 5) ─────────────────────────────────────── */}
      <section id="sec-7" className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-medium mb-3">7. Pagos</h2>
        <p className="leading-relaxed">
          Los pagos se procesan de forma segura a través de Stripe. Al completar el pago, el
          cliente autoriza el cargo correspondiente al plan seleccionado. Los precios incluyen
          honorarios de servicio y, donde aplica, tarifas estatales de registro. Consulta nuestra
          Política de Reembolso para condiciones de cancelación.
        </p>
      </section>

      {/* ── Section 8 (was 6) ─────────────────────────────────────── */}
      <section id="sec-8" className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-medium mb-3">8. Limitación de responsabilidad</h2>
        <p className="leading-relaxed">
          CreaTuEmpresaUSA no será responsable por daños indirectos, incidentales o consecuentes
          derivados del uso de nuestros servicios. Nuestra responsabilidad máxima se limita al
          monto pagado por el servicio contratado. No garantizamos la aprobación de trámites
          bancarios, ITIN, ni ningún resultado específico que dependa de terceros.
        </p>
      </section>

      {/* ── Section 9 (was 7) ─────────────────────────────────────── */}
      <section id="sec-9" className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-medium mb-3">9. Propiedad intelectual</h2>
        <p className="leading-relaxed">
          Todo el contenido de la plataforma, incluyendo textos, diseños, logotipos y software,
          es propiedad de CreaTuEmpresaUSA o sus licenciantes. Está prohibida su reproducción o
          uso sin autorización expresa por escrito.
        </p>
      </section>

      {/* ── Section 10 (was 8) ────────────────────────────────────── */}
      <section id="sec-10" className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-medium mb-3">10. Modificaciones</h2>
        <p className="leading-relaxed">
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
          materiales serán notificados por correo electrónico con al menos 7 días de anticipación.
          El uso continuado del servicio tras la notificación implica aceptación de los nuevos
          términos.
        </p>
      </section>

      {/* ── Section 11 (was 9) ────────────────────────────────────── */}
      <section id="sec-11" className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-medium mb-3">11. Ley aplicable</h2>
        <p className="leading-relaxed">
          Estos términos se rigen por las leyes del Estado de Colorado, Estados Unidos. Cualquier
          disputa será resuelta en los tribunales competentes de dicha jurisdicción.
        </p>
      </section>

      {/* ── Section 12 (was 10) ───────────────────────────────────── */}
      <section id="sec-12" className="mb-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-medium mb-3">12. Contacto</h2>
        <p className="leading-relaxed">
          Para cualquier consulta sobre estos términos:{' '}
          <a
            href="mailto:soporte@creatuempresausa.com"
            className="text-teal-600 underline hover:text-teal-800"
          >
            soporte@creatuempresausa.com
          </a>
        </p>
      </section>

      {/* Page footer */}
      <div className="pt-8 border-t border-gray-200 text-sm text-gray-500 space-y-2">
        <p>
          Última actualización:{' '}
          <strong className="text-gray-700">22 de abril de 2026</strong>
        </p>
        <p>
          <Link
            href="/legal/disclaimer"
            className="text-teal-600 underline hover:text-teal-800 transition-colors"
          >
            Ver Aviso Legal y Descargo de Responsabilidad completo →
          </Link>
        </p>
      </div>

    </main>
  )
}
