/**
 * contact-channels — the contact page's "other ways to reach us" 3x2 icon
 * cards (migrated/about-us/contact § reach-us): white cards on a lavender
 * band, ice icon chip, h3 + copy with tel:/mailto: links.
 *
 * Bespoke rather than chips `stacked`: these cards need paper card chrome
 * (background/radius/padding) that chips items don't carry.
 *
 * Authoring: one row per card, two cells:
 *   [<span class="icon icon-<name>"></span>] | [h3 + p(s), links allowed]
 * Icons: headset, mail, map-pin, users, newspaper, clock.
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'channel-card';

    const icon = row.querySelector('span.icon');
    if (icon) {
      const chip = document.createElement('span');
      chip.className = 'icon-chip';
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
