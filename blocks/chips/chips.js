/**
 * chips — icon feature rows on a tint band. Variants:
 *   (default)  2-col grid of horizontal rows (icon | title + copy) on lavender
 *   stacked    3-col grid of stacked items (large icon above title + copy)
 *   ice        section band paints ice-wash instead of lavender (styles.css)
 *
 * Authoring: section head as default content above the block.
 * One row per chip, two cells: [icon `:name:`] | [h3 + p].
 */

export default function decorate(block) {
  const large = block.classList.contains('stacked');

  [...block.children].forEach((row) => {
    row.className = 'chip-row';

    const icon = row.querySelector('span.icon');
    if (icon) {
      const chip = document.createElement('span');
      chip.className = `icon-chip on-tint${large ? ' lg' : ''}`;
      chip.setAttribute('aria-hidden', 'true');
      chip.append(icon);
      const iconCell = row.firstElementChild;
      if (iconCell && !iconCell.textContent.trim()) iconCell.replaceChildren(chip);
      else row.prepend(chip);
    }

    // normalize any h4 card titles to h3 (outline discipline)
    row.querySelectorAll('h4').forEach((h4) => {
      const h3 = document.createElement('h3');
      h3.append(...h4.childNodes);
      h4.replaceWith(h3);
    });
  });
}
