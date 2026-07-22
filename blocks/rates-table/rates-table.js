/**
 * rates-table — 2-col data table with a navy thead (interest rates & charges).
 *
 * Authoring: first row = the two column headers ([Fee / Charge] | [Details]),
 * then one row per fee/charge: [label] | [value]. Renders a real <table>
 * (th[scope=col] head, th[scope=row] labels) inside a horizontal scroller.
 */

function cellContent(cell, tag, scope) {
  const el = document.createElement(tag);
  if (scope) el.setAttribute('scope', scope);
  if (cell) el.append(...cell.childNodes);
  return el;
}

export default function decorate(block) {
  if (block.querySelector(':scope > .table-scroll')) return; // already decorated

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    const tr = document.createElement('tr');
    if (i === 0) {
      cells.forEach((cell) => tr.append(cellContent(cell, 'th', 'col')));
      thead.append(tr);
    } else {
      tr.append(cellContent(cells[0], 'th', 'row'));
      cells.slice(1).forEach((cell) => tr.append(cellContent(cell, 'td')));
      tbody.append(tr);
    }
  });

  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';
  // keyboard access for the horizontal scroller (axe scrollable-region-focusable)
  scroll.setAttribute('tabindex', '0');
  scroll.setAttribute('role', 'region');
  scroll.setAttribute('aria-label', 'Rates table');
  scroll.append(table);
  block.replaceChildren(scroll);
}
