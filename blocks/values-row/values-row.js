/**
 * values-row — ruled row of 5 illustration + label cells (about our-values).
 * Authoring: one row per value, two cells: [img] | [label p]. DA may flatten
 * rows into one cell — each image starts a new value; the following text
 * node becomes its label.
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
  const values = [];
  let current = null;

  collectNodes(block).forEach((el) => {
    const media = el.matches('picture, img') ? el : el.querySelector('picture, img');
    if (media) {
      current = document.createElement('div');
      current.className = 'value';
      current.setAttribute('role', 'listitem');
      current.append(media);
      values.push(current);
      return;
    }
    if (el.textContent.trim() && current && !current.querySelector('.value-label')) {
      el.classList.add('value-label');
      current.append(el);
    }
  });

  block.setAttribute('role', 'list');
  block.replaceChildren(...values);
}
