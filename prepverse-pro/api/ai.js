// Vercel serverless function: POST /api/ai
const { callGemini, rateLimit } = require('../lib/gemini');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || 'anon';
  if (!rateLimit(ip)) return res.status(429).json({ error: 'Too many requests — slow down for a minute.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    res.status(200).json(await callGemini(body));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
};
