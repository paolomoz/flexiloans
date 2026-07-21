/**
 * contact-form — presentational 5-field form card (migrated/about-us/contact):
 * two-column field grid in a shadowed card, consent checkbox, navy submit.
 * Non-submitting: <div>-based, button type=button (wired at migrate).
 *
 * Authoring rows (single-cell; decode is content-based/order-tolerant):
 *   - one row per field label, in order ("Full Name *", "Email Address *",
 *     "Phone Number", "Subject", "Message *") — trailing "*" marks required;
 *     the LAST field renders as a full-width textarea; "email"/"phone" in a
 *     label pick the input type
 *   - consent row: the first row containing a link (or "agree"/"consent"
 *     wording) becomes the checkbox label, authored markup kept
 *   - button label row ("Send Message")
 *   - optional note row ("Our support team typically responds…")
 *
 * The section head (h2 + sub) is default content before the block, centered
 * by this block's container CSS.
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

function isConsent(el) {
  return !!el.querySelector('a') || /\b(agree|consent)\b/i.test(el.textContent);
}

function buildField(labelText, index, isTextarea) {
  const required = /\*\s*$/.test(labelText);
  const text = labelText.replace(/\s*\*\s*$/, '');
  const id = `cf-field-${index}`;

  const field = document.createElement('div');
  field.className = `cf-field${isTextarea ? ' cf-full' : ''}`;

  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.textContent = text;
  if (required) {
    const req = document.createElement('span');
    req.className = 'cf-req';
    req.setAttribute('aria-hidden', 'true');
    req.textContent = ' *';
    label.append(req);
  }

  let input;
  if (isTextarea) {
    input = document.createElement('textarea');
  } else {
    input = document.createElement('input');
    if (/e-?mail/i.test(text)) {
      input.type = 'email';
      input.setAttribute('autocomplete', 'email');
    } else if (/phone|mobile/i.test(text)) {
      input.type = 'tel';
      input.setAttribute('autocomplete', 'tel');
      input.setAttribute('inputmode', 'tel');
    } else {
      input.type = 'text';
      if (/name/i.test(text)) input.setAttribute('autocomplete', 'name');
    }
  }
  input.id = id;
  if (required) input.required = true;

  field.append(label, input);
  return field;
}

export default function decorate(block) {
  const nodes = collectNodes(block);

  const labels = [];
  let consent = null;
  const trailing = [];

  nodes.forEach((el) => {
    if (!el.textContent.trim()) return;
    if (!consent && isConsent(el)) {
      consent = el;
    } else if (!consent) {
      labels.push(el.textContent.trim());
    } else {
      trailing.push(el);
    }
  });

  const buttonLabel = trailing.length ? trailing.shift().textContent.trim() : 'Send Message';
  const note = trailing.shift() || null;

  const card = document.createElement('div');
  card.className = 'cf-card';
  const grid = document.createElement('div');
  grid.className = 'cf-grid';

  labels.forEach((text, i) => {
    grid.append(buildField(text, i + 1, i === labels.length - 1));
  });

  if (consent) {
    const label = document.createElement('label');
    label.className = 'cf-consent';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'consent';
    const span = document.createElement('span');
    span.append(...consent.childNodes);
    label.append(checkbox, span);
    grid.append(label);
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button secondary cf-submit';
  button.textContent = buttonLabel;
  grid.append(button);

  if (note) {
    note.classList.add('cf-note');
    grid.append(note);
  }

  card.append(grid);
  block.replaceChildren(card);
}
