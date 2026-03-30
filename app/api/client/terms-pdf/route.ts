import { NextResponse } from 'next/server'

export async function GET() {
  const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Términos y Condiciones — CreaTuEmpresaUSA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; font-size: 11pt; color: #1a1a1a; padding: 48px; max-width: 780px; margin: 0 auto; }
    h1 { font-size: 16pt; text-align: center; margin-bottom: 4px; }
    .subtitle { text-align: center; font-size: 9pt; color: #666; margin-bottom: 32px; }
    h2 { font-size: 12pt; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 28px 0 10px; text-transform: uppercase; letter-spacing: .5px; }
    .lang-label { font-size: 8pt; font-weight: bold; color: #555; text-transform: uppercase; margin: 12px 0 4px; letter-spacing: .5px; }
    p { line-height: 1.6; margin-bottom: 10px; }
    .divider { border: none; border-top: 1px dashed #ddd; margin: 16px 0; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #ccc; font-size: 8pt; color: #888; text-align: center; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <h1>Términos y Condiciones / Terms &amp; Conditions</h1>
  <p class="subtitle">CreaTuEmpresaUSA · Fecha / Date: ${date}</p>

  <h2>1. Service Agreement / Acuerdo de Servicios</h2>

  <p class="lang-label">[English]</p>
  <p>This Service Agreement is entered into between CreaTuEmpresaUSA ("Company") and the client ("Client"). Company provides business formation, registered agent coordination, EIN coordination, document preparation and related administrative services. CreaTuEmpresaUSA is NOT a law firm and does not provide legal advice. Services are administrative assistance only. Fees are non-refundable once filing has begun. Client certifies all information provided is accurate. Company liability is limited to amount paid for services. Governed by laws of the State of Delaware.</p>

  <hr class="divider" />

  <p class="lang-label">[Español]</p>
  <p>Este Acuerdo se celebra entre CreaTuEmpresaUSA ("Empresa") y el Cliente. La Empresa provee servicios de formación de empresas, agente registrado, coordinación de EIN y preparación de documentos. CreaTuEmpresaUSA NO es un despacho de abogados y no provee asesoría legal. Los servicios son exclusivamente administrativos. Los honorarios no son reembolsables una vez iniciado el trámite. El Cliente certifica que toda la información es precisa. La responsabilidad de la Empresa se limita al monto pagado. Rige la ley del Estado de Delaware.</p>

  <h2>2. Authorization Letter / Carta de Autorización</h2>

  <p class="lang-label">[English]</p>
  <p>I authorize CreaTuEmpresaUSA to: prepare and file Articles of Organization on my behalf, act as Organizer where required, coordinate EIN application with the IRS, prepare Operating Agreement and formation documents, and correspond with state agencies. CreaTuEmpresaUSA acts as my formation agent, not my legal representative.</p>

  <hr class="divider" />

  <p class="lang-label">[Español]</p>
  <p>Autorizo a CreaTuEmpresaUSA a: preparar y presentar los Articles of Organization en mi nombre, actuar como Organizador donde sea requerido, coordinar la solicitud de EIN ante el IRS, preparar el Operating Agreement y demás documentos, y comunicarse con agencias estatales. CreaTuEmpresaUSA actúa como mi agente de formación, no como mi representante legal.</p>

  <h2>3. Non-Attorney Disclaimer / Aviso de No-Abogado</h2>

  <p class="lang-label">[English]</p>
  <p>CreaTuEmpresaUSA is NOT a law firm. We are a business formation and administrative services company. Our services do not constitute legal advice or legal representation. We help prepare and file formation documents. We do not advise on legal strategy, tax implications, or immigration matters. Consult a licensed attorney for legal advice.</p>

  <hr class="divider" />

  <p class="lang-label">[Español]</p>
  <p>CreaTuEmpresaUSA NO es un despacho de abogados. Somos una empresa de servicios administrativos de formación empresarial. Nuestros servicios no constituyen asesoría legal ni representación legal. Ayudamos a preparar y presentar documentos de formación. No asesoramos sobre estrategia legal, implicaciones fiscales ni asuntos migratorios. Consulte a un abogado licenciado.</p>

  <div class="footer">
    CreaTuEmpresaUSA · creatuempresausa.com · Este documento fue generado el ${date}
  </div>

  <script>window.onload = () => window.print()</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
