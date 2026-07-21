/**
 * req-table — definition-row requirements table (term-loan eligibility):
 * hairline-ruled rows of [th scope=row label] | [td value].
 *
 * Authoring: one row per requirement: [label] | [value]. Optionally a first
 * header row with an EMPTY label cell ([ ] | [Minimum Requirements]) becomes
 * the thead (matching the migrated design's column head).
 */

function cellContent(cell, tag, scope) {
  const el = document.createElement(tag);
  if (scope) el.setAttribute('scope', scope);
  if (cell) el.append(...cell.childNodes);
  return el;
}

export default function decorate(block) {
  if (block.querySelector(':scope > table')) return; // already decorated

  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  const rows = [...block.children];

  // optional column-header row: first row whose label cell is empty
  const first = rows[0] ? [...rows[0].children] : [];
  if (first.length > 1 && !first[0].textContent.trim() && first[1].textContent.trim()) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    first.forEach((cell) => tr.append(cellContent(cell, 'th', 'col')));
    thead.append(tr);
    table.append(thead);
    rows.shift();
  }

  rows.forEach((row) => {
    const cells = [...row.children];
    const tr = document.createElement('tr');
    tr.append(cellContent(cells[0], 'th', 'row'));
    cells.slice(1).forEach((cell) => tr.append(cellContent(cell, 'td')));
    tbody.append(tr);
  });

  table.append(tbody);
  block.replaceChildren(table);
}
