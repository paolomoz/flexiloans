/**
 * comparison-table — 4-col comparison table with the FlexiLoans column
 * highlighted and inline check/x marks (business-loan "FlexiLoans Vs. Other
 * Lenders").
 *
 * Authoring: first row = column headers (the FlexiLoans column — matched by
 * name, default 2nd — is highlighted), then one row per criterion:
 * [criterion] | [FlexiLoans] | [Banks] | [Other NBFCs]. A value cell starting
 * with "yes"/"no" (or a literal ✓/✗ character) gets an inline check/x SVG
 * injected before its text, and "sometimes" (or △/⚠) gets an amber warning
 * triangle (idempotent — existing marks are left alone).
 */

const MARKS = {
  check: '<svg class="cell-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"/></svg>',
  cross: '<svg class="cell-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  warn: '<svg class="cell-ic warn" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
};

const YES_RE = /^(?:yes|✓|✔|☑)$/i;
const NO_RE = /^(?:no|✗|✘|×|x)$/i;
const WARN_RE = /^(?:sometimes|△|⚠|⚠️)$/i;
const FALLBACK_LABEL = { check: 'Yes', cross: 'No', warn: 'Sometimes' };

function markEl(name) {
  const tpl = document.createElement('template');
  tpl.innerHTML = MARKS[name];
  return tpl.content.firstElementChild;
}

/** inject a check/x/warning mark when the cell text leads with a known token */
function decorateMark(cell) {
  if (cell.querySelector('svg.cell-ic')) return; // idempotent
  const text = cell.textContent.trim();
  const [token] = text.split(/\s+/);
  if (!token) return;
  const mark = (YES_RE.test(token) && 'check') || (NO_RE.test(token) && 'cross')
    || (WARN_RE.test(token) && 'warn');
  if (!mark) return;
  let rest = text.slice(token.length).trim();
  if (!rest) {
    // bare token: word tokens keep their own (capitalised) text, glyphs get words
    rest = /^(?:yes|no|sometimes)$/i.test(token)
      ? `${token.charAt(0).toUpperCase()}${token.slice(1).toLowerCase()}`
      : FALLBACK_LABEL[mark];
  }
  const label = document.createElement('span');
  label.textContent = rest;
  cell.replaceChildren(markEl(mark), label);
}

function cellContent(cell, tag, scope) {
  const el = document.createElement(tag);
  if (scope) el.setAttribute('scope', scope);
  if (cell) el.append(...cell.childNodes);
  return el;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .table-scroll')) return; // already decorated

  const rows = [...block.children];
  const headCells = rows.length ? [...rows[0].children] : [];
  let flCol = headCells.findIndex((cell) => /flexiloans/i.test(cell.textContent));
  if (flCol < 0) flCol = 1;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  rows.forEach((row, i) => {
    const cells = [...row.children];
    const tr = document.createElement('tr');
    if (i === 0) {
      cells.forEach((cell, c) => {
        const th = cellContent(cell, 'th', 'col');
        if (c === flCol) th.classList.add('fl');
        tr.append(th);
      });
      thead.append(tr);
    } else {
      cells.forEach((cell, c) => {
        if (c === 0) {
          tr.append(cellContent(cell, 'th', 'row'));
          return;
        }
        const td = cellContent(cell, 'td');
        if (c === flCol) td.classList.add('fl');
        decorateMark(td);
        tr.append(td);
      });
      tbody.append(tr);
    }
  });

  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';
  // keyboard access for the horizontal scroller (axe scrollable-region-focusable)
  scroll.setAttribute('tabindex', '0');
  scroll.setAttribute('role', 'region');
  scroll.setAttribute('aria-label', 'Comparison table');
  scroll.append(table);
  block.replaceChildren(scroll);
}
