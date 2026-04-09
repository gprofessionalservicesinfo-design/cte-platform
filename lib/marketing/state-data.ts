export const WA_URL = 'https://wa.me/19046248859'
export const PRICING_URL = '/index_final.html#pricing'
export const BRAND = 'CreaTuEmpresaUSA'

export interface StateData {
  name: string
  abbr: string
  slug: string
  stateFee: number
  processingTime: string
  annualFee: number | string
  tagline: string
  description: string
  metaTitle: string
  metaDescription: string
  advantages: string[]
  bestFor: string[]
  considerations: { title: string; detail: string }[]
  faqs: { q: string; a: string }[]
}

export const STATE_DATA: Record<string, StateData> = {
  florida: {
    name: 'Florida',
    abbr: 'FL',
    slug: 'florida',
    stateFee: 125,
    processingTime: '3–5 días hábiles',
    annualFee: 138.75,
    tagline: 'El hub de negocios hispano en EE.UU.',
    description:
      'Florida es el estado preferido por empresarios latinoamericanos. Sin impuesto sobre la renta estatal, conexión directa con América Latina y una comunidad de negocios activa en español.',
    metaTitle: 'Cómo crear una LLC en Florida | CreaTuEmpresaUSA',
    metaDescription:
      'Abre tu LLC en Florida desde Latinoamérica. Sin visa, sin SSN, 100% remoto. Proceso guiado en español. State fee $125. Comenzamos hoy.',
    advantages: [
      'Sin impuesto estatal sobre la renta personal',
      'Hub de negocios latinos — Miami, Orlando, Tampa',
      'Conexión directa con mercados de América Latina',
      'Ecosistema de startups activo y en crecimiento',
      'Gran comunidad hispanohablante para hacer networking',
    ],
    bestFor: ['E-commerce', 'Servicios digitales', 'Importación y exportación', 'Negocios con clientes latinos'],
    considerations: [
      {
        title: 'Annual Report obligatorio cada año',
        detail: 'Florida exige un Annual Report de $138.75 con vencimiento el 1 de mayo. Si no se paga a tiempo, el estado aplica una multa adicional de $400. Es el costo de mantenimiento más alto de los tres estados populares.',
      },
      {
        title: 'Registered Agent permanente requerido',
        detail: 'Tu LLC necesita un Registered Agent con domicilio físico en Florida en todo momento. Nuestros planes lo incluyen el primer año; el segundo año tiene costo de renovación.',
      },
      {
        title: 'Privacidad limitada de socios',
        detail: 'Florida publica los nombres de los miembros de la LLC en sus registros públicos. Si la privacidad de socios es una prioridad, Wyoming ofrece mayor protección.',
      },
      {
        title: 'No ideal como holding puro',
        detail: 'Florida es mejor para operación activa que para estructuras holding o de privacidad máxima. Para esos casos, Wyoming tiene ventajas estructurales superiores.',
      },
    ],
    faqs: [
      {
        q: '¿Necesito vivir en Florida para abrir una LLC allí?',
        a: 'No. Puedes abrir una LLC en Florida desde cualquier país sin necesidad de residencia, visa ni SSN. Solo necesitas un Registered Agent con domicilio en Florida, que nosotros incluimos en todos los planes.',
      },
      {
        q: '¿Cuánto cuesta mantener una LLC en Florida anualmente?',
        a: 'El Annual Report de Florida cuesta $138.75 y debe pagarse antes del 1 de mayo de cada año. Si no se paga a tiempo, el estado cobra una multa adicional.',
      },
      {
        q: '¿Cuánto tarda el proceso de formación en Florida?',
        a: 'Normalmente entre 3 y 5 días hábiles una vez que presentamos los documentos al estado. Puedes pagar por procesamiento acelerado si lo necesitas.',
      },
      {
        q: '¿Puedo abrir una cuenta bancaria en EE.UU. con mi LLC de Florida?',
        a: 'Sí. Con tu LLC formada y tu EIN obtenido, puedes abrir cuentas bancarias en bancos como Mercury, Relay o Bluevine, todos 100% remotos y disponibles para no residentes.',
      },
    ],
  },

  texas: {
    name: 'Texas',
    abbr: 'TX',
    slug: 'texas',
    stateFee: 300,
    processingTime: '3–5 días hábiles',
    annualFee: 0,
    tagline: 'La economía más grande sin impuesto sobre la renta.',
    description:
      'Texas no cobra impuesto estatal sobre la renta — ni personal ni corporativo. Es uno de los estados más favorables a los negocios, con un mercado enorme y acceso directo a México.',
    metaTitle: 'Cómo crear una LLC en Texas | CreaTuEmpresaUSA',
    metaDescription:
      'Forma tu LLC en Texas desde Latinoamérica. Sin impuesto sobre la renta estatal. 100% remoto, sin visa, sin SSN. Acompañamiento en español.',
    advantages: [
      'Sin impuesto estatal sobre la renta (personal ni corporativo)',
      'Economía equivalente a la 9ª más grande del mundo',
      'Sin Annual Report — solo Franchise Tax (generalmente $0 para ingresos bajos)',
      'Acceso directo al mercado de México y frontera norte',
      'Ambiente altamente favorable a los negocios y emprendedores',
    ],
    bestFor: ['E-commerce', 'Servicios B2B', 'Tecnología', 'Negocios con presencia o clientes en México'],
    considerations: [
      {
        title: 'State fee más alto de los tres',
        detail: 'El state fee inicial de $300 es el más elevado entre Florida, Texas y Wyoming. Es un costo único, no recurrente, pero debe considerarse al comparar opciones.',
      },
      {
        title: 'Franchise Tax report anual obligatorio',
        detail: 'Aunque para la mayoría de LLCs pequeñas el monto a pagar es $0, el reporte de Franchise Tax debe presentarse cada año antes del 15 de mayo. Omitirlo genera multas y puede llevar a la disolución de la LLC.',
      },
      {
        title: 'Privacidad de socios limitada',
        detail: 'Texas publica los nombres de los miembros registrados en la LLC. Si la privacidad de socios es un factor clave para ti, Wyoming ofrece protección significativamente mayor.',
      },
      {
        title: 'Registered Agent permanente requerido',
        detail: 'Obligatorio con domicilio físico en Texas en todo momento. Incluido en nuestros planes el primer año.',
      },
    ],
    faqs: [
      {
        q: '¿Texas realmente no cobra impuesto sobre la renta?',
        a: 'Correcto. Texas no tiene impuesto estatal sobre la renta personal ni corporativo. Es uno de los estados más eficientes fiscalmente para empresarios extranjeros.',
      },
      {
        q: '¿Qué es el Franchise Tax de Texas?',
        a: 'Es un impuesto sobre el margen de ganancias. Para la mayoría de LLCs con ingresos anuales menores a $2.47 millones, el Franchise Tax resulta en $0. LLCs pequeñas prácticamente no lo pagan.',
      },
      {
        q: '¿El state fee de $300 es el más alto?',
        a: 'Sí, es más alto que Wyoming o Florida. Sin embargo, la ausencia de Annual Report fee lo compensa a largo plazo, especialmente si planeas operar por varios años.',
      },
      {
        q: '¿Puedo abrir una LLC en Texas si mis clientes no están ahí?',
        a: 'Absolutamente. El estado donde formas tu LLC no necesita coincidir con donde están tus clientes. Texas es una opción fiscal y operativa, no una obligación geográfica.',
      },
    ],
  },

  wyoming: {
    name: 'Wyoming',
    abbr: 'WY',
    slug: 'wyoming',
    stateFee: 100,
    processingTime: '2–3 días hábiles',
    annualFee: 60,
    tagline: 'El estado favorito de negocios digitales internacionales.',
    description:
      'Wyoming combina el state fee más bajo, privacidad de socios, sólida protección de activos y cero impuesto sobre la renta. Es la opción más popular para negocios 100% digitales.',
    metaTitle: 'Cómo crear una LLC en Wyoming | CreaTuEmpresaUSA',
    metaDescription:
      'Abre tu LLC en Wyoming desde Latinoamérica. State fee $100, Annual Report $60, privacidad total de socios. 100% remoto. En español.',
    advantages: [
      'Sin impuesto estatal sobre la renta',
      'Annual Report mínimo de solo $60/año',
      'Privacidad: no publica nombres de miembros en registros públicos',
      'Una de las mejores protecciones de activos del país',
      'Mínima burocracia — ideal para negocios 100% digitales',
    ],
    bestFor: ['Negocios digitales sin sede física en EE.UU.', 'Holding companies', 'Protección de activos', 'Startups internacionales con inversionistas'],
    considerations: [
      {
        title: 'Ideal para negocios sin presencia física en EE.UU.',
        detail: 'Wyoming es perfecto para negocios 100% digitales. Si tienes empleados, local o clientes físicos en otro estado, puede que debas registrarte como empresa extranjera en ese estado (foreign qualification), lo que implica costos adicionales.',
      },
      {
        title: 'Annual Report según mes de aniversario',
        detail: 'El Annual Report no vence el mismo día para todos. Vence en el mes de aniversario de tu LLC, lo que puede ser fácil de olvidar. El fee mínimo es $60 y el retraso genera penalidades.',
      },
      {
        title: 'Registered Agent permanente requerido',
        detail: 'Obligatorio con domicilio físico en Wyoming. Incluido en nuestros planes el primer año.',
      },
      {
        title: 'Menor visibilidad de mercado local',
        detail: 'Wyoming no es un hub financiero ni comercial visible para clientes en EE.UU. Para banca esto no importa, pero si tus clientes valoran que operes "desde Florida" o "desde Texas", Wyoming puede generar preguntas.',
      },
    ],
    faqs: [
      {
        q: '¿Por qué Wyoming es tan popular para empresarios extranjeros?',
        a: 'Por su combinación única: costo inicial bajo ($100), Annual Report económico ($60), privacidad total de los miembros en registros públicos y cero impuesto sobre la renta. Es ideal si no tienes operaciones físicas en EE.UU.',
      },
      {
        q: '¿Es legal tener una LLC en Wyoming sin operar allí?',
        a: 'Sí, es completamente legal. No existe ningún requisito de residencia, presencia física ni operación dentro de Wyoming. La LLC solo necesita un Registered Agent en el estado, que nosotros proveemos.',
      },
      {
        q: '¿Cuánto cuesta el Annual Report en Wyoming?',
        a: 'El Annual Report tiene un fee mínimo de $60/año, calculado sobre el valor de los activos en Wyoming. Para la mayoría de LLCs pequeñas y digitales, es exactamente $60.',
      },
      {
        q: '¿Wyoming ofrece privacidad real para los socios?',
        a: 'Sí. A diferencia de otros estados, Wyoming no requiere divulgar públicamente los nombres de los miembros (owners) de la LLC. Los registros son mínimos y la privacidad está protegida por ley.',
      },
    ],
  },
}

export const STATES_LIST = Object.values(STATE_DATA)
