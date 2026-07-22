/**
 * blog-index — editorial index: hairline-ruled rows (ledger register).
 *
 * Authoring: section head as default content. One row per entry, two cells:
 * [kicker] | [<a href>title</a>]. The whole rendered row becomes the link.
 *
 * Variant `dynamic` (home Recent Blogs): the authored rows render immediately
 * (never-blank guarantee, replaces the source site's rss2json dependency),
 * then the block fetches /blog-index.json (helix-query.yaml page index over
 * /blog/**), sorts by published-time desc and swaps in the latest posts —
 * same row count as authored. Fetch failure leaves the authored rows.
 */

function makeRow(kickerText, titleText, href) {
  const a = document.createElement('a');
  a.className = 'blog-row';
  a.href = href;

  const kicker = document.createElement('p');
  kicker.className = 'kicker';
  kicker.textContent = kickerText || '';

  const title = document.createElement('h3');
  title.textContent = titleText;

  const go = document.createElement('span');
  go.className = 'go';
  go.setAttribute('aria-hidden', 'true');
  go.textContent = '→';

  if (kicker.textContent) a.append(kicker, '\n');
  a.append(title, '\n', go);
  return a;
}

async function refreshFromIndex(index, count) {
  try {
    const resp = await fetch('/blog-index.json?limit=1000');
    if (!resp.ok) return;
    const { data } = await resp.json();
    if (!Array.isArray(data)) return;
    const posts = data
      .filter((p) => p.path && p.title)
      .sort((x, y) => String(y['published-time'] || y.lastModified || '')
        .localeCompare(String(x['published-time'] || x.lastModified || '')))
      .slice(0, count);
    if (!posts.length) return;
    index.replaceChildren(...posts.map((p) => makeRow(p.category, p.title, p.path)));
  } catch (e) {
    // keep the authored rows — the block is complete without the index
  }
}

export default function decorate(block) {
  const index = document.createElement('div');
  index.className = 'blog-index';

  let count = 0;
  [...block.children].forEach((row) => {
    const link = row.querySelector('a');
    if (!link) return;

    const kickerCell = [...row.querySelectorAll(':scope > div')]
      .find((cell) => !cell.querySelector('a') && cell.textContent.trim());
    index.append(makeRow(kickerCell ? kickerCell.textContent.trim() : '', link.textContent.trim(), link.href));
    count += 1;
  });

  block.replaceChildren(index);
  if (block.classList.contains('dynamic') && count) refreshFromIndex(index, count);
}
