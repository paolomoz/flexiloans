/**
 * testimonials — lavender quote cards (3-up): optional kicker, quote mark,
 * blockquote, person.
 *
 * Authoring: section head as default content. One row per testimonial,
 * two cells: [optional kicker p + quote text] | [person].
 * The person cell is either [avatar image + name p + role p] (home) or, on
 * avatar-less pages (business-loan), the trailing text-only cell: first p =
 * name, following p(s) = role. A kicker is the leading all-<strong> p of the
 * quote cell; <strong>-wrapped kicker/name (the batch-A content workaround)
 * and plain authoring are both tolerated — the wrapper is unwrapped.
 * The quote-mark glyph is a fixed decorative asset injected by the block.
 */

const QUOTE_MARK = '/img/quote1.svg';

/** unwrap a paragraph whose sole content is one <strong> (content workaround) */
function unwrapStrong(p) {
  const only = p.firstElementChild;
  if (p.childElementCount === 1 && only?.tagName === 'STRONG'
    && only.textContent.trim() === p.textContent.trim()) {
    only.replaceWith(...only.childNodes);
  }
}

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'testi-grid';

  [...block.children].forEach((row) => {
    const card = document.createElement('figure');
    card.className = 'testi-card';

    const mark = document.createElement('img');
    mark.className = 'quote-mark';
    mark.src = QUOTE_MARK;
    mark.alt = '';
    mark.width = 36;
    mark.height = 28;
    mark.loading = 'lazy';

    const quote = document.createElement('blockquote');
    const person = document.createElement('figcaption');
    person.className = 'testi-person';
    const who = document.createElement('div');
    let kicker = null;

    const cells = [...row.children]
      .filter((cell) => cell.textContent.trim() || cell.querySelector('picture, img'));
    // person cell: the one carrying the avatar, else the trailing short-text cell
    const personCell = cells.find((cell) => cell.querySelector('picture, img'))
      || (cells.length > 1 ? cells[cells.length - 1] : null);

    cells.forEach((cell) => {
      if (cell === personCell) {
        const media = cell.querySelector('picture, img');
        if (media) person.append(media);
        const texts = [...cell.querySelectorAll('p')]
          .filter((p) => !p.querySelector('picture, img') && p.textContent.trim());
        texts.forEach((p, i) => {
          p.className = i === 0 ? 'name' : 'role';
          unwrapStrong(p);
          who.append(p);
        });
        return;
      }
      // leading all-<strong> paragraph followed by more copy = the kicker
      const first = cell.firstElementChild;
      if (!kicker && first?.tagName === 'P' && first.nextElementSibling
        && first.firstElementChild?.tagName === 'STRONG'
        && first.firstElementChild.textContent.trim() === first.textContent.trim()) {
        kicker = first;
        kicker.remove();
        kicker.className = 'testi-kicker';
        unwrapStrong(kicker);
      }
      quote.append(...cell.childNodes);
    });

    person.append(who);
    if (kicker) card.append(kicker);
    card.append(mark, quote, person);
    grid.append(card);
  });

  block.replaceChildren(grid);
}
