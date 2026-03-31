import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Privacy Policy — CreaTuEmpresaUSA',
  description: 'Política de privacidad de CreaTuEmpresaUSA. Cómo recopilamos, usamos y protegemos tu información personal.',
}

const EFFECTIVE_DATE = '1 de abril de 2026'
const EFFECTIVE_DATE_EN = 'April 1, 2026'
const CONTACT_EMAIL = 'soporte@creatuempresausa.com'
const COMPANY = 'CreaTuEmpresaUSA'

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div style={{ background: '#0A2540' }} className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">Legal</p>
          <h1 className="text-3xl font-bold text-white mb-2">
            Política de Privacidad / Privacy Policy
          </h1>
          <p className="text-blue-200 text-sm">
            Vigente desde / Effective: {EFFECTIVE_DATE} · {COMPANY}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-16">

        {/* ── ESPAÑOL ────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            🇪🇸 Español
          </h2>

          <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Quiénes somos</h3>
              <p>
                {COMPANY} es una empresa de servicios administrativos para la formación de empresas en Estados Unidos. No somos un despacho de abogados ni proveemos asesoría legal. Nuestra dirección de contacto es{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
              </p>
            </div>

            <div>
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

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Cómo usamos tu información</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Procesar tu orden de formación empresarial y gestionar tu expediente.</li>
                <li>Comunicarnos contigo sobre el estado de tu caso vía email y WhatsApp.</li>
                <li>Enviarte documentos y actualizaciones a través de tu portal de cliente.</li>
                <li>Cumplir con obligaciones legales y regulatorias.</li>
                <li>Mejorar nuestros servicios y la experiencia de usuario.</li>
                <li>Prevenir fraude y garantizar la seguridad de la plataforma.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Terceros con quienes compartimos datos</h3>
              <p className="mb-3">Trabajamos con los siguientes proveedores de confianza. Solo compartimos los datos mínimos necesarios:</p>
              <div className="space-y-3">
                {[
                  { name: 'Stripe', url: 'https://stripe.com/privacy', desc: 'Procesamiento de pagos. Recibe email, nombre y monto de la transacción.' },
                  { name: 'Supabase', url: 'https://supabase.com/privacy', desc: 'Base de datos y autenticación. Almacena todos los datos de tu cuenta de forma cifrada.' },
                  { name: 'Resend', url: 'https://resend.com/privacy', desc: 'Envío de correos electrónicos transaccionales (confirmaciones, documentos).' },
                  { name: 'Twilio', url: 'https://www.twilio.com/legal/privacy', desc: 'Envío de mensajes de WhatsApp con notificaciones de tu caso.' },
                  { name: 'Vercel', url: 'https://vercel.com/legal/privacy-policy', desc: 'Hosting de la aplicación. Puede procesar IPs y datos de solicitudes HTTP.' },
                ].map(t => (
                  <div key={t.name} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-900 w-20 shrink-0">{t.name}</div>
                    <div>
                      {t.desc}{' '}
                      <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                        Ver política →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3">No vendemos ni alquilamos tu información personal a terceros.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">5. Retención de datos</h3>
              <p>
                Conservamos tu información mientras tu cuenta esté activa o según sea necesario para prestarte el servicio. Los registros financieros y de formación empresarial se conservan por un mínimo de 7 años conforme a requisitos legales. Puedes solicitar la eliminación de tu cuenta en cualquier momento.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">6. Seguridad</h3>
              <p>
                Utilizamos cifrado TLS en todas las comunicaciones. Las contraseñas se almacenan con hash seguro. El acceso a los datos está restringido a empleados con necesidad operativa. Sin embargo, ningún sistema es 100% seguro y no podemos garantizar la seguridad absoluta.
              </p>
            </div>

            <div>
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
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
                Respondemos en un máximo de 30 días.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">8. Cookies</h3>
              <p>
                Usamos cookies de sesión estrictamente necesarias para mantener tu sesión activa en el portal. No usamos cookies de seguimiento ni publicidad de terceros.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">9. Cambios a esta política</h3>
              <p>
                Podemos actualizar esta política ocasionalmente. Te notificaremos por correo electrónico si los cambios son materiales. La fecha de vigencia al inicio del documento indica la versión actual.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">10. Contacto</h3>
              <p>
                Para preguntas sobre privacidad o para ejercer tus derechos, contáctanos en:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline font-medium">{CONTACT_EMAIL}</a>
              </p>
            </div>

          </div>
        </section>

        <hr className="border-gray-200" />

        {/* ── ENGLISH ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
            🇺🇸 English
          </h2>

          <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Who We Are</h3>
              <p>
                {COMPANY} is a business formation and administrative services company. We are not a law firm and do not provide legal advice. Contact us at{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
              </p>
            </div>

            <div>
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

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. How We Use Your Information</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Process your business formation order and manage your case file.</li>
                <li>Communicate with you about your case status via email and WhatsApp.</li>
                <li>Deliver documents and updates through your client portal.</li>
                <li>Comply with legal and regulatory obligations.</li>
                <li>Improve our services and user experience.</li>
                <li>Prevent fraud and maintain platform security.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Third Parties We Share Data With</h3>
              <p className="mb-3">We work with the following trusted vendors. We share only the minimum data necessary:</p>
              <div className="space-y-3">
                {[
                  { name: 'Stripe', url: 'https://stripe.com/privacy', desc: 'Payment processing. Receives email, name, and transaction amount.' },
                  { name: 'Supabase', url: 'https://supabase.com/privacy', desc: 'Database and authentication. Stores all account data encrypted at rest.' },
                  { name: 'Resend', url: 'https://resend.com/privacy', desc: 'Transactional email delivery (confirmations, documents).' },
                  { name: 'Twilio', url: 'https://www.twilio.com/legal/privacy', desc: 'WhatsApp messaging for case notifications.' },
                  { name: 'Vercel', url: 'https://vercel.com/legal/privacy-policy', desc: 'Application hosting. May process IPs and HTTP request data.' },
                ].map(t => (
                  <div key={t.name} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-900 w-20 shrink-0">{t.name}</div>
                    <div>
                      {t.desc}{' '}
                      <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                        View policy →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3">We do not sell or rent your personal information to third parties.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">5. Data Retention</h3>
              <p>
                We retain your information for as long as your account is active or as needed to provide the service. Financial and business formation records are kept for a minimum of 7 years per legal requirements. You may request account deletion at any time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">6. Security</h3>
              <p>
                All communications are encrypted via TLS. Passwords are securely hashed. Data access is restricted to staff with operational need. No system is 100% secure and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
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
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">{CONTACT_EMAIL}</a>.
                We respond within 30 days.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">8. Cookies</h3>
              <p>
                We use strictly necessary session cookies to keep you logged in to the portal. We do not use tracking cookies or third-party advertising cookies.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">9. Changes to This Policy</h3>
              <p>
                We may update this policy from time to time. We will notify you by email for material changes. The effective date at the top of this document reflects the current version.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">10. Contact</h3>
              <p>
                For privacy questions or to exercise your rights, contact us at:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline font-medium">{CONTACT_EMAIL}</a>
              </p>
            </div>

          </div>
        </section>

        {/* Footer note */}
        <div className="text-center text-xs text-gray-400 pt-4 pb-8 border-t border-gray-100">
          {COMPANY} · Effective / Vigente: {EFFECTIVE_DATE_EN} · {EFFECTIVE_DATE}
        </div>

      </div>
    </div>
  )
}
