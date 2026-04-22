import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso Legal y Descargo de Responsabilidad | CreaTuEmpresaUSA',
  description:
    'Aviso legal completo de Gutierrez Professional Services LLC d/b/a CreaTuEmpresaUSA. Naturaleza de servicios administrativos, ' +
    'ausencia de asesoría legal o fiscal, limitación de responsabilidad y ausencia de relación ' +
    'abogado-cliente.',
}

export default function DisclaimerPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800 print:py-8 print:px-0">

      {/* Hero */}
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-3 print:hidden">
          Aviso Legal
        </p>
        <h1 className="text-3xl font-semibold leading-snug mb-3 print:text-2xl">
          Aviso Legal y Descargo de Responsabilidad
        </h1>
        <p className="text-sm text-gray-500">
          <strong>Gutierrez Professional Services LLC d/b/a CreaTuEmpresaUSA</strong> — Última actualización: 22 de abril de 2026
        </p>
      </div>

      {/* 0 */}
      <section className="mb-10 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">0. Identificación de la empresa</h2>
        <div className="space-y-3 leading-relaxed text-gray-700">
          <p>Este sitio web y los servicios que en él se ofrecen son operados por:</p>
          <ul className="list-none pl-0 space-y-2">
            <li><strong>Razón social:</strong> Gutierrez Professional Services LLC</li>
            <li><strong>Nombre comercial (DBA):</strong> CreaTuEmpresaUSA</li>
            <li><strong>Estado de constitución:</strong> Florida, Estados Unidos</li>
            <li><strong>Registro en estado extranjero:</strong> Colorado (Condado de El Paso)</li>
            <li><strong>Dirección principal:</strong> Colorado Springs, Colorado, EE. UU.</li>
          </ul>
          <p>
            Las referencias a &ldquo;CreaTuEmpresaUSA&rdquo; en este sitio corresponden a{' '}
            <strong>Gutierrez Professional Services LLC d/b/a CreaTuEmpresaUSA</strong>.
          </p>
        </div>
      </section>

      {/* 1 */}
      <section className="mb-10 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">1. Naturaleza de nuestros servicios</h2>
        <div className="space-y-3 leading-relaxed text-gray-700">
          <p>
            <strong>Gutierrez Professional Services LLC d/b/a CreaTuEmpresaUSA</strong> es un proveedor de servicios de formación de
            entidades (<em>business formation</em>) y tramitación administrativa en los Estados
            Unidos.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>NO somos una firma de abogados</strong> ni prestamos servicios legales de
              ningún tipo.
            </li>
            <li>
              <strong>NO somos CPAs ni asesores fiscales licenciados.</strong>
            </li>
            <li>
              Nuestra actividad es exclusivamente <strong>administrativa y de tramitación</strong>:
              preparación y presentación de formularios de registro, gestión de agentes registrados,
              y servicios de apoyo operativo.
            </li>
          </ul>
          <p>
            Los documentos que preparamos son formularios estándar requeridos por los estados para
            la formación de entidades comerciales. No redactamos documentos legales ni ofrecemos
            asesoría sobre la estructura legal más conveniente para su situación específica.
          </p>
        </div>
      </section>

      {/* 2 */}
      <section className="mb-10 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">2. No asesoría legal, fiscal ni contable</h2>
        <div className="space-y-3 leading-relaxed text-gray-700">
          <p>
            El contenido publicado en este sitio web, blog, videos, redes sociales y cualquier
            comunicación de CreaTuEmpresaUSA tiene carácter{' '}
            <strong>informativo general únicamente</strong>.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>No constituye opinión legal, fiscal ni contable.</li>
            <li>
              No reemplaza la consulta con un abogado, CPA o asesor fiscal licenciado.
            </li>
            <li>
              Las leyes, regulaciones y requisitos fiscales cambian con frecuencia. Verifique
              siempre la información vigente con un profesional activo en la jurisdicción
              correspondiente.
            </li>
            <li>
              Los ejemplos y escenarios mencionados son ilustrativos y pueden no aplicar a su
              situación particular.
            </li>
          </ul>
        </div>
      </section>

      {/* 3 */}
      <section className="mb-10 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">3. Ausencia de relación abogado-cliente</h2>
        <div className="space-y-3 leading-relaxed text-gray-700">
          <p>
            <strong>
              El uso de este sitio web, la compra de cualquiera de nuestros servicios, o cualquier
              comunicación con Gutierrez Professional Services LLC d/b/a CreaTuEmpresaUSA no crea una relación abogado-cliente.
            </strong>
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Ninguna comunicación con CreaTuEmpresaUSA está cubierta por el privilegio
              abogado-cliente (<em>attorney-client privilege</em>).
            </li>
            <li>
              No existe obligación fiduciaria legal entre Gutierrez Professional Services LLC d/b/a CreaTuEmpresaUSA y sus clientes más
              allá de la prestación del servicio administrativo contratado.
            </li>
            <li>
              Para obtener asesoría legal privilegiada y protegida por el privilegio
              abogado-cliente, deberá contratar directamente a un abogado licenciado en la
              jurisdicción correspondiente.
            </li>
          </ul>
        </div>
      </section>

      {/* 4 */}
      <section className="mb-10 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">4. Jurisdicción y limitaciones</h2>
        <div className="space-y-3 leading-relaxed text-gray-700">
          <p>
            Los servicios de CreaTuEmpresaUSA están disponibles sujetos a las leyes aplicables
            de los Estados Unidos de América.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Los usuarios son responsables de verificar la legalidad y viabilidad de la formación
              de una entidad en EE. UU. según las leyes de su país de residencia o domicilio
              fiscal.
            </li>
            <li>
              No ofrecemos asesoría sobre impuestos internacionales, tratados de doble tributación
              específicos, ni implicaciones fiscales en jurisdicciones fuera de los Estados Unidos.
            </li>
            <li>
              El uso de nuestros servicios desde países con restricciones legales sobre la
              formación de entidades extranjeras es responsabilidad exclusiva del usuario.
            </li>
          </ul>
        </div>
      </section>

      {/* 5 */}
      <section className="mb-10 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">5. Sobre la información fiscal y regulatoria</h2>
        <div className="space-y-3 leading-relaxed text-gray-700">
          <p>
            La información que compartimos sobre obligaciones ante el IRS, FinCEN, reportes BOI,
            Formulario 5472, W-8BEN y otros formularios regulatorios tiene carácter{' '}
            <strong>referencial e informativo</strong>.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cada caso fiscal es único y depende de múltiples variables individuales.</li>
            <li>
              Recomendamos consultar con un CPA licenciado en la jurisdicción fiscal relevante
              antes de tomar cualquier decisión.
            </li>
            <li>
              No garantizamos resultados fiscales específicos ni la aplicabilidad de ninguna
              estrategia fiscal a su situación particular.
            </li>
            <li>
              Los plazos, montos de multas y requisitos de presentación pueden cambiar. Verifique
              siempre con fuentes oficiales (irs.gov, fincen.gov) o con su asesor fiscal.
            </li>
          </ul>
        </div>
      </section>

      {/* 6 */}
      <section className="mb-10 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">6. Limitación de responsabilidad</h2>
        <div className="space-y-3 leading-relaxed text-gray-700">
          <p>En la máxima medida permitida por la ley aplicable:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              La responsabilidad de Gutierrez Professional Services LLC d/b/a CreaTuEmpresaUSA se limita al monto efectivamente pagado
              por el servicio específico contratado.
            </li>
            <li>
              No somos responsables por decisiones de naturaleza fiscal, legal o empresarial
              tomadas por el cliente basándose en información publicada en nuestro sitio o en
              comunicaciones con nuestro equipo.
            </li>
            <li>
              No somos responsables por cambios regulatorios, legales o fiscales ocurridos con
              posterioridad a la prestación del servicio.
            </li>
            <li>
              No garantizamos la aprobación de trámites que dependan de autoridades
              gubernamentales independientes (formación de LLC, EIN, cuentas bancarias, etc.).
            </li>
          </ul>
        </div>
      </section>

      {/* 7 */}
      <section className="mb-10 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">7. Contacto para consultas legales</h2>
        <div className="space-y-3 leading-relaxed text-gray-700">
          <p>Para consultas relacionadas con este aviso legal o descargo de responsabilidad:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Correo de contacto:</strong>{' '}
              <a
                href="mailto:soporte@creatuempresausa.com"
                className="text-teal-600 underline hover:text-teal-700"
              >
                soporte@creatuempresausa.com
              </a>
            </li>
            <li>
              <strong>Razón social:</strong> Gutierrez Professional Services LLC
            </li>
            <li>
              <strong>Nombre comercial:</strong> CreaTuEmpresaUSA
            </li>
            <li>
              <strong>Estado de constitución:</strong> Florida, Estados Unidos
            </li>
            <li>
              <strong>Registro en estado extranjero:</strong> Colorado (Condado de El Paso)
            </li>
          </ul>
          <p className="text-sm text-gray-500 pt-2">
            Tiempo de respuesta habitual: 1–2 días hábiles.
          </p>
        </div>
      </section>

      {/* Footer row */}
      <div className="pt-8 border-t border-gray-200 text-sm text-gray-500 space-y-1">
        <p>
          Última actualización: <strong className="text-gray-700">22 de abril de 2026</strong>
        </p>
        <p>
          Gutierrez Professional Services LLC d/b/a CreaTuEmpresaUSA se reserva el derecho de actualizar este aviso en cualquier momento.
          El uso continuado del sitio tras la publicación de cambios implica aceptación de los
          mismos.
        </p>
      </div>
    </main>
  )
}
