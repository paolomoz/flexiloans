/**
 * live-status — ice-wash proof band: state map | live chip + h2 + tabular figures.
 *
 * Authoring: one row, two cells: [map image] | [chip label p, h2, live lines
 * with <strong> figures]. Decode classifies cells by media presence.
 */

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'live-grid';

  const map = document.createElement('div');
  map.className = 'live-map';
  const copy = document.createElement('div');
  copy.className = 'live-copy';

  let pastHeading = false;
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const media = cell.querySelector('picture, img');
    if (media) {
      map.append(media);
      return;
    }
    [...cell.children].forEach((el) => {
      if (el.matches('h1, h2, h3')) {
        pastHeading = true;
        copy.append(el);
        return;
      }
      if (!el.textContent.trim()) return;
      if (!pastHeading) {
        const chip = document.createElement('span');
        chip.className = 'live-chip';
        chip.textContent = el.textContent.trim();
        copy.append(chip);
        return;
      }
      el.classList.add('live-line');
      copy.append(el);
    });
  });

  if (map.childElementCount) grid.append(map);
  grid.append(copy);
  block.replaceChildren(grid);
}
