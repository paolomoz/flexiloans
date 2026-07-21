/**
 * emi-calculator — REAL interactive business-loan EMI calculator. One
 * canonical block for /calculators/business-loan-emi-calculator (standalone
 * card docked under the page hero) and /business-loan (embedded instance,
 * section h2 = default content before the block).
 *
 * Layout follows the approved calculator-page card: hairline-ruled input rows
 * on the left (label + editable value box + range slider with progress fill),
 * ice-wash result panel on the right with a stat-ledger figure hierarchy
 * (lead Monthly EMI at display scale, ruled Principal / Interest / Total
 * rows), a hand-built two-segment SVG donut (navy principal arc over a paper
 * track, stroke-dasharray driven) and the authored Apply CTA centred under a
 * hairline foot rule.
 *
 * Authoring rows (keyed, order tolerant; every row optional — spec defaults
 * below apply when a row is missing so the block renders bare):
 *   - optional heading row (<h2>/<h3>), rendered above the card grid
 *   - up to three keyed data rows, 4 cells: [key | min | max | default]
 *       amount | 50000 | 10000000 | 50000
 *       rate   | 12    | 36       | 12
 *       tenure | 12    | 42       | 12
 *     (a flattened single-cell "amount | 50000 | 10000000 | 50000" text row
 *     is tolerated — cells are read via textContent, never querySelector('p'))
 *   - CTA row: <p><strong><a href="…">Apply Now for a Business Loan</a></strong></p>
 *     The AUTHORED anchor (already decorated to a.button.primary by
 *     decorateButtons) is moved into the card foot — never manufactured.
 *
 * MATH — flat vs reducing balance (investigated against the captured site):
 *   The live flexiloans.com widget — and the approved prototype's captured
 *   resting state (EMI Rs 4,667/mo, interest Rs 6,000, total Rs 56,000,
 *   donut 89.3% principal / 10.7% interest at 50000 / 12% p.a. / 12 months)
 *   — computes FLAT interest:
 *       interest = P × (R / 100) × (n / 12)
 *       total    = P + interest
 *       EMI      = total / n
 *   The standard reducing-balance formula
 *       E = P·r·(1+r)^n / ((1+r)^n − 1),  r = R / 1200
 *   would yield ₹4,442 at the same defaults and contradict the approved
 *   prototype, so this block renders FLAT math (see flatBreakup below).
 *   Figures use Indian digit grouping via Intl.NumberFormat('en-IN').
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const DONUT_R = 58;
const DONUT_CIRC = 2 * Math.PI * DONUT_R;
const fmtIN = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** spec defaults — overridden per-field by authored keyed rows */
const SPEC = {
  amount: {
    label: 'Loan Amount', min: 50000, max: 10000000, value: 50000, step: 10000, valueAria: 'Loan amount value',
  },
  rate: {
    label: 'Interest Rate (per annum)', min: 12, max: 36, value: 12, step: 1, valueAria: 'Interest rate value',
  },
  tenure: {
    label: 'Tenure (months)', min: 12, max: 42, value: 12, step: 1, valueAria: 'Tenure value',
  },
};

let instance = 0;

function trimNum(x) {
  return String(parseFloat(x.toFixed(2)));
}

/** compact scale caption: 50000 → "50K", 10000000 → "1cr" (per prototype) */
function compact(n) {
  if (n >= 1e7) return `${trimNum(n / 1e7)}cr`;
  if (n >= 1e5) return `${trimNum(n / 1e5)}L`;
  if (n >= 1e3) return `${trimNum(n / 1e3)}K`;
  return String(n);
}

/** spoken amount: 50000 → "50 thousand", 10000000 → "1 crore" */
function words(n) {
  if (n >= 1e7) return `${trimNum(n / 1e7)} crore`;
  if (n >= 1e5) return `${trimNum(n / 1e5)} lakh`;
  if (n >= 1e3) return `${trimNum(n / 1e3)} thousand`;
  return String(n);
}

function scaleText(key, n) {
  if (key === 'amount') return compact(n);
  return key === 'rate' ? `${n}%` : `${n}m`;
}

function rangeAria(key, f) {
  if (key === 'amount') return `Loan amount, ${words(f.min)} to ${words(f.max)}`;
  if (key === 'rate') return `Interest rate per annum, ${f.min} to ${f.max} percent`;
  return `Tenure in months, ${f.min} to ${f.max}`;
}

function boxText(key, v) {
  return key === 'amount' ? fmtIN.format(v) : String(v);
}

/** flat-interest breakup — matches the captured site widget (see file JSDoc) */
function flatBreakup(principal, ratePa, months) {
  const interest = (principal * (ratePa / 100) * months) / 12;
  const total = principal + interest;
  return { emi: total / months, interest, total };
}

/**
 * Decode authored rows. Keyed rows are read cell-wise by textContent
 * (the pipeline unwraps <p> in single-text cells); a row whose cells were
 * flattened into one is split on "|".
 */
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

/** two-segment donut: paper track circle + navy principal arc (dasharray) */
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

  // results panel — stat-ledger hierarchy on the ice-wash inset
  const result = el('div', 'calc-result');
  const lead = el('div', 'result-lead');
  lead.setAttribute('aria-live', 'polite');
  const emiNum = el('p', 'num');
  lead.append(el('p', 'label', 'Monthly EMI*'), emiNum);

  const rows = el('dl', 'result-rows');
  const figures = {};
  [['principal', 'Principal Amount'], ['interest', 'Interest Amount*'], ['total', 'Total Payable Amount*']].forEach(([k, labelText]) => {
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
  [['principal', 'Principal'], ['interest', 'Interest']].forEach(([k, name]) => {
    const li = el('li');
    legendFig[k] = el('strong');
    li.append(el('span', `dot ${k}`), document.createTextNode(`${name} · `), legendFig[k]);
    legend.append(li);
  });
  meta.append(el('p', 'label', 'Payment Breakup'), legend);
  breakup.append(svg, meta);
  result.append(lead, rows, breakup);

  const render = () => {
    const { emi, interest, total } = flatBreakup(state.amount, state.rate, state.tenure);
    emiNum.textContent = `Rs ${fmtIN.format(emi)}/mo`;
    figures.principal.textContent = `Rs ${fmtIN.format(state.amount)}`;
    figures.interest.textContent = `Rs ${fmtIN.format(interest)}`;
    figures.total.textContent = `Rs ${fmtIN.format(total)}`;
    const share = total > 0 ? state.amount / total : 1;
    const pPct = (share * 100).toFixed(1);
    const iPct = (100 - Number(pPct)).toFixed(1);
    arc.setAttribute('stroke-dasharray', `${(share * DONUT_CIRC).toFixed(2)} ${DONUT_CIRC.toFixed(2)}`);
    svg.setAttribute('aria-label', `Payment breakup: principal ${pPct} percent, interest ${iPct} percent`);
    legendFig.principal.textContent = `${pPct}%`;
    legendFig.interest.textContent = `${iPct}%`;
  };

  // inputs column — ruled rows: label + value box, range, min/max scale
  const inputs = el('div', 'calc-inputs');
  Object.entries(fields).forEach(([key, f]) => {
    const row = el('div', 'calc-row');
    const head = el('div', 'row-head');
    const rangeId = `emi-${instance}-${key}`;
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
    range.setAttribute('aria-label', rangeAria(key, f));

    const scale = el('div', 'calc-scale');
    scale.append(el('span', '', scaleText(key, f.min)), el('span', '', scaleText(key, f.max)));
    row.append(head, range, scale);
    inputs.append(row);

    const paint = () => {
      const pct = f.max > f.min ? ((state[key] - f.min) / (f.max - f.min)) * 100 : 0;
      range.style.setProperty('--range-progress', `${pct}%`);
    };
    const sync = () => {
      range.value = String(state[key]);
      box.value = boxText(key, state[key]);
      paint();
    };
    range.addEventListener('input', () => {
      state[key] = Number(range.value);
      box.value = boxText(key, state[key]);
      paint();
      render();
    });
    // typing: adopt in-range values live (slider follows); clamp on commit
    box.addEventListener('input', () => {
      const n = parseFloat(box.value.replace(/[^0-9.]/g, ''));
      if (Number.isFinite(n) && n >= f.min && n <= f.max) {
        state[key] = n;
        range.value = String(n);
        paint();
        render();
      }
    });
    box.addEventListener('change', () => {
      const n = parseFloat(box.value.replace(/[^0-9.]/g, ''));
      if (Number.isFinite(n)) state[key] = Math.min(Math.max(n, f.min), f.max);
      sync();
      render();
    });
    sync();
  });

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
  render();
}
