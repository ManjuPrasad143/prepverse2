/* Career tools: resume builder + ATS analyzer, cover letter, application tracker, internship finder, company hub */
(function () {
  const { esc, $, $$, charts } = PV;

  /* ---------- helpers ---------- */
  const getP = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const setP = (o, path, v) => { const ks = path.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => a[k], o); t[last] = v; };
  const STOP = new Set('the and for with you your our are will this that from have has had was were been being their they them his her its not but can all any may per via use used using also into than then over such other more most able work works working role roles job team teams strong good great etc including include includes should must within across who what when where which while about plus new well ability years year experience required preferred candidate candidates responsibilities requirements skills knowledge understanding looking join company'.split(' '));
  const TECH = 'javascript typescript python java c++ c# react angular vue node nodejs express mongodb sql mysql postgresql html css git github docker kubernetes aws azure gcp linux rest api apis microservices agile scrum machine learning data structures algorithms oop dbms excel tableau power bi spring flask django tensorflow pandas numpy ci/cd jenkins redux nextjs next.js tailwind figma testing junit selenium'.split(' ');

  const resumeText = (R) => [R.name, R.title, R.email, R.phone, R.location, R.links, 'SUMMARY', R.summary, 'SKILLS', R.skills, 'EXPERIENCE', ...R.experience.map((e) => `${e.role} ${e.org} ${e.dates}\n${e.bullets}`), 'PROJECTS', ...R.projects.map((p) => `${p.name} ${p.tech}\n${p.bullets}`), 'EDUCATION', ...R.education.map((e) => `${e.school} ${e.degree} ${e.dates} ${e.score}`), 'CERTIFICATIONS', R.certs].filter(Boolean).join('\n');

  function defaultResume() {
    const p = PV.S().profile;
    return { name: p.name || '', title: p.role || '', email: '', phone: '', location: '', links: '', summary: '', skills: p.skills || '', experience: [{ role: '', org: '', dates: '', bullets: '' }], projects: [{ name: '', tech: '', bullets: '' }], education: [{ school: p.college || '', degree: p.degree || '', dates: '', score: '' }], certs: '' };
  }

  function localATS(jd, text) {
    const lt = text.toLowerCase(), lj = jd.toLowerCase();
    const words = lj.match(/[a-z][a-z0-9+#.\-/]{2,}/g) || [], freq = {};
    words.forEach((w) => { w = w.replace(/[.\-/]+$/, ''); if (!STOP.has(w) && w.length > 2) freq[w] = (freq[w] || 0) + 1; });
    const techHits = TECH.filter((t) => lj.includes(t));
    const top = [...new Set([...techHits, ...Object.entries(freq).sort((a, b) => b[1] - a[1]).map((e) => e[0])])].slice(0, 28);
    const has = (k) => new RegExp('(^|[^a-z0-9])' + k.replace(/[.+*?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])', 'i').test(lt);
    const matched = top.filter(has), missing = top.filter((k) => !has(k));
    const checks = [
      ['Email present', /[\w.+-]+@[\w-]+\.[\w.]+/.test(text)], ['Phone present', /\+?\d[\d\s-]{8,}/.test(text)],
      ['Skills section', /skills/i.test(text)], ['Education section', /education/i.test(text)], ['Experience or projects', /(experience|projects)/i.test(text)],
      ['Length 250–900 words', (() => { const n = text.split(/\s+/).length; return n >= 250 && n <= 900; })()],
      ['Uses action verbs', /\b(built|developed|designed|implemented|led|created|optimized|improved|automated|deployed)\b/i.test(text)],
      ['Has measurable results (numbers/%)', /\d+\s?%|\b\d{2,}\b/.test(text)],
    ];
    const kw = top.length ? matched.length / top.length : 0, fmt = checks.filter((c) => c[1]).length / checks.length;
    return { score: Math.round(kw * 70 + fmt * 30), matched, missing, checks };
  }

  /* =====================================================
     RESUME BUILDER + ATS
  ===================================================== */
  PV.page('resume', {
    title: 'Resume & ATS', icon: '📄', group: 'Career', blurb: 'Build a resume and check it against any job description',
    render(root) {
      const s = PV.S(); const R = s.resume || defaultResume();
      let tab = 'build';

      const shell = () => {
        root.innerHTML = `<div class="page-head"><div><h1>📄 Resume & ATS</h1><p>Create an ATS-friendly resume, polish it with AI, and measure it against a job description.</p></div></div>
        <div class="tabs no-print"><button data-t="build" class="${tab === 'build' ? 'on' : ''}">Builder</button><button data-t="ats" class="${tab === 'ats' ? 'on' : ''}">ATS analyzer</button></div><div id="rBody"></div>`;
        $$('.tabs button').forEach((b) => (b.onclick = () => { tab = b.dataset.t; shell(); }));
        tab === 'build' ? builder() : ats();
      };

      /* ---- builder ---- */
      function builder() {
        const body = $('#rBody');
        const f = (path, label, ph = '', area = false) => `<div class="field"><label>${label}</label>${area ? `<textarea data-p="${path}" placeholder="${esc(ph)}">${esc(getP(R, path))}</textarea>` : `<input data-p="${path}" value="${esc(getP(R, path))}" placeholder="${esc(ph)}"/>`}</div>`;
        const list = (key, title, fields) => `<div class="card flat mb"><div class="row between"><h3>${title}</h3><button class="btn sm" data-add="${key}">+ Add</button></div>${R[key].map((_, i) => `<div style="border-top:1px solid var(--line);padding-top:10px;margin-top:10px"><div class="grid g2">${fields.filter((x) => !x[3]).map(([k, l, ph]) => f(`${key}.${i}.${k}`, l, ph)).join('')}</div>${fields.filter((x) => x[3]).map(([k, l, ph]) => f(`${key}.${i}.${k}`, l, ph, true)).join('')}<div class="row">${fields.some((x) => x[0] === 'bullets') ? `<button class="btn sm" data-imp="${key}.${i}">✨ Polish bullets with AI</button>` : ''}<button class="btn sm danger" data-del="${key}.${i}">Remove</button></div></div>`).join('')}</div>`;
        body.innerHTML = `<div class="split split-even" style="align-items:start">
          <div class="no-print">
            <div class="card flat mb"><h3>Basics</h3><div class="grid g2">${f('name', 'Full name')}${f('title', 'Headline / target role')}${f('email', 'Email')}${f('phone', 'Phone')}${f('location', 'Location')}${f('links', 'Links (LinkedIn · GitHub · portfolio)')}</div></div>
            <div class="card flat mb"><div class="row between"><h3>Summary</h3><button class="btn sm" id="rSum">✨ Write with AI</button></div>${f('summary', 'Professional summary', '2–3 lines about who you are and what you offer', true)}</div>
            <div class="card flat mb"><h3>Skills</h3>${f('skills', 'Comma-separated', 'Python, Java, SQL, React…', true)}</div>
            ${list('experience', 'Experience / internships', [['role', 'Role'], ['org', 'Company'], ['dates', 'Dates'], ['bullets', 'Achievements (one per line)', 'Built… Improved… Reduced…', 1]])}
            ${list('projects', 'Projects', [['name', 'Project name'], ['tech', 'Tech stack'], ['bullets', 'What you did (one per line)', '', 1]])}
            ${list('education', 'Education', [['school', 'College / school'], ['degree', 'Degree'], ['dates', 'Years'], ['score', 'CGPA / %']])}
            <div class="card flat mb"><h3>Certifications & achievements</h3>${f('certs', 'One per line', '', true)}</div>
            <div class="row"><button class="btn primary" id="rSave">💾 Save</button><button class="btn" id="rPrint">🖨 Print / Save as PDF</button></div>
          </div>
          <div style="position:sticky;top:76px"><div class="resume-paper" id="rPrev"></div></div></div>`;
        const prev = () => {
          const bl = (t) => `<ul>${String(t || '').split('\n').map((x) => x.trim()).filter(Boolean).map((x) => `<li>${esc(x.replace(/^[-•*]\s*/, ''))}</li>`).join('')}</ul>`;
          $('#rPrev').innerHTML = `<h1>${esc(R.name || 'Your Name')}</h1><div class="contact">${esc(R.title)}</div><div class="contact">${[R.email, R.phone, R.location, R.links].filter(Boolean).map(esc).join(' · ')}</div>
          ${R.summary ? `<h4>Summary</h4><p>${esc(R.summary)}</p>` : ''}${R.skills ? `<h4>Skills</h4><p>${esc(R.skills)}</p>` : ''}
          ${R.experience.some((e) => e.role || e.org) ? `<h4>Experience</h4>${R.experience.filter((e) => e.role || e.org).map((e) => `<div class="rrow"><span>${esc(e.role)}${e.org ? ', ' + esc(e.org) : ''}</span><span>${esc(e.dates)}</span></div>${bl(e.bullets)}`).join('')}` : ''}
          ${R.projects.some((p) => p.name) ? `<h4>Projects</h4>${R.projects.filter((p) => p.name).map((p) => `<div class="rrow"><span>${esc(p.name)}</span><span style="font-weight:500">${esc(p.tech)}</span></div>${bl(p.bullets)}`).join('')}` : ''}
          ${R.education.some((e) => e.school) ? `<h4>Education</h4>${R.education.filter((e) => e.school).map((e) => `<div class="rrow"><span>${esc(e.school)}</span><span>${esc(e.dates)}</span></div><div>${esc(e.degree)}${e.score ? ' — ' + esc(e.score) : ''}</div>`).join('')}` : ''}
          ${R.certs ? `<h4>Certifications</h4>${bl(R.certs)}` : ''}`;
        };
        prev();
        body.oninput = (e) => { const p = e.target.dataset.p; if (!p) return; setP(R, p, e.target.value); prev(); s.resume = R; PV.save(); };
        $$('[data-add]', body).forEach((b) => (b.onclick = () => { const k = b.dataset.add; R[k].push(k === 'experience' ? { role: '', org: '', dates: '', bullets: '' } : k === 'projects' ? { name: '', tech: '', bullets: '' } : { school: '', degree: '', dates: '', score: '' }); builder(); }));
        $$('[data-del]', body).forEach((b) => (b.onclick = () => { const [k, i] = b.dataset.del.split('.'); R[k].splice(+i, 1); builder(); }));
        $$('[data-imp]', body).forEach((b) => (b.onclick = () => PV.ui.run(b, async () => {
          const path = b.dataset.imp + '.bullets', cur = getP(R, path); if (!cur || cur.trim().length < 10) return PV.ui.toast('Write a few rough bullets first', 'bad');
          const t = await PV.ai({ prompt: `Rewrite these resume bullet points for a fresher applying as "${R.title || PV.S().profile.role}". Use strong action verbs, be specific and concise (max ~20 words each), keep every fact true — do NOT invent numbers, tools or results; if a metric is missing, you may add a placeholder like [X%] for the student to fill. Return ONLY the bullets, one per line, no numbering.\n\n${cur}` });
          setP(R, path, t.replace(/^[-•*]\s*/gm, '').trim()); s.resume = R; PV.save(); builder();
        })));
        $('#rSum').onclick = (e) => PV.ui.run(e.target, async () => {
          const t = await PV.ai({ prompt: `Write a 2–3 sentence professional resume summary (no first-person pronouns, no clichés) for this fresher.\n${PV.profileCtx()}\nSkills: ${R.skills}\nProjects: ${R.projects.map((p) => p.name + ' (' + p.tech + ')').join('; ')}\nExperience: ${R.experience.map((x) => x.role + ' at ' + x.org).join('; ')}\nReturn only the summary text.` });
          R.summary = t.trim(); s.resume = R; PV.save(); builder();
        });
        $('#rSave').onclick = () => { s.resume = R; const first = !R.xpGiven; R.xpGiven = true; PV.save(); first ? PV.addXP(15, 'resume saved') : PV.ui.toast('Resume saved ✔', 'good'); };
        $('#rPrint').onclick = () => print();
      }

      /* ---- ATS ---- */
      function ats() {
        const body = $('#rBody');
        body.innerHTML = `<div class="split split-even"><div class="card"><h3>1 · Job description</h3><textarea id="aJD" style="min-height:220px" placeholder="Paste the job description here…"></textarea>
          <h3 class="mt">2 · Your resume text</h3><textarea id="aRes" style="min-height:160px" placeholder="Paste your resume text — or use the one from the Builder">${esc(s.resume ? resumeText(R) : '')}</textarea>
          <div class="row mt"><button class="btn primary" id="aGo">🔍 Analyze</button><button class="btn" id="aAI">✨ Deep AI analysis</button></div></div>
          <div class="card" id="aOut"><div class="empty"><div class="big">🎯</div>Paste a job description to see your match score, missing keywords and fixes.</div></div></div>`;
        const get = () => ({ jd: $('#aJD').value.trim(), res: $('#aRes').value.trim() });
        $('#aGo').onclick = () => {
          const { jd, res } = get(); if (jd.length < 40 || res.length < 80) return PV.ui.toast('Paste both the job description and your resume', 'bad');
          const r = localATS(jd, res); PV.track();
          $('#aOut').innerHTML = `<div style="text-align:center">${charts.ring(r.score, 130)}<p class="muted">Keyword & format match</p></div>
          <h3>Missing keywords</h3><div class="row">${r.missing.map((k) => `<span class="chip bad">${esc(k)}</span>`).join('') || '<span class="muted">None — great!</span>'}</div>
          <h3 class="mt">Matched</h3><div class="row">${r.matched.map((k) => `<span class="chip good">${esc(k)}</span>`).join('') || '<span class="muted">—</span>'}</div>
          <h3 class="mt">Format checklist</h3>${r.checks.map((c) => `<div>${c[1] ? '✅' : '❌'} ${c[0]}</div>`).join('')}<p class="muted mt-s">Add missing keywords only where they are true for you.</p>`;
        };
        $('#aAI').onclick = (e) => PV.ui.run(e.target, async () => {
          const { jd, res } = get(); if (jd.length < 40 || res.length < 80) return PV.ui.toast('Paste both the job description and your resume', 'bad');
          $('#aOut').innerHTML = PV.ui.thinking('Analysing like an ATS + recruiter…');
          try {
            const r = await PV.aiJSON({ system: 'You are an expert technical recruiter and ATS specialist. Be honest and specific. Respond ONLY with JSON.', prompt: `JOB DESCRIPTION:\n${jd}\n\nRESUME:\n${res}\n\nReturn JSON: {"score":0-100,"verdict":"1-2 sentences","missingKeywords":["..."],"strengths":["..."],"fixes":["specific, actionable edits"],"rewrittenSummary":"a tailored 2-3 sentence summary using only facts in the resume","bulletRewrites":[{"before":"...","after":"..."}]}` });
            $('#aOut').innerHTML = `<div style="text-align:center">${charts.ring(Number(r.score) || 0, 130)}<p>${esc(r.verdict || '')}</p></div>
            <h3>Missing keywords</h3><div class="row">${[].concat(r.missingKeywords || []).map((k) => `<span class="chip bad">${esc(k)}</span>`).join('')}</div>
            <h3 class="mt">Strengths</h3><ul>${[].concat(r.strengths || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
            <h3>Fixes</h3><ol>${[].concat(r.fixes || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
            <h3>Tailored summary</h3><div class="callout">${esc(r.rewrittenSummary || '')}</div>
            ${(r.bulletRewrites || []).length ? `<h3 class="mt">Bullet rewrites</h3>${r.bulletRewrites.map((b) => `<p><s class="muted">${esc(b.before)}</s><br/>→ ${esc(b.after)}</p>`).join('')}` : ''}`;
            PV.addXP(8, 'ATS analysis');
          } catch (err) { $('#aOut').innerHTML = `<div class="callout warn">${esc(err.message)}</div>`; }
        });
      }
      shell();
    },
  });

  /* =====================================================
     COVER LETTER
  ===================================================== */
  PV.page('cover', {
    title: 'Cover Letter', icon: '✉️', group: 'Career', blurb: 'Tailored cover letters & cold emails in seconds',
    render(root) {
      const s = PV.S();
      root.innerHTML = `<div class="page-head"><div><h1>✉️ Cover Letter & Email Writer</h1><p>Uses your profile and resume to write something specific — then you edit it.</p></div></div>
      <div class="split split-even"><div class="card">
        <div class="grid g2"><div class="field"><label>Company</label><input id="cCo"/></div><div class="field"><label>Role</label><input id="cRole" value="${esc(s.profile.role)}"/></div>
        <div class="field"><label>Type</label><select id="cType"><option>Cover letter</option><option>Cold email to recruiter</option><option>LinkedIn connection note</option><option>Follow-up email after interview</option><option>Referral request</option></select></div>
        <div class="field"><label>Tone</label><select id="cTone"><option>Professional</option><option>Enthusiastic</option><option>Concise & direct</option></select></div></div>
        <div class="field"><label>Job description / notes (optional)</label><textarea id="cJD" style="min-height:140px" placeholder="Paste the JD or anything you want mentioned"></textarea></div>
        <button class="btn primary" id="cGo">✨ Generate</button></div>
      <div class="card"><div class="row between"><h3>Draft</h3><div class="row"><button class="btn sm" id="cCopy">Copy</button><button class="btn sm" id="cDl">Download</button></div></div><textarea id="cOut" style="min-height:360px" placeholder="Your draft appears here and is fully editable."></textarea></div></div>`;
      $('#cGo').onclick = (e) => PV.ui.run(e.target, async () => {
        const co = $('#cCo').value.trim(), role = $('#cRole').value.trim(); if (!role) return PV.ui.toast('Enter a role', 'bad');
        const resume = s.resume ? resumeText(s.resume).slice(0, 3500) : '';
        const t = await PV.ai({ temperature: 0.8, prompt: `Write a ${$('#cType').value} (${$('#cTone').value} tone) for the role "${role}"${co ? ' at ' + co : ''}.\n${PV.profileCtx()}\n${resume ? 'RESUME:\n' + resume + '\n' : ''}${$('#cJD').value.trim() ? 'JOB DESCRIPTION / NOTES:\n' + $('#cJD').value.trim() + '\n' : ''}\nRules: be specific using real details from the profile/resume only (never invent experience), avoid clichés, keep a cover letter under 250 words, emails under 150 words, LinkedIn notes under 300 characters. Return only the text${$('#cType').value.includes('email') ? ' including a Subject line' : ''}.` });
        $('#cOut').value = t.trim(); PV.addXP(8, 'writing assistant');
      });
      $('#cCopy').onclick = async () => { try { await navigator.clipboard.writeText($('#cOut').value); PV.ui.toast('Copied ✔', 'good'); } catch { PV.ui.toast('Copy failed', 'bad'); } };
      $('#cDl').onclick = () => PV.ui.download('cover-letter.txt', $('#cOut').value, 'text/plain');
    },
  });

  /* =====================================================
     APPLICATION TRACKER (kanban)
  ===================================================== */
  const COLS = ['Wishlist', 'Applied', 'Online Test', 'Interview', 'Offer', 'Rejected'];
  PV.page('tracker', {
    title: 'Application Tracker', icon: '📬', group: 'Career', blurb: 'Kanban board for internships & jobs',
    render(root) {
      const s = PV.S();
      function draw() {
        const apps = s.applications, n = (st) => apps.filter((a) => a.status === st).length;
        const today = PV.dkey();
        root.innerHTML = `<div class="page-head"><div><h1>📬 Application Tracker</h1><p>Drag cards between columns. Never lose track of a follow-up.</p></div><button class="btn primary" id="tAdd">+ Add application</button></div>
        <div class="grid g4 mb"><div class="card stat"><span class="n">${apps.length}</span><span class="l">Total</span></div><div class="card stat"><span class="n">${n('Applied') + n('Online Test') + n('Interview')}</span><span class="l">In progress</span></div><div class="card stat"><span class="n">${n('Offer')}</span><span class="l">Offers 🎉</span></div><div class="card stat"><span class="n">${apps.length ? Math.round(((n('Online Test') + n('Interview') + n('Offer')) / Math.max(1, apps.length - n('Wishlist'))) * 100) : 0}%</span><span class="l">Response rate</span></div></div>
        <div class="kanban">${COLS.map((c) => `<div class="kcol" data-col="${c}"><h4>${c}<span>${n(c)}</span></h4>${apps.filter((a) => a.status === c).map((a) => `<div class="kcard" draggable="true" data-id="${a.id}"><b>${esc(a.company)}</b>${esc(a.role)}${a.follow ? `<br/><small class="${a.follow < today ? 'chip bad' : 'muted'}">⏰ ${PV.fmtDate(a.follow)}</small>` : ''}</div>`).join('')}</div>`).join('')}</div>`;
        $('#tAdd').onclick = () => edit();
        $$('.kcard').forEach((c) => {
          c.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', c.dataset.id));
          c.addEventListener('click', () => edit(apps.find((a) => a.id === c.dataset.id)));
        });
        $$('.kcol').forEach((col) => {
          col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('over'); });
          col.addEventListener('dragleave', () => col.classList.remove('over'));
          col.addEventListener('drop', (e) => { e.preventDefault(); const a = apps.find((x) => x.id === e.dataTransfer.getData('text/plain')); if (a && a.status !== col.dataset.col) { a.status = col.dataset.col; PV.save(); PV.track(); if (a.status === 'Offer') PV.ui.toast('🎉 Congratulations on the offer!', 'good'); } draw(); });
        });
      }
      function edit(a) {
        const isNew = !a; a = a || { id: PV.uid(), company: '', role: '', status: 'Applied', link: '', follow: '', notes: '' };
        const m = PV.ui.modal(`<h3>${isNew ? 'Add' : 'Edit'} application</h3><div class="grid g2"><div class="field"><label>Company</label><input id="eC" value="${esc(a.company)}"/></div><div class="field"><label>Role</label><input id="eR" value="${esc(a.role)}"/></div>
        <div class="field"><label>Status</label><select id="eS">${COLS.map((c) => `<option ${c === a.status ? 'selected' : ''}>${c}</option>`).join('')}</select></div><div class="field"><label>Follow-up date</label><input type="date" id="eF" value="${esc(a.follow)}"/></div></div>
        <div class="field"><label>Link</label><input id="eL" value="${esc(a.link)}" placeholder="https://…"/></div><div class="field"><label>Notes</label><textarea id="eN">${esc(a.notes)}</textarea></div>
        <div class="row"><button class="btn primary" id="eSave">Save</button>${isNew ? '' : '<button class="btn danger" id="eDel">Delete</button>'}${a.link ? `<a class="btn" href="${esc(a.link)}" target="_blank" rel="noopener noreferrer">Open link ↗</a>` : ''}<button class="btn" data-close>Cancel</button></div>`);
        $('#eSave', m.root).onclick = () => {
          const c = $('#eC', m.root).value.trim(); if (!c) return PV.ui.toast('Company is required', 'bad');
          Object.assign(a, { company: c, role: $('#eR', m.root).value.trim(), status: $('#eS', m.root).value, follow: $('#eF', m.root).value, link: $('#eL', m.root).value.trim(), notes: $('#eN', m.root).value });
          if (isNew) s.applications.push(a); PV.save(); PV.track(); m.close(); draw();
        };
        const d = $('#eDel', m.root); if (d) d.onclick = () => { s.applications = s.applications.filter((x) => x.id !== a.id); PV.save(); m.close(); draw(); };
      }
      draw();
    },
  });

  /* =====================================================
     INTERNSHIP & JOB FINDER
  ===================================================== */
  PV.page('jobs', {
    title: 'Internship Finder', icon: '🧭', group: 'Career', blurb: 'Best portals, smart search links & AI role matching',
    render(root) {
      const s = PV.S(); let tab = 'search';
      const draw = () => {
        root.innerHTML = `<div class="page-head"><div><h1>🧭 Internship & Job Finder</h1><p>Find openings on the best portals, and let AI match roles to your skills.</p></div></div>
        <div class="tabs"><button data-t="search" class="${tab === 'search' ? 'on' : ''}">Smart search</button><button data-t="ai" class="${tab === 'ai' ? 'on' : ''}">✨ AI role match</button><button data-t="portals" class="${tab === 'portals' ? 'on' : ''}">Portals</button></div><div id="jBody"></div>`;
        $$('.tabs button').forEach((b) => (b.onclick = () => { tab = b.dataset.t; draw(); }));
        const body = $('#jBody');
        if (tab === 'search') {
          body.innerHTML = `<div class="card"><div class="grid g3"><div class="field"><label>Keywords</label><input id="jK" value="${esc(s.profile.role)}"/></div><div class="field"><label>Location</label><input id="jL" placeholder="e.g. Bengaluru, Remote"/></div><div class="field"><label>Type</label><select id="jT"><option>internship</option><option>fresher job</option></select></div></div><div class="row" id="jLinks"></div><p class="muted mt-s">Opens live results on each site in a new tab — I don't scrape listings, so you always see current openings.</p></div>`;
          const links = () => {
            const k = encodeURIComponent($('#jK').value.trim() + ' ' + ($('#jT').value === 'internship' ? 'intern' : 'fresher')), kw = $('#jK').value.trim().toLowerCase().replace(/\s+/g, '-'), l = encodeURIComponent($('#jL').value.trim());
            const L = [['LinkedIn', `https://www.linkedin.com/jobs/search/?keywords=${k}&location=${l}`], ['Indeed', `https://in.indeed.com/jobs?q=${k}&l=${l}`], ['Internshala', `https://internshala.com/internships/keywords-${encodeURIComponent(kw)}`], ['Unstop', `https://unstop.com/internships?searchTerm=${encodeURIComponent($('#jK').value.trim())}`], ['Google', `https://www.google.com/search?q=${k}+${l}+apply`]];
            $('#jLinks').innerHTML = L.map(([n, u]) => `<a class="btn" target="_blank" rel="noopener noreferrer" href="${u}">${n} ↗</a>`).join('');
          };
          ['jK', 'jL', 'jT'].forEach((id) => $('#' + id).addEventListener('input', links)); links();
        }
        if (tab === 'portals') body.innerHTML = `<div class="grid auto">${PVD.PORTALS.map((p) => `<a class="card hover" target="_blank" rel="noopener noreferrer" href="${p.u}" style="color:var(--text);text-decoration:none"><h3>${esc(p.n)} ↗</h3><small>${esc(p.d)}</small></a>`).join('')}</div>`;
        if (tab === 'ai') {
          body.innerHTML = `<div class="card"><div class="grid g2"><div class="field"><label>Your skills</label><input id="mS" value="${esc(s.profile.skills)}"/></div><div class="field"><label>Interests / preferences</label><input id="mI" placeholder="e.g. web dev, AI, startups, remote"/></div></div><button class="btn primary" id="mGo">✨ Suggest roles</button></div><div id="mOut" class="mt"></div>`;
          $('#mGo').onclick = (e) => PV.ui.run(e.target, async () => {
            $('#mOut').innerHTML = PV.ui.thinking('Matching roles to your profile…');
            try {
              const r = await PV.aiJSON({ temperature: 0.7, prompt: `${PV.profileCtx()}\nSkills: ${$('#mS').value}\nInterests: ${$('#mI').value}\nSuggest 6 internship/entry-level roles that fit this candidate in the Indian job market. Return JSON array: [{"title":"","fit":0-100,"why":"1-2 sentences","skillsToLearn":["..."],"searchKeywords":"keywords to search on job portals","typicalCompanies":["types or example companies"]}]` });
              const arr = Array.isArray(r) ? r : r.roles || [];
              $('#mOut').innerHTML = `<div class="callout warn mb">AI suggestions are guidance, not live listings — verify openings on the portals.</div><div class="grid auto">${arr.map((x) => `<div class="card"><div class="row between"><h3>${esc(x.title)}</h3><span class="chip good">${Math.round(Number(x.fit) || 0)}% fit</span></div><p>${esc(x.why)}</p><p><b>Learn:</b> ${[].concat(x.skillsToLearn || []).map((k) => `<span class="chip">${esc(k)}</span>`).join(' ')}</p><p><b>Companies:</b> ${esc([].concat(x.typicalCompanies || []).join(', '))}</p><a class="btn sm" target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(x.searchKeywords || x.title)}">Search ↗</a></div>`).join('')}</div>`;
              PV.track();
            } catch (err) { $('#mOut').innerHTML = `<div class="callout warn">${esc(err.message)}</div>`; }
          });
        }
      };
      draw();
    },
  });

  /* =====================================================
     COMPANY HUB
  ===================================================== */
  PV.page('companies', {
    title: 'Company Prep Hub', icon: '🏢', group: 'Career', blurb: 'Typical rounds + AI prep guides per company',
    render(root) {
      root.innerHTML = `<div class="page-head"><div><h1>🏢 Company Prep Hub</h1><p>${esc(PVD.COMPANY_NOTE)}</p></div></div><div class="grid auto">${PVD.COMPANIES.map((c, i) => `<div class="card hover" data-i="${i}"><div class="row between"><h3>${esc(c.n)}</h3><span class="chip">${esc(c.type)}</span></div><small>${c.rounds.length} typical rounds</small><div class="row mt-s">${c.focus.slice(0, 3).map((f) => `<span class="chip">${esc(f)}</span>`).join('')}</div></div>`).join('')}</div>
      <div class="card mt"><h3>Any other company?</h3><div class="row"><input id="oc" class="grow" placeholder="Type a company name for an AI prep guide"/><button class="btn primary" id="ocGo">Generate</button></div></div>`;
      const guide = (name, base) => {
        const m = PV.ui.modal(`<div class="row between"><h2>${esc(name)}</h2><button class="btn sm" data-close>Close</button></div>${base ? `<h3>Typical rounds</h3><ol>${base.rounds.map((r) => `<li>${esc(r)}</li>`).join('')}</ol><h3>Focus areas</h3><div class="row">${base.focus.map((f) => `<span class="chip">${esc(f)}</span>`).join('')}</div><div class="callout mt">${esc(base.tip)}</div>` : ''}<div class="row mt"><button class="btn primary" id="gAI">✨ AI prep guide</button><button class="btn" id="gMock">🎤 Mock interview for ${esc(name)}</button></div><div id="gOut" class="md mt"></div>`, true);
        $('#gMock', m.root).onclick = () => { PV.prefill = { company: name }; m.close(); location.hash = '#/interview'; };
        $('#gAI', m.root).onclick = (e) => PV.ui.run(e.target, async () => {
          $('#gOut', m.root).innerHTML = PV.ui.thinking('Writing your prep guide…');
          try { $('#gOut', m.root).innerHTML = PV.md(await PV.ai({ prompt: `Create a concise campus-placement prep guide for "${name}" for ${PV.S().profile.role} candidates in India. Sections: **Hiring process** (say clearly that patterns change and should be verified on the official careers page), **Topics to master**, **Likely interview questions** (8), **2-week plan**, **Common mistakes**. Use short bullets; don't invent specific facts like salaries or exact cut-offs.` })); PV.track(); }
          catch (err) { $('#gOut', m.root).innerHTML = `<div class="callout warn">${esc(err.message)}</div>`; }
        });
      };
      $$('[data-i]').forEach((c) => (c.onclick = () => guide(PVD.COMPANIES[+c.dataset.i].n, PVD.COMPANIES[+c.dataset.i])));
      $('#ocGo').onclick = () => { const v = $('#oc').value.trim(); if (v) guide(v, null); };
    },
  });
})();
