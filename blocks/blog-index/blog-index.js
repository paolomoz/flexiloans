/**
 * blog-index — editorial index: hairline-ruled rows (ledger register).
 *
 * Authoring: section head as default content. One row per entry, two cells:
 * [kicker] | [<a href>title</a>]. The whole rendered row becomes the link.
 */

export default function decorate(block) {
  const index = document.createElement('div');
  index.className = 'blog-index';

  [...block.children].forEach((row) => {
    const link = row.querySelector('a');
    if (!link) return;

    const a = document.createElement('a');
    a.className = 'blog-row';
    a.href = link.href;

    const kicker = document.createElement('p');
    kicker.className = 'kicker';
    const kickerCell = [...row.querySelectorAll(':scope > div')]
      .find((cell) => !cell.querySelector('a') && cell.textContent.trim());
    kicker.textContent = kickerCell ? kickerCell.textContent.trim() : '';

    const title = document.createElement('h3');
    title.textContent = link.textContent.trim();

    const go = document.createElement('span');
    go.className = 'go';
    go.setAttribute('aria-hidden', 'true');
    go.textContent = '→';

    if (kicker.textContent) a.append(kicker, '\n');
    a.append(title, '\n', go);
    index.append(a);
  });

  block.replaceChildren(index);
}
