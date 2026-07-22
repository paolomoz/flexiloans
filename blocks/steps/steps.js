/**
 * steps — hairline-ruled ordinal step ledger (ghost "01" numeral + h3 + copy).
 * Used across pages with 3–9 steps; the ledger form scales to any count.
 *
 * Authoring: one row per step, cell(s) = [h3 + p(s), optional ul].
 * The ordinal is injected by the block (zero-padded, aria-hidden) — a leading
 * authored "01" / "1." / "Step 1:" element or heading prefix is stripped so
 * authored numbering never doubles up.
 */

const ORDINAL_RE = /^(?:step\s*)?\d{1,2}\s*[.):]?$/i;
const HEAD_PREFIX_RE = /^(?:step\s*)?\d{1,2}\s*[.):]\s+/i;

/**
 * A step body carrying an EMI formula (p starting "EMI =", optional "Where,"
 * p, following ul of "X = definition" items) is composed into a .formula-card
 * panel with a dt/dd ledger — the design truth's lavender formula panel.
 */
function buildFormulaCard(body) {
  const formula = [...body.querySelectorAll(':scope > p')]
    .find((p) => /^EMI\s*=/.test(p.textContent.trim()));
  if (!formula) return;

  const card = document.createElement('div');
  card.className = 'formula-card';
  formula.before(card);
  formula.classList.add('formula');
  card.append(formula);

  let next = card.nextElementSibling;
  if (next && next.matches('p') && /^where\b/i.test(next.textContent.trim())) {
    next.classList.add('formula-where');
    card.append(next);
    next = card.nextElementSibling;
  }
  if (next && next.matches('ul')) {
    const dl = document.createElement('dl');
    [...next.children].forEach((li) => {
      const m = li.textContent.trim().match(/^(\S{1,3})\s*[=–—-]\s*(.+)$/);
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      if (m) {
        [, dt.textContent, dd.textContent] = m;
      } else {
        dd.textContent = li.textContent.trim();
      }
      row.append(dt, dd);
      dl.append(row);
    });
    next.remove();
    card.append(dl);
  }
}

function collectBody(row) {
  const body = document.createElement('div');
  body.className = 'step-body';
  row.querySelectorAll(':scope > div').forEach((cell) => {
    if (cell.children.length) body.append(...cell.children);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      body.append(p);
    }
  });
  return body;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .steps-list')) return; // already decorated

  const list = document.createElement('div');
  list.className = 'steps-list';

  [...block.children].forEach((row, i) => {
    const body = collectBody(row);

    // strip a standalone authored ordinal ("01", "1.", "Step 1")
    const first = body.firstElementChild;
    if (first && !first.matches('h1, h2, h3, h4') && ORDINAL_RE.test(first.textContent.trim())) {
      first.remove();
    }
    // strip an ordinal prefix baked into the heading text ("1. Fill the form")
    const heading = body.querySelector('h1, h2, h3, h4');
    if (heading && HEAD_PREFIX_RE.test(heading.textContent)) {
      const node = heading.firstChild;
      if (node && node.nodeType === Node.TEXT_NODE) {
        node.textContent = node.textContent.replace(HEAD_PREFIX_RE, '');
      }
    }

    buildFormulaCard(body);

    const ordinal = document.createElement('p');
    ordinal.className = 'step-ordinal';
    ordinal.setAttribute('aria-hidden', 'true');
    ordinal.textContent = String(i + 1).padStart(2, '0');

    const step = document.createElement('div');
    step.className = 'step';
    step.append(ordinal, body);
    list.append(step);
  });

  block.replaceChildren(list);
}
