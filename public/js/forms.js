/* ═══════════════════════════════════════════════════════════════
   CreaTuEmpresaUSA — forms.js
   Real form handling: validation, Formspree, CRM webhook.
   Depends on: config.js (window.CONFIG)
   ═══════════════════════════════════════════════════════════════ */

window.FormsModule = (function () {

  /* ── Helpers ─────────────────────────────────────────────────── */

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function isValidPhone(phone) {
    return /^[\d\s\+\-\(\)]{7,20}$/.test(phone.trim());
  }

  /* ── Field validation ────────────────────────────────────────── */

  function validateField(field) {
    const val = field.value.trim();
    const name = field.name || field.id;
    let error = '';

    if (field.required && !val) {
      error = 'Este campo es requerido';
    } else if (val) {
      if (field.type === 'email' && !isValidEmail(val)) {
        error = 'Ingresa un email válido';
      } else if ((name === 'phone' || name === 'whatsapp') && !isValidPhone(val)) {
        error = 'Ingresa un teléfono válido';
      }
    }

    // Show/hide inline error
    let errEl = field.parentElement.querySelector('.field-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field-error';
      field.parentElement.appendChild(errEl);
    }
    errEl.textContent = error;
    field.classList.toggle('is-invalid', !!error);
    field.classList.toggle('is-valid', !error && !!val);
    return !error;
  }

  function validateForm(form) {
    const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    let valid = true;
    fields.forEach(f => {
      if (!validateField(f)) valid = false;
    });
    // Also check non-required filled fields
    form.querySelectorAll('input[type="email"]').forEach(f => {
      if (f.value && !isValidEmail(f.value)) {
        validateField(f);
        valid = false;
      }
    });
    return valid;
  }

  /* ── Build CRM-ready lead payload ────────────────────────────── */

  function buildLeadPayload(formData, extras = {}) {
    const data = {};
    for (const [key, val] of formData.entries()) {
      data[key] = val;
    }
    return {
      source:        'website',
      page:          window.location.pathname,
      timestamp:     new Date().toISOString(),
      plan:          extras.plan          || data.plan    || '',
      company_type:  extras.company_type  || data.type    || '',
      state:         extras.state         || data.state   || '',
      name:          data.nombre          || data.name    || '',
      email:         data.email           || '',
      phone:         data.phone           || data.whatsapp || '',
      country:       data.pais            || data.country || '',
      business_type: data.business_type   || '',
      message:       data.mensaje         || data.message || '',
      ...extras
    };
  }

  /* ── Submit to Formspree ─────────────────────────────────────── */

  async function submitToFormspree(payload) {
    const endpoint = window.CONFIG.FORMSPREE_ENDPOINT;
    if (!endpoint || endpoint.includes('YOUR_FORM_ID')) {
      console.warn('[forms.js] Formspree endpoint not configured. Set CONFIG.FORMSPREE_ENDPOINT.');
      return { ok: false, error: 'not_configured' };
    }
    try {
      const resp = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      return { ok: resp.ok, status: resp.status };
    } catch (err) {
      console.error('[forms.js] Formspree error:', err);
      return { ok: false, error: err.message };
    }
  }

  /* ── Submit to CRM webhook ───────────────────────────────────── */

  async function submitToCRM(payload) {
    const webhookUrl = window.CONFIG.CRM_WEBHOOK_URL;
    if (!webhookUrl) return; // silently skip if not configured
    try {
      await fetch(webhookUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('[forms.js] CRM webhook error (non-blocking):', err);
    }
  }

  /* ── UI state helpers ────────────────────────────────────────── */

  function setLoading(btn, loading) {
    if (loading) {
      btn.dataset.origText = btn.textContent;
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spinner"></span> Enviando…';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.origText || 'Enviar';
    }
  }

  function showSuccess(formEl, successEl) {
    if (formEl) formEl.style.display = 'none';
    if (successEl) {
      successEl.classList.add('show');
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function showError(formEl, message) {
    let errBanner = formEl.querySelector('.form-error-banner');
    if (!errBanner) {
      errBanner = document.createElement('div');
      errBanner.className = 'form-error-banner';
      formEl.prepend(errBanner);
    }
    errBanner.textContent = message || '⚠ Error al enviar. Intenta de nuevo o escríbenos por WhatsApp.';
    errBanner.style.display = 'block';
    setTimeout(() => { errBanner.style.display = 'none'; }, 8000);
  }

  /* ── Generic form handler ────────────────────────────────────── */

  async function handleSubmit(form, successEl, extras = {}) {
    if (!validateForm(form)) return false;

    const btn = form.querySelector('button[type="submit"]');
    setLoading(btn, true);

    const fd = new FormData(form);
    const payload = buildLeadPayload(fd, extras);

    // Run both in parallel; don't block on CRM
    const [result] = await Promise.all([
      submitToFormspree(payload),
      submitToCRM(payload)
    ]);

    setLoading(btn, false);

    if (result.ok || result.error === 'not_configured') {
      showSuccess(form, successEl);
      form.reset();
      return true;
    } else {
      showError(form, null);
      return false;
    }
  }

  /* ── Init: email capture form (index.html) ───────────────────── */

  function initCaptureForm() {
    const form    = document.getElementById('captureForm');
    const success = document.getElementById('captureSuccess');
    if (!form) return;

    // Set timestamp on submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const tsField = form.querySelector('[name="_timestamp"], [name="timestamp"]');
      if (tsField) tsField.value = new Date().toISOString();
      await handleSubmit(form, success, { source: 'capture_form' });
    });

    // Live validation
    form.querySelectorAll('input, select').forEach(f => {
      f.addEventListener('blur', () => validateField(f));
    });
  }

  /* ── Init: contact form (contacto.html) ─────────────────────── */

  function initContactForm() {
    const form    = document.getElementById('contactForm');
    const success = document.getElementById('contactSuccess');
    if (!form) return;

    // Pre-fill from URL params: ?plan=professional&state=delaware&type=llc
    const params = new URLSearchParams(window.location.search);
    const planParam  = params.get('plan');
    const stateParam = params.get('state');
    const typeParam  = params.get('type');

    if (planParam) {
      const sel = document.getElementById('planSelect');
      if (sel) {
        Array.from(sel.options).forEach(opt => {
          if (opt.value === planParam) opt.selected = true;
        });
      }
    }

    // Inject hidden fields for state/type if present
    if (stateParam) _injectHidden(form, 'state', stateParam);
    if (typeParam)  _injectHidden(form, 'company_type', typeParam);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const extras = {
        source: 'contact_form',
        plan:   planParam || '',
        state:  stateParam || '',
        company_type: typeParam || ''
      };
      await handleSubmit(form, success, extras);
    });

    form.querySelectorAll('input, select, textarea').forEach(f => {
      f.addEventListener('blur', () => validateField(f));
    });
  }

  function _injectHidden(form, name, value) {
    if (!form.querySelector(`[name="${name}"]`)) {
      const h = document.createElement('input');
      h.type  = 'hidden';
      h.name  = name;
      h.value = value;
      form.appendChild(h);
    }
  }

  /* ── Public API ──────────────────────────────────────────────── */

  function init() {
    initCaptureForm();
    initContactForm();
  }

  return {
    init,
    handleSubmit,
    validateForm,
    validateField,
    buildLeadPayload,
    submitToFormspree,
    submitToCRM
  };

})();
