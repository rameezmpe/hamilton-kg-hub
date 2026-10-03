const grid = document.getElementById('grid');
const chipsEl = document.getElementById('categoryChips');
const searchEl = document.getElementById('search');
const countEl = document.getElementById('count');
const emptyEl = document.getElementById('empty');
const eventsEl = document.getElementById('events');
const eventCountEl = document.getElementById('eventCount');
const moreBtn = document.getElementById('moreEvents');
const appsCol = document.getElementById('appsCol');
const drawerHandle = document.getElementById('drawerHandle');

let activeCategory = 'All';
let showAllEvents = false;
const EVENT_LIMIT = 15;

const categories = ['All', ...new Set(LINKS.map(l => l.category))];

function renderChips() {
  chipsEl.innerHTML = '';
  categories.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'chip' + (cat === activeCategory ? ' active' : '');
    b.textContent = cat;
    b.onclick = () => { activeCategory = cat; renderChips(); renderGrid(); };
    chipsEl.appendChild(b);
  });
}

function matches(link, q) {
  const hay = (link.title + ' ' + link.description + ' ' + link.category).toLowerCase();
  return hay.includes(q);
}

function renderGrid() {
  const q = searchEl.value.trim().toLowerCase();

  let list = LINKS.filter(l => {
    if (activeCategory !== 'All' && l.category !== activeCategory) return false;
    if (q && !matches(l, q)) return false;
    return true;
  });

  grid.innerHTML = '';
  emptyEl.classList.toggle('hidden', list.length > 0);
  countEl.textContent = `${list.length} of ${LINKS.length} shown`;
  const peekCount = document.getElementById('peekCount');
  if (peekCount) peekCount.textContent = `(${list.length})`;

  list.forEach(l => {
    const card = document.createElement('a');
    card.className = 'card';
    card.href = l.url;
    card.target = '_blank';
    card.rel = 'noopener';
    card.innerHTML = `
      <div class="card-top">
        <span class="icon">${l.icon || '🔗'}</span>
        <span class="badges">
          <span class="badge">${l.category}</span>
        </span>
      </div>
      <h3>${l.title}</h3>
      <p>${l.description || ''}</p>
      <span class="visit">Open →</span>
    `;
    grid.appendChild(card);
  });
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// Calendar: kindergarten dates ONLY (tag === 'kindergarten'), always.
function renderEvents() {
  const q = searchEl.value.trim().toLowerCase();
  const today = todayStr();

  let list = (typeof EVENTS !== 'undefined' ? EVENTS : [])
    .filter(e => e.tag === 'kindergarten')
    .filter(e => e.date >= today)
    .filter(e => {
      if (q && !(e.title.toLowerCase().includes(q) || e.date.includes(q))) return false;
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

  const total = list.length;
  const shown = showAllEvents ? list : list.slice(0, EVENT_LIMIT);

  eventsEl.innerHTML = '';
  shown.forEach(e => {
    const d = new Date(e.date + 'T00:00:00');
    const label = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `<strong>${label}</strong><span>${e.title}${e.time ? ` <span class="etime">${e.time}</span>` : ''}</span>`;
    eventsEl.appendChild(div);
  });

  if (total === 0) {
    eventsEl.innerHTML = '<div class="empty">No upcoming kindergarten dates match.</div>';
  }

  eventCountEl.textContent = `${total} upcoming`;
  moreBtn.style.display = total > EVENT_LIMIT ? '' : 'none';
  moreBtn.textContent = showAllEvents ? 'Show less ↑' : `Show all ${total} dates ↓`;
}

searchEl.addEventListener('input', () => { renderGrid(); renderEvents(); });
moreBtn.addEventListener('click', () => { showAllEvents = !showAllEvents; renderEvents(); });

// ---- Mobile drawer: tap + swipe up/down, peek = half screen ----
(function initDrawer() {
  if (!appsCol || !drawerHandle) return;
  const mq = window.matchMedia('(max-width: 860px)');
  const peekEl = document.getElementById('drawerPeek');
  let startY = null, deltaY = 0, dragging = false, suppressClick = false;
  let peekH = 170; // measured at runtime; fallback until then

  function measurePeek() {
    if (!mq.matches || !peekEl) return;
    peekH = Math.ceil(peekEl.getBoundingClientRect().height);
    appsCol.style.setProperty('--peek', peekH + 'px');
  }

  function setOpen(open) {
    if (!mq.matches) return;
    appsCol.classList.toggle('open', open);
    document.body.classList.toggle('drawer-open', open);
    drawerHandle.setAttribute('aria-expanded', open ? 'true' : 'false');
    const hint = document.getElementById('peekHint');
    if (hint) hint.textContent = open ? 'swipe down to see dates ↓' : 'swipe up for all ↑';
  }

  drawerHandle.addEventListener('click', () => {
    if (suppressClick) { suppressClick = false; return; }
    setOpen(!appsCol.classList.contains('open'));
  });

  drawerHandle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!appsCol.classList.contains('open')); }
  });

  drawerHandle.addEventListener('touchstart', e => {
    dragging = true; startY = e.touches[0].clientY; deltaY = 0;
    appsCol.style.transition = 'none';
  }, { passive: true });

  drawerHandle.addEventListener('touchmove', e => {
    if (!dragging) return;
    deltaY = e.touches[0].clientY - startY;
    // drag feedback: only allow small movement, snap on release
    appsCol.style.transform = appsCol.classList.contains('open')
      ? `translateY(${Math.max(0, deltaY)}px)`
      : `translateY(calc(100% - ${peekH}px + ${Math.min(0, deltaY)}px))`;
  }, { passive: true });

  drawerHandle.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    appsCol.style.transition = '';
    appsCol.style.transform = '';
    if (Math.abs(deltaY) > 10) suppressClick = true; // a drag just happened: ignore the follow-up click
    if (deltaY < -40) setOpen(true);
    else if (deltaY > 40) setOpen(false);
  });

  // tapping the always-visible search opens the drawer so results + chips are reachable
  searchEl.addEventListener('focus', () => setOpen(true));

  // Native sheet behavior: swiping down at the very top of the list drags the drawer closed.
  // Anywhere else (or when not at top) the list scrolls normally.
  const drawerBody = document.getElementById('drawerBody');
  let bodyStartY = null, bodyDeltaY = 0, takingOver = false;

  function bodyReset() {
    takingOver = false;
    appsCol.style.transition = '';
    appsCol.style.transform = '';
  }

  if (drawerBody) {
    drawerBody.addEventListener('touchstart', e => {
      bodyStartY = e.touches[0].clientY; bodyDeltaY = 0; takingOver = false;
    }, { passive: true });

    drawerBody.addEventListener('touchmove', e => {
      if (!mq.matches || !appsCol.classList.contains('open')) return;
      bodyDeltaY = e.touches[0].clientY - bodyStartY;
      if (!takingOver) {
        if (drawerBody.scrollTop <= 0 && bodyDeltaY > 0) {
          takingOver = true;
          appsCol.style.transition = 'none';
        } else {
          return; // normal list scroll
        }
      }
      e.preventDefault(); // keep the page/list from scrolling while we drag the sheet
      appsCol.style.transform = `translateY(${Math.max(0, bodyDeltaY)}px)`;
    }, { passive: false });

    const bodyEnd = () => {
      if (!takingOver) return;
      const pulled = bodyDeltaY;
      bodyReset();
      if (pulled > 70) setOpen(false); // else snaps back open
    };
    drawerBody.addEventListener('touchend', bodyEnd, { passive: true });
    drawerBody.addEventListener('touchcancel', bodyReset, { passive: true });
  }

  measurePeek();
  window.addEventListener('resize', measurePeek);
  window.addEventListener('load', measurePeek);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measurePeek);
})();

renderChips();
renderGrid();
renderEvents();
