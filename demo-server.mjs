// Demo partner site for the giving.sg donation widget (iframe-launcher flow).
// Static-serves the fake charity page + widget assets. No backend/session
// endpoint is needed for this flow — the widget opens the giving.sg checkout
// directly in an iframe.
//
//   node demo-server.mjs      → http://localhost:8787
//
// NOTE: the checkout iframe is CSP-blocked on localhost (not in giving.sg's
// frame-ancestors allowlist) — expected. This demo verifies the mascot + modal
// open/close mechanics; the real iframe renders only from an allowlisted origin.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STATIC = {
  '/': ['demo/index.html', 'text/html'],
  '/embed.js': ['embed.js', 'text/javascript'],
  '/donate-widget.json': ['donate-widget.json', 'application/json'],
  '/lottie_light.min.js': ['lottie_light.min.js', 'text/javascript'],
};

const PORT = 8787;
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const hit = STATIC[url.pathname];
  if (!hit) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': hit[1] });
  res.end(fs.readFileSync(path.join(__dirname, hit[0])));
}).listen(PORT, () => console.log(`demo partner site: http://localhost:${PORT}`));
