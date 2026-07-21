/**
 * lead-capture — presentational phone-capture card (migrated/loan/faq):
 * white card on an ice band with a tel input, a primary action button and a
 * WhatsApp opt-in checkbox. Non-submitting: <div>-based, button type=button
 * (CSP: all behavior wired here, no inline handlers).
 *
 * Authoring rows (single-cell; decode is content-based/order-tolerant):
 *   - <h2> card heading ("Check your Loan Eligibility")
 *   - optional supporting copy p (rendered as the sub line)
 *   - button label p ("Check Loan Eligibility")
 *   - consent label p ("Send me updates on") — the WhatsApp mark is chrome
 *     injected by the block (/img/WhatsApp.svg)
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
  const texts = [];
  nodes.forEach((el) => {
    if (!heading && el.matches('h1, h2, h3')) heading = el;
    else if (el.textContent.trim()) texts.push(el.textContent.trim());
  });

  // trailing texts are [button label, consent label]; anything before is sub copy
  const consentLabel = texts.length > 1 ? texts.pop() : 'Send me updates on';
  const buttonLabel = texts.pop() || 'Check Loan Eligibility';

  const card = document.createElement('div');
  card.className = 'lc-card';
  if (heading) card.append(heading);
  texts.forEach((t) => {
    const p = document.createElement('p');
    p.className = 'lc-sub';
    p.textContent = t;
    card.append(p);
  });

  const row = document.createElement('div');
  row.className = 'lc-form';

  const label = document.createElement('label');
  label.className = 'lc-sr-only';
  label.setAttribute('for', 'lc-phone');
  label.textContent = 'Mobile number';

  const input = document.createElement('input');
  input.type = 'tel';
  input.id = 'lc-phone';
  input.name = 'phone_number';
  input.placeholder = 'Enter mobile number';
  input.setAttribute('inputmode', 'tel');
  input.setAttribute('autocomplete', 'tel');
  input.setAttribute('maxlength', '10');
  // client-side nicety: digits only
  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '').slice(0, 10);
    if (input.value !== digits) input.value = digits;
  });

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button primary';
  button.textContent = buttonLabel;

  row.append(label, input, button);

  const consent = document.createElement('label');
  consent.className = 'lc-consent';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'whatsapp_opt_in';
  checkbox.checked = true;
  const span = document.createElement('span');
  span.textContent = consentLabel;
  const mark = document.createElement('img');
  mark.src = '/img/WhatsApp.svg';
  mark.alt = 'WhatsApp';
  mark.width = 69;
  mark.height = 16;
  mark.loading = 'lazy';
  consent.append(checkbox, span, mark);

  card.append(row, consent);
  block.replaceChildren(card);
}
