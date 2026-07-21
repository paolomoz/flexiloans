/**
 * cta-band — closing call-to-action band. Variants:
 *   (default / centered)  navy full-bleed band, centered h2 + lede + CTA row
 *   split                 plum rounded card, copy 7 | actions 5 (term-loan)
 *   bare                  plum band, button(s) only (cancelled-cheque)
 *
 * Authoring: single-cell rows (or one flattened cell), order tolerant:
 *   - optional <h2> (about-page card uses <h3>)
 *   - optional lede paragraph
 *   - CTA paragraphs, one button per <p>: <strong><a> primary,
 *     <em><strong><a> ghost (renders inverse on the dark band)
 *
 * DA may flatten rows into one cell; nodes are collected cell-wise and
 * classified by content (never by row index).
 */

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
  const nodes = collectNodes(block);

  const copy = document.createElement('div');
  copy.className = 'cta-band-copy';
  const actions = document.createElement('div');
  actions.className = 'cta-band-actions';

  nodes.forEach((el) => {
    if (el.matches('h1, h2, h3, h4')) {
      copy.append(el);
      return;
    }
    if (el.querySelector('a')) {
      actions.append(el);
      return;
    }
    if (el.textContent.trim()) {
      el.classList.add('cta-band-sub');
      copy.append(el);
    }
  });

  block.replaceChildren();
  if (copy.childElementCount) block.append(copy);
  if (actions.childElementCount) block.append(actions);
}
