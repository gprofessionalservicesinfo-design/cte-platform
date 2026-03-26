/* ═══════════════════════════════════════════════════════════════════
   CreaTuEmpresaUSA — wizard-order.js
   ORDER-FLOW LAYER

   Extracted from wizard.html to keep the inline script focused on UI.
   These functions have no DOM structure dependencies — they read from
   window.WIZ (state object) and window.CONFIG (config) at call time.

   ── DEPENDENCIES (set by wizard.html inline script before any user
      interaction, so they are always defined when called) ──────────
   window.WIZ               — wizard state object (type, state, plan, addons)
   window.getWizPlanData    — pricing helper (plan + state → fee breakdown)
   window.getSelectedAddons — returns selected addon array from WIZ.addons
   window.PRICING_CONFIG    — from /js/pricing-config.js
   window.CONFIG            — from /js/config.js
   window.Persistence       — from /js/persistence.js

   ── STORAGE KEYS ────────────────────────────────────────────────────
   localStorage:
     formation_order     canonical flat payload  wizard → checkout → success
   sessionStorage:
     wizOrderPayload     full webhook payload     fallback for success.html
     wizOrderRef         order reference string   CTE-YYYYMMDD-XXXX

   ── EXPOSED ON window ───────────────────────────────────────────────
   window.buildOrderPayload        — canonical flat payload builder
   window.buildWizardOrderPayload  — extends buildOrderPayload with meta
   window.getStripeCheckoutURL     — resolves Stripe link for a plan
   window.wizPay                   — checkout entry point (called by #wizPayBtn)
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  function isTestMode() {
    var h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.')
        || (window.CONFIG && window.CONFIG.TEST_MODE === true);
  }

  /* ══════════════════════════════════════════════════════════════════
     buildOrderPayload()
     ──────────────────────────────────────────────────────────────────
     Canonical flat order object.
     Used by:  wizPay()           → localStorage.formation_order
               buildWizardOrderPayload() → as the base, extended with meta
     Shape:
       { source, entity_type, state_code, state_name, package,
         service_fee, state_fee, addons[], addons_total,
         total_due_today, customer{}, timestamp }
   ══════════════════════════════════════════════════════════════════ */
  function buildOrderPayload() {
    var WIZ    = window.WIZ || {};
    var pd     = window.getWizPlanData ? window.getWizPlanData(WIZ.plan, WIZ.state) : { service: 0, stateFee: 0, total: 0 };
    var addons = window.getSelectedAddons ? window.getSelectedAddons() : [];
    var addonTotal = addons.reduce(function (s, a) { return s + a.price; }, 0);

    var g = function (id) { var el = document.getElementById(id); return el ? el.value || '' : ''; };

    return {
      source:          'wizard',
      entity_type:     WIZ.type     || 'llc',
      state_code:      WIZ.state    || '',
      state_name:      WIZ.stateName || '',
      package:         WIZ.plan     || 'professional',
      service_fee:     pd.service,
      state_fee:       pd.stateFee,
      addons:          addons,
      addons_total:    addonTotal,
      total_due_today: pd.total + addonTotal,
      customer: {
        full_name:     (g('wizName').trim()) || WIZ.name || '',
        email:         g('wizEmail').trim(),
        phone:         g('wizPhone').trim(),
        country:       g('wizCountry'),
        business_type: g('wizBusiness'),
        notes:         g('wizMessage').trim()
      },
      timestamp: new Date().toISOString()
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     buildWizardOrderPayload()
     ──────────────────────────────────────────────────────────────────
     Extends buildOrderPayload() with:
       • funnel_stage
       • future_annual_obligations  (obligations context for webhooks)
       • meta                       (UA, referrer, URL params)

     Used by:  wizard.html form submit → Formspree + ORDER_WEBHOOK_URL
     NOT used for localStorage — that uses the flat buildOrderPayload().

     Single source of data: delegates all pricing/customer computation
     to buildOrderPayload() — no duplication.
   ══════════════════════════════════════════════════════════════════ */
  function buildWizardOrderPayload() {
    var base = buildOrderPayload();
    var WIZ  = window.WIZ || {};
    var cfg  = window.PRICING_CONFIG;
    var stObj = cfg && WIZ.state ? cfg.states[WIZ.state.toUpperCase()] : null;

    /* Capture URL params for attribution */
    var qp = {};
    try { new URLSearchParams(window.location.search).forEach(function (v, k) { qp[k] = v; }); } catch (e) {}

    return Object.assign({}, base, {
      funnel_stage: 'review',
      future_annual_obligations: {
        annual_report_fee:        stObj ? (stObj.annualReport > 0 ? '$' + stObj.annualReport + '/año' : 'No requerido') : '~$10–$300/año',
        registered_agent_renewal: '$99/año',
        state_tax_note:           stObj ? (stObj.taxNote || stObj.annualTax || 'Varía por estado') : 'Varía por estado'
      },
      meta: {
        page:         'wizard',
        timestamp:    base.timestamp,
        user_agent:   navigator.userAgent || '',
        referrer:     document.referrer   || '',
        query_params: qp
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     getStripeCheckoutURL(plan)
     ──────────────────────────────────────────────────────────────────
     Returns the configured Stripe Payment Link for the given plan,
     or '' if not configured (triggers fallback to /contacto.html).
     Configure links in /js/config.js → STRIPE_PAYMENT_LINK_*.
   ══════════════════════════════════════════════════════════════════ */
  function getStripeCheckoutURL(plan) {
    var cfg = window.CONFIG;
    if (!cfg) return '';
    var map = {
      starter:      cfg.STRIPE_PAYMENT_LINK_STARTER || '',
      professional: cfg.STRIPE_PAYMENT_LINK_PRO     || '',
      premium:      cfg.STRIPE_PAYMENT_LINK_PREMIUM  || ''
    };
    var link = map[plan] || '';
    if (!link || link.includes('YOUR_STRIPE') || link.trim() === '') return '';
    return link;
  }

  /* ══════════════════════════════════════════════════════════════════
     wizPay()
     ──────────────────────────────────────────────────────────────────
     CHECKOUT ENTRY POINT — called by #wizPayBtn onclick="wizPay()".

     Flow:
       1. Build flat payload with buildOrderPayload()
       2. Save to localStorage.formation_order (checkout.html reads this)
       3. Save to sessionStorage.wizOrderPayload (success.html fallback)
       4. Redirect to /checkout.html
          checkout.html then: renders summary → user clicks Pagar ahora
          → submitFormationOrder() via Persistence → Stripe redirect

     WHY NOT GO DIRECTLY TO STRIPE:
       checkout.html gives the user a review step + calls submitFormationOrder()
       before Stripe, ensuring the order is persisted even if the user
       abandons the Stripe form.
   ══════════════════════════════════════════════════════════════════ */
  async function wizPay() {
    var btn = document.getElementById('wizPayBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Preparando pago…'; }

    var payload = buildOrderPayload();

    if (isTestMode()) {
      console.group('%c[CTE wizard-order] wizPay()', 'color:#0A2540;font-weight:700');
      console.log('Plan    :', payload.package);
      console.log('Total   :', payload.total_due_today);
      console.log('Payload :', JSON.parse(JSON.stringify(payload)));
      console.groupEnd();
    }

    /* Persist locally first — checkout.html and success.html both read from here */
    try { localStorage.setItem('formation_order', JSON.stringify(payload)); } catch (e) {}
    try { sessionStorage.setItem('wizOrderPayload', JSON.stringify(payload)); } catch (e) {}

    /* POST to ORDER_WEBHOOK_URL before redirecting to Stripe.
       Payload includes: customer name/email, state, entity type, package,
       service_fee, state_fee, addons, total_due_today, timestamp.
       User flow is never blocked — redirect happens regardless of result. */
    if (window.Persistence) {
      if (btn) btn.textContent = 'Registrando pedido…';
      await window.Persistence.submitFormationOrder(payload);
    }

    /* Route to checkout review page → Stripe */
    window.location.href = '/checkout.html';
  }

  /* ── Expose on window ─────────────────────────────────────────── */
  window.buildOrderPayload       = buildOrderPayload;
  window.buildWizardOrderPayload = buildWizardOrderPayload;
  window.getStripeCheckoutURL    = getStripeCheckoutURL;
  window.wizPay                  = wizPay;

}());
