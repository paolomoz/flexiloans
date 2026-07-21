/**
 * partner-strip — centered logo row on a lavender band.
 *
 * Authoring: one row per partner logo (image cell, alt = partner name).
 * The "View all Partners" foot link is default content below the block.
 */

export default function decorate(block) {
  const row = document.createElement('div');
  row.className = 'partner-row';
  block.querySelectorAll('picture, img').forEach((media) => {
    if (media.closest('picture') && media.tagName === 'IMG') return;
    row.append(media);
  });
  block.replaceChildren(row);
}
