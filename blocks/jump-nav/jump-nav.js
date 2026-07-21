/**
 * jump-nav — horizontal in-page anchor row under the hero (business-loan):
 * a hairline-ruled paper strip of scrollable text tabs. Smooth scroll comes
 * free from html { scroll-behavior: smooth }.
 *
 * Authoring: plain <a href="#..."> links — one per row or all flattened in a
 * single cell; the block collects every anchor.
 */

export default function decorate(block) {
  if (block.querySelector(':scope > nav')) return; // already decorated

  const nav = document.createElement('nav');
  nav.className = 'jump-row';
  nav.setAttribute('aria-label', 'On this page');
  block.querySelectorAll('a[href]').forEach((a) => {
    a.className = '';
    nav.append(a);
  });
  block.replaceChildren(nav);
}
