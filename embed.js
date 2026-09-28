/* giving.sg donation widget — iframe launcher (prod candidate)
 *
 * Partner integration (one line, in the site footer):
 *   <script async src="https://cdn.giving.sg/widget/v1/embed.js"
 *     data-campaign-guid="5e05840b-..."></script>
 *
 * Behaviour: renders a floating giving.sg mascot. On click it opens a modal
 * containing the giving.sg checkout in an <iframe>. The checkout collects the
 * amount, tax-relief and payment itself — the partner has NO backend, NO
 * secrets, and NO donation UI of its own. The iframe posts "cancel" when the
 * donor closes it; completion is reconciled server-side via webhook.
 *
 * Config via data-* on the <script> tag:
 *   data-campaign-guid  (required)  giving.sg campaign id
 *   data-env            uat | prod  (default prod)
 *   data-position       bottom-right | bottom-left (default bottom-right)
 *   data-lottie-src     override for the lottie_light lib (default: sibling of this script)
 */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var GUID = (script.getAttribute('data-campaign-guid') || '').trim();
  if (!GUID) { console.error('[giving.sg widget] missing data-campaign-guid'); return; }

  var ENV = (script.getAttribute('data-env') || 'prod').trim().toLowerCase();
  // NOTE: confirm the prod host with giving.sg before go-live.
  var HOST = ENV === 'uat' ? 'https://uat.giving.sg' : 'https://giving.sg';
  var CHECKOUT_PATH = '/NVPCGiving_sg/CampaignDetailExternal';
  var POSITION = (script.getAttribute('data-position') || 'bottom-right').trim();

  // Assets live next to this script on the CDN (self-hosted, no third-party).
  var animationUrl = new URL('donate-widget.json', script.src).href;
  var lottieUrl = script.getAttribute('data-lottie-src') || new URL('lottie_light.min.js', script.src).href;

  var IDLE = [0, 120], HOVER = [120, 180];

  // ---- host + closed shadow root (isolates from partner CSS) ----------------
  var host = document.createElement('div');
  var side = POSITION === 'bottom-left' ? 'left:24px;' : 'right:24px;';
  host.style.cssText = 'position:fixed;bottom:16px;' + side + 'z-index:2147483000;';
  var root = host.attachShadow({ mode: 'closed' });

  var style = document.createElement('style');
  style.textContent = [
    ':host{all:initial}',
    '.mascot{width:106px;height:122px;cursor:pointer;border:0;background:none;padding:0;display:block;',
    ' font:600 13px/1.2 system-ui,sans-serif;color:#1B3862}',
    '.mascot:focus-visible{outline:2px solid #F16577;outline-offset:4px;border-radius:8px}',
    /* modal */
    '.overlay{position:fixed;inset:0;background:rgba(60,64,72,.64);display:none;',
    ' align-items:center;justify-content:center;padding:16px;z-index:2147483001}',
    '.overlay.open{display:flex}',
    '.frame-wrap{position:relative;width:596px;max-width:calc(100vw - 32px);',
    ' height:800px;max-height:calc(100vh - 32px);border-radius:10px;overflow:hidden;',
    ' box-shadow:0 1px 40px 4px rgba(50,95,160,.30);background:#fff}',
    '.frame-wrap iframe{width:100%;height:100%;border:0;display:block}',
    '@media (prefers-reduced-motion: reduce){.mascot{pointer-events:auto}}',
  ].join('');

  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Donate with giving.sg');

  var frameWrap = document.createElement('div');
  frameWrap.className = 'frame-wrap';
  overlay.appendChild(frameWrap);

  var mascot = document.createElement('button');
  mascot.className = 'mascot';
  mascot.setAttribute('aria-label', 'Donate — opens the giving.sg donation window');
  mascot.setAttribute('aria-haspopup', 'dialog');

  root.appendChild(style);
  root.appendChild(overlay);
  root.appendChild(mascot);

  // ---- modal open/close ------------------------------------------------------
  var currentIframe = null;
  var lastFocus = null;

  function openModal() {
    if (overlay.classList.contains('open')) return;
    lastFocus = document.activeElement;
    // fresh transaction id per attempt (consumed even on abandonment)
    var txn = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : fallbackUuid();
    var src = HOST + CHECKOUT_PATH + '?CampaignGuid=' + encodeURIComponent(GUID) +
              '&PartnerTransactionId=' + encodeURIComponent(txn);
    currentIframe = document.createElement('iframe');
    currentIframe.setAttribute('title', 'giving.sg donation checkout');
    currentIframe.setAttribute('allow', 'payment');
    currentIframe.src = src;
    frameWrap.appendChild(currentIframe);
    overlay.classList.add('open');
  }

  function closeModal() {
    if (!overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    if (currentIframe) { currentIframe.remove(); currentIframe = null; }
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  mascot.addEventListener('click', openModal);
  // backdrop click (but not clicks inside the frame) closes
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  // giving.sg checkout posts "cancel" when the donor closes it (verified).
  window.addEventListener('message', function (e) {
    if (e.origin !== HOST) return;
    if (e.data === 'cancel') closeModal();
    // NOTE: completion event shape unconfirmed — reconciliation rides on the
    // webhook regardless. If giving.sg later posts a success signal, close here.
  });

  function fallbackUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ---- mascot animation (lottie_light; idle/hover marker segments) ----------
  function initAnimation() {
    if (!window.lottie) { mascot.textContent = 'Donate'; return; }
    var anim = window.lottie.loadAnimation({
      container: mascot, renderer: 'svg', loop: false, autoplay: false, path: animationUrl,
    });
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var wantHover = false;
    function idle() { anim.playSegments(IDLE, true); }
    function hover() { anim.playSegments(HOVER, true); }
    anim.addEventListener('DOMLoaded', function () { reduced ? anim.goToAndStop(0, true) : idle(); });
    if (!reduced) {
      anim.addEventListener('complete', function () { wantHover ? hover() : idle(); });
      mascot.addEventListener('mouseenter', function () { wantHover = true; hover(); });
      mascot.addEventListener('mouseleave', function () { wantHover = false; });
    }
  }

  if (window.lottie) initAnimation();
  else {
    var lib = document.createElement('script');
    lib.src = lottieUrl; lib.async = true;
    lib.onload = initAnimation;
    lib.onerror = function () { mascot.textContent = 'Donate'; };
    document.head.appendChild(lib);
  }

  // ---- mount -----------------------------------------------------------------
  if (document.body) document.body.appendChild(host);
  else document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(host); });
})();
