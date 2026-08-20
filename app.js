// ============================================================================
// Session Run-Up Calendar — generic app logic.
// Reads all state/client-specific values from config.js. Do not hardcode
// state names, dates, or colors here — put them in config.js instead so
// this file can be reused unmodified across every state instance.
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CONFIG } from './config.js';
import { buildIcsString } from './ics.js';

const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
const TABLE = 'events';

let events = [];
let currentView = 'list';
let calMonth, calYear;
let pollTimer = null;

// ----------------------------------------------------------------------
// Boot: apply branding/theme from config, then load data
// ----------------------------------------------------------------------
applyConfigToPage();

const now0 = new Date();
calMonth = CONFIG.defaultCalendarMonth.month;
calYear = CONFIG.defaultCalendarMonth.year;
if (now0.getFullYear() > calYear || (now0.getFullYear() === calYear && now0.getMonth() > calMonth)) {
  calMonth = now0.getMonth();
  calYear = now0.getFullYear();
}

loadEvents();
subscribeRealtime();
pollTimer = setInterval(loadEvents, 15000); // safety-net poll in case realtime drops

// ----------------------------------------------------------------------
// Config → DOM
// ----------------------------------------------------------------------
function applyConfigToPage() {
  document.title = CONFIG.pageTitle;
  document.getElementById('pageTitleTag').textContent = CONFIG.pageTitle;
  document.getElementById('eyebrowText').textContent = CONFIG.eyebrow;
  document.getElementById('headingText').textContent = CONFIG.heading;
  document.getElementById('subText').textContent = CONFIG.subhead;
  document.getElementById('countdownLabel').innerHTML = CONFIG.countdownLabel;
  document.getElementById('footerText').textContent = CONFIG.footerNote;

  const root = document.documentElement.style;
  const t = CONFIG.theme;
  root.setProperty('--ink', t.ink);
  root.setProperty('--paper', t.paper);
  root.setProperty('--paper-2', t.paperTwo);
  root.setProperty('--navy', t.navy);
  root.setProperty('--navy-2', t.navyTwo);
  root.setProperty('--gold', t.gold);
  root.setProperty('--gold-soft', t.goldSoft);
  root.setProperty('--sky', t.sky);
  root.setProperty('--rule', t.rule);
  root.setProperty('--danger', t.danger);
  root.setProperty('--ok', t.ok);

  const catSelect = document.getElementById('fCategory');
  catSelect.innerHTML = Object.keys(CONFIG.categories).map(c => `<option>${c}</option>`).join('');
}

// ----------------------------------------------------------------------
// Data layer (Supabase)
// ----------------------------------------------------------------------
async function loadEvents() {
  setStatus('syncing…');
  const { data, error } = await supabase.from(TABLE).select('*').order('date', { ascending: true });
  if (error) {
    console.error(error);
    setStatus('sync failed — retrying…');
    return;
  }
  events = data.map(rowToEvent);
  setStatus('synced · shared with everyone on this link');
  renderAll();
}

function subscribeRealtime() {
  supabase
    .channel('events-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => {
      loadEvents();
    })
    .subscribe();
}

function rowToEvent(row) {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    endDate: row.end_date || '',
    category: row.category,
    status: row.status,
    desc: row.description || '',
    src: row.source_link || ''
  };
}

function eventToRow(ev) {
  return {
    name: ev.name,
    date: ev.date,
    end_date: ev.endDate || null,
    category: ev.category,
    status: ev.status,
    description: ev.desc || null,
    source_link: ev.src || null
  };
}

async function insertEvent(ev) {
  const { error } = await supabase.from(TABLE).insert([eventToRow(ev)]);
  return error;
}

async function updateEvent(id, ev) {
  const { error } = await supabase.from(TABLE).update(eventToRow(ev)).eq('id', id);
  return error;
}

async function deleteEvent(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  return error;
}

function setStatus(msg) {
  document.getElementById('statusMsg').textContent = msg;
}

// ----------------------------------------------------------------------
// Rendering
// ----------------------------------------------------------------------
function fmtDateBlock(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const dow = d.toLocaleDateString('en-US', { weekday: 'short' });
  const mon = d.toLocaleDateString('en-US', { month: 'short' });
  return { dow, mon, day: d.getDate() };
}

function updateCountdown() {
  const target = new Date(CONFIG.conveneDate + 'T00:00:00');
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  document.getElementById('countdown').textContent = diff > 0 ? diff : '0';
}

function renderLegend() {
  const el = document.getElementById('legend');
  el.innerHTML = Object.entries(CONFIG.categories)
    .map(([cat, col]) => `<span class="chip"><span class="dot" style="background:${col}"></span>${cat}</span>`)
    .join('');
}

function renderList() {
  const container = document.getElementById('listView');
  const emptyState = document.getElementById('emptyState');
  if (events.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const groups = {};
  sorted.forEach(ev => {
    const d = new Date(ev.date + 'T00:00:00');
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  });

  let html = '';
  for (const [monthLabel, evs] of Object.entries(groups)) {
    html += `<div class="month-group"><div class="month-head">${monthLabel} <span class="cnt">${evs.length} event${evs.length > 1 ? 's' : ''}</span></div>`;
    evs.forEach(ev => {
      const db = fmtDateBlock(ev.date);
      const color = CONFIG.categories[ev.category] || '#888';
      html += `
      <div class="event-row">
        <div class="date-block"><div class="dow">${db.dow}</div><div class="dnum">${db.mon} ${db.day}</div></div>
        <div class="cat-bar" style="background:${color}"></div>
        <div>
          <p class="ev-title">${escapeHtml(ev.name)}</p>
          ${ev.desc ? `<p class="ev-desc">${escapeHtml(ev.desc)}</p>` : ''}
          <div class="ev-meta">
            <span class="tag" style="background:${color}22;color:${color}">${ev.category}</span>
            <span class="status-tag">${ev.status}</span>
            ${ev.src ? `<a class="src-link" href="${escapeAttr(ev.src)}" target="_blank" rel="noopener">source ↗</a>` : ''}
          </div>
        </div>
        <div class="row-actions">
          <button class="icon-btn" data-edit="${ev.id}" title="Edit">✎</button>
        </div>
      </div>`;
    });
    html += `</div>`;
  }
  container.innerHTML = html;
  container.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openEdit(btn.getAttribute('data-edit')));
  });
}

function renderCalendar() {
  const container = document.getElementById('calView');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const first = new Date(calYear, calMonth, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();
  const today = new Date();

  const evByDate = {};
  events.forEach(ev => {
    const start = ev.date;
    const end = ev.endDate || ev.date;
    let cur = new Date(start + 'T00:00:00');
    const endD = new Date(end + 'T00:00:00');
    while (cur <= endD) {
      const key = cur.toISOString().slice(0, 10);
      if (!evByDate[key]) evByDate[key] = [];
      evByDate[key].push(ev);
      cur.setDate(cur.getDate() + 1);
    }
  });

  let cells = '';
  const dows = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  dows.forEach(d => (cells += `<div class="cal-dow">${d}</div>`));

  for (let i = 0; i < startDow; i++) {
    const dnum = daysInPrevMonth - startDow + 1 + i;
    cells += `<div class="cal-cell out"><div class="dnum">${dnum}</div></div>`;
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day;
    const evs = evByDate[dateKey] || [];
    let evHtml = evs
      .map(ev => {
        const color = CONFIG.categories[ev.category] || '#888';
        return `<div class="cal-ev" style="background:${color}" data-edit="${ev.id}" title="${escapeAttr(ev.name)}">${escapeHtml(ev.name)}</div>`;
      })
      .join('');
    cells += `<div class="cal-cell ${isToday ? 'today' : ''}"><div class="dnum">${day}</div>${evHtml}</div>`;
  }
  const totalCells = startDow + daysInMonth;
  const remain = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remain; i++) {
    cells += `<div class="cal-cell out"><div class="dnum">${i}</div></div>`;
  }

  container.innerHTML = `
    <div class="cal-nav">
      <button class="btn ghost small" id="calPrev">← Prev</button>
      <h2>${monthNames[calMonth]} ${calYear}</h2>
      <button class="btn ghost small" id="calNext">Next →</button>
    </div>
    <div class="cal-grid">${cells}</div>
  `;
  document.getElementById('calPrev').addEventListener('click', () => shiftMonth(-1));
  document.getElementById('calNext').addEventListener('click', () => shiftMonth(1));
  container.querySelectorAll('[data-edit]').forEach(el => {
    el.addEventListener('click', () => openEdit(el.getAttribute('data-edit')));
  });
}

function shiftMonth(dir) {
  calMonth += dir;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  if (calMonth > 11) { calMonth = 0; calYear++; }
  renderCalendar();
}

function renderAll() {
  renderLegend();
  renderList();
  if (currentView === 'cal') renderCalendar();
  updateCountdown();
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function escapeAttr(str) { return escapeHtml(str); }

// ----------------------------------------------------------------------
// View toggle
// ----------------------------------------------------------------------
document.getElementById('btnList').onclick = () => {
  currentView = 'list';
  document.getElementById('btnList').classList.add('active');
  document.getElementById('btnCal').classList.remove('active');
  document.getElementById('listView').style.display = 'block';
  document.getElementById('calView').style.display = 'none';
};
document.getElementById('btnCal').onclick = () => {
  currentView = 'cal';
  document.getElementById('btnCal').classList.add('active');
  document.getElementById('btnList').classList.remove('active');
  document.getElementById('listView').style.display = 'none';
  document.getElementById('calView').style.display = 'block';
  renderCalendar();
};

// ----------------------------------------------------------------------
// Modal handling
// ----------------------------------------------------------------------
const overlay = document.getElementById('overlay');
document.getElementById('btnAdd').onclick = () => openAdd();
document.getElementById('btnCancel').onclick = () => (overlay.style.display = 'none');

function openAdd() {
  document.getElementById('modalTitle').textContent = 'Add event';
  document.getElementById('editId').value = '';
  document.getElementById('fName').value = '';
  document.getElementById('fDate').value = '';
  document.getElementById('fEndDate').value = '';
  document.getElementById('fCategory').value = Object.keys(CONFIG.categories)[0];
  document.getElementById('fStatus').value = 'Confirmed';
  document.getElementById('fDesc').value = '';
  document.getElementById('fSrc').value = '';
  document.getElementById('btnDelete').style.display = 'none';
  hideModalError();
  overlay.style.display = 'flex';
}

function openEdit(id) {
  const ev = events.find(e => String(e.id) === String(id));
  if (!ev) return;
  document.getElementById('modalTitle').textContent = 'Edit event';
  document.getElementById('editId').value = ev.id;
  document.getElementById('fName').value = ev.name;
  document.getElementById('fDate').value = ev.date;
  document.getElementById('fEndDate').value = ev.endDate || '';
  document.getElementById('fCategory').value = ev.category;
  document.getElementById('fStatus').value = ev.status;
  document.getElementById('fDesc').value = ev.desc || '';
  document.getElementById('fSrc').value = ev.src || '';
  document.getElementById('btnDelete').style.display = 'inline-block';
  hideModalError();
  overlay.style.display = 'flex';
}
window.openEdit = openEdit; // convenience for console debugging

function showModalError(msg) {
  const el = document.getElementById('modalError');
  el.textContent = msg;
  el.style.display = 'block';
}
function hideModalError() {
  document.getElementById('modalError').style.display = 'none';
}

document.getElementById('btnSave').onclick = async () => {
  const id = document.getElementById('editId').value;
  const name = document.getElementById('fName').value.trim();
  const date = document.getElementById('fDate').value;
  if (!name || !date) {
    showModalError('Event name and date are required.');
    return;
  }
  const data = {
    name,
    date,
    endDate: document.getElementById('fEndDate').value,
    category: document.getElementById('fCategory').value,
    status: document.getElementById('fStatus').value,
    desc: document.getElementById('fDesc').value.trim(),
    src: document.getElementById('fSrc').value.trim()
  };

  const saveBtn = document.getElementById('btnSave');
  saveBtn.disabled = true;
  const error = id ? await updateEvent(id, data) : await insertEvent(data);
  saveBtn.disabled = false;

  if (error) {
    console.error(error);
    showModalError('Save failed — check your connection and try again.');
    return;
  }
  overlay.style.display = 'none';
  await loadEvents();
};

document.getElementById('btnDelete').onclick = async () => {
  const id = document.getElementById('editId').value;
  if (!id) return;
  if (!confirm('Delete this event?')) return;
  const error = await deleteEvent(id);
  if (error) {
    console.error(error);
    showModalError('Delete failed — check your connection and try again.');
    return;
  }
  overlay.style.display = 'none';
  await loadEvents();
};

overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });

// ----------------------------------------------------------------------
// ICS export (client-side snapshot of current events)
// ----------------------------------------------------------------------
document.getElementById('btnExport').onclick = () => {
  const icsContent = buildIcsString(events, CONFIG);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = CONFIG.icsFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ----------------------------------------------------------------------
// Subscribe (live feed) — distinct from the one-time export above. Points
// calendar apps at api/feed.js, served at /api/feed.ics via the rewrite in
// vercel.json, which regenerates the feed from Supabase on every request.
// ----------------------------------------------------------------------
function feedUrls() {
  const https = window.location.origin + '/api/feed.ics';
  const webcal = https.replace(/^https?:/, 'webcal:');
  const google = 'https://www.google.com/calendar/render?cid=' + encodeURIComponent(webcal);
  return { https, webcal, google };
}

document.getElementById('btnSubscribe').onclick = () => {
  const { https, webcal, google } = feedUrls();
  document.getElementById('feedUrlInput').value = https;
  document.getElementById('appleCalLink').href = webcal;
  document.getElementById('googleCalLink').href = google;
  document.getElementById('subscribeOverlay').style.display = 'flex';
};
document.getElementById('btnSubscribeClose').onclick = () => {
  document.getElementById('subscribeOverlay').style.display = 'none';
};
document.getElementById('subscribeOverlay').addEventListener('click', e => {
  if (e.target.id === 'subscribeOverlay') document.getElementById('subscribeOverlay').style.display = 'none';
});
document.getElementById('btnCopyFeed').onclick = async () => {
  const input = document.getElementById('feedUrlInput');
  input.select();
  try {
    await navigator.clipboard.writeText(input.value);
  } catch {
    document.execCommand('copy');
  }
  const btn = document.getElementById('btnCopyFeed');
  const original = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(() => (btn.textContent = original), 1500);
};
