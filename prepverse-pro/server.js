// Zero-dependency local server: serves /public and proxies /api/ai to Gemini.
const http = require('http');
const fs = require('fs');
const path = require('path');

// Minimal .env loader (no dotenv dependency)
try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith('#') && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch (_) {}

const { callGemini, rateLimit } = require('./lib/gemini');
const PUBLIC = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
};

function send(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/api/health') return send(res, 200, { ok: true, ai: !!process.env.GEMINI_API_KEY });

    if (url.pathname === '/api/ai' && req.method === 'POST') {
      const ip = req.socket.remoteAddress || 'local';
      if (!rateLimit(ip)) return send(res, 429, { error: 'Too many requests — slow down for a minute.' });
      let raw = '';
      req.on('data', (c) => { raw += c; if (raw.length > 200_000) req.destroy(); });
      req.on('end', async () => {
        try {
          const out = await callGemini(JSON.parse(raw || '{}'));
          send(res, 200, out);
        } catch (e) {
          send(res, e.status || 500, { error: e.message });
        }
      });
      return;
    }

    // static files
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/') rel = '/index.html';
    const file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC)) return send(res, 403, { error: 'Forbidden' });
    fs.readFile(file, (err, buf) => {
      if (err) {
        // SPA fallback
        return fs.readFile(path.join(PUBLIC, 'index.html'), (e2, b2) => {
          if (e2) return send(res, 404, { error: 'Not found' });
          res.writeHead(200, { 'Content-Type': MIME['.html'] });
          res.end(b2);
        });
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(buf);
    });
  })
  .listen(PORT, () => {
    console.log(`\n  PrepVerse Pro running → http://localhost:${PORT}`);
    console.log(`  Gemini key: ${process.env.GEMINI_API_KEY ? 'loaded ✔' : 'MISSING ✘ (add GEMINI_API_KEY to .env)'}\n`);
  });
