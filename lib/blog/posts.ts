export type Section =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'cta'; text: string; href: string; label: string }
  | { type: 'faq'; items: { q: string; a: string }[] }

export interface Post {
  slug: string
  title: string
  headline: string
  description: string
  date: string          // ISO 8601
  modified: string
  readTime: number      // minutes
  keyword: string       // primary keyword
  sections: Section[]
}

export const posts: Post[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // 1. abrir LLC en USA desde México (3,100/mes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'abrir-llc-en-usa-desde-mexico',
    title: 'Cómo Abrir una LLC en USA desde México (Guía 2026)',
    headline: 'Cómo abrir una LLC en USA desde México: guía paso a paso',
    description:
      'Aprende cómo abrir una LLC en USA desde México sin viajar, sin visa y en español. Requisitos, costos, tiempos y pasos detallados para 2026.',
    date: '2026-04-01',
    modified: '2026-04-10',
    readTime: 8,
    keyword: 'abrir LLC en USA desde México',
    sections: [
      {
        type: 'p',
        text: 'Miles de emprendedores mexicanos forman una LLC en Estados Unidos cada año — y no, no necesitas visa, viaje ni SSN para hacerlo. En esta guía te explicamos el proceso completo: qué es una LLC, por qué conviene formarla desde México, cuánto cuesta y cómo hacerlo paso a paso en 2026.',
      },
      { type: 'h2', text: '¿Qué es una LLC y por qué es ideal para mexicanos?' },
      {
        type: 'p',
        text: 'Una LLC (Limited Liability Company) es la estructura empresarial más popular en Estados Unidos. Combina la protección legal de una corporación con la simplicidad fiscal de una sociedad. Para emprendedores mexicanos o latinoamericanos que venden a clientes en dólares, reciben pagos internacionales o quieren acceder a herramientas financieras de EE.UU. (Stripe, PayPal, Mercury), una LLC es la puerta de entrada.',
      },
      {
        type: 'ul',
        items: [
          'Protección de responsabilidad limitada: tus bienes personales quedan separados de la empresa',
          'Tributación pass-through: en la mayoría de los casos, la LLC no paga impuestos corporativos propios',
          'Acepta socios extranjeros sin restricciones — la ley no exige residencia ni ciudadanía',
          'Permite abrir cuentas bancarias en USD, cobrar con Stripe y acceder a crédito empresarial',
          'Imagen profesional ante clientes, plataformas y proveedores internacionales',
        ],
      },
      { type: 'h2', text: 'Requisitos para abrir una LLC en USA desde México' },
      {
        type: 'p',
        text: 'La buena noticia: los requisitos son mínimos. No necesitas ser residente, no necesitas SSN (Número de Seguro Social) y no necesitas viajar a Estados Unidos.',
      },
      {
        type: 'ul',
        items: [
          'Identificación oficial vigente (pasaporte mexicano, INE o IFE)',
          'Nombre disponible para tu LLC en el estado elegido',
          'Dirección de correo electrónico',
          'Agente registrado en el estado (nosotros lo incluimos en todos los planes)',
          'Pago de la tarifa estatal (varía por estado: Wyoming $62, Florida $125, Texas $300)',
        ],
      },
      { type: 'h2', text: 'Paso a paso: cómo abrir tu LLC en USA desde México' },
      {
        type: 'ol',
        items: [
          'Elige el estado de formación — Wyoming, Florida o Texas son los más populares para no residentes.',
          'Verifica la disponibilidad del nombre de tu LLC en el registro estatal.',
          'Designa un agente registrado (persona o empresa con dirección física en el estado que recibirá documentos legales).',
          'Presenta los Articles of Organization ante la Secretaría de Estado del estado elegido.',
          'Obtén el EIN (Employer Identification Number) del IRS — es el equivalente del RFC en México.',
          'Abre una cuenta bancaria en USD (Mercury, Relay o Brex son las más usadas por no residentes).',
          'Configura tus herramientas de cobro: Stripe, PayPal Business, Wise Business.',
        ],
      },
      { type: 'h2', text: '¿Cuánto cuesta abrir una LLC en USA desde México?' },
      {
        type: 'table',
        headers: ['Concepto', 'Costo estimado'],
        rows: [
          ['State filing fee (Wyoming)', '$62 USD'],
          ['State filing fee (Florida)', '$125 USD'],
          ['State filing fee (Texas)', '$300 USD'],
          ['Agente registrado (1er año)', 'Incluido en nuestros planes'],
          ['Obtención de EIN', 'Incluido en Plan Pro y Premium'],
          ['Servicio de formación completo', 'Desde $499 USD (Plan Starter)'],
        ],
      },
      { type: 'h2', text: '¿Cuánto tiempo tarda?' },
      {
        type: 'p',
        text: 'La formación de la LLC tarda aproximadamente 2 a 5 días hábiles una vez presentados los documentos. El EIN del IRS puede tardar entre 4 y 8 semanas para extranjeros no residentes (el IRS lo procesa por fax o correo, no en línea). Durante ese tiempo, tu LLC ya existe legalmente y puedes usarla.',
      },
      { type: 'h2', text: '¿Qué estado elegir para tu LLC?' },
      {
        type: 'p',
        text: 'Esta es la pregunta que más nos hacen. La respuesta depende de tu tipo de negocio:',
      },
      {
        type: 'ul',
        items: [
          'Wyoming: state fee $62, annual report $60/año, privacidad total de socios. Ideal para negocios digitales y no residentes que no operan físicamente en EE.UU.',
          'Florida: state fee $125, $138.75/año en renovación. Hub latino, ideal para negocios con clientes en LATAM o que visitan Miami frecuentemente.',
          'Texas: state fee $300, sin annual report fee. Sin impuesto estatal sobre ingresos. Ideal para escala y negocios con México.',
        ],
      },
      {
        type: 'cta',
        text: 'Forma tu LLC en USA desde México hoy',
        href: '/index_final.html?page=wizard',
        label: 'Iniciar el proceso →',
      },
      {
        type: 'faq',
        items: [
          {
            q: '¿Necesito viajar a Estados Unidos para abrir una LLC?',
            a: 'No. Todo el proceso se realiza 100% en línea. Nunca necesitas pisar suelo estadounidense para formar tu LLC.',
          },
          {
            q: '¿Necesito SSN (Número de Seguro Social) para abrir una LLC?',
            a: 'No necesitas SSN para formar la LLC. Tampoco para obtener el EIN si eres extranjero no residente — el IRS tiene un proceso específico para esto usando el formulario SS-4.',
          },
          {
            q: '¿Tengo que pagar impuestos en México y en USA?',
            a: 'Si eres residente fiscal en México, declaras tus ingresos en México. En USA, una LLC de un solo miembro no residente generalmente no paga impuestos federales si no tiene nexo (actividad física) en EE.UU. Te recomendamos consultar con un CPA especializado.',
          },
          {
            q: '¿Puedo tener socios mexicanos en mi LLC?',
            a: 'Sí. Una LLC puede tener múltiples miembros (socios) de cualquier país. No hay restricciones de residencia para los miembros de una LLC.',
          },
          {
            q: '¿Cuánto tarda el proceso completo?',
            a: 'La LLC queda formada en aproximadamente 2 a 5 días hábiles. El EIN tarda entre 4 y 8 semanas adicionales para extranjeros no residentes.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. mejor estado para abrir LLC extranjero (5,100/mes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'mejor-estado-para-abrir-llc-extranjero',
    title: 'Mejor Estado para Abrir LLC Siendo Extranjero: Comparativa 2026',
    headline: 'Mejor estado para abrir una LLC siendo extranjero: Wyoming, Florida, Texas o Delaware',
    description:
      'Compara Wyoming, Florida, Texas y Delaware para abrir tu LLC como extranjero no residente. Costos, impuestos, privacidad y requisitos anuales en 2026.',
    date: '2026-04-02',
    modified: '2026-04-10',
    readTime: 9,
    keyword: 'mejor estado para abrir LLC extranjero',
    sections: [
      {
        type: 'p',
        text: 'Una de las primeras decisiones al formar una LLC en Estados Unidos siendo extranjero es elegir el estado. Y no es una decisión menor: el estado determina los costos anuales, los requisitos de privacidad, las tarifas de renovación y hasta tu estrategia fiscal. En esta guía comparamos los 4 estados más populares entre emprendedores latinoamericanos.',
      },
      { type: 'h2', text: 'Los 4 estados más populares para extranjeros' },
      {
        type: 'table',
        headers: ['Estado', 'State fee', 'Costo anual', 'Privacidad', 'Impuesto estatal'],
        rows: [
          ['Wyoming', '$62', '$60/año', '✅ Total', 'Ninguno'],
          ['Florida', '$125', '$138.75/año', '⚠️ Media', 'Ninguno sobre LLC'],
          ['Texas', '$300', '$0 (sin annual report)', '⚠️ Media', 'Ninguno sobre personas'],
          ['Delaware', '$140', '$300/año (franchise tax)', '✅ Alta', 'Ninguno fuera de DE'],
        ],
      },
      { type: 'h2', text: 'Wyoming: el favorito de los negocios digitales' },
      {
        type: 'p',
        text: 'Wyoming es el estado preferido para emprendedores extranjeros que operan negocios digitales sin presencia física en EE.UU. Fue el primer estado en reconocer las LLCs (1977) y mantiene las leyes más favorables del país.',
      },
      {
        type: 'ul',
        items: [
          'State filing fee: solo $62 — la más baja entre los estados populares',
          'Annual report: $60/año (mínimo)',
          'Privacidad total: no divulga los nombres de los miembros en registros públicos',
          'Sin impuesto sobre ingresos estatales',
          'Sin requisitos de reuniones anuales ni registros de actas',
          'Ideal para: e-commerce, SaaS, agencias digitales, consultoras, Amazon FBA',
        ],
      },
      { type: 'h2', text: 'Florida: el hub latinoamericano' },
      {
        type: 'p',
        text: 'Florida tiene la mayor concentración de empresas latinas en EE.UU. Miami es un hub financiero y comercial para LATAM. Si tienes clientes, socios o proveedores en Florida, formar tu LLC aquí simplifica muchas operaciones.',
      },
      {
        type: 'ul',
        items: [
          'State filing fee: $125',
          'Annual report: $138.75/año',
          'Sin impuesto estatal sobre ingresos personales',
          'Conexión directa con ecosistema latino (bancos, contadores, abogados hispanohablantes)',
          'Ideal para: importación/exportación, retail, servicios profesionales, negocios con presencia en LATAM',
        ],
      },
      { type: 'h2', text: 'Texas: para escala sin impuesto estatal' },
      {
        type: 'p',
        text: 'Texas es el segundo estado más grande de EE.UU. en actividad económica. Sin impuesto sobre ingresos estatales y sin annual report anual, es atractivo para empresas que esperan crecer rápido.',
      },
      {
        type: 'ul',
        items: [
          'State filing fee: $300 (más alta, pero única)',
          'Annual report (Public Information Report): $0 — sin costo',
          'Sin impuesto estatal sobre ingresos',
          'Aplica un franchise tax sobre ingresos brutos superiores a $1.23M (irrelevante para la mayoría de startups)',
          'Ideal para: negocios con operaciones en México, manufactura, logística, tecnología',
        ],
      },
      { type: 'h2', text: 'Delaware: para startups que buscan inversión' },
      {
        type: 'p',
        text: 'Delaware es la elección estándar para startups que buscan levantar capital de inversores de venture capital o ángeles. La mayoría de los VCs exigen que la empresa esté incorporada en Delaware. Para negocios bootstrapped sin planes de levantar capital, Delaware es generalmente innecesario.',
      },
      {
        type: 'ul',
        items: [
          'State filing fee: $140',
          'Franchise tax anual: mínimo $300/año (puede ser más alto según el método de cálculo)',
          'Leyes corporativas más desarrolladas y predecibles de EE.UU.',
          'Corte de Cancillería (Court of Chancery) especializada en disputas corporativas',
          'Ideal para: startups tecnológicas, empresas que buscan inversión VC, emisión de acciones preferentes',
        ],
      },
      { type: 'h2', text: '¿Cuál es el mejor estado para ti?' },
      {
        type: 'p',
        text: 'La respuesta depende de tu caso específico. Usa esta guía rápida:',
      },
      {
        type: 'ul',
        items: [
          'Negocio digital, e-commerce, sin presencia en EE.UU. → Wyoming',
          'Clientes o socios en Florida o LATAM → Florida',
          'Negocios con México, logística, manufactura → Texas',
          'Startup buscando inversión VC → Delaware',
          'No sabes cuál elegir → nuestro asistente te guía en 3 minutos',
        ],
      },
      {
        type: 'cta',
        text: '¿No sabes qué estado elegir?',
        href: '/index_final.html?page=wizard',
        label: 'Usar el asistente →',
      },
      {
        type: 'faq',
        items: [
          {
            q: '¿Importa el estado si no voy a operar físicamente en EE.UU.?',
            a: 'Sí. Aunque no operes físicamente, el estado determina los costos anuales de mantenimiento, los requisitos de privacidad y las leyes que rigen tu LLC. Wyoming es el mejor para la mayoría de los casos de operación remota.',
          },
          {
            q: '¿Puedo cambiar de estado después de formar mi LLC?',
            a: 'Sí, mediante un proceso llamado "domestication" o "conversion". Algunos estados lo permiten directamente; en otros hay que disolver y crear una nueva LLC. Es posible pero genera costos adicionales.',
          },
          {
            q: '¿Necesito una dirección física en el estado donde formo mi LLC?',
            a: 'No necesitas vivir ni tener oficina en ese estado. Solo necesitas un agente registrado con dirección física en el estado — un servicio que incluimos en todos nuestros planes.',
          },
          {
            q: '¿Es mejor Delaware o Wyoming para un no residente?',
            a: 'Para la mayoría de los negocios de no residentes sin planes de levantar capital VC, Wyoming es mejor: menores costos anuales, mayor privacidad y leyes igualmente protectoras.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. sacar EIN sin SSN (2,700/mes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'sacar-ein-sin-ssn',
    title: 'Cómo Sacar el EIN sin SSN Siendo Extranjero (Guía 2026)',
    headline: 'Cómo obtener el EIN sin SSN: guía para extranjeros no residentes',
    description:
      'Guía completa para obtener el EIN del IRS sin SSN ni ITIN siendo extranjero no residente. Proceso paso a paso con formulario SS-4, tiempos y costos en 2026.',
    date: '2026-04-03',
    modified: '2026-04-10',
    readTime: 7,
    keyword: 'sacar EIN sin SSN',
    sections: [
      {
        type: 'p',
        text: 'El EIN (Employer Identification Number) es el número fiscal federal de tu LLC en Estados Unidos — el equivalente del RFC en México o el RUT en Chile. Sin él, no puedes abrir una cuenta bancaria empresarial, pagar impuestos federales ni contratar empleados. La buena noticia: como extranjero no residente, puedes obtenerlo sin SSN (Social Security Number) ni ITIN.',
      },
      { type: 'h2', text: '¿Qué es el EIN y para qué sirve?' },
      {
        type: 'ul',
        items: [
          'Identificar tu LLC ante el IRS (Internal Revenue Service)',
          'Abrir cuentas bancarias empresariales en EE.UU. (Mercury, Relay, Brex)',
          'Presentar declaraciones fiscales federales (Form 1065, 5472, etc.)',
          'Contratar empleados o contratistas en EE.UU.',
          'Aplicar a licencias y permisos federales',
          'Recibir pagos de clientes que requieren un W-9',
        ],
      },
      { type: 'h2', text: '¿Puedes obtener el EIN sin SSN?' },
      {
        type: 'p',
        text: 'Sí. El IRS permite a extranjeros no residentes (sin SSN ni ITIN) obtener un EIN mediante el formulario SS-4 enviado por fax o por correo. La solicitud en línea (que requiere SSN o ITIN) no está disponible para extranjeros, pero el proceso por fax es igualmente válido y oficial.',
      },
      { type: 'h2', text: 'Proceso paso a paso para obtener EIN sin SSN' },
      {
        type: 'ol',
        items: [
          'Forma tu LLC primero — el IRS requiere que la LLC ya exista legalmente antes de asignarle un EIN.',
          'Completa el formulario SS-4 del IRS. Necesitas: nombre legal de la LLC, dirección registrada, fecha de formación, número de miembros, tipo de entidad y motivo de la solicitud.',
          'En la línea 7b ("SSN, ITIN, o EIN del responsible party"), escribe "Foreign — N/A" si no tienes SSN ni ITIN.',
          'Envía el SS-4 por fax al IRS: +1 (855) 641-6935 (número internacional del IRS para formularios SS-4).',
          'El IRS procesa la solicitud y envía el EIN por fax en aproximadamente 4 semanas. Si lo envías por correo, puede tardar 8 a 12 semanas.',
          'Guarda el documento oficial (carta CP 575) — es la confirmación de tu EIN.',
        ],
      },
      { type: 'h2', text: 'Tiempos de procesamiento' },
      {
        type: 'table',
        headers: ['Método', 'Tiempo estimado', 'Disponible para extranjeros'],
        rows: [
          ['En línea (IRS.gov)', '~15 minutos', '❌ Requiere SSN o ITIN'],
          ['Por teléfono (desde EE.UU.)', '~1 hora', '⚠️ Solo si hablas inglés'],
          ['Por fax', '~4 semanas', '✅ Disponible para extranjeros'],
          ['Por correo postal', '8–12 semanas', '✅ Disponible para extranjeros'],
        ],
      },
      { type: 'h2', text: 'Errores comunes al solicitar el EIN sin SSN' },
      {
        type: 'ul',
        items: [
          'Solicitar el EIN antes de que la LLC esté formada oficialmente',
          'Dejar vacío el campo del responsible party — siempre escribe "Foreign — N/A"',
          'Usar una dirección diferente a la de los Articles of Organization',
          'Enviar el formulario sin firma (el SS-4 debe estar firmado por el responsible party)',
          'No guardar el acuse de recibo del fax — es tu única constancia hasta recibir la carta',
        ],
      },
      { type: 'h2', text: '¿Necesitas ITIN además del EIN?' },
      {
        type: 'p',
        text: 'El ITIN (Individual Taxpayer Identification Number) es un número fiscal personal — diferente al EIN de la empresa. Necesitas ITIN si vas a presentar declaraciones de impuestos personales en EE.UU., si la LLC tiene retenciones fiscales o si necesitas reclamar un treaty benefit. Para simplemente operar tu LLC y abrir una cuenta bancaria, el EIN es suficiente.',
      },
      {
        type: 'cta',
        text: 'Obtenemos tu EIN por ti — sin estrés',
        href: '/index_final.html?page=wizard&plan=pro',
        label: 'Ver Plan Pro con EIN incluido →',
      },
      {
        type: 'faq',
        items: [
          {
            q: '¿Cuánto cuesta obtener el EIN por cuenta propia?',
            a: 'El EIN es gratis si lo solicitas directamente al IRS. Los servicios de formación como el nuestro lo incluyen dentro del plan (Plan Pro y Premium) para ahorrarte el proceso de fax internacional y traducción del formulario.',
          },
          {
            q: '¿Puedo abrir una cuenta bancaria sin EIN?',
            a: 'En la mayoría de los bancos, no. Mercury, Relay y Brex requieren el EIN para abrir una cuenta empresarial. Algunos bancos tradicionales pueden aceptar la LLC sin EIN, pero es poco común.',
          },
          {
            q: '¿El EIN vence o necesita renovarse?',
            a: 'No. El EIN es permanente y no vence. Una vez asignado a tu LLC, es tuyo indefinidamente, incluso si cambias el nombre o la dirección de la empresa.',
          },
          {
            q: '¿Qué hago si el IRS no me envía el EIN después de 4 semanas?',
            a: 'Llama al IRS Business & Specialty Tax Line: +1 (800) 829-4933. Necesitarás el número de confirmación del fax. Si lo enviaste por correo, espera hasta 12 semanas antes de hacer seguimiento.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. abrir cuenta bancaria USA sin SSN (7,400/mes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'abrir-cuenta-bancaria-usa-sin-ssn',
    title: 'Cómo Abrir Cuenta Bancaria en USA sin SSN siendo Extranjero (2026)',
    headline: 'Cómo abrir una cuenta bancaria en USA sin SSN: opciones para extranjeros en 2026',
    description:
      'Descubre cómo abrir una cuenta bancaria en Estados Unidos sin SSN siendo extranjero no residente. Mercury, Relay, Brex y más — requisitos y proceso paso a paso.',
    date: '2026-04-04',
    modified: '2026-04-10',
    readTime: 8,
    keyword: 'abrir cuenta bancaria USA sin SSN',
    sections: [
      {
        type: 'p',
        text: 'Una cuenta bancaria en dólares en Estados Unidos te permite cobrar de clientes internacionales, usar Stripe, pagar proveedores y proyectar una imagen profesional global. Y sí, puedes abrirla como extranjero sin SSN — siempre que tengas tu LLC formada y tu EIN en mano.',
      },
      { type: 'h2', text: '¿Por qué necesitas una LLC para abrir la cuenta?' },
      {
        type: 'p',
        text: 'Los bancos tradicionales de EE.UU. (Chase, Bank of America, Wells Fargo) requieren que el dueño esté físicamente presente en la sucursal y, en la mayoría de los casos, que tenga SSN. Sin embargo, los bancos digitales (neo-banks) especializados en empresas permiten abrir cuentas empresariales 100% en línea para LLCs, sin SSN personal del dueño, usando solo el EIN de la empresa.',
      },
      { type: 'h2', text: 'Las mejores opciones para extranjeros sin SSN' },
      { type: 'h3', text: 'Mercury — la más popular para startups y freelancers' },
      {
        type: 'ul',
        items: [
          'Cuenta corriente y de ahorros en USD',
          'Sin comisiones mensuales ni saldo mínimo',
          'Tarjeta de débito Visa para gastos empresariales',
          'API para automatizar pagos y cobros',
          'Requisitos: LLC formada + EIN + pasaporte (no requiere SSN)',
          'Proceso 100% en línea — apertura en 1 a 3 días hábiles',
        ],
      },
      { type: 'h3', text: 'Relay — ideal para control de flujo de efectivo' },
      {
        type: 'ul',
        items: [
          'Hasta 20 cuentas corrientes y 2 cuentas de ahorros en un solo dashboard',
          'Integración con QuickBooks y Xero para contabilidad',
          'Sin comisiones mensuales (plan básico)',
          'Tarjetas de débito individuales por equipo',
          'Requisitos: LLC formada + EIN + identificación oficial',
        ],
      },
      { type: 'h3', text: 'Brex — para empresas con mayor volumen' },
      {
        type: 'ul',
        items: [
          'Cuenta + tarjeta de crédito empresarial sin garantía personal',
          'Límites de crédito basados en ingresos de la empresa (no en historial personal)',
          'Recompensas en viajes, software y servicios cloud',
          'Ideal para startups con inversión o empresas con gastos recurrentes altos',
          'Requisitos: LLC formada + EIN + documentos de la empresa',
        ],
      },
      { type: 'h3', text: 'Wise Business — para pagos internacionales frecuentes' },
      {
        type: 'ul',
        items: [
          'Cuenta en múltiples monedas (USD, EUR, GBP, MXN y más)',
          'Transferencias internacionales al tipo de cambio real (sin markup bancario)',
          'Número de cuenta local en EE.UU. para recibir ACH',
          'Ideal si pagas proveedores en diferentes países',
        ],
      },
      {
        type: 'table',
        headers: ['Banco', 'Comisión mensual', 'Requiere SSN', 'Tiempo apertura'],
        rows: [
          ['Mercury', '$0', '❌ No', '1–3 días'],
          ['Relay', '$0 (básico)', '❌ No', '2–5 días'],
          ['Brex', '$0', '❌ No', '2–5 días'],
          ['Wise Business', '$0', '❌ No', '1–3 días'],
          ['Chase (banco físico)', 'Varía', '✅ Sí', 'En sucursal'],
        ],
      },
      { type: 'h2', text: 'Documentos que necesitas para abrir la cuenta' },
      {
        type: 'ul',
        items: [
          'EIN de tu LLC (carta CP 575 del IRS o carta de confirmación)',
          'Articles of Organization o Certificate of Formation de tu LLC',
          'Operating Agreement (acuerdo de operación) firmado',
          'Pasaporte vigente del dueño o dueños',
          'Dirección de la empresa (puede ser la de tu agente registrado)',
        ],
      },
      { type: 'h2', text: 'Proceso paso a paso para abrir tu cuenta en Mercury' },
      {
        type: 'ol',
        items: [
          'Ve a mercury.com y crea una cuenta personal.',
          'Selecciona "Business account" e ingresa los datos de tu LLC.',
          'Sube el EIN (carta CP 575) y los Articles of Organization.',
          'Sube tu pasaporte para verificación de identidad.',
          'Mercury revisa la documentación en 1 a 3 días hábiles.',
          'Una vez aprobada, recibes los datos de tu cuenta para hacer el primer depósito.',
        ],
      },
      {
        type: 'cta',
        text: 'Forma tu LLC y recibe asesoría bancaria incluida',
        href: '/index_final.html?page=wizard&plan=pro',
        label: 'Ver Plan Pro →',
      },
      {
        type: 'faq',
        items: [
          {
            q: '¿Puedo abrir la cuenta bancaria antes de tener el EIN?',
            a: 'No. Todos los bancos digitales serios requieren el EIN de tu LLC antes de abrir la cuenta empresarial. El EIN es el identificador fiscal que vincula la cuenta con tu empresa.',
          },
          {
            q: '¿Puedo usar mi cuenta bancaria de EE.UU. desde México?',
            a: 'Sí. Mercury, Relay y las demás son cuentas 100% digitales que puedes gestionar desde cualquier país con internet. Puedes transferir fondos, pagar proveedores y recibir pagos sin estar en EE.UU.',
          },
          {
            q: '¿Es necesario depositar dinero al abrir la cuenta?',
            a: 'Mercury y Relay no requieren saldo mínimo ni depósito inicial. Una vez abierta, puedes financiarla con una transferencia desde tu cuenta personal o desde clientes.',
          },
          {
            q: '¿Puedo conectar Stripe a esta cuenta?',
            a: 'Sí. Stripe acepta cuentas bancarias de Mercury, Relay y Brex para depositar los pagos de tus clientes. Es uno de los casos de uso más comunes.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. impuestos LLC no residentes (4,600/mes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'impuestos-llc-no-residentes',
    title: 'Impuestos para LLC de No Residentes en USA: Guía 2026',
    headline: 'Impuestos para LLC de no residentes en USA: lo que debes declarar en 2026',
    description:
      'Guía de impuestos para extranjeros con LLC en USA. Form 5472, declaraciones federales, treaty benefits y obligaciones del no residente con el IRS en 2026.',
    date: '2026-04-05',
    modified: '2026-04-10',
    readTime: 10,
    keyword: 'impuestos LLC no residentes',
    sections: [
      {
        type: 'p',
        text: 'Tener una LLC en Estados Unidos como extranjero no residente no significa necesariamente que pagarás impuestos en EE.UU. Pero sí tienes obligaciones de reporte ante el IRS que, si no cumples, pueden generar multas severas. Esta guía te explica qué debes declarar, cuándo y cómo — sin tecnicismos innecesarios.',
      },
      {
        type: 'p',
        text: 'Nota importante: esta guía es de carácter informativo. Para tu situación específica, siempre consulta con un CPA (contador público certificado) con experiencia en fiscalidad internacional.',
      },
      { type: 'h2', text: '¿Paga impuestos una LLC en USA siendo de un extranjero?' },
      {
        type: 'p',
        text: 'Depende de si la LLC tiene "Effectively Connected Income" (ECI) — ingresos efectivamente conectados con una actividad comercial en EE.UU. Para la mayoría de los no residentes que operan negocios digitales sin presencia física en EE.UU., la LLC de un solo miembro (SMLLC) no paga impuestos federales en EE.UU. Sin embargo, sí tiene obligaciones de reporte.',
      },
      { type: 'h2', text: 'Tipos de LLC y su tratamiento fiscal' },
      {
        type: 'table',
        headers: ['Tipo de LLC', 'Tratamiento fiscal IRS', 'Declaración requerida'],
        rows: [
          ['LLC 1 miembro (no residente)', 'Disregarded Entity', 'Form 5472 + Form 1120 pro forma'],
          ['LLC multi-miembros (socios extranjeros)', 'Partnership', 'Form 1065 + Schedule K-1'],
          ['LLC con elección S-Corp', 'No disponible para no residentes', 'N/A'],
          ['LLC con elección C-Corp', 'Corporation', 'Form 1120'],
        ],
      },
      { type: 'h2', text: 'El Form 5472: la obligación más importante' },
      {
        type: 'p',
        text: 'Si tu LLC es de un solo miembro (Single-Member LLC) propiedad de un extranjero no residente, el IRS exige presentar el Form 5472 anualmente. Este formulario reporta las transacciones entre la LLC y su dueño extranjero (tú).',
      },
      {
        type: 'ul',
        items: [
          'Se presenta junto con un Form 1120 "pro forma" (de carácter informativo)',
          'Fecha límite: 15 de abril de cada año (puede extenderse hasta octubre)',
          'Multa por no presentar: $25,000 USD por año por formulario',
          'Se deben reportar: contribuciones de capital, distribuciones, préstamos entre dueño y LLC, servicios pagados',
        ],
      },
      { type: 'h2', text: '¿Cuándo sí se pagan impuestos en USA?' },
      {
        type: 'p',
        text: 'Tu LLC sí genera obligaciones de pago de impuestos en EE.UU. si tiene Effectively Connected Income (ECI). Esto ocurre cuando:',
      },
      {
        type: 'ul',
        items: [
          'Tienes empleados o contratistas físicamente en EE.UU.',
          'Tienes una oficina, almacén o lugar de negocios en EE.UU.',
          'Realizas ventas de bienes físicos almacenados en EE.UU. (Amazon FBA puede crear nexo)',
          'Prestas servicios físicamente dentro de EE.UU.',
        ],
      },
      { type: 'h2', text: 'FDAP: ingresos pasivos de fuente estadounidense' },
      {
        type: 'p',
        text: 'Además del ECI, los no residentes que reciben ciertos ingresos pasivos de fuente estadounidense (intereses, dividendos, regalías, alquileres) están sujetos a una retención del 30% — o una tasa reducida si hay un tratado fiscal entre EE.UU. y tu país. México tiene tratado fiscal con EE.UU. que puede reducir o eliminar estas retenciones en ciertos casos.',
      },
      { type: 'h2', text: 'Obligaciones anuales de tu LLC en EE.UU.' },
      {
        type: 'table',
        headers: ['Obligación', 'Cuándo', 'Multa por incumplimiento'],
        rows: [
          ['Form 5472 + 1120 pro forma', '15 abril (extensible a oct)', '$25,000 USD'],
          ['Annual Report estatal', 'Varía por estado', '$50–$500 + disolución'],
          ['BOI Report (FinCEN)', 'Al formar la LLC', '$500/día de retraso'],
          ['Form 1065 (LLC multi-miembros)', '15 marzo (extensible)', '$245/socio/mes'],
        ],
      },
      { type: 'h2', text: 'BOI Report: nueva obligación desde 2024' },
      {
        type: 'p',
        text: 'Desde enero de 2024, todas las LLCs en EE.UU. deben presentar el Beneficial Ownership Information (BOI) Report ante FinCEN (Financial Crimes Enforcement Network). Este reporte identifica a los dueños reales (beneficial owners) de la empresa. Las LLCs formadas antes de 2024 tuvieron hasta el 1 de enero de 2025 para presentarlo; las formadas en 2024 o después tienen 90 días desde la formación.',
      },
      { type: 'h2', text: '¿Tengo que declarar también en mi país?' },
      {
        type: 'p',
        text: 'En la mayoría de los casos, sí. Si eres residente fiscal en México (o en cualquier país de LATAM), debes declarar los ingresos de tu LLC en tu país de residencia. Muchos países tienen acuerdos de intercambio de información con EE.UU. (FATCA). Consulta con un contador en tu país para asegurarte de cumplir con tus obligaciones locales.',
      },
      {
        type: 'cta',
        text: '¿Tienes dudas sobre los impuestos de tu LLC?',
        href: '/index_final.html?page=wizard&plan=premium',
        label: 'Ver Plan Premium con asesoría fiscal →',
      },
      {
        type: 'faq',
        items: [
          {
            q: '¿Una LLC en Wyoming paga impuestos estatales?',
            a: 'No. Wyoming no tiene impuesto sobre ingresos estatales. La LLC en Wyoming solo tiene el costo del annual report ($60/año) y las obligaciones federales ante el IRS.',
          },
          {
            q: '¿Qué pasa si no presento el Form 5472?',
            a: 'El IRS impone una multa de $25,000 USD por formulario por año. Es una de las multas más altas del sistema tributario estadounidense y aplica incluso si no hubo ingresos.',
          },
          {
            q: '¿Necesito un CPA en EE.UU. o puedo usar uno de México?',
            a: 'Para las declaraciones ante el IRS necesitas un CPA o Enrolled Agent autorizado en EE.UU. o alguien con experiencia en fiscalidad internacional. En nuestro Plan Premium incluimos orientación y referidos a CPAs especializados en no residentes.',
          },
          {
            q: '¿El tratado fiscal México-USA me beneficia?',
            a: 'El convenio entre México y EE.UU. puede reducir retenciones sobre ciertos ingresos pasivos (dividendos, intereses, regalías). Para ingresos de actividad empresarial, el tratado establece que solo se tributa en EE.UU. si hay un "establecimiento permanente". Consulta con un especialista para tu caso.',
          },
          {
            q: '¿Qué es el nexo y por qué importa?',
            a: 'El nexo es la conexión suficiente entre tu negocio y un estado de EE.UU. para que ese estado pueda cobrarte impuestos. Tener empleados, almacén o ventas significativas en un estado puede crear nexo. Para negocios digitales sin presencia física, generalmente no hay nexo.',
          },
        ],
      },
    ],
  },
]

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug)
}
