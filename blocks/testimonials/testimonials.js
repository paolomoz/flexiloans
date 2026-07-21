/**
 * testimonials — lavender quote cards (3-up): quote mark, blockquote, person.
 *
 * Authoring: section head as default content. One row per testimonial,
 * two cells: [quote text] | [avatar image + name p + role p].
 * The quote-mark glyph is a fixed decorative asset injected by the block.
 */

const QUOTE_MARK = '/img/quote1.svg';

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
    card.append(mark);

    const quote = document.createElement('blockquote');
    const person = document.createElement('figcaption');
    person.className = 'testi-person';
    const who = document.createElement('div');

    [...row.children].forEach((cell) => {
      const media = cell.querySelector('picture, img');
      if (media) {
        person.append(media);
        const texts = [...cell.querySelectorAll('p')]
          .filter((p) => !p.querySelector('picture, img') && p.textContent.trim());
        texts.forEach((p, i) => {
          p.className = i === 0 ? 'name' : 'role';
          who.append(p);
        });
      } else if (cell.textContent.trim()) {
        quote.append(...cell.childNodes);
      }
    });

    person.append(who);
    card.append(quote, person);
    grid.append(card);
  });

  block.replaceChildren(grid);
}
