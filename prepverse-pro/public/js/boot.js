/* Boot: sidebar nav, hash router, command palette, theme */
(function () {
  const { $, $$, esc } = PV;
  const GROUPS = ['Overview', 'Practice', 'Career', 'Grow', 'Account'];
  const view = document.getElementById('view');
  let cleanup = null;

  // sidebar
  const nav = document.getElementById('nav');
  nav.innerHTML = GROUPS.map((g) => {
    const ids = PV.order.filter((id) => PV.pages[id].group === g);
    return ids.length ? `<div class="nav-group">${g}</div>` + ids.map((id) => `<a href="#/${id}" data-id="${id}"><span>${PV.pages[id].icon}</span>${esc(PV.pages[id].title)}</a>`).join('') : '';
  }).join('');
  nav.addEventListener('click', () => document.getElementById('sidebar').classList.remove('open'));
  document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('themeBtn').onclick = () => { const s = PV.S(); s.theme = s.theme === 'dark' ? 'light' : 'dark'; PV.save(); };

  // router
  function route() {
    const id = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('?')[0];
    const page = PV.pages[id] || PV.pages.dashboard;
    const pid = PV.pages[id] ? id : 'dashboard';
    if (typeof cleanup === 'function') { try { cleanup(); } catch (_) {} }
    cleanup = null;
    $$('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.id === pid));
    view.style.animation = 'none'; void view.offsetWidth; view.style.animation = '';
    view.innerHTML = '';
    try { const c = page.render(view); if (typeof c === 'function') cleanup = c; }
    catch (e) { console.error(e); view.innerHTML = `<div class="card"><h3>Something went wrong</h3><p class="muted">${esc(e.message)}</p><a class="btn" href="#/dashboard">Back to dashboard</a></div>`; }
    if (!PV.focus || !PV.focus.running) document.title = `${page.title} · PrepVerse Pro`;
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  // command palette (Ctrl/Cmd + K)
  function palette() {
    const items = [...PV.order.map((id) => ({ t: PV.pages[id].title, i: PV.pages[id].icon, h: '#/' + id, k: PV.pages[id].blurb || '' })), { t: 'Toggle light / dark theme', i: '🌓', fn: () => document.getElementById('themeBtn').click() }];
    const m = PV.ui.modal(`<input id="cmdQ" placeholder="Jump to a page or action…" autofocus/><div class="cmd-list mt" id="cmdL"></div>`);
    const q = $('#cmdQ', m.root), list = $('#cmdL', m.root); let sel = 0, shown = [];
    const draw = () => {
      const t = q.value.toLowerCase(); shown = items.filter((x) => (x.t + ' ' + x.k).toLowerCase().includes(t)); sel = Math.min(sel, Math.max(0, shown.length - 1));
      list.innerHTML = shown.map((x, i) => `<a href="${x.h || '#'}" data-i="${i}" class="${i === sel ? 'sel' : ''}"><span>${x.i}</span><span>${esc(x.t)}</span></a>`).join('') || '<div class="muted">No matches</div>';
      $$('a', list).forEach((a) => (a.onclick = (e) => { const x = shown[+a.dataset.i]; if (x.fn) { e.preventDefault(); x.fn(); } m.close(); }));
    };
    q.addEventListener('input', () => { sel = 0; draw(); });
    q.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, shown.length - 1); draw(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); draw(); }
      if (e.key === 'Enter' && shown[sel]) { const x = shown[sel]; m.close(); x.fn ? x.fn() : (location.hash = x.h); }
      if (e.key === 'Escape') m.close();
    });
    draw(); q.focus();
  }
  document.getElementById('cmdBtn').onclick = palette;
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette(); } if (e.key === 'Escape') document.getElementById('modalRoot').innerHTML = ''; });

  PV.renderChrome();
  PV.checkAI();
  route();
  // nudge the streak/chrome when the user returns to the tab on a new day
  document.addEventListener('visibilitychange', () => { if (!document.hidden) PV.renderChrome(); });
})();
