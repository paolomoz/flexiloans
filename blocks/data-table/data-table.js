/**
 * data-table — generic article table (imported WP/Astro article tables;
 * raw <table> in DA content is consumed as a block, so tables are authored
 * as this block instead). First authored row = column headers (navy thead,
 * rates-table register); remaining rows = data. Any column count. Cells may
 * carry inline markup (a/strong/em) — child nodes are moved, not re-texted.
 *
 * Authoring: one row per table row, one cell per column.
 */

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell) => {
      const td = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) td.setAttribute('scope', 'col');
      td.append(...cell.childNodes);
      tr.append(td);
    });
    (i === 0 ? thead : tbody).append(tr);
  });

  table.append(thead, tbody);
  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';
  // keyboard access for the horizontal scroller (axe scrollable-region-focusable)
  scroll.setAttribute('tabindex', '0');
  scroll.setAttribute('role', 'region');
  scroll.setAttribute('aria-label', 'Data table');
  scroll.append(table);
  block.replaceChildren(scroll);
}
