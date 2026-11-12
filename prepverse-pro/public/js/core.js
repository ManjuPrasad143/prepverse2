/* PrepVerse Pro – core: state, XP/streaks/badges, AI client, utils, charts, UI helpers */
(function () {
  const PV = (window.PV = { pages: {}, order: [], ui: {}, charts: {}, ai: null, aiOnline: false });
  const KEY = 'prepverse_pro_v1';

  /* ---------- utils ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const fmtTime = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return iso; } };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function md(src) {
    let s = esc(src || '');
    const blocks = [];
    s = s.replace(/```(\w*)\n?([\s\S]*?)```/g, (m, l, c) => { blocks.push(`<pre><code>${c}</code></pre>`); return `\u0000${blocks.length - 1}\u0000`; });
    s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, '$1<em>$2</em>');
    let out = '', list = null;
    const close = () => { if (list) { out += `</${list}>`; list = null; } };
    for (const ln of s.split('\n')) {
      let m;
      if (/^\u0000\d+\u0000$/.test(ln.trim())) { close(); out += ln.trim(); }
      else if ((m = ln.match(/^(#{1,4})\s+(.*)/))) { close(); const n = Math.min(m[1].length + 2, 6); out += `<h${n}>${m[2]}</h${n}>`; }
      else if ((m = ln.match(/^\s*[-*•]\s+(.*)/))) { if (list !== 'ul') { close(); out += '<ul>'; list = 'ul'; } out += `<li>${m[1]}</li>`; }
      else if ((m = ln.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== 'ol') { close(); out += '<ol>'; list = 'ol'; } out += `<li>${m[1]}</li>`; }
      else if (!ln.trim()) close();
      else { close(); out += `<p>${ln}</p>`; }
    }
    close();
    return out.replace(/\u0000(\d+)\u0000/g, (m, i) => blocks[i]);
  }

  function parseJSON(t) {
    t = String(t || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    try { return JSON.parse(t); } catch (_) { /* fall through */ }
    const a = Math.min(...['{', '['].map((c) => { const i = t.indexOf(c); return i < 0 ? Infinity : i; }));
    const b = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
    if (a !== Infinity && b > a) return JSON.parse(t.slice(a, b + 1));
    throw new Error('AI returned an unreadable response. Please try again.');
  }
  Object.assign(PV, { esc, dkey, uid, clamp, shuffle, hashStr, fmtTime, fmtDate, $, $$, md, parseJSON });

  /* ---------- state ---------- */
  const defaults = () => ({
    v: 1, theme: 'dark',
    profile: { name: '', college: '', degree: 'B.E / B.Tech', year: 'Final year', role: 'Software Engineer', skills: '', goalDate: '', about: '' },
    xp: 0, streak: { count: 0, last: '' }, activity: {},
    interviews: [], quizzes: [], coding: { solved: {}, code: {} }, resume: null, applications: [],
    planner: { plan: null, done: {} }, decks: {}, coach: [], badges: {}, focus: { sessions: 0, minutes: 0 }, notes: {}, daily: {},
  });
  let S = defaults();
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      const d = defaults();
      for (const k of Object.keys(d)) {
        if (saved[k] === undefined) continue;
        S[k] = d[k] && typeof d[k] === 'object' && !Array.isArray(d[k]) ? Object.assign({}, d[k], saved[k]) : saved[k];
      }
    } catch (_) { S = defaults(); }
  }
  let saveT;
  function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { PV.ui.toast('Storage full – export your data from Profile.', 'bad'); } }, 120); renderChrome(); }
  load();
  PV.S = () => S;
  PV.save = save;
  PV.replaceState = (obj) => { S = Object.assign(defaults(), obj); save(); };
  PV.resetState = () => { S = defaults(); localStorage.removeItem(KEY); };

  /* ---------- XP, streak, badges ---------- */
  const xpFor = (l) => 60 * (l - 1) ** 2;
  const levelOf = (xp) => Math.floor(Math.sqrt(xp / 60)) + 1;
  const BADGES = [
    { id: 'first', e: '🚀', n: 'First Steps', d: 'Earn your first XP', t: (s) => s.xp > 0 },
    { id: 'interview1', e: '🎤', n: 'Mic Check', d: 'Finish a mock interview', t: (s) => s.interviews.length >= 1 },
    { id: 'interview5', e: '🏆', n: 'Interview Pro', d: 'Finish 5 mock interviews', t: (s) => s.interviews.length >= 5 },
    { id: 'quiz5', e: '🧠', n: 'Quiz Whiz', d: 'Complete 5 quizzes', t: (s) => s.quizzes.length >= 5 },
    { id: 'perfect', e: '💯', n: 'Perfectionist', d: 'Score 100% on a quiz (5+ questions)', t: (s) => s.quizzes.some((q) => q.total >= 5 && q.correct === q.total) },
    { id: 'code5', e: '💻', n: 'Code Ninja', d: 'Solve 5 coding problems', t: (s) => Object.keys(s.coding.solved).length >= 5 },
    { id: 'streak3', e: '🔥', n: 'On Fire', d: '3-day streak', t: (s) => s.streak.count >= 3 },
    { id: 'streak7', e: '⚡', n: 'Unstoppable', d: '7-day streak', t: (s) => s.streak.count >= 7 },
    { id: 'resume', e: '📄', n: 'Resume Ready', d: 'Build your resume', t: (s) => !!(s.resume && s.resume.xpGiven) },
    { id: 'apps5', e: '📬', n: 'Go-Getter', d: 'Track 5 applications', t: (s) => s.applications.length >= 5 },
    { id: 'planner', e: '🗓️', n: 'Planner', d: 'Generate a study plan', t: (s) => !!s.planner.plan },
    { id: 'xp1000', e: '👑', n: 'Legend', d: 'Reach 1000 XP', t: (s) => s.xp >= 1000 },
  ];
  PV.BADGES = BADGES;
  function touch() {
    const t = dkey(), y = dkey(new Date(Date.now() - 864e5));
    S.activity[t] = (S.activity[t] || 0) + 1;
    if (S.streak.last !== t) { S.streak.count = S.streak.last === y ? S.streak.count + 1 : 1; S.streak.last = t; }
  }
  function checkBadges() {
    for (const b of BADGES) if (!S.badges[b.id] && b.t(S)) { S.badges[b.id] = dkey(); PV.ui.toast(`${b.e} Badge unlocked: ${b.n}`, 'good'); }
  }
  PV.addXP = (n, why) => {
    const before = levelOf(S.xp);
    S.xp += n; touch(); checkBadges(); save();
    PV.ui.toast(`+${n} XP${why ? ' · ' + why : ''}`, 'good');
    if (levelOf(S.xp) > before) PV.ui.toast(`🎉 Level up! You are now level ${levelOf(S.xp)}`, 'good');
  };
  PV.track = () => { touch(); checkBadges(); save(); }; // activity without XP
  PV.level = () => { const l = levelOf(S.xp), a = xpFor(l), b = xpFor(l + 1); return { l, pct: Math.round(((S.xp - a) / (b - a)) * 100), next: b - S.xp }; };
  PV.liveStreak = () => { const t = dkey(), y = dkey(new Date(Date.now() - 864e5)); return S.streak.last === t || S.streak.last === y ? S.streak.count : 0; };

  PV.readiness = () => {
    const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
    const quiz = avg(S.quizzes.slice(-8).map((q) => (q.correct / q.total) * 100));
    const intv = avg(S.interviews.slice(-5).map((i) => i.overall || 0));
    const code = Math.min(100, (Object.keys(S.coding.solved).length / 8) * 100);
    const p = S.profile; const prof = ([p.name, p.college, p.role, p.skills].filter(Boolean).length / 4) * 100;
    const res = S.resume && S.resume.xpGiven ? 100 : 0;
    const score = Math.round(quiz * 0.3 + intv * 0.3 + code * 0.2 + prof * 0.1 + res * 0.1);
    return { score, parts: { Aptitude: Math.round(quiz), Interview: Math.round(intv), Coding: Math.round(code), Profile: Math.round(prof), Resume: res } };
  };

  /* ---------- AI client ---------- */
  PV.ai = async (o) => {
    let r;
    try { r = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }); }
    catch { throw new Error('Cannot reach the server. Is it running?'); }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || `AI error ${r.status}`);
    return d.text;
  };
  PV.aiJSON = async (o) => parseJSON(await PV.ai({ ...o, json: true, temperature: o.temperature ?? 0.5 }));
  PV.profileCtx = () => {
    const p = S.profile;
    return `Candidate profile — Name: ${p.name || 'N/A'}; Degree: ${p.degree}, ${p.year}; College: ${p.college || 'N/A'}; Target role: ${p.role}; Skills: ${p.skills || 'not provided'}; About: ${p.about || 'N/A'}.`;
  };
  PV.checkAI = async () => {
    try { const d = await (await fetch('/api/health')).json(); PV.aiOnline = !!d.ai; } catch { PV.aiOnline = false; }
    renderChrome();
  };

  /* ---------- UI helpers ---------- */
  PV.ui.toast = (msg, kind = '') => {
    const el = document.createElement('div'); el.className = 'toast ' + kind; el.textContent = msg;
    document.getElementById('toasts').appendChild(el); setTimeout(() => el.remove(), 3600);
  };
  PV.ui.thinking = (msg = 'Thinking…') => `<div class="thinking"><span class="loader"></span><span>${esc(msg)}</span></div>`;
  PV.ui.modal = (html, wide) => {
    const root = document.getElementById('modalRoot');
    root.innerHTML = `<div class="modal-bg"><div class="modal ${wide ? 'wide' : ''}">${html}</div></div>`;
    const close = () => (root.innerHTML = '');
    root.firstChild.addEventListener('mousedown', (e) => { if (e.target === root.firstChild) close(); });
    $$('[data-close]', root).forEach((b) => b.addEventListener('click', close));
    return { close, root: root.firstChild.firstChild };
  };
  PV.ui.confirm = (msg, yes = 'Confirm') => new Promise((res) => {
    const m = PV.ui.modal(`<h3>${esc(msg)}</h3><div class="row mt"><button class="btn danger" id="cy">${esc(yes)}</button><button class="btn" id="cn">Cancel</button></div>`);
    $('#cy', m.root).onclick = () => { m.close(); res(true); }; $('#cn', m.root).onclick = () => { m.close(); res(false); };
  });
  // Run an async AI action on a button with loading + error handling
  PV.ui.run = async (btn, fn) => {
    const old = btn ? btn.innerHTML : ''; if (btn) { btn.disabled = true; btn.innerHTML = '<span class="loader"></span> Working…'; }
    try { return await fn(); }
    catch (e) { PV.ui.toast(e.message || 'Something went wrong', 'bad'); }
    finally { if (btn && btn.isConnected) { btn.disabled = false; btn.innerHTML = old; } }
  };
  PV.ui.download = (name, text, type = 'application/json') => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  PV.ui.speak = (text) => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'en-IN'; u.rate = 1; speechSynthesis.speak(u); } catch (_) {} };
  PV.ui.listen = (onText, onEnd) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { PV.ui.toast('Voice input is not supported in this browser (try Chrome).', 'bad'); return null; }
    const r = new SR(); r.lang = 'en-IN'; r.interimResults = true; r.continuous = true;
    let fin = '';
    r.onresult = (e) => { let tmp = ''; for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) fin += t + ' '; else tmp += t; } onText(fin + tmp); };
    r.onend = () => onEnd && onEnd(); r.onerror = () => onEnd && onEnd();
    r.start(); return r;
  };

  /* ---------- charts (inline SVG / CSS) ---------- */
  PV.charts.ring = (pct, size = 120, label) => {
    const r = size / 2 - 9, c = 2 * Math.PI * r, p = clamp(pct, 0, 100);
    const col = p >= 70 ? 'var(--good)' : p >= 40 ? 'var(--warn)' : 'var(--bad)';
    return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--card2)" stroke-width="10"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(c * p) / 100} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg><span>${label ?? Math.round(p)}</span></div>`;
  };
  PV.charts.radar = (items, size = 280) => {
    const n = items.length, cx = size / 2, cy = size / 2, R = size / 2 - 42;
    const pt = (i, v) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return [cx + Math.cos(a) * R * (v / 100), cy + Math.sin(a) * R * (v / 100)]; };
    let g = '';
    for (const lv of [25, 50, 75, 100]) g += `<polygon points="${items.map((_, i) => pt(i, lv).join(',')).join(' ')}" fill="none" stroke="var(--line)"/>`;
    items.forEach((_, i) => { const [x, y] = pt(i, 100); g += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)"/>`; });
    const poly = items.map((it, i) => pt(i, clamp(it.value, 0, 100)).join(',')).join(' ');
    const labels = items.map((it, i) => { const [x, y] = pt(i, 122); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="700" fill="var(--muted)">${esc(it.label)}</text>`; }).join('');
    return `<svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:${size}px">${g}<polygon points="${poly}" fill="rgba(124,108,255,.35)" stroke="var(--accent)" stroke-width="2"/>${items.map((it, i) => { const [x, y] = pt(i, clamp(it.value, 0, 100)); return `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--accent2)"/>`; }).join('')}${labels}</svg>`;
  };
  PV.charts.line = (vals, w = 360, h = 120) => {
    if (vals.length < 2) return `<div class="muted" style="padding:20px 0">Need at least 2 data points for a trend.</div>`;
    const max = 100, step = (w - 20) / (vals.length - 1);
    const pts = vals.map((v, i) => [10 + i * step, h - 14 - (clamp(v, 0, max) / max) * (h - 28)]);
    return `<svg viewBox="0 0 ${w} ${h}" width="100%"><defs><linearGradient id="lg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".45"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs><polygon points="10,${h - 14} ${pts.map((p) => p.join(',')).join(' ')} ${w - 10},${h - 14}" fill="url(#lg)"/><polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="var(--accent2)"><title>${Math.round(vals[i])}%</title></circle>`).join('')}</svg>`;
  };
  PV.charts.bars = (rows) => rows.map((r) => `<div class="bar-row"><span>${esc(r.label)}</span><div class="progress"><i style="width:${clamp(r.value, 0, 100)}%;${r.color ? 'background:' + r.color : ''}"></i></div><b>${Math.round(r.value)}%</b></div>`).join('');
  PV.charts.heat = (activity, weeks = 18) => {
    const cells = [], today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today); start.setDate(start.getDate() - (weeks * 7 - 1) - today.getDay() + 6 - 6);
    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      if (d > today) { cells.push('<i style="visibility:hidden"></i>'); continue; }
      const n = activity[dkey(d)] || 0, l = n === 0 ? '' : n < 2 ? 'l1' : n < 4 ? 'l2' : n < 7 ? 'l3' : 'l4';
      cells.push(`<i class="${l}" title="${dkey(d)}: ${n} activit${n === 1 ? 'y' : 'ies'}"></i>`);
    }
    return `<div class="heat">${cells.join('')}</div>`;
  };

  /* ---------- page registry + chrome ---------- */
  PV.page = (id, def) => { PV.pages[id] = def; PV.order.push(id); };
  function renderChrome() {
    const lv = PV.level();
    const x = document.getElementById('xpMini');
    if (x) x.innerHTML = `<div class="row between"><b>Level ${lv.l}</b><span class="muted">${S.xp} XP</span></div><div class="progress mt-s"><i style="width:${lv.pct}%"></i></div><small>${lv.next} XP to next level</small>`;
    const sp = document.getElementById('streakPill'); if (sp) sp.textContent = `🔥 ${PV.liveStreak()}`;
    const ai = document.getElementById('aiStatus'); if (ai) { ai.textContent = PV.aiOnline ? 'AI online' : 'AI offline'; ai.className = 'pill ' + (PV.aiOnline ? 'ok' : 'bad'); }
    document.documentElement.dataset.theme = S.theme;
    const tb = document.getElementById('themeBtn'); if (tb) tb.textContent = S.theme === 'dark' ? '🌙' : '☀️';
  }
  PV.renderChrome = renderChrome;
})();
