/* Growth tools: AI career coach, study planner, spaced-repetition flashcards, focus timer */
(function () {
  const { esc, $, $$ } = PV;

  /* =====================================================
     AI CAREER COACH
  ===================================================== */
  const COACH_SYS = 'You are PrepVerse Coach, a warm, practical career mentor for Indian engineering and degree students preparing for campus placements and internships. Give specific, actionable advice in short paragraphs or bullets (under 220 words unless asked for more). Ask a clarifying question when the goal is vague. Never invent facts about specific companies\' current hiring numbers or salaries; say when something should be verified.';
  PV.page('coach', {
    title: 'AI Career Coach', icon: '🤖', group: 'Grow', blurb: 'Ask anything about placements, careers & skills',
    render(root) {
      const s = PV.S(); let busy = false;
      const sugg = ['How do I prepare for TCS NQT in 30 days?', 'Review my plan: DSA + projects in 3 months', 'How to explain a gap year in HR round?', 'Roadmap to become a full-stack developer', 'How to answer "Tell me about yourself"?', 'Salary negotiation tips for freshers'];
      root.innerHTML = `<div class="page-head"><div><h1>🤖 AI Career Coach</h1><p>Your 24/7 mentor — knows your profile.</p></div><button class="btn sm danger" id="kClear">Clear chat</button></div>
      <div class="card"><div class="chat" id="kChat" style="max-height:58vh;min-height:280px"></div>
      <div class="row mt-s" id="kSugg">${sugg.map((x) => `<button class="chip" data-s="${esc(x)}">${esc(x)}</button>`).join('')}</div>
      <div class="composer"><textarea id="kIn" placeholder="Ask your coach… (Enter to send, Shift+Enter for new line)" style="min-height:52px"></textarea><button class="btn primary" id="kSend">Send</button></div></div>`;
      const chat = $('#kChat');
      const add = (who, text) => { const d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = PV.md(text); chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d; };
      if (!s.coach.length) add('ai', `Hi${s.profile.name ? ' ' + esc(s.profile.name.split(' ')[0]) : ''}! 👋 I'm your placement coach. Tell me your goal or pick a suggestion below.`);
      s.coach.forEach((m) => add(m.role === 'user' ? 'me' : 'ai', m.text));
      const send = async (text) => {
        text = (text || $('#kIn').value).trim(); if (!text || busy) return; busy = true; $('#kIn').value = '';
        add('me', text); const typing = add('ai', '…');
        try {
          const reply = await PV.ai({ system: COACH_SYS + ' ' + PV.profileCtx(), history: s.coach.slice(-16), prompt: text, temperature: 0.7 });
          s.coach.push({ role: 'user', text }, { role: 'model', text: reply }); if (s.coach.length > 60) s.coach = s.coach.slice(-60);
          typing.innerHTML = PV.md(reply); PV.save(); PV.track();
        } catch (e) { typing.remove(); chat.lastChild && chat.lastChild.remove(); PV.ui.toast(e.message, 'bad'); $('#kIn').value = text; }
        busy = false; chat.scrollTop = chat.scrollHeight;
      };
      $('#kSend').onclick = () => send();
      $('#kIn').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
      $$('[data-s]').forEach((b) => (b.onclick = () => send(b.dataset.s)));
      $('#kClear').onclick = async () => { if (await PV.ui.confirm('Clear the whole conversation?', 'Clear')) { s.coach = []; PV.save(); PV.pages.coach.render(root); } };
    },
  });

  /* =====================================================
     STUDY PLANNER
  ===================================================== */
  PV.page('planner', {
    title: 'Study Planner', icon: '🗓️', group: 'Grow', blurb: 'AI-built week-by-week placement roadmap',
    render(root) {
      const s = PV.S(), P = s.planner;
      function draw() {
        if (!P.plan) {
          root.innerHTML = `<div class="page-head"><div><h1>🗓️ Study Planner</h1><p>Tell me your timeline — I'll build a personalised roadmap you can tick off.</p></div></div>
          <div class="card"><div class="grid g3"><div class="field"><label>Target role</label><input id="pR" value="${esc(s.profile.role)}"/></div><div class="field"><label>Duration</label><select id="pW"><option value="2">2 weeks</option><option value="4" selected>4 weeks</option><option value="8">8 weeks</option><option value="12">12 weeks</option></select></div><div class="field"><label>Hours per day</label><select id="pH"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>6</option></select></div></div>
          <div class="grid g2"><div class="field"><label>Current level / strengths</label><input id="pS" value="${esc(s.profile.skills)}" placeholder="What you already know"/></div><div class="field"><label>Weak areas / focus</label><input id="pK" placeholder="e.g. DSA, aptitude speed, communication"/></div></div>
          <div class="field"><label>Target companies / exams (optional)</label><input id="pC" placeholder="e.g. TCS NQT, Infosys, product startups"/></div>
          <button class="btn primary" id="pGo">✨ Generate my plan</button></div>`;
          $('#pGo').onclick = (e) => PV.ui.run(e.target, async () => {
            const weeks = +$('#pW').value;
            const r = await PV.aiJSON({ temperature: 0.6, prompt: `Create a ${weeks}-week placement preparation plan.\n${PV.profileCtx()}\nTarget role: ${$('#pR').value}. Hours/day: ${$('#pH').value}. Current skills: ${$('#pS').value}. Weak areas: ${$('#pK').value || 'unknown'}. Targets: ${$('#pC').value || 'general campus placements'}.\nEach week has 5–7 concrete, checkable tasks (include aptitude, DSA/coding, CS fundamentals, projects, resume and mock interviews in a sensible progression, with specific topics). Return JSON: {"title":"","summary":"1-2 sentences","weeks":[{"week":1,"theme":"","goal":"","tasks":[{"t":"specific task with topic and time estimate","type":"aptitude|dsa|cs|project|interview|resume|other"}]}],"tips":["..."]}. Exactly ${weeks} weeks.` });
            if (!r.weeks || !r.weeks.length) throw new Error('Plan came back empty — please try again.');
            P.plan = { title: String(r.title || 'My placement plan'), summary: String(r.summary || ''), weeks: r.weeks.map((w) => ({ week: w.week, theme: String(w.theme || ''), goal: String(w.goal || ''), tasks: (w.tasks || []).map((t) => ({ t: String(t.t || t), type: String(t.type || 'other') })) })), tips: [].concat(r.tips || []).map(String), created: new Date().toISOString() };
            P.done = {}; PV.save(); PV.track(); PV.addXP(15, 'study plan created'); draw();
          });
          return;
        }
        const total = P.plan.weeks.reduce((a, w) => a + w.tasks.length, 0), done = Object.values(P.done).filter(Boolean).length;
        const icon = { aptitude: '🔢', dsa: '🌲', cs: '🖥️', project: '🛠️', interview: '🎤', resume: '📄' };
        root.innerHTML = `<div class="page-head"><div><h1>🗓️ ${esc(P.plan.title)}</h1><p>${esc(P.plan.summary)}</p></div><button class="btn sm danger" id="pDel">Start over</button></div>
        <div class="card mb"><div class="row between"><b>${done}/${total} tasks done</b><span class="muted">${Math.round((done / Math.max(1, total)) * 100)}%</span></div><div class="progress mt-s"><i style="width:${(done / Math.max(1, total)) * 100}%"></i></div></div>
        <div class="grid g2">${P.plan.weeks.map((w, wi) => `<div class="card"><h3>Week ${esc(w.week ?? wi + 1)} · ${esc(w.theme)}</h3><p class="muted">${esc(w.goal)}</p>${w.tasks.map((t, ti) => `<label style="display:flex;gap:10px;align-items:flex-start;color:var(--text);font-weight:500;font-size:.92rem;cursor:pointer;margin-bottom:8px"><input type="checkbox" data-k="${wi}-${ti}" ${P.done[wi + '-' + ti] ? 'checked' : ''} style="margin-top:4px"/><span class="${P.done[wi + '-' + ti] ? 'muted' : ''}" ${P.done[wi + '-' + ti] ? 'style="text-decoration:line-through"' : ''}>${icon[t.type] || '📌'} ${esc(t.t)}</span></label>`).join('')}</div>`).join('')}</div>
        ${P.plan.tips.length ? `<div class="card mt"><h3>💡 Tips</h3><ul>${P.plan.tips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}`;
        $$('[data-k]').forEach((c) => (c.onchange = () => { const was = P.done[c.dataset.k]; P.done[c.dataset.k] = c.checked; PV.save(); if (c.checked && !was) PV.addXP(3, 'task done'); draw(); }));
        $('#pDel').onclick = async () => { if (await PV.ui.confirm('Delete this plan and make a new one?', 'Delete plan')) { P.plan = null; P.done = {}; PV.save(); draw(); } };
      }
      draw();
    },
  });

  /* =====================================================
     FLASHCARDS (spaced repetition)
  ===================================================== */
  const dayNum = () => Math.floor(Date.now() / 864e5);
  PV.page('flashcards', {
    title: 'Flashcards', icon: '🃏', group: 'Practice', blurb: 'Spaced repetition decks + AI deck builder',
    render(root) {
      const s = PV.S();
      const ensure = (name) => { if (!s.decks[name] && PVD.DECKS[name]) s.decks[name] = PVD.DECKS[name].map(([q, a]) => ({ q, a, int: 0, ease: 2.5, due: 0, reps: 0 })); return s.decks[name]; };
      Object.keys(PVD.DECKS).forEach(ensure);

      function home() {
        const names = Object.keys(s.decks);
        root.innerHTML = `<div class="page-head"><div><h1>🃏 Flashcards</h1><p>Cards you struggle with come back sooner; easy ones fade away.</p></div></div>
        <div class="grid auto">${names.map((n) => { const d = s.decks[n], due = d.filter((c) => c.due <= dayNum()).length; return `<div class="card"><h3>${esc(n)}</h3><p class="muted">${d.length} cards · <b>${due}</b> due today</p><div class="row"><button class="btn primary sm" data-study="${esc(n)}" ${due ? '' : 'disabled'}>Study ${due ? '(' + due + ')' : ''}</button><button class="btn sm" data-all="${esc(n)}">Study all</button><button class="btn sm danger" data-rm="${esc(n)}">✕</button></div></div>`; }).join('')}</div>
        <div class="card mt"><h3>✨ Create a deck with AI</h3><div class="row"><input id="fT" class="grow" placeholder="Topic, e.g. Operating Systems, SQL, React, Aptitude shortcuts"/><select id="fN" style="width:100px"><option>10</option><option selected>15</option><option>20</option></select><button class="btn primary" id="fGo">Generate</button></div></div>`;
        $$('[data-study]').forEach((b) => (b.onclick = () => study(b.dataset.study, false)));
        $$('[data-all]').forEach((b) => (b.onclick = () => study(b.dataset.all, true)));
        $$('[data-rm]').forEach((b) => (b.onclick = async () => { if (await PV.ui.confirm(`Delete deck "${b.dataset.rm}"?`, 'Delete')) { delete s.decks[b.dataset.rm]; Object.keys(PVD.DECKS).forEach(ensure); PV.save(); home(); } }));
        $('#fGo').onclick = (e) => PV.ui.run(e.target, async () => {
          const t = $('#fT').value.trim(); if (!t) return PV.ui.toast('Enter a topic', 'bad');
          const r = await PV.aiJSON({ temperature: 0.6, prompt: `Create ${$('#fN').value} flashcards on "${t}" for campus placement interviews. Questions short, answers concise (max 35 words). Return JSON array: [{"q":"","a":""}]` });
          const cards = (Array.isArray(r) ? r : r.cards || []).filter((c) => c && c.q && c.a).map((c) => ({ q: String(c.q), a: String(c.a), int: 0, ease: 2.5, due: 0, reps: 0 }));
          if (!cards.length) throw new Error('No cards generated. Try again.');
          let name = t.slice(0, 30); while (s.decks[name]) name += '*'; s.decks[name] = cards; PV.save(); PV.addXP(5, 'deck created'); home();
        });
      }

      function study(name, all) {
        const deck = s.decks[name]; let queue = PV.shuffle(deck.filter((c) => all || c.due <= dayNum())), reviewed = 0, flip = false;
        const total = queue.length;
        const draw = () => {
          if (!queue.length) { if (reviewed) PV.addXP(Math.min(20, 2 + reviewed), 'flashcards'); PV.save(); return home(); }
          const c = queue[0];
          root.innerHTML = `<div class="page-head"><div><button class="btn sm" id="fBack">← Decks</button><h1 class="mt-s">${esc(name)}</h1></div><span class="chip">${total - queue.length}/${total}</span></div>
          <div class="progress mb"><i style="width:${((total - queue.length) / total) * 100}%"></i></div>
          <div class="flash ${flip ? 'flip' : ''}" id="fCard"><div class="in"><div class="face">${esc(c.q)}</div><div class="face back">${esc(c.a)}</div></div></div>
          <p class="muted" style="text-align:center">${flip ? 'How well did you know it?' : 'Click the card (or press Space) to reveal'}</p>
          <div class="row" style="justify-content:center">${flip ? ['Again', 'Hard', 'Good', 'Easy'].map((l, i) => `<button class="btn ${i === 0 ? 'danger' : i === 3 ? 'good' : ''}" data-r="${i}">${l}</button>`).join('') : '<button class="btn primary" id="fShow">Show answer</button>'}</div>`;
          $('#fBack').onclick = () => { PV.save(); home(); };
          const toggle = () => { flip = true; draw(); };
          const card = $('#fCard'); if (card) card.onclick = () => { flip = !flip; draw(); };
          const sb = $('#fShow'); if (sb) sb.onclick = toggle;
          $$('[data-r]').forEach((b) => (b.onclick = () => rate(+b.dataset.r)));
        };
        const rate = (g) => {
          const c = queue.shift(); reviewed++; flip = false;
          if (g === 0) { c.reps = 0; c.int = 0; c.ease = Math.max(1.3, c.ease - 0.2); c.due = dayNum(); queue.push(c); }
          else {
            c.int = g === 1 ? Math.max(1, Math.round((c.int || 1) * 1.2)) : g === 2 ? (c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.int * c.ease)) : (c.reps === 0 ? 3 : Math.round(Math.max(c.int, 1) * c.ease * 1.3));
            c.ease = PV.clamp(c.ease + (g === 1 ? -0.15 : g === 3 ? 0.15 : 0), 1.3, 3); c.reps++; c.due = dayNum() + Math.max(1, c.int);
          }
          draw();
        };
        const key = (e) => { if (e.code === 'Space' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); flip = !flip; if (queue.length) draw(); } };
        document.addEventListener('keydown', key); cleanupKeys = () => document.removeEventListener('keydown', key);
        draw();
      }
      let cleanupKeys = () => {};
      home();
      return () => cleanupKeys();
    },
  });

  /* =====================================================
     FOCUS TIMER (Pomodoro) — state lives outside render so it keeps running
  ===================================================== */
  const F = (PV.focus = { mode: 'focus', focusMin: 25, breakMin: 5, remain: 25 * 60, running: false, endAt: 0, tick: null, label: '' });
  const beep = () => { try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.setValueAtTime(0.15, c.currentTime); o.start(); o.stop(c.currentTime + 0.6); } catch (_) {} };
  function focusTick() {
    F.remain = Math.max(0, Math.round((F.endAt - Date.now()) / 1000));
    const el = document.getElementById('fTime'); if (el) el.textContent = PV.fmtTime(F.remain);
    document.title = F.running ? `${PV.fmtTime(F.remain)} · ${F.mode === 'focus' ? 'Focus' : 'Break'} — PrepVerse` : 'PrepVerse Pro';
    if (F.remain <= 0) {
      clearInterval(F.tick); F.running = false; beep();
      if (F.mode === 'focus') { const s = PV.S(); s.focus.sessions++; s.focus.minutes += F.focusMin; PV.save(); PV.addXP(10, 'focus session'); F.mode = 'break'; F.remain = F.breakMin * 60; }
      else { F.mode = 'focus'; F.remain = F.focusMin * 60; PV.ui.toast('Break over — ready to focus?'); }
      document.title = 'PrepVerse Pro'; if (location.hash === '#/focus') PV.pages.focus.render(document.getElementById('view'));
    }
  }
  PV.page('focus', {
    title: 'Focus Timer', icon: '⏱️', group: 'Grow', blurb: 'Pomodoro sessions that earn XP',
    render(root) {
      const s = PV.S();
      root.innerHTML = `<div class="page-head"><div><h1>⏱️ Focus Timer</h1><p>25 minutes of deep work, 5 minutes rest. Each finished session earns 10 XP.</p></div></div>
      <div class="split split-even"><div class="card" style="text-align:center"><span class="chip ${F.mode === 'focus' ? 'on' : 'good'}">${F.mode === 'focus' ? '🎯 Focus' : '☕ Break'}</span>
        <div class="pomo" id="fTime">${PV.fmtTime(F.remain)}</div>
        <div class="field" style="max-width:320px;margin:0 auto 12px"><input id="fLabel" placeholder="What are you working on?" value="${esc(F.label)}"/></div>
        <div class="row" style="justify-content:center"><button class="btn primary" id="fStart">${F.running ? '⏸ Pause' : '▶ Start'}</button><button class="btn" id="fReset">↺ Reset</button></div>
        <div class="row mt" style="justify-content:center"><label style="margin:0">Focus <select id="fF" style="width:80px;display:inline-block">${[15, 25, 45, 60].map((m) => `<option ${m === F.focusMin ? 'selected' : ''}>${m}</option>`).join('')}</select> min</label><label style="margin:0">Break <select id="fB" style="width:70px;display:inline-block">${[5, 10, 15].map((m) => `<option ${m === F.breakMin ? 'selected' : ''}>${m}</option>`).join('')}</select> min</label></div></div>
      <div class="card"><h3>Your focus stats</h3><div class="grid g2"><div class="stat"><span class="n">${s.focus.sessions}</span><span class="l">Sessions</span></div><div class="stat"><span class="n">${Math.round(s.focus.minutes / 60 * 10) / 10}h</span><span class="l">Total focus time</span></div></div><p class="muted mt">Tip: put your phone away, pick ONE task, and don't open other tabs until the bell.</p></div></div>`;
      $('#fLabel').oninput = (e) => (F.label = e.target.value);
      $('#fStart').onclick = () => {
        if (F.running) { clearInterval(F.tick); F.running = false; } else { F.endAt = Date.now() + F.remain * 1000; F.running = true; F.tick = setInterval(focusTick, 500); }
        PV.pages.focus.render(root);
      };
      $('#fReset').onclick = () => { clearInterval(F.tick); F.running = false; F.mode = 'focus'; F.remain = F.focusMin * 60; document.title = 'PrepVerse Pro'; PV.pages.focus.render(root); };
      const setLen = () => { if (!F.running) { F.focusMin = +$('#fF').value; F.breakMin = +$('#fB').value; F.remain = (F.mode === 'focus' ? F.focusMin : F.breakMin) * 60; $('#fTime').textContent = PV.fmtTime(F.remain); } };
      $('#fF').onchange = setLen; $('#fB').onchange = setLen;
    },
  });
})();
