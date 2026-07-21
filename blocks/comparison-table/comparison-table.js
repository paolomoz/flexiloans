/**
 * comparison-table — 4-col comparison table with the FlexiLoans column
 * highlighted and inline check/x marks (business-loan "FlexiLoans Vs. Other
 * Lenders").
 *
 * Authoring: first row = column headers (the FlexiLoans column — matched by
 * name, default 2nd — is highlighted), then one row per criterion:
 * [criterion] | [FlexiLoans] | [Banks] | [Other NBFCs]. A value cell starting
 * with "yes"/"no" (or a literal ✓/✗ character) gets an inline check/x SVG
 * injected before its text (idempotent — existing marks are left alone).
 */

const MARKS = {
  check: '<svg class="cell-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"/></svg>',
  cross: '<svg class="cell-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};

const YES_RE = /^(?:yes|✓|✔|☑)$/i;
const NO_RE = /^(?:no|✗|✘|×|x)$/i;

function markEl(name) {
  const tpl = document.createElement('template');
  tpl.innerHTML = MARKS[name];
  return tpl.content.firstElementChild;
}

/** inject a check/x mark when the cell text leads with a yes/no token */
function decorateMark(cell) {
  if (cell.querySelector('svg.cell-ic')) return; // idempotent
  const text = cell.textContent.trim();
  const [token] = text.split(/\s+/);
  if (!token) return;
  const mark = (YES_RE.test(token) && 'check') || (NO_RE.test(token) && 'cross');
  if (!mark) return;
  let rest = text.slice(token.length).trim();
  if (!rest && !/^(?:yes|no)$/i.test(token)) rest = mark === 'check' ? 'Yes' : 'No';
  const label = document.createElement('span');
  label.textContent = rest || `${token.charAt(0).toUpperCase()}${token.slice(1).toLowerCase()}`;
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
  scroll.append(table);
  block.replaceChildren(scroll);
}
