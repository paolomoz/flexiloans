/**
 * foreclosure-calculator — interactive foreclosure calculator for
 * /calculators/foreclosure-calculator. Same card register as emi-calculator
 * (ruled input rows | ice-wash result panel with SVG donut).
 *
 * Authoring rows (keyed, order tolerant; every row optional — spec defaults
 * apply): optional heading row; keyed 4-cell rows [key | min | max | default]
 * for amount / rate / tenure / paid; CTA row <p><strong><a>…</a></strong></p>
 * moved into the card foot.
 *
 * MATH — REDUCING BALANCE (verbatim from the live widget's calculate(); this
 * is the ONE amortizing calculator on the site — every EMI widget is flat):
 *   r = ratePa / 12 / 100
 *   EMI = P·r·(1+r)^n / ((1+r)^n − 1)
 *   interestTotal = EMI·n − P
 *   loop paid times: ip = balance·r; balance −= EMI − ip; interestPaid += ip
 *   interestSaved = interestTotal − interestPaid; foreclosure = balance
 * Live resting check (5,00,000 / 10% / 12m / 1 paid): EMI 43,958 · total
 * interest 27,495 · paid 4,167 · saved 23,329 · foreclosure 4,60,209.
 * "Installments Paid" max follows the tenure value (live parity).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const DONUT_R = 58;
const DONUT_CIRC = 2 * Math.PI * DONUT_R;
const fmtIN = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const SPEC = {
  amount: {
    label: 'Loan Amount', min: 50000, max: 50000000, value: 500000, step: 10000, valueAria: 'Loan amount value',
  },
  rate: {
    label: 'Interest Rate (per annum)', min: 6, max: 36, value: 10, step: 0.1, valueAria: 'Interest rate value',
  },
  tenure: {
    label: 'Tenure (months)', min: 12, max: 60, value: 12, step: 1, valueAria: 'Tenure value',
  },
  paid: {
    label: 'Installments Paid', min: 1, max: 60, value: 1, step: 1, valueAria: 'Installments paid value',
  },
};

let instance = 0;

function trimNum(x) {
  return String(parseFloat(x.toFixed(2)));
}

function compact(n) {
  if (n >= 1e7) return `${trimNum(n / 1e7)}cr`;
  if (n >= 1e5) return `${trimNum(n / 1e5)}L`;
  if (n >= 1e3) return `${trimNum(n / 1e3)}K`;
  return String(n);
}

function scaleText(key, n) {
  if (key === 'amount') return compact(n);
  if (key === 'rate') return `${n}%`;
  if (key === 'tenure') return `${n}m`;
  return String(n);
}

function boxText(key, v) {
  return key === 'amount' ? fmtIN.format(v) : String(v);
}

/** reducing-balance breakup — see file JSDoc */
function foreclosureBreakup(principal, ratePa, months, paidCount) {
  const r = ratePa / 12 / 100;
  const pow = (1 + r) ** months;
  const emi = (principal * r * pow) / (pow - 1);
  const interestTotal = emi * months - principal;
  let balance = principal;
  let interestPaid = 0;
  for (let i = 0; i < paidCount; i += 1) {
    const ip = balance * r;
    balance -= emi - ip;
    interestPaid += ip;
  }
  return {
    emi,
    interestTotal,
    interestPaid,
    interestSaved: interestTotal - interestPaid,
    foreclosure: balance,
  };
}

function readAuthoring(block) {
  const fields = {};
  Object.entries(SPEC).forEach(([k, f]) => { fields[k] = { ...f }; });
  let heading = null;
  let cta = null;
  [...block.children].forEach((row) => {
    const link = row.querySelector('a');
    if (link) {
      cta = link.closest('p') || link;
      return;
    }
    const h = row.querySelector('h1, h2, h3, h4');
    if (h) {
      heading = h;
      return;
    }
    const cells = [...row.children].map((c) => c.textContent.trim());
    const parts = cells.length > 1 ? cells : (cells[0] || row.textContent || '').split('|').map((s) => s.trim());
    const key = (parts[0] || '').toLowerCase();
    if (!fields[key]) return;
    ['min', 'max', 'value'].forEach((prop, i) => {
      const n = parseFloat(String(parts[i + 1] || '').replace(/[^0-9.]/g, ''));
      if (Number.isFinite(n)) fields[key][prop] = n;
    });
    const f = fields[key];
    f.value = Math.min(Math.max(f.value, f.min), f.max);
  });
  return { fields, heading, cta };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function buildDonut() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 160 160');
  svg.setAttribute('role', 'img');
  const track = document.createElementNS(SVG_NS, 'circle');
  const arc = document.createElementNS(SVG_NS, 'circle');
  [[track, 'donut-track'], [arc, 'donut-arc']].forEach(([c, cls]) => {
    c.setAttribute('cx', '80');
    c.setAttribute('cy', '80');
    c.setAttribute('r', String(DONUT_R));
    c.setAttribute('class', cls);
  });
  arc.setAttribute('transform', 'rotate(-90 80 80)');
  svg.append(track, arc);
  return { svg, arc };
}

export default function decorate(block) {
  instance += 1;
  const { fields, heading, cta } = readAuthoring(block);
  const state = {};
  Object.entries(fields).forEach(([k, f]) => { state[k] = f.value; });

  const result = el('div', 'calc-result');
  const lead = el('div', 'result-lead');
  lead.setAttribute('aria-live', 'polite');
  const emiNum = el('p', 'num');
  lead.append(el('p', 'label', 'Monthly EMI'), emiNum);

  const rows = el('dl', 'result-rows');
  const figures = {};
  [
    ['interestTotal', 'Interest Before Foreclosure*'],
    ['interestPaid', 'Interest Paid*'],
    ['interestSaved', 'Interest Saved*'],
    ['foreclosure', 'Foreclosure Amount*'],
  ].forEach(([k, labelText]) => {
    const dRow = el('div');
    figures[k] = el('dd');
    dRow.append(el('dt', '', labelText), figures[k]);
    rows.append(dRow);
  });

  const breakup = el('div', 'breakup');
  const { svg, arc } = buildDonut();
  const meta = el('div', 'breakup-meta');
  const legend = el('ul', 'breakup-legend');
  const legendFig = {};
  [['paid', 'Interest Paid'], ['saved', 'Interest Saved']].forEach(([k, name]) => {
    const li = el('li');
    legendFig[k] = el('strong');
    li.append(el('span', `dot ${k}`), document.createTextNode(`${name} · `), legendFig[k]);
    legend.append(li);
  });
  meta.append(el('p', 'label', 'Interest Breakup'), legend);
  breakup.append(svg, meta);
  result.append(lead, rows, breakup);

  const render = () => {
    const b = foreclosureBreakup(state.amount, state.rate, state.tenure, state.paid);
    emiNum.textContent = `Rs ${fmtIN.format(b.emi)}`;
    figures.interestTotal.textContent = `Rs ${fmtIN.format(b.interestTotal)}`;
    figures.interestPaid.textContent = `Rs ${fmtIN.format(b.interestPaid)}`;
    figures.interestSaved.textContent = `Rs ${fmtIN.format(b.interestSaved)}`;
    figures.foreclosure.textContent = `Rs ${fmtIN.format(b.foreclosure)}`;
    const share = b.interestTotal > 0 ? b.interestPaid / b.interestTotal : 0;
    const paidPct = (share * 100).toFixed(1);
    const savedPct = (100 - Number(paidPct)).toFixed(1);
    arc.setAttribute('stroke-dasharray', `${(share * DONUT_CIRC).toFixed(2)} ${DONUT_CIRC.toFixed(2)}`);
    svg.setAttribute('aria-label', `Interest breakup: paid ${paidPct} percent, saved ${savedPct} percent`);
    legendFig.paid.textContent = `${paidPct}%`;
    legendFig.saved.textContent = `${savedPct}%`;
  };

  const inputs = el('div', 'calc-inputs');
  const controls = {};
  Object.entries(fields).forEach(([key, f]) => {
    const row = el('div', 'calc-row');
    const head = el('div', 'row-head');
    const rangeId = `fc-${instance}-${key}`;
    const label = el('label', '', f.label);
    label.setAttribute('for', rangeId);
    const box = el('input', 'calc-value');
    box.type = 'text';
    box.inputMode = key === 'rate' ? 'decimal' : 'numeric';
    box.autocomplete = 'off';
    box.setAttribute('aria-label', f.valueAria);
    head.append(label, box);

    const range = el('input');
    range.type = 'range';
    range.id = rangeId;
    range.min = String(f.min);
    range.max = String(f.max);
    range.step = String(f.step);
    range.setAttribute('aria-label', f.label);

    const scale = el('div', 'calc-scale');
    const scaleMax = el('span', '', scaleText(key, f.max));
    scale.append(el('span', '', scaleText(key, f.min)), scaleMax);
    row.append(head, range, scale);
    inputs.append(row);

    const paint = () => {
      const max = Number(range.max);
      const pct = max > f.min ? ((state[key] - f.min) / (max - f.min)) * 100 : 0;
      range.style.setProperty('--range-progress', `${pct}%`);
    };
    const sync = () => {
      range.value = String(state[key]);
      box.value = boxText(key, state[key]);
      paint();
    };
    controls[key] = {
      range, scaleMax, paint, sync,
    };

    range.addEventListener('input', () => {
      state[key] = Number(range.value);
      box.value = boxText(key, state[key]);
      paint();
      // eslint-disable-next-line no-use-before-define
      clampPaid();
      render();
    });
    box.addEventListener('input', () => {
      const n = parseFloat(box.value.replace(/[^0-9.]/g, ''));
      if (Number.isFinite(n) && n >= f.min && n <= Number(range.max)) {
        state[key] = n;
        range.value = String(n);
        paint();
        // eslint-disable-next-line no-use-before-define
        clampPaid();
        render();
      }
    });
    box.addEventListener('change', () => {
      const n = parseFloat(box.value.replace(/[^0-9.]/g, ''));
      if (Number.isFinite(n)) state[key] = Math.min(Math.max(n, f.min), Number(range.max));
      sync();
      // eslint-disable-next-line no-use-before-define
      clampPaid();
      render();
    });
    sync();
  });

  /** installments-paid max follows the tenure (live parity) */
  function clampPaid() {
    const { paid } = controls;
    paid.range.max = String(state.tenure);
    paid.scaleMax.textContent = String(state.tenure);
    if (state.paid > state.tenure) {
      state.paid = state.tenure;
      paid.sync();
    } else {
      paid.paint();
    }
  }

  const grid = el('div', 'calc-grid');
  grid.append(inputs, result);

  block.replaceChildren();
  if (heading) {
    heading.classList.add('calc-heading');
    block.append(heading);
  }
  block.append(grid);
  if (cta) {
    const foot = el('div', 'calc-foot');
    foot.append(cta);
    block.append(foot);
  }
  clampPaid();
  render();
}
