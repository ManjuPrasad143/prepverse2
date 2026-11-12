/* Practice: AI mock interview, quizzes, coding arena, question bank */
(function () {
  const { esc, $, $$, charts } = PV;
  PVD.CATS.ai = { n: 'AI-generated topic', e: '✨' };

  /* =====================================================
     AI MOCK INTERVIEW
  ===================================================== */
  const ITYPES = {
    technical: 'Technical (CS fundamentals, projects, problem solving)',
    hr: 'HR / Behavioural',
    managerial: 'Managerial round',
    coding: 'Coding concepts (verbal DSA)',
    system: 'System design (basic)',
    mixed: 'Mixed – full placement interview',
  };

  const reportHTML = (r, meta) => {
    const sc = Object.entries(r.scores).map(([label, value]) => ({ label, value }));
    return `
    <div class="grid g2 mb">
      <div class="card" style="text-align:center"><h3 style="justify-content:center">Overall score</h3>${charts.ring(r.overall, 150)}<p class="muted mt-s">${esc(meta.type)} · ${esc(meta.role)}${meta.company ? ' @ ' + esc(meta.company) : ''}</p></div>
      <div class="card"><h3>360° skill radar</h3>${charts.radar(sc, 270)}</div>
    </div>
    <div class="card mb"><h3>📝 Summary</h3><p>${esc(r.summary)}</p></div>
    <div class="grid g2 mb">
      <div class="card"><h3>💪 Strengths</h3><ul>${r.strengths.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="card"><h3>🎯 To improve</h3><ul>${r.improvements.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
    <div class="card mb"><h3>🔍 Question-by-question</h3>
      ${r.questions.map((q, i) => `<details style="margin-bottom:10px"><summary style="cursor:pointer;font-weight:700">Q${i + 1}. ${esc(q.q)} <span class="chip ${q.score >= 7 ? 'good' : q.score >= 4 ? 'warn' : 'bad'}">${q.score}/10</span></summary><div class="mt-s"><p><b>Your answer:</b> ${esc(q.a || '—')}</p><p><b>Feedback:</b> ${esc(q.feedback)}</p><div class="callout"><b>Stronger answer:</b> ${esc(q.ideal)}</div></div></details>`).join('')}
    </div>
    <div class="card"><h3>🧭 Next steps</h3><ol>${r.nextSteps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>`;
  };

  const reportText = (r, meta) => `PrepVerse Interview Report\n${meta.type} · ${meta.role}${meta.company ? ' @ ' + meta.company : ''}\nOverall: ${r.overall}/100\n\nSummary: ${r.summary}\n\nStrengths:\n- ${r.strengths.join('\n- ')}\n\nImprove:\n- ${r.improvements.join('\n- ')}\n\n` + r.questions.map((q, i) => `Q${i + 1} (${q.score}/10): ${q.q}\nYour answer: ${q.a}\nFeedback: ${q.feedback}\nIdeal: ${q.ideal}\n`).join('\n') + `\nNext steps:\n- ${r.nextSteps.join('\n- ')}`;

  PV.page('interview', {
    title: 'AI Mock Interview', icon: '🎤', group: 'Practice', blurb: 'Adaptive questions + a scored 360° report',
    render(root) {
      let rec = null; // active speech recognition
      let timerId = null;
      const cleanup = () => { try { rec && rec.stop(); speechSynthesis.cancel(); } catch (_) {} clearInterval(timerId); };

      function setup() {
        cleanup();
        const s = PV.S(), p = s.profile;
        root.innerHTML = `
        <div class="page-head"><div><h1>🎤 AI Mock Interview</h1><p>A realistic interviewer that asks follow-ups based on your answers — then grades you.</p></div></div>
        <div class="split">
          <div class="card">
            <div class="grid g2">
              <div class="field"><label>Interview type</label><select id="iType">${Object.entries(ITYPES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
              <div class="field"><label>Target role</label><input id="iRole" value="${esc(p.role)}"/></div>
              <div class="field"><label>Company (optional)</label><input id="iCompany" placeholder="e.g. TCS, Amazon, a startup"/></div>
              <div class="field"><label>Difficulty</label><select id="iLevel"><option>Fresher</option><option>Intermediate</option><option>Advanced</option></select></div>
              <div class="field"><label>Number of questions</label><select id="iN"><option>3</option><option selected>5</option><option>8</option><option>10</option></select></div>
              <div class="field"><label>Options</label><label style="font-weight:600;color:var(--text)"><input type="checkbox" id="iCtx" checked/> Use my profile & skills</label><label style="font-weight:600;color:var(--text)"><input type="checkbox" id="iSpeak"/> Read questions aloud</label></div>
            </div>
            <button class="btn primary" id="iStart">▶ Start interview</button>
            ${PV.aiOnline ? '' : '<p class="callout warn mt">AI is offline — add your Gemini key to <code>.env</code> and restart the server.</p>'}
          </div>
          <div class="card"><h3>💡 Tips</h3><ul><li>Answer in full sentences — 4 to 8 lines is ideal.</li><li>Use the 🎙️ mic to practise speaking out loud.</li><li>Use STAR (Situation, Task, Action, Result) for behavioural questions.</li><li>It's fine to say "I don't know, but here's how I'd find out".</li></ul></div>
        </div>
        <h2 class="mt">Past interviews</h2>
        <div class="card">${s.interviews.length ? `<table><thead><tr><th>Date</th><th>Type</th><th>Role</th><th>Score</th><th></th></tr></thead><tbody>${s.interviews.slice().reverse().map((i) => `<tr><td>${PV.fmtDate(i.date)}</td><td>${esc(i.type)}</td><td>${esc(i.role)}${i.company ? ' @ ' + esc(i.company) : ''}</td><td><span class="chip ${i.overall >= 70 ? 'good' : i.overall >= 45 ? 'warn' : 'bad'}">${i.overall}</span></td><td><button class="btn sm" data-view="${i.id}">View report</button></td></tr>`).join('')}</tbody></table><div class="mt">${charts.line(s.interviews.slice(-10).map((i) => i.overall))}</div>` : '<div class="empty"><div class="big">🎙️</div>No interviews yet. Start your first one!</div>'}</div>`;
        if (PV.prefill && PV.prefill.company) { $('#iCompany').value = PV.prefill.company; PV.prefill = null; }
        $$('[data-view]').forEach((b) => (b.onclick = () => { const it = s.interviews.find((x) => x.id === b.dataset.view); PV.ui.modal(`<div class="row between"><h2>Interview report</h2><button class="btn sm" data-close>Close</button></div>${reportHTML(it.report, it)}`, true); }));
        $('#iStart').onclick = (e) => PV.ui.run(e.target, async () => {
          await begin({ type: $('#iType').value, role: $('#iRole').value.trim() || 'Software Engineer', company: $('#iCompany').value.trim(), level: $('#iLevel').value, n: +$('#iN').value, ctx: $('#iCtx').checked, speak: $('#iSpeak').checked });
        });
      }

      async function begin(cfg) {
        const sys = `You are a professional, friendly but rigorous interviewer conducting a ${ITYPES[cfg.type]} interview for the role "${cfg.role}"${cfg.company ? ' at ' + cfg.company : ''}. Candidate level: ${cfg.level}. ${cfg.ctx ? PV.profileCtx() : ''}
Rules: ask EXACTLY ONE question at a time; the interview has ${cfg.n} questions in total; adapt later questions (including follow-ups) to what the candidate actually said; never reveal answers or give feedback during the interview; keep every turn under 70 words; label questions like "Question 2 of ${cfg.n}:"; for a "mixed" interview vary between technical, behavioural and situational questions.`;
        const first = `Begin the interview now. Greet me in one short sentence and ask Question 1 of ${cfg.n}.`;
        const q1 = await PV.ai({ system: sys, prompt: first });
        session(cfg, sys, [{ role: 'user', text: first }, { role: 'model', text: q1 }], q1);
      }

      function session(cfg, sys, msgs, firstQ) {
        let answered = 0, busy = false, lastQ = firstQ, secs = 0;
        const qa = [];
        root.innerHTML = `
        <div class="page-head"><div><h1>🎤 ${esc(ITYPES[cfg.type].split(' (')[0])} interview</h1><p>${esc(cfg.role)}${cfg.company ? ' @ ' + esc(cfg.company) : ''} · ${esc(cfg.level)}</p></div><div class="row"><span class="timer" id="iTimer">00:00</span><button class="btn sm danger" id="iEnd">End & get report</button></div></div>
        <div class="card"><div class="row between mb"><b id="iProg">Question 1 of ${cfg.n}</b><span class="chip">${cfg.speak ? '🔊 voice on' : '🔇 voice off'}</span></div><div class="progress mb"><i id="iBar" style="width:0%"></i></div>
          <div class="chat" id="iChat"></div>
          <div class="composer"><textarea id="iAns" placeholder="Type your answer… (Ctrl+Enter to send)"></textarea><div class="col"><button class="btn" id="iMic" title="Voice input">🎙️</button><button class="btn primary" id="iSend">Send</button></div></div>
          <div class="row mt-s"><button class="btn sm ghost" id="iSkip">Skip question</button><small class="muted">Answers are graded at the end.</small></div></div>`;
        const chat = $('#iChat');
        const bubble = (who, text) => { const d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = PV.md(text); chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d; };
        bubble('ai', firstQ); if (cfg.speak) PV.ui.speak(firstQ);
        timerId = setInterval(() => { secs++; const t = $('#iTimer'); if (t) t.textContent = PV.fmtTime(secs); }, 1000);

        const send = async () => {
          if (busy) return; const ta = $('#iAns');
          if (rec) { rec.stop(); rec = null; $('#iMic').textContent = '🎙️'; }
          const text = ta.value.trim() || '(skipped)'; ta.value = '';
          busy = true; bubble('me', text); qa.push({ q: lastQ, a: text }); answered++;
          $('#iBar').style.width = (answered / cfg.n) * 100 + '%';
          if (answered >= cfg.n) return finish();
          const typing = bubble('ai', '…');
          const note = `${text}\n\n[Interviewer note: that was answer ${answered} of ${cfg.n}. Reply with at most one short neutral acknowledgement sentence, then ask Question ${answered + 1} of ${cfg.n}.]`;
          try {
            const reply = await PV.ai({ system: sys, history: msgs, prompt: note });
            msgs.push({ role: 'user', text: note }, { role: 'model', text: reply });
            lastQ = reply; typing.innerHTML = PV.md(reply); chat.scrollTop = chat.scrollHeight;
            $('#iProg').textContent = `Question ${answered + 1} of ${cfg.n}`;
            if (cfg.speak) PV.ui.speak(reply);
          } catch (e) {
            typing.remove(); chat.lastChild && chat.lastChild.remove(); qa.pop(); answered--; ta.value = text === '(skipped)' ? '' : text;
            $('#iBar').style.width = (answered / cfg.n) * 100 + '%'; PV.ui.toast(e.message, 'bad');
          }
          busy = false;
        };

        async function finish() {
          clearInterval(timerId); try { speechSynthesis.cancel(); } catch (_) {}
          if (!qa.length) return setup();
          const transcript = qa.map((x, i) => `Q${i + 1}: ${x.q}\nA${i + 1}: ${x.a}`).join('\n\n');
          const gen = async () => {
            root.innerHTML = `<div class="card">${PV.ui.thinking('Your interviewer is evaluating your answers…')}</div>`;
            try {
              const r = await PV.aiJSON({
                system: 'You are a calibrated, honest interview evaluator. Score realistically: skipped/empty answers score 0-1; vague answers 3-5; solid 6-8; excellent 9-10. Respond ONLY with JSON.',
                prompt: `Evaluate this ${ITYPES[cfg.type]} interview for "${cfg.role}"${cfg.company ? ' at ' + cfg.company : ''} (level: ${cfg.level}).\n\nTRANSCRIPT:\n${transcript}\n\nReturn JSON exactly in this shape:\n{"overall":0-100,"scores":{"Communication":0-100,"Technical":0-100,"Problem Solving":0-100,"Confidence":0-100,"Clarity":0-100},"summary":"2-3 sentences","strengths":["..."],"improvements":["..."],"questions":[{"q":"the question text without the 'Question k of n' label","score":0-10,"feedback":"specific feedback","ideal":"a concise strong sample answer"}],"nextSteps":["3-5 concrete actions"]}\nThe "questions" array must have exactly ${qa.length} items in order.`,
              });
              const num = (v) => Math.round(PV.clamp(Number(v) || 0, 0, 100));
              const rep = {
                overall: num(r.overall), summary: String(r.summary || ''), strengths: [].concat(r.strengths || []).map(String), improvements: [].concat(r.improvements || []).map(String), nextSteps: [].concat(r.nextSteps || []).map(String),
                scores: Object.fromEntries(['Communication', 'Technical', 'Problem Solving', 'Confidence', 'Clarity'].map((k) => [k, num((r.scores || {})[k])])),
                questions: qa.map((x, i) => { const q = (r.questions || [])[i] || {}; return { q: String(q.q || x.q).replace(/^\s*Question \d+ of \d+:\s*/i, ''), a: x.a, score: Math.round(PV.clamp(Number(q.score) || 0, 0, 10)), feedback: String(q.feedback || ''), ideal: String(q.ideal || '') }; }),
              };
              const meta = { id: PV.uid(), date: new Date().toISOString(), type: ITYPES[cfg.type].split(' (')[0], role: cfg.role, company: cfg.company, level: cfg.level, overall: rep.overall, scores: rep.scores, report: rep, secs };
              PV.S().interviews.push(meta); PV.save();
              PV.addXP(20 + Math.round(rep.overall / 5), 'mock interview');
              root.innerHTML = `<div class="page-head"><div><h1>📊 Interview report</h1><p>Completed in ${PV.fmtTime(secs)}</p></div><div class="row no-print"><button class="btn" id="rAgain">↻ New interview</button><button class="btn" id="rDl">⬇ Download</button><button class="btn" onclick="print()">🖨 Print</button></div></div>${reportHTML(rep, meta)}`;
              $('#rAgain').onclick = setup; $('#rDl').onclick = () => PV.ui.download('interview-report.txt', reportText(rep, meta), 'text/plain');
            } catch (e) {
              root.innerHTML = `<div class="card"><h3>Couldn't generate the report</h3><p class="muted">${esc(e.message)}</p><div class="row"><button class="btn primary" id="rRetry">Retry</button><button class="btn" id="rBack">Back</button></div></div>`;
              $('#rRetry').onclick = gen; $('#rBack').onclick = setup;
            }
          };
          gen();
        }

        $('#iSend').onclick = send;
        $('#iAns').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(); });
        $('#iSkip').onclick = () => { $('#iAns').value = ''; send(); };
        $('#iEnd').onclick = async () => { if (!qa.length) return setup(); if (await PV.ui.confirm('End now and grade the answers so far?', 'End & grade')) finish(); };
        $('#iMic').onclick = () => {
          if (rec) { rec.stop(); rec = null; $('#iMic').textContent = '🎙️'; return; }
          const base = $('#iAns').value ? $('#iAns').value + ' ' : '';
          rec = PV.ui.listen((t) => ($('#iAns').value = base + t), () => { rec = null; const m = $('#iMic'); if (m) m.textContent = '🎙️'; });
          if (rec) $('#iMic').textContent = '⏹️';
        };
      }
      setup();
      return cleanup;
    },
  });

  /* =====================================================
     QUIZZES
  ===================================================== */
  PV.page('quiz', {
    title: 'Aptitude & Tech Quizzes', icon: '🧠', group: 'Practice', blurb: 'Timed tests, company mixes, AI-made quizzes',
    render(root) {
      let timer = null;
      const cleanup = () => clearInterval(timer);

      function setup() {
        cleanup();
        const s = PV.S();
        root.innerHTML = `
        <div class="page-head"><div><h1>🧠 Quizzes</h1><p>Sharpen aptitude, reasoning, CS fundamentals and code-reading speed.</p></div></div>
        <div class="tabs" id="qTabs"><button class="on" data-m="topic">By topic</button><button data-m="mix">Company style</button><button data-m="ai">✨ AI-generated</button></div>
        <div class="card" id="qCfg"></div>
        <h2 class="mt">History</h2>
        <div class="card">${s.quizzes.length ? `<table><thead><tr><th>Date</th><th>Quiz</th><th>Score</th><th>Time</th></tr></thead><tbody>${s.quizzes.slice(-8).reverse().map((q) => `<tr><td>${PV.fmtDate(q.date)}</td><td>${esc(q.label)}</td><td><span class="chip ${q.correct / q.total >= 0.7 ? 'good' : q.correct / q.total >= 0.4 ? 'warn' : 'bad'}">${q.correct}/${q.total}</span></td><td>${PV.fmtTime(q.secs || 0)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty"><div class="big">📝</div>No quizzes taken yet.</div>'}</div>`;

        const cfgEl = $('#qCfg');
        const modeView = (m) => {
          $$('#qTabs button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
          const common = `<div class="grid g3"><div class="field"><label>Questions</label><select id="qN"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></div><div class="field"><label>Mode</label><select id="qMode"><option value="practice">Practice (instant feedback)</option><option value="exam">Exam (timed, review at end)</option></select></div>`;
          if (m === 'topic') cfgEl.innerHTML = common + `<div class="field"><label>Category</label><select id="qCat">${Object.entries(PVD.CATS).filter(([k]) => k !== 'ai').map(([k, v]) => `<option value="${k}">${v.e} ${v.n}</option>`).join('')}</select></div></div><button class="btn primary" id="qGo">Start quiz</button>`;
          if (m === 'mix') cfgEl.innerHTML = common + `<div class="field"><label>Pattern</label><select id="qMix">${Object.entries(PVD.MIXES).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join('')}</select></div></div><p class="muted">Practice mixes inspired by common campus-hiring formats. Official patterns change — treat as practice.</p><button class="btn primary" id="qGo">Start quiz</button>`;
          if (m === 'ai') cfgEl.innerHTML = common + `<div class="field"><label>Difficulty</label><select id="qDiff"><option>Easy</option><option selected>Medium</option><option>Hard</option></select></div></div><div class="grid g2"><div class="field"><label>Topic</label><input id="qTopic" placeholder="e.g. SQL joins, Operating Systems, Percentages, React hooks"/></div><div class="field"><label>Company style (optional)</label><input id="qComp" placeholder="e.g. TCS NQT, Infosys, Amazon"/></div></div><button class="btn primary" id="qGo">✨ Generate & start</button>`;
          $('#qGo').onclick = (e) => PV.ui.run(e.target, async () => {
            const n = +$('#qN').value, exam = $('#qMode').value === 'exam';
            let qs, label;
            if (m === 'ai') {
              const topic = $('#qTopic').value.trim(); if (!topic) return PV.ui.toast('Enter a topic first', 'bad');
              const r = await PV.aiJSON({ temperature: 0.8, prompt: `Create ${n} multiple-choice questions on "${topic}"${$('#qComp').value.trim() ? ' in the style of ' + $('#qComp').value.trim() + ' campus placement tests' : ' for campus placement preparation'}. Difficulty: ${$('#qDiff').value}. Each has exactly 4 options and one correct answer. Vary the position of the correct answer. Return ONLY a JSON array: [{"q":"...","o":["...","...","...","..."],"a":0,"e":"1-2 sentence explanation"}]` });
              qs = (Array.isArray(r) ? r : r.questions || []).filter((x) => x && x.q && Array.isArray(x.o) && x.o.length === 4 && Number.isInteger(x.a) && x.a >= 0 && x.a < 4).map((x) => ({ c: 'ai', q: String(x.q), o: x.o.map(String), a: x.a, e: String(x.e || '') }));
              if (!qs.length) throw new Error('The AI did not return usable questions. Try again.');
              label = 'AI: ' + topic;
            } else {
              let cats, name;
              if (m === 'topic') { cats = [$('#qCat').value]; name = PVD.CATS[cats[0]].n; } else { const mx = PVD.MIXES[$('#qMix').value]; cats = mx.cats; name = mx.n; }
              qs = PV.shuffle(PVD.QUIZ.filter((q) => cats.includes(q.c))).slice(0, n).map((q) => { const order = PV.shuffle(q.o.map((_, i) => i)); return { ...q, o: order.map((i) => q.o[i]), a: order.indexOf(q.a) }; });
              label = name;
            }
            run(qs, { exam, label });
          });
        };
        $$('#qTabs button').forEach((b) => (b.onclick = () => modeView(b.dataset.m)));
        modeView('topic');
      }

      function run(qs, cfg) {
        let i = 0, secs = 0; const ans = new Array(qs.length).fill(null);
        const limit = cfg.exam ? qs.length * 60 : 0;
        root.innerHTML = `<div class="card" id="qBox"></div>`;
        timer = setInterval(() => { secs++; const t = $('#qTimer'); if (t) t.textContent = limit ? PV.fmtTime(Math.max(0, limit - secs)) : PV.fmtTime(secs); if (limit && secs >= limit) { PV.ui.toast("Time's up!", 'bad'); done(); } }, 1000);
        const draw = () => {
          const q = qs[i], picked = ans[i];
          $('#qBox').innerHTML = `
          <div class="row between mb"><b>${esc(cfg.label)} · ${i + 1}/${qs.length}</b><span class="timer" id="qTimer">${limit ? PV.fmtTime(limit - secs) : PV.fmtTime(secs)}</span></div>
          <div class="progress mb"><i style="width:${(i / qs.length) * 100}%"></i></div>
          <span class="chip">${esc(PVD.CATS[q.c].e + ' ' + PVD.CATS[q.c].n)}</span>
          <h3 class="mt-s" style="font-size:1.15rem">${esc(q.q)}</h3>
          ${q.o.map((o, k) => `<button class="opt ${picked === k ? 'sel' : ''}" data-k="${k}"><b>${'ABCD'[k]}</b>${esc(o)}</button>`).join('')}
          <div id="qExp"></div>
          <div class="row between mt"><button class="btn sm danger" id="qQuit">Quit</button><button class="btn primary" id="qNext" ${picked === null ? 'disabled' : ''}>${i === qs.length - 1 ? 'Finish' : 'Next →'}</button></div>`;
          const reveal = () => { $$('.opt').forEach((b, k) => { b.disabled = true; b.classList.remove('sel'); if (k === q.a) b.classList.add('right'); else if (k === ans[i]) b.classList.add('wrong'); }); $('#qExp').innerHTML = `<div class="callout mt-s"><b>${ans[i] === q.a ? '✅ Correct' : '❌ Incorrect'}.</b> ${esc(q.e)}</div>`; };
          if (!cfg.exam && picked !== null) reveal();
          $$('.opt').forEach((b) => (b.onclick = () => { if (!cfg.exam && ans[i] !== null) return; ans[i] = +b.dataset.k; if (cfg.exam) { $$('.opt').forEach((x) => x.classList.toggle('sel', x === b)); } else reveal(); $('#qNext').disabled = false; }));
          $('#qNext').onclick = () => (i === qs.length - 1 ? done() : (i++, draw()));
          $('#qQuit').onclick = async () => { if (await PV.ui.confirm('Quit this quiz? Progress will be lost.', 'Quit')) setup(); };
        };
        draw();

        function done() {
          cleanup();
          const items = qs.map((q, k) => ({ c: q.c, ok: ans[k] === q.a }));
          const correct = items.filter((x) => x.ok).length;
          PV.S().quizzes.push({ id: PV.uid(), date: new Date().toISOString(), label: cfg.label, total: qs.length, correct, secs, items }); PV.save();
          PV.addXP(correct * 3 + (correct === qs.length && qs.length >= 5 ? 10 : 0), 'quiz');
          const pct = Math.round((correct / qs.length) * 100);
          const byCat = {}; items.forEach((x) => { const c = (byCat[x.c] = byCat[x.c] || { ok: 0, n: 0 }); c.n++; if (x.ok) c.ok++; });
          root.innerHTML = `
          <div class="page-head"><div><h1>Results</h1><p>${esc(cfg.label)} · ${PV.fmtTime(secs)}</p></div><div class="row"><button class="btn primary" id="qAgain">↻ Another quiz</button></div></div>
          <div class="grid g2 mb"><div class="card" style="text-align:center">${charts.ring(pct, 150, correct + '/' + qs.length)}<p class="muted">${pct >= 80 ? 'Excellent work! 🏆' : pct >= 50 ? 'Good effort — review the misses below.' : 'Keep practising — fundamentals first. 💪'}</p></div>
          <div class="card"><h3>By category</h3>${charts.bars(Object.entries(byCat).map(([c, v]) => ({ label: PVD.CATS[c].n, value: (v.ok / v.n) * 100 })))}</div></div>
          <div class="card"><h3>Review</h3>${qs.map((q, k) => `<div style="padding:12px 0;border-bottom:1px solid var(--line)"><b>${k + 1}. ${esc(q.q)}</b><div class="mt-s">${ans[k] === q.a ? '<span class="chip good">✔ Correct</span>' : `<span class="chip bad">✘ ${ans[k] === null ? 'Unanswered' : 'Your answer: ' + esc(q.o[ans[k]])}</span>`} <span class="chip">Answer: ${esc(q.o[q.a])}</span></div><p class="muted mt-s">${esc(q.e)}</p>${ans[k] !== q.a ? `<button class="btn sm" data-ex="${k}">🤖 Explain with AI</button><div id="ex${k}"></div>` : ''}</div>`).join('')}</div>`;
          $('#qAgain').onclick = setup;
          $$('[data-ex]').forEach((b) => (b.onclick = () => PV.ui.run(b, async () => { const q = qs[+b.dataset.ex]; const t = await PV.ai({ prompt: `Explain step by step, for a college student, why the correct answer is "${q.o[q.a]}":\n${q.q}\nOptions: ${q.o.join(' | ')}\nKeep it under 120 words and mention a quick trick if there is one.` }); $('#ex' + b.dataset.ex).innerHTML = `<div class="callout mt-s md">${PV.md(t)}</div>`; })));
        }
      }
      setup();
      return cleanup;
    },
  });

  /* =====================================================
     CODING ARENA
  ===================================================== */
  const WORKER_SRC = `
  self.onmessage = (e) => {
    const { code, fn, tests, cmp } = e.data; const logs = [];
    const c2 = { log: (...a) => logs.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ')) };
    let f;
    try { f = new Function('console', code + '\\n;return typeof ' + fn + '==="function" ? ' + fn + ' : null;')(c2); }
    catch (err) { self.postMessage({ fatal: String(err) }); return; }
    if (!f) { self.postMessage({ fatal: 'Function "' + fn + '" not found — keep the function name unchanged.' }); return; }
    const res = [];
    for (const [args, exp] of tests) {
      try {
        const t0 = performance.now(); const out = f(...JSON.parse(JSON.stringify(args))); const ms = performance.now() - t0;
        let a = out, b = exp;
        if (cmp === 'sorted' && Array.isArray(a)) { a = [...a].sort((x, y) => x - y); b = [...b].sort((x, y) => x - y); }
        res.push({ ok: JSON.stringify(a) === JSON.stringify(b), args, exp, out, ms });
      } catch (err) { res.push({ ok: false, args, exp, err: String(err) }); }
    }
    self.postMessage({ res, logs });
  };`;

  const runTests = (p, code) => new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
    const w = new Worker(url);
    const t = setTimeout(() => { w.terminate(); URL.revokeObjectURL(url); resolve({ fatal: 'Time limit exceeded (4s) — possible infinite loop or too slow an algorithm.' }); }, 4000);
    w.onmessage = (e) => { clearTimeout(t); w.terminate(); URL.revokeObjectURL(url); resolve(e.data); };
    w.onerror = (e) => { clearTimeout(t); w.terminate(); URL.revokeObjectURL(url); resolve({ fatal: e.message || 'Runtime error' }); };
    w.postMessage({ code, fn: p.fn, tests: p.tests, cmp: p.cmp || '' });
  });

  PV.page('coding', {
    title: 'Coding Arena', icon: '💻', group: 'Practice', blurb: 'Solve problems with an in-browser judge + AI hints',
    render(root) {
      function list() {
        const s = PV.S(); const solved = s.coding.solved;
        root.innerHTML = `<div class="page-head"><div><h1>💻 Coding Arena</h1><p>Write JavaScript, run test cases instantly, and get AI hints & code reviews. <b>${Object.keys(solved).length}/${PVD.PROBLEMS.length}</b> solved.</p></div></div>
        <div class="grid auto">${PVD.PROBLEMS.map((p) => `<div class="card hover" data-id="${p.id}"><div class="row between"><h3>${solved[p.id] ? '✅ ' : ''}${esc(p.t)}</h3><span class="chip ${p.d === 'Easy' ? 'good' : 'warn'}">${p.d}</span></div><div class="row">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>`).join('')}</div>`;
        $$('[data-id]').forEach((c) => (c.onclick = () => solve(PVD.PROBLEMS.find((p) => p.id === c.dataset.id))));
      }

      function solve(p) {
        const s = PV.S(); let hintLevel = 0;
        root.innerHTML = `
        <div class="page-head"><div><button class="btn sm" id="cBack">← Problems</button><h1 class="mt-s">${s.coding.solved[p.id] ? '✅ ' : ''}${esc(p.t)} <span class="chip ${p.d === 'Easy' ? 'good' : 'warn'}">${p.d}</span></h1></div></div>
        <div class="code-wrap">
          <div class="col"><div class="card"><h3>Problem</h3><div class="md">${PV.md(p.desc)}</div><p><b>Example:</b></p><pre><code>${esc(p.ex)}</code></pre><div class="row">${p.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>
            <div class="card"><h3>🤖 AI assistant</h3><div class="row"><button class="btn sm" id="cHint">💡 Hint</button><button class="btn sm" id="cReview">🔎 Review my code</button><button class="btn sm" id="cExplain">📚 Explain optimal approach</button></div><div id="cAI" class="md mt"></div></div></div>
          <div class="col"><div class="card"><div class="row between mb"><h3>Solution (JavaScript)</h3><button class="btn sm ghost" id="cReset">Reset</button></div><textarea class="editor" id="cCode" spellcheck="false"></textarea><div class="row mt"><button class="btn primary" id="cRun">▶ Run tests</button><small class="muted">Keep the function name <code>${p.fn}</code></small></div></div>
            <div class="card" id="cOut"><div class="muted">Run your code to see test results.</div></div></div>
        </div>`;
        const ta = $('#cCode'); ta.value = s.coding.code[p.id] || p.starter;
        ta.addEventListener('input', () => { s.coding.code[p.id] = ta.value; PV.save(); });
        ta.addEventListener('keydown', (e) => { if (e.key === 'Tab') { e.preventDefault(); const st = ta.selectionStart; ta.setRangeText('  ', st, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')); } });
        $('#cBack').onclick = list;
        $('#cReset').onclick = () => { ta.value = p.starter; ta.dispatchEvent(new Event('input')); };
        $('#cRun').onclick = async (e) => {
          const b = e.target; b.disabled = true; b.innerHTML = '<span class="loader"></span> Running';
          const r = await runTests(p, ta.value); b.disabled = false; b.innerHTML = '▶ Run tests';
          const out = $('#cOut');
          if (r.fatal) { out.innerHTML = `<div class="callout warn"><b>Error:</b> ${esc(r.fatal)}</div>`; return; }
          const pass = r.res.filter((x) => x.ok).length, all = pass === r.res.length;
          const show = (v) => { try { const j = JSON.stringify(v); return j === undefined ? 'undefined' : j; } catch { return String(v); } };
          out.innerHTML = `<h3>${all ? '🎉 All tests passed' : `${pass}/${r.res.length} tests passed`}</h3>${r.res.map((x, i) => `<div class="test ${x.ok ? 'pass' : 'fail'}">${x.ok ? '✔' : '✘'}<div>#${i + 1} input: ${esc(show(x.args))}<br/>expected: ${esc(show(x.exp))}${x.ok ? '' : `<br/>got: ${esc(x.err ? 'Error — ' + x.err : show(x.out))}`}</div></div>`).join('')}${r.logs && r.logs.length ? `<h4 class="mt">Console</h4><pre>${esc(r.logs.slice(0, 30).join('\n'))}</pre>` : ''}`;
          if (all && !s.coding.solved[p.id]) { s.coding.solved[p.id] = true; PV.save(); PV.addXP(p.d === 'Easy' ? 15 : 25, 'solved ' + p.t); } else PV.track();
        };
        const ai = (btn, prompt) => PV.ui.run(btn, async () => { $('#cAI').innerHTML = PV.ui.thinking(); try { $('#cAI').innerHTML = PV.md(await PV.ai({ prompt, temperature: 0.4 })); } catch (e) { $('#cAI').innerHTML = ''; throw e; } });
        const ctx = () => `Problem: ${p.t}\n${p.desc}\nFunction: ${p.fn} (JavaScript)\n`;
        $('#cHint').onclick = (e) => { hintLevel++; ai(e.target, `${ctx()}The student's current code:\n\`\`\`js\n${ta.value}\n\`\`\`\nGive hint level ${hintLevel} of 3. Level 1: a nudge about the key idea only. Level 2: the data structure/algorithm to use. Level 3: pseudocode. Do NOT write the full solution.`); };
        $('#cReview').onclick = (e) => ai(e.target, `${ctx()}Review this code for correctness, edge cases, time/space complexity and style. Be concise with bullet points and suggest improvements:\n\`\`\`js\n${ta.value}\n\`\`\``);
        $('#cExplain').onclick = (e) => ai(e.target, `${ctx()}Explain the optimal approach step by step with time and space complexity, then give a clean JavaScript solution.`);
      }
      list();
    },
  });

  /* =====================================================
     QUESTION BANK + answer coach
  ===================================================== */
  PV.page('qbank', {
    title: 'Question Bank', icon: '📚', group: 'Practice', blurb: 'HR & technical questions with AI answer feedback',
    render(root) {
      let cat = 'All'; const extra = [];
      const cats = ['All', ...new Set(PVD.QBANK.map((q) => q.c))];
      function draw() {
        const items = [...PVD.QBANK, ...extra].filter((q) => cat === 'All' || q.c === cat);
        root.innerHTML = `
        <div class="page-head"><div><h1>📚 Question Bank</h1><p>Classic interview questions with key points. Practise your own answer and get AI feedback.</p></div></div>
        <div class="tabs">${cats.map((c) => `<button class="${c === cat ? 'on' : ''}" data-c="${c}">${c}</button>`).join('')}</div>
        <div class="card mb"><div class="row"><input id="gTopic" class="grow" placeholder="Generate more questions on a topic (e.g. Java collections, SQL, networking)"/><button class="btn" id="gGo">✨ Generate 5</button></div></div>
        <div class="col">${items.map((q, i) => `<div class="card"><div class="row between"><div><span class="chip">${esc(q.c)}</span> <b>${esc(q.q)}</b></div><button class="btn sm primary" data-p="${i}">Practise</button></div><details class="mt-s"><summary class="muted" style="cursor:pointer">Key points</summary><p class="mt-s">${esc(q.k)}</p></details></div>`).join('')}</div>`;
        $$('[data-c]').forEach((b) => (b.onclick = () => { cat = b.dataset.c; draw(); }));
        $('#gGo').onclick = (e) => PV.ui.run(e.target, async () => {
          const t = $('#gTopic').value.trim(); if (!t) return PV.ui.toast('Enter a topic', 'bad');
          const r = await PV.aiJSON({ temperature: 0.8, prompt: `Give 5 common interview questions about "${t}" for freshers, each with concise key points for a strong answer. Return JSON array: [{"q":"...","k":"..."}]` });
          (Array.isArray(r) ? r : r.questions || []).forEach((x) => x && x.q && extra.push({ c: t.slice(0, 18), q: String(x.q), k: String(x.k || '') }));
          cat = 'All'; draw(); PV.track();
        });
        $$('[data-p]').forEach((b) => (b.onclick = () => practise(items[+b.dataset.p])));
      }
      function practise(q) {
        const m = PV.ui.modal(`<h3>${esc(q.q)}</h3><textarea id="pAns" placeholder="Type your answer here…" style="min-height:150px"></textarea><div class="row mt"><button class="btn primary" id="pGo">Get AI feedback</button><button class="btn" data-close>Close</button></div><div id="pRes" class="mt md"></div>`, true);
        $('#pGo', m.root).onclick = (e) => PV.ui.run(e.target, async () => {
          const a = $('#pAns', m.root).value.trim(); if (a.length < 15) return PV.ui.toast('Write a bit more first', 'bad');
          const t = await PV.ai({ prompt: `You are an interview coach. Question: "${q.q}"\nKey points expected: ${q.k}\nCandidate's answer: "${a}"\n\nGive: 1) a score out of 10, 2) what was good, 3) what was missing, 4) an improved version of their answer in 4–6 sentences.` });
          $('#pRes', m.root).innerHTML = PV.md(t); PV.addXP(5, 'answer practice');
        });
      }
      draw();
    },
  });
})();
