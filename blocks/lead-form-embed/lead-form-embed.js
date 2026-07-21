/**
 * lead-form-embed — framed application-form panel (migrated/business-loan-in-mumbai):
 * centered h2 + shield trust line + LAZY iframe of the loans funnel + visible
 * fallback link.
 *
 * Authoring rows (single-cell; decode is content-based):
 *   - <h2> panel heading ("Check your Loan Eligibility")
 *   - trust line p (no link)
 *   - fallback p containing <a href="https://forms.flexiloans.com/?nlp=1">
 *
 * The iframe src comes from the authored fallback link's href (falls back to
 * the known funnel URL) and is only set once the block scrolls near the
 * viewport (IntersectionObserver, 400px rootMargin) — plus loading="lazy".
 */

import { decorateIcons } from '../../scripts/aem.js';

const FORM_URL = 'https://forms.flexiloans.com/?nlp=1';

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
  const nodes = collectNodes(block);

  const head = document.createElement('div');
  head.className = 'lfe-head';
  let fallback = null;

  nodes.forEach((el) => {
    if (el.matches('h1, h2, h3')) {
      head.append(el);
      return;
    }
    if (el.querySelector('a[href]')) {
      fallback = el;
      el.classList.add('lfe-fallback');
      return;
    }
    if (el.textContent.trim()) {
      el.classList.add('lfe-trust');
      const shield = document.createElement('span');
      shield.className = 'icon icon-safe-secure';
      el.prepend(shield, ' ');
      decorateIcons(el);
      head.append(el);
    }
  });

  const src = fallback?.querySelector('a[href]')?.href || FORM_URL;

  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'Apply for a loan');
  iframe.setAttribute('loading', 'lazy');
  iframe.dataset.src = src;

  const frame = document.createElement('div');
  frame.className = 'lfe-frame';
  frame.append(head, iframe);
  if (fallback) frame.append(fallback);
  block.replaceChildren(frame);

  // defer the third-party form until the panel approaches the viewport
  const load = () => {
    if (!iframe.src) iframe.src = iframe.dataset.src;
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        load();
        io.disconnect();
      }
    }, { rootMargin: '400px' });
    io.observe(block);
  } else {
    load();
  }
}
