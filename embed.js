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

  // ---- desktop pop-up settings (mobile always uses a full-width sheet at 100%) ----
  var DESKTOP_WIDTH = 425;     // px, visible width of the pop-up
  var DESKTOP_ZOOM = 0.9;      // 1 = actual size; 0.9 = checkout drawn at 90%
  var HIDE_SCROLLBAR = true;   // clip the checkout's scrollbar (scrolling still works)
  var MIN_CHECKOUT_WIDTH = 480; // px the checkout needs before it adds a sideways scrollbar;
                                // zoom is reduced automatically if needed to keep this
  var MOBILE_QUERY = '(max-width:640px),(max-height:500px)';

  // ---- host + closed shadow root (isolates from partner CSS) ----------------
  var host = document.createElement('div');
  host.setAttribute('data-position', POSITION === 'bottom-left' ? 'left' : 'right');
  var root = host.attachShadow({ mode: 'closed' });

  var style = document.createElement('style');
  style.textContent = [
    ':host{all:initial;position:fixed;z-index:2147483000;',
    ' bottom:calc(16px + env(safe-area-inset-bottom, 0px));right:24px}',
    ':host([data-position="left"]){right:auto;left:24px}',
    '.mascot{width:106px;height:122px;cursor:pointer;border:0;background:none;padding:0;display:block;',
    ' font:600 13px/1.2 system-ui,sans-serif;color:#1B3862}',
    '.mascot:focus-visible{outline:2px solid #F16577;outline-offset:4px;border-radius:8px}',
    /* modal — desktop: narrow, near full-height panel to minimise scrolling */
    '.overlay{position:fixed;inset:0;background:rgba(60,64,72,.64);display:none;',
    ' align-items:center;justify-content:center;padding:24px;box-sizing:border-box;z-index:2147483001}',
    '.overlay.open{display:flex}',
    '.frame-wrap{position:relative;box-sizing:border-box;width:' + DESKTOP_WIDTH + 'px;max-width:100%;',
    ' height:calc(100vh - 48px);height:calc(100dvh - 48px);max-height:960px;',
    ' border-radius:12px;overflow:hidden;',
    ' box-shadow:0 1px 40px 4px rgba(50,95,160,.30);background:transparent}',
    '.frame-wrap iframe{width:100%;height:100%;border:0;display:block;transform-origin:0 0}',
    /* mobile + landscape phones: bottom sheet using (almost) the full screen.
       The 24px strip at the top stays visible so donors can tap it to close. */
    '@media ' + MOBILE_QUERY + '{',
    ' :host{bottom:calc(12px + env(safe-area-inset-bottom, 0px));right:16px}',
    ' :host([data-position="left"]){left:16px}',
    ' .mascot{width:80px;height:92px}',
    ' .overlay{padding:24px 0 0;align-items:flex-end}',
    ' .frame-wrap{width:100%;height:100%;max-height:none;border-radius:16px 16px 0 0;',
    '  padding-bottom:env(safe-area-inset-bottom, 0px)}',
    '}',
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
  var prevOverflow = '';

  // Width of a classic scrollbar in this browser (0 where scrollbars overlay
  // content, e.g. macOS trackpads and phones). The checkout runs in the same
  // browser, so its scrollbar is the same width.
  function scrollbarWidth() {
    var d = document.createElement('div');
    d.style.cssText = 'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll';
    document.body.appendChild(d);
    var w = d.offsetWidth - d.clientWidth;
    d.remove();
    return w;
  }

  // Desktop: draw the checkout at DESKTOP_ZOOM and, optionally, push its
  // scrollbar just outside the visible area. The iframe's own page can't be
  // styled from here (different site), so this is done by sizing the iframe.
  var mobileMq = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;
  function sizeIframe() {
    if (!currentIframe) return;
    var st = currentIframe.style;
    if (mobileMq && mobileMq.matches) { st.width = st.height = st.transform = ''; return; }
    var w = frameWrap.clientWidth || DESKTOP_WIDTH;
    var z = Math.min(DESKTOP_ZOOM, w / MIN_CHECKOUT_WIDTH);
    // +2px safety margin so no sliver of the scrollbar shows after rounding
    var sb = HIDE_SCROLLBAR ? scrollbarWidth() + 2 : 0;
    st.width = 'calc(100% / ' + z + ' + ' + sb + 'px)';
    st.height = 'calc(100% / ' + z + ')';
    st.transform = z === 1 ? '' : 'scale(' + z + ')';
  }
  window.addEventListener('resize', sizeIframe);
  if (mobileMq) {
    if (mobileMq.addEventListener) mobileMq.addEventListener('change', sizeIframe);
    else if (mobileMq.addListener) mobileMq.addListener(sizeIframe);
  }

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
    // stop the partner page scrolling behind the modal
    prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    overlay.classList.add('open');
    sizeIframe();
  }

  function closeModal() {
    if (!overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    document.documentElement.style.overflow = prevOverflow;
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
