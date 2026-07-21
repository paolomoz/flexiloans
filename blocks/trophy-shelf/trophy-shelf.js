/**
 * trophy-shelf — all awards on one continuous hairline shelf, ruled into
 * plaque cells (canon module; replaces carousels — everything visible, no JS).
 *
 * Authoring: section head as default content. One row per award, two cells:
 * [award image] | [year p + title p + category p].
 */

export default function decorate(block) {
  const shelf = document.createElement('div');
  shelf.className = 'awards-shelf';
  shelf.setAttribute('role', 'list');

  [...block.children].forEach((row) => {
    const award = document.createElement('div');
    award.className = 'award';
    award.setAttribute('role', 'listitem');

    const stand = document.createElement('div');
    stand.className = 'award-stand';
    const media = row.querySelector('picture, img');
    if (media) stand.append(media);

    const plaque = document.createElement('div');
    plaque.className = 'award-plaque';
    const texts = [...row.querySelectorAll('p')]
      .filter((p) => !p.querySelector('picture, img') && p.textContent.trim());
    const classes = ['year', 'title', 'category'];
    texts.forEach((p, i) => {
      p.className = classes[Math.min(i, 2)];
      plaque.append(p);
    });

    award.append(stand, plaque);
    shelf.append(award);
  });

  block.replaceChildren(shelf);
}
