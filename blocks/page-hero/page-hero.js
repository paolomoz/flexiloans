/**
 * page-hero — gradient band page opener. Variants:
 *   (default)    left copy + optional art on the right (emi-calculator)
 *   centered     centered eyebrow + h1 + lede (contact)
 *   tabs         copy | art grid + tab-link row on a hairline (faq, company)
 *   breadcrumb   crumbs line above the h1 (mumbai)
 *
 * Authoring: single-cell rows (or one flattened cell), order tolerant:
 *   - breadcrumb line: plain links + text, before the h1 (breadcrumb variant)
 *   - eyebrow p (short, no links, before the h1)
 *   - <h1> (author-supplied, kept as-is)
 *   - lede p (may carry inline links)
 *   - CTA p's: <strong><a> primary, <em><strong><a> ghost-inverse
 *   - tab row: one p of >=2 plain links (tabs variant)
 *   - optional image/art
 *
 * The gradient band is painted on the section container; the copy reserves
 * the fixed header's height (140px desktop / 120px mobile top padding).
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

function markCurrent(nav) {
  nav.querySelectorAll('a').forEach((a) => {
    try {
      if (new URL(a.href).pathname === window.location.pathname) {
        a.setAttribute('aria-current', 'page');
      }
    } catch { /* keep link as-is */ }
  });
}

export default function decorate(block) {
  const isTabs = block.classList.contains('tabs');
  const isCrumbs = block.classList.contains('breadcrumb');
  const nodes = collectNodes(block);

  const copy = document.createElement('div');
  copy.className = 'page-hero-copy';
  const ctas = document.createElement('div');
  ctas.className = 'page-hero-ctas';
  const figure = document.createElement('div');
  figure.className = 'page-hero-figure';
  let crumbs = null;
  let tabs = null;
  let heading = null;

  nodes.forEach((el) => {
    const media = el.matches('picture, img') ? el : el.querySelector('picture, img');
    if (media) {
      figure.append(media);
      return;
    }
    if (el.matches('h1, h2, h3')) {
      heading = el;
      copy.append(el);
      return;
    }
    const links = [...el.querySelectorAll('a')];
    if (links.length) {
      if (el.querySelector('strong a, em a, a.button')) {
        ctas.append(el);
        return;
      }
      if (isCrumbs && !heading && !crumbs) {
        crumbs = document.createElement('nav');
        crumbs.className = 'page-hero-crumbs';
        crumbs.setAttribute('aria-label', 'Breadcrumb');
        crumbs.append(...el.childNodes);
        markCurrent(crumbs);
        return;
      }
      const linkText = links.map((a) => a.textContent).join('').trim();
      if (isTabs && links.length >= 2
        && linkText.length >= el.textContent.trim().length * 0.6) {
        tabs = document.createElement('nav');
        tabs.className = 'page-hero-tabs';
        tabs.setAttribute('aria-label', 'Section');
        tabs.append(...el.childNodes);
        markCurrent(tabs);
        return;
      }
    }
    if (el.textContent.trim()) {
      el.classList.add(heading ? 'page-hero-lede' : 'page-hero-eyebrow');
      copy.append(el);
    }
  });

  if (crumbs) copy.prepend(crumbs);
  if (ctas.childElementCount) copy.append(ctas);

  block.replaceChildren();
  if (figure.childElementCount) {
    const grid = document.createElement('div');
    grid.className = 'page-hero-grid';
    grid.append(copy, figure);
    block.append(grid);
  } else {
    block.append(copy);
  }
  if (tabs) block.append(tabs);
}
