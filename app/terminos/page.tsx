export const metadata = {
  title: 'Términos de Servicio | CreaTuEmpresaUSA',
  description: 'Términos y condiciones del servicio de formación empresarial de CreaTuEmpresaUSA.',
}

export default function TerminosPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-semibold mb-2">Términos de Servicio</h1>
      <p className="text-sm text-gray-500 mb-10">Vigente desde: abril 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">1. Naturaleza del servicio</h2>
        <p className="leading-relaxed">CreaTuEmpresaUSA es una empresa de servicios administrativos especializada en la formación de empresas en Estados Unidos. No somos un despacho de abogados ni proveemos asesoría legal, fiscal o contable. La información que proporcionamos es de carácter informativo y operativo. Para asesoría legal específica, recomendamos consultar a un abogado licenciado.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">2. Servicios ofrecidos</h2>
        <p className="leading-relaxed">Nuestros servicios incluyen: formación de LLC y Corporation, obtención de EIN, asistencia con ITIN, agente registrado, y gestión administrativa de cumplimiento. El alcance exacto de cada servicio se detalla en el plan contratado al momento del pago.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">3. Responsabilidades del cliente</h2>
        <p className="leading-relaxed">El cliente es responsable de proporcionar información veraz, completa y actualizada. CreaTuEmpresaUSA no se responsabiliza por retrasos, rechazos o errores derivados de información incorrecta proporcionada por el cliente. El cliente acepta que los tiempos de procesamiento dependen de las autoridades estatales y federales correspondientes.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">4. Plazos de procesamiento</h2>
        <p className="leading-relaxed">Los plazos indicados son estimados basados en tiempos habituales de las agencias gubernamentales. CreaTuEmpresaUSA no garantiza tiempos específicos de aprobación, ya que estos dependen exclusivamente de las autoridades competentes. Informaremos al cliente sobre el estado de su trámite a través del portal y por WhatsApp.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">5. Pagos</h2>
        <p className="leading-relaxed">Los pagos se procesan de forma segura a través de Stripe. Al completar el pago, el cliente autoriza el cargo correspondiente al plan seleccionado. Los precios incluyen honorarios de servicio y, donde aplica, tarifas estatales de registro. Consulta nuestra Política de Reembolso para condiciones de cancelación.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">6. Limitación de responsabilidad</h2>
        <p className="leading-relaxed">CreaTuEmpresaUSA no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de nuestros servicios. Nuestra responsabilidad máxima se limita al monto pagado por el servicio contratado. No garantizamos la aprobación de trámites bancarios, ITIN, ni ningún resultado específico que dependa de terceros.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">7. Propiedad intelectual</h2>
        <p className="leading-relaxed">Todo el contenido de la plataforma, incluyendo textos, diseños, logotipos y software, es propiedad de CreaTuEmpresaUSA o sus licenciantes. Está prohibida su reproducción o uso sin autorización expresa por escrito.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">8. Modificaciones</h2>
        <p className="leading-relaxed">Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios materiales serán notificados por correo electrónico con al menos 7 días de anticipación. El uso continuado del servicio tras la notificación implica aceptación de los nuevos términos.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">9. Ley aplicable</h2>
        <p className="leading-relaxed">Estos términos se rigen por las leyes del Estado de Colorado, Estados Unidos. Cualquier disputa será resuelta en los tribunales competentes de dicha jurisdicción.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">10. Contacto</h2>
        <p className="leading-relaxed">Para cualquier consulta sobre estos términos: <a href="mailto:soporte@creatuempresausa.com" className="text-blue-600 underline">soporte@creatuempresausa.com</a></p>
      </section>
    </main>
  )
}
