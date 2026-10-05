/* =====================================================================
   BMP Sales core — the Rahul Jain sales sciences as pure functions.
   Shared by the browser (bmp.js) and the server (weekly MIS email).
   No DOM, no I/O. UMD: window.BMPCore in the browser, module.exports in Node.

   Sciences implemented here (page refs = The BMP Notebook, W = week, p = page):
   - Negative M.I.S: score = -(% work not done + % done late) vs plan, weekly,
     green when better than -10 (W26 p.425-427, W35 p.489)
   - MeCA: Meetings, Conversion, Average ticket (W24 p.382, W25 p.402)
   - 5 Parameters of Sales + compounding (W35 p.498-500, W38 p.602-603)
   - Client star rating 60/30/10 -> 1-5 stars, VIP corridor (W19 p.324, W15 p.257)
   - Sales P.C follow-up queue: every broken promise, owner-wise (W11 p.221, W17 p.288)

   ASMP (Advanced Sales & Marketing Program) sciences added in cc11:
   - C.R.R / N.B.D streams on every enquiry, lead and win; N.B.D:C.R.R ratio (target 50:50)
   - Sales funnel 5-for-9: leads, 4 stage conversions, avg sale, transactions, margin,
     sales lead time; I.P.L — identify the bottleneck stage, prioritise, leverage by P.O.S.T
   - Negative MeCA (M.I.S level 2/3): % meetings not done + ₹ of meetings not done,
     % conversion below benchmark, % avg sale lost + ₹ lost, ₹ of clients lost
   - Golden Circle: Rocket Client score, Black Circle + B.C.C, wallet share / N.B.D of C.R.R gap
   - Lead-gen order (sorry calls → N.B.D-C.R.R → lost prospects → references → data → Dream 150)
   - Profit planning / gap analysis → leads, meetings and clients needed per month
   - P.C items for the S.C: meeting confirmation, meeting not logged, C.R.M handover, B.C.C, N.B.D-C.R.R
   ===================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BMPCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DAY = 86400000;

  // ---------- dates (all in IST, YYYY-MM-DD keys) ----------
  function istDate(t) {
    // t: ms timestamp or Date -> Date shifted to IST wall-clock
    const d = t instanceof Date ? t : new Date(t);
    return new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  }
  function key(d) { // d already IST-shifted
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), da = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + da;
  }
  function todayKey(now) { return key(istDate(now || Date.now())); }
  function tsKey(t) { return key(istDate(t)); }
  function addDays(k, n) { const d = new Date(k + 'T00:00:00'); d.setDate(d.getDate() + n); return key(d); }
  function dow(k) { return new Date(k + 'T00:00:00').getDay(); } // 0 Sun .. 6 Sat
  function nextWorkDay(fromKey, days) { // mirrors the app: skips Sundays only
    let k = fromKey;
    while (days > 0) { k = addDays(k, 1); if (dow(k) !== 0) days--; }
    return k;
  }
  function diffDays(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / DAY); }
  // Week = Monday..Sunday. weekOf(k) -> {start,end,label,id}
  function weekOf(k) {
    const d = dow(k); const start = addDays(k, d === 0 ? -6 : 1 - d); const end = addDays(start, 6);
    return { start, end, id: isoWeekId(start), label: fmtRange(start, end) };
  }
  function isoWeekId(startKey) {
    const d = new Date(startKey + 'T00:00:00'); const thu = new Date(d); thu.setDate(d.getDate() + 3);
    const y = thu.getFullYear(); const jan4 = new Date(y, 0, 4); const w = 1 + Math.round(((thu - jan4) / DAY - 3 + ((jan4.getDay() + 6) % 7)) / 7);
    return y + '-W' + String(w).padStart(2, '0');
  }
  function fmtRange(a, b) {
    const f = k => { const d = new Date(k + 'T00:00:00'); return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); };
    return f(a) + ' – ' + f(b);
  }
  function weeksBack(n, now) { // current week first, then n-1 previous
    const cur = weekOf(todayKey(now)); const out = [cur];
    for (let i = 1; i < n; i++) out.push(weekOf(addDays(cur.start, -7 * i)));
    return out;
  }
  function workingDaysElapsed(w, now) { // Mon-Sat within the week up to today
    const tk = todayKey(now); let n = 0;
    for (let k = w.start; k <= w.end && k <= tk; k = addDays(k, 1)) if (dow(k) !== 0) n++;
    return n;
  }

  // ---------- attribution ----------
  const TOUCH = new Set(['CALL', 'OUTCOME', 'EMAIL', 'WHATSAPP', 'MEETING', 'MEET', 'DECK', 'SORRY', 'REF', 'OBJ']);
  function ownerOf(rec) { return rec.assignedTo || rec.owner || rec.createdBy || 'unassigned'; }
  function inWeek(k, w) { return k >= w.start && k <= w.end; }

  // Outcome -> auto next-date rule, mirrors the app's OUTCOMES table (d = working days)
  const OUTCOME_D = {
    '📵 Ringing / no answer': 1, '📄 RFQ received — rates needed': 1, '📎 Asked for company profile': 2,
    '🤝 Meeting fixed / done': 2, '🔕 Busy — retry later': 1, '✉️ Email / WhatsApp sent': 3, '🚫 Client disconnecting calls': 7,
    '🔌 Switched off': 1, '👉 Not concerned — referred someone': 1, '💰 Rates shared — awaiting feedback': 3,
    '🛄 Will share spot inquiries': 15, '🏢 Vendor registration in process': 7, '🏥 Unavailable (travel/meeting/hospital)': 3,
  };
  const CONNECTED = new Set(['📆 Client asked to call back', '📄 RFQ received — rates needed', '📎 Asked for company profile',
    '🤝 Meeting fixed / done', '👉 Not concerned — referred someone', '📃 Contract finalized — reconnect later',
    '🏃 Person left company / retired', '💰 Rates shared — awaiting feedback', '🛄 Will share spot inquiries',
    '🏢 Vendor registration in process', '🎯 WON — first load received', '⛔ DEAD — no requirement / do not call']);

  // ---------- Negative M.I.S (weekly, per owner) ----------
  /*
    data = { leads, activity, rfq, eqc, users? }
    cfg  = { tC (connected/day target), rfqTatHrs, eqcTatHrs, greenAt (-10) }
    Returns { week, byUser: { user: { planned, done, onTime, late, notDone, score, pctWND, pctWNDOT, kras:[...] } } }
    Planned work is reconstructed from history so the plan can't be edited away:
      - every outcome that auto-sets a next date is a promise for that date (W4 p.50: verbal doesn't work)
      - every RFQ follow-up note promises the next follow-up in 3 working days
      - every RFQ / enquiry promises rates within the TAT
      - the daily connected target is the calling plan (tC per working day)
  */
  function misWeek(data, cfg, w, now) {
    cfg = cfg || {}; const tC = cfg.connPerDay !== undefined ? +cfg.connPerDay : (+cfg.tC || 0); const rfqTat = (+cfg.rfqTatHrs || 24) * 3600000; const eqcTat = (+cfg.eqcTatHrs || 24) * 3600000;
    const tk = todayKey(now); const nowMs = now || Date.now();
    const leads = data.leads || [], activity = data.activity || [], rfq = data.rfq || [], eqc = data.eqc || [];
    const leadOwner = {}; leads.forEach(l => { leadOwner[l.id] = ownerOf(l); });
    const byUser = {};
    const U = u => (byUser[u] = byUser[u] || { planned: 0, done: 0, onTime: 0, late: 0, notDone: 0, kras: {}, items: [] });
    const kra = (u, name) => { const s = U(u); return (s.kras[name] = s.kras[name] || { planned: 0, done: 0, onTime: 0 }); };
    function count(u, name, isDone, isOnTime, item) {
      const s = U(u), k = kra(u, name);
      s.planned++; k.planned++;
      if (isDone) { s.done++; k.done++; if (isOnTime) { s.onTime++; k.onTime++; } else s.late++; } else s.notDone++;
      if (item && !isDone) s.items.push(item);
    }
    // touches per lead: sorted list of {k, t, by}
    const touches = {};
    activity.forEach(a => { if (!TOUCH.has(a.ch)) return; (touches[a.id] = touches[a.id] || []).push({ k: tsKey(a.t), t: a.t, by: a.by }); });
    Object.values(touches).forEach(arr => arr.sort((x, y) => x.t - y.t));
    const firstTouchAfter = (id, t) => (touches[id] || []).find(x => x.t > t);

    // KRA 1: Follow-ups on the promised date — reconstructed from outcomes
    const seen = new Set();
    activity.forEach(a => {
      if (a.ch !== 'OUTCOME') return; const d = OUTCOME_D[a.ty]; if (!d) return;
      const promised = nextWorkDay(tsKey(a.t), d);
      if (!inWeek(promised, w) || promised > tk) return; // only promises falling due in this week, up to today
      const u = a.by || leadOwner[a.id] || 'unassigned'; const sig = a.id + '|' + promised; if (seen.has(sig)) return; seen.add(sig);
      const L = leads.find(l => l.id === a.id); if (L && /DEAD|BAD DATA|PARKED/.test(L.status) && L.lastCall && L.lastCall <= promised) { /* closed before due — still a promise kept if closed */ }
      const ft = firstTouchAfter(a.id, a.t);
      const done = !!ft; const onTime = done && ft.k <= promised;
      count(u, 'Follow-ups on the promised date', done, onTime, { kind: 'lead', id: a.id, co: a.co, due: promised, what: 'Follow-up promised by "' + a.ty + '"' });
    });
    // KRA 1b: manually set next dates (lead.nextDate) that fell due this week and are still pending
    leads.forEach(L => {
      if (!L.nextDate || !inWeek(L.nextDate, w) || L.nextDate > tk) return;
      if (/DEAD|BAD DATA|PARKED/.test(L.status)) return;
      const sig = L.id + '|' + L.nextDate; if (seen.has(sig)) return; seen.add(sig);
      const lastT = (touches[L.id] || []).slice(-1)[0];
      const done = lastT && lastT.k >= L.nextDate; // a touch on/after the date clears it (the app rewrites nextDate on outcome, so a pending one means not done)
      count(leadOwner[L.id] || 'unassigned', 'Follow-ups on the promised date', !!done, !!done && lastT.k === L.nextDate, { kind: 'lead', id: L.id, co: L.co, due: L.nextDate, what: 'Scheduled follow-up' });
    });
    // KRA 2: Connected-calls plan (tC per working day, Mon-Sat)
    if (tC > 0) {
      const days = workingDaysElapsed(w, now);
      const connBy = {};
      activity.forEach(a => { if (a.ch === 'OUTCOME' && CONNECTED.has(a.ty)) { const k = tsKey(a.t); if (inWeek(k, w)) connBy[a.by || 'unassigned'] = (connBy[a.by || 'unassigned'] || 0) + 1; } });
      const users = new Set([...Object.keys(connBy), ...Object.keys(byUser)]);
      (data.users || []).forEach(u => users.add(u));
      const active = new Set(); const since = nowMs - 28 * DAY;
      leads.forEach(l => { if (l.assignedTo) active.add(l.assignedTo); });
      activity.forEach(a => { if (a.by && a.t >= since) active.add(a.by); });
      users.forEach(u => {
        if (u === 'unassigned' || u === 'suyashh' || !active.has(u)) return; // the plan belongs to callers who are actually calling
        const planned = tC * days, got = connBy[u] || 0;
        const s = U(u), k = kra(u, 'Connected calls vs daily target');
        s.planned += planned; k.planned += planned; const d = Math.min(got, planned); s.done += d; s.onTime += d; k.done += d; k.onTime += d; s.notDone += planned - d;
      });
    }
    // KRA 3: RFQ rates within TAT
    rfq.forEach(r => {
      const c = r.createdAt || 0; if (!c) return; const dueMs = c + rfqTat; const dueK = tsKey(dueMs);
      if (!inWeek(dueK, w) || dueMs > nowMs) return;
      const sent = r.sentAt || (r.status !== 'NEW_ENQUIRY' ? (r.followUps && r.followUps[0] && r.followUps[0].t) || 0 : 0);
      count(ownerOf(r), 'RFQ rates sent within ' + (cfg.rfqTatHrs || 24) + ' h', !!sent, !!sent && sent <= dueMs, { kind: 'rfq', id: r.id, co: r.co, due: dueK, what: 'Send rates (TAT)' });
    });
    // KRA 4: RFQ follow-ups on date — reconstructed from follow-up notes (+3 working days each)
    rfq.forEach(r => {
      const fu = (r.followUps || []).filter(f => f.t).sort((a, b) => a.t - b.t);
      fu.forEach((f, i) => {
        if (/^Status →/.test(f.note || '') && /Won|Lost/.test(f.note || '')) return;
        const promised = nextWorkDay(tsKey(f.t), 3); if (!inWeek(promised, w) || promised > tk) return;
        const closedBefore = (r.status === 'WON' || r.status === 'LOST') && r.closedDate && r.closedDate <= promised;
        const next = fu[i + 1]; const done = !!next || closedBefore; const onTime = closedBefore || (next && tsKey(next.t) <= promised);
        count(f.by || ownerOf(r), 'RFQ follow-ups on the promised date', done, !!onTime, { kind: 'rfq', id: r.id, co: r.co, due: promised, what: 'RFQ follow-up' });
      });
    });
    // KRA 5: Enquiry (EQC) quoted within TAT, and EQC follow-ups from its log
    eqc.forEach(e => {
      const c = e.createdAt || 0; if (c) { const dueMs = c + eqcTat, dueK = tsKey(dueMs); if (inWeek(dueK, w) && dueMs <= nowMs) count(ownerOf(e), 'Enquiries quoted within ' + (cfg.eqcTatHrs || 24) + ' h', !!e.quotedAt, !!e.quotedAt && e.quotedAt <= dueMs, { kind: 'eqc', id: e.id, co: e.co, due: dueK, what: 'Quote the enquiry (TAT)' }); }
      const log = (e.log || []).filter(x => x.next).sort((a, b) => a.t - b.t);
      log.forEach((x, i) => {
        if (!inWeek(x.next, w) || x.next > tk) return;
        const next = (e.log || []).find(y => y.t > x.t); const closed = /WON|LOST|REGRET/.test(e.status) && e.closedAt && tsKey(e.closedAt) <= x.next;
        const done = !!next || closed; const onTime = closed || (next && tsKey(next.t) <= x.next);
        count(x.by || ownerOf(e), 'Enquiry follow-ups on the promised date', done, !!onTime, { kind: 'eqc', id: e.id, co: e.co, due: x.next, what: 'Enquiry follow-up' });
      });
    });
    // finalise
    Object.keys(byUser).forEach(u => {
      const s = byUser[u];
      s.pctWND = s.planned ? Math.round(s.notDone / s.planned * 100) : 0;          // K.P.I quantity: % work not done as per plan
      s.pctWNDOT = s.done ? Math.round(s.late / s.done * 100) : 0;                  // K.P.I time: % of done work not on time
      const ks = Object.values(s.kras).filter(k => k.planned > 0);
      ks.forEach(k => { k.pct = -Math.round(((k.planned - k.done) + (k.done - k.onTime)) / k.planned * 100); });
      // one negative number per person = average of the K.R.A percentages (each measure counts equally,
      // so a 240-call plan cannot drown 20 follow-up promises)
      s.score = ks.length ? Math.round(ks.reduce((a, k) => a + k.pct, 0) / ks.length) : 0;
      s.green = s.score >= (cfg.greenAt !== undefined ? +cfg.greenAt : -10);
      s.items.sort((a, b) => (a.due < b.due ? -1 : 1));
    });
    return { week: w, byUser };
  }

  // ---------- MeCA & the 5 parameters (per owner, for a date range) ----------
  function meca(data, range, opts) {
    opts = opts || {};
    const leads = data.leads || [], activity = data.activity || [], rfq = data.rfq || [], eqc = data.eqc || [];
    const inR = k => k >= range.start && k <= range.end;
    const by = {};
    const B = u => (by[u] = by[u] || { meetings: 0, zoom: 0, leads: 0, connected: 0, dials: 0, won: 0, lost: 0, closed: 0, revenue: 0, wonValues: [], decks: 0, refsAsked: 0, sorry: 0 });
    activity.forEach(a => {
      const k = tsKey(a.t); if (!inR(k)) return; const u = a.by || 'unassigned'; const s = B(u);
      if (a.ch === 'CALL') s.dials++;
      if (a.ch === 'OUTCOME') { if (CONNECTED.has(a.ty)) s.connected++; if (/Meeting/.test(a.ty)) s.meetings++; }
      if (a.ch === 'MEETING') { s.meetings++; if (/zoom/i.test(a.ty + ' ' + (a.dt || ''))) s.zoom++; }
      if (a.ch === 'DECK') s.decks++;
      if (a.ch === 'REF') s.refsAsked++;
      if (a.ch === 'SORRY') s.sorry++;
    });
    eqc.forEach(e => {
      const u = ownerOf(e); const ck = e.createdAt ? tsKey(e.createdAt) : e.dt; if (ck && inR(ck)) B(u).leads++;
      const closeK = e.closedAt ? tsKey(e.closedAt) : null;
      if (closeK && inR(closeK)) { const s = B(u); if (e.status === 'WON') { s.won++; s.closed++; const v = +e.value || 0; s.revenue += v; if (v) s.wonValues.push(v); } else if (e.status === 'LOST' || e.status === 'REGRET') { s.lost++; s.closed++; } }
    });
    rfq.forEach(r => {
      if (!r.closedDate || !inR(r.closedDate)) return; const s = B(ownerOf(r));
      if (r.status === 'WON') { s.won++; s.closed++; const v = +r.value || 0; s.revenue += v; if (v) s.wonValues.push(v); }
      else if (r.status === 'LOST') { s.lost++; s.closed++; }
    });
    // WON leads (first load) counted once, on the WON outcome date, if not already an RFQ/EQC win
    activity.forEach(a => { if (a.ch === 'OUTCOME' && /WON/.test(a.ty) && inR(tsKey(a.t))) { const L = leads.find(l => l.id === a.id); const s = B(a.by || (L && ownerOf(L)) || 'unassigned'); s.won++; s.closed++; const v = L && +L.value || 0; s.revenue += v; if (v) s.wonValues.push(v); } });
    const out = {};
    Object.keys(by).forEach(u => {
      const s = by[u];
      if (s.leads >= s.won && s.leads) { s.conversion = Math.round(s.won / s.leads * 100); s.convBasis = 'won ÷ enquiries captured'; }
      else if (s.connected) { s.conversion = Math.min(100, Math.round(s.won / s.connected * 100)); s.convBasis = 'won ÷ connected conversations'; }
      else { s.conversion = 0; s.convBasis = 'no enquiries or conversations in range'; }
      s.avgTicket = s.wonValues.length ? Math.round(s.wonValues.reduce((a, b) => a + b, 0) / s.wonValues.length) : 0;
      out[u] = s;
    });
    // team total
    const T = { meetings: 0, zoom: 0, leads: 0, connected: 0, dials: 0, won: 0, lost: 0, closed: 0, revenue: 0, wonValues: [], decks: 0, refsAsked: 0, sorry: 0 };
    Object.values(out).forEach(s => { Object.keys(T).forEach(k => { if (Array.isArray(T[k])) T[k] = T[k].concat(s[k]); else T[k] += s[k]; }); });
    if (T.leads >= T.won && T.leads) { T.conversion = Math.round(T.won / T.leads * 100); T.convBasis = 'won ÷ enquiries captured'; }
    else if (T.connected) { T.conversion = Math.min(100, Math.round(T.won / T.connected * 100)); T.convBasis = 'won ÷ connected conversations'; }
    else { T.conversion = 0; T.convBasis = 'no enquiries or conversations in range'; }
    T.avgTicket = T.wonValues.length ? Math.round(T.wonValues.reduce((a, b) => a + b, 0) / T.wonValues.length) : 0;
    return { range, byUser: out, team: T };
  }

  // ---------- 5 parameters: revenue = leads × CR × avg ticket × transactions (W35 p.500) ----------
  function fiveParams(p) {
    const leads = +p.leads || 0, cr = +p.cr || 0, avg = +p.avg || 0, txn = +p.txn || 0;
    const clients = leads * cr / 100; const revenue = clients * avg * txn;
    return { leads, cr, clients: round1(clients), avg, txn, revenue: Math.round(revenue), margin: p.marginPct ? Math.round(revenue * (+p.marginPct) / 100) : null };
  }
  function compound(p, pct) { // +pct% on each of the 4 levers
    const f = 1 + (+pct || 0) / 100;
    return fiveParams({ leads: p.leads * f, cr: p.cr * f, avg: p.avg * f, txn: p.txn * f, marginPct: p.marginPct });
  }
  function round1(x) { return Math.round(x * 10) / 10; }

  // ---------- Client star rating (60/30/10) ----------
  // clients: [{payDays, monthlyRev, gpPct}] -> adds score (0-100) and star (1-5) unless starOverride
  function rateClients(clients, weights) {
    weights = weights || { pay: 60, vol: 30, gp: 10 };
    const arr = clients.filter(c => c.payDays || c.monthlyRev || c.gpPct);
    const pct = (vals, v, invert) => { // percentile rank 0..100
      const s = vals.filter(x => x !== undefined && x !== null && !isNaN(x)); if (!s.length || v === undefined || v === null || isNaN(v)) return 50;
      const below = s.filter(x => invert ? x > v : x < v).length; const eq = s.filter(x => x === v).length;
      return Math.round((below + eq / 2) / s.length * 100);
    };
    const pays = arr.map(c => +c.payDays), vols = arr.map(c => +c.monthlyRev), gps = arr.map(c => +c.gpPct);
    clients.forEach(c => {
      const sp = pct(pays, +c.payDays, true), sv = pct(vols, +c.monthlyRev, false), sg = pct(gps, +c.gpPct, false);
      c.score = Math.round((sp * weights.pay + sv * weights.vol + sg * weights.gp) / (weights.pay + weights.vol + weights.gp));
      const auto = c.score >= 80 ? 5 : c.score >= 60 ? 4 : c.score >= 40 ? 3 : c.score >= 20 ? 2 : 1;
      c.starAuto = auto; c.star = c.starOverride || auto;
    });
    return clients;
  }

  // ---------- Sales P.C queue: every broken promise, owner-wise ----------
  function pcQueue(data, cfg, now) {
    cfg = cfg || {}; const tk = todayKey(now); const nowMs = now || Date.now();
    const leads = data.leads || [], activity = data.activity || [], rfq = data.rfq || [], eqc = data.eqc || [], clients = data.clients || [];
    const idleDays = +cfg.hotIdleDays || 3, rfqTat = (+cfg.rfqTatHrs || 24) * 3600000, eqcTat = (+cfg.eqcTatHrs || 24) * 3600000, noLoadDays = +cfg.wonFlagDays || 30, otdDays = +cfg.otdReportDays || 30, refDays = +cfg.refAskDays || 30;
    const lastTouch = {}; const everDialled = new Set();
    activity.forEach(a => { if (TOUCH.has(a.ch)) { const k = tsKey(a.t); if (!lastTouch[a.id] || lastTouch[a.id] < k) lastTouch[a.id] = k; } if (a.ch === 'CALL' || a.ch === 'OUTCOME') everDialled.add(a.id); });
    const q = [];
    const push = (type, label, kind, rec, due, action, owner) => q.push({ type, label, kind, id: rec.id, co: rec.co, name: rec.name || rec.contactName || '', owner: owner || ownerOf(rec), due, days: due ? Math.max(0, diffDays(due, tk)) : 0, action, nudges: rec.pcNudges || 0, pcLast: rec.pcLast || '' });
    leads.forEach(L => {
      if (/DEAD|BAD DATA|PARKED/.test(L.status)) return;
      if (L.nextDate && L.nextDate < tk) push('OVERDUE', 'Overdue follow-up', 'lead', L, L.nextDate, 'Call today and log the outcome');
      if ((L.stage ?? 0) === 0 && !L.outcome && !everDialled.has(L.id) && !L.nextDate) push('NO_ATTEMPT', 'Never dialled', 'lead', L, '', 'First dial — fresh lead sitting untouched');
      const hot = L.status === 'HOT' || (L.stage >= 4 && L.stage < 8) || /RFQ received|Rates shared|Meeting/.test(L.outcome || '');
      if (hot && lastTouch[L.id] && diffDays(lastTouch[L.id], tk) >= idleDays && !(L.nextDate && L.nextDate >= tk)) push('HOT_IDLE', 'Hot lead idle ' + diffDays(lastTouch[L.id], tk) + 'd', 'lead', L, lastTouch[L.id], 'Touch today — hot leads cool in ' + idleDays + ' days');
      if (L.stage === 8 && L.stageStatus === 'Completed' && !L.firstLoadMoved && L.stageDate && diffDays(L.stageDate, tk) >= noLoadDays) push('NO_LOAD', 'Signed, no load', 'lead', L, L.stageDate, 'Chase the first indent');
      if ((L.status === 'WON' || L.stage === 8) && !L.refsAskedAt) push('REFS', 'References not asked', 'lead', L, L.stageDate || '', 'Ask face to face for 5 references — de-risk the referrer');
      // ASMP — the S.C's meeting discipline: confirm the same morning, log whether it was held
      if (L.meetAt) {
        const nextWD = nextWorkDay(tk, 1);
        const held = (activity || []).some(a => a.id === L.id && a.ch === 'MEETING' && tsKey(a.t) >= L.meetAt);
        if (!held && (L.meetAt === tk || L.meetAt === nextWD) && !L.meetConfirmedAt) push('MEET_CONFIRM', 'Meeting ' + (L.meetAt === tk ? 'today' : 'tomorrow') + ' not confirmed', 'lead', L, L.meetAt, 'S.C: message the client this morning and reconfirm the slot (ASMP N.B.D engine step 4)');
        if (!held && L.meetAt < tk) push('MEET_LOG', 'Meeting date passed — not logged', 'lead', L, L.meetAt, 'Was it held? Log the meeting or re-fix the date — a meeting not done is a negative MeCA');
      }
      if ((L.status === 'WON' || (L.stage === 8 && L.stageStatus === 'Completed')) && !L.handoverAt) push('HANDOVER', 'Not handed over to C.R.M', 'lead', L, L.stageDate || '', 'Introduce the C.R.M with the handover script — N.B.D never keeps the client (ASMP)');
    });
    rfq.forEach(r => {
      if (r.status === 'NEW_ENQUIRY' && r.createdAt && nowMs - r.createdAt > rfqTat) push('RFQ_TAT', 'Rates not sent (TAT over)', 'rfq', r, tsKey(r.createdAt + rfqTat), 'Send rates now — TAT ' + (cfg.rfqTatHrs || 24) + ' h');
      if (['SENT', 'FOLLOWUP', 'NEGOTIATION'].includes(r.status) && r.nextFollowupDate && r.nextFollowupDate <= tk) push('RFQ_FU', 'RFQ follow-up due', 'rfq', r, r.nextFollowupDate, 'Follow up and log the note');
      if (r.status === 'NEGOTIATION' && !(r.nego && r.nego.target)) push('NEGO_PREP', 'Negotiation without prep', 'rfq', r, '', 'Fill best / target / worst before the call (GTD p.668)');
    });
    eqc.forEach(e => {
      if (e.status === 'NEW' && e.createdAt && nowMs - e.createdAt > eqcTat) push('EQC_TAT', 'Enquiry not quoted (TAT over)', 'eqc', e, tsKey(e.createdAt + eqcTat), 'Quote now — every enquiry captured must be answered');
      if (!/WON|LOST|REGRET/.test(e.status) && e.nextDate && e.nextDate <= tk) push('EQC_FU', 'Enquiry follow-up due', 'eqc', e, e.nextDate, 'Follow up on the quote');
    });
    clients.forEach(c => {
      const owner = c.owner || 'unassigned';
      if ((c.star >= 4 || c.corridor) && !c.deckShownAt) push('DECK', 'Sales Deck not shown', 'client', c, '', 'Show the deck in person — top clients first', owner);
      if (c.corridor && (!c.otdReportAt || diffDays(c.otdReportAt, tk) >= otdDays)) push('OTD', 'Monthly OTD report due', 'client', c, c.otdReportAt || '', 'Send the OTD / performance report', owner);
      const refs = (c.refs || []).filter(r => r.name).length;
      if (c.star >= 4 && refs < 5 && (!c.refsAskedAt || diffDays(c.refsAskedAt, tk) >= refDays)) push('REFS', 'References ' + refs + '/5', 'client', c, c.refsAskedAt || '', 'Ask for the remaining ' + (5 - refs) + ' references', owner);
      if (c.lapsed && !c.sorryCallAt) push('SORRY', 'Sorry call pending', 'client', c, '', 'Sorry call — ask for a 13-minute meeting', owner);
      if ((c.star >= 4 || c.corridor) && (!c.lastVisit || diffDays(c.lastVisit, tk) >= 60)) push('VISIT', 'Top-client visit overdue', 'client', c, c.lastVisit || '', 'Visit — find the P.I.S, not the order', owner);
      // ASMP — Golden Circle work
      const gap = walletGap(c); const nbdDays = +cfg.nbdCrrDays || 60;
      if (gap > 0 && c.star >= 3 && !c.lapsed && (!c.nbdCrrAt || diffDays(c.nbdCrrAt, tk) >= nbdDays)) push('NBD_CRR', 'Wallet gap ' + fmtInr(gap) + '/mo — no upsell pitch', 'client', c, c.nbdCrrAt || '', 'N.B.D of C.R.R: fix a Zoom, pitch the lanes they give to others — the lowest-hanging fruit (ASMP)', owner);
      if (isBlackCircle(c) && !c.bccAction) push('BCC', 'Black Circle — no correction decided', 'client', c, '', 'B.C.C: re-price, ask for advance, or say no — decide, in batches of 3–5 (ASMP GC step 2)', owner);
    });
    q.sort((a, b) => (b.days - a.days) || (a.co > b.co ? 1 : -1));
    return q;
  }

  /* =====================================================================
     ASMP — Advanced Sales & Marketing Program (Rahul Jain, BCI)
     ===================================================================== */
  function fmtInr(n) { n = Math.round(+n || 0); if (Math.abs(n) >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr'; if (Math.abs(n) >= 1e5) return '₹' + (n / 1e5).toFixed(1) + ' L'; return '₹' + n.toLocaleString('en-IN'); }

  // ---------- C.R.R / N.B.D streams ----------
  // "First we have to divide Sales into CRR & NBD. CRR is the biggest killer of NBD." (ASMP Pillar 1)
  const STREAMS = {
    CRR: { label: 'C.R.R', long: 'Reorder from an existing client (order taking)', short: 'CRR' },
    NBD_IN: { label: 'N.B.D Incoming', long: 'A new client came to us — enquiry, website, portal, branch', short: 'NBD-In' },
    NBD_CRR: { label: 'N.B.D of C.R.R', long: 'New lane / plant / service from an existing or lapsed client (upsell, cross-sell, sorry call)', short: 'NBD-CRR' },
    NBD_OUT: { label: 'N.B.D Outgoing', long: 'We went out and found them — cold list, LinkedIn, reference, Dream 150', short: 'NBD-Out' },
  };
  function isExistingClient(co, clients) { co = (co || '').toLowerCase().trim(); if (!co) return null; return (clients || []).find(c => c.co && c.co.toLowerCase().trim() === co) || null; }
  function streamOf(rec, clients) {
    if (rec.stream && STREAMS[rec.stream]) return rec.stream;
    const cl = isExistingClient(rec.co, clients);
    if (cl) return rec.kind === 'reorder' ? 'CRR' : 'NBD_CRR';
    const s = ((rec.src || '') + ' ' + (rec.camp || '')).toLowerCase();
    if (/revival|lapsed|sorry|dead client/.test(s)) return 'NBD_CRR';
    if (/inbound|website|email|whatsapp|portal|bidding|branch|visit|walk/.test(s)) return 'NBD_IN';
    if (/outbound|cold|dream|belt|call list|linkedin|scrap|reference|referr|lusha|apollo/.test(s)) return 'NBD_OUT';
    if (rec.src === 'import') return 'NBD_OUT';
    return 'NBD_IN';
  }
  // Split wins / enquiries / revenue by stream for a range. Ratio = N.B.D share of wins (ASMP target 50:50).
  function streamSplit(data, range) {
    const clients = data.clients || [], leads = data.leads || [], activity = data.activity || [], rfq = data.rfq || [], eqc = data.eqc || [];
    const inR = k => k >= range.start && k <= range.end;
    const out = {}; Object.keys(STREAMS).forEach(k => out[k] = { enquiries: 0, won: 0, lost: 0, revenue: 0, meetings: 0 });
    eqc.forEach(e => { const st = streamOf(e, clients); const ck = e.createdAt ? tsKey(e.createdAt) : e.dt; if (ck && inR(ck)) out[st].enquiries++; if (e.closedAt && inR(tsKey(e.closedAt))) { if (e.status === 'WON') { out[st].won++; out[st].revenue += +e.value || 0; } else out[st].lost++; } });
    rfq.forEach(r => { if (!r.closedDate || !inR(r.closedDate)) return; const L = r.leadId ? leads.find(l => l.id === r.leadId) : null; const st = streamOf({ ...r, camp: L ? L.camp : '', src: L ? L.src : '' }, clients); if (r.status === 'WON') { out[st].won++; out[st].revenue += +r.value || 0; } else if (r.status === 'LOST') out[st].lost++; });
    const leadById = {}; leads.forEach(l => leadById[l.id] = l);
    activity.forEach(a => { const k = tsKey(a.t); if (!inR(k)) return; const L = leadById[a.id]; if (!L) return; const st = streamOf(L, clients); if (a.ch === 'OUTCOME' && /WON/.test(a.ty)) { out[st].won++; out[st].revenue += +L.value || 0; } if (a.ch === 'MEETING') out[st].meetings++; });
    const totWon = Object.values(out).reduce((a, s) => a + s.won, 0), totRev = Object.values(out).reduce((a, s) => a + s.revenue, 0);
    const nbdWon = totWon - out.CRR.won, nbdRev = totRev - out.CRR.revenue;
    return { byStream: out, totWon, totRev, nbdPctWon: totWon ? Math.round(nbdWon / totWon * 100) : 0, nbdPctRev: totRev ? Math.round(nbdRev / totRev * 100) : 0 };
  }

  // ---------- Sales funnel · 5-for-9 · I.P.L ----------
  // Funnel stages map onto the app's 8 funnel stages (tracked to signature):
  //   Leads → Contacted → Meeting → Proposal → Negotiation → Won.  (ASMP "Sales Funnel", 5 for 9)
  const FUNNEL = [
    { k: 'leads', label: 'Leads', test: () => true },
    { k: 'contact', label: 'Contacted', test: (L, x) => x.connected || (L.stage ?? 0) >= 1 },
    { k: 'meeting', label: 'Meeting', test: (L, x) => x.meeting || (L.stage ?? 0) >= 3 },
    { k: 'proposal', label: 'Proposal', test: (L, x) => x.proposal || (L.stage ?? 0) >= 5 },
    { k: 'nego', label: 'Negotiation', test: (L, x) => x.nego || (L.stage ?? 0) >= 6 },
    { k: 'won', label: 'Won', test: (L, x) => x.won || L.status === 'WON' || (L.stage === 8 && L.stageStatus === 'Completed') },
  ];
  const POST_HINT = {
    contact: 'P — the tele-pitch: 10 cold calls by the director to rebuild it; O — "not interested / satisfied with vendor"; S — WhatsApp drip before the first call (S.I.D.B.C); T — connected-call role play',
    meeting: 'P — the 7-minute ask in odd minutes; O — "send it on mail"; S — deck cover + one-page teaser; T — record 10 asks, listen back',
    proposal: 'P — need analysis template, S.C verification call same day; O — "just send the rates"; S — proposal delivered in person / Zoom, never only mail; T — discovery questions',
    nego: 'P — Science of Denial, no discount / no credit; O — "X is 8% cheaper"; S — negotiation prep sheet, OTD report; T — mock negotiations, director out of the room',
    won: 'P — trial lane close ("give us one lane for 60 days"); O — "we will try next season"; S — pilot offer, references list; T — closing role play',
  };
  function funnel(data, opts) {
    opts = opts || {}; const leads = (data.leads || []).filter(l => !/BAD DATA/.test(l.status || '') && (!opts.owner || ownerOf(l) === opts.owner));
    const activity = data.activity || [], rfq = data.rfq || [], clients = data.clients || [];
    const inR = k => !opts.range || (k >= opts.range.start && k <= opts.range.end);
    const ev = {}; const E = id => (ev[id] = ev[id] || { connected: false, meeting: false, proposal: false, nego: false, won: false, first: null, wonAt: null });
    activity.forEach(a => {
      const x = E(a.id); const k = tsKey(a.t); if (TOUCH.has(a.ch)) { if (!x.first || k < x.first) x.first = k; }
      if (a.ch === 'OUTCOME') { if (CONNECTED.has(a.ty)) x.connected = true; if (/Meeting/.test(a.ty)) x.meeting = true; if (/Rates shared/.test(a.ty)) x.proposal = true; if (/WON/.test(a.ty)) { x.won = true; x.wonAt = x.wonAt || k; } }
      if (a.ch === 'MEETING') x.meeting = true;
    });
    rfq.forEach(r => { if (!r.leadId) return; const x = E(r.leadId); if (r.sentAt || (r.status !== 'NEW_ENQUIRY')) x.proposal = true; if (r.status === 'NEGOTIATION' || r.status === 'WON' || r.status === 'LOST') x.nego = true; if (r.status === 'WON') { x.won = true; x.wonAt = x.wonAt || r.closedDate; } });
    const rows = leads.filter(L => { const x = ev[L.id]; return !opts.range || (x && x.first && inR(x.first)); });
    const counts = {}; FUNNEL.forEach(s => counts[s.k] = 0);
    const byStream = {}; Object.keys(STREAMS).forEach(k => byStream[k] = 0);
    const leadTimes = []; let wonValue = 0, wonN = 0;
    rows.forEach(L => {
      const x = ev[L.id] || E(L.id); let reached = true;
      FUNNEL.forEach(s => { if (reached && s.test(L, x)) counts[s.k]++; else reached = false; });
      if (x.won || L.status === 'WON') { if (x.first && x.wonAt) leadTimes.push(diffDays(x.first, x.wonAt)); if (+L.value) { wonValue += +L.value; wonN++; } }
      byStream[streamOf(L, clients)]++;
    });
    const steps = []; for (let i = 1; i < FUNNEL.length; i++) { const from = counts[FUNNEL[i - 1].k], to = counts[FUNNEL[i].k]; steps.push({ k: FUNNEL[i].k, from: FUNNEL[i - 1].label, to: FUNNEL[i].label, base: from, n: to, cr: from ? Math.round(to / from * 100) : 0, drop: from - to, post: POST_HINT[FUNNEL[i].k] }); }
    // I.P.L — bottleneck = the step where the most leads are lost (absolute), tie → lowest CR
    const ranked = steps.slice().sort((a, b) => (b.drop - a.drop) || (a.cr - b.cr));
    const bottleneck = ranked.find(s => s.base > 0) || null;
    const avgLeadTime = leadTimes.length ? Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length) : null;
    return { counts, steps, ranked, bottleneck, leads: rows.length, byStream, avgSale: wonN ? Math.round(wonValue / wonN) : 0, wonN, avgLeadTime, overallCr: counts.leads ? Math.round(counts.won / counts.leads * 1000) / 10 : 0 };
  }
  // Per-owner funnel vs team → re-training flags (ASMP "Sales Audit & Training": pull him out when the M.I.S drops at a stage of the funnel)
  function funnelByOwner(data, users, opts) {
    const team = funnel(data, opts); const out = {};
    (users || []).forEach(u => {
      const f = funnel(data, { ...(opts || {}), owner: u }); const flags = [];
      f.steps.forEach((s, i) => { const t = team.steps[i]; if (s.base >= 10 && t.base >= 10 && t.cr > 0 && s.cr < t.cr * 0.6) flags.push({ step: s.to, own: s.cr, team: t.cr }); });
      out[u] = { f, flags };
    });
    return { team, byUser: out };
  }

  // ---------- Negative MeCA — M.I.S level 2 / 3 ----------
  // 1) % meetings not done (+ ₹ value of meetings not done)  2) % conversion below benchmark
  // 3) % avg ₹ sale lost (+ ₹)  4) ₹ value of clients lost.  Benchmark = his own best of the previous 8 weeks, else team.
  function negMeca(data, cfg, w, now) {
    cfg = cfg || {}; const tk = todayKey(now); const leads = data.leads || [], activity = data.activity || [], eqc = data.eqc || [], rfq = data.rfq || [];
    const users = [...new Set([...(data.users || []), ...leads.map(l => l.assignedTo).filter(Boolean)])].filter(u => u && u !== 'suyashh');
    const cur = meca(data, { start: w.start, end: w.end });
    const hist = []; for (let i = 1; i <= 8; i++) { const pw = weekOf(addDays(w.start, -7 * i)); hist.push(meca(data, { start: pw.start, end: pw.end })); }
    const out = {};
    users.forEach(u => {
      const s = cur.byUser[u] || { meetings: 0, conversion: 0, avgTicket: 0, won: 0, leads: 0, connected: 0 };
      const planMeet = (cfg.meetPlan && +cfg.meetPlan[u]) || +cfg.meetingsPerWeek || 0;
      const scheduled = leads.filter(L => ownerOf(L) === u && L.meetAt && inWeek(L.meetAt, w) && L.meetAt < tk); // today's meeting is not "not done" until the day is over
      const missed = scheduled.filter(L => !activity.some(a => a.id === L.id && a.ch === 'MEETING' && tsKey(a.t) >= L.meetAt));
      // meetings explicitly marked "not held" this week stay on record as promises broken
      activity.forEach(a => { if (a.ch === 'MEET' && a.ty === 'Meeting not held' && a.by === u && inWeek(tsKey(a.t), w)) { const L = leads.find(l => l.id === a.id); missed.push(L || { id: a.id, co: a.co, value: 0 }); } });
      const planned = Math.max(planMeet, scheduled.length + (missed.length - scheduled.filter(L => missed.includes(L)).length));
      const pctMeet = planned ? -Math.round(Math.max(0, planned - s.meetings) / planned * 100) : 0;
      const rsMeet = missed.reduce((a, L) => a + (+L.value || 0), 0);
      const own = hist.map(h => h.byUser[u]).filter(x => x && (x.leads >= 3 || x.connected >= 10));
      const bmCr = own.length ? Math.max(...own.map(x => x.conversion)) : cur.team.conversion;
      const pctCr = bmCr ? -Math.round(Math.max(0, bmCr - s.conversion) / bmCr * 100) : 0;
      const ownAvg = hist.map(h => h.byUser[u]).filter(x => x && x.avgTicket); const bmAvg = ownAvg.length ? Math.max(...ownAvg.map(x => x.avgTicket)) : cur.team.avgTicket;
      const pctAvg = bmAvg && s.won ? -Math.round(Math.max(0, bmAvg - s.avgTicket) / bmAvg * 100) : 0;
      const rsAvg = bmAvg && s.won && s.avgTicket < bmAvg ? (bmAvg - s.avgTicket) * s.won : 0;
      let rsLost = 0;
      eqc.forEach(e => { if (ownerOf(e) === u && /LOST|REGRET/.test(e.status) && e.closedAt && inWeek(tsKey(e.closedAt), w)) rsLost += +e.value || 0; });
      rfq.forEach(r => { if (ownerOf(r) === u && r.status === 'LOST' && r.closedDate && inWeek(r.closedDate, w)) rsLost += +r.value || 0; });
      activity.forEach(a => { if (a.ch === 'OUTCOME' && /DEAD/.test(a.ty) && (a.by === u) && inWeek(tsKey(a.t), w)) { const L = leads.find(l => l.id === a.id); if (L) rsLost += +L.value || 0; } });
      const parts = [pctMeet, pctCr, pctAvg].filter((x, i) => i === 0 ? planned > 0 : true);
      out[u] = { meetings: s.meetings, planned, pctMeet, rsMeet, missed: missed.map(L => ({ id: L.id, co: L.co, meetAt: L.meetAt })), cr: s.conversion, bmCr, pctCr, avg: s.avgTicket, bmAvg, pctAvg, rsAvg, rsLost, score: parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : 0 };
    });
    return { week: w, byUser: out, team: cur.team };
  }

  // ---------- Golden Circle: Rocket Client · Black Circle · wallet share ----------
  const RC_FLAGS = [['pays', 'Pays on time'], ['gp', 'High G.P'], ['repeat', 'Repeat / loyal'], ['refs', 'Gives references'], ['noDisc', 'Does not ask for discounts'], ['growth', 'Room to grow'], ['fan', 'A fan — loves how we work'], ['fit', 'Fits our ideology']];
  const BC_FLAGS = [['bandwidth', 'Eats bandwidth'], ['payments', 'Payment trouble'], ['ops', 'Ops headaches'], ['gp', 'Low G.P'], ['volume', 'Low volume'], ['quoteOnly', 'Only asks for quotes'], ['legal', 'Legal / disputes'], ['notStrength', 'Not our strength']];
  const BCC_ACTIONS = { reprice: 'Re-price (+%)', advance: 'Ask for advance / cut credit', stop: 'Say no — stop', keep: 'Keep — corrected' };
  function rcAuto(c, rc) { rc = rc || {}; const f = { ...(c.rcFlags || {}) };
    if (c.payDays) f.pays = f.pays ?? (+c.payDays <= (+rc.payDays || 45)); if (c.gpPct) f.gp = f.gp ?? (+c.gpPct >= (+rc.gpPct || 12));
    const refs = (c.refs || []).filter(r => r.name).length; if (refs >= 2) f.refs = f.refs ?? true; if (c.corridor) f.repeat = f.repeat ?? true;
    return f; }
  function rcScore(c, rc) { const f = rcAuto(c, rc); const n = RC_FLAGS.filter(([k]) => f[k]).length; return { flags: f, n, isRC: c.rcOverride === 'Y' ? true : c.rcOverride === 'N' ? false : n >= (+((rc || {}).minFlags) || 5) }; }
  function isBlackCircle(c) { const b = c.bcFlags || {}; return Object.values(b).some(Boolean) || (c.star && c.star <= 2 && !c.starOverride && (c.payDays || c.monthlyRev)); }
  function walletGap(c) { const tot = +c.spendTotal || 0, ours = +c.monthlyRev || 0; return tot > ours ? tot - ours : 0; }
  function goldenCircle(data, cfg, range) {
    const rc = (cfg && cfg.rc) || {}; const clients = data.clients || [], leads = data.leads || [], activity = data.activity || [];
    const rated = clients.map(c => ({ c, r: rcScore(c, rc), bc: isBlackCircle(c), gap: walletGap(c), share: (+c.spendTotal ? Math.round((+c.monthlyRev || 0) / +c.spendTotal * 100) : null) }));
    const rcs = rated.filter(x => x.r.isRC), bcs = rated.filter(x => x.bc);
    const rev = rated.reduce((a, x) => a + (+x.c.monthlyRev || 0), 0), rcRev = rcs.reduce((a, x) => a + (+x.c.monthlyRev || 0), 0);
    const shares = rcs.map(x => x.share).filter(x => x !== null);
    const inR = k => !range || (k >= range.start && k <= range.end);
    const leadById = {}; leads.forEach(l => leadById[l.id] = l);
    let ratedLeads = 0, outLeads = 0, meetIn = 0, meetOut = 0; const touched = new Set();
    activity.forEach(a => { if (!inR(tsKey(a.t))) return; const L = leadById[a.id]; if (!L) return; if (TOUCH.has(a.ch)) touched.add(L.id); if (a.ch === 'MEETING') { if (L.rcFit === 'N') meetOut++; else if (L.rcFit === 'Y') meetIn++; } });
    touched.forEach(id => { const L = leadById[id]; if (L.rcFit === 'Y') ratedLeads++; else if (L.rcFit === 'N') { ratedLeads++; outLeads++; } });
    return {
      rated, rcs, bcs, nbdCrr: rated.filter(x => x.gap > 0 && !x.c.lapsed).sort((a, b) => b.gap - a.gap),
      metrics: {
        pctRC: clients.length ? Math.round(rcs.length / clients.length * 100) : 0, pctRevRC: rev ? Math.round(rcRev / rev * 100) : 0,
        avgShareRC: shares.length ? Math.round(shares.reduce((a, b) => a + b, 0) / shares.length) : null,
        gapTotal: rated.reduce((a, x) => a + x.gap, 0), bcCount: bcs.length, bcRev: bcs.reduce((a, x) => a + (+x.c.monthlyRev || 0), 0),
        pctLeadsOutRC: ratedLeads ? Math.round(outLeads / ratedLeads * 100) : null, ratedLeads, unratedLeads: touched.size - ratedLeads,
        pctMeetOutRC: (meetIn + meetOut) ? Math.round(meetOut / (meetIn + meetOut) * 100) : null,
      },
    };
  }
  // Suggest R.C fit for a lead from the profile keywords (never applied automatically — the caller taps Y / N)
  function rcSuggest(L, rc) { const kw = ((rc || {}).sectors || '').split(/[,\n]/).map(s => s.trim().toLowerCase()).filter(Boolean); if (!kw.length) return null; const hay = ((L.co || '') + ' ' + (L.camp || '') + ' ' + (L.remarks || '') + ' ' + (L.hist || '') + ' ' + (L.desig || '')).toLowerCase(); return kw.some(k => hay.includes(k)) ? 'Y' : null; }

  // ---------- Lead-gen order (ASMP: cheapest first; fresh lead gen is the LAST alternative) ----------
  const LEADGEN = [
    ['sorry', '1 · Sorry calls', 'Lapsed clients — "How many?"'], ['nbdcrr', '2 · N.B.D of C.R.R', 'Upsell / cross-sell — 6–12 months of work'], ['lost', '3 · Lost prospects', 'Everyone we ever pitched'],
    ['ref', '4 · Reference engine', '5 names per 5★ client'], ['eqc', '5 · Enquiry capture', 'Alone +30% leads'], ['dream', '6 · Dream 150', 'The 300–400% lever for B2B'], ['cold', '7 · Fresh data', 'Scraped / bought lists, LinkedIn — last resort'],
  ];
  function leadGenMix(data, range) {
    const leads = data.leads || [], activity = data.activity || [], eqc = data.eqc || [], clients = data.clients || [];
    const inR = k => k >= range.start && k <= range.end; const out = {}; LEADGEN.forEach(([k]) => out[k] = { n: 0, won: 0 });
    const bucketOf = L => { const s = ((L.camp || '') + ' ' + (L.src || '')).toLowerCase(); if (/revival|lapsed|sorry|dead client/.test(s)) return 'lost'; if (/reference|referr/.test(s)) return 'ref'; if (/dream/.test(s)) return 'dream'; if (/website|inquiry|inbound/.test(s)) return 'eqc'; if (isExistingClient(L.co, clients)) return 'nbdcrr'; return 'cold'; };
    const seen = new Set(); const leadById = {}; leads.forEach(l => leadById[l.id] = l);
    activity.forEach(a => { const k = tsKey(a.t); if (!inR(k)) return; if (a.ch === 'SORRY') out.sorry.n++; const L = leadById[a.id]; if (!L || seen.has(L.id) || !TOUCH.has(a.ch)) return; seen.add(L.id); const b = bucketOf(L); out[b].n++; if (L.status === 'WON') out[b].won++; });
    eqc.forEach(e => { const ck = e.createdAt ? tsKey(e.createdAt) : e.dt; if (!ck || !inR(ck)) return; const st = streamOf(e, clients); const b = st === 'NBD_CRR' ? 'nbdcrr' : st === 'NBD_IN' ? 'eqc' : 'cold'; out[b].n++; if (e.status === 'WON') out[b].won++; });
    return { buckets: LEADGEN.map(([k, label, hint]) => ({ k, label, hint, ...out[k] })), total: Object.values(out).reduce((a, x) => a + x.n, 0) };
  }

  // ---------- Profit planning · gap analysis → how many leads do we need? (ASMP SING to 4X) ----------
  // Step 1 double (or 4×) the N.P · Step 2 F.C +10% · Step 3 new G.P = N.P + new F.C · Step 4 new revenue = new G.P ÷ G.P%
  function gapAnalysis(p, plan, fn) {
    const rev = +p.revenue || 0, vc = +p.varCost || 0, fc = +p.fixedCost || 0, x = +p.targetX || 2, fcUp = p.fcUpPct !== undefined ? +p.fcUpPct : 10;
    const gp = rev - vc, gpPct = rev ? gp / rev : 0, np = gp - fc;
    const tNp = np * x, nFc = fc * (1 + fcUp / 100), nGp = tNp + nFc, nRev = gpPct ? nGp / gpPct : 0;
    const avg = +(plan || {}).avg || 0, txn = +(plan || {}).txn || 1, cr = +(plan || {}).cr || 0;
    // The GAP — new business to add on top of what C.R.R already delivers — is what the 5 parameters must produce
    const gapRev = Math.max(0, nRev - rev); const monthlyRev = gapRev / 12;
    const clientsPerMonth = avg && txn ? (gapRev / (avg * txn)) / 12 : 0; // a client is worth avg ₹ × transactions per year; spread the year's new clients over 12 months
    const leadsPerMonth = cr ? clientsPerMonth / (cr / 100) : 0;
    const l2m = fn && fn.steps && fn.steps[1] && fn.steps[1].base >= 10 ? fn.steps[1].cr / 100 * (fn.steps[0].cr / 100) : 0; // lead → meeting via contacted
    const meetingsPerMonth = l2m ? leadsPerMonth * l2m : 0;
    return { rev, vc, fc, gp, gpPct: Math.round(gpPct * 1000) / 10, np, x, tNp, nFc, nGp, nRev, gapRev, growthPct: rev ? Math.round((nRev / rev - 1) * 100) : 0, monthlyRev, clientsPerMonth: Math.round(clientsPerMonth * 10) / 10, leadsPerMonth: Math.round(leadsPerMonth), leadsPerWeek: Math.round(leadsPerMonth / 4.33), meetingsPerMonth: Math.round(meetingsPerMonth), meetingsPerWeek: Math.round(meetingsPerMonth / 4.33) };
  }

  return { istDate, key, todayKey, tsKey, addDays, dow, nextWorkDay, diffDays, weekOf, weeksBack, workingDaysElapsed, fmtRange, ownerOf, CONNECTED, OUTCOME_D, misWeek, meca, fiveParams, compound, rateClients, pcQueue,
    STREAMS, streamOf, isExistingClient, streamSplit, FUNNEL, funnel, funnelByOwner, negMeca, RC_FLAGS, BC_FLAGS, BCC_ACTIONS, rcScore, rcAuto, isBlackCircle, walletGap, goldenCircle, rcSuggest, LEADGEN, leadGenMix, gapAnalysis, fmtInr };
});
