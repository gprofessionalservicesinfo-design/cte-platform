/* ═══════════════════════════════════════════════════════════════
   CreaTuEmpresaUSA — pricing.js
   Handles pricing CTAs: Stripe, Calendly, WhatsApp, Contact page.
   Depends on: config.js (window.CONFIG)
   ═══════════════════════════════════════════════════════════════ */

window.PricingModule = (function () {

  /* ── Build WhatsApp URL with prefilled message ───────────────── */
  function buildWhatsAppURL(planId, stateCode, companyType) {
    const num = window.CONFIG.WHATSAPP_NUMBER;
    if (!num || num === 'XXXXXXXXXXX') return '#';

    const plan = window.CONFIG.PLANS[planId] || {};
    let msg;

    if (planId && window.CONFIG.WA_MESSAGES[planId]) {
      msg = window.CONFIG.WA_MESSAGES[planId];
    } else if (planId === 'wizard') {
      msg = window.CONFIG.WA_MESSAGES.wizard
        .replace('{state}', stateCode || 'Delaware')
        .replace('{plan}', plan.name || 'Plan Professional');
    } else {
      msg = window.CONFIG.WA_MESSAGES.general;
    }

    // Append plan+state if provided
    if (stateCode && planId !== 'wizard') {
      msg += ` Estado: ${stateCode}`;
    }
    if (companyType) {
      msg += ` Tipo: ${companyType.toUpperCase()}`;
    }

    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  }

  /* ── Build contact page URL with prefilled params ────────────── */
  function buildContactURL(planId, stateCode, companyType) {
    const params = new URLSearchParams();
    if (planId)       params.set('plan',  planId);
    if (stateCode)    params.set('state', stateCode);
    if (companyType)  params.set('type',  companyType);
    const qs = params.toString();
    return `/contacto.html${qs ? '?' + qs : ''}`;
  }

  /* ── Get Stripe link for a plan ──────────────────────────────── */
  function getStripeLink(planId) {
    const map = {
      starter:      window.CONFIG.STRIPE_PAYMENT_LINK_STARTER,
      professional: window.CONFIG.STRIPE_PAYMENT_LINK_PRO,
      premium:      window.CONFIG.STRIPE_PAYMENT_LINK_PREMIUM
    };
    return map[planId] || '';
  }

  /* ── Handle a CTA click ──────────────────────────────────────── */
  function handleCTA(action, planId, stateCode, companyType) {
    switch (action) {
      case 'stripe': {
        const link = getStripeLink(planId);
        if (link && !link.includes('YOUR_STRIPE')) {
          window.open(link, '_blank', 'noopener');
        } else {
          // Fallback: contact page
          window.location.href = buildContactURL(planId, stateCode, companyType);
        }
        break;
      }
      case 'whatsapp': {
        const url = buildWhatsAppURL(planId, stateCode, companyType);
        if (url !== '#') window.open(url, '_blank', 'noopener');
        break;
      }
      case 'calendly': {
        const cal = window.CONFIG.CALENDLY_URL;
        if (cal && !cal.includes('YOUR_LINK')) {
          window.open(cal, '_blank', 'noopener');
        } else {
          window.location.href = buildContactURL(planId, stateCode, companyType);
        }
        break;
      }
      case 'contact':
      default: {
        window.location.href = buildContactURL(planId, stateCode, companyType);
        break;
      }
    }
  }

  /* ── Init: wire up all [data-cta] buttons ────────────────────── */
  function initPricingButtons() {
    document.querySelectorAll('[data-cta]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const action      = btn.dataset.cta;
        const planId      = btn.dataset.plan      || '';
        const stateCode   = btn.dataset.state     || '';
        const companyType = btn.dataset.type      || '';
        handleCTA(action, planId, stateCode, companyType);
      });
    });

    // Also handle legacy .plan-cta buttons
    document.querySelectorAll('.plan-cta').forEach(btn => {
      if (btn.dataset.plan) {
        btn.addEventListener('click', e => {
          e.preventDefault();
          const planId = btn.dataset.plan;
          // Try Stripe first, fallback to contact
          const stripeLink = getStripeLink(planId);
          if (stripeLink && !stripeLink.includes('YOUR_STRIPE')) {
            window.open(stripeLink, '_blank', 'noopener');
          } else {
            window.location.href = buildContactURL(planId);
          }
        });
      }
    });
  }

  /* ── Update all WhatsApp links ───────────────────────────────── */
  function initWhatsApp() {
    const num = window.CONFIG.WHATSAPP_NUMBER;
    if (!num || num === 'XXXXXXXXXXX') return;

    document.querySelectorAll('.wa-link').forEach(el => {
      // If already has a custom plan/state via data attribute, use that
      const planId    = el.dataset.plan;
      const stateCode = el.dataset.state;
      const msgKey    = el.dataset.msg;

      let url;
      if (planId) {
        url = buildWhatsAppURL(planId, stateCode);
      } else if (msgKey && window.CONFIG.WA_MESSAGES[msgKey]) {
        const msg = window.CONFIG.WA_MESSAGES[msgKey];
        url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
      } else {
        const msg = window.CONFIG.WA_MESSAGES.general;
        url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
      }
      el.href = url;
    });
  }

  /* ── Init Calendly links ─────────────────────────────────────── */
  function initCalendly() {
    const cal = window.CONFIG.CALENDLY_URL;
    document.querySelectorAll('.calendly-link').forEach(el => {
      if (cal && !cal.includes('YOUR_LINK')) {
        el.href = cal;
        el.target = '_blank';
        el.rel = 'noopener';
      } else {
        el.href = '/contacto.html';
      }
    });
  }

  function init() {
    initWhatsApp();
    initCalendly();
    initPricingButtons();
  }

  // Expose for inline usage
  window.handleCTA       = handleCTA;
  window.buildWhatsAppURL = buildWhatsAppURL;

  return {
    init,
    handleCTA,
    getStripeLink,
    buildWhatsAppURL,
    buildContactURL,
    initWhatsApp,
    initCalendly
  };

})();
