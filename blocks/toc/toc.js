/**
 * toc — sticky "On this page" anchor list beside default-content article prose.
 *
 * Variants: `left` (privacy-policy: 260px rail left of the article) and
 * `right` (cancelled-cheque: 264px rail right of the article, hidden <1100px).
 * Default (no variant) behaves as `right`.
 *
 * Authoring: the toc block and the article prose share ONE section — the toc
 * block first, the prose (h2/h3 + p + ul default content) after it. One row
 * per anchor: [<a href="#id">label</a>]; all links in a single cell are
 * tolerated. The section-level sidebar+article grid is painted via classes
 * this block adds to its section container (toc-left / toc-right).
 *
 * Headings in main get ids assigned by slugifying their text (the boilerplate
 * does not auto-assign heading ids), so authored #anchors resolve.
 */

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^0-9a-z]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function decorate(block) {
  // section container carries the two-column layout class
  const section = block.closest('.section');
  if (section) {
    section.classList.add(block.classList.contains('left') ? 'toc-left' : 'toc-right');
  }

  // ensure prose headings are addressable, and index them by slugified text
  const bySlug = new Map();
  document.querySelectorAll('main h2, main h3').forEach((h) => {
    if (!h.id) h.id = slugify(h.textContent);
    bySlug.set(slugify(h.textContent), h.id);
  });

  const links = [...block.querySelectorAll('a[href*="#"]')];

  // self-heal authored anchors whose slug diverges from the pipeline heading
  // id (github-slugger REMOVES punctuation — "business's" → businesss — while
  // authored slugs dash it): re-point the link at the heading whose slugified
  // TEXT matches the link's slugified text.
  links.forEach((a) => {
    const slug = (a.getAttribute('href') || '').split('#')[1];
    if (slug && !document.getElementById(slug)) {
      const target = bySlug.get(slugify(a.textContent));
      if (target) a.setAttribute('href', `#${target}`);
    }
  });

  const nav = document.createElement('nav');
  nav.className = 'toc-nav';
  nav.setAttribute('aria-label', 'On this page');

  const label = document.createElement('p');
  label.className = 'toc-label';
  label.textContent = 'On this page';
  nav.append(label);

  const list = document.createElement('ul');
  links.forEach((a) => {
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
  });
  nav.append(list);

  block.replaceChildren(nav);
}
