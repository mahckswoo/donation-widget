// ─────────────────────────────────────────────────────────────────────────
// giving.sg donation widget — partner session endpoint (starter kit)
//
// One endpoint:  POST /giving-sg/session
// The donation widget on your website calls it when a donor picks an
// amount. This server adds your secret credentials, calls the giving.sg
// partnerDonations API, and returns the checkout URL for the widget to
// redirect the donor to.
//
// Zero dependencies. Requires Node 18+ (built-in fetch).
//
//   cp .env.example .env   # fill in your credentials
//   node server.mjs
//
// Using Express/Fastify/etc. already? Copy createSession() and the
// handler body into a route — nothing here depends on this http server.
// ─────────────────────────────────────────────────────────────────────────
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

// ── minimal .env loader (no dotenv dependency) ──────────────────────────
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !m[1].startsWith('#') && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').replace(/\s+#.*$/, '').trim();
    }
  }
}

const ENVS = {
  uat: {
    tokenUrl: 'https://dk-api-uat.auth.ap-southeast-1.amazoncognito.com/oauth2/token',
    apiUrl: 'https://api-uat.giving.sg/v1/partnerdonation/sessionurl',
  },
  prod: {
    tokenUrl: 'https://dk-api.auth.ap-southeast-1.amazoncognito.com/oauth2/token',
    // NOTE: confirm the production API base URL with giving.sg at go-live.
    apiUrl: 'https://api.giving.sg/v1/partnerdonation/sessionurl',
  },
};

const CFG = {
  ...ENVS[process.env.GSG_ENV === 'prod' ? 'prod' : 'uat'],
  clientId: process.env.GSG_CLIENT_ID || '',
  clientSecret: process.env.GSG_CLIENT_SECRET || '',
  apiKey: process.env.GSG_API_KEY || '',
  campaignGuid: process.env.GSG_CAMPAIGN_GUID || '',
  returnUrl: process.env.RETURN_URL || '',
  port: Number(process.env.PORT || 8787),
};

for (const k of ['clientId', 'clientSecret', 'apiKey', 'campaignGuid', 'returnUrl']) {
  if (!CFG[k]) { console.error(`Missing config: ${k} — copy .env.example to .env and fill it in.`); process.exit(1); }
}

// ── OAuth2 client-credentials token, cached until near expiry ───────────
let cachedToken = null; // { token, expiresAt }

async function getToken(force = false) {
  if (!force && cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.token;
  }
  const basic = Buffer.from(`${CFG.clientId}:${CFG.clientSecret}`).toString('base64');
  const res = await fetch(CFG.tokenUrl, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new Error(`giving.sg token request failed: HTTP ${res.status}`);
  }
  cachedToken = { token: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 };
  return cachedToken.token;
}

// ── create a checkout session with the giving.sg API ────────────────────
export async function createSession({ amount, type, frequency, endDate, claimTdr }) {
  const body = {
    campaignGuid: CFG.campaignGuid,
    // Must be unique per attempt — it is consumed even if the donor
    // abandons checkout, so we mint a fresh one on every click.
    partnerTransactionId: crypto.randomUUID(),
    donationAmount: amount,
    claimTdr: Boolean(claimTdr),
    donationType: type,
    returnUrl: CFG.returnUrl,
  };
  // Per API rules: frequency/endDate must be present for recurring and
  // absent for one-time.
  if (type === 'recurring') {
    body.donationFrequency = frequency || 'monthly';
    if (endDate) body.donationEndDate = endDate;
  }

  const call = async (token) => fetch(CFG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-api-key': CFG.apiKey },
    body: JSON.stringify(body),
  });

  let res = await call(await getToken());
  if (res.status === 401) res = await call(await getToken(true)); // token expired mid-flight → refresh once

  const json = await res.json().catch(() => ({}));
  if (res.ok && json.url) return { ok: true, url: json.url };
  // Pass the API's validation message through so the widget can show it
  // (e.g. "donationAmount cannot be less than 10.00.").
  return { ok: false, status: res.status, message: json.message || 'Unable to start donation. Please try again.' };
}

// ── request handler for POST /giving-sg/session ─────────────────────────
export function sessionHandler(req, res) {
  const send = (status, obj) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
  };

  let raw = '';
  req.on('data', (c) => { raw += c; if (raw.length > 10_000) req.destroy(); });
  req.on('end', async () => {
    try {
      const b = JSON.parse(raw || '{}');

      // Basic input checks; the giving.sg API is the real validator and its
      // messages are passed back to the widget.
      const amount = Number(b.amount);
      const type = b.type === 'recurring' ? 'recurring' : 'one-time';
      if (!Number.isFinite(amount) || amount <= 0) {
        return send(400, { message: 'Please enter a valid donation amount.' });
      }

      const result = await createSession({
        amount, type,
        frequency: b.frequency,
        endDate: b.endDate,
        claimTdr: b.claimTdr,
      });
      if (result.ok) return send(200, { url: result.url });
      return send(result.status === 500 ? 502 : 400, { message: result.message });
    } catch (err) {
      console.error('[giving-sg/session]', err.message);
      return send(502, { message: 'Unable to start donation. Please try again.' });
    }
  });
}

// ── standalone server (skipped when imported as a module) ───────────────
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && new URL(req.url, 'http://x').pathname === '/giving-sg/session') {
      return sessionHandler(req, res);
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Not found' }));
  });
  server.listen(CFG.port, () => {
    console.log(`giving.sg session endpoint ready: POST http://localhost:${CFG.port}/giving-sg/session  (env: ${process.env.GSG_ENV || 'uat'})`);
  });
}
