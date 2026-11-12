// Shared Gemini proxy logic (used by the local server and the Vercel function).
// The API key is read from the environment ONLY — it is never sent to the browser.

const MODELS = () => {
  const primary = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  return [...new Set([primary, 'gemini-2.0-flash'])];
};

const hits = new Map(); // naive in-memory rate limit: ip -> [timestamps]
function rateLimit(ip, max = 40, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return false;
  arr.push(now);
  hits.set(ip, arr);
  return true;
}

async function callGemini({ prompt, system, json, history, temperature }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const e = new Error('GEMINI_API_KEY is not set on the server. Add it to .env (local) or Vercel project settings.');
    e.status = 500;
    throw e;
  }
  if (!prompt || typeof prompt !== 'string') {
    const e = new Error('Missing "prompt"');
    e.status = 400;
    throw e;
  }

  const contents = [];
  for (const m of (Array.isArray(history) ? history : []).slice(-24)) {
    contents.push({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(m.text || '').slice(0, 8000) }],
    });
  }
  contents.push({ role: 'user', parts: [{ text: prompt.slice(0, 30000) }] });

  const body = {
    contents,
    generationConfig: { temperature: typeof temperature === 'number' ? temperature : 0.7 },
  };
  if (system) body.systemInstruction = { parts: [{ text: String(system).slice(0, 8000) }] };
  if (json) body.generationConfig.responseMimeType = 'application/json';

  let last = { status: 502, message: 'Gemini request failed' };
  for (const model of MODELS()) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    let r, data;
    try {
      r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
      });
      data = await r.json().catch(() => ({}));
    } catch (err) {
      last = { status: 502, message: 'Network error reaching Gemini: ' + err.message };
      continue;
    }
    if (r.ok) {
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const text = parts.map((p) => p.text || '').join('').trim();
      if (!text) {
        last = { status: 502, message: data?.promptFeedback?.blockReason ? 'Blocked: ' + data.promptFeedback.blockReason : 'Empty response from Gemini' };
        continue;
      }
      return { text, model };
    }
    last = { status: r.status, message: data?.error?.message || 'Gemini error ' + r.status };
    if (![404, 429, 500, 503].includes(r.status)) break; // try the next model only for transient/model errors
  }
  const e = new Error(last.message);
  e.status = last.status;
  throw e;
}

module.exports = { callGemini, rateLimit };
