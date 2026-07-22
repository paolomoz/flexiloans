/**
 * lead-capture — phone-capture card (migrated/loan/faq): white card on an
 * ice band with a tel input, a primary action button and a WhatsApp opt-in
 * checkbox. <div>-based, button type=button (CSP: all behavior wired here,
 * no inline handlers). Submit reproduces the live site's validatePhone():
 * require 10 digits, then open the loan funnel in a new tab (the source
 * widget never transmits the number itself).
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

  // live-parity submit: 10 digits required, then open the funnel
  const FUNNEL = 'https://loans.flexiloans.com/?journeyName=flow_dashboard&nlp=2&utm_source=Website&utm_medium=Web&utm_campaign=organic&utm_term=organic&utm_content=organic';
  const error = document.createElement('p');
  error.className = 'lc-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  button.addEventListener('click', () => {
    if (input.value.length !== 10) {
      error.textContent = 'Please enter a valid 10-digit mobile number';
      error.hidden = false;
      input.focus();
      return;
    }
    error.hidden = true;
    window.open(FUNNEL, '_blank', 'noopener');
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') button.click();
  });

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

  card.append(row, error, consent);
  block.replaceChildren(card);
}
