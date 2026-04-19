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
  metaTitle: string     // <title> tag ≤60 chars
  metaDescription: string // meta description ≤155 chars
  focusKeyword: string  // Yoast-style focus keyword
  category: string      // display category
  badge: string         // short badge label
  photo: string         // hero / card image URL
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
    metaTitle: 'Abrir LLC en USA desde México 2026 — Guía Completa',
    metaDescription: 'Guía 2026 para abrir una LLC en USA desde México sin visa, sin SSN y sin viajar. Requisitos, costos y pasos detallados. Proceso 100% en español.',
    focusKeyword: 'abrir LLC en USA desde México',
    category: 'Formación LLC',
    badge: 'LLC en USA',
    photo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
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
    metaTitle: 'Mejor Estado para LLC Extranjeros: Wyoming vs Delaware vs New Mexico',
    metaDescription: 'Compara Wyoming, Delaware, New Mexico y Florida para tu LLC. Impuestos, privacidad y costos anuales para extranjeros no residentes en 2026.',
    focusKeyword: 'mejor estado para abrir LLC extranjero',
    category: 'Elegir Estado',
    badge: 'Comparativa',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
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
    metaTitle: 'Cómo Sacar EIN sin SSN — Guía para Extranjeros 2026',
    metaDescription: 'Obtén el EIN del IRS sin SSN ni ITIN. Guía paso a paso con formulario SS-4, tiempos de aprobación y costos para extranjeros no residentes 2026.',
    focusKeyword: 'EIN sin SSN',
    category: 'EIN',
    badge: 'EIN',
    photo: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
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
    metaTitle: 'Cuenta Bancaria en USA sin SSN: Mercury, Relay y Brex 2026',
    metaDescription: 'Abre tu cuenta bancaria en USA sin SSN. Comparativa Mercury, Relay, Brex y Wise para extranjeros con LLC en 2026. Requisitos y proceso completo.',
    focusKeyword: 'cuenta bancaria USA sin SSN',
    category: 'Banca USA',
    badge: 'Banca',
    photo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80',
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
    metaTitle: 'Impuestos LLC No Residentes: Form 5472 y Más (2026)',
    metaDescription: 'Todo sobre impuestos para LLC de extranjeros: Form 5472, declaraciones IRS, treaty benefits y obligaciones del no residente en USA 2026.',
    focusKeyword: 'impuestos LLC no residentes USA',
    category: 'Impuestos',
    badge: 'Impuestos',
    photo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
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

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. LLC anónima New Mexico (1,900/mes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'llc-anonima-new-mexico',
    title: 'LLC Anónima en New Mexico: Privacidad Total para Extranjeros (2026)',
    headline: 'LLC anónima en New Mexico: guía de privacidad para no residentes',
    description:
      'Descubre cómo una LLC en New Mexico ofrece anonimato total sin revelar tu nombre en registros públicos. La opción más privada para emprendedores extranjeros en 2026.',
    date: '2026-04-06',
    modified: '2026-04-10',
    readTime: 7,
    keyword: 'LLC anónima New Mexico',
    metaTitle: 'LLC Anónima en New Mexico: Guía de Privacidad 2026',
    metaDescription: 'LLC en New Mexico: anonimato total sin revelar tu nombre en registros públicos. La opción más privada para emprendedores extranjeros en 2026.',
    focusKeyword: 'LLC anónima New Mexico',
    category: 'Privacidad',
    badge: 'Privacidad',
    photo: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80',
    sections: [
      {
        type: 'p',
        text: 'Si la privacidad es tu prioridad al formar una empresa en Estados Unidos, New Mexico es la respuesta. Es el único estado donde puedes formar una LLC sin que tu nombre ni tus datos personales aparezcan en ningún registro público — sin costo de annual report y con la tarifa de formación más baja del país.',
      },
      { type: 'h2', text: '¿Qué es una LLC anónima?' },
      {
        type: 'p',
        text: 'Una LLC anónima es una sociedad donde los nombres de los dueños (members) y del administrador (manager) no aparecen en los registros públicos del estado. En la mayoría de los estados, los Articles of Organization son públicos y requieren divulgar al menos al agente registrado y, en muchos casos, a los miembros o managers. New Mexico no exige ninguna de esas divulgaciones.',
      },
      { type: 'h2', text: '¿Por qué New Mexico es el estado más privado?' },
      {
        type: 'ul',
        items: [
          'No requiere listar a los miembros (owners) en los Articles of Organization',
          'No requiere listar al manager en documentos públicos',
          'No hay annual report — nunca tendrás que actualizar información en registros públicos',
          'State filing fee: solo $50 USD (el más bajo de todos los estados)',
          'El registro público solo muestra el nombre de la LLC y la dirección del agente registrado',
        ],
      },
      { type: 'h2', text: 'Cómo se logra el anonimato en New Mexico' },
      {
        type: 'p',
        text: 'El anonimato se logra a través de dos mecanismos: (1) usar un "organizer" (quien presenta los Articles) que no sea el dueño real, típicamente el servicio de formación; y (2) estructurar la LLC como "manager-managed" donde el manager puede ser otra entidad. En ningún momento se vincula tu nombre a los documentos públicos del estado.',
      },
      {
        type: 'ol',
        items: [
          'El agente registrado o el servicio de formación actúa como "organizer" — la persona que firma y presenta los Articles of Organization.',
          'Los Articles se presentan solo con el nombre de la LLC y la dirección del agente registrado.',
          'El Operating Agreement (que sí lista a los miembros) es un documento privado — no se registra ante el estado.',
          'Tu nombre y datos personales permanecen completamente fuera de los registros públicos.',
        ],
      },
      { type: 'h2', text: 'Comparación de privacidad por estado' },
      {
        type: 'table',
        headers: ['Estado', 'Members públicos', 'Annual report', 'State fee', 'Anonimato'],
        rows: [
          ['New Mexico', '❌ No', '❌ No existe', '$50', '✅ Total'],
          ['Wyoming', '❌ No', '✅ Sí ($60/año)', '$62', '✅ Alto'],
          ['Delaware', '❌ No', '✅ Sí ($300/año)', '$90', '✅ Alto'],
          ['Florida', '✅ Sí', '✅ Sí ($138/año)', '$125', '⚠️ Bajo'],
          ['Texas', '⚠️ Parcial', '⚠️ No fee', '$300', '⚠️ Medio'],
        ],
      },
      { type: 'h2', text: '¿Para quién es ideal una LLC anónima en New Mexico?' },
      {
        type: 'ul',
        items: [
          'Emprendedores que no quieren que su nombre aparezca en búsquedas públicas vinculadas a empresas',
          'Creadores de contenido, influencers y personas públicas que prefieren separar su identidad personal de su negocio',
          'Inversionistas en bienes raíces o cripto que desean privacidad patrimonial',
          'Negocios digitales sin clientes ni presencia física en New Mexico',
          'Extranjeros no residentes que valoran la privacidad pero no quieren pagar annual reports',
        ],
      },
      { type: 'h2', text: 'Limitaciones importantes del anonimato' },
      {
        type: 'ul',
        items: [
          'El anonimato es ante el público — el IRS y los bancos sí conocen tu identidad para abrir cuenta o presentar el EIN',
          'El Operating Agreement (privado) sí lista a los dueños reales — debes guardarlo con cuidado',
          'Si la LLC tiene empleados o nexo fiscal en otro estado, ese estado puede requerir registro y divulgación',
          'Los bancos como Mercury requieren pasaporte e identificación del beneficial owner — no hay anonimato bancario',
          'Litigios judiciales pueden requerir la divulgación de los dueños mediante subpoena',
        ],
      },
      {
        type: 'cta',
        text: 'Forma tu LLC anónima en New Mexico con nosotros',
        href: '/index_final.html?page=wizard',
        label: 'Iniciar el proceso →',
      },
      {
        type: 'faq',
        items: [
          {
            q: '¿Es legal una LLC anónima?',
            a: 'Sí. El anonimato en New Mexico es completamente legal. Simplemente aprovechas que la ley estatal no exige divulgar a los miembros en documentos públicos. Es una estrategia de privacidad, no de evasión fiscal.',
          },
          {
            q: '¿El IRS sabrá quién soy?',
            a: 'Sí. Al solicitar el EIN debes identificarte como el "responsible party". El IRS conoce tu identidad, pero esa información no es pública.',
          },
          {
            q: '¿Puedo operar en otro estado con una LLC de New Mexico?',
            a: 'Sí, pero si tienes presencia física (oficina, empleados) en otro estado, deberías registrar la LLC como "foreign LLC" en ese estado, lo que puede requerir divulgación de información. Para negocios 100% digitales sin presencia física, generalmente no es necesario.',
          },
          {
            q: '¿New Mexico tiene impuesto estatal sobre ingresos para LLCs?',
            a: 'New Mexico sí tiene impuesto estatal sobre ingresos (Gross Receipts Tax). Sin embargo, si la LLC no tiene presencia ni actividad en New Mexico, generalmente no aplica. Para negocios digitales operados desde el extranjero, normalmente no hay obligación fiscal estatal en New Mexico.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. Mercury Bank extranjero (1,400/mes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'abrir-cuenta-mercury-bank-extranjero',
    title: 'Cómo Abrir Cuenta en Mercury Bank Siendo Extranjero (Guía 2026)',
    headline: 'Cómo abrir una cuenta en Mercury Bank siendo extranjero no residente',
    description:
      'Guía paso a paso para abrir una cuenta de negocios en Mercury Bank sin SSN, con tu LLC y EIN. Requisitos, documentos y proceso completo para extranjeros en 2026.',
    date: '2026-04-07',
    modified: '2026-04-10',
    readTime: 6,
    keyword: 'abrir cuenta Mercury Bank extranjero',
    metaTitle: 'Abrir Cuenta Mercury Bank Extranjero — Guía 2026',
    metaDescription: 'Abre tu cuenta Mercury Bank con LLC y EIN sin SSN. Guía completa de documentos, requisitos y proceso paso a paso para extranjeros en 2026.',
    focusKeyword: 'cuenta Mercury Bank extranjero',
    category: 'Banca USA',
    badge: 'Mercury Bank',
    photo: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=1200&q=80',
    sections: [
      {
        type: 'p',
        text: 'Mercury Bank es la cuenta bancaria favorita de fundadores de startups, freelancers y emprendedores digitales en Estados Unidos. Sin comisiones, sin saldo mínimo, y lo más importante: acepta LLC de extranjeros no residentes sin requerir SSN. Si tienes tu LLC y tu EIN, puedes abrir una cuenta Mercury en menos de una semana.',
      },
      { type: 'h2', text: '¿Qué es Mercury Bank?' },
      {
        type: 'p',
        text: 'Mercury es un banco digital (fintech) fundado en 2019, enfocado exclusivamente en empresas (no cuentas personales). Sus fondos están asegurados por la FDIC hasta $250,000 USD. Ofrece cuenta corriente y de ahorros, tarjeta de débito Visa, transferencias ACH y wire, y una API para automatización financiera. Es el estándar de la industria para startups y empresas remotas.',
      },
      { type: 'h2', text: 'Requisitos para abrir cuenta Mercury como extranjero' },
      {
        type: 'ul',
        items: [
          'LLC formada legalmente en cualquier estado de EE.UU.',
          'EIN (Employer Identification Number) del IRS — carta CP 575 o documento oficial',
          'Articles of Organization o Certificate of Formation de tu LLC',
          'Operating Agreement firmado',
          'Pasaporte vigente del beneficial owner (dueño real)',
          'Dirección de negocios en EE.UU. (puede ser la dirección de tu agente registrado)',
          'Correo electrónico y número de teléfono',
        ],
      },
      { type: 'h2', text: 'Proceso paso a paso para abrir la cuenta' },
      {
        type: 'ol',
        items: [
          'Ve a mercury.com y haz clic en "Open an account". Crea tu perfil personal (nombre, email, contraseña).',
          'Selecciona "Business account" e ingresa los datos de tu LLC: nombre, EIN, dirección, tipo de negocio y descripción de actividades.',
          'Sube el EIN: la carta CP 575 del IRS o la confirmación oficial. Si aún no tienes la carta física, puedes cargar el documento SS-4 aprobado.',
          'Sube los Articles of Organization (documento de formación de la LLC) y el Operating Agreement.',
          'Verifica tu identidad: sube ambas caras de tu pasaporte y, si Mercury lo solicita, tómate una selfie con el pasaporte.',
          'Mercury revisa la aplicación. El proceso tarda entre 1 y 5 días hábiles. Recibirás actualizaciones por email.',
          'Una vez aprobada, recibes los datos de tu cuenta (número de cuenta y routing number). Puedes hacer el primer depósito via wire internacional.',
        ],
      },
      { type: 'h2', text: 'Causas comunes de rechazo y cómo evitarlas' },
      {
        type: 'ul',
        items: [
          'EIN no verificable: asegúrate de subir la carta oficial del IRS, no solo el número',
          'LLC no activa: Mercury verifica que la LLC esté vigente en el estado — evita LLCs disueltas o con annual report vencido',
          'Actividades de alto riesgo: cripto, cannabis, servicios financieros no regulados y gambling generalmente son rechazados',
          'Información inconsistente: el nombre en los Articles debe coincidir exactamente con el EIN de la LLC',
          'Pasaporte vencido o foto ilegible: usa el pasaporte más reciente y fotos de alta calidad',
        ],
      },
      { type: 'h2', text: 'Características de la cuenta Mercury' },
      {
        type: 'table',
        headers: ['Característica', 'Detalle'],
        rows: [
          ['Comisión mensual', '$0 (plan básico)'],
          ['Saldo mínimo', '$0'],
          ['Transferencias ACH', 'Gratis, ilimitadas'],
          ['Domestic wire', '$0 (entrante), $5 (saliente)'],
          ['International wire', '$20 por envío'],
          ['Tarjeta de débito', 'Visa física y virtual'],
          ['FDIC', 'Hasta $250,000 USD'],
          ['API', 'Sí — integración con herramientas propias'],
          ['Integración Stripe', 'Sí — directo'],
        ],
      },
      {
        type: 'cta',
        text: 'Forma tu LLC y abre tu cuenta Mercury con nosotros',
        href: '/index_final.html?page=wizard&plan=pro',
        label: 'Ver Plan Pro con asesoría bancaria →',
      },
      {
        type: 'faq',
        items: [
          {
            q: '¿Mercury acepta LLCs de todos los estados?',
            a: 'Sí. Mercury acepta LLCs formadas en cualquier estado de EE.UU. Los más comunes son Wyoming, Delaware, Florida y Texas, pero no hay restricción por estado.',
          },
          {
            q: '¿Puedo abrir la cuenta sin haber recibido aún la carta CP 575?',
            a: 'Mercury requiere el EIN, pero en algunos casos acepta la confirmación SS-4 aprobada. Lo más recomendable es esperar a tener la carta CP 575 para evitar demoras o rechazos.',
          },
          {
            q: '¿Cuánto tiempo tarda la apertura?',
            a: 'El proceso de revisión tarda entre 1 y 5 días hábiles. En casos más complejos puede extenderse hasta 2 semanas si Mercury solicita documentación adicional.',
          },
          {
            q: '¿Puedo conectar Stripe con Mercury?',
            a: 'Sí. Mercury es una de las cuentas bancarias más compatibles con Stripe. Una vez activa tu cuenta, puedes vincularla en minutos desde el dashboard de Stripe.',
          },
          {
            q: '¿Mercury permite múltiples usuarios?',
            a: 'Sí. Puedes agregar team members con diferentes niveles de acceso (admin, contable, solo lectura). Útil si tienes socio o contador que necesita acceso a la cuenta.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. Form 5472 en español (2,100/mes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'form-5472-irs-espanol',
    title: 'Form 5472 del IRS en Español: Guía Completa para LLCs de Extranjeros (2026)',
    headline: 'Form 5472 del IRS en español: todo lo que debe reportar tu LLC',
    description:
      'Guía completa del Form 5472 en español. Quién debe presentarlo, qué transacciones se reportan, fechas límite, multas y cómo llenarlo siendo extranjero no residente en 2026.',
    date: '2026-04-08',
    modified: '2026-04-10',
    readTime: 9,
    keyword: 'Form 5472 IRS en español',
    metaTitle: 'Form 5472 IRS en Español: Guía para Extranjeros 2026',
    metaDescription: 'Guía del Form 5472 en español: quién lo presenta, qué reportar, fechas límite y cómo evitar multas de $25,000 siendo extranjero en 2026.',
    focusKeyword: 'Form 5472 IRS español',
    category: 'Impuestos',
    badge: 'Form 5472',
    photo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
    sections: [
      {
        type: 'p',
        text: 'El Form 5472 es uno de los formularios más importantes — y más ignorados — del sistema fiscal estadounidense para extranjeros con LLC. Una multa de $25,000 USD por año por no presentarlo es la consecuencia de no conocerlo. Esta guía te explica qué es, quién debe presentarlo, qué se reporta y cómo hacerlo correctamente, en español.',
      },
      { type: 'h2', text: '¿Qué es el Form 5472?' },
      {
        type: 'p',
        text: 'El Form 5472 ("Information Return of a 25% Foreign-Owned U.S. Corporation or a Foreign Corporation Engaged in a U.S. Trade or Business") es un formulario informativo del IRS que reporta las transacciones entre una LLC de propiedad extranjera y sus dueños o partes relacionadas. No implica pago de impuestos — es un reporte de transparencia.',
      },
      { type: 'h2', text: '¿Quién debe presentar el Form 5472?' },
      {
        type: 'ul',
        items: [
          'Toda LLC de un solo miembro (SMLLC) propiedad de un extranjero no residente',
          'Aplica incluso si la LLC no tuvo ingresos durante el año fiscal',
          'Aplica incluso si la LLC no tuvo transacciones durante el año',
          'Aplica aunque la LLC no tenga empleados ni presencia física en EE.UU.',
          'También aplica a corporaciones C que tienen 25% o más de propiedad extranjera',
        ],
      },
      { type: 'h2', text: '¿Qué transacciones se reportan en el Form 5472?' },
      {
        type: 'p',
        text: 'Se reportan todas las "reportable transactions" entre la LLC y el dueño extranjero (o partes relacionadas). Esto incluye:',
      },
      {
        type: 'table',
        headers: ['Tipo de transacción', 'Ejemplo', '¿Se reporta?'],
        rows: [
          ['Contribuciones de capital', 'Tú depositas $10,000 en la LLC desde tu cuenta personal', '✅ Sí'],
          ['Distribuciones', 'La LLC te transfiere $5,000 como ganancia', '✅ Sí'],
          ['Préstamos dueño → LLC', 'Le prestas dinero a tu LLC', '✅ Sí'],
          ['Préstamos LLC → dueño', 'La LLC te presta dinero a ti', '✅ Sí'],
          ['Servicios pagados', 'La LLC te paga por servicios que prestas', '✅ Sí'],
          ['Ingresos de clientes', 'Cliente A paga $3,000 a la LLC', '❌ No (son ingresos normales)'],
          ['Gastos operativos', 'LLC paga software, hosting, etc.', '❌ No'],
        ],
      },
      { type: 'h2', text: '¿Cuándo y cómo se presenta?' },
      {
        type: 'ul',
        items: [
          'Fecha límite: 15 de abril del año siguiente al año fiscal que se reporta',
          'Extensión disponible: hasta el 15 de octubre con Form 7004',
          'Se presenta junto con un Form 1120 "pro forma" (de carácter informativo, no de pago)',
          'El Form 5472 no se puede presentar por sí solo — siempre va adjunto al 1120',
          'Método: por correo a la dirección del IRS para no residentes, o electrónicamente con software autorizado',
          'No existe versión en español oficial del formulario — todos los campos se llenan en inglés',
        ],
      },
      { type: 'h2', text: 'Multas por no presentar el Form 5472' },
      {
        type: 'p',
        text: 'Las multas del IRS por incumplimiento del Form 5472 son de las más severas del código tributario:',
      },
      {
        type: 'table',
        headers: ['Incumplimiento', 'Multa'],
        rows: [
          ['No presentar el Form 5472', '$25,000 USD por año por formulario'],
          ['Presentar con información incompleta', '$25,000 USD'],
          ['No corregir después de notificación del IRS', '$25,000 USD adicionales por 90 días de retraso'],
          ['No mantener registros requeridos', '$10,000 USD adicionales'],
        ],
      },
      { type: 'h2', text: 'Caso especial: LLC sin actividad' },
      {
        type: 'p',
        text: 'Muchos extranjeros creen que si su LLC no tuvo ingresos en el año, no necesitan presentar el Form 5472. Esto es incorrecto. El IRS exige la presentación incluso si no hubo actividad, ingresos ni transacciones. La excepción es si la LLC nunca recibió su EIN y no realizó ninguna transacción desde su formación — pero esto es un caso muy específico.',
      },
      {
        type: 'cta',
        text: '¿Necesitas ayuda con tu Form 5472?',
        href: '/index_final.html?page=wizard&plan=premium',
        label: 'Ver Plan Premium con asesoría fiscal →',
      },
      {
        type: 'faq',
        items: [
          {
            q: '¿El Form 5472 genera pago de impuestos?',
            a: 'No directamente. El Form 5472 es informativo — reporta transacciones pero no genera un pago de impuestos por sí mismo. Los impuestos se determinan en otros formularios según el tipo de ingreso y nexo fiscal.',
          },
          {
            q: '¿Necesito un CPA para presentar el Form 5472?',
            a: 'Técnicamente no es obligatorio, pero es muy recomendable. Los errores en el Form 5472 tienen multas muy altas. Un CPA con experiencia en no residentes garantiza que el formulario esté correcto y adjunto al 1120 pro forma.',
          },
          {
            q: '¿Qué es el Form 1120 "pro forma"?',
            a: 'El Form 1120 es la declaración de impuestos de las corporaciones. Para una SMLLC extranjera, se presenta un Form 1120 "pro forma" (informativo, no de pago) como portada para adjuntar el Form 5472. No implica que la LLC pague impuestos corporativos.',
          },
          {
            q: '¿Qué pasa si olvidé presentar el Form 5472 de un año anterior?',
            a: 'Puedes presentarlo tardíamente. El IRS tiene un programa de "reasonable cause" que puede reducir o eliminar las multas si demuestras que el incumplimiento fue por causa razonable y no negligencia. Un CPA puede ayudarte a presentar tardíamente con una carta explicativa.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. Alternativas a Stripe Atlas (1,600/mes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'alternativas-stripe-atlas',
    title: 'Las Mejores Alternativas a Stripe Atlas para Formar tu Empresa en USA (2026)',
    headline: 'Alternativas a Stripe Atlas: las mejores opciones para abrir tu empresa en USA',
    description:
      'Stripe Atlas ya no acepta nuevos usuarios de todos los países. Descubre las mejores alternativas para formar tu LLC o C-Corp en Estados Unidos siendo extranjero en 2026.',
    date: '2026-04-09',
    modified: '2026-04-10',
    readTime: 7,
    keyword: 'alternativas Stripe Atlas',
    metaTitle: 'Alternativas a Stripe Atlas para Formar LLC en USA 2026',
    metaDescription: 'Las mejores alternativas a Stripe Atlas para formar tu LLC en USA. Comparamos costos, velocidad y soporte en español para latinoamericanos.',
    focusKeyword: 'alternativas Stripe Atlas LLC USA',
    category: 'Formación LLC',
    badge: 'Comparativa',
    photo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80',
    sections: [
      {
        type: 'p',
        text: 'Stripe Atlas fue durante años la opción favorita de fundadores latinoamericanos para abrir una C-Corp en Delaware con todo incluido: LLC o C-Corp, cuenta Mercury, acceso a Stripe y asesoría legal básica por $500 USD. Sin embargo, Stripe Atlas tiene disponibilidad limitada por país y listas de espera largas. Aquí te presentamos las mejores alternativas reales para 2026.',
      },
      { type: 'h2', text: '¿Qué ofrecía Stripe Atlas?' },
      {
        type: 'ul',
        items: [
          'Formación de LLC o C-Corp en Delaware por $500 USD',
          'EIN incluido',
          'Cuenta bancaria Mercury incluida',
          'Acceso a Stripe Payments desde el primer día',
          'Templates legales básicos (Operating Agreement, etc.)',
          'Acceso a perks de software (AWS, Notion, Stripe credits)',
        ],
      },
      { type: 'h2', text: 'Por qué buscar alternativas' },
      {
        type: 'ul',
        items: [
          'Stripe Atlas no está disponible en todos los países de LATAM sin lista de espera',
          'Solo forma C-Corps en Delaware — no LLCs en Wyoming, Texas o Florida',
          'Si quieres LLC (no C-Corp), Stripe Atlas no es la opción correcta',
          'El costo de $500 puede ser alto si no necesitas todos los servicios incluidos',
          'Las perks de software tienen poco valor si no usas esas herramientas',
        ],
      },
      { type: 'h2', text: 'Las mejores alternativas a Stripe Atlas' },
      { type: 'h3', text: 'CreaTuEmpresaUSA — para LATAM en español' },
      {
        type: 'ul',
        items: [
          'Formación de LLC en Wyoming, Florida o Texas — planes desde $499 USD',
          'Todo el proceso en español con seguimiento en tiempo real',
          'EIN incluido en Plan Pro y Premium',
          'Asesoría bancaria (Mercury, Relay) y fiscal incluida en planes superiores',
          'Ideal para emprendedores de México, Colombia, Argentina y toda LATAM',
        ],
      },
      { type: 'h3', text: 'Firstbase.io — experiencia digital completa' },
      {
        type: 'ul',
        items: [
          'Formación de LLC o C-Corp en Delaware, Wyoming o cualquier estado',
          'Agente registrado, EIN y cuenta bancaria incluidos',
          'Dashboard para gestión de compliance anual',
          'Plan básico desde $399 USD/año',
          'En inglés — menos soporte en español que opciones LATAM',
        ],
      },
      { type: 'h3', text: 'Doola — enfocado en fundadores internacionales' },
      {
        type: 'ul',
        items: [
          'Formación LLC o C-Corp + EIN + cuenta bancaria + Stripe',
          'Soporte en múltiples idiomas incluyendo español',
          'Planes desde $297 USD (básico) hasta $1,999 (con bookkeeping)',
          'Popular entre fundadores de India, Nigeria, LATAM',
        ],
      },
      { type: 'h3', text: 'Northwest Registered Agent — lo más económico' },
      {
        type: 'ul',
        items: [
          'Formación de LLC desde $39 USD + state fee',
          'Agente registrado incluido el primer año',
          'Sin EIN ni cuenta bancaria en el plan básico',
          'Muy buena reputación por privacidad y servicio al cliente',
          'Solo en inglés',
        ],
      },
      { type: 'h2', text: 'Comparación de alternativas' },
      {
        type: 'table',
        headers: ['Servicio', 'Precio base', 'LLC/C-Corp', 'EIN incluido', 'En español'],
        rows: [
          ['CreaTuEmpresaUSA', '$499', 'LLC', '✅ Plan Pro+', '✅ Sí'],
          ['Firstbase.io', '$399/año', 'LLC + C-Corp', '✅ Sí', '⚠️ Parcial'],
          ['Doola', '$297', 'LLC + C-Corp', '✅ Sí', '⚠️ Parcial'],
          ['Northwest', '$39 + fee', 'LLC', '❌ No', '❌ No'],
          ['Stripe Atlas', '$500', 'Solo C-Corp DE', '✅ Sí', '❌ No'],
        ],
      },
      { type: 'h2', text: '¿LLC o C-Corp? La decisión más importante' },
      {
        type: 'p',
        text: 'Stripe Atlas impulsa las C-Corps porque son el vehículo preferido de los VC (venture capital). Pero para la mayoría de los emprendedores latinoamericanos que venden servicios, tienen agencias, hacen ecommerce o freelancing, una LLC es la elección correcta: más simple, menos costosa de operar y con mejores beneficios fiscales para no residentes sin inversión institucional.',
      },
      {
        type: 'cta',
        text: 'Forma tu LLC en USA — todo en español',
        href: '/index_final.html?page=wizard',
        label: 'Iniciar el proceso →',
      },
      {
        type: 'faq',
        items: [
          {
            q: '¿Stripe requiere Stripe Atlas para activar mi cuenta?',
            a: 'No. Puedes activar Stripe Payments con cualquier LLC registrada en EE.UU. con EIN. No necesitas haber formado la LLC a través de Stripe Atlas.',
          },
          {
            q: '¿Puedo acceder a los perks de AWS y otros con una LLC normal?',
            a: 'Algunos perks de Stripe Atlas son exclusivos del programa. Sin embargo, AWS Activate, Notion, HubSpot y muchos otros tienen programas de startups accesibles directamente sin pasar por Stripe Atlas.',
          },
          {
            q: '¿Una LLC de Wyoming puede usar Stripe?',
            a: 'Sí. Stripe acepta LLCs de cualquier estado. Wyoming, Florida, Texas, Delaware — todos válidos para activar tu cuenta de Stripe Payments.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. Cómo sacar el ITIN desde México/LATAM (3,200/mes)
  // ─────────────────────────────────────────────────────────────────────────────
  {
    slug: 'como-sacar-itin-desde-tu-pais',
    title: 'Cómo Sacar el ITIN desde México, Colombia o LATAM sin Viajar (2026)',
    headline: 'Cómo obtener el ITIN desde tu país sin viajar a Estados Unidos',
    description:
      'Guía completa para obtener el ITIN (Individual Taxpayer Identification Number) desde México, Colombia, Argentina y LATAM. Proceso, documentos, tiempos y a quién le sirve en 2026.',
    date: '2026-04-10',
    modified: '2026-04-10',
    readTime: 8,
    keyword: 'cómo sacar ITIN desde México',
    metaTitle: 'Cómo Obtener el ITIN desde LATAM sin Viajar (2026)',
    metaDescription: 'Obtén el ITIN desde México, Colombia, Argentina y LATAM sin viajar. Documentos, proceso IRS y para quién es necesario en 2026.',
    focusKeyword: 'cómo sacar ITIN desde México',
    category: 'ITIN',
    badge: 'ITIN',
    photo: 'https://images.unsplash.com/photo-1606189934390-ae9b5f0dc9e7?w=1200&q=80',
    sections: [
      {
        type: 'p',
        text: 'El ITIN (Individual Taxpayer Identification Number) es el número de identificación fiscal personal para extranjeros que no califican para obtener un SSN. No es lo mismo que el EIN de tu LLC — el ITIN es tuyo como persona física. Si necesitas presentar una declaración personal de impuestos en EE.UU., reclamar un tratado fiscal o abrir ciertos tipos de cuentas bancarias personales, necesitarás un ITIN.',
      },
      { type: 'h2', text: '¿Qué es el ITIN y para qué sirve?' },
      {
        type: 'ul',
        items: [
          'Presentar declaraciones de impuestos personales (Form 1040-NR) ante el IRS',
          'Reclamar beneficios de tratados fiscales entre tu país y EE.UU.',
          'Recibir ciertos reembolsos del IRS',
          'Abrir cuentas bancarias personales en EE.UU. en algunos bancos que lo aceptan',
          'Requisito para ciertas licencias estatales o contratos',
          'Aplicar a crédito personal en EE.UU. (algunos prestamistas aceptan ITIN)',
        ],
      },
      { type: 'h2', text: '¿Necesitas ITIN si ya tienes EIN?' },
      {
        type: 'p',
        text: 'Depende. El EIN es el número fiscal de tu LLC — el ITIN es tu número fiscal personal. Para la mayoría de los dueños de LLC que solo operan la empresa, el EIN es suficiente. Necesitas ITIN si: tienes retenciones fiscales en EE.UU. que quieres reclamar, presentas una declaración personal de impuestos en EE.UU., o necesitas aplicar a ciertos servicios que exigen un número de identificación personal (no empresarial).',
      },
      { type: 'h2', text: '¿Quién califica para obtener el ITIN?' },
      {
        type: 'ul',
        items: [
          'Extranjeros no residentes con obligación de presentar declaración fiscal en EE.UU.',
          'Cónyuge o dependiente de un ciudadano o residente permanente de EE.UU.',
          'Estudiante, profesor o investigador extranjero en EE.UU. con ingresos sujetos a retención',
          'Extranjero no residente que reclama un treaty benefit',
          'Inversor extranjero en bienes raíces en EE.UU.',
        ],
      },
      { type: 'h2', text: 'Proceso para obtener el ITIN desde LATAM' },
      {
        type: 'ol',
        items: [
          'Verifica que calificas para el ITIN con base en uno de los criterios válidos del IRS.',
          'Completa el formulario W-7 ("Application for IRS Individual Taxpayer Identification Number"). Está disponible en IRS.gov. El formulario está en inglés pero puedes completarlo con ayuda.',
          'Reúne los documentos de identidad requeridos: pasaporte vigente (es el único documento que puede servir como prueba de identidad Y de estatus migratorio a la vez). Alternativamente, puedes usar combinaciones de hasta 13 tipos de documentos aceptados.',
          'Adjunta el documento que demuestra por qué necesitas el ITIN: típicamente una declaración de impuestos pendiente (Form 1040-NR) o una carta de withholding de un banco o pagador estadounidense.',
          'Envía el W-7 + documentos + declaración de impuestos (si aplica) al IRS por correo certificado o usa un Acceptance Agent autorizado.',
          'El IRS procesa la solicitud en aproximadamente 7 a 11 semanas (más tiempo en temporada de impuestos: enero a abril).',
          'Recibes tu ITIN por correo postal.',
        ],
      },
      { type: 'h2', text: 'Cómo obtener el ITIN sin enviar tu pasaporte original' },
      {
        type: 'p',
        text: 'El IRS normalmente requiere documentos originales o copias certificadas. Si no quieres enviar tu pasaporte original por correo internacional, tienes dos opciones: (1) usar un Certifying Acceptance Agent (CAA) en tu país — son agentes autorizados por el IRS que pueden verificar tus documentos y enviar copias certificadas sin que tengas que enviar los originales; o (2) visitar una embajada o consulado de EE.UU. en tu país para certificar los documentos.',
      },
      { type: 'h2', text: 'Acceptance Agents en México y LATAM' },
      {
        type: 'p',
        text: 'El IRS autoriza a ciertos profesionales (contadores, abogados, agencias especializadas) como Acceptance Agents o Certifying Acceptance Agents (CAA). Puedes encontrar la lista oficial en IRS.gov buscando "ITIN Acceptance Agent Program". En México hay varios CAAs en Ciudad de México, Guadalajara y Monterrey. En Colombia (Bogotá), Argentina (Buenos Aires) y otros países también hay opciones.',
      },
      { type: 'h2', text: 'Tiempos y vigencia del ITIN' },
      {
        type: 'table',
        headers: ['Aspecto', 'Detalle'],
        rows: [
          ['Tiempo de procesamiento', '7 a 11 semanas (hasta 14 semanas en temporada alta)'],
          ['Vigencia del ITIN', '3 años (vence si no se usa en 3 años consecutivos)'],
          ['Renovación', 'Gratuita — mismo proceso con W-7 marcado como "Renewal"'],
          ['Costo del ITIN', '$0 (el IRS no cobra) + costo del agente si usas CAA'],
          ['ITIN reemplaza al SSN', 'No — solo para efectos fiscales del IRS'],
        ],
      },
      {
        type: 'cta',
        text: '¿Necesitas orientación sobre el ITIN para tu LLC?',
        href: '/index_final.html?page=wizard&plan=premium',
        label: 'Consultar con nuestro equipo →',
      },
      {
        type: 'faq',
        items: [
          {
            q: '¿El ITIN me da permiso de trabajo en EE.UU.?',
            a: 'No. El ITIN es exclusivamente para propósitos fiscales del IRS. No es una visa, no otorga permiso de trabajo, no da estatus migratorio y no es válido como identificación para ningún propósito no fiscal.',
          },
          {
            q: '¿Puedo abrir una cuenta bancaria personal en EE.UU. con ITIN?',
            a: 'Algunos bancos como Citibank o bancos comunitarios aceptan ITIN para cuentas personales. Sin embargo, los bancos digitales (Chime, Mercury, etc.) generalmente requieren SSN para cuentas personales. Para cuentas empresariales, el EIN es suficiente.',
          },
          {
            q: '¿El ITIN y el EIN son lo mismo?',
            a: 'No. El EIN (Employer Identification Number) es el número fiscal de tu empresa (LLC o corporación). El ITIN es tu número fiscal personal como individuo extranjero. Son complementarios pero independientes.',
          },
          {
            q: '¿Tengo que pagar impuestos en EE.UU. si tengo ITIN?',
            a: 'Tener un ITIN no genera automáticamente obligación de pagar impuestos. El ITIN es una herramienta de identificación. Tu obligación fiscal depende de si tienes ingresos de fuente estadounidense o nexo fiscal en EE.UU.',
          },
          {
            q: '¿Cuánto cuesta obtener el ITIN con un Acceptance Agent?',
            a: 'El IRS no cobra por el ITIN, pero los Acceptance Agents cobran sus honorarios, que varían entre $100 y $400 USD dependiendo del agente y país. En nuestro Plan Premium incluimos orientación y referidos a CAAs de confianza en México y LATAM.',
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
