/**
 * hero — gradient split hero (7/5): eyebrow, h1, lede, dual CTA, merchant photo.
 *
 * Authoring rows (each one single-cell; order tolerant, decode is query-based):
 *   - eyebrow text (short line before the heading)
 *   - <h1> page headline
 *   - lede paragraph
 *   - CTAs, one per paragraph: <strong><a> primary (Apply Now),
 *     <em><a> secondary → styled ghost-inverse on the gradient (Check Eligibility)
 *   - <ul> of benefit checks → rendered as the white check-list (term-loan)
 *   - a SECOND heading (h2/h3 after the h1) opens the aside card (business-loan):
 *     it and every following non-page-media node land in .hero-card (paper card,
 *     right column) — icon, h2, p, <em><a> full-width secondary, tel text-link
 *   - hero image (<picture>/<img>); `cover` variant crops it full-bleed
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
  copy.className = 'hero-copy';
  const ctas = document.createElement('div');
  ctas.className = 'hero-ctas';
  const figure = document.createElement('div');
  figure.className = 'hero-figure';

  let heading = null;
  let card = null;
  nodes.forEach((el) => {
    const media = el.matches('picture, img') ? el : el.querySelector('picture, img');
    if (media) {
      // small icon inside the open card stays card content; page media → figure.
      // The icon is authored after the card h2 (an icon row before it would be
      // swallowed by the figure) but renders ABOVE the card title per design
      // truth (deploy-log finding 12).
      if (card && (media.getAttribute('width') === null || Number(media.getAttribute('width')) <= 64)) {
        card.prepend(el);
        return;
      }
      figure.append(media);
      return;
    }
    if (el.matches('h1, h2, h3')) {
      if (heading) {
        // second heading opens the aside card (business-loan apply-card)
        card = document.createElement('div');
        card.className = 'hero-card';
        card.append(el);
        return;
      }
      heading = el;
      copy.append(el);
      return;
    }
    if (card) {
      card.append(el);
      return;
    }
    if (el.matches('ul')) {
      el.classList.add('hero-checks');
      copy.append(el);
      return;
    }
    if (el.querySelector('a')) {
      ctas.append(el);
      return;
    }
    if (el.textContent.trim()) {
      el.classList.add(heading ? 'hero-lede' : 'hero-eyebrow');
      copy.append(el);
    }
  });
  if (ctas.childElementCount) copy.append(ctas);

  const grid = document.createElement('div');
  grid.className = 'hero-grid';
  grid.append(copy);
  if (card) grid.append(card);
  if (figure.childElementCount) grid.append(figure);
  block.replaceChildren(grid);
}
