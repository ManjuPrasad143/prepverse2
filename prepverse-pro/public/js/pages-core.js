/* Dashboard + Profile */
(function () {
  const { esc, $, $$, S, charts } = Object.assign({}, PV, { S: PV.S, charts: PV.charts });

  /* ---------------- DASHBOARD ---------------- */
  PV.page('dashboard', {
    title: 'Dashboard', icon: '🏠', group: 'Overview',
    render(root) {
      const s = PV.S(), rd = PV.readiness(), lv = PV.level();
      const name = s.profile.name ? esc(s.profile.name.split(' ')[0]) : 'there';
      const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
      const solved = Object.keys(s.coding.solved).length;
      const quizTrend = s.quizzes.slice(-10).map((q) => (q.correct / q.total) * 100);
      const days = s.profile.goalDate ? Math.ceil((new Date(s.profile.goalDate) - Date.now()) / 864e5) : null;

      // weakest quiz category
      const catStat = {};
      s.quizzes.forEach((q) => (q.items || []).forEach((i) => { const c = (catStat[i.c] = catStat[i.c] || { ok: 0, n: 0 }); c.n++; if (i.ok) c.ok++; }));
      const cats = Object.entries(catStat).map(([k, v]) => ({ k, pct: (v.ok / v.n) * 100, n: v.n }));
      const weak = cats.filter((c) => c.n >= 3).sort((a, b) => a.pct - b.pct)[0];

      const recent = [
        ...s.interviews.map((i) => ({ d: i.date, t: `🎤 ${i.type} interview — ${i.overall}/100`, h: '#/interview' })),
        ...s.quizzes.map((q) => ({ d: q.date, t: `🧠 ${q.label || 'Quiz'} — ${q.correct}/${q.total}`, h: '#/quiz' })),
      ].sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, 5);

      const dq = PVD.QUIZ[PV.hashStr(PV.dkey()) % PVD.QUIZ.length];
      const dd = s.daily[PV.dkey()];

      root.innerHTML = `
      <div class="card hero mb">
        <div class="row between" style="gap:24px">
          <div style="position:relative;z-index:1;max-width:560px">
            <small>${greet}</small>
            <h1>${name}, let's get you placed 🚀</h1>
            <p class="muted">${days !== null ? (days > 0 ? `<b>${days} days</b> until your target date.` : 'Your target date has arrived — go get it!') : 'Set a target date in your profile to get a countdown.'}
            ${weak ? `<br/>Focus area: <b>${PVD.CATS[weak.k].n}</b> (${Math.round(weak.pct)}% accuracy).` : '<br/>Take a quiz or mock interview to unlock personalised insights.'}</p>
            <div class="row mt">
              <a class="btn" style="background:#fff;color:#3b2fb8;border:none" href="#/interview">🎤 Start mock interview</a>
              <a class="btn" style="background:rgba(255,255,255,.18);color:#fff;border:none" href="#/quiz">🧠 Take a quiz</a>
            </div>
          </div>
          <div style="position:relative;z-index:1;text-align:center">${charts.ring(rd.score, 130)}<small>Placement readiness</small></div>
        </div>
      </div>

      <div class="grid g4 mb">
        <div class="card stat"><span class="n">⭐ ${s.xp}</span><span class="l">Total XP · Level ${lv.l}</span></div>
        <div class="card stat"><span class="n">🔥 ${PV.liveStreak()}</span><span class="l">Day streak</span></div>
        <div class="card stat"><span class="n">${s.quizzes.length + s.interviews.length}</span><span class="l">Quizzes + interviews done</span></div>
        <div class="card stat"><span class="n">${solved}/${PVD.PROBLEMS.length}</span><span class="l">Coding problems solved</span></div>
      </div>

      <div class="split mb">
        <div class="col">
          <div class="card"><h3>📈 Readiness breakdown</h3>${charts.bars(Object.entries(rd.parts).map(([label, value]) => ({ label, value })))}
            <h3 class="mt">Quiz accuracy trend</h3>${charts.line(quizTrend)}</div>
          <div class="card"><h3>🗓️ Activity (last 18 weeks)</h3><div style="overflow-x:auto">${charts.heat(s.activity)}</div></div>
        </div>
        <div class="col">
          <div class="card" id="daily"><h3>⚡ Daily challenge <span class="chip">${esc(PVD.CATS[dq.c].n)}</span></h3>
            <p><b>${esc(dq.q)}</b></p>
            ${dq.o.map((o, i) => `<button class="opt" data-i="${i}" ${dd ? 'disabled' : ''}><b>${'ABCD'[i]}</b>${esc(o)}</button>`).join('')}
            <div id="dres" class="muted"></div></div>
          <div class="card"><h3>🕘 Recent activity</h3>${recent.length ? recent.map((r) => `<a href="${r.h}" style="display:block;padding:6px 0;color:var(--text)">${esc(r.t)} <small>· ${PV.fmtDate(r.d)}</small></a>`).join('') : '<div class="muted">Nothing yet — your sessions will show up here.</div>'}</div>
        </div>
      </div>

      <h2>Jump in</h2>
      <div class="grid auto mb">${['interview', 'quiz', 'coding', 'resume', 'planner', 'coach'].map((id) => { const p = PV.pages[id]; return `<a class="card hover" href="#/${id}" style="color:var(--text);text-decoration:none"><div style="font-size:1.8rem">${p.icon}</div><h3>${p.title}</h3><small>${p.blurb || ''}</small></a>`; }).join('')}</div>

      <h2>Badges</h2>
      <div class="grid auto">${PV.BADGES.map((b) => `<div class="badge-tile ${s.badges[b.id] ? '' : 'lock'}"><div class="e">${b.e}</div><b>${b.n}</b><br/><small>${b.d}</small></div>`).join('')}</div>`;

      const showDaily = (picked) => {
        const ok = picked === dq.a;
        $$('#daily .opt').forEach((b, i) => { b.disabled = true; if (i === dq.a) b.classList.add('right'); else if (i === picked) b.classList.add('wrong'); });
        $('#dres').innerHTML = `<p>${ok ? '✅ Correct!' : '❌ Not quite.'} ${esc(dq.e)}</p>`;
      };
      if (dd) showDaily(dd.pick);
      $$('#daily .opt').forEach((b) => b.addEventListener('click', () => {
        if (s.daily[PV.dkey()]) return;
        const pick = +b.dataset.i; s.daily[PV.dkey()] = { pick, ok: pick === dq.a };
        showDaily(pick); PV.addXP(pick === dq.a ? 10 : 3, 'daily challenge');
      }));
    },
  });
  PV.pages.dashboard.blurb = 'Your progress at a glance';

  /* ---------------- PROFILE ---------------- */
  PV.page('profile', {
    title: 'Profile & Settings', icon: '👤', group: 'Account', blurb: 'Personalise the AI and manage your data',
    render(root) {
      const s = PV.S(), p = s.profile;
      const f = (id, label, val, ph = '') => `<div class="field"><label>${label}</label><input id="${id}" value="${esc(val)}" placeholder="${esc(ph)}"/></div>`;
      root.innerHTML = `
      <div class="page-head"><div><h1>Profile & Settings</h1><p>The AI uses this to personalise interviews, plans and recommendations.</p></div></div>
      <div class="split">
        <div class="card"><h3>Your details</h3>
          <div class="grid g2">
            ${f('pName', 'Full name', p.name, 'e.g. Aarav Sharma')}${f('pCollege', 'College', p.college, 'e.g. NIE Mysuru')}
            ${f('pDegree', 'Degree', p.degree)}${f('pYear', 'Year', p.year)}
            ${f('pRole', 'Target role', p.role, 'e.g. Software Engineer, Data Analyst')}
            <div class="field"><label>Placement target date</label><input id="pGoal" type="date" value="${esc(p.goalDate)}"/></div>
          </div>
          <div class="field"><label>Skills (comma separated)</label><input id="pSkills" value="${esc(p.skills)}" placeholder="JavaScript, React, SQL, Python…"/></div>
          <div class="field"><label>About you / projects / achievements</label><textarea id="pAbout" placeholder="2–4 lines about your projects, internships, interests…">${esc(p.about)}</textarea></div>
          <button class="btn primary" id="pSave">Save profile</button>
        </div>
        <div class="col">
          <div class="card"><h3>⚙️ Preferences</h3>
            <div class="row between"><span>Theme</span><button class="btn sm" id="pTheme">${s.theme === 'dark' ? 'Switch to light ☀️' : 'Switch to dark 🌙'}</button></div>
            <hr/><div class="row between"><span>Gemini AI</span><span class="pill ${PV.aiOnline ? 'ok' : 'bad'}">${PV.aiOnline ? 'Connected' : 'Not connected'}</span></div>
            <small class="muted">${PV.aiOnline ? 'The server holds your API key — it is never exposed to the browser.' : 'Add GEMINI_API_KEY to the .env file (or Vercel env vars) and restart.'}</small>
            <div class="row mt"><button class="btn sm" id="pTest">Test AI</button></div><div id="pTestRes" class="mt-s"></div>
          </div>
          <div class="card"><h3>💾 Your data</h3><p class="muted">Everything is stored locally in your browser.</p>
            <div class="row"><button class="btn sm" id="pExport">Export</button><label class="btn sm" style="margin:0">Import<input id="pImport" type="file" accept=".json" hidden/></label><button class="btn sm danger" id="pReset">Reset all</button></div></div>
          <div class="card"><h3>📊 Totals</h3><div class="row"><span class="chip">${s.interviews.length} interviews</span><span class="chip">${s.quizzes.length} quizzes</span><span class="chip">${Object.keys(s.coding.solved).length} problems</span><span class="chip">${s.focus.minutes} focus min</span><span class="chip">${s.applications.length} applications</span></div></div>
        </div>
      </div>`;
      $('#pSave').onclick = () => {
        Object.assign(p, { name: $('#pName').value.trim(), college: $('#pCollege').value.trim(), degree: $('#pDegree').value.trim(), year: $('#pYear').value.trim(), role: $('#pRole').value.trim() || 'Software Engineer', goalDate: $('#pGoal').value, skills: $('#pSkills').value.trim(), about: $('#pAbout').value.trim() });
        PV.save(); PV.ui.toast('Profile saved ✔', 'good');
      };
      $('#pTheme').onclick = () => { s.theme = s.theme === 'dark' ? 'light' : 'dark'; PV.save(); PV.pages.profile.render(root); };
      $('#pTest').onclick = (e) => PV.ui.run(e.target, async () => {
        const t = await PV.ai({ prompt: 'Reply with one short motivating sentence for a placement candidate.' });
        $('#pTestRes').innerHTML = `<div class="callout">${esc(t)}</div>`; PV.aiOnline = true; PV.renderChrome();
      });
      $('#pExport').onclick = () => PV.ui.download('prepverse-backup.json', JSON.stringify(PV.S(), null, 2));
      $('#pImport').onchange = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const r = new FileReader(); r.onload = () => { try { PV.replaceState(JSON.parse(r.result)); PV.ui.toast('Data imported ✔', 'good'); location.reload(); } catch { PV.ui.toast('Invalid backup file', 'bad'); } }; r.readAsText(file);
      };
      $('#pReset').onclick = async () => { if (await PV.ui.confirm('Erase ALL your progress and data?', 'Erase everything')) { PV.resetState(); location.reload(); } };
    },
  });
})();
