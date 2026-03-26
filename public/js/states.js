/* ═══════════════════════════════════════════════════════════════
   CreaTuEmpresaUSA — states.js
   50-state database, state selector tool, recommendation engine.
   Depends on: /data/states.json
   ═══════════════════════════════════════════════════════════════ */

window.StatesModule = (function () {

  let _statesData = null;

  /* ── Load states.json ────────────────────────────────────────── */
  async function loadStates() {
    if (_statesData) return _statesData;
    try {
      const resp = await fetch('/data/states.json');
      if (!resp.ok) throw new Error('Failed to load states.json');
      _statesData = await resp.json();
      return _statesData;
    } catch (err) {
      console.error('[states.js] Could not load states.json:', err);
      return null;
    }
  }

  function getState(code) {
    if (!_statesData) return null;
    return _statesData.states.find(s => s.code === code);
  }

  function getFeaturedStates() {
    if (!_statesData) return [];
    return _statesData.featured
      .map(code => getState(code))
      .filter(Boolean);
  }

  function getAllStates() {
    if (!_statesData) return [];
    return _statesData.states;
  }

  /* ── Recommendation engine ───────────────────────────────────── */
  function recommendState(answers) {
    // answers: { goal, privacy, low_cost, us_presence, vc_funding }
    const { goal, privacy, low_cost, us_presence, vc_funding } = answers;

    // VC / startup → Delaware
    if (vc_funding || goal === 'startup') {
      return {
        primary: 'DE',
        reason: 'Delaware es el estándar para startups que buscan capital VC. Los inversores lo prefieren.',
        alternatives: ['WY', 'FL']
      };
    }

    // Physical presence in a specific state
    if (us_presence) {
      return {
        primary: 'FL',
        reason: 'Si tienes presencia física en EE.UU., registrar en Florida (o en el estado donde operas) simplifica el compliance.',
        alternatives: ['DE', 'TX']
      };
    }

    // Max privacy
    if (privacy && !low_cost) {
      return {
        primary: 'WY',
        reason: 'Wyoming ofrece la mayor privacidad de EE.UU. con leyes de protección de miembros de LLC.',
        alternatives: ['NV', 'NM']
      };
    }

    // Min cost (absolute)
    if (low_cost && !privacy) {
      return {
        primary: 'NM',
        reason: 'New Mexico tiene $0 en costos anuales (sin reporte anual requerido). El más económico de EE.UU.',
        alternatives: ['WY', 'MT']
      };
    }

    // Privacy + low cost (freelancer/consultant)
    if (privacy && low_cost) {
      return {
        primary: 'WY',
        reason: 'Wyoming combina la mejor privacidad con costos bajos (~$62/año). La primera opción para freelancers.',
        alternatives: ['NM', 'SD']
      };
    }

    // E-commerce / Amazon
    if (goal === 'ecommerce') {
      return {
        primary: 'WY',
        reason: 'Para e-commerce y Amazon FBA, Wyoming ofrece privacidad, bajo costo y sin impuesto estatal.',
        alternatives: ['DE', 'NM']
      };
    }

    // Holding / asset protection
    if (goal === 'holding') {
      return {
        primary: 'DE',
        reason: 'Delaware tiene el marco legal más sólido para holding companies y protección de activos.',
        alternatives: ['NV', 'SD']
      };
    }

    // Default: Wyoming (best balance)
    return {
      primary: 'WY',
      reason: 'Wyoming es la opción más equilibrada: privacidad, bajo costo y sin impuesto estatal.',
      alternatives: ['DE', 'NM']
    };
  }

  /* ── Render a state card ─────────────────────────────────────── */
  function renderStateCard(state, el) {
    if (!state || !el) return;
    const isFeatured = _statesData && _statesData.featured.includes(state.code);
    el.innerHTML = `
      <div class="state-card ${isFeatured ? 'state-card--featured' : ''}">
        <div class="state-card__header">
          <span class="state-card__flag">${state.flag || '🏛️'}</span>
          <div>
            <div class="state-card__name">${state.name}</div>
            <div class="state-card__code">${state.code}</div>
          </div>
          ${state.popular_for_non_residents ? '<span class="state-badge">Popular</span>' : ''}
        </div>
        <div class="state-card__stats">
          <div class="state-stat">
            <span class="state-stat__label">Costo anual</span>
            <span class="state-stat__value">$${state.annual_fee_usd}/año</span>
          </div>
          <div class="state-stat">
            <span class="state-stat__label">Impuesto estatal</span>
            <span class="state-stat__value">${state.state_income_tax}</span>
          </div>
          <div class="state-stat">
            <span class="state-stat__label">Privacidad</span>
            <span class="state-stat__value privacy-${state.privacy_level.toLowerCase()}">${state.privacy_level}</span>
          </div>
          <div class="state-stat">
            <span class="state-stat__label">Procesamiento</span>
            <span class="state-stat__value">${state.processing_time}</span>
          </div>
        </div>
        <p class="state-card__summary">${state.best_for_summary}</p>
        ${state.pros ? `
        <ul class="state-card__pros">
          ${state.pros.slice(0,3).map(p => `<li>✅ ${p}</li>`).join('')}
        </ul>` : ''}
        ${state.cons && state.cons.length ? `
        <ul class="state-card__cons">
          ${state.cons.slice(0,2).map(c => `<li>⚠️ ${c}</li>`).join('')}
        </ul>` : ''}
        <a href="/contacto.html?state=${state.code.toLowerCase()}"
           class="btn btn-ghost btn-sm" style="margin-top:14px;width:100%;justify-content:center">
          Abrir LLC en ${state.name} →
        </a>
      </div>`;
  }

  /* ── Populate a <select> with all 50 states ──────────────────── */
  function populateStateSelect(selectEl, opts = {}) {
    if (!selectEl || !_statesData) return;
    const { placeholder = 'Selecciona un estado', featuredFirst = true } = opts;

    selectEl.innerHTML = `<option value="">${placeholder}</option>`;

    if (featuredFirst) {
      const optGroup = document.createElement('optgroup');
      optGroup.label = '⭐ Más populares para no residentes';
      getFeaturedStates().forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.code;
        opt.textContent = `${s.flag || ''} ${s.name} (~$${s.annual_fee_usd}/año)`;
        optGroup.appendChild(opt);
      });
      selectEl.appendChild(optGroup);

      const otherGroup = document.createElement('optgroup');
      otherGroup.label = 'Todos los estados';
      getAllStates()
        .filter(s => !_statesData.featured.includes(s.code))
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.code;
          opt.textContent = `${s.name}`;
          otherGroup.appendChild(opt);
        });
      selectEl.appendChild(otherGroup);
    } else {
      getAllStates()
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.code;
          opt.textContent = s.name;
          selectEl.appendChild(opt);
        });
    }
  }

  /* ── State Selector Tool ─────────────────────────────────────── */
  function initStateTool() {
    const toolEl = document.getElementById('stateSelectorTool');
    if (!toolEl) return;

    const form  = toolEl.querySelector('#stateQuizForm');
    const result = toolEl.querySelector('#stateQuizResult');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      await loadStates();

      const fd = new FormData(form);
      const answers = {
        goal:        fd.get('goal')        || '',
        privacy:     fd.get('privacy')     === 'yes',
        low_cost:    fd.get('low_cost')    === 'yes',
        us_presence: fd.get('us_presence') === 'yes',
        vc_funding:  fd.get('vc_funding')  === 'yes'
      };

      const rec = recommendState(answers);
      const primary = getState(rec.primary);
      const alts = rec.alternatives.map(c => getState(c)).filter(Boolean);

      if (!result) return;
      result.innerHTML = `
        <div class="quiz-result rv">
          <div class="quiz-result__header">
            <div class="tag">Tu recomendación</div>
            <h3 class="section-title" style="font-size:1.6rem;margin-bottom:8px">
              ${primary.flag} ${primary.name} es tu mejor opción
            </h3>
            <p style="color:var(--gray-500)">${rec.reason}</p>
          </div>

          <div class="quiz-result__cards">
            <div id="primaryStateCard"></div>
          </div>

          ${alts.length ? `
          <div style="margin-top:32px">
            <h4 style="font-size:14px;font-weight:700;color:var(--gray-500);text-transform:uppercase;letter-spacing:.08em;margin-bottom:16px">
              También considera
            </h4>
            <div class="quiz-alts">
              ${alts.map(s => `
                <div class="quiz-alt-card">
                  <span style="font-size:24px">${s.flag || '🏛️'}</span>
                  <div>
                    <div style="font-weight:700">${s.name}</div>
                    <div style="font-size:12px;color:var(--gray-500)">$${s.annual_fee_usd}/año · ${s.privacy_level} privacidad</div>
                  </div>
                </div>`).join('')}
            </div>
          </div>` : ''}

          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:28px">
            <a href="/contacto.html?state=${primary.code.toLowerCase()}" class="btn btn-primary">
              Abrir LLC en ${primary.name} →
            </a>
            <a href="#" class="btn btn-wa wa-link" target="_blank" rel="noopener">
              💬 Consultar por WhatsApp
            </a>
          </div>
        </div>`;

      const cardEl = result.querySelector('#primaryStateCard');
      if (cardEl) renderStateCard(primary, cardEl);

      result.style.display = 'block';
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Re-trigger reveal animation
      if (window.initReveal) window.initReveal();
      // Re-init WA links
      if (window.PricingModule) window.PricingModule.initWhatsApp();
    });

    // Reset
    const resetBtn = toolEl.querySelector('#stateQuizReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        if (result) { result.style.display = 'none'; result.innerHTML = ''; }
      });
    }
  }

  /* ── Compare states table ────────────────────────────────────── */
  function initStateCompare() {
    const compareEl = document.getElementById('stateCompareTable');
    if (!compareEl || !_statesData) return;

    const codes = _statesData.featured;
    const states = codes.map(c => getState(c)).filter(Boolean);

    const rows = [
      { label: 'Costo de formación', fn: s => `$${s.filing_fee_usd}` },
      { label: 'Costo anual',        fn: s => `$${s.annual_fee_usd}/año` },
      { label: 'Impuesto estatal',   fn: s => s.state_income_tax },
      { label: 'Franchise tax',      fn: s => s.franchise_tax },
      { label: 'Privacidad',         fn: s => s.privacy_level },
      { label: 'Reporte anual',      fn: s => s.annual_report_required ? `Sí (${s.annual_report_due})` : 'No' },
      { label: 'Procesamiento',      fn: s => s.processing_time },
    ];

    compareEl.innerHTML = `
      <div style="overflow-x:auto;border-radius:var(--r-lg);box-shadow:var(--sh-md)">
        <table style="width:100%;border-collapse:collapse;background:#fff;min-width:600px">
          <thead>
            <tr style="background:var(--navy)">
              <th style="padding:14px 18px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#fff;white-space:nowrap">Criterio</th>
              ${states.map(s => `
              <th style="padding:14px 18px;text-align:center;font-size:13px;font-weight:700;color:#fff">
                ${s.flag || ''} ${s.name}
              </th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, i) => `
            <tr style="${i % 2 === 0 ? 'background:#f8fafc' : 'background:#fff'};border-bottom:1px solid var(--gray-200)">
              <td style="padding:12px 18px;font-size:13px;font-weight:600;color:var(--navy);white-space:nowrap">${row.label}</td>
              ${states.map(s => `
              <td style="padding:12px 18px;font-size:13px;color:var(--gray-500);text-align:center">${row.fn(s)}</td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  /* ── Public init ─────────────────────────────────────────────── */
  async function init() {
    await loadStates();

    // Populate any state selects on the page
    document.querySelectorAll('[data-state-select]').forEach(sel => {
      populateStateSelect(sel, { featuredFirst: true });
    });

    initStateTool();
    initStateCompare();
  }

  return {
    init,
    loadStates,
    getState,
    getFeaturedStates,
    getAllStates,
    recommendState,
    renderStateCard,
    populateStateSelect
  };

})();
