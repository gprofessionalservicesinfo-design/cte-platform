export const metadata = {
  title: 'Política de Reembolso | CreaTuEmpresaUSA',
  description: 'Condiciones de reembolso y cancelación de servicios de CreaTuEmpresaUSA.',
}

export default function ReembolsoPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-semibold mb-2">Política de Reembolso</h1>
      <p className="text-sm text-gray-500 mb-10">Vigente desde: abril 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">1. Reembolso completo</h2>
        <p className="leading-relaxed">Tienes derecho a un reembolso completo si cancelas tu orden <strong>antes de que iniciemos el procesamiento de tu trámite</strong>. Para solicitar la cancelación, escríbenos a <a href="mailto:soporte@creatuempresausa.com" className="text-blue-600 underline">soporte@creatuempresausa.com</a> indicando tu número de orden.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">2. Sin reembolso una vez iniciado el trámite</h2>
        <p className="leading-relaxed">Una vez que iniciamos el procesamiento de tu solicitud, <strong>no es posible emitir un reembolso</strong>. Esto se debe a que todos los trámites se ejecutan dentro de las primeras 24 horas posteriores al pago e involucran costos operativos no recuperables, incluyendo tarifas estatales de registro pagadas directamente a las autoridades gubernamentales correspondientes.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">3. ¿Cuándo se inicia el trámite?</h2>
        <p className="leading-relaxed">El trámite se considera iniciado cuando nuestro equipo comienza a procesar tu expediente, lo cual ocurre dentro de las 24 horas siguientes a la confirmación del pago. Recibirás una notificación por email y WhatsApp cuando esto suceda.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">4. Errores de nuestra parte</h2>
        <p className="leading-relaxed">Si el error en el trámite es atribuible exclusivamente a CreaTuEmpresaUSA (información incorrecta ingresada por nosotros, documentos equivocados), nos comprometemos a corregirlo sin costo adicional. Si el error proviene de información incorrecta proporcionada por el cliente, se aplicarán cargos adicionales según corresponda.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">5. Tarifas estatales</h2>
        <p className="leading-relaxed">Las tarifas pagadas directamente a agencias gubernamentales (state filing fees) no son reembolsables bajo ninguna circunstancia, ya que son cobros de terceros fuera de nuestro control.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-3">6. Cómo solicitar un reembolso</h2>
        <p className="leading-relaxed">Escríbenos a <a href="mailto:soporte@creatuempresausa.com" className="text-blue-600 underline">soporte@creatuempresausa.com</a> con el asunto "Solicitud de reembolso" e incluye tu nombre completo y número de orden. Respondemos en un máximo de 2 días hábiles.</p>
      </section>
    </main>
  )
}
