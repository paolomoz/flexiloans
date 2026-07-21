/**
 * product-cards — elevated paper cards (2-up): h3, copy, small primary CTA.
 *
 * Authoring: section head as default content. One row per card, single cell:
 * h3 + p(s) + <strong><a>Apply Now</a></strong> (buttonized by decorateButtons).
 */

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'product-grid';

  [...block.children].forEach((row) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    row.querySelectorAll(':scope > div').forEach((cell) => {
      card.append(...cell.childNodes);
    });
    // normalize h4 → h3
    card.querySelectorAll('h4').forEach((h4) => {
      const h3 = document.createElement('h3');
      h3.append(...h4.childNodes);
      h4.replaceWith(h3);
    });
    grid.append(card);
  });

  block.replaceChildren(grid);
}
