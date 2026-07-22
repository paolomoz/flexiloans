/**
 * gst-calculator — interactive GST calculator for /calculators/gst-calculator.
 * Same card register as emi-calculator (ruled inputs | ice-wash result panel).
 *
 * Controls (live widget parity): amount (number box + range, 1–2,00,00,000),
 * mode segmented radios GST Exclusive (default) / GST Inclusive, rate
 * segmented radios 5% (default) / 12% / 18% / 28% (statutory slabs).
 * Recomputes live (the source widget computed on a Calculate click; the
 * resting figures below are identical either way).
 *
 * MATH (verbatim from the live widget's calculateGST()):
 *   inclusive:  base = amount / (1 + rate/100); gst = amount − base
 *   exclusive:  base = amount;                  gst = amount × rate/100
 *   total = base + gst
 * Live resting check (amount 1, 5%, exclusive): GST RS 0 · Post-GST RS 1.
 *
 * Authoring rows (all optional): heading row; keyed row
 * [amount | 1 | 20000000 | 1]; CTA row <p><strong><a>…</a></strong></p>
 * moved to the card foot.
 */

const fmtIN = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const AMOUNT = {
  label: 'Amount (in Rs)', min: 1, max: 20000000, value: 1, step: 1,
};
const RATES = [5, 12, 18, 28];
const MODES = [
  { key: 'exclusive', label: 'GST Exclusive', hint: 'Entered amount does not include GST' },
  { key: 'inclusive', label: 'GST Inclusive', hint: 'Entered amount includes GST' },
];

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

function readAuthoring(block) {
  const amount = { ...AMOUNT };
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
    if ((parts[0] || '').toLowerCase() !== 'amount') return;
    ['min', 'max', 'value'].forEach((prop, i) => {
      const n = parseFloat(String(parts[i + 1] || '').replace(/[^0-9.]/g, ''));
      if (Number.isFinite(n)) amount[prop] = n;
    });
    amount.value = Math.min(Math.max(amount.value, amount.min), amount.max);
  });
  return { amount, heading, cta };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** segmented radio group; returns the fieldset and calls onChange(value) */
function buildSegments(name, legendText, options, checkedValue, onChange) {
  const fieldset = el('fieldset', 'calc-segments');
  const legend = el('legend', '', legendText);
  fieldset.append(legend);
  const wrap = el('div', 'segment-row');
  options.forEach((opt) => {
    const label = el('label', 'segment');
    const input = el('input');
    input.type = 'radio';
    input.name = name;
    input.value = String(opt.value);
    if (String(opt.value) === String(checkedValue)) input.checked = true;
    input.addEventListener('change', () => {
      if (input.checked) onChange(opt.value);
    });
    label.append(input, el('span', '', opt.label));
    wrap.append(label);
  });
  fieldset.append(wrap);
  return fieldset;
}

export default function decorate(block) {
  instance += 1;
  const { amount, heading, cta } = readAuthoring(block);
  const state = { amount: amount.value, rate: 5, mode: 'exclusive' };

  // results — lead GST figure + base/total ledger rows
  const result = el('div', 'calc-result');
  const lead = el('div', 'result-lead');
  lead.setAttribute('aria-live', 'polite');
  const gstNum = el('p', 'num');
  lead.append(el('p', 'label', 'GST Amount'), gstNum);

  const rows = el('dl', 'result-rows');
  const figures = {};
  [['base', 'Pre-GST Amount'], ['total', 'Post-GST Amount']].forEach(([k, labelText]) => {
    const dRow = el('div');
    figures[k] = el('dd');
    dRow.append(el('dt', '', labelText), figures[k]);
    rows.append(dRow);
  });
  result.append(lead, rows);

  const render = () => {
    let base;
    let gst;
    if (state.mode === 'inclusive') {
      base = state.amount / (1 + state.rate / 100);
      gst = state.amount - base;
    } else {
      base = state.amount;
      gst = state.amount * (state.rate / 100);
    }
    gstNum.textContent = `Rs ${fmtIN.format(gst)}`;
    figures.base.textContent = `Rs ${fmtIN.format(base)}`;
    figures.total.textContent = `Rs ${fmtIN.format(base + gst)}`;
  };

  // inputs — amount row (box + range + scale), mode segments, rate segments
  const inputs = el('div', 'calc-inputs');
  const row = el('div', 'calc-row');
  const head = el('div', 'row-head');
  const rangeId = `gst-${instance}-amount`;
  const label = el('label', '', amount.label);
  label.setAttribute('for', rangeId);
  const box = el('input', 'calc-value');
  box.type = 'text';
  box.inputMode = 'numeric';
  box.autocomplete = 'off';
  box.setAttribute('aria-label', 'Amount value');
  head.append(label, box);

  const range = el('input');
  range.type = 'range';
  range.id = rangeId;
  range.min = String(amount.min);
  range.max = String(amount.max);
  range.step = String(amount.step);
  range.setAttribute('aria-label', 'Amount');

  const scale = el('div', 'calc-scale');
  scale.append(el('span', '', compact(amount.min)), el('span', '', compact(amount.max)));
  row.append(head, range, scale);
  inputs.append(row);

  const paint = () => {
    const span = amount.max - amount.min;
    const pct = span > 0 ? ((state.amount - amount.min) / span) * 100 : 0;
    range.style.setProperty('--range-progress', `${pct}%`);
  };
  const sync = () => {
    range.value = String(state.amount);
    box.value = fmtIN.format(state.amount);
    paint();
  };
  range.addEventListener('input', () => {
    state.amount = Number(range.value);
    box.value = fmtIN.format(state.amount);
    paint();
    render();
  });
  box.addEventListener('input', () => {
    const n = parseFloat(box.value.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n) && n >= amount.min && n <= amount.max) {
      state.amount = n;
      range.value = String(n);
      paint();
      render();
    }
  });
  box.addEventListener('change', () => {
    const n = parseFloat(box.value.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n)) state.amount = Math.min(Math.max(n, amount.min), amount.max);
    sync();
    render();
  });
  sync();

  const modeHint = el('p', 'segment-hint', MODES[0].hint);
  inputs.append(
    buildSegments(`gst-mode-${instance}`, 'GST applied on the amount', MODES.map((m) => ({ value: m.key, label: m.label })), 'exclusive', (v) => {
      state.mode = v;
      modeHint.textContent = MODES.find((m) => m.key === v).hint;
      render();
    }),
    modeHint,
    buildSegments(`gst-rate-${instance}`, 'GST Rate', RATES.map((r) => ({ value: r, label: `${r}%` })), 5, (v) => {
      state.rate = Number(v);
      render();
    }),
  );

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
