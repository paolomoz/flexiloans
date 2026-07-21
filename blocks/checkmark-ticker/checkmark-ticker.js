/**
 * checkmark-ticker — navy strip of check chips separated by vertical rules,
 * directly under a loan-product hero (term-loan). One row per item (single
 * cell text); DA may flatten rows into one cell — every non-empty node
 * becomes an item. The check glyph is injected here (idempotent).
 */

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"/></svg>';

function collectNodes(block) {
  const out = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const kids = [...cell.children];
    if (kids.length) out.push(...kids);
    else if (cell.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = cell.textContent.trim();
      out.push(p);
    }
  });
  return out.length ? out : [...block.children];
}

export default function decorate(block) {
  if (block.querySelector(':scope > ul.ticker-row')) return; // idempotent

  const list = document.createElement('ul');
  list.className = 'ticker-row';

  collectNodes(block).forEach((el) => {
    if (!el.textContent.trim()) return;
    const li = document.createElement('li');
    li.insertAdjacentHTML('afterbegin', CHECK);
    li.append(document.createTextNode(' '), ...el.childNodes);
    list.append(li);
  });

  block.replaceChildren(list);
}
