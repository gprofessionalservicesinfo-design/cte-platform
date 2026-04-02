/* ═══════════════════════════════════════════════════════════════
   CreaTuEmpresaUSA — pricing-config.js
   SINGLE SOURCE OF TRUTH — edit prices here, they apply everywhere.
   Loaded by: precios.html, wizard.html
   ═══════════════════════════════════════════════════════════════ */

window.PRICING_CONFIG = {

  /* ── FEATURED STATE ────────────────────────────────────────────
     Default state shown on page load. Change to any key in states. */
  defaultState: 'CO',

  /* ── STATE FILING FEES ─────────────────────────────────────────
     fee:          one-time filing fee paid to the state government
     annualReport: yearly report fee (future obligation, not due today)
     annualTax:    yearly franchise / state tax note
     featured:     true = shown as recommended in selectors
     note:         short customer-facing note about the state         */
  states: {
    CO: {
      name: 'Colorado',   flag: '🏔️', fee: 50,
      annualReport: 10,   annualTax: '$10 biennial report (every 2 yrs)',
      taxNote: 'Sin franchise tax de LLC',
      featured: true,
      note: 'Tarifa más baja. Sin impuesto estatal de LLC.'
    },
    WY: {
      name: 'Wyoming',    flag: '🤠', fee: 62,
      annualReport: 62,   annualTax: 'Sin franchise tax de LLC',
      taxNote: 'Sin impuesto estatal de LLC',
      featured: false,
      note: 'Máxima privacidad. Sin impuesto de LLC.'
    },
    DE: {
      name: 'Delaware',   flag: '🏛️', fee: 140,
      annualReport: 300,  annualTax: '$300/año mínimo (franchise tax)',
      taxNote: 'Franchise tax desde $300/año',
      featured: false,
      note: 'Estándar para startups que buscan inversores VC.'
    },
    FL: {
      name: 'Florida',    flag: '🌴', fee: 125,
      annualReport: 138,  annualTax: '$138/año (annual report)',
      taxNote: 'Annual report $138/año',
      featured: false,
      note: 'Sin impuesto estatal de ingresos personales.'
    },
    TX: {
      name: 'Texas',      flag: '⭐', fee: 300,
      annualReport: 0,    annualTax: 'Sin franchise tax para ingresos < $1.23M',
      taxNote: 'Sin impuesto para ingresos bajos',
      featured: false,
      note: 'Sin impuesto de LLC si ingresos < $1.23M anuales.'
    },
    NM: {
      name: 'New Mexico', flag: '🌵', fee: 50,
      annualReport: 0,    annualTax: 'Sin reporte anual requerido',
      taxNote: 'Sin reporte anual',
      featured: false,
      note: 'Sin reporte anual. Mínima burocracia.'
    },
    /* ── Additional states ─────────────────────────────────────── */
    AZ: { name: 'Arizona',      flag: '🌵', fee: 50,  annualReport: 0,   annualTax: 'Sin reporte anual desde 2022', taxNote: 'Sin reporte anual', featured: false, note: 'Sin reporte anual desde 2022.' },
    CA: { name: 'California',   flag: '🌴', fee: 70,  annualReport: 800, annualTax: 'Franchise tax mínimo $800/año', taxNote: 'Franchise tax $800/año mínimo', featured: false, note: 'Mercado grande. Requiere franchise tax anual.' },
    GA: { name: 'Georgia',      flag: '🍑', fee: 100, annualReport: 50,  annualTax: 'Annual registration $50/año',  taxNote: 'Annual registration $50', featured: false, note: 'Proceso sencillo. Mercado en crecimiento.' },
    IL: { name: 'Illinois',     flag: '🏙️', fee: 150, annualReport: 75,  annualTax: 'Annual report $75',            taxNote: 'Annual report requerido', featured: false, note: 'Chicago. Mercado grande.' },
    NV: { name: 'Nevada',       flag: '🎰', fee: 425, annualReport: 350, annualTax: 'Annual list ~$350/año',        taxNote: 'Sin impuesto de ingresos', featured: false, note: 'Sin impuesto estatal de ingresos.' },
    NY: { name: 'New York',     flag: '🗽', fee: 200, annualReport: 9,   annualTax: 'Biennial statement $9 c/2 años', taxNote: 'Requiere publicar en periódico', featured: false, note: 'Requiere publicar en periódico (~$1,000).' },
    OR: { name: 'Oregon',       flag: '🌲', fee: 100, annualReport: 100, annualTax: 'Annual report $100',           taxNote: 'Annual report requerido', featured: false, note: 'Sin impuesto sobre ventas.' },
    WA: { name: 'Washington',   flag: '🌲', fee: 200, annualReport: 60,  annualTax: 'Annual report ~$60/año',       taxNote: 'Sin impuesto de ingresos personal', featured: false, note: 'Sin impuesto de ingresos personales.' },
    NC: { name: 'North Carolina',flag: '🌿',fee: 125, annualReport: 200, annualTax: 'Annual report $200',           taxNote: 'Annual report requerido', featured: false, note: 'Mercado en crecimiento en el sureste.' },
    VA: { name: 'Virginia',     flag: '🦅', fee: 100, annualReport: 50,  annualTax: 'Annual registration $50',      taxNote: 'Annual registration', featured: false, note: 'Cerca de D.C. Buena infraestructura.' },
    UT: { name: 'Utah',         flag: '🏔️', fee: 54,  annualReport: 18,  annualTax: 'Annual renewal $18',           taxNote: 'Annual renewal bajo', featured: false, note: 'Costo bajo. Fuerte ecosistema tech.' },
    MT: { name: 'Montana',      flag: '🦌', fee: 35,  annualReport: 15,  annualTax: 'Annual report $15',            taxNote: 'Sin impuesto sobre ventas', featured: false, note: 'Sin impuesto sobre ventas. Costo bajo.' },
    SD: { name: 'South Dakota', flag: '🦬', fee: 150, annualReport: 50,  annualTax: 'Annual report $50',            taxNote: 'Sin impuesto de ingresos', featured: false, note: 'Sin impuesto de ingresos estatal.' }
  },

  /* ── PLAN SERVICE FEES ─────────────────────────────────────────
     serviceFee = the fee we charge (state fee is added separately)
     Plan total displayed = serviceFee + states[selectedState].fee    */
  plans: {
    basic: {
      id: 'basic', label: 'Basic', name: 'Plan Basic',
      serviceFee: 499   /* EDIT: our service fee for Basic */
    },
    growth: {
      id: 'growth', label: 'Growth', name: 'Plan Growth',
      serviceFee: 799,  /* EDIT: our service fee for Growth */
      popular: true
    },
    premium: {
      id: 'premium', label: 'Premium', name: 'Plan Premium',
      serviceFee: 1200  /* EDIT: our service fee for Premium */
    }
  },

  /* ── ADD-ON PRICES ─────────────────────────────────────────────
     Edit price values here. The HTML data-price attrs stay in sync
     automatically on page load (see initPricingConfig()).
     includedIn: plan IDs where this add-on is already included.     */
  addons: {
    ein:          { price: 99,  period: '',     label: 'Tramitación de EIN',                      includedIn: ['basic','growth','premium'] },
    regAgent:     { price: 99,  period: '/año', label: 'Registered Agent (renovación año 2+)',    includedIn: ['basic','growth','premium'] }, /* 1st year always included */
    opAgreement:  { price: 79,  period: '',     label: 'Operating Agreement completo',             includedIn: ['growth','premium'] },
    addrStd:      { price: 39,  period: '/mes', label: 'Business Address Standard',               includedIn: ['premium'] },
    banking:      { price: 79,  period: '',     label: 'Asesoría apertura bancaria',               includedIn: ['growth','premium'] },
    certCopy:     { price: 49,  period: '',     label: 'Copia certificada',                        includedIn: [] },
    goodStanding: { price: 49,  period: '',     label: 'Certificate of Good Standing',             includedIn: [] },
    compliance:   { price: 49,  period: '/año', label: 'Recordatorios de compliance',              includedIn: ['premium'] },
    itin:         { price: 149, period: '',     label: 'Asistencia para ITIN',                     includedIn: [] }
  },

  /* ── FUTURE ANNUAL OBLIGATIONS ─────────────────────────────────
     Shown in Section C. NEVER added to "total due today".
     State-specific annual report data comes from states[] above.    */
  obligations: {
    raRenewal:    { label: 'Renovación Registered Agent',      amount: '$99/año'              }, /* EDIT */
    federalForms: { label: 'Declaraciones fiscales federales', amount: 'Varía por actividad'  }
  }
};

/* ── Helper: get state fee for a given state code ────────────── */
window.PRICING_CONFIG.getStateFee = function(stateCode) {
  var st = this.states[(stateCode || this.defaultState).toUpperCase()];
  return st ? st.fee : 62;
};

/* ── Helper: compute plan total for a plan + state ───────────── */
window.PRICING_CONFIG.getPlanTotal = function(planId, stateCode) {
  var plan = this.plans[planId];
  if (!plan) return 0;
  return plan.serviceFee + this.getStateFee(stateCode);
};
