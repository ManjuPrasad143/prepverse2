module.exports = (req, res) => res.status(200).json({ ok: true, ai: !!process.env.GEMINI_API_KEY });
