/**
 * article-header — blog/guide page opener: kicker + h1 + lede + meta line
 * (migrated/cancelled-cheque opener).
 *
 * Authoring rows (single-cell; order tolerant, decode is content-based):
 *   - kicker p (short label before the heading, e.g. "Guide")
 *   - <h1> article title
 *   - lede p (the standfirst sentence after the h1)
 *   - meta p (author · date · read time, separated with "·")
 *
 * DA may flatten rows into one cell; nodes are collected cell-wise and
 * classified by content, never by row index. The section container reserves
 * the fixed-header offset (132px desktop / 120px mobile) — this block opens
 * the page.
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
  const nodes = collectNodes(block);

  let heading = null;
  let lede = null;
  const out = [];

  nodes.forEach((el) => {
    if (el.matches('h1, h2, h3')) {
      heading = el;
      el.classList.add('article-title');
      out.push(el);
      return;
    }
    if (!el.textContent.trim()) return;
    if (!heading) {
      el.classList.add('article-kicker');
    } else if (!lede) {
      lede = el;
      el.classList.add('article-lede');
    } else {
      el.classList.add('article-meta');
    }
    out.push(el);
  });

  block.replaceChildren(...out);
}
