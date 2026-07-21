/**
 * comparison-columns — 4 ruled columns with dash lists (term-loan "Term Loans
 * vs Other Financing Options"). NOT a table — the first column is the lead
 * (navy top rule, paper ground); the rest are ruled comparisons.
 *
 * Authoring: one row per column, cell(s) = [h3 + ul] (tolerates flattened
 * cells). Column count is flexible; the grid tracks the authored count.
 */

export default function decorate(block) {
  if (block.querySelector(':scope > .compare-grid')) return; // already decorated

  const grid = document.createElement('div');
  grid.className = 'compare-grid';

  [...block.children].forEach((row, i) => {
    const col = document.createElement('div');
    col.className = i === 0 ? 'compare-col lead' : 'compare-col';
    row.querySelectorAll(':scope > div').forEach((cell) => {
      if (cell.children.length) col.append(...cell.children);
      else if (cell.textContent.trim()) {
        const h3 = document.createElement('h3');
        h3.textContent = cell.textContent.trim();
        col.append(h3);
      }
    });
    // outline discipline: column titles are h3
    col.querySelectorAll('h2, h4').forEach((h) => {
      const h3 = document.createElement('h3');
      h3.append(...h.childNodes);
      h.replaceWith(h3);
    });
    grid.append(col);
  });

  block.replaceChildren(grid);
}
