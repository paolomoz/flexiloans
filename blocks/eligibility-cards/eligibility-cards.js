/**
 * eligibility-cards — bordered icon cards (2-up): icon chip, h3, copy, text link.
 *
 * Authoring: section head (h2) is default content above the block.
 * One row per card, two cells: [icon `:name:`] | [h3 + p + plain <a> link].
 * Tolerates a flattened single-cell row (icon + h3 + p + a as siblings).
 */

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'elig-grid';

  [...block.children].forEach((row) => {
    const card = document.createElement('article');
    card.className = 'elig-card';

    const icon = row.querySelector('span.icon');
    if (icon) {
      const chip = document.createElement('span');
      chip.className = 'icon-chip';
      chip.setAttribute('aria-hidden', 'true');
      chip.append(icon);
      card.append(chip);
    }

    const body = document.createElement('div');
    [...row.querySelectorAll('h3, h4, p, ul')].forEach((el) => {
      if (el.querySelector('span.icon') && !el.textContent.trim()) return;
      if (el.matches('h4')) {
        const h3 = document.createElement('h3');
        h3.append(...el.childNodes);
        body.append(h3);
        return;
      }
      body.append(el);
    });
    card.append(body);
    grid.append(card);
  });

  block.replaceChildren(grid);
}
