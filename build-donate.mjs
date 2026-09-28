// Build donation-widget Lottie from Donate.svg path data.
// Output: lottie-player/public/projects/donation-widget/scene-1/lottie.json
import fs from 'node:fs';
import path from 'node:path';

const OUT = '/Users/joshua/Downloads/giving.sg/prototype/lottie-player/public/projects/donation-widget/scene-1/lottie.json';

// ---------- SVG path data (verbatim from Donate.svg) ----------
const D = {
  armBackL: 'M41.1352 97.926C31.6739 101.402 5.1268 114.008 20.0532 126.003C26.9637 131.557 37.2352 133.215 45.7786 134.705C50.6973 135.563 52.8074 128.283 47.8567 127.419C40.7954 126.187 32.9253 124.938 26.6682 121.311C25.202 120.461 24.0839 119.678 23.6981 118.633C23.9194 119.233 23.7883 118.874 23.6889 118.509C23.5028 117.825 23.7631 119.241 23.6634 118.357C23.6346 118.101 23.7656 117.124 23.6345 118.207C23.6675 117.934 23.7651 117.558 23.9004 117.315C23.8803 117.351 23.6619 117.693 24.0518 117.081C24.2394 116.786 24.4228 116.494 24.6244 116.207C24.72 116.071 24.3316 116.523 24.806 115.987C25.1016 115.653 25.4113 115.333 25.7312 115.021C27.1358 113.65 27.9055 113.117 29.286 112.201C32.1908 110.273 35.3161 108.657 38.4961 107.199C39.1894 106.881 39.8867 106.572 40.5878 106.27C40.9092 106.132 41.2324 105.998 41.5544 105.861C42.4622 105.475 41.1541 106.016 41.6494 105.82C42.1693 105.614 42.6879 105.405 43.2132 105.212C47.8699 103.501 45.8502 96.1938 41.1352 97.926V97.926Z',
  armBackR: 'M87.2223 105.11C88.7013 105.503 90.1614 105.97 91.6084 106.457C94.9821 107.592 96.8701 108.304 100.116 109.967C101.577 110.716 103.024 111.528 104.343 112.487C103.78 112.078 104.639 112.729 104.791 112.86C105.045 113.079 105.301 113.295 105.544 113.526C105.815 113.783 106.079 114.048 106.327 114.326C106.765 114.816 106.056 113.91 106.534 114.625C106.718 114.899 106.887 115.183 107.03 115.478C106.752 114.905 106.918 115.177 107.013 115.577C106.98 115.437 107.059 116.018 107.071 115.916C107.041 116.175 106.927 116.491 106.813 116.726C107.214 115.9 106.673 116.904 106.536 117.06C106.228 117.41 105.839 117.892 105.02 118.556C99.0923 123.364 90.0684 125.4 82.7328 127.33C77.7989 128.627 79.8942 135.923 84.8506 134.62C93.02 132.471 102.004 130.087 108.916 125.214C112.671 122.566 115.895 118.655 114.783 113.95C112.997 106.39 102.963 102.546 96.2065 100.043C93.9574 99.2094 91.6665 98.4386 89.3402 97.8202C84.3954 96.5058 82.2849 103.798 87.2224 105.11L87.2223 105.11Z',
  body: 'M130.6 58.0701C130.6 44.8666 120.661 33.9906 107.857 32.4978C104.429 22.5672 95.1016 15.3906 84.0608 15.1588C84.54 13.9461 84.8119 12.6287 84.8119 11.2457C84.8119 5.35527 80.0363 0.580139 74.1453 0.580139C70.5585 0.580139 67.3924 2.35625 65.459 5.07075C64.8454 4.90226 64.2026 4.80481 63.5357 4.80481C59.86 4.80481 56.8305 7.54138 56.3549 11.0867C55.4428 11.02 54.5219 10.9856 53.5928 10.9856C38.3709 10.9856 25.2794 20.0683 19.4172 33.1049C8.25802 35.929 0 46.0342 0 58.0701C0 65.58 3.21667 72.3371 8.34516 77.0447C8.33703 77.3096 8.32509 77.5736 8.32509 77.8405C8.32509 92.0637 19.8564 103.594 34.0808 103.594C39.3379 103.594 44.2248 102.015 48.2999 99.3117C52.8966 103.581 59.0518 106.195 65.8202 106.195C72.3793 106.195 78.3622 103.74 82.9097 99.7027C86.8591 102.166 91.5214 103.594 96.519 103.594C110.743 103.594 122.275 92.0637 122.275 77.8405C122.275 77.5736 122.263 77.3096 122.255 77.0447C127.383 72.3371 130.6 65.58 130.6 58.0701Z',
  eyeLWhite: 'M54.4349 64.228C60.4402 64.228 65.3085 59.3496 65.3085 53.3318C65.3085 47.314 60.4402 42.4356 54.4349 42.4356C48.4295 42.4356 43.5612 47.314 43.5612 53.3318C43.5612 59.3496 48.4295 64.228 54.4349 64.228Z',
  eyeLPupil: 'M54.2436 60.9767C58.0384 60.9767 61.1147 57.894 61.1147 54.0913C61.1147 50.2887 58.0384 47.206 54.2436 47.206C50.4488 47.206 47.3726 50.2887 47.3726 54.0913C47.3726 57.894 50.4488 60.9767 54.2436 60.9767Z',
  eyeRWhite: 'M74.1562 64.7375C80.1615 64.7375 85.0298 59.8591 85.0298 53.8413C85.0298 47.8235 80.1615 42.9451 74.1562 42.9451C68.1508 42.9451 63.2826 47.8235 63.2826 53.8413C63.2826 59.8591 68.1508 64.7375 74.1562 64.7375Z',
  eyeRPupil: 'M73.9645 61.4861C77.7593 61.4861 80.8356 58.4034 80.8356 54.6007C80.8356 50.7981 77.7593 47.7154 73.9645 47.7154C70.1698 47.7154 67.0935 50.7981 67.0935 54.6007C67.0935 58.4034 70.1698 61.4861 73.9645 61.4861Z',
  mouth: 'M90.1611 60.9172C89.2192 63.7306 87.752 66.2611 85.5347 68.1997C83.7942 69.7215 81.6805 70.6914 79.3567 71.2406C78.0694 71.5448 77.4519 71.6257 76.1762 71.7033C75.0791 71.7701 73.978 71.7618 72.8812 71.6918C72.4152 71.662 71.9499 71.6209 71.4857 71.5695C71.3515 71.5546 71.2175 71.5381 71.0834 71.5222C71.0744 71.5212 70.6411 71.4632 70.905 71.4996C71.1658 71.5356 70.7462 71.4756 70.7344 71.4737C70.5682 71.4476 70.4018 71.4228 70.2358 71.3955C69.4476 71.2655 68.664 71.1071 67.8872 70.9206C67.0401 70.7171 66.1877 70.4938 65.3686 70.1937C64.5484 69.8932 63.5976 70.5308 63.3798 71.3253C63.1322 72.228 63.6858 73.0166 64.509 73.3182C67.072 74.2572 69.8884 74.7128 72.5959 74.9124C77.7812 75.2945 83.1381 74.2573 87.271 70.9491C90.1978 68.6063 92.1007 65.2984 93.2791 61.7785C93.9425 59.7971 90.8207 58.9471 90.1611 60.9172L90.1611 60.9172Z',
  mouthCorner: 'M87.1819 59.0366C88.1553 61.3677 90.305 63.2459 92.934 63.2139C94.251 63.1979 95.5126 62.7363 96.6484 62.0952C97.3858 61.679 97.6964 60.6059 97.2285 59.8786C96.7478 59.1314 95.8053 58.852 95.0164 59.2973C94.792 59.424 94.5639 59.5394 94.3315 59.6506C94.0583 59.7813 94.6191 59.5461 94.3436 59.6461C94.2231 59.6897 94.1038 59.7359 93.9818 59.7754C93.7973 59.835 93.6099 59.8859 93.4202 59.9262C93.3259 59.9462 93.2235 59.9533 93.1308 59.9792C93.1055 59.9864 93.5287 59.9406 93.3598 59.9475C93.2944 59.9501 93.2289 59.9605 93.1634 59.9648C93.0008 59.9753 92.8377 59.9768 92.6749 59.9687C92.6383 59.9669 92.4352 59.9321 92.4246 59.9486C92.4274 59.9442 92.809 60.0151 92.6811 59.983C92.6265 59.9692 92.5675 59.9639 92.5123 59.9527C92.3711 59.924 92.2316 59.8873 92.0945 59.8431C92.0229 59.82 91.9532 59.7916 91.8818 59.7678C91.6667 59.696 92.2754 59.956 92.0075 59.8191C91.7538 59.6894 91.5213 59.5447 91.2859 59.3847C91.6652 59.6425 91.4379 59.5088 91.2604 59.349C91.1658 59.2639 91.0745 59.1751 90.9864 59.0833C90.9085 59.0022 90.8332 58.9187 90.7603 58.8331C90.7229 58.789 90.6872 58.7434 90.6499 58.6992C90.4759 58.493 90.9106 59.0558 90.7584 58.8393C90.6471 58.681 90.5366 58.5237 90.4366 58.3579C90.3164 58.1586 89.9465 57.3289 90.2999 58.1752C90.1296 57.7674 89.9538 57.4397 89.5569 57.207C89.2104 57.0038 88.6996 56.9177 88.3111 57.0437C87.5646 57.2858 86.8323 58.1994 87.1819 59.0366V59.0366Z',
  dot1: 'M86.1311 47.0153C86.7264 47.0153 87.209 46.5317 87.209 45.9352C87.209 45.3387 86.7264 44.8551 86.1311 44.8551C85.5358 44.8551 85.0533 45.3387 85.0533 45.9352C85.0533 46.5317 85.5358 47.0153 86.1311 47.0153Z',
  dot2: 'M86.8488 49.8955C87.444 49.8955 87.9266 49.4119 87.9266 48.8154C87.9266 48.2189 87.444 47.7354 86.8488 47.7354C86.2535 47.7354 85.7709 48.2189 85.7709 48.8154C85.7709 49.4119 86.2535 49.8955 86.8488 49.8955Z',
  dot3: 'M42.2996 47.7353C42.8949 47.7353 43.3774 47.2518 43.3774 46.6553C43.3774 46.0588 42.8949 45.5752 42.2996 45.5752C41.7043 45.5752 41.2218 46.0588 41.2218 46.6553C41.2218 47.2518 41.7043 47.7353 42.2996 47.7353Z',
  dot4: 'M41.5801 50.6155C42.1753 50.6155 42.6579 50.132 42.6579 49.5355C42.6579 48.9389 42.1753 48.4554 41.5801 48.4554C40.9848 48.4554 40.5022 48.9389 40.5022 49.5355C40.5022 50.132 40.9848 50.6155 41.5801 50.6155Z',
  cheekL: 'M26.4397 67.4341C30.2928 67.4341 33.4163 64.3041 33.4163 60.443C33.4163 56.5819 30.2928 53.4519 26.4397 53.4519C22.5866 53.4519 19.4631 56.5819 19.4631 60.443C19.4631 64.3041 22.5866 67.4341 26.4397 67.4341Z',
  cheekR: 'M107.502 66.1024C111.355 66.1024 114.479 62.9724 114.479 59.1113C114.479 55.2503 111.355 52.1202 107.502 52.1202C103.649 52.1202 100.525 55.2503 100.525 59.1113C100.525 62.9724 103.649 66.1024 107.502 66.1024Z',
  boxBody: 'M90.9387 82.2159H39.0241C35.6102 82.2159 32.8427 84.9891 32.8427 88.41V134.441C32.8427 137.862 35.6102 140.635 39.0241 140.635H90.9387C94.3526 140.635 97.1201 137.862 97.1201 134.441V88.41C97.1201 84.9891 94.3526 82.2159 90.9387 82.2159Z',
  boxLid: 'M93.9982 82.2159H35.7351C34.0743 82.2159 32.728 83.565 32.728 85.2292V93.028C32.728 94.6922 34.0743 96.0413 35.7351 96.0413H93.9982C95.659 96.0413 97.0053 94.6922 97.0053 93.028V85.2292C97.0053 83.565 95.659 82.2159 93.9982 82.2159Z',
  slot: 'M72.6246 87.0044H57.112C55.9412 87.0044 54.9921 87.9554 54.9921 89.1286C54.9921 90.3018 55.9412 91.2529 57.112 91.2529H72.6246C73.7954 91.2529 74.7445 90.3018 74.7445 89.1286C74.7445 87.9554 73.7954 87.0044 72.6246 87.0044Z',
  heartDark: 'M66.9408 129.576C66.2264 129.589 65.5073 129.328 64.9529 128.791L64.9252 128.764L54.9133 118.795C52.7611 116.763 52.1927 113.557 53.5146 110.906C55.3396 107.397 59.6583 106.034 63.1607 107.863C63.7473 108.169 64.2886 108.556 64.7693 109.011L66.7298 110.882L66.9408 129.576L66.9408 129.576Z',
  heartLight: 'M66.6931 129.579C67.4076 129.577 68.1212 129.301 68.6645 128.753L68.6916 128.725L78.4971 118.552C80.6072 116.476 81.1098 113.26 79.7338 110.637C77.8372 107.165 73.4915 105.892 70.0274 107.792C69.4472 108.111 68.9139 108.508 68.4427 108.973L66.5209 110.885L66.6931 129.579Z',
  armFrontL: 'M21.4892 128.032C28.7715 131.802 37.3796 133.373 45.5377 134.706C50.6981 135.549 52.9119 128.396 47.7179 127.547C40.2926 126.334 32.2655 125.057 25.6285 121.621C21.0396 119.246 16.9034 125.658 21.4892 128.032H21.4892Z',
  armFrontR: 'M106.327 116.481C100.673 122.554 90.4167 124.847 82.733 126.966C77.7987 128.327 79.8942 135.979 84.851 134.612C93.9304 132.108 105.313 129.228 111.961 122.088C115.442 118.349 109.821 112.728 106.327 116.481Z',
};

// ---------- colors ----------
const hex = (h) => [0, 2, 4].map((i) => +(parseInt(h.slice(i, i + 2), 16) / 255).toFixed(4));
const C_FLUFF = hex('E9D9F2');
const C_DARK = hex('3A3938');
const C_WHITE = [1, 1, 1];
const C_CHEEK = hex('D2B0E4');
const C_CHEEK_BRIGHT = hex('DFA5EC');
const C_BOX = hex('9561A8');
const C_LID = hex('D2B0E4');
const C_SLOT = hex('783E9E');
const C_HEART_D = hex('F7879A');
const C_HEART_L = hex('F9B8C0');
const C_COIN = hex('F9A25E');
const C_COIN_IN = hex('FDBE7F');

// ---------- SVG path -> lottie bezier ----------
const EPS = 0.02;
function parsePath(d) {
  const toks = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g);
  const subs = [];
  let pts = null, cur = [0, 0], startPt = [0, 0], i = 0, cmd = null;
  const num = () => parseFloat(toks[i++]);
  const flush = (closed) => { if (pts && pts.length) subs.push({ closed, pts }); pts = null; };
  const pushV = (p) => { pts.push({ v: [p[0], p[1]], i: [0, 0], o: [0, 0] }); };
  while (i < toks.length) {
    const t = toks[i];
    if (/[A-Za-z]/.test(t)) { cmd = t; i++; if (cmd === 'Z' || cmd === 'z') { flush(true); cmd = 'M-after-Z'; continue; } }
    switch (cmd) {
      case 'M': { flush(false); const p = [num(), num()]; pts = []; pushV(p); cur = p; startPt = p; cmd = 'L'; break; }
      case 'C': {
        const c1 = [num(), num()], c2 = [num(), num()], p = [num(), num()];
        const last = pts[pts.length - 1];
        last.o = [c1[0] - last.v[0], c1[1] - last.v[1]];
        pushV(p);
        pts[pts.length - 1].i = [c2[0] - p[0], c2[1] - p[1]];
        cur = p; break;
      }
      case 'L': { const p = [num(), num()]; if (Math.hypot(p[0] - cur[0], p[1] - cur[1]) > EPS) pushV(p); cur = p; break; }
      case 'H': { const p = [num(), cur[1]]; if (Math.abs(p[0] - cur[0]) > EPS) pushV(p); cur = p; break; }
      case 'V': { const p = [cur[0], num()]; if (Math.abs(p[1] - cur[1]) > EPS) pushV(p); cur = p; break; }
      default: throw new Error('unsupported cmd ' + cmd + ' in ' + d.slice(0, 40));
    }
  }
  flush(false);
  // merge duplicated closing vertex
  for (const s of subs) {
    const a = s.pts[0], b = s.pts[s.pts.length - 1];
    if (s.pts.length > 1 && Math.hypot(a.v[0] - b.v[0], a.v[1] - b.v[1]) < EPS) {
      a.i = b.i; s.pts.pop();
    }
  }
  return subs;
}
const r3 = (n) => Math.round(n * 1000) / 1000;
function shapesFromPath(d, nm) {
  return parsePath(d).map((sub, idx) => ({
    ty: 'sh', nm: nm + (idx ? '-' + idx : ''),
    ks: { a: 0, k: { c: sub.closed, v: sub.pts.map(p => p.v.map(r3)), i: sub.pts.map(p => p.i.map(r3)), o: sub.pts.map(p => p.o.map(r3)) } },
  }));
}
const fill = (c, anim) => ({ ty: 'fl', nm: 'fill', c: anim ? c : { a: 0, k: [...c, 1] }, o: { a: 0, k: 100 }, r: 1 });
const trDefault = () => ({ ty: 'tr', a: { a: 0, k: [0, 0] }, p: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } });
const grp = (nm, items) => ({ ty: 'gr', nm, it: [...items, trDefault()] });

// ---------- keyframes ----------
const E = {
  sine: { o: { x: 0.37, y: 0 }, i: { x: 0.63, y: 1 } },        // travel-balanced, symmetric organic loop
  settle: { o: { x: 0, y: 0.65 }, i: { x: 0.51, y: 0.99 } },   // settle-soft
  pop: { o: { x: 0.7, y: 0 }, i: { x: 0.34, y: 0.94 } },       // expressive-pop derived: fast out, soft land
  sharp: { o: { x: 0.2, y: 0.75 }, i: { x: 0.34, y: 0.94 } },  // entrance-sharp
  fall: { o: { x: 0.55, y: 0.02 }, i: { x: 0.8, y: 0.6 } },    // exit-accelerate derived: gravity
  lin: { o: { x: 0.33, y: 0.33 }, i: { x: 0.67, y: 0.67 } },
};
function kfs(keys) {
  return { a: 1, k: keys.map((k, idx) => {
    const out = { t: k.t, s: Array.isArray(k.s) ? k.s : [k.s] };
    if (idx < keys.length - 1) {
      if (k.h) out.h = 1;
      else { const e = k.e || E.sine; out.o = e.o; out.i = e.i; }
    }
    return out;
  }) };
}
const stat = (v) => ({ a: 0, k: v });

// ---------- layer factories ----------
const IP = 0, OP = 180;
let IND = 0;
function baseLayer(nm, ty, parent) {
  return { ddd: 0, ind: ++IND, ty, nm, sr: 1, parent, ao: 0, ip: IP, op: OP, st: 0,
    ks: { o: stat(100), r: stat(0), p: stat([0, 0, 0]), a: stat([0, 0, 0]), s: stat([100, 100, 100]) } };
}
function nullLayer(nm, parent) { return baseLayer(nm, 3, parent); }
function shapeLayer(nm, parent, shapes) { const l = baseLayer(nm, 4, parent); l.shapes = shapes; return l; }

// ---------- rig ----------
const root = nullLayer('Root 2x');
root.ks.s = stat([200, 200, 100]);
root.ks.p = stat([0, 20, 0]); // 20px canvas headroom for breath/hop; art sits flush at bottom

const bodyRig = nullLayer('BodyRig', root.ind);
bodyRig.ks.a = stat([65.3, 141, 0]);
bodyRig.ks.p = kfs([
  // idle breath: two cycles (bob up only — bottom stays planted)
  { t: 0, s: [65.3, 141, 0] }, { t: 30, s: [65.3, 138.9, 0] }, { t: 60, s: [65.3, 141, 0] },
  { t: 90, s: [65.3, 138.9, 0] }, { t: 120, s: [65.3, 141, 0], h: 1 },
  // hover hop: crouch is scale-only (no downward move), then launch up and land
  { t: 126, s: [65.3, 141, 0], e: E.pop }, { t: 134, s: [65.3, 136, 0], e: E.fall },
  { t: 143, s: [65.3, 141, 0] },
]);
bodyRig.ks.s = kfs([
  { t: 0, s: [100, 100, 100] }, { t: 30, s: [99.3, 100.7, 100] }, { t: 60, s: [100, 100, 100] },
  { t: 90, s: [99.3, 100.7, 100] }, { t: 120, s: [100, 100, 100], e: E.settle },
  { t: 126, s: [103.4, 95.8, 100], e: E.pop }, { t: 134, s: [97.6, 102.5, 100], e: E.fall },
  { t: 143, s: [102.2, 97.6, 100], e: E.settle }, { t: 152, s: [100, 100, 100] },
]);

const boxRig = nullLayer('BoxRig', bodyRig.ind);
boxRig.ks.a = stat([64.98, 140.64, 0]);
boxRig.ks.p = stat([64.98, 140.64, 0]);
boxRig.ks.s = kfs([
  { t: 0, s: [100, 100, 100], h: 1 }, { t: 49, s: [100, 100, 100], e: E.sharp },        // coin impact
  { t: 54, s: [102.6, 97.4, 100], e: E.settle }, { t: 61, s: [99.4, 100.4, 100], e: E.settle },
  { t: 70, s: [100, 100, 100], h: 1 },
  { t: 130, s: [100, 100, 100], e: E.pop }, { t: 138, s: [102.4, 98.2, 100], e: E.settle }, // hover hug squeeze
  { t: 154, s: [100, 100, 100] },
]);

// ---------- character layers ----------
const armFrontL = shapeLayer('Arm Front L', boxRig.ind, [grp('armL', [...shapesFromPath(D.armFrontL, 'p'), fill(C_FLUFF)])]);
armFrontL.ks.a = stat([35, 128, 0]);
armFrontL.ks.p = kfs([
  { t: 0, s: [35, 128, 0], h: 1 },
  { t: 126, s: [35, 128, 0], e: E.pop }, { t: 134, s: [36.8, 127.3, 0], e: E.settle }, { t: 152, s: [35, 128, 0] },
]);

const armFrontR = shapeLayer('Arm Front R', boxRig.ind, [grp('armR', [...shapesFromPath(D.armFrontR, 'p'), fill(C_FLUFF)])]);
armFrontR.ks.a = stat([96, 125, 0]);
armFrontR.ks.p = kfs([
  { t: 0, s: [96, 125, 0], h: 1 },
  { t: 126, s: [96, 125, 0], e: E.pop }, { t: 134, s: [94.2, 124.4, 0], e: E.settle }, { t: 152, s: [96, 125, 0] },
]);

const heart = shapeLayer('Heart', boxRig.ind, [
  grp('heart-light', [...shapesFromPath(D.heartLight, 'p'), fill(C_HEART_L)]),
  grp('heart-dark', [...shapesFromPath(D.heartDark, 'p'), fill(C_HEART_D)]),
]);
heart.ks.a = stat([66.6, 117.7, 0]);
heart.ks.p = stat([66.6, 117.7, 0]);
heart.ks.s = kfs([
  { t: 0, s: [100, 100, 100], h: 1 },
  // idle single pulse (reaction to coin)
  { t: 58, s: [100, 100, 100], e: E.pop }, { t: 66, s: [112, 112, 100], e: E.settle },
  { t: 74, s: [98.6, 98.6, 100], e: E.settle }, { t: 82, s: [100, 100, 100], h: 1 },
  // hover double pulse
  { t: 128, s: [100, 100, 100], e: E.pop }, { t: 134, s: [111, 111, 100], e: E.settle },
  { t: 140, s: [101, 101, 100], e: E.pop }, { t: 146, s: [114, 114, 100], e: E.settle },
  { t: 154, s: [98.6, 98.6, 100], e: E.settle }, { t: 162, s: [100, 100, 100] },
]);

// coin: shape-group animation under a static layer so the static mask clips it at the slot
const coinLayer = shapeLayer('Coin', bodyRig.ind, [{
  ty: 'gr', nm: 'coin', it: [
    grp('coin-inner', [{ ty: 'el', nm: 'el-in', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [6.6, 6.6] } }, fill(C_COIN_IN)]),
    grp('coin-outer', [{ ty: 'el', nm: 'el-out', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [11, 11] } }, fill(C_COIN)]),
    { ty: 'tr',
      a: stat([0, 0]),
      p: kfs([
        { t: 0, s: [64.87, 63], h: 1 }, { t: 26, s: [64.87, 63], e: E.fall },
        { t: 50, s: [64.87, 90.5], e: E.lin }, { t: 58, s: [64.87, 101] },
      ]),
      s: kfs([{ t: 0, s: [60, 60], h: 1 }, { t: 26, s: [60, 60], e: E.sharp }, { t: 34, s: [100, 100] }]),
      r: kfs([{ t: 0, s: -12, h: 1 }, { t: 26, s: -12, e: E.lin }, { t: 50, s: 5, e: E.lin }, { t: 58, s: 8 }]),
      o: kfs([{ t: 0, s: 0, h: 1 }, { t: 26, s: 0, e: E.sharp }, { t: 32, s: 100 }]),
    },
  ],
}]);
coinLayer.masksProperties = [{
  mode: 'a', inv: false, o: stat(100), x: stat(0), nm: 'slot-clip',
  pt: { a: 0, k: { c: true,
    v: [[44, 10], [86, 10], [86, 89.2], [44, 89.2]],
    i: [[0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0]] } },
}];

const slot = shapeLayer('Slot', boxRig.ind, [grp('slot', [...shapesFromPath(D.slot, 'p'), fill(C_SLOT)])]);
const lid = shapeLayer('Lid', boxRig.ind, [grp('lid', [...shapesFromPath(D.boxLid, 'p'), fill(C_LID)])]);
const boxBody = shapeLayer('Box', boxRig.ind, [grp('box', [...shapesFromPath(D.boxBody, 'p'), fill(C_BOX)])]);

const faceDetails = shapeLayer('Face Details', bodyRig.ind, [
  grp('mouth', [...shapesFromPath(D.mouth, 'p'), ...shapesFromPath(D.mouthCorner, 'q'),
    ...shapesFromPath(D.dot1, 'd1'), ...shapesFromPath(D.dot2, 'd2'),
    ...shapesFromPath(D.dot3, 'd3'), ...shapesFromPath(D.dot4, 'd4'), fill(C_DARK)]),
]);

const cheeks = shapeLayer('Cheeks', bodyRig.ind, [
  grp('cheeks', [...shapesFromPath(D.cheekL, 'p'), ...shapesFromPath(D.cheekR, 'q'),
    fill(kfs([
      { t: 0, s: [...C_CHEEK, 1], h: 1 },
      { t: 58, s: [...C_CHEEK, 1], e: E.pop }, { t: 66, s: [...C_CHEEK_BRIGHT, 1], e: E.settle }, { t: 82, s: [...C_CHEEK, 1], h: 1 },
      { t: 128, s: [...C_CHEEK, 1], e: E.pop }, { t: 140, s: [...C_CHEEK_BRIGHT, 1], e: E.settle }, { t: 162, s: [...C_CHEEK, 1] },
    ]), true)]),
]);

const eyeL = shapeLayer('Eye L', bodyRig.ind, [
  grp('pupil', [...shapesFromPath(D.eyeLPupil, 'p'), fill(C_DARK)]),
  grp('white', [...shapesFromPath(D.eyeLWhite, 'p'), fill(C_WHITE)]),
]);
eyeL.ks.a = stat([54.4, 57, 0]);
eyeL.ks.p = stat([54.4, 57, 0]);
eyeL.ks.s = kfs([
  { t: 0, s: [100, 100, 100], h: 1 }, { t: 96, s: [100, 100, 100], e: E.sharp },
  { t: 100, s: [100, 8, 100], h: 1 }, { t: 101.5, s: [100, 8, 100], e: E.settle }, { t: 106, s: [100, 100, 100] },
]);

const eyeR = shapeLayer('Eye R', bodyRig.ind, [
  grp('pupil', [...shapesFromPath(D.eyeRPupil, 'p'), fill(C_DARK)]),
  grp('white', [...shapesFromPath(D.eyeRWhite, 'p'), fill(C_WHITE)]),
]);
eyeR.ks.a = stat([74.2, 57.5, 0]);
eyeR.ks.p = stat([74.2, 57.5, 0]);
eyeR.ks.s = kfs([
  { t: 0, s: [100, 100, 100], h: 1 }, { t: 97, s: [100, 100, 100], e: E.sharp },
  { t: 101, s: [100, 8, 100], h: 1 }, { t: 102.5, s: [100, 8, 100], e: E.settle }, { t: 107, s: [100, 100, 100] },
]);

const body = shapeLayer('Body', bodyRig.ind, [grp('body', [...shapesFromPath(D.body, 'p'), fill(C_FLUFF)])]);
const armsBack = shapeLayer('Arms Back', bodyRig.ind, [
  grp('arms', [...shapesFromPath(D.armBackL, 'p'), ...shapesFromPath(D.armBackR, 'q'), fill(C_FLUFF)]),
]);

// ---------- assemble (array order = stacking, first is topmost) ----------
const lottie = {
  v: '5.9.0', fr: 30, ip: IP, op: OP, w: 264, h: 304, nm: 'Donate Widget', ddd: 0,
  assets: [],
  markers: [
    { tm: 0, cm: 'idle', dr: 120 },
    { tm: 120, cm: 'hover', dr: 60 },
  ],
  layers: [
    root, bodyRig, boxRig,
    armFrontL, armFrontR, heart, coinLayer, slot, lid, boxBody,
    faceDetails, cheeks, eyeL, eyeR, body, armsBack,
  ],
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(lottie));
const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log('wrote', OUT, kb + 'KB');
