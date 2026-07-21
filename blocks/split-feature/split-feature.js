/**
 * split-feature — image | copy split. Variants:
 *   (default)  figure 5 | copy 7 (about our-organisation)
 *   rev        copy 7 | figure 5, mirrored, lavender band (about our-vision)
 *   framed     lavender rounded panel, figure 5 | copy 7 (term-loan example)
 *
 * Authoring: row(s) with [image cell] | [copy cell: h2/h3 + p's + optional
 * <ul> + optional CTA p (<strong><a>)]. DA may flatten into one cell — nodes
 * are classified by content. A <ul> renders as a ruled check list; a block
 * with a list but NO image renders the split-list composition
 * (term-loan key-features: intro 5 | checklist 7 on an ice band).
 */

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

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

function decorateList(ul) {
  ul.classList.add('split-list');
  ul.querySelectorAll(':scope > li').forEach((li) => {
    if (li.querySelector('.icon-chip')) return; // idempotent
    const chip = document.createElement('span');
    chip.className = 'icon-chip on-tint';
    chip.setAttribute('aria-hidden', 'true');
    chip.insertAdjacentHTML('afterbegin', CHECK);
    li.prepend(chip, document.createTextNode(' '));
  });
}

export default function decorate(block) {
  const nodes = collectNodes(block);

  const figure = document.createElement('div');
  figure.className = 'split-figure';
  const copy = document.createElement('div');
  copy.className = 'split-copy';
  const lists = [];

  nodes.forEach((el) => {
    const media = el.matches('picture, img') ? el : el.querySelector('picture, img');
    if (media) {
      figure.append(media);
      return;
    }
    if (el.matches('ul')) {
      decorateList(el);
      lists.push(el);
      return;
    }
    if (el.textContent.trim() || el.querySelector('a')) copy.append(el);
  });

  const grid = document.createElement('div');
  grid.className = 'split-grid';

  if (figure.childElementCount) {
    lists.forEach((ul) => copy.append(ul));
    grid.append(figure, copy);
  } else if (lists.length) {
    // no image: split-list composition — intro copy | ruled checklist
    block.classList.add('list');
    const listCol = document.createElement('div');
    listCol.className = 'split-listcol';
    lists.forEach((ul) => listCol.append(ul));
    grid.append(copy, listCol);
  } else {
    grid.append(copy);
  }

  block.replaceChildren(grid);
}
