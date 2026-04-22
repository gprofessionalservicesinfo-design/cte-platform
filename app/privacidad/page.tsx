import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Privacy Policy — CreaTuEmpresaUSA',
  description: 'Política de privacidad de CreaTuEmpresaUSA. Cómo recopilamos, usamos y protegemos tu información personal.',
}

const EFFECTIVE_DATE    = '22 de abril de 2026'
const EFFECTIVE_DATE_EN = 'April 22, 2026'
const CONTACT_EMAIL     = 'soporte@creatuempresausa.com'
const COMPANY           = 'CreaTuEmpresaUSA'

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white print:bg-white">

      {/* Dark header */}
      <div style={{ background: '#0A2540' }} className="py-12 px-6 print:bg-white print:py-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2 print:text-gray-500">Legal</p>
          <h1 className="text-3xl font-bold text-white mb-2 print:text-gray-900">
            Política de Privacidad / Privacy Policy
          </h1>
          <p className="text-blue-200 text-sm print:text-gray-600">
            Vigente desde / Effective: {EFFECTIVE_DATE} · {COMPANY}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 print:py-6">

        {/* Amber callout — bilingual, full width */}
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 mb-8 print:border print:rounded">
          <div className="flex gap-3 items-start">
            <span className="text-xl leading-none mt-0.5 shrink-0" aria-hidden="true">⚠️</span>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-amber-900">
                Las comunicaciones con {COMPANY} NO están cubiertas por privilegio abogado-cliente.
              </p>
              <p className="text-amber-800">
                Communications with {COMPANY} are NOT covered by attorney-client privilege.
              </p>
              <Link
                href="/legal/disclaimer"
                className="text-amber-700 underline hover:text-amber-900 transition-colors inline-block mt-1"
              >
                Ver aviso legal completo / View full legal disclaimer →
              </Link>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <nav
          className="mb-10 p-5 bg-gray-50 border border-gray-200 rounded-lg print:hidden"
          aria-label="Tabla de contenidos / Table of contents"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
            Contenido / Contents
          </p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div>
              <p className="font-semibold text-gray-600 mb-2">🇪🇸 Español</p>
              <ol className="space-y-1">
                {[
                  ['es-0', '0. Aviso sobre Privilegio Legal'],
                  ['es-1', '1. Quiénes somos'],
                  ['es-2', '2. Información que recopilamos'],
                  ['es-3', '3. Cómo usamos tu información'],
                  ['es-4', '4. Terceros con quienes compartimos datos'],
                  ['es-5', '5. Retención de datos'],
                  ['es-6', '6. Seguridad'],
                  ['es-7', '7. Tus derechos'],
                  ['es-8', '8. Cookies'],
                  ['es-9', '9. Cambios a esta política'],
                  ['es-10', '10. Contacto'],
                ].map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-teal-600 hover:underline hover:text-teal-800 transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-4 sm:mt-0">
              <p className="font-semibold text-gray-600 mb-2">🇺🇸 English</p>
              <ol className="space-y-1">
                {[
                  ['en-0', '0. Notice on Legal Privilege'],
                  ['en-1', '1. Who We Are'],
                  ['en-2', '2. Information We Collect'],
                  ['en-3', '3. How We Use Your Information'],
                  ['en-4', '4. Third Parties We Share Data With'],
                  ['en-5', '5. Data Retention'],
                  ['en-6', '6. Security'],
                  ['en-7', '7. Your Rights'],
                  ['en-8', '8. Cookies'],
                  ['en-9', '9. Changes to This Policy'],
                  ['en-10', '10. Contact'],
                ].map(([id, label]) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-teal-600 hover:underline hover:text-teal-800 transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </nav>

        <div className="space-y-16">

          {/* ══════════════════════════════════════════════════════════
              ESPAÑOL
          ══════════════════════════════════════════════════════════ */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              🇪🇸 Español
            </h2>

            <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

              {/* ── ES Section 0 (NEW) ──────────────────────────── */}
              <div id="es-0">
                <h3 className="font-semibold text-gray-900 mb-3 text-base">
                  0. Aviso Importante sobre Comunicaciones y Privilegio Legal
                </h3>
                <p className="mb-3">
                  Las comunicaciones del Usuario con {COMPANY} LLC a través de cualquier canal
                  (correo electrónico, WhatsApp, portal cliente, formularios web, llamadas
                  telefónicas, chats automatizados) <strong>NO están cubiertas por el privilegio
                  abogado-cliente (attorney-client privilege)</strong>.
                </p>
                <p className="mb-2">Dichas comunicaciones pueden ser, entre otros:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Almacenadas en sistemas de la empresa con fines operativos.
                  </li>
                  <li>
                    Accesibles por personal autorizado y proveedores tecnológicos (p.ej. Supabase,
                    Stripe, Resend, Twilio, Vercel, Anthropic/Claude API) bajo acuerdos de
                    confidencialidad estándar — no bajo privilegio legal.
                  </li>
                  <li>
                    Sujetas a procesos legales (subpoena, court order) sin las protecciones
                    especiales que aplicarían a comunicaciones abogado-cliente.
                  </li>
                  <li>
                    Procesadas por sistemas automatizados incluyendo inteligencia artificial para
                    fines operativos.
                  </li>
                </ul>
                <p className="mt-3">
                  Si el Usuario desea comunicaciones protegidas por privilegio legal, debe
                  establecer relación directa con un abogado licenciado. {COMPANY} LLC no puede
                  ofrecer esta protección.
                </p>
              </div>

              {/* ── ES Section 1 (expanded) ─────────────────────── */}
              <div id="es-1">
                <h3 className="font-semibold text-gray-900 mb-2">1. Quiénes somos</h3>
                <p className="mb-3">
                  {COMPANY} es una empresa de servicios administrativos para la formación de
                  empresas en Estados Unidos. No somos un despacho de abogados ni proveemos
                  asesoría legal. Nuestra dirección de contacto es{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-600 hover:underline">
                    {CONTACT_EMAIL}
                  </a>.
                </p>
                <p>
                  <strong>{COMPANY} LLC no es firma de abogados, no brinda asesoría legal, y no
                  establece relación abogado-cliente con sus clientes.</strong> Para más
                  información consulte nuestro{' '}
                  <Link href="/legal/disclaimer" className="text-teal-600 underline hover:text-teal-800">
                    Aviso Legal completo
                  </Link>.
                </p>
              </div>

              {/* ── ES Section 2 ────────────────────────────────── */}
              <div id="es-2">
                <h3 className="font-semibold text-gray-900 mb-2">2. Información que recopilamos</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Datos de registro:</strong> nombre completo, dirección de correo electrónico, contraseña (cifrada).</li>
                  <li><strong>Datos de contacto:</strong> número de teléfono / WhatsApp, país de residencia.</li>
                  <li><strong>Datos de la empresa:</strong> nombre de la empresa deseada, estado de registro, tipo de entidad, actividad comercial, número de socios.</li>
                  <li><strong>Datos de pago:</strong> procesados directamente por Stripe. No almacenamos números de tarjeta.</li>
                  <li><strong>Datos de uso:</strong> dirección IP, navegador, páginas visitadas, fechas de acceso al portal.</li>
                  <li><strong>Comunicaciones:</strong> mensajes que nos envías por WhatsApp o correo electrónico.</li>
                </ul>
              </div>

              {/* ── ES Section 3 ────────────────────────────────── */}
              <div id="es-3">
                <h3 className="font-semibold text-gray-900 mb-2">3. Cómo usamos tu información</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Procesar tu orden de formación empresarial y gestionar tu expediente.</li>
                  <li>Comunicarnos contigo sobre el estado de tu caso vía email y WhatsApp.</li>
                  <li>Enviarte documentos y actualizaciones a través de tu portal de cliente.</li>
                  <li>Cumplir con obligaciones legales y regulatorias.</li>
                  <li>Mejorar nuestros servicios y la experiencia de usuario.</li>
                  <li>Prevenir fraude y garantizar la seguridad de la plataforma.</li>
                  <li>Procesar comunicaciones mediante sistemas automatizados e inteligencia artificial para fines operativos internos.</li>
                </ul>
              </div>

              {/* ── ES Section 4 (Anthropic added) ──────────────── */}
              <div id="es-4">
                <h3 className="font-semibold text-gray-900 mb-2">4. Terceros con quienes compartimos datos</h3>
                <p className="mb-3">Trabajamos con los siguientes proveedores de confianza. Solo compartimos los datos mínimos necesarios:</p>
                <div className="space-y-3">
                  {[
                    { name: 'Stripe',    url: 'https://stripe.com/privacy',                    desc: 'Procesamiento de pagos. Recibe email, nombre y monto de la transacción.' },
                    { name: 'Supabase',  url: 'https://supabase.com/privacy',                  desc: 'Base de datos y autenticación. Almacena todos los datos de tu cuenta de forma cifrada.' },
                    { name: 'Resend',    url: 'https://resend.com/privacy',                    desc: 'Envío de correos electrónicos transaccionales (confirmaciones, documentos).' },
                    { name: 'Twilio',    url: 'https://www.twilio.com/legal/privacy',          desc: 'Envío de mensajes de WhatsApp con notificaciones de tu caso.' },
                    { name: 'Vercel',    url: 'https://vercel.com/legal/privacy-policy',       desc: 'Hosting de la aplicación. Puede procesar IPs y datos de solicitudes HTTP.' },
                    { name: 'Anthropic', url: 'https://www.anthropic.com/privacy',             desc: 'API de inteligencia artificial (Claude). Puede procesar fragmentos de comunicaciones para fines operativos internos bajo acuerdo de confidencialidad — no bajo privilegio legal.' },
                  ].map(t => (
                    <div key={t.name} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-900 w-24 shrink-0">{t.name}</div>
                      <div>
                        {t.desc}{' '}
                        <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline text-xs">
                          Ver política →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3">No vendemos ni alquilamos tu información personal a terceros.</p>
              </div>

              {/* ── ES Section 5 ────────────────────────────────── */}
              <div id="es-5">
                <h3 className="font-semibold text-gray-900 mb-2">5. Retención de datos</h3>
                <p>
                  Conservamos tu información mientras tu cuenta esté activa o según sea necesario para prestarte el servicio. Los registros financieros y de formación empresarial se conservan por un mínimo de 7 años conforme a requisitos legales. Puedes solicitar la eliminación de tu cuenta en cualquier momento.
                </p>
              </div>

              {/* ── ES Section 6 ────────────────────────────────── */}
              <div id="es-6">
                <h3 className="font-semibold text-gray-900 mb-2">6. Seguridad</h3>
                <p>
                  Utilizamos cifrado TLS en todas las comunicaciones. Las contraseñas se almacenan con hash seguro. El acceso a los datos está restringido a empleados con necesidad operativa. Sin embargo, ningún sistema es 100% seguro y no podemos garantizar la seguridad absoluta.
                </p>
              </div>

              {/* ── ES Section 7 ────────────────────────────────── */}
              <div id="es-7">
                <h3 className="font-semibold text-gray-900 mb-2">7. Tus derechos</h3>
                <p className="mb-2">Tienes derecho a:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Acceso:</strong> solicitar una copia de los datos que tenemos sobre ti.</li>
                  <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
                  <li><strong>Eliminación:</strong> solicitar que borremos tu información personal.</li>
                  <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
                  <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos con fines de marketing.</li>
                </ul>
                <p className="mt-2">
                  Para ejercer cualquier derecho, escríbenos a{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-600 hover:underline">{CONTACT_EMAIL}</a>.
                  Respondemos en un máximo de 30 días.
                </p>
              </div>

              {/* ── ES Section 8 ────────────────────────────────── */}
              <div id="es-8">
                <h3 className="font-semibold text-gray-900 mb-2">8. Cookies</h3>
                <p>
                  Usamos cookies de sesión estrictamente necesarias para mantener tu sesión activa en el portal. No usamos cookies de seguimiento ni publicidad de terceros.
                </p>
              </div>

              {/* ── ES Section 9 ────────────────────────────────── */}
              <div id="es-9">
                <h3 className="font-semibold text-gray-900 mb-2">9. Cambios a esta política</h3>
                <p>
                  Podemos actualizar esta política ocasionalmente. Te notificaremos por correo electrónico si los cambios son materiales. La fecha de vigencia al inicio del documento indica la versión actual.
                </p>
              </div>

              {/* ── ES Section 10 ───────────────────────────────── */}
              <div id="es-10">
                <h3 className="font-semibold text-gray-900 mb-2">10. Contacto</h3>
                <p>
                  Para preguntas sobre privacidad o para ejercer tus derechos, contáctanos en:{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-600 hover:underline font-medium">{CONTACT_EMAIL}</a>
                </p>
              </div>

            </div>
          </section>

          <hr className="border-gray-200" />

          {/* ══════════════════════════════════════════════════════════
              ENGLISH
          ══════════════════════════════════════════════════════════ */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              🇺🇸 English
            </h2>

            <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

              {/* ── EN Section 0 (NEW) ──────────────────────────── */}
              <div id="en-0">
                <h3 className="font-semibold text-gray-900 mb-3 text-base">
                  0. Important Notice on Communications and Legal Privilege
                </h3>
                <p className="mb-3">
                  Communications between the User and {COMPANY} LLC through any channel (email,
                  WhatsApp, client portal, web forms, phone calls, automated chats) are{' '}
                  <strong>NOT covered by attorney-client privilege</strong>.
                </p>
                <p className="mb-2">Such communications may, among other things, be:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Stored in company systems for operational purposes.
                  </li>
                  <li>
                    Accessible by authorized personnel and technology vendors (e.g. Supabase,
                    Stripe, Resend, Twilio, Vercel, Anthropic/Claude API) under standard
                    confidentiality agreements — not under legal privilege.
                  </li>
                  <li>
                    Subject to legal process (subpoena, court order) without the special
                    protections that would apply to attorney-client communications.
                  </li>
                  <li>
                    Processed by automated systems including artificial intelligence for
                    operational purposes.
                  </li>
                </ul>
                <p className="mt-3">
                  If the User wishes to have communications protected by legal privilege, they
                  must establish a direct relationship with a licensed attorney. {COMPANY} LLC
                  cannot provide this protection.
                </p>
              </div>

              {/* ── EN Section 1 (expanded) ─────────────────────── */}
              <div id="en-1">
                <h3 className="font-semibold text-gray-900 mb-2">1. Who We Are</h3>
                <p className="mb-3">
                  {COMPANY} is a business formation and administrative services company. We are
                  not a law firm and do not provide legal advice. Contact us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-600 hover:underline">{CONTACT_EMAIL}</a>.
                </p>
                <p>
                  <strong>{COMPANY} LLC is not a law firm, does not provide legal advice, and
                  does not establish an attorney-client relationship with its clients.</strong>{' '}
                  For more information, please review our{' '}
                  <Link href="/legal/disclaimer" className="text-teal-600 underline hover:text-teal-800">
                    full Legal Disclaimer
                  </Link>.
                </p>
              </div>

              {/* ── EN Section 2 ────────────────────────────────── */}
              <div id="en-2">
                <h3 className="font-semibold text-gray-900 mb-2">2. Information We Collect</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Account data:</strong> full name, email address, password (hashed).</li>
                  <li><strong>Contact data:</strong> phone / WhatsApp number, country of residence.</li>
                  <li><strong>Business data:</strong> desired company name, state of formation, entity type, business activity, number of members.</li>
                  <li><strong>Payment data:</strong> processed directly by Stripe. We do not store card numbers.</li>
                  <li><strong>Usage data:</strong> IP address, browser type, pages visited, portal access timestamps.</li>
                  <li><strong>Communications:</strong> messages you send us via WhatsApp or email.</li>
                </ul>
              </div>

              {/* ── EN Section 3 ────────────────────────────────── */}
              <div id="en-3">
                <h3 className="font-semibold text-gray-900 mb-2">3. How We Use Your Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Process your business formation order and manage your case file.</li>
                  <li>Communicate with you about your case status via email and WhatsApp.</li>
                  <li>Deliver documents and updates through your client portal.</li>
                  <li>Comply with legal and regulatory obligations.</li>
                  <li>Improve our services and user experience.</li>
                  <li>Prevent fraud and maintain platform security.</li>
                  <li>Process communications through automated systems and artificial intelligence for internal operational purposes.</li>
                </ul>
              </div>

              {/* ── EN Section 4 (Anthropic added) ──────────────── */}
              <div id="en-4">
                <h3 className="font-semibold text-gray-900 mb-2">4. Third Parties We Share Data With</h3>
                <p className="mb-3">We work with the following trusted vendors. We share only the minimum data necessary:</p>
                <div className="space-y-3">
                  {[
                    { name: 'Stripe',    url: 'https://stripe.com/privacy',              desc: 'Payment processing. Receives email, name, and transaction amount.' },
                    { name: 'Supabase',  url: 'https://supabase.com/privacy',            desc: 'Database and authentication. Stores all account data encrypted at rest.' },
                    { name: 'Resend',    url: 'https://resend.com/privacy',              desc: 'Transactional email delivery (confirmations, documents).' },
                    { name: 'Twilio',    url: 'https://www.twilio.com/legal/privacy',    desc: 'WhatsApp messaging for case notifications.' },
                    { name: 'Vercel',    url: 'https://vercel.com/legal/privacy-policy', desc: 'Application hosting. May process IPs and HTTP request data.' },
                    { name: 'Anthropic', url: 'https://www.anthropic.com/privacy',       desc: 'Artificial intelligence API (Claude). May process fragments of communications for internal operational purposes under a confidentiality agreement — not under legal privilege.' },
                  ].map(t => (
                    <div key={t.name} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-900 w-24 shrink-0">{t.name}</div>
                      <div>
                        {t.desc}{' '}
                        <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline text-xs">
                          View policy →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3">We do not sell or rent your personal information to third parties.</p>
              </div>

              {/* ── EN Section 5 ────────────────────────────────── */}
              <div id="en-5">
                <h3 className="font-semibold text-gray-900 mb-2">5. Data Retention</h3>
                <p>
                  We retain your information for as long as your account is active or as needed to provide the service. Financial and business formation records are kept for a minimum of 7 years per legal requirements. You may request account deletion at any time.
                </p>
              </div>

              {/* ── EN Section 6 ────────────────────────────────── */}
              <div id="en-6">
                <h3 className="font-semibold text-gray-900 mb-2">6. Security</h3>
                <p>
                  All communications are encrypted via TLS. Passwords are securely hashed. Data access is restricted to staff with operational need. No system is 100% secure and we cannot guarantee absolute security.
                </p>
              </div>

              {/* ── EN Section 7 ────────────────────────────────── */}
              <div id="en-7">
                <h3 className="font-semibold text-gray-900 mb-2">7. Your Rights</h3>
                <p className="mb-2">You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Access:</strong> request a copy of the data we hold about you.</li>
                  <li><strong>Rectification:</strong> correct inaccurate or incomplete data.</li>
                  <li><strong>Erasure:</strong> request deletion of your personal information.</li>
                  <li><strong>Portability:</strong> receive your data in a structured format.</li>
                  <li><strong>Objection:</strong> opt out of marketing communications.</li>
                </ul>
                <p className="mt-2">
                  To exercise any right, email us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-600 hover:underline">{CONTACT_EMAIL}</a>.
                  We respond within 30 days.
                </p>
              </div>

              {/* ── EN Section 8 ────────────────────────────────── */}
              <div id="en-8">
                <h3 className="font-semibold text-gray-900 mb-2">8. Cookies</h3>
                <p>
                  We use strictly necessary session cookies to keep you logged in to the portal. We do not use tracking cookies or third-party advertising cookies.
                </p>
              </div>

              {/* ── EN Section 9 ────────────────────────────────── */}
              <div id="en-9">
                <h3 className="font-semibold text-gray-900 mb-2">9. Changes to This Policy</h3>
                <p>
                  We may update this policy from time to time. We will notify you by email for material changes. The effective date at the top of this document reflects the current version.
                </p>
              </div>

              {/* ── EN Section 10 ───────────────────────────────── */}
              <div id="en-10">
                <h3 className="font-semibold text-gray-900 mb-2">10. Contact</h3>
                <p>
                  For privacy questions or to exercise your rights, contact us at:{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-teal-600 hover:underline font-medium">{CONTACT_EMAIL}</a>
                </p>
              </div>

            </div>
          </section>

          {/* Page footer */}
          <div className="text-center text-xs text-gray-400 pt-4 pb-8 border-t border-gray-100 space-y-2">
            <p>{COMPANY} · Effective / Vigente: {EFFECTIVE_DATE_EN} · {EFFECTIVE_DATE}</p>
            <p>
              <Link
                href="/legal/disclaimer"
                className="text-teal-600 underline hover:text-teal-800 transition-colors"
              >
                Ver Aviso Legal completo / View full Legal Disclaimer →
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
