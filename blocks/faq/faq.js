/**
 * faq — native <details> accordion, ALL items collapsed by default (canon:
 * content complete without JS). Variant `open-first` opens the first item
 * (used by documents-required-style groups on other pages).
 *
 * Authoring: section head as default content. One row per Q/A, two cells:
 * [question] | [answer: p(s), ul, links].
 */

export default function decorate(block) {
  const list = document.createElement('div');
  list.className = 'faq-list';

  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const details = document.createElement('details');
    if (i === 0 && block.classList.contains('open-first')) details.open = true;

    const summary = document.createElement('summary');
    summary.textContent = cells[0].textContent.trim();

    const answer = document.createElement('div');
    answer.className = 'faq-answer';
    answer.append(...cells[1].childNodes);

    details.append(summary, answer);
    list.append(details);
  });

  block.replaceChildren(list);
}
