/*
 * Delayed phase (runs 3s after LCP): marketing tags only.
 *
 * Strategy (audit F-004/F-022/F-023): the captured site direct-injects 16
 * third-party hosts in <head>; here everything routes through the ONE Google
 * Tag Manager container the site already owns (GTM-KJCH58F) plus its GA4
 * property (G-KX54C29ZSG), loaded post-LCP. Tags not wired through GTM on
 * the source site (VWO, Clarity, Amplitude, Criteo, Taboola, …) are a client
 * decision to re-integrate — do not add them here directly.
 */

function loadScript(src) {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.head.append(script);
}

window.dataLayer = window.dataLayer || [];

// GTM container (same container as the source site)
window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
loadScript('https://www.googletagmanager.com/gtm.js?id=GTM-KJCH58F');

// GA4 (loaded separately on the source site as well)
function gtag(...args) { window.dataLayer.push(args); }
loadScript('https://www.googletagmanager.com/gtag/js?id=G-KX54C29ZSG');
gtag('js', new Date());
gtag('config', 'G-KX54C29ZSG');
