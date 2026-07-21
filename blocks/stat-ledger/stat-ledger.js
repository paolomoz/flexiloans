/**
 * stat-ledger — asymmetric proof ledger on a plum band: one lead figure at
 * display scale + hairline-ruled secondary stats (anti-KPI-tile, canon).
 *
 * Authoring: one row per stat, two cells: [figure e.g. "₹ 7000+ Cr"] | [label].
 * The FIRST row is the lead. Tolerates single-cell rows split on the first
 * line break ("figure | label" as two paragraphs).
 */

function cellText(el) {
  return el ? el.textContent.trim() : '';
}

export default function decorate(block) {
  const band = document.createElement('div');
  band.className = 'stat-band';
  const rest = document.createElement('div');
  rest.className = 'stat-rest';

  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    let num = cellText(cells[0]);
    let label = cellText(cells[1]);
    if (!label && cells[0]) {
      // flattened: figure + label as two paragraphs in one cell
      const ps = [...cells[0].querySelectorAll('p')];
      if (ps.length >= 2) {
        num = ps[0].textContent.trim();
        label = ps.slice(1).map((p) => p.textContent.trim()).join(' ');
      }
    }
    const unit = document.createElement('div');
    unit.className = i === 0 ? 'stat-lead' : 'stat';
    const numEl = document.createElement('p');
    numEl.className = 'num';
    numEl.textContent = num;
    const labelEl = document.createElement('p');
    labelEl.className = 'label';
    labelEl.textContent = label;
    unit.append(numEl, labelEl);
    if (i === 0) band.append(unit);
    else rest.append(unit);
  });

  if (rest.childElementCount) band.append(rest);
  block.replaceChildren(band);
}
