/* =====================================================================
   BMP Sales — Rahul Jain's sales sciences inside BRL Command Center.
   Loaded before the main app script; uses the app's globals at call time
   (DB, LIVE_LEADS, CURRENT_USER, IS_ADMIN, esc, toast, saveDB, logAct,
   openDrawer, openRfqDrawer, render, todayKey, nextWorkDay, fmtD, $).

   Tabs:  Scoreboard (MeCA + C.R.R/N.B.D + negative MeCA)  ·  Negative M.I.S + E.M  ·  P.C Queue
          Funnel · 5-for-9 · I.P.L (ASMP)  ·  Enquiry Capture (EQC)  ·  Clients ★ / References / Sorry calls
          Golden Circle — R.C · Black Circle · wallet share (ASMP)  ·  Deck · Playbook · Objections · Sales tools
          Plan · 4X (5-for-5 + gap analysis)  ·  Setup
   Storage keys: brl-eqc, brl-clients, brl-bmp (config), brl-mis (E.M)
   Page refs = The BMP Notebook (W = week, p = original notebook page).
   ===================================================================== */
(function () {
  'use strict';
  const C = window.BMPCore;
  const FY = 'FY27';

  /* ---------------- defaults ---------------- */
  const DEFAULT_DECK = {
    title: 'How Best Roadways guarantees on-time placement to every client',
    pages: [
      { p: 'Vehicles do not report on time; your dispatch slips and the plant waits.', i: 'Missed dispatch windows, penalty and debit notes, overtime at the plant, calls to three transporters at once.', s: 'Placement F.M.S — every indent gets a promised slot, a vehicle, a driver and a live Planned / Actual sheet audited daily by a Process Co-ordinator.', sys: 'Indent-to-POD F.M.S (live Google Sheet)', link: '' },
      { p: 'You do not know where the truck is until the consignee calls.', i: 'Receiving teams idle, unloading windows lost, customers escalate to your management.', s: 'Live tracking on owned (Fleetx + GTropy) and market vehicles (RoaDo) with Riya, our voice agent — call, speak the LR number, hear the live status 24×7.', sys: 'Riya voice agent · Control Tower', link: '' },
      { p: 'Transit damage and claims drag on for months.', i: 'Written-off stock, disputed debit notes, relationship damage between your plant and your customer.', s: 'Loading checklist with GPS- and time-stamped photos of every consignment and the driver, before the CN is issued.', sys: 'Loading Supervisor app · loading C.L', link: '' },
      { p: 'PODs and bills arrive late and wrong; payments stall.', i: 'Your finance team chases paper, your vendor account ages, month-end closes late.', s: 'POD-to-invoice F.M.S — POD scanned at unloading, invoice within 48 hours, one statement a month with every LR reconciled.', sys: 'D2C F.M.S · POD cell', link: '' },
      { p: 'You cannot compare transporters on anything except rate.', i: 'The cheapest bidder wins the tender and fails in peak season; the cost shows up as failed placements, not on the invoice.', s: 'A monthly on-time report per client — placements on slot %, deliveries on time %, damage incidents, POD turnaround — sent whether it is good or bad.', sys: 'Client OTD report (monthly)', link: '' },
    ],
    authority: ['40 years, family-owned, asset-heavy: 810 owned vehicles across 37 configurations, 183 on CNG', '63 branches pan-India; 7.5 lakh sq ft bonded warehouse at Nhava Sheva / JNPT', 'Trusted by Dow, BASF, Lanxess, Evonik, Syngenta, Sudarshan, Waaree, Polycab, Asian Paints PPG', 'ISO 9001, IBA approved, EcoVadis rated, TfS, C-TPAT'],
    trust: ['Weekly OTD report to every corridor client — misses included', 'Live Google Sheet access to your own placement F.M.S', 'Single point of accountability from indent to POD', 'Pick one lane. Give us one lane. We will prove it.'],
  };
  const DEFAULT_SCRIPTS = {
    sorry: 'Sir, this is {me} from Best Roadways. I am calling to say sorry — we used to move your freight and somewhere we stopped being in touch. That is on us. I am not calling for an order. Can I get 13 minutes with you this week to show you how we now guarantee placement to every client? Just 13 minutes.',
    reference: 'Sir, you have seen how we work for the last few months. I am not asking you to tell anyone to buy from us. I am asking for five names — plant or logistics heads you respect — and permission to say you suggested we meet. If they like what they see, only then will they buy. If not, nothing lost for them or for you. Who are the first two that come to mind?',
    ask7: 'Dear {name}, {me} here from Best Roadways. Could I take 7 minutes of your time this week — in person or on Zoom — to show you how we ensure on-time placement and delivery for all our clients? Not a sales pitch: five pages, then you decide. Which day suits you?',
    discovery: '"Right sir, just before we start — so I can serve you best — can I take 3 minutes to ask you 4–5 questions?"\n1. On your busiest lane, how many placements failed last month?\n2. What did each failed placement cost you — penalty, overtime, escalation?\n3. When a truck is late, how do you find out today?\n4. How long does a POD take to reach your accounts team?\n5. If one transporter could guarantee the slot, what would that be worth to you?\nThen: pitch the Problem → Impact → Solution. Price last.',
    denial: 'Sir, we do not give discounts and we do not extend credit beyond terms — that is exactly why our vehicles report on time. A transporter who gives 10% off gives it back to you as a failed placement in peak season. What I can offer is the corridor: guaranteed slot, published transit time, a monthly report in your inbox. Let us run one lane for 60 days and let the report decide.',
    nego: 'Before any rate meeting (GTD p.667–669):\n1. Objective and fallback position\n2. Our priorities vs theirs — Price · Volume · Payment terms · Detention / claims terms\n3. Limits per issue: BEST · TARGET · WORST\n4. Cost of every concession, in ₹\n5. BATNA — what we do if there is no deal\nThe director is never in the room (W35 p.495).',
    feb: 'F.E.B — in every sale target the FASTEST sale (lane where we already have return loads), the EASIEST sale (referred by a 5★ client), the BIGGEST margin sale (corridor premium lane). Tag each lead in its cockpit. (W17 p.290)',
    pitchRules: 'Show, don\'t tell (W21 p.345) · Sell the loss, gain does not sell (W26 p.415) · Every customer has a hot button — Stab & Twist (W38 p.600) · Buying decisions are made in 15–20 seconds, then validated with data · Question is the Answer · Ask for meetings in odd minutes: 7 / 11 / 13 (W0 p.4) · Record your pitch with every customer.',
    // ---- ASMP scripts ----
    qualify: 'Tele-caller — qualify, DO NOT SELL (ASMP N.B.D Incoming):\n"Good morning sir, {me} from Best Roadways. You had enquired about {lane}. Just three quick questions so the right person calls you back:\n1. Which plant / origin and which destinations, roughly how many vehicles a month?\n2. Is this for a running requirement or a one-time movement?\n3. Who signs off on the transporter — yourself, or logistics / purchase?\nThank you sir. Our senior placement expert will call you within the hour with a proper plan — not a rate list."\nThen hand to the S.C to line up the Zoom. Make the salesperson sound senior and expert before the call.',
    verify: 'S.C verification call — same day as the meeting (ASMP N.B.D engine step 7):\n"Sir, good afternoon, this is {me} again from Best Roadways. {rep} met you today regarding your {lane} requirement. As per his report you are looking for {need}. Is there anything I have missed or anything else I can help you with?\nRight sir — allow us to prepare the proposal and get it to you by {day}. If you need anything before that, you can call me directly; I am sending you my number on WhatsApp now."',
    handover: 'N.B.D → C.R.R handover, after the first 2–3 loads (ASMP):\n"Sir, from today {crm}, who is the specialist for exactly your kind of movements, will handle your account day to day — indents, placements, PODs, bills. She already knows your lanes. In any case you have my number; if anything ever needs escalating, call me."\nNever leave the client with the salesperson — N.B.D goes out to find the next client.',
    interview: 'Client interview — call 20–30 existing clients and ask for mentoring (ASMP "OBSERVE"):\n1. Why did you start with Best Roadways?\n2. Why do you continue with us?\n3. What would make you leave?\n4. What should we do more of? Less of?\n5. What do you really want from a transporter — what is your desire? (then 5-Why it)\nWrite the top-3 answers to each. That is the pitch, the deck and the objection list — in the client\'s words.',
  };
  const DEFAULT_OBJECTIONS = [
    { o: 'Your rate is higher than what we are paying', a: 'Sir, which is why your vehicles report on time. A rate 8% lower comes back as one failed placement in peak season — that one miss costs more than the whole year\'s difference. Let the monthly OTD report decide: give us one lane for 60 days at our rate.' },
    { o: 'We are satisfied with our existing transporter', a: 'That is good to hear, sir — most of our best clients said the same. I am not asking you to change. I am asking for 7 minutes to show how we report placement and delivery every month. Keep it as a benchmark for your current vendor. If it is not useful, nothing lost.' },
    { o: 'We need 60–90 days credit', a: 'Sir, we run on 30 days because our drivers and diesel are paid on the day. Vendors who extend 90 days are borrowing against your loads — that shows up as a truck that does not turn up. What I can give you instead is reserved capacity and a published transit time on your lane.' },
    { o: 'Just send the rates on mail', a: 'Of course — and I will. But rates on mail get compared only on rate. Allow me 7 minutes on Zoom so you see what is behind the number: the placement sheet, the tracking, the POD cycle. Then the mail will make sense. Which day, sir?' },
    { o: 'We do everything through the bidding portal', a: 'We bid there too, sir. The portal picks the lowest number; it cannot see who actually placed the vehicle. Keep bidding — and let us be the one vendor whose OTD report you have in your inbox every month when the L1 fails.' },
    { o: 'You are too big for a small shipper like us', a: 'Sir, 63 branches means a vehicle near your plant, not a big-company attitude. Small regular lanes are exactly what our owned fleet is built for — that is where return loads live. Give me the lane and the monthly volume and I will show you the exact vehicles.' },
    { o: 'We had a bad experience with Best Roadways earlier', a: '(Sorry call) Sir, that is on us and I am not calling to argue. I am calling to say sorry — and to ask for 13 minutes to show what has changed: the placement F.M.S, live tracking, the POD cell. Judge us on one lane, not on the past.' },
    { o: 'Call back after the tender / next season', a: 'Sure, sir. Can I ask one thing so the next call is worth your time — on your busiest lane, how many placements failed last season? (Stab & Twist.) Let me send you our OTD format in the meantime so you can hold every vendor to it.' },
  ];
  // RJ's Marketing Engine — the 12 collaterals (ASMP), with the Sales Deck above them: "always your most powerful tool"
  const DEFAULT_TOOLS = [['deck', 'Sales Deck (P·I·S·A·T) — printed, bound'], ['eduVideos', '1 · Educational videos — how placement / tracking / POD works (be the expert before the first call)'], ['salesVideo', '2 · Sales video for the client (3–5 min, one per funnel stage eventually)'], ['objVideos', '3 · Objection-handling videos'], ['competition', '4 · List of competition using us + results they got — "this is a killer"'], ['references', '5 · List of references for him to relate to, by industry'], ['drip', '6 · All other videos for drip marketing + WhatsApp bot (S.I.D.B.C — sale done before first call)'], ['testimonials', '7 · Testimonials, written & video, industry-wise (leaders, direct competitors)'], ['brochure', '8 · Brochure — Part 1 company · Part 2 how we solve his problem'], ['salesKit', '9 · Sales Kit — flowcharts, checklists, MIS screenshots, large visuals'], ['demoKit', '10 · Demonstration Kit — for BRL: live Riya call, live tracking screen, sample OTD report'], ['productVideos', '11 · Product videos — CNG fleet, corridor lane, bonded warehouse, loading checklist'], ['corpVideo', '12 · Corporate video']];
  const DEFAULT_CFG = {
    connPerDay: 10, rfqTatHrs: 24, eqcTatHrs: 24, hotIdleDays: 3, greenAt: -10, otdReportDays: 30, refAskDays: 30,
    weights: { pay: 60, vol: 30, gp: 10 }, corridorPremiumPct: 7, salesDays: 'Tue · Thu',
    plan: { year: FY, leads: 0, cr: 0, avg: 0, txn: 0, marginPct: 0, strategies: { leads: '', cr: '', avg: '', txn: '', margin: '' }, focus: 'cr', focusFrom: '' },
    deck: DEFAULT_DECK, scripts: DEFAULT_SCRIPTS,
    // ---- ASMP ----
    meetingsPerWeek: 5, meetPlan: {}, nbdCrrDays: 60,
    rc: { payDays: 45, gpPct: 12, minFlags: 5, sectors: 'specialty chemicals, fluoro, agrochem, pharma, API, CDMO, auto component, cables, wires, paints, polymers, tyres', persona: 'Plant logistics head at a ₹500 Cr+ manufacturer with 3+ regular FTL lanes, penalised for missed dispatches, measured on OTIF, tired of L1 vendors failing in season. Wants one transporter who reports, not one who negotiates.', focus: 'RC' },
    profit: { revenue: 0, varCost: 0, fixedCost: 0, targetX: 2, fcUpPct: 10 },
    objections: DEFAULT_OBJECTIONS, tools: {},
  };
  const STREAM_COLOR = { CRR: '#6B8CAE', NBD_IN: '#0F766E', NBD_CRR: '#C48A2E', NBD_OUT: '#C43D2E' };
  const EQC_STATUS = { NEW: ['New', '#6B8CAE'], QUOTED: ['Quoted', '#8A6BAE'], FOLLOWUP: ['Follow-up', '#C48A2E'], WON: ['Won', '#2E8B57'], LOST: ['Lost', '#C43D2E'], REGRET: ['Regret / no quote', '#8A8A8A'] };
  const EQC_SRC = ['Inbound call', 'Email', 'WhatsApp', 'Website', 'Bidding portal', 'Branch', 'Reference', 'Outbound call', 'Visit'];
  const VEH = ['32ft SXL', '32ft MXL', '24ft', '22ft', '20ft', '19ft', '17ft', 'Trailer 40ft', 'Trailer 20ft', 'Tanker', 'Container', 'Other'];
  const PC_LABEL = { OVERDUE: 'Overdue follow-up', NO_ATTEMPT: 'Never dialled', HOT_IDLE: 'Hot lead idle', NO_LOAD: 'Signed, no load', REFS: 'References', RFQ_TAT: 'RFQ TAT', RFQ_FU: 'RFQ follow-up', NEGO_PREP: 'Negotiation prep', EQC_TAT: 'Enquiry TAT', EQC_FU: 'Enquiry follow-up', DECK: 'Deck not shown', OTD: 'OTD report', SORRY: 'Sorry call', VISIT: 'Top-client visit', MEET_CONFIRM: 'Meeting to confirm', MEET_LOG: 'Meeting not logged', HANDOVER: 'C.R.M handover', NBD_CRR: 'N.B.D of C.R.R', BCC: 'Black Circle' };

  /* ---------------- state ---------------- */
  window.BMP = { eqc: [], clients: [], cfg: JSON.parse(JSON.stringify(DEFAULT_CFG)), mis: { commit: {}, snap: {} }, loaded: false };
  const V = { tab: 'score', range: 'week', wk: 0, user: '', pcType: '', pcOwner: '', eqcSt: '', eqcForm: false, eqcQ: '', clQ: '', clStar: '', misWk: 0, deckLead: null, fnOwner: '', fnRange: 'all', gcTab: 'rc', deckTab: 'deck' };
  window.BMPV = V;

  /* ---------------- storage ---------------- */
  function deepMerge(base, over) { if (!over || typeof over !== 'object') return base; const out = Array.isArray(base) ? over : { ...base }; if (!Array.isArray(base)) Object.keys(over).forEach(k => { out[k] = (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) ? deepMerge(base[k], over[k]) : over[k]; }); return out; }
  window.bmpLoad = async function () {
    const get = async k => { try { const r = await window.storage.get(k); return JSON.parse(r.value); } catch (e) { return null; } };
    BMP.eqc = (await get('brl-eqc')) || [];
    BMP.clients = (await get('brl-clients')) || [];
    const cfg = await get('brl-bmp'); BMP.cfg = deepMerge(JSON.parse(JSON.stringify(DEFAULT_CFG)), cfg || {});
    if (!BMP.cfg.deck || !BMP.cfg.deck.pages || !BMP.cfg.deck.pages.length) BMP.cfg.deck = JSON.parse(JSON.stringify(DEFAULT_DECK));
    const mis = await get('brl-mis'); BMP.mis = { commit: {}, snap: {}, ...(mis || {}) };
    BMP.loaded = true;
  };
  async function bmpSave(what) {
    if (typeof storageOK !== 'undefined' && !storageOK) return;
    if (DB.settings.demoMode) return; // never write BMP data from demo mode
    try {
      if (what === 'eqc') await window.storage.set('brl-eqc', JSON.stringify(BMP.eqc));
      if (what === 'clients') await window.storage.set('brl-clients', JSON.stringify(BMP.clients));
      if (what === 'cfg') await window.storage.set('brl-bmp', JSON.stringify(BMP.cfg));
      if (what === 'mis') await window.storage.set('brl-mis', JSON.stringify(BMP.mis));
    } catch (e) { toast('⚠ Save failed — ' + (e.message || e)); }
  }
  window.bmpSave = bmpSave;

  /* ---------------- helpers ---------------- */
  const inr = n => { n = Math.round(+n || 0); if (Math.abs(n) >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr'; if (Math.abs(n) >= 1e5) return '₹' + (n / 1e5).toFixed(1) + ' L'; return '₹' + n.toLocaleString('en-IN'); };
  const pct = n => (n > 0 ? '+' : '') + n + '%';
  const scoreCls = s => (s >= (BMP.cfg.greenAt ?? -10) ? 'bmp-green' : 'bmp-red');
  const me = () => CURRENT_USER || 'suyashh';
  const meName = () => ({ suyashh: 'Suyashh', jagruti: 'Jagruti' }[me()] || me());
  const users = () => { const set = new Set(); if (IS_ADMIN) { (callerUsernames() || []).forEach(u => set.add(u)); DB.leads.forEach(l => { if (l.assignedTo) set.add(l.assignedTo); }); DB.activity.forEach(a => { if (a.by) set.add(a.by); }); } else set.add(me()); return [...set].filter(Boolean).sort(); };
  const data = () => ({ leads: DB.leads, activity: DB.activity, rfq: DB.rfq, eqc: BMP.eqc, clients: C.rateClients(BMP.clients, BMP.cfg.weights), users: users() });
  const fill = s => String(s || '').replace(/\{me\}/g, meName()).replace(/\{name\}/g, '{name}');
  const stPill = (k, on, fn) => '<span class="pill ' + (on ? 'on' : '') + '" onclick="' + fn + '">' + k + '</span>';
  const openRef = it => it.kind === 'lead' ? 'openDrawer(' + it.id + ')' : it.kind === 'rfq' ? 'openRfqDrawer(' + it.id + ')' : it.kind === 'eqc' ? 'bmpEqcDrawer(' + it.id + ')' : 'bmpClientDrawer(' + it.id + ')';
  function rangeFor() {
    const tk = C.todayKey(); const w = C.weekOf(tk);
    if (V.range === 'week') return { start: w.start, end: w.end, label: 'This week · ' + w.label };
    if (V.range === 'lastweek') { const p = C.weekOf(C.addDays(w.start, -7)); return { start: p.start, end: p.end, label: 'Last week · ' + p.label }; }
    const d = new Date(tk + 'T00:00:00');
    if (V.range === 'month') { const s = tk.slice(0, 8) + '01'; return { start: s, end: tk, label: 'This month' }; }
    if (V.range === 'lastmonth') { const f = new Date(d.getFullYear(), d.getMonth() - 1, 1), l = new Date(d.getFullYear(), d.getMonth(), 0); return { start: C.key(f), end: C.key(l), label: 'Last month' }; }
    if (V.range === 'quarter') { const s = new Date(d); s.setDate(s.getDate() - 90); return { start: C.key(s), end: tk, label: 'Last 90 days' }; }
    return { start: '2000-01-01', end: tk, label: 'All time' };
  }
  function injectCss() {
    if (document.getElementById('bmpcss')) return;
    const st = document.createElement('style'); st.id = 'bmpcss';
    st.textContent = `
.bmp-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 14px}
.bmp-tabs button{border:1px solid var(--line);background:#fff;color:var(--navy);border-radius:20px;padding:6px 12px;font-weight:600;font-size:12px}
.bmp-tabs button.on{background:var(--navy);color:#fff;border-color:var(--navy)}
.bmp-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:10px 0 14px}
.bmp-kpi{background:#fff;border:1px solid var(--line);border-radius:9px;padding:10px 12px;border-top:3px solid var(--navy)}
.bmp-kpi b{font-family:'Inter';font-size:26px;font-weight:900;letter-spacing:-.03em;display:block;line-height:1.05}
.bmp-kpi span{font-size:10px;letter-spacing:.5px;text-transform:uppercase;color:var(--slate)}
.bmp-kpi small{display:block;font-size:10.5px;color:var(--slate);margin-top:3px}
.bmp-kpi.teal{border-top-color:#0F766E}.bmp-kpi.amber{border-top-color:#C48A2E}.bmp-kpi.red{border-top-color:var(--red)}
.bmp-score{font-family:'Inter';font-size:34px;font-weight:900;letter-spacing:-.03em;line-height:1}
.bmp-green{color:#1E7A4C}.bmp-red{color:var(--red)}
.bmp-chip{display:inline-block;font-size:10.5px;padding:2px 7px;border-radius:3px;margin:2px 3px 2px 0;border:1px solid var(--line);background:#fff}
.bmp-chip.g{background:var(--won);border-color:#BFE3CF}.bmp-chip.r{background:var(--bad);border-color:#F2BDB8}
.bmp-rule{background:#FBEFF0;border-left:4px solid var(--navy);border-radius:6px;padding:10px 12px;font-size:12.5px;margin:10px 0}
.bmp-rule b{color:var(--navy)}
.bmp-ref{font-size:10.5px;color:var(--slate);font-style:italic}
.bmp-bars{display:flex;gap:3px;align-items:flex-end;height:34px}
.bmp-bars i{display:block;width:12px;background:var(--red);border-radius:2px 2px 0 0;opacity:.85}
.bmp-bars i.g{background:#1E7A4C}
.bmp-star{color:#C48A2E;letter-spacing:1px;font-size:13px}
.bmp-script{white-space:pre-wrap;font-size:12.5px;line-height:1.5;background:var(--paper);border:1px solid var(--line);border-radius:7px;padding:10px 12px}
.bmp-deckpage{border:1px solid var(--line);border-radius:9px;padding:12px;margin-bottom:10px;background:#fff}
.bmp-deckpage .k{font-family:'Inter';font-weight:800;letter-spacing:.22em;text-transform:uppercase;font-size:12px;color:var(--navy)}
.bmp-deckpage textarea{width:100%;font-size:12.5px;margin:2px 0 8px}
.bmp-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.bmp-tbl td{font-size:12.5px}
.bmp-num{text-align:right;font-variant-numeric:tabular-nums}
.bmp-inline input,.bmp-inline select{padding:4px 6px;font-size:12px}
.bmp-em{border:1.5px solid var(--navy);border-radius:9px;padding:12px;background:#fff}
.bmp-tag{display:inline-block;border:1px solid var(--line);border-radius:3px;padding:1px 6px;font-size:10.5px;font-weight:700;margin-right:3px;cursor:pointer;color:var(--slate)}
.bmp-tag.on{background:var(--navy);color:#fff;border-color:var(--navy)}
.bmp-funnel{display:flex;gap:6px;align-items:flex-end;margin:12px 0 6px}
.bmp-funnel .st{flex:1;text-align:center;min-width:0}
.bmp-funnel .bar{background:var(--navy);margin:0 auto 6px;border-radius:2px 2px 0 0;min-height:4px;opacity:.9}
.bmp-funnel .bar.bn{background:var(--red)}
.bmp-funnel b{font-family:'Inter';font-weight:900;font-size:22px;display:block;letter-spacing:-.02em}
.bmp-funnel small{font-size:10.5px;letter-spacing:.5px;text-transform:uppercase;color:var(--slate)}
.bmp-funnel .cr{font-size:11px;color:var(--slate);align-self:center;padding-bottom:26px;white-space:nowrap}
.bmp-funnel .cr.bn{color:var(--red);font-weight:800}
.bmp-stream{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:2px 6px;border-radius:3px;color:#fff}
.bmp-flag{display:inline-block;border:1px solid var(--line);border-radius:3px;padding:2px 7px;font-size:11px;margin:2px 3px 2px 0;cursor:pointer;background:#fff}
.bmp-flag.on{background:#1E7A4C;color:#fff;border-color:#1E7A4C}.bmp-flag.bc.on{background:var(--red);border-color:var(--red)}
.bmp-obj{border:1px solid var(--line);border-radius:7px;padding:8px 10px;margin-bottom:6px;background:#fff}
.bmp-obj .o{font-weight:800;font-size:12.5px}.bmp-obj .a{font-size:12px;color:var(--ink);margin-top:3px;white-space:pre-wrap}
.bmp-meter{height:8px;background:var(--line);border-radius:4px;overflow:hidden}.bmp-meter i{display:block;height:100%;background:#1E7A4C}
@media(max-width:880px){.bmp-grid3{grid-template-columns:1fr}.bmp-funnel b{font-size:16px}}
`;
    document.head.appendChild(st);
  }

  /* ================= MAIN VIEW ================= */
  const TABS = [['score', '📈 Scoreboard · MeCA'], ['mis', '🧮 Negative M.I.S · E.M'], ['pc', '🕵️ P.C Queue'], ['funnel', '🔻 Funnel · 5-for-9'], ['eqc', '📥 Enquiry Capture'], ['clients', '⭐ Clients · Corridor'], ['gc', '🚀 Golden Circle'], ['deck', '📕 Deck · Playbook'], ['plan', '🎯 Plan · 4X'], ['setup', '⚙️ Setup']];
  window.vBMP = function () {
    injectCss();
    const tabs = TABS.filter(([k]) => k !== 'setup' || IS_ADMIN);
    return '<div class="bmp-tabs">' + tabs.map(([k, l]) => '<button class="' + (V.tab === k ? 'on' : '') + '" onclick="BMPV.tab=\'' + k + '\';render()">' + l + '</button>').join('') + '</div>' +
      (V.tab === 'score' ? vScore() : V.tab === 'mis' ? vMis() : V.tab === 'pc' ? vPC() : V.tab === 'funnel' ? vFunnel() : V.tab === 'eqc' ? vEqc() : V.tab === 'clients' ? vClients() : V.tab === 'gc' ? vGC() : V.tab === 'deck' ? vDeck() : V.tab === 'plan' ? vPlan() : vSetup());
  };
  window.bmpBadge = function () { try { const q = C.pcQueue(data(), pcCfg()); return (IS_ADMIN ? q : q.filter(x => x.owner === me())).length; } catch (e) { return 0; } };
  function pcCfg() { return { ...BMP.cfg, wonFlagDays: DB.settings.wonFlagDays || 30 }; }

  /* ================= 1. SCOREBOARD — MeCA ================= */
  function vScore() {
    const R = rangeFor(); const m = C.meca(data(), R); const T = m.team;
    const us = users(); const rows = us.map(u => [u, m.byUser[u] || null]);
    const plan = weeklyPlan(); const weeks = Math.max(1, Math.round((C.diffDays(R.start, R.end) + 1) / 7));
    const pv = (act, wk) => plan ? '<small>plan ' + (typeof wk === 'number' ? Math.round(wk * weeks).toLocaleString('en-IN') : wk) + '</small>' : '';
    return '<h2 class="sec" style="margin-top:0">Scoreboard — MeCA <small>Meetings · Conversion · Average ticket (W24 p.382). "What you measure grows."</small></h2>' +
      '<div class="toolrow">' + [['week', 'This week'], ['lastweek', 'Last week'], ['month', 'This month'], ['lastmonth', 'Last month'], ['quarter', '90 days'], ['all', 'All time']].map(([k, l]) => stPill(l, V.range === k, 'BMPV.range=\'' + k + '\';render()')).join('') + '<span class="note" style="margin-left:auto">' + esc(R.label) + '</span></div>' +
      '<div class="bmp-kpis">' +
      kpi('Meetings', T.meetings, 'Me', T.zoom ? T.zoom + ' on Zoom' : '', pv(T.meetings, plan && plan.meetings)) +
      kpi('Conversion', T.conversion + '%', 'C', T.convBasis, '', 'teal') +
      kpi('Avg ticket', T.avgTicket ? inr(T.avgTicket) : '—', 'A', T.wonValues.length + ' won with ₹ value', pv(0, plan && inr(plan.avg))) +
      kpi('Enquiries', T.leads, 'Leads', 'captured in EQC', pv(T.leads, plan && plan.leads), 'amber') +
      kpi('Won', T.won, 'Transactions', T.lost ? T.lost + ' lost' : '', pv(T.won, plan && plan.txn), 'teal') +
      kpi('Revenue', inr(T.revenue), '₹ won', 'from ₹ value on wins', pv(T.revenue, plan && inr(plan.revenue))) +
      kpi('Connected', T.connected, 'conversations', T.dials + ' dials', '') +
      kpi('Decks shown', T.decks, 'S.D.', 'W26 p.416', '') +
      kpi('Refs asked', T.refsAsked, 'reference calls', T.sorry + ' sorry calls', '') +
      '</div>' +
      '<table class="bmp-tbl"><thead><tr><th>Person</th><th class="bmp-num">Meetings</th><th class="bmp-num">Conversion</th><th class="bmp-num">Avg ticket</th><th class="bmp-num">Enquiries</th><th class="bmp-num">Connected</th><th class="bmp-num">Won</th><th class="bmp-num">Revenue</th><th class="bmp-num">Decks</th><th class="bmp-num">Refs</th><th class="bmp-num">Sorry</th></tr></thead><tbody>' +
      rows.map(([u, s]) => s ? '<tr><td><b>' + esc(u) + '</b></td><td class="bmp-num">' + s.meetings + '</td><td class="bmp-num">' + s.conversion + '%</td><td class="bmp-num">' + (s.avgTicket ? inr(s.avgTicket) : '—') + '</td><td class="bmp-num">' + s.leads + '</td><td class="bmp-num">' + s.connected + '</td><td class="bmp-num">' + s.won + '</td><td class="bmp-num">' + inr(s.revenue) + '</td><td class="bmp-num">' + s.decks + '</td><td class="bmp-num">' + s.refsAsked + '</td><td class="bmp-num">' + s.sorry + '</td></tr>' : '<tr><td><b>' + esc(u) + '</b></td><td colspan="10" class="note">no activity in range</td></tr>').join('') +
      '</tbody></table>' +
      vStreams(R) + vNegMeca() +
      '<div class="bmp-rule"><b>RJ\'s order for sales measurement:</b> start with MeCA, move to the negative M.I.S only once the numbers are habit (W38 p.505). Conversion here = ' + esc(T.convBasis) + '; put a ₹ value on every win (lead cockpit → "₹ value / yr") and the average ticket fills itself. <span class="bmp-ref">W24 p.382 · W25 p.402 · W35 p.498</span></div>';
  }
  /* ---- ASMP: C.R.R vs N.B.D — "usually 20:80; the ASMP target is 50:50" ---- */
  function vStreams(R) {
    const s = C.streamSplit(data(), R); const S = C.STREAMS; const keys = Object.keys(S);
    const chip = k => '<span class="bmp-stream" style="background:' + STREAM_COLOR[k] + '">' + S[k].short + '</span>';
    return '<div class="card" style="margin:14px 0"><h3 style="display:flex;justify-content:space-between;align-items:center">C.R.R vs N.B.D <small class="note">wins by stream · ' + esc(R.label) + '</small></h3>' +
      '<div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;margin-bottom:8px"><div><div class="bmp-score" style="font-size:30px">' + (s.totWon ? s.nbdPctWon + '%' : '—') + '</div><small class="note">of wins are N.B.D · target 50%</small></div>' +
      '<div><div class="bmp-score" style="font-size:30px">' + (s.totRev ? s.nbdPctRev + '%' : '—') + '</div><small class="note">of ₹ won is N.B.D</small></div>' +
      '<div style="flex:1;min-width:220px"><div style="display:flex;height:14px;border-radius:3px;overflow:hidden;border:1px solid var(--line)">' + keys.map(k => { const n = s.byStream[k].won; const w = s.totWon ? n / s.totWon * 100 : 25; return '<div title="' + S[k].label + ' ' + n + '" style="width:' + w + '%;background:' + STREAM_COLOR[k] + (s.totWon ? '' : ';opacity:.25') + '"></div>'; }).join('') + '</div><div style="margin-top:4px">' + keys.map(k => chip(k) + ' ' + s.byStream[k].won + ' won · ' + s.byStream[k].enquiries + ' enq · ' + inr(s.byStream[k].revenue) + ' &nbsp;').join('') + '</div></div></div>' +
      '<div class="note">Tag the stream on every enquiry (EQC form) and lead (cockpit → Stream). Untagged records are guessed: known client → N.B.D of C.R.R, inbound channel → N.B.D Incoming, cold list / reference / Dream 150 → N.B.D Outgoing. <b>ASMP:</b> C.R.R is the biggest killer of N.B.D — take order-taking off the salesperson (S.C + O.S.R on the phone) so the sales team does only face time.</div></div>';
  }
  /* ---- ASMP: Negative MeCA — M.I.S level 2 / 3 ---- */
  function vNegMeca() {
    const w = C.weekOf(todayKey()); const r = C.negMeca(data(), BMP.cfg, w, Date.now()); const us = users().filter(u => u !== 'suyashh' && r.byUser[u]);
    if (!us.length) return '';
    const neg = n => '<span class="' + (n >= -10 ? 'bmp-green' : 'bmp-red') + '">' + n + '%</span>';
    return '<div class="card" style="margin:14px 0"><h3>Negative MeCA — this week <small class="note">M.I.S level 2/3: the real numbers, always negative (ASMP "Sales is a Number Game")</small></h3>' +
      '<table class="bmp-tbl"><thead><tr><th>Person</th><th class="bmp-num">Score</th><th>Meetings not done</th><th>₹ of meetings missed</th><th>Conversion below benchmark</th><th>Avg ₹ sale lost</th><th>₹ of clients lost</th></tr></thead><tbody>' +
      us.map(u => { const s = r.byUser[u]; return '<tr><td><b>' + esc(u) + '</b></td><td class="bmp-num"><b>' + neg(s.score) + '</b></td><td>' + (s.planned ? neg(s.pctMeet) + ' <small class="note">' + s.meetings + ' / ' + s.planned + '</small>' : '<small class="note">no plan</small>') + '</td><td>' + (s.rsMeet ? '<span class="bmp-red">' + inr(s.rsMeet) + '</span>' : '—') + (s.missed.length ? ' <small class="note">' + s.missed.map(m => esc(m.co)).join(', ') + '</small>' : '') + '</td><td>' + neg(s.pctCr) + ' <small class="note">' + s.cr + '% vs best ' + s.bmCr + '%</small></td><td>' + neg(s.pctAvg) + (s.rsAvg ? ' <small class="bmp-red">' + inr(s.rsAvg) + '</small>' : '') + ' <small class="note">' + (s.avg ? inr(s.avg) : '—') + ' vs ' + (s.bmAvg ? inr(s.bmAvg) : '—') + '</small></td><td>' + (s.rsLost ? '<span class="bmp-red">' + inr(s.rsLost) + '</span>' : '—') + '</td></tr>'; }).join('') +
      '</tbody></table><div class="note" style="margin-top:6px">Benchmark = the person\'s own best week in the last 8 (else the team). Meetings plan per person is in Setup. RJ: "First only prepare the sheet, don\'t roll out — get the data and monitor it weekly. When you get the courage, start the E.M with the negative score."</div></div>';
  }
  function kpi(l, v, t, s, extra, cls) { return '<div class="bmp-kpi ' + (cls || '') + '"><span>' + t + '</span><b>' + v + '</b><span style="text-transform:none;letter-spacing:0;font-weight:600;color:var(--ink)">' + l + '</span>' + (s ? '<small>' + esc(s) + '</small>' : '') + (extra || '') + '</div>'; }
  function weeklyPlan() { const p = BMP.cfg.plan; if (!p || !(+p.leads)) return null; const fp = C.fiveParams(p); return { leads: p.leads / 52, txn: fp.clients * p.txn / 52, revenue: fp.revenue / 52, avg: p.avg, meetings: (p.meetingsPerWeek || 0) }; }

  /* ================= 2. NEGATIVE M.I.S + E.M ================= */
  function vMis() {
    const now = Date.now(); const weeks = C.weeksBack(8, now); const w = weeks[V.misWk] || weeks[0];
    const us = users(); const res = C.misWeek(data(), BMP.cfg, w, now);
    const hist = weeks.slice().reverse().map(wk => ({ wk, r: C.misWeek(data(), BMP.cfg, wk, now) }));
    const commit = (BMP.mis.commit[w.id] || {});
    const nextW = C.weekOf(C.addDays(w.start, 7));
    return '<h2 class="sec" style="margin-top:0">Negative M.I.S <small>one negative number per person, every week. Green when better than ' + (BMP.cfg.greenAt ?? -10) + '% (W26 p.425–427, W35 p.489)</small></h2>' +
      '<div class="toolrow">' + weeks.map((wk, i) => stPill((i === 0 ? 'This week' : i === 1 ? 'Last week' : wk.id.slice(5)), V.misWk === i, 'BMPV.misWk=' + i + ';render()')).join('') + '<span class="note" style="margin-left:auto">' + esc(w.label) + (V.misWk === 0 ? ' · in progress, counts promises due up to today' : '') + '</span></div>' +
      '<div class="bmp-rule"><b>K.R.A</b> All work done as per plan. <b>K.P.I</b> % work not done (quantity) and % done late (time). <b>Score</b> = average of the K.R.A percentages, always negative. <b>E.M rule:</b> Done / Not done — never WHY. 3 minutes. "Work not done + reason = work done." <span class="bmp-ref">W4 p.50 · W26 p.426</span></div>' +
      us.filter(u => !(u === 'suyashh' && !(res.byUser[u] && res.byUser[u].planned))).map(u => {
        const s = res.byUser[u] || { planned: 0, done: 0, late: 0, notDone: 0, score: 0, pctWND: 0, pctWNDOT: 0, kras: {}, items: [] };
        const trend = hist.map(h => (h.r.byUser[u] || { score: 0, planned: 0 }));
        const cm = commit[u] || {};
        return '<div class="card" style="margin-bottom:12px"><div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">' +
          '<div style="min-width:120px"><div class="note">' + esc(u) + '</div><div class="bmp-score ' + scoreCls(s.score) + '">' + (s.planned ? s.score + '%' : '—') + '</div><small class="note">' + (s.planned ? (s.score >= (BMP.cfg.greenAt ?? -10) ? 'GREEN' : 'RED') : 'no plan this week') + '</small></div>' +
          '<div style="min-width:170px"><div class="note">Planned ' + s.planned + ' · Done ' + s.done + ' · Late ' + s.late + ' · Not done ' + s.notDone + '</div><div class="note">% WND <b>' + s.pctWND + '%</b> · % WNDOT <b>' + s.pctWNDOT + '%</b></div>' +
          '<div style="margin-top:6px">' + Object.entries(s.kras).map(([k, v]) => '<span class="bmp-chip ' + (v.pct >= (BMP.cfg.greenAt ?? -10) ? 'g' : 'r') + '" title="' + esc(k) + '">' + esc(k) + ': ' + v.done + '/' + v.planned + ' (' + v.pct + '%)</span>').join('') + '</div></div>' +
          '<div><div class="note">8-week trend</div><div class="bmp-bars">' + trend.map(t => '<i class="' + (t.score >= (BMP.cfg.greenAt ?? -10) ? 'g' : '') + '" style="height:' + Math.max(3, Math.min(34, Math.abs(t.score) / 3)) + 'px" title="' + t.score + '%"></i>').join('') + '</div></div>' +
          (IS_ADMIN ? ('<div class="bmp-em" style="flex:1;min-width:240px"><b>E.M — ' + esc(nextW.id) + '</b><div class="note">"' + esc(u) + ', this week was ' + (s.planned ? s.score + '%' : '—') + '. How much red next week?"</div>' +
            '<div class="bmp-inline" style="display:flex;gap:6px;align-items:center;margin-top:6px"><input type="number" style="width:80px" value="' + (cm.commit ?? '') + '" placeholder="−%" onchange="bmpCommit(\'' + w.id + '\',\'' + u + '\',this.value)"><span class="note">committed score</span>' +
            '<span class="pill ' + (cm.status === 'done' ? 'on' : '') + '" onclick="bmpEmStatus(\'' + w.id + '\',\'' + u + '\',\'done\')">E.M done</span><span class="pill ' + (cm.status === 'skipped' ? 'on' : '') + '" onclick="bmpEmStatus(\'' + w.id + '\',\'' + u + '\',\'skipped\')">skipped</span></div></div>') : '') +
          '</div>' +
          (s.items.length ? '<details style="margin-top:8px"><summary class="note" style="cursor:pointer">' + s.items.length + ' promise(s) not kept — tap to see</summary><table style="margin-top:6px"><thead><tr><th>Due</th><th>Company</th><th>What</th><th></th></tr></thead><tbody>' + s.items.slice(0, 60).map(it => '<tr><td>' + fmtD(it.due) + '</td><td><b>' + esc(it.co) + '</b></td><td style="font-size:12px">' + esc(it.what) + '</td><td><button class="btn sm ghost" onclick="' + openRef(it) + '">Open</button></td></tr>').join('') + '</tbody></table></details>' : '') +
          '</div>';
      }).join('') +
      (IS_ADMIN ? '<div class="toolrow"><button class="btn sm ghost" onclick="bmpSnapshot(\'' + w.id + '\')">📌 Snapshot this week\'s scores</button><button class="btn sm ghost" onclick="bmpCopyEm(\'' + w.id + '\')">📋 Copy E.M sheet</button><span class="note">Snapshots freeze the score for appraisal (D.S 20% · M.I.S 80%, W29 p.480).</span></div>' : '');
  }
  window.bmpCommit = function (wid, u, v) { BMP.mis.commit[wid] = BMP.mis.commit[wid] || {}; BMP.mis.commit[wid][u] = { ...(BMP.mis.commit[wid][u] || {}), commit: v === '' ? undefined : +v, by: me(), t: Date.now() }; bmpSave('mis'); toast('Commitment noted — no WHY asked ✓'); };
  window.bmpEmStatus = function (wid, u, st) { BMP.mis.commit[wid] = BMP.mis.commit[wid] || {}; BMP.mis.commit[wid][u] = { ...(BMP.mis.commit[wid][u] || {}), status: st, t: Date.now() }; bmpSave('mis'); render(); };
  window.bmpSnapshot = function (wid) { const w = C.weeksBack(8).find(x => x.id === wid); const r = C.misWeek(data(), BMP.cfg, w, Date.now()); BMP.mis.snap[wid] = Object.fromEntries(Object.entries(r.byUser).map(([u, s]) => [u, { score: s.score, planned: s.planned, done: s.done, late: s.late, notDone: s.notDone, at: Date.now() }])); bmpSave('mis'); toast('Snapshot saved for ' + wid); };
  window.bmpCopyEm = function (wid) {
    const w = C.weeksBack(8).find(x => x.id === wid); const r = C.misWeek(data(), BMP.cfg, w, Date.now());
    const txt = 'E.M SHEET — ' + wid + ' (' + w.label + ')\n' + Object.entries(r.byUser).map(([u, s]) => u + ': ' + s.score + '%  (planned ' + s.planned + ', done ' + s.done + ', late ' + s.late + ', not done ' + s.notDone + ')' + Object.entries(s.kras).map(([k, v]) => '\n   - ' + k + ': ' + v.done + '/' + v.planned + ' → ' + v.pct + '%').join('')).join('\n') + '\n\nRule: Done / Not done. No WHY. Ask: how much red next week?';
    navigator.clipboard.writeText(txt).then(() => toast('E.M sheet copied ✓'));
  };

  /* ================= 3. P.C QUEUE ================= */
  function vPC() {
    let q = C.pcQueue(data(), pcCfg()); if (!IS_ADMIN) q = q.filter(x => x.owner === me());
    const types = {}; q.forEach(x => types[x.type] = (types[x.type] || 0) + 1);
    const owners = [...new Set(q.map(x => x.owner))].sort();
    const rows = q.filter(x => (!V.pcType || x.type === V.pcType) && (!V.pcOwner || x.owner === V.pcOwner));
    return '<h2 class="sec" style="margin-top:0">Sales P.C Queue <small>' + q.length + ' broken promises. The P.C is an auditor: never fills data, never asks why, nudges twice, then raises a Help Ticket (W11 p.221 · W3 p.41 · W17 p.288)</small></h2>' +
      '<div class="toolrow">' + stPill('All ' + q.length, !V.pcType, 'BMPV.pcType=\'\';render()') + Object.entries(types).sort((a, b) => b[1] - a[1]).map(([t, n]) => stPill((PC_LABEL[t] || t) + ' ' + n, V.pcType === t, 'BMPV.pcType=\'' + t + '\';render()')).join('') +
      (IS_ADMIN ? '<select onchange="BMPV.pcOwner=this.value;render()"><option value="">All owners</option>' + owners.map(o => '<option ' + (V.pcOwner === o ? 'selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>' : '') +
      '<button class="btn sm ghost" onclick="bmpCopyQueue()">📋 Copy for WhatsApp</button></div>' +
      (!rows.length ? '<div class="card">✅ Nothing in the queue.</div>' :
        '<table class="bmp-tbl"><thead><tr><th>Owner</th><th>Company</th><th>Promise broken</th><th>Due</th><th class="bmp-num">Days</th><th>Next action</th><th>Nudges</th><th></th></tr></thead><tbody>' +
        rows.slice(0, 400).map(it => '<tr><td>' + esc(it.owner) + '</td><td><b>' + esc(it.co) + '</b><br><small style="color:var(--slate)">' + esc(it.name) + '</small></td><td><span class="st" style="background:var(--bad);color:var(--red)">' + esc(PC_LABEL[it.type] || it.type) + '</span>' + (it.label !== (PC_LABEL[it.type] || it.type) ? '<br><small>' + esc(it.label) + '</small>' : '') + '</td><td>' + (it.due ? fmtD(it.due) : '—') + '</td><td class="bmp-num">' + (it.due ? it.days + 'd' : '') + '</td><td style="font-size:12px">' + esc(it.action) + '</td>' +
          '<td>' + (it.nudges ? it.nudges + '× <small>' + fmtD(it.pcLast) + '</small>' : '—') + '</td>' +
          '<td style="white-space:nowrap"><button class="btn sm ghost" onclick="' + openRef(it) + '">Open</button> ' + (IS_ADMIN || true ? '<button class="btn sm ghost" onclick="bmpNudge(\'' + it.kind + '\',' + it.id + ',\'' + esc(PC_LABEL[it.type] || it.type) + '\')">' + (it.nudges >= 2 ? '🎫 Help ticket' : '👉 Nudge') + '</button>' : '') + '</td></tr>').join('') +
        '</tbody></table>') +
      '<div class="bmp-rule"><b>Chase order RJ gives:</b> what hurts (overdue promises to hot leads) → where money is made (RFQ and enquiry TAT) → top clients (deck, references, OTD report, visits). A nudge is a verbal help slip; the third one is a Help Ticket to the director — after the verbal attempt, never before. <span class="bmp-ref">W3 p.41–43 · W12 p.234–235 · W21 p.353</span></div>';
  }
  function recOf(kind, id) { return kind === 'lead' ? find(id) : kind === 'rfq' ? DB.rfq.find(r => r.id === id) : kind === 'eqc' ? BMP.eqc.find(e => e.id === id) : BMP.clients.find(c => c.id === id); }
  window.bmpNudge = function (kind, id, what) {
    const r = recOf(kind, id); if (!r) return;
    r.pcNudges = (r.pcNudges || 0) + 1; r.pcLast = todayKey();
    const lead = kind === 'lead' ? r : { id: 0, co: r.co, name: r.name || r.contactName || '' };
    if (r.pcNudges >= 3) {
      logAct(lead, 'PC', 'Help ticket #' + r.pcNudges + ' → Suyashh', what);
      const s = '🎫 HELP TICKET — ' + r.co + ' — ' + what, b = 'Help ticket raised by the P.C queue.\n\nCompany: ' + r.co + '\nItem: ' + what + '\nOwner: ' + C.ownerOf(r) + '\nNudges so far: ' + r.pcNudges + '\n\nVerbal help slip given twice; work still stuck. Needs a decision, not a follow-up.';
      window.open('mailto:' + DB.settings.suyashhEmail + '?subject=' + encodeURIComponent(s) + '&body=' + encodeURIComponent(b));
    } else logAct(lead, 'PC', 'P.C nudge #' + r.pcNudges, what);
    if (kind === 'lead') saveDB('leads'); else if (kind === 'rfq') saveDB('rfq'); else bmpSave(kind === 'eqc' ? 'eqc' : 'clients');
    toast(r.pcNudges >= 3 ? 'Help ticket raised' : 'Nudge #' + r.pcNudges + ' logged'); render();
  };
  window.bmpCopyQueue = function () {
    let q = C.pcQueue(data(), pcCfg()); if (!IS_ADMIN) q = q.filter(x => x.owner === me());
    const by = {}; q.forEach(x => (by[x.owner] = by[x.owner] || []).push(x));
    const txt = 'P.C QUEUE — ' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + '\n' + Object.entries(by).map(([o, arr]) => '\n' + o.toUpperCase() + ' (' + arr.length + ')\n' + arr.slice(0, 25).map(x => '• ' + x.co + ' — ' + (PC_LABEL[x.type] || x.type) + (x.due ? ' (' + x.days + 'd)' : '')).join('\n') + (arr.length > 25 ? '\n… +' + (arr.length - 25) + ' more' : '')).join('\n') + '\n\n— BRL Command Center';
    navigator.clipboard.writeText(txt).then(() => toast('Queue copied ✓'));
  };

  /* ================= 3b. FUNNEL · 5-FOR-9 · I.P.L (ASMP) ================= */
  function fnRange() { const tk = todayKey(); if (V.fnRange === 'all') return null; const d = V.fnRange === '30' ? 29 : V.fnRange === '90' ? 89 : 179; return { start: C.addDays(tk, -d), end: tk }; }
  function vFunnel() {
    const us = users().filter(u => u !== 'suyashh'); const R = fnRange();
    const fo = C.funnelByOwner(data(), us, { range: R }); const f = V.fnOwner ? fo.byUser[V.fnOwner].f : fo.team;
    const max = Math.max(1, f.counts.leads);
    const bn = f.bottleneck; const lg = C.leadGenMix(data(), R || { start: C.addDays(todayKey(), -89), end: todayKey() });
    const S = C.STREAMS; const gpAvg = (() => { const cs = BMP.clients.filter(c => +c.gpPct); return cs.length ? Math.round(cs.reduce((a, c) => a + +c.gpPct, 0) / cs.length) : null; })();
    return '<h2 class="sec" style="margin-top:0">Sales Funnel · 5-for-9 <small>Lead → Order. "Find the stage where the maximum leads drop — that is the step to correct first." (ASMP)</small></h2>' +
      '<div class="toolrow">' + [['all', 'All leads'], ['30', 'First touch ≤ 30 d'], ['90', '≤ 90 d'], ['180', '≤ 180 d']].map(([k, l]) => stPill(l, V.fnRange === k, 'BMPV.fnRange=\'' + k + '\';render()')).join('') +
      (IS_ADMIN ? '<select onchange="BMPV.fnOwner=this.value;render()"><option value="">Team</option>' + us.map(u => '<option ' + (V.fnOwner === u ? 'selected' : '') + '>' + esc(u) + '</option>').join('') + '</select>' : '') + '</div>' +
      '<div class="card"><div class="bmp-funnel">' + C.FUNNEL.map((s, i) => { const n = f.counts[s.k]; const step = i ? f.steps[i - 1] : null; const isBn = bn && step && step.k === bn.k; return (step ? '<div class="cr ' + (isBn ? 'bn' : '') + '">' + step.cr + '% →</div>' : '') + '<div class="st"><div class="bar ' + (isBn ? 'bn' : '') + '" style="height:' + Math.max(4, Math.round(n / max * 90)) + 'px;width:70%"></div><b>' + n + '</b><small>' + s.label + '</small></div>'; }).join('') + '</div>' +
      (bn ? '<div class="bmp-rule"><b>I.P.L — the bottleneck is ' + esc(bn.from) + ' → ' + esc(bn.to) + ':</b> ' + bn.drop + ' of ' + bn.base + ' leads are lost here (' + bn.cr + '% convert). Leverage it with P.O.S.T — <i>' + esc(bn.post) + '</i>. Work this one stage for 2–3 months, then move to the next. <span class="bmp-ref">ASMP "I.P.L is the game" · "If sales is not happening: the pitch, the delivery or the follow-up — there is no other reason."</span></div>' : '<div class="note">No leads in range.</div>') + '</div>' +
      '<div class="bmp-kpis">' + kpi('Leads', f.counts.leads, '1', Object.keys(S).map(k => S[k].short + ' ' + f.byStream[k]).join(' · '), '', 'amber') +
      f.steps.map((s, i) => kpi(s.from + ' → ' + s.to, s.cr + '%', String(i + 2), s.n + ' of ' + s.base, '', bn && s.k === bn.k ? 'red' : '')).join('') +
      kpi('Avg ₹ sale', f.avgSale ? inr(f.avgSale) : '—', '6', f.wonN + ' won with ₹ value', '') + kpi('Transactions', f.counts.won, '7', 'won in range', '', 'teal') + kpi('Margin', gpAvg !== null ? gpAvg + '%' : '—', '8', 'avg G.P% on rated clients', '') + kpi('Sales lead time', f.avgLeadTime !== null ? f.avgLeadTime + ' d' : '—', '9', 'first touch → won', '') + '</div>' +
      '<div class="grid2"><div class="card"><h3>Step conversions — I.P.L order <small class="note">biggest loss first</small></h3><table class="bmp-tbl"><thead><tr><th>#</th><th>Step</th><th class="bmp-num">In</th><th class="bmp-num">Through</th><th class="bmp-num">Lost</th><th class="bmp-num">C.R</th></tr></thead><tbody>' +
      f.ranked.map((s, i) => '<tr' + (bn && s.k === bn.k ? ' style="background:var(--bad)"' : '') + '><td>' + (i + 1) + '</td><td>' + esc(s.from) + ' → ' + esc(s.to) + '</td><td class="bmp-num">' + s.base + '</td><td class="bmp-num">' + s.n + '</td><td class="bmp-num"><b>' + s.drop + '</b></td><td class="bmp-num">' + s.cr + '%</td></tr>').join('') + '</tbody></table>' +
      (IS_ADMIN && !V.fnOwner ? '<h3 style="margin-top:12px">Per person <small class="note">R.T = re-training flag: below 60% of the team\'s C.R at that step, on 10+ leads</small></h3><table class="bmp-tbl"><thead><tr><th>Person</th>' + fo.team.steps.map(s => '<th class="bmp-num">' + esc(s.to) + '</th>').join('') + '<th>Flags</th></tr></thead><tbody>' +
        us.map(u => { const x = fo.byUser[u]; return '<tr><td><b>' + esc(u) + '</b> <small class="note">' + x.f.counts.leads + '</small></td>' + x.f.steps.map(s => '<td class="bmp-num">' + s.cr + '%</td>').join('') + '<td>' + (x.flags.length ? x.flags.map(fl => '<span class="bmp-chip r">R.T at ' + esc(fl.step) + ' (' + fl.own + '% vs ' + fl.team + '%)</span>').join('') : '<span class="bmp-chip g">ok</span>') + '</td></tr>'; }).join('') + '</tbody></table><div class="note">ASMP Sales Audit: when the M.I.S drops at a stage, pull the person out of active sales into re-training for that stage, then a video self-declaration before they go back.</div>' : '') + '</div>' +
      '<div class="card"><h3>Lead-gen order <small class="note">' + (R ? 'in range' : 'last 90 days') + ' · cheapest source first</small></h3><table class="bmp-tbl"><thead><tr><th>Source</th><th class="bmp-num">Leads</th><th class="bmp-num">Won</th><th></th></tr></thead><tbody>' +
      lg.buckets.map(b => '<tr><td><b>' + esc(b.label) + '</b><br><small class="note">' + esc(b.hint) + '</small></td><td class="bmp-num">' + b.n + '</td><td class="bmp-num">' + b.won + '</td><td><div class="bmp-meter" style="width:90px"><i style="width:' + (lg.total ? Math.round(b.n / lg.total * 100) : 0) + '%"></i></div></td></tr>').join('') + '</tbody></table>' +
      '<div class="bmp-rule"><b>ASMP order of lead generation:</b> sorry calls → N.B.D of C.R.R (upsell / cross-sell, "probably a 6-month to 1-year job") → lost prospects → reference engine → only then fresh data. "Fresh new lead gen is the last alternative you should adopt." Lead generation is never the salesperson\'s job — the S.C lines up back-to-back Zoom calls; the salesperson does only Meetings & Conversion.</div></div></div>';
  }

  /* ================= 5b. GOLDEN CIRCLE — R.C · Black Circle · N.B.D of C.R.R (ASMP Pillar 3) ================= */
  function vGC() {
    const rated0 = rated(); const g = C.goldenCircle(data(), BMP.cfg, { start: C.addDays(todayKey(), -89), end: todayKey() }); const m = g.metrics; const rc = BMP.cfg.rc; const ed = IS_ADMIN;
    const sub = [['rc', '🚀 Rocket Clients'], ['bc', '⚫ Black Circle · B.C.C'], ['wallet', '🥧 Wallet share · N.B.D of C.R.R'], ['profile', '👤 R.C profile']];
    const pctOrDash = v => v === null ? '—' : v + '%';
    let body = '';
    if (V.gcTab === 'rc') {
      const list = g.rated.slice().sort((a, b) => (b.r.n - a.r.n) || ((b.c.monthlyRev || 0) - (a.c.monthlyRev || 0)));
      body = '<table class="bmp-tbl"><thead><tr><th>Client</th><th>Stars</th><th class="bmp-num">R.C flags</th><th>Rocket?</th><th class="bmp-num">₹ / month</th><th class="bmp-num">Pay days</th><th class="bmp-num">G.P%</th><th class="bmp-num">Wallet share</th></tr></thead><tbody>' +
        list.map(x => '<tr class="lead" onclick="bmpClientDrawer(' + x.c.id + ')"><td><b>' + esc(x.c.co) + '</b></td><td>' + stars(x.c.star) + '</td><td class="bmp-num">' + x.r.n + '/8</td><td>' + (x.r.isRC ? '<span class="st" style="background:#1E7A4C;color:#fff">🚀 R.C</span>' : x.c.rcOverride === 'N' ? '<span class="st">no</span>' : '—') + '</td><td class="bmp-num">' + (x.c.monthlyRev ? inr(x.c.monthlyRev) : '—') + '</td><td class="bmp-num">' + (x.c.payDays || '—') + '</td><td class="bmp-num">' + (x.c.gpPct ? x.c.gpPct + '%' : '—') + '</td><td class="bmp-num">' + pctOrDash(x.share) + '</td></tr>').join('') + '</tbody></table>' +
        (!list.length ? '<div class="empty">Add clients in Clients ★ first — the R.C flags live on each client card.</div>' : '') +
        '<div class="bmp-rule"><b>Who is a Rocket Client?</b> You are strongest selling to them, competition does not matter; they love the service and become fans; high G.P; loyal; give references; room to grow; never ask for discounts; pay on time; fit your ideology. List your best clients, find what they have in common, score every client on it. <b>Then sell only to R.C — "selling to anybody else is paap".</b> <span class="bmp-ref">ASMP Pillar 2 / 3</span></div>';
    } else if (V.gcTab === 'bc') {
      body = '<table class="bmp-tbl"><thead><tr><th>Client</th><th>Stars</th><th>Why Black Circle</th><th class="bmp-num">₹ / month</th><th>B.C.C decision</th><th>Done</th></tr></thead><tbody>' +
        g.bcs.map(x => '<tr class="lead" onclick="bmpClientDrawer(' + x.c.id + ')"><td><b>' + esc(x.c.co) + '</b></td><td>' + stars(x.c.star) + '</td><td>' + (C.BC_FLAGS.filter(([k]) => (x.c.bcFlags || {})[k]).map(([, l]) => '<span class="bmp-chip r">' + l + '</span>').join('') || '<span class="bmp-chip r">≤ 2★ by score</span>') + '</td><td class="bmp-num">' + (x.c.monthlyRev ? inr(x.c.monthlyRev) : '—') + '</td><td>' + (x.c.bccAction ? '<b>' + esc(C.BCC_ACTIONS[x.c.bccAction] || x.c.bccAction) + '</b>' + (x.c.bccNote ? '<br><small>' + esc(x.c.bccNote) + '</small>' : '') : '<span class="bmp-red">not decided</span>') + '</td><td>' + (x.c.bccDoneAt ? fmtD(x.c.bccDoneAt) : '—') + '</td></tr>').join('') + '</tbody></table>' +
        (!g.bcs.length ? '<div class="empty">No Black Circle clients flagged. Open a client card and tick the reasons — bandwidth, payments, ops headaches, low G.P, only asks for quotes.</div>' : '') +
        '<div class="bmp-rule"><b>Step 1</b> identify the bottom 20% of clients that cause 80% of the problems. <b>Step 2 — B.C.C:</b> either say NO, or increase prices and ask for advances. Do it in batches of 3–5 clients to see the proof. "Look at how much profit stopped with these clients — nothing. This will be your biggest victory." If you say YES to a non-R.C you say NO to an R.C. <span class="bmp-ref">ASMP GC to 4X, steps 1–2</span></div>';
    } else if (V.gcTab === 'wallet') {
      body = '<div class="bmp-kpis">' + kpi('Wallet gap', inr(m.gapTotal), '₹ / month', 'freight our clients give to others', '', 'red') + kpi('Annualised', inr(m.gapTotal * 12), 'N.B.D of C.R.R scope', 'the lowest-hanging fruit', '', 'amber') + kpi('Avg R.C share', pctOrDash(m.avgShareRC), 'wallet share', 'of rocket clients', '') + '</div>' +
        '<table class="bmp-tbl"><thead><tr><th>Client</th><th>R.C</th><th class="bmp-num">Their total ₹/mo</th><th class="bmp-num">Ours</th><th class="bmp-num">Share</th><th class="bmp-num">Gap ₹/mo</th><th>Lanes / plants not with us</th><th>Competitor</th><th>Last pitch</th></tr></thead><tbody>' +
        g.nbdCrr.map(x => '<tr class="lead" onclick="bmpClientDrawer(' + x.c.id + ')"><td><b>' + esc(x.c.co) + '</b></td><td>' + (x.r.isRC ? '🚀' : '') + '</td><td class="bmp-num">' + inr(x.c.spendTotal) + '</td><td class="bmp-num">' + inr(x.c.monthlyRev) + '</td><td class="bmp-num">' + pctOrDash(x.share) + '</td><td class="bmp-num"><b class="bmp-red">' + inr(x.gap) + '</b></td><td style="font-size:12px">' + esc(x.c.lanesNot || '') + '</td><td style="font-size:12px">' + esc(x.c.competitors || '') + '</td><td>' + (x.c.nbdCrrAt ? fmtD(x.c.nbdCrrAt) : '<span class="bmp-red">never</span>') + '</td></tr>').join('') + '</tbody></table>' +
        (!g.nbdCrr.length ? '<div class="empty">Fill "their total freight ₹/month" on each client card — the gap list builds itself, biggest first.</div>' : '') +
        '<div class="bmp-rule"><b>N.B.D of C.R.R — the loss of business per month:</b> cross-sell (lanes they give to competitors), wallet share (same lane, split vendors), lost clients. Put all clients in descending order of gap; a separate S.C + lead generator works this list; the S.C fixes Zoom meetings with existing clients and hands them to the salesperson — "they hate fixing meetings, but if a meeting is allotted to them they will SELL". Do not start with your best clients — soft launch. <span class="bmp-ref">ASMP N.B.D-C.R.R</span></div>';
    } else {
      const f = (k, l, ph, rows) => '<div class="frow"><label>' + l + '</label>' + (rows ? '<textarea rows="' + rows + '" ' + (ed ? 'onchange="bmpRcSet(\'' + k + '\',this.value)"' : 'readonly') + ' placeholder="' + ph + '">' + esc(rc[k] || '') + '</textarea>' : '<input value="' + esc(rc[k] ?? '') + '" ' + (ed ? 'onchange="bmpRcSet(\'' + k + '\',this.value)"' : 'readonly') + ' placeholder="' + ph + '">') + '</div>';
      body = '<div class="grid2"><div class="card"><h3>Profile the R.C — "Sharmaji"</h3>' + f('persona', 'Who is he? Role, K.R.A, what he is measured on, what he fears when buying', '', 5) + f('sectors', 'Sectors / keywords that mark an R.C-fit lead (comma separated — used to suggest Y on leads)', 'specialty chemicals, agrochem…', 3) +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px"><div class="frow"><label>Pays within (days)</label><input type="number" value="' + (rc.payDays ?? 45) + '" ' + (ed ? 'onchange="bmpRcSet(\'payDays\',+this.value)"' : 'readonly') + '></div><div class="frow"><label>G.P at least (%)</label><input type="number" value="' + (rc.gpPct ?? 12) + '" ' + (ed ? 'onchange="bmpRcSet(\'gpPct\',+this.value)"' : 'readonly') + '></div><div class="frow"><label>R.C at flags ≥ (of 8)</label><input type="number" value="' + (rc.minFlags ?? 5) + '" ' + (ed ? 'onchange="bmpRcSet(\'minFlags\',+this.value)"' : 'readonly') + '></div></div>' +
        '<div class="frow"><label>Where to start (Step 5 — you cannot do both at once)</label>' + [['RC', 'Rocket Client — sell everything to R.C'], ['RP', 'Rocket Product — sell only our rocket lanes / services']].map(([k, l]) => '<span class="pill ' + (rc.focus === k ? 'on' : '') + '" ' + (ed ? 'onclick="bmpRcSet(\'focus\',\'' + k + '\')"' : '') + '>' + l + '</span>').join('') + '</div></div>' +
        '<div class="card"><h3>Golden Circle metrics <small class="note">last 90 days · the negative versions are the real M.I.S</small></h3>' +
        '<table class="bmp-tbl"><tbody>' + [['R.C as % of all clients', m.pctRC + '%'], ['% of ₹ / month from R.C', m.pctRevRC + '%'], ['% leads touched that are outside R.C', pctOrDash(m.pctLeadsOutRC) + ' <small class="note">(' + m.ratedLeads + ' rated · ' + m.unratedLeads + ' unrated)</small>'], ['% meetings outside R.C', pctOrDash(m.pctMeetOutRC)], ['Avg wallet share of R.C', pctOrDash(m.avgShareRC)], ['Black Circle clients', m.bcCount + ' · ' + inr(m.bcRev) + '/mo'], ['N.B.D of C.R.R gap', inr(m.gapTotal) + '/mo']].map(r => '<tr><td>' + r[0] + '</td><td class="bmp-num"><b>' + r[1] + '</b></td></tr>').join('') + '</tbody></table>' +
        '<div class="bmp-rule"><b>The 7 steps to 4X:</b> 1 identify the Black Circle → 2 correct it (B.C.C) → 3 identify R.C and R.P → 4 map the scope of the R.C → 5 pick R.C or R.P to start → 6 identify the Golden Circle (R.C who buy R.P) → 7 sell only inside it. "Just working on your G.C will 4X profits, as leads, C.R, avg ₹ sale, transactions and margin all go up." Tag R.C-fit Y / N on every lead in its cockpit. <span class="bmp-ref">ASMP Pillar 3</span></div></div></div>';
    }
    return '<h2 class="sec" style="margin-top:0">Golden Circle <small>Rocket Clients · Black Circle correction · wallet share. "Your company\'s only purpose is to serve the R.C." (ASMP Pillar 3)</small></h2>' +
      '<div class="bmp-kpis">' + kpi('Rocket clients', g.rcs.length + ' / ' + BMP.clients.length, 'R.C', m.pctRC + '% of the book', '', 'teal') + kpi('₹ from R.C', m.pctRevRC + '%', 'of monthly revenue', '', '') + kpi('Black Circle', m.bcCount, 'to correct', inr(m.bcRev) + '/mo at risk', '', 'red') + kpi('Wallet gap', inr(m.gapTotal), '₹ / month', 'N.B.D of C.R.R scope', '', 'amber') + kpi('Leads outside R.C', pctOrDash(m.pctLeadsOutRC), 'of rated leads', m.unratedLeads + ' unrated', '') + '</div>' +
      '<div class="toolrow">' + sub.map(([k, l]) => stPill(l, V.gcTab === k, 'BMPV.gcTab=\'' + k + '\';render()')).join('') + '</div>' + body;
  }
  window.bmpRcSet = function (k, v) { BMP.cfg.rc = BMP.cfg.rc || {}; BMP.cfg.rc[k] = v; bmpSave('cfg'); if (k === 'focus') render(); };

  /* ================= 4. EQC — ENQUIRY CAPTURE ================= */
  function newEqcId() { return BMP.eqc.length ? Math.max(...BMP.eqc.map(e => e.id)) + 1 : 1; }
  function vEqc() {
    const tk = todayKey(); const mon = tk.slice(0, 7);
    const all = BMP.eqc.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    const thisMon = all.filter(e => (e.dt || '').slice(0, 7) === mon);
    const quoted = all.filter(e => e.quotedAt); const inTat = quoted.filter(e => e.quotedAt - e.createdAt <= (BMP.cfg.eqcTatHrs || 24) * 3600000).length;
    const won = all.filter(e => e.status === 'WON').length, lost = all.filter(e => e.status === 'LOST' || e.status === 'REGRET').length;
    const avgTat = quoted.length ? Math.round(quoted.reduce((a, e) => a + (e.quotedAt - e.createdAt), 0) / quoted.length / 3600000) : 0;
    const rows = all.filter(e => (!V.eqcSt || e.status === V.eqcSt) && (!V.eqcQ || (e.co + ' ' + e.name + ' ' + e.from + ' ' + e.to).toLowerCase().includes(V.eqcQ.toLowerCase())));
    return '<h2 class="sec" style="margin-top:0">Enquiry Capture Sheet (EQC) <small>"It is a sin if you don\'t capture your enquiries. Sales will go up 40–50% just by this." — W5 p.55</small></h2>' +
      '<div class="bmp-kpis">' + kpi('This month', thisMon.length, 'enquiries', '', '', 'amber') + kpi('Quoted in TAT', quoted.length ? Math.round(inTat / quoted.length * 100) + '%' : '—', 'within ' + (BMP.cfg.eqcTatHrs || 24) + ' h', 'avg ' + avgTat + ' h to quote', '', 'teal') + kpi('Open', all.filter(e => !/WON|LOST|REGRET/.test(e.status)).length, 'to close', '', '') + kpi('Won', won, 'transactions', '', '', 'teal') + kpi('Win rate', (won + lost) ? Math.round(won / (won + lost) * 100) + '%' : '—', 'won ÷ closed', lost + ' lost / regret', '') + kpi('₹ won', inr(all.filter(e => e.status === 'WON').reduce((a, e) => a + (+e.value || 0), 0)), 'annualised', '', '') + '</div>' +
      '<div class="toolrow">' + stPill('All', !V.eqcSt, 'BMPV.eqcSt=\'\';render()') + Object.entries(EQC_STATUS).map(([k, [l]]) => stPill(l, V.eqcSt === k, 'BMPV.eqcSt=\'' + k + '\';render()')).join('') +
      '<input placeholder="Search company, lane…" value="' + esc(V.eqcQ) + '" oninput="BMPV.eqcQ=this.value;render()" style="min-width:200px">' +
      '<button class="btn" onclick="BMPV.eqcForm=!BMPV.eqcForm;render()">➕ Capture enquiry</button><button class="btn sm ghost" onclick="bmpEqcExport()">⬇ CSV</button></div>' +
      (V.eqcForm ? eqcForm() : '') +
      '<table class="bmp-tbl"><thead><tr><th>Date</th><th>Company / contact</th><th>Lane</th><th>Vehicle · qty</th><th class="bmp-num">Quoted ₹</th><th>TAT</th><th>Owner</th><th>Next</th><th>Status</th></tr></thead><tbody>' +
      rows.slice(0, 300).map(e => '<tr class="lead" onclick="bmpEqcDrawer(' + e.id + ')"><td style="white-space:nowrap">' + fmtD(e.dt) + '</td><td><b>' + esc(e.co) + '</b><br><small style="color:var(--slate)">' + esc(e.name) + ' · ' + esc(e.src || '') + '</small></td><td>' + esc(e.from) + ' → ' + esc(e.to) + '</td><td>' + esc(e.veh || '') + (e.qty ? ' · ' + esc(e.qty) : '') + '</td><td class="bmp-num">' + (e.rate ? (+e.rate).toLocaleString('en-IN') : '—') + '</td><td>' + tatCell(e) + '</td><td>' + esc(e.assignedTo || '') + '</td><td>' + (e.nextDate ? fmtD(e.nextDate) : '—') + '</td><td><span class="st" style="background:' + EQC_STATUS[e.status][1] + ';color:#fff">' + EQC_STATUS[e.status][0] + '</span></td></tr>').join('') +
      '</tbody></table>' + (!rows.length ? '<div class="empty">No enquiries captured yet. Every rate request — call, mail, WhatsApp, portal, branch — goes in here the moment it arrives.</div>' : '') +
      '<div class="bmp-rule"><b>Science:</b> 40–50% of enquiries are never dealt with unless there is a sales structure; the owner sits with this sheet once or twice a week; a D.R owns it. All systems start from EQC. <span class="bmp-ref">W2 p.22–23 · W5 p.55</span></div>';
  }
  function tatCell(e) { if (!e.createdAt) return '—'; const lim = (BMP.cfg.eqcTatHrs || 24) * 3600000; if (e.quotedAt) { const h = Math.round((e.quotedAt - e.createdAt) / 3600000); return '<span class="' + (e.quotedAt - e.createdAt <= lim ? 'bmp-green' : 'bmp-red') + '">' + h + ' h</span>'; } if (e.status === 'NEW') { const h = Math.round((Date.now() - e.createdAt) / 3600000); return '<span class="' + (h <= (BMP.cfg.eqcTatHrs || 24) ? '' : 'bmp-red') + '">' + h + ' h open</span>'; } return '—'; }
  function eqcForm(L) {
    const g = k => L ? esc(L[k] || '') : '';
    return '<div class="card" style="margin-bottom:14px"><h3 style="margin-top:0">Capture enquiry</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' +
      '<input id="eq_co" placeholder="Company *" value="' + g('co') + '"><input id="eq_name" placeholder="Contact" value="' + g('name') + '"><input id="eq_mob" placeholder="Mobile" value="' + g('mob') + '">' +
      '<select id="eq_src">' + EQC_SRC.map(s => '<option>' + s + '</option>').join('') + '</select><input id="eq_from" placeholder="From (origin)"><input id="eq_to" placeholder="To (destination)">' +
      '<select id="eq_veh">' + VEH.map(v => '<option>' + v + '</option>').join('') + '</select><input id="eq_qty" placeholder="Qty / tonnage / vehicles per month"><input id="eq_target" type="number" placeholder="Client target rate ₹ (if said)">' +
      '<input id="eq_value" type="number" placeholder="₹ value per year (estimate)"><input id="eq_lead" type="hidden" value="' + (L ? L.id : '') + '"><select id="eq_stream" title="C.R.R / N.B.D stream (ASMP)"><option value="">Stream — auto</option>' + Object.entries(C.STREAMS).map(([k, s]) => '<option value="' + k + '">' + s.label + ' — ' + s.long + '</option>').join('') + '</select><input id="eq_note" placeholder="Note">' +
      '</div><div style="margin-top:8px"><button class="btn" onclick="bmpEqcAdd()">➕ Capture</button> <button class="btn ghost" onclick="BMPV.eqcForm=false;render()">Cancel</button> <span class="note">Quote within ' + (BMP.cfg.eqcTatHrs || 24) + ' h — the clock starts now.</span></div></div>';
  }
  window.bmpEqcAdd = function () {
    const g = id => { const el = $('#' + id); return el ? el.value.trim() : ''; };
    if (!g('eq_co')) { toast('Company is required'); return; }
    const e = { id: newEqcId(), dt: todayKey(), createdAt: Date.now(), co: g('eq_co'), name: g('eq_name'), mob: g('eq_mob'), src: g('eq_src'), from: g('eq_from'), to: g('eq_to'), veh: g('eq_veh'), qty: g('eq_qty'), target: +g('eq_target') || 0, value: +g('eq_value') || 0, note: g('eq_note'), stream: g('eq_stream') || '', leadId: +g('eq_lead') || null, status: 'NEW', rate: 0, quotedAt: 0, nextDate: '', log: [], assignedTo: me(), createdBy: me() };
    BMP.eqc.push(e); bmpSave('eqc'); V.eqcForm = false;
    logAct({ id: e.leadId || 0, co: e.co, name: e.name }, 'EQC', 'Enquiry captured', e.from + ' → ' + e.to);
    toast('Enquiry captured — quote within ' + (BMP.cfg.eqcTatHrs || 24) + ' h'); render(); if (typeof closeDrawer === 'function') closeDrawer(); bmpEqcDrawer(e.id);
  };
  window.bmpEqcDrawer = function (id) {
    const e = BMP.eqc.find(x => x.id === id); if (!e) return; const dr = $('#drawer'); dr.classList.add('open');
    const open = !/WON|LOST|REGRET/.test(e.status);
    dr.innerHTML = '<div class="dhead" style="position:relative"><button class="x" onclick="closeDrawer()">✕</button><h3>' + esc(e.co) + '</h3><p>' + esc(e.name) + ' · ' + esc(e.mob || '—') + ' · ' + esc(e.src || '') + '</p><p style="margin-top:6px">' + esc(e.from) + ' → ' + esc(e.to) + ' · ' + esc(e.veh || '') + (e.qty ? ' · ' + esc(e.qty) : '') + ' &nbsp; <span class="st" style="background:' + EQC_STATUS[e.status][1] + ';color:#fff">' + EQC_STATUS[e.status][0] + '</span></p></div><div class="dbody">' +
      '<div class="frow"><label>Enquiry</label><div class="note">Captured ' + new Date(e.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) + ' · TAT ' + tatCell(e) + (e.target ? ' · client target ₹' + (+e.target).toLocaleString('en-IN') : '') + (e.note ? '<br>' + esc(e.note) : '') + '</div>' +
      '<div style="margin-top:6px"><span class="note">Stream</span> ' + Object.entries(C.STREAMS).map(([k, s]) => '<span class="pill ' + (C.streamOf(e, BMP.clients) === k ? 'on' : '') + '" title="' + esc(s.long) + '" onclick="bmpEqcSet(' + id + ',\'stream\',\'' + k + '\')">' + s.short + '</span>').join('') + (e.stream ? '' : ' <small class="note">(guessed)</small>') + '</div></div>' +
      (e.mob ? '<a class="btn sm" style="text-decoration:none;display:inline-block;margin-bottom:10px" href="tel:' + esc(e.mob) + '">📞 Call</a> ' : '') +
      (open ? ('<div class="frow"><label>💰 Quote</label><div style="display:flex;gap:6px"><input id="eqd_rate" type="number" placeholder="Rate quoted ₹" value="' + (e.rate || '') + '" style="flex:1"><button class="btn sm" onclick="bmpEqcQuote(' + id + ')">Mark quoted</button></div><div class="note">Stops the TAT clock and books the next follow-up in 2 working days. No discount — show the deck instead (W29 p.468).</div></div>' +
        '<div class="frow"><label>📌 Follow-up note</label><textarea id="eqd_note" rows="2" placeholder="Called — reviewing rates, will revert Friday"></textarea><div style="display:flex;gap:6px;margin-top:6px;align-items:center"><select id="eqd_next"><option value="1">+1 day</option><option value="2" selected>+2 days</option><option value="3">+3 days</option><option value="7">+7 days</option></select><button class="btn sm ghost" onclick="bmpEqcLog(' + id + ')">➕ Log & book next</button></div></div>' +
        '<div class="frow"><label>🏁 Close</label><input id="eqd_value" type="number" placeholder="₹ value per year" value="' + (e.value || '') + '" style="width:100%;margin-bottom:6px"><textarea id="eqd_reason" rows="2" placeholder="Reason (required for Lost / Regret)"></textarea><div style="display:flex;gap:6px;margin-top:6px"><button class="btn sm" style="background:#2E8B57" onclick="bmpEqcClose(' + id + ',\'WON\')">✅ Won</button><button class="btn sm" style="background:#C43D2E" onclick="bmpEqcClose(' + id + ',\'LOST\')">❌ Lost</button><button class="btn sm" style="background:#8A8A8A" onclick="bmpEqcClose(' + id + ',\'REGRET\')">🙏 Regret</button></div></div>') :
        '<div class="frow"><label>Closed</label><div class="note">' + EQC_STATUS[e.status][0] + ' on ' + fmtD(e.closedAt ? C.tsKey(e.closedAt) : '') + (e.value ? ' · ' + inr(e.value) + '/yr' : '') + (e.reason ? '<br>Reason: ' + esc(e.reason) : '') + '</div></div>') +
      (e.log && e.log.length ? '<div class="frow"><label>History</label><div class="hist">' + e.log.slice().reverse().map(x => new Date(x.t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' · ' + esc(x.note) + (x.next ? ' → next ' + fmtD(x.next) : '') + (x.by ? ' <small>(' + esc(x.by) + ')</small>' : '')).join('<br>') + '</div></div>' : '') +
      '<div class="frow"><label>Links</label>' + (e.leadId ? '<button class="btn sm ghost" onclick="openDrawer(' + e.leadId + ')">Open lead cockpit</button> ' : '') + '<button class="btn sm ghost" onclick="bmpEqcToRfq(' + id + ')">Open in RFQ tracker</button> <button class="btn sm ghost" onclick="bmpEqcDelete(' + id + ')" style="color:var(--red)">🗑 Delete</button></div>' +
      '</div>';
  };
  window.bmpEqcSet = function (id, k, v) { const e = BMP.eqc.find(x => x.id === id); e[k] = v; bmpSave('eqc'); bmpEqcDrawer(id); };
  window.bmpEqcQuote = function (id) { const e = BMP.eqc.find(x => x.id === id); const rate = +($('#eqd_rate').value || 0); if (!rate) { toast('Enter the rate quoted'); return; } e.rate = rate; e.quotedAt = e.quotedAt || Date.now(); e.status = 'QUOTED'; const next = nextWorkDay(2); e.nextDate = next; e.log = e.log || []; e.log.push({ t: Date.now(), note: 'Quoted ₹' + rate.toLocaleString('en-IN'), next, by: me() }); bmpSave('eqc'); logAct({ id: e.leadId || 0, co: e.co, name: e.name }, 'EQC', 'Quoted ₹' + rate.toLocaleString('en-IN'), e.from + ' → ' + e.to); toast('Quoted — follow-up booked ' + fmtD(next)); render(); bmpEqcDrawer(id); };
  window.bmpEqcLog = function (id) { const e = BMP.eqc.find(x => x.id === id); const note = ($('#eqd_note').value || '').trim(); if (!note) { toast('Type a note first'); return; } const d = +($('#eqd_next').value || 2); const next = nextWorkDay(d); e.nextDate = next; if (e.status === 'QUOTED') e.status = 'FOLLOWUP'; e.log = e.log || []; e.log.push({ t: Date.now(), note, next, by: me() }); bmpSave('eqc'); logAct({ id: e.leadId || 0, co: e.co, name: e.name }, 'EQC', 'Follow-up', note); toast('Logged — next ' + fmtD(next)); render(); bmpEqcDrawer(id); };
  window.bmpEqcClose = function (id, st) { const e = BMP.eqc.find(x => x.id === id); const reason = ($('#eqd_reason').value || '').trim(); if (st !== 'WON' && !reason) { toast('Reason required'); return; } e.value = +($('#eqd_value').value || e.value || 0); e.status = st; e.reason = reason; e.closedAt = Date.now(); e.nextDate = ''; e.log = e.log || []; e.log.push({ t: Date.now(), note: 'Closed → ' + EQC_STATUS[st][0] + (reason ? ' — ' + reason : ''), by: me() }); bmpSave('eqc'); logAct({ id: e.leadId || 0, co: e.co, name: e.name }, 'EQC', 'Enquiry ' + EQC_STATUS[st][0], reason); if (st === 'WON' && !BMP.clients.find(c => c.co.toLowerCase() === e.co.toLowerCase())) { if (confirm('Won! Add ' + e.co + ' to Clients ★ so the corridor, references and OTD report start?')) bmpClientAdd({ co: e.co, name: e.name, mob: e.mob, leadId: e.leadId, monthlyRev: Math.round(e.value / 12) }); } render(); bmpEqcDrawer(id); };
  window.bmpEqcDelete = function (id) { if (!confirm('Delete this enquiry?')) return; BMP.eqc = BMP.eqc.filter(x => x.id !== id); bmpSave('eqc'); closeDrawer(); render(); };
  window.bmpEqcToRfq = function (id) { const e = BMP.eqc.find(x => x.id === id); const rid = DB.rfq.length ? Math.max(...DB.rfq.map(r => r.id)) + 1 : 1; const r = { id: rid, leadId: e.leadId || null, co: e.co, contactName: e.name, mob: e.mob || '', em: '', type: (+e.value || 0) > 5000000 ? 'large' : 'small', channel: '', fileStored: '', fileName: '', subject: '', message: '', status: 'NEW_ENQUIRY', sentDate: '', sentAt: 0, followUps: [], nextFollowupDate: '', lastFollowupDate: '', reason: '', closedDate: '', assignedTo: me(), createdBy: me(), createdAt: Date.now(), eqcId: e.id }; LIVE_RFQ.push(r); if (typeof applyDataMode === 'function') applyDataMode(); saveDB('rfq'); toast('Added to RFQ tracker'); openRfqDrawer(rid); };
  window.bmpEqcExport = function () { const cols = ['dt', 'co', 'name', 'mob', 'src', 'from', 'to', 'veh', 'qty', 'target', 'rate', 'value', 'status', 'nextDate', 'assignedTo', 'reason']; const csv = [cols.join(',')].concat(BMP.eqc.map(e => cols.map(k => '"' + String(e[k] ?? '').replace(/"/g, '""') + '"').join(','))).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'EQC-' + todayKey() + '.csv'; a.click(); };

  /* ================= 5. CLIENTS ★ · CORRIDOR · REFERENCES · SORRY CALLS ================= */
  function newClientId() { return BMP.clients.length ? Math.max(...BMP.clients.map(c => c.id)) + 1 : 1; }
  function rated() { return C.rateClients(BMP.clients, BMP.cfg.weights); }
  const stars = n => '<span class="bmp-star">' + '★'.repeat(n || 0) + '<span style="opacity:.28">' + '★'.repeat(5 - (n || 0)) + '</span></span>';
  function vClients() {
    const list = rated().filter(c => (!V.clQ || c.co.toLowerCase().includes(V.clQ.toLowerCase())) && (!V.clStar || (V.clStar === 'corridor' ? c.corridor : V.clStar === 'lapsed' ? c.lapsed : c.star === +V.clStar))).sort((a, b) => (b.star - a.star) || (b.score - a.score));
    const dist = [5, 4, 3, 2, 1].map(s => BMP.clients.filter(c => c.star === s).length);
    const wonLeads = DB.leads.filter(l => (l.status === 'WON' || l.stage === 8) && !BMP.clients.find(c => c.leadId === l.id || c.co.toLowerCase() === (l.co || '').toLowerCase()));
    const totalGP = BMP.clients.reduce((a, c) => a + (+c.monthlyRev || 0) * (+c.gpPct || 0) / 100, 0);
    const top = rated().slice().sort((a, b) => (b.monthlyRev * b.gpPct) - (a.monthlyRev * a.gpPct)); let acc = 0, n20 = 0; for (const c of top) { acc += (+c.monthlyRev || 0) * (+c.gpPct || 0) / 100; n20++; if (totalGP && acc >= totalGP * 0.8) break; }
    return '<h2 class="sec" style="margin-top:0">Clients ★ — rating, VIP corridor, references, sorry calls <small>"Good G.P + timely payment = good client" (W15 p.257)</small></h2>' +
      '<div class="bmp-kpis">' + kpi('Clients', BMP.clients.length, 'rated', '', '') + kpi('5★ / 4★', dist[0] + ' / ' + dist[1], 'rocket customers', '', '', 'teal') + kpi('Corridor', BMP.clients.filter(c => c.corridor).length, 'ambulance lane', '+' + (BMP.cfg.corridorPremiumPct || 0) + '% premium', '') + kpi('80% of G.P', totalGP ? n20 + ' clients' : '—', 'come from', totalGP ? Math.round(n20 / BMP.clients.length * 100) + '% of the book' : 'add ₹/month and G.P%', '', 'amber') + kpi('Refs', BMP.clients.reduce((a, c) => a + (c.refs || []).filter(r => r.name).length, 0), 'names collected', BMP.clients.reduce((a, c) => a + (c.refs || []).filter(r => r.status === 'converted').length, 0) + ' converted', '') + kpi('Lapsed', BMP.clients.filter(c => c.lapsed).length, 'sorry-call list', BMP.clients.filter(c => c.lapsed && c.sorryCallAt).length + ' called', '', 'red') + '</div>' +
      '<div class="toolrow">' + stPill('All', !V.clStar, 'BMPV.clStar=\'\';render()') + [5, 4, 3, 2, 1].map(s => stPill(s + '★ ' + dist[5 - s], V.clStar === String(s), 'BMPV.clStar=\'' + s + '\';render()')).join('') + stPill('Corridor', V.clStar === 'corridor', 'BMPV.clStar=\'corridor\';render()') + stPill('Lapsed', V.clStar === 'lapsed', 'BMPV.clStar=\'lapsed\';render()') +
      '<input placeholder="Search client…" value="' + esc(V.clQ) + '" oninput="BMPV.clQ=this.value;render()">' +
      '<button class="btn" onclick="bmpClientAddPrompt()">➕ Add client</button>' + (wonLeads.length ? '<button class="btn sm ghost" onclick="bmpPullWon()">⬇ Pull ' + wonLeads.length + ' WON lead(s)</button>' : '') + '</div>' +
      '<table class="bmp-tbl"><thead><tr><th>Client</th><th>Owner</th><th class="bmp-num">Pay days</th><th class="bmp-num">₹ / month</th><th class="bmp-num">G.P %</th><th class="bmp-num">Score</th><th>Stars</th><th>Corridor</th><th>Refs</th><th>Deck</th><th>OTD rpt</th><th>Visit</th></tr></thead><tbody>' +
      list.map(c => '<tr class="lead" onclick="bmpClientDrawer(' + c.id + ')"><td><b>' + esc(c.co) + '</b>' + (c.lapsed ? ' <span class="st" style="background:var(--bad);color:var(--red)">LAPSED</span>' : '') + '<br><small style="color:var(--slate)">' + esc(c.name || '') + '</small></td><td>' + esc(c.owner || c.assignedTo || '') + '</td><td class="bmp-num">' + (c.payDays || '—') + '</td><td class="bmp-num">' + (c.monthlyRev ? inr(c.monthlyRev) : '—') + '</td><td class="bmp-num">' + (c.gpPct ? c.gpPct + '%' : '—') + '</td><td class="bmp-num">' + (c.score ?? '—') + '</td><td>' + stars(c.star) + (c.starOverride ? ' <small title="manual override">✎</small>' : '') + '</td><td>' + (c.corridor ? '🚑 ' + esc(c.crm || '') : '—') + '</td><td>' + (c.refs || []).filter(r => r.name).length + '/5</td><td>' + (c.deckShownAt ? fmtD(c.deckShownAt) : '<span class="bmp-red">—</span>') + '</td><td>' + (c.otdReportAt ? fmtD(c.otdReportAt) : '—') + '</td><td>' + (c.lastVisit ? fmtD(c.lastVisit) : '—') + '</td></tr>').join('') +
      '</tbody></table>' + (!list.length ? '<div class="empty">No clients yet. Add your top 20 by hand or pull the WON leads.</div>' : '') +
      '<div class="bmp-rule"><b>Scoring:</b> payment days ' + BMP.cfg.weights.pay + '% · volume ' + BMP.cfg.weights.vol + '% · G.P ' + BMP.cfg.weights.gp + '% (W19 p.324), ranked against each other → 1–5★. <b>5★ = Ambulance Lane:</b> reserved capacity, dedicated CRM, published transit time, +' + (BMP.cfg.corridorPremiumPct || 0) + '% premium (W17 p.298, W20 p.332). Say goodbye to 1★–2★ or re-price them (W15 p.257). Every old customer has a 3× appetite (W24 p.391). <span class="bmp-ref">W15 p.257–267 · W16 p.273 · W27 p.434</span></div>';
  }
  function bmpClientAdd(o) { const c = { id: newClientId(), co: o.co || '', name: o.name || '', mob: o.mob || '', leadId: o.leadId || null, owner: o.owner || me(), assignedTo: o.owner || me(), payDays: o.payDays || 0, monthlyRev: o.monthlyRev || 0, gpPct: o.gpPct || 0, starOverride: 0, corridor: false, crm: '', refs: [{}, {}, {}, {}, {}], deckShownAt: '', otdReportAt: '', lastVisit: '', refsAskedAt: '', sorryCallAt: '', lapsed: !!o.lapsed, notes: o.notes || '', createdAt: Date.now() }; BMP.clients.push(c); bmpSave('clients'); return c; }
  window.bmpClientAdd = bmpClientAdd;
  window.bmpClientAddPrompt = function () { const co = prompt('Client company name'); if (!co) return; const c = bmpClientAdd({ co }); render(); bmpClientDrawer(c.id); };
  window.bmpPullWon = function () { let n = 0; DB.leads.filter(l => (l.status === 'WON' || l.stage === 8) && !BMP.clients.find(c => c.leadId === l.id || c.co.toLowerCase() === (l.co || '').toLowerCase())).forEach(l => { bmpClientAdd({ co: l.co, name: l.name, mob: l.mob, leadId: l.id, owner: l.assignedTo || me(), monthlyRev: l.value ? Math.round(l.value / 12) : 0 }); n++; }); toast(n + ' client(s) added'); render(); };
  window.bmpClientDrawer = function (id) {
    rated(); const c = BMP.clients.find(x => x.id === id); if (!c) return; const dr = $('#drawer'); dr.classList.add('open');
    const S = BMP.cfg.scripts; const refs = c.refs || [];
    dr.innerHTML = '<div class="dhead" style="position:relative"><button class="x" onclick="closeDrawer()">✕</button><h3>' + esc(c.co) + '</h3><p>' + esc(c.name || '') + ' · ' + esc(c.mob || '—') + ' · owner ' + esc(c.owner || '') + '</p><p style="margin-top:6px">' + stars(c.star) + ' &nbsp; score ' + (c.score ?? '—') + (c.corridor ? ' &nbsp; 🚑 Ambulance Lane' : '') + (c.lapsed ? ' &nbsp; <span class="st" style="background:var(--bad);color:var(--red)">LAPSED</span>' : '') + '</p></div><div class="dbody">' +
      '<div class="frow"><label>📊 Rating inputs (60 / 30 / 10)</label><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px"><input type="number" placeholder="Payment days" value="' + (c.payDays || '') + '" onchange="bmpClientSet(' + id + ',\'payDays\',+this.value)"><input type="number" placeholder="₹ per month" value="' + (c.monthlyRev || '') + '" onchange="bmpClientSet(' + id + ',\'monthlyRev\',+this.value)"><input type="number" placeholder="G.P %" value="' + (c.gpPct || '') + '" onchange="bmpClientSet(' + id + ',\'gpPct\',+this.value)"></div>' +
      '<div style="margin-top:6px" class="note">Auto: ' + stars(c.starAuto) + ' · override: ' + [0, 1, 2, 3, 4, 5].map(s => '<span class="pill ' + ((c.starOverride || 0) === s ? 'on' : '') + '" onclick="bmpClientSet(' + id + ',\'starOverride\',' + s + ')">' + (s ? s + '★' : 'auto') + '</span>').join('') + '</div></div>' +
      '<div class="frow"><label>🚑 VIP corridor / ambulance lane</label><span class="pill ' + (c.corridor ? 'on' : '') + '" onclick="bmpClientSet(' + id + ',\'corridor\',' + !c.corridor + ')">Corridor ' + (c.corridor ? 'ON' : 'off') + '</span> <input placeholder="Dedicated CRM name" value="' + esc(c.crm || '') + '" onchange="bmpClientSet(' + id + ',\'crm\',this.value)" style="width:200px"><div class="note">Reserved capacity from the 20% buffer, published transit, +' + (BMP.cfg.corridorPremiumPct || 0) + '% premium, monthly OTD report. Separate CRM → stickiness + references (W20 p.332).</div></div>' +
      '<div class="frow"><label>📕 Deck · report · visit · sorry call</label><div style="display:flex;gap:6px;flex-wrap:wrap">' +
      '<button class="btn sm ghost" onclick="bmpClientStamp(' + id + ',\'deckShownAt\',\'DECK\',\'Sales Deck shown\')">📕 Deck shown ' + (c.deckShownAt ? '(' + fmtD(c.deckShownAt) + ')' : '') + '</button>' +
      '<button class="btn sm ghost" onclick="bmpClientStamp(' + id + ',\'otdReportAt\',\'EMAIL\',\'OTD report sent\')">📈 OTD report sent ' + (c.otdReportAt ? '(' + fmtD(c.otdReportAt) + ')' : '') + '</button>' +
      '<button class="btn sm ghost" onclick="bmpClientStamp(' + id + ',\'lastVisit\',\'MEETING\',\'Client visit\')">🤝 Visited ' + (c.lastVisit ? '(' + fmtD(c.lastVisit) + ')' : '') + '</button>' +
      '<button class="btn sm ghost" onclick="bmpClientStamp(' + id + ',\'sorryCallAt\',\'SORRY\',\'Sorry call\')">🙏 Sorry call done ' + (c.sorryCallAt ? '(' + fmtD(c.sorryCallAt) + ')' : '') + '</button>' +
      '<span class="pill ' + (c.lapsed ? 'on' : '') + '" onclick="bmpClientSet(' + id + ',\'lapsed\',' + !c.lapsed + ')">Lapsed client</span></div></div>' +
      (c.lapsed && !c.sorryCallAt ? '<div class="frow"><label>Sorry-call script</label><div class="bmp-script">' + esc(fill(S.sorry)) + '</div></div>' : '') +
      '<div class="frow"><label>🔗 Reference engine — 5 names, face to face (W12 p.224)</label>' +
      [0, 1, 2, 3, 4].map(i => { const r = refs[i] || {}; return '<div class="bmp-inline" style="display:grid;grid-template-columns:1.2fr 1.2fr 1fr .9fr;gap:4px;margin-bottom:4px"><input placeholder="Name" value="' + esc(r.name || '') + '" onchange="bmpRefSet(' + id + ',' + i + ',\'name\',this.value)"><input placeholder="Company" value="' + esc(r.co || '') + '" onchange="bmpRefSet(' + id + ',' + i + ',\'co\',this.value)"><input placeholder="Mobile" value="' + esc(r.mob || '') + '" onchange="bmpRefSet(' + id + ',' + i + ',\'mob\',this.value)"><select onchange="bmpRefSet(' + id + ',' + i + ',\'status\',this.value)">' + ['', 'to call', 'met', 'converted', 'declined'].map(s => '<option ' + ((r.status || '') === s ? 'selected' : '') + '>' + s + '</option>').join('') + '</select></div>'; }).join('') +
      '<div style="display:flex;gap:6px;align-items:center;margin-top:4px"><button class="btn sm ghost" onclick="bmpClientStamp(' + id + ',\'refsAskedAt\',\'REF\',\'References asked\')">Asked ' + (c.refsAskedAt ? fmtD(c.refsAskedAt) : '— not yet') + '</button><button class="btn sm ghost" onclick="bmpRefsToLeads(' + id + ')">➕ Add named refs as leads</button></div>' +
      '<details style="margin-top:6px"><summary class="note" style="cursor:pointer">De-risk script</summary><div class="bmp-script">' + esc(fill(S.reference)) + '</div></details></div>' +
      bmpClientGcPanel(c) +
      '<div class="frow"><label>Notes</label><textarea rows="2" onchange="bmpClientSet(' + id + ',\'notes\',this.value)">' + esc(c.notes || '') + '</textarea></div>' +
      '<div class="frow">' + (c.leadId ? '<button class="btn sm ghost" onclick="openDrawer(' + c.leadId + ')">Open lead cockpit</button> ' : '') + '<button class="btn sm ghost" style="color:var(--red)" onclick="bmpClientDelete(' + id + ')">🗑 Remove</button></div></div>';
  };
  /* ---- ASMP Golden Circle panel inside the client card ---- */
  function bmpClientGcPanel(c) {
    const id = c.id; const r = C.rcScore(c, BMP.cfg.rc); const gap = C.walletGap(c); const share = +c.spendTotal ? Math.round((+c.monthlyRev || 0) / +c.spendTotal * 100) : null;
    const auto = C.rcAuto({ ...c, rcFlags: {} }, BMP.cfg.rc);
    return '<div class="frow" style="border:1px solid var(--line);border-radius:8px;padding:10px;background:#FBF9F9"><label>🚀 Rocket Client — ' + r.n + '/8 flags ' + (r.isRC ? '<span class="st" style="background:#1E7A4C;color:#fff">R.C</span>' : '') + '</label>' +
      '<div>' + C.RC_FLAGS.map(([k, l]) => '<span class="bmp-flag ' + (r.flags[k] ? 'on' : '') + '" title="' + (auto[k] !== undefined ? 'auto from rating inputs — tap to override' : 'tap to toggle') + '" onclick="bmpClientFlag(' + id + ',\'rcFlags\',\'' + k + '\')">' + l + (auto[k] !== undefined && (c.rcFlags || {})[k] === undefined ? ' <small>auto</small>' : '') + '</span>').join('') + '</div>' +
      '<div class="note" style="margin-top:4px">Decision: ' + [['', 'by flags'], ['Y', 'R.C — yes'], ['N', 'not R.C']].map(([k, l]) => '<span class="pill ' + ((c.rcOverride || '') === k ? 'on' : '') + '" onclick="bmpClientSet(' + id + ',\'rcOverride\',\'' + k + '\')">' + l + '</span>').join('') + '</div></div>' +
      '<div class="frow" style="border:1px solid var(--line);border-radius:8px;padding:10px;background:#FBF9F9"><label>⚫ Black Circle ' + (C.isBlackCircle(c) ? '<span class="st" style="background:var(--bad);color:var(--red)">B.C</span>' : '') + '</label>' +
      '<div>' + C.BC_FLAGS.map(([k, l]) => '<span class="bmp-flag bc ' + ((c.bcFlags || {})[k] ? 'on' : '') + '" onclick="bmpClientFlag(' + id + ',\'bcFlags\',\'' + k + '\')">' + l + '</span>').join('') + '</div>' +
      (C.isBlackCircle(c) ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px"><select onchange="bmpClientSet(' + id + ',\'bccAction\',this.value)"><option value="">B.C.C — decide…</option>' + Object.entries(C.BCC_ACTIONS).map(([k, l]) => '<option value="' + k + '" ' + (c.bccAction === k ? 'selected' : '') + '>' + l + '</option>').join('') + '</select><input placeholder="e.g. +8% from 1 Nov, 50% advance" value="' + esc(c.bccNote || '') + '" onchange="bmpClientSet(' + id + ',\'bccNote\',this.value)"></div><div style="margin-top:6px"><button class="btn sm ghost" onclick="bmpClientStamp(' + id + ',\'bccDoneAt\',\'PC\',\'B.C.C applied\')">✔ Correction applied ' + (c.bccDoneAt ? '(' + fmtD(c.bccDoneAt) + ')' : '') + '</button> <span class="note">re-price / advance / say no — in batches of 3–5 (ASMP)</span></div>' : '<div class="note">Tick a reason to put this client in the Black Circle.</div>') + '</div>' +
      '<div class="frow" style="border:1px solid var(--line);border-radius:8px;padding:10px;background:#FBF9F9"><label>🥧 Wallet share · N.B.D of C.R.R ' + (share !== null ? '<b>' + share + '%</b> ours · gap <b class="bmp-red">' + inr(gap) + '/mo</b>' : '') + '</label>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><input type="number" placeholder="Their TOTAL freight ₹ / month (all vendors)" value="' + (c.spendTotal || '') + '" onchange="bmpClientSet(' + id + ',\'spendTotal\',+this.value)"><input placeholder="Competitors they use" value="' + esc(c.competitors || '') + '" onchange="bmpClientSet(' + id + ',\'competitors\',this.value)"><input placeholder="Lanes / plants / services NOT with us" value="' + esc(c.lanesNot || '') + '" onchange="bmpClientSet(' + id + ',\'lanesNot\',this.value)" style="grid-column:span 2"></div>' +
      '<div style="margin-top:6px"><button class="btn sm ghost" onclick="bmpClientStamp(' + id + ',\'nbdCrrAt\',\'MEETING\',\'N.B.D of C.R.R pitch — upsell / cross-sell\')">🎯 Upsell pitch made ' + (c.nbdCrrAt ? '(' + fmtD(c.nbdCrrAt) + ')' : '') + '</button> <span class="note">S.C fixes the Zoom; ask for the lanes they give to others. Handover script in the Playbook.</span></div></div>';
  }
  window.bmpClientFlag = function (id, group, k) { const c = BMP.clients.find(x => x.id === id); c[group] = c[group] || {}; const cur = c[group][k]; if (group === 'rcFlags') { const auto = C.rcAuto({ ...c, rcFlags: {} }, BMP.cfg.rc); const eff = cur !== undefined ? cur : auto[k]; c[group][k] = !eff; } else c[group][k] = !cur; bmpSave('clients'); render(); bmpClientDrawer(id); };
  window.bmpClientSet = function (id, k, v) { const c = BMP.clients.find(x => x.id === id); c[k] = v; bmpSave('clients'); render(); bmpClientDrawer(id); };
  window.bmpClientStamp = function (id, k, ch, ty) { const c = BMP.clients.find(x => x.id === id); c[k] = todayKey(); bmpSave('clients'); logAct({ id: c.leadId || 0, co: c.co, name: c.name || '' }, ch, ty, ''); toast(ty + ' ✓'); render(); bmpClientDrawer(id); };
  window.bmpRefSet = function (id, i, k, v) { const c = BMP.clients.find(x => x.id === id); c.refs = c.refs || [{}, {}, {}, {}, {}]; c.refs[i] = { ...(c.refs[i] || {}), [k]: v }; bmpSave('clients'); };
  window.bmpRefsToLeads = function (id) { const c = BMP.clients.find(x => x.id === id); let n = 0; (c.refs || []).forEach(r => { if (!r.name || r.leadId) return; const nid = LIVE_LEADS.length ? Math.max(...LIVE_LEADS.map(l => l.id)) + 1 : 1; LIVE_LEADS.push({ id: nid, camp: 'Reference — ' + c.co, co: r.co || '', name: r.name, desig: '', loc: '', mob: r.mob || '', em: '', sat: false, hist: 'Referred by ' + c.co + (c.name ? ' (' + c.name + ')' : ''), status: 'FRESH', outcome: '', remarks: '', nextDate: '', lastCall: '', src: 'manual', feb: 'E', assignedTo: c.owner || me() }); r.leadId = nid; n++; }); if (typeof applyDataMode === 'function') applyDataMode(); saveDB('leads'); bmpSave('clients'); toast(n + ' referral lead(s) created — tagged Easiest sale'); render(); };
  window.bmpClientDelete = function (id) { if (!confirm('Remove this client from the ★ list?')) return; BMP.clients = BMP.clients.filter(x => x.id !== id); bmpSave('clients'); closeDrawer(); render(); };

  /* ================= 6. SALES DECK & PLAYBOOK ================= */
  function vDeck() {
    const D = BMP.cfg.deck, S = BMP.cfg.scripts; const shown = DB.activity.filter(a => a.ch === 'DECK').length;
    const ed = IS_ADMIN;
    const sub = '<div class="toolrow">' + [['deck', '📕 Deck & scripts'], ['obj', '🛡 Objection handling'], ['tools', '🧰 Sales tools · Marketing Engine']].map(([k, l]) => stPill(l, V.deckTab === k, 'BMPV.deckTab=\'' + k + '\';render()')).join('') + '</div>';
    if (V.deckTab === 'obj') return '<h2 class="sec" style="margin-top:0">Objection handling <small>"One of the most neglected and critical steps. This alone increases profits by 30%." (ASMP P.O.S.T)</small></h2>' + sub + vObjections(ed);
    if (V.deckTab === 'tools') return '<h2 class="sec" style="margin-top:0">Sales tools · Marketing Engine <small>"Stop selling — start order booking. The sale is done before the first call." (ASMP)</small></h2>' + sub + vTools(ed);
    return '<h2 class="sec" style="margin-top:0">The Magical Sales Deck <small>P · I · S · A · T — show, don\'t tell. Hard copy, bound, your visiting card (W21 p.347–349, W23 p.367, W26 p.414)</small></h2>' + sub +
      '<div class="grid2"><div>' +
      '<div class="card" style="margin-bottom:12px"><div class="frow"><label>Deck title</label><input value="' + esc(D.title) + '" ' + (ed ? 'onchange="bmpDeckSet(\'title\',this.value)"' : 'readonly') + '></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" onclick="bmpDeckPdf()">📕 Generate deck PDF</button>' + (ed ? '<button class="btn sm ghost" onclick="bmpDeckAddPage()">➕ Add page</button><button class="btn sm ghost" onclick="bmpDeckReset()">↺ Reset to BRL defaults</button>' : '') + '</div><div id="deckBox" class="note" style="margin-top:8px"></div>' +
      '<div class="note" style="margin-top:6px">Shown ' + shown + ' time(s) so far. RJ: colour print, glossy binding, let the client hold it; live Google Sheet links beside each page; 15–20 minutes of correction after every showing (W29 p.469).</div></div>' +
      D.pages.map((pg, i) => '<div class="bmp-deckpage"><div style="display:flex;justify-content:space-between"><span class="k">Page ' + (i + 1) + '</span>' + (ed ? '<span class="pill" onclick="bmpDeckDel(' + i + ')">✕</span>' : '') + '</div>' +
        '<div class="k" style="color:var(--red)">P · Problem</div><textarea rows="2" ' + (ed ? 'onchange="bmpDeckPage(' + i + ',\'p\',this.value)"' : 'readonly') + '>' + esc(pg.p) + '</textarea>' +
        '<div class="k" style="color:#C48A2E">I · Impact — sell the loss</div><textarea rows="2" ' + (ed ? 'onchange="bmpDeckPage(' + i + ',\'i\',this.value)"' : 'readonly') + '>' + esc(pg.i) + '</textarea>' +
        '<div class="k" style="color:#0F766E">S · Solution — the system</div><textarea rows="2" ' + (ed ? 'onchange="bmpDeckPage(' + i + ',\'s\',this.value)"' : 'readonly') + '>' + esc(pg.s) + '</textarea>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><input placeholder="System shown (screenshot name)" value="' + esc(pg.sys || '') + '" ' + (ed ? 'onchange="bmpDeckPage(' + i + ',\'sys\',this.value)"' : 'readonly') + '><input placeholder="Live sheet / dashboard link" value="' + esc(pg.link || '') + '" ' + (ed ? 'onchange="bmpDeckPage(' + i + ',\'link\',this.value)"' : 'readonly') + '></div></div>').join('') +
      '<div class="card"><h3>A · Authority</h3><textarea rows="4" style="width:100%" ' + (ed ? 'onchange="bmpDeckSet(\'authority\',this.value.split(\'\\n\').filter(Boolean))"' : 'readonly') + '>' + esc((D.authority || []).join('\n')) + '</textarea><h3 style="margin-top:10px">T · Trust</h3><textarea rows="4" style="width:100%" ' + (ed ? 'onchange="bmpDeckSet(\'trust\',this.value.split(\'\\n\').filter(Boolean))"' : 'readonly') + '>' + esc((D.trust || []).join('\n')) + '</textarea><div class="note">One line each. Authority = results, clients, numbers. Trust = the OTD report, live sheets, "you pay / I pay / cash back" (W23 p.368).</div></div>' +
      '</div><div>' +
      script('🙏 Sorry call — ask in odd minutes', 'sorry', S.sorry, ed) + script('🔗 Reference — de-risk the referrer', 'reference', S.reference, ed) + script('⏱ The 7-minute ask (WhatsApp)', 'ask7', S.ask7, ed) + script('🎯 Discovery — Stab & Twist, 4–5 questions', 'discovery', S.discovery, ed) + script('🛑 Science of Denial — no discount, no credit', 'denial', S.denial, ed) + script('🤝 Negotiation prep (BATNA / ZOPA)', 'nego', S.nego, ed) + script('⚡ F.E.B — Fastest · Easiest · Biggest', 'feb', S.feb, ed) + script('📜 Pitch rules', 'pitchRules', S.pitchRules, ed) +
      '<div class="bmp-rule" style="margin-top:14px"><b>ASMP — the S.C runs the engine, the salesperson only meets and converts</b></div>' +
      script('☎️ Tele-caller — qualify, don\'t sell', 'qualify', S.qualify || DEFAULT_SCRIPTS.qualify, ed) + script('✅ S.C verification call — same day as the meeting', 'verify', S.verify || DEFAULT_SCRIPTS.verify, ed) + script('🔁 N.B.D → C.R.M handover', 'handover', S.handover || DEFAULT_SCRIPTS.handover, ed) + script('🎙 Client interview — why start, why stay, why leave', 'interview', S.interview || DEFAULT_SCRIPTS.interview, ed) +
      '</div></div>';
  }
  /* ---- ASMP: objection library — each hit logged from the lead cockpit ---- */
  function vObjections(ed) {
    const O = BMP.cfg.objections || []; const hits = {}; DB.activity.forEach(a => { if (a.ch === 'OBJ') hits[a.ty] = (hits[a.ty] || 0) + 1; });
    const list = O.map((o, i) => ({ ...o, i, hits: hits[o.o] || 0 })).sort((a, b) => b.hits - a.hits);
    return '<div class="grid2"><div>' + list.map(o => '<div class="bmp-obj"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div class="o">“' + esc(o.o) + '”</div><div style="white-space:nowrap"><span class="bmp-chip ' + (o.hits ? 'r' : '') + '">' + o.hits + ' hit' + (o.hits === 1 ? '' : 's') + '</span> <button class="btn sm ghost" onclick="navigator.clipboard.writeText(' + JSON.stringify(o.a).replace(/"/g, '&quot;') + ').then(()=>toast(\'Copied ✓\'))">Copy</button>' + (ed ? ' <span class="pill" onclick="bmpObjDel(' + o.i + ')">✕</span>' : '') + '</div></div>' +
      (ed ? '<textarea rows="3" style="width:100%;font-size:12px;margin-top:4px" onchange="bmpObjSet(' + o.i + ',\'a\',this.value)">' + esc(o.a) + '</textarea><input placeholder="Video link (objection-handling video)" value="' + esc(o.video || '') + '" style="width:100%;margin-top:4px" onchange="bmpObjSet(' + o.i + ',\'video\',this.value)">' : '<div class="a">' + esc(o.a) + '</div>' + (o.video ? '<a href="' + esc(o.video) + '" target="_blank" class="note">▶ video</a>' : '')) + '</div>').join('') +
      (ed ? '<div class="card"><div style="display:flex;gap:6px"><input id="obj_new" placeholder="New objection the client raised…" style="flex:1"><button class="btn sm" onclick="bmpObjAdd()">➕ Add</button></div></div>' : '') + '</div>' +
      '<div><div class="card"><h3>How to use</h3><div class="note">• Every objection heard on a call is logged from the lead cockpit (🛡 Objection heard) — the count sorts the list, so the FAQ writes itself.<br>• "Establish his concerns — you will see the FAQs are not too many, and you can create all the answers together. Create the pitch for every objection and make their videos."<br>• Reconfirm before answering: <i>"As I understand, your concern is … — please correct me if I got it wrong or missed something."</i><br>• Sales training = pitch + objection handling + features → benefits. New rep: 3–5 day induction, a recorded mock pitch, then a test before going live. Re-training when the funnel M.I.S drops at a stage (see Funnel tab).<br>• Objections are P.O.S.T for the bottleneck stage — Pitch, Objection handling, Sales tools, Training.</div></div>' +
      '<div class="card"><h3>Sell to sales first</h3><div class="note">The rep has to believe the pitch, not learn it. Show him the OTD reports, the client interviews, the deck — "when the client says we are the best, when other salespeople tell him". A pitch he does not believe he will never convey. (ASMP Training)</div></div></div></div>';
  }
  window.bmpObjAdd = function () { const v = ($('#obj_new').value || '').trim(); if (!v) return; BMP.cfg.objections = BMP.cfg.objections || []; BMP.cfg.objections.push({ o: v, a: '' }); bmpSave('cfg'); render(); };
  window.bmpObjSet = function (i, k, v) { BMP.cfg.objections[i][k] = v; bmpSave('cfg'); };
  window.bmpObjDel = function (i) { if (!confirm('Remove this objection?')) return; BMP.cfg.objections.splice(i, 1); bmpSave('cfg'); render(); };
  /* ---- ASMP: sales tools checklist — Marketing Engine readiness ---- */
  function vTools(ed) {
    const T = BMP.cfg.tools || {}; const done = DEFAULT_TOOLS.filter(([k]) => (T[k] || {}).done).length; const pct = Math.round(done / DEFAULT_TOOLS.length * 100);
    return '<div class="grid2"><div class="card"><h3>Marketing Engine readiness — RJ\'s 12 collaterals + the deck <b style="float:right">' + done + ' / ' + DEFAULT_TOOLS.length + '</b></h3><div class="bmp-meter"><i style="width:' + pct + '%"></i></div>' +
      '<table class="bmp-tbl" style="margin-top:10px"><tbody>' + DEFAULT_TOOLS.map(([k, l]) => { const t = T[k] || {}; return '<tr><td style="width:28px"><span class="bmp-flag ' + (t.done ? 'on' : '') + '" ' + (ed ? 'onclick="bmpToolToggle(\'' + k + '\')"' : '') + '>' + (t.done ? '✓' : '·') + '</span></td><td><b>' + l + '</b>' + (t.link ? '<br><a href="' + esc(t.link) + '" target="_blank" class="note">' + esc(t.link) + '</a>' : '') + '</td><td>' + (ed ? '<input placeholder="Drive / YouTube link" value="' + esc(t.link || '') + '" onchange="bmpToolLink(\'' + k + '\',this.value)" style="width:100%">' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div><div class="card"><h3>Why this list</h3><div class="note">"Drip marketing — close the sale before the first call." Educational videos make you the expert before the meeting; the competition-using-us list is "a killer"; testimonials by industry; the brochure and sales kit show the systems (flowcharts, checklists, M.I.S screenshots) — <b>don\'t tell what you can show</b>. Pull marketing, not push: the client should be ready to buy before the first conversation (S.I.D.B.C).</div></div>' +
      '<div class="card"><h3>Hire the engine, not more salespeople</h3><div class="note">ASMP: a Sales Trainer, a Sales Auditor (listens to calls, flags re-training), a content writer, a video editor, a graphic designer and a dedicated recruiter. S.S.G — one person can cover two pillars to start. The rep is never the lead generator, never the collateral maker, never the follow-up desk.</div></div></div></div>';
  }
  window.bmpToolToggle = function (k) { BMP.cfg.tools = BMP.cfg.tools || {}; BMP.cfg.tools[k] = { ...(BMP.cfg.tools[k] || {}), done: !(BMP.cfg.tools[k] || {}).done, at: todayKey() }; bmpSave('cfg'); render(); };
  window.bmpToolLink = function (k, v) { BMP.cfg.tools = BMP.cfg.tools || {}; BMP.cfg.tools[k] = { ...(BMP.cfg.tools[k] || {}), link: v }; bmpSave('cfg'); };
  function script(t, k, v, ed) { return '<div class="card" style="margin-bottom:10px"><h3 style="display:flex;justify-content:space-between;align-items:center">' + t + '<button class="btn sm ghost" onclick="navigator.clipboard.writeText(' + JSON.stringify(fill(v)).replace(/"/g, '&quot;') + ').then(()=>toast(\'Copied ✓\'))">Copy</button></h3>' + (ed ? '<textarea rows="5" style="width:100%;font-size:12.5px" onchange="bmpScriptSet(\'' + k + '\',this.value)">' + esc(v) + '</textarea>' : '<div class="bmp-script">' + esc(fill(v)) + '</div>') + '</div>'; }
  window.bmpDeckSet = function (k, v) { BMP.cfg.deck[k] = v; bmpSave('cfg'); };
  window.bmpDeckPage = function (i, k, v) { BMP.cfg.deck.pages[i][k] = v; bmpSave('cfg'); };
  window.bmpDeckAddPage = function () { BMP.cfg.deck.pages.push({ p: '', i: '', s: '', sys: '', link: '' }); bmpSave('cfg'); render(); };
  window.bmpDeckDel = function (i) { if (!confirm('Remove page ' + (i + 1) + '?')) return; BMP.cfg.deck.pages.splice(i, 1); bmpSave('cfg'); render(); };
  window.bmpDeckReset = function () { if (!confirm('Replace the deck with the BRL default pages?')) return; BMP.cfg.deck = JSON.parse(JSON.stringify(DEFAULT_DECK)); bmpSave('cfg'); render(); };
  window.bmpScriptSet = function (k, v) { BMP.cfg.scripts[k] = v; bmpSave('cfg'); };
  window.bmpDeckPdf = async function (co) {
    const box = $('#deckBox') || $('#pdfBox'); if (box) box.textContent = 'Generating…';
    try { const r = await fetch('/api/deck-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deck: BMP.cfg.deck, co: co || '' }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error || 'failed'); const url = location.origin + j.url; if (box) box.innerHTML = '✅ <a href="' + url + '" target="_blank">Open deck PDF</a> · <button class="btn sm ghost" onclick="navigator.clipboard.writeText(\'' + url + '\').then(()=>toast(\'Link copied\'))">Copy link</button>'; else window.open(url); } catch (e) { if (box) box.textContent = '⚠ ' + e.message; }
  };

  /* ================= 7. 5-FOR-5 PLAN & COMPOUNDING ================= */
  function vPlan() {
    const P = BMP.cfg.plan; const ed = IS_ADMIN;
    const R = { start: C.addDays(todayKey(), -29), end: todayKey() }; const m = C.meca(data(), R).team;
    const cur = { leads: m.leads, cr: m.conversion, avg: m.avgTicket, txn: m.won ? 1 : 0 };
    const fp = C.fiveParams(P), c11 = C.compound(P, 11), c20 = C.compound(P, 20);
    const levers = [['leads', 'No. of leads (enquiries)', 'Leads'], ['cr', 'Conversion ratio %', 'CR'], ['avg', 'Average ₹ sale (per transaction)', 'Avg'], ['txn', 'Transactions per client per year', 'Txn'], ['margin', 'Margin %', 'Margin']];
    const inp = (k, v) => ed ? '<input type="number" value="' + (v ?? '') + '" style="width:110px" onchange="bmpPlanSet(\'' + k + '\',+this.value)">' : '<b>' + (v ?? '—') + '</b>';
    const strat = k => ed ? '<input value="' + esc(P.strategies[k] || '') + '" placeholder="strategy" style="width:100%" onchange="bmpPlanStrat(\'' + k + '\',this.value)">' : esc(P.strategies[k] || '—');
    return '<h2 class="sec" style="margin-top:0">5 Parameters of Sales · 5-for-5 · Compounding <small>revenue = leads × conversion × average sale × transactions (W35 p.498–500)</small></h2>' +
      '<div class="grid2"><div class="card"><h3>Plan the year → ' + esc(P.year || FY) + '</h3>' +
      '<table class="bmp-tbl"><thead><tr><th>Parameter</th><th class="bmp-num">Last 30 days</th><th>Annual plan</th><th>Strategy (5-for-5)</th></tr></thead><tbody>' +
      '<tr><td>No. of leads</td><td class="bmp-num">' + cur.leads + '</td><td>' + inp('leads', P.leads) + '</td><td>' + strat('leads') + '</td></tr>' +
      '<tr><td>Conversion ratio %</td><td class="bmp-num">' + cur.cr + '%</td><td>' + inp('cr', P.cr) + '</td><td>' + strat('cr') + '</td></tr>' +
      '<tr><td>Average ₹ sale</td><td class="bmp-num">' + (cur.avg ? inr(cur.avg) : '—') + '</td><td>' + inp('avg', P.avg) + '</td><td>' + strat('avg') + '</td></tr>' +
      '<tr><td>Transactions / client / yr</td><td class="bmp-num">' + m.won + ' won</td><td>' + inp('txn', P.txn) + '</td><td>' + strat('txn') + '</td></tr>' +
      '<tr><td>Margin %</td><td class="bmp-num">—</td><td>' + inp('marginPct', P.marginPct) + '</td><td>' + strat('margin') + '</td></tr>' +
      '<tr style="background:var(--paper)"><td><b>Clients</b></td><td></td><td colspan="2"><b>' + fp.clients + '</b> = leads × CR</td></tr>' +
      '<tr style="background:var(--paper)"><td><b>Revenue</b></td><td class="bmp-num">' + inr(m.revenue) + '</td><td colspan="2"><b>' + inr(fp.revenue) + '</b>' + (fp.margin !== null ? ' · margin ' + inr(fp.margin) : '') + ' · weekly ' + inr(fp.revenue / 52) + '</td></tr>' +
      '</tbody></table>' +
      (ed ? '<div style="margin-top:8px"><button class="btn sm ghost" onclick="bmpPlanBase()">↗ Seed the plan from the last 90 days × 4</button> <span class="note">then edit each lever — RJ: plan the year, split into weekly targets (W33 p.486)</span></div>' : '') +
      '<div class="frow" style="margin-top:8px"><label>Focus lever for this 2-month block (Strategy of Compounding, W38 p.602)</label>' + levers.map(([k, , s]) => '<span class="pill ' + (P.focus === k ? 'on' : '') + '" ' + (ed ? 'onclick="bmpPlanSet(\'focus\',\'' + k + '\')"' : '') + '>' + s + '</span>').join('') + (ed ? ' <input type="date" value="' + (P.focusFrom || '') + '" onchange="bmpPlanSet(\'focusFrom\',this.value)">' : (P.focusFrom ? ' from ' + fmtD(P.focusFrom) : '')) + '<div class="note">Work one lever for two months, then the next. Result: 2× that lever in a year; 4× overall.</div></div></div>' +
      '<div class="card"><h3>Power of compounding</h3>' +
      '<table class="bmp-tbl"><thead><tr><th></th><th class="bmp-num">Plan</th><th class="bmp-num">+11% each</th><th class="bmp-num">+20% each</th></tr></thead><tbody>' +
      [['Leads', fp.leads, c11.leads, c20.leads], ['CR %', fp.cr, c11.cr, c20.cr], ['Clients', fp.clients, c11.clients, c20.clients], ['Average sale', fp.avg, c11.avg, c20.avg], ['Transactions', fp.txn, c11.txn, c20.txn]].map(r => '<tr><td>' + r[0] + '</td>' + r.slice(1).map(v => '<td class="bmp-num">' + (typeof v === 'number' ? (Math.round(v * 10) / 10).toLocaleString('en-IN') : v) + '</td>').join('') + '</tr>').join('') +
      '<tr style="background:var(--paper)"><td><b>Revenue</b></td><td class="bmp-num"><b>' + inr(fp.revenue) + '</b></td><td class="bmp-num"><b>' + inr(c11.revenue) + '</b><br><small class="bmp-green">' + (fp.revenue ? pct(Math.round((c11.revenue / fp.revenue - 1) * 100)) : '') + '</small></td><td class="bmp-num"><b>' + inr(c20.revenue) + '</b><br><small class="bmp-green">' + (fp.revenue ? pct(Math.round((c20.revenue / fp.revenue - 1) * 100)) : '') + '</small></td></tr></tbody></table>' +
      '<div class="note" style="margin-top:8px">RJ\'s worked example: 100 leads · 10% · ₹200 · 5 transactions = 10,000 → +11% on each lever = 15,181 (+52%) → +20% = 20,736 (2.07×). "Just take this sheet and do an O-O-O without phone; your mind will open up. GAME CHANGER." (W35 p.500)</div>' +
      '<div class="bmp-rule"><b>Monitoring cadence (W38 p.509):</b> 5 for 3 → 5 for 5 → 5 for 9, then the negative version. Gap analysis monthly; it changes every month. <b>Sales Auto-Pilot (W38 p.505):</b> Level 1 = S.C + O.S.R on existing clients (C.R.R) — here the S.C sells. Then N.B.D: 2 / 3 / 4 S.C + sales boys for incoming / repeat / outgoing — here only the sales boy sells. Owner never negotiates (W35 p.495).</div></div></div>' +
      vGap(ed);
  }
  /* ---- ASMP: profit planning / gap analysis → "do you know how many leads & clients you need monthly?" ---- */
  function vGap(ed) {
    const p = BMP.cfg.profit || {}; const g = C.gapAnalysis(p, BMP.cfg.plan, C.funnel(data()));
    const inp = (k, ph) => ed ? '<input type="number" value="' + (p[k] ?? '') + '" placeholder="' + ph + '" onchange="bmpProfitSet(\'' + k + '\',+this.value)">' : '<b>' + inr(p[k] || 0) + '</b>';
    const cr = (BMP.cfg.plan || {}).cr, avg = (BMP.cfg.plan || {}).avg, txn = (BMP.cfg.plan || {}).txn;
    return '<div class="card" style="margin-top:14px"><h3>Profit planning → the numbers we need <small class="note">gap analysis (ASMP): step 1 target the N.P · step 2 F.C +10% · step 3 new G.P = N.P + new F.C · step 4 new revenue = new G.P ÷ G.P%</small></h3>' +
      '<div class="grid2"><div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="frow"><label>Revenue (₹ / yr)</label>' + inp('revenue', '6500000000') + '</div><div class="frow"><label>Variable cost (₹ / yr)</label>' + inp('varCost', 'fuel, hire, driver, toll…') + '</div><div class="frow"><label>Fixed cost (₹ / yr)</label>' + inp('fixedCost', '') + '</div><div class="frow"><label>Target N.P ×</label>' + (ed ? '<select onchange="bmpProfitSet(\'targetX\',+this.value)">' + [1.5, 2, 3, 4].map(x => '<option value="' + x + '" ' + (+p.targetX === x ? 'selected' : '') + '>' + x + '× (' + (x === 2 ? 'D.Y.P' : x === 4 ? '4X' : x + 'X') + ')</option>').join('') + '</select>' : '<b>' + (p.targetX || 2) + '×</b>') + '</div></div>' +
      (g.rev ? '<table class="bmp-tbl" style="margin-top:6px"><tbody><tr><td>G.P today</td><td class="bmp-num">' + inr(g.gp) + ' · ' + g.gpPct + '%</td></tr><tr><td>N.P today</td><td class="bmp-num">' + inr(g.np) + '</td></tr><tr><td>Target N.P (' + g.x + '×)</td><td class="bmp-num"><b>' + inr(g.tNp) + '</b></td></tr><tr><td>F.C +' + (p.fcUpPct ?? 10) + '%</td><td class="bmp-num">' + inr(g.nFc) + '</td></tr><tr><td>New G.P needed</td><td class="bmp-num">' + inr(g.nGp) + '</td></tr><tr style="background:var(--paper)"><td><b>Revenue needed</b></td><td class="bmp-num"><b>' + inr(g.nRev) + '</b> <small class="bmp-green">' + pct(g.growthPct) + '</small></td></tr><tr style="background:var(--paper)"><td><b>New business to add</b> <small class="note">the gap — C.R.R keeps the rest</small></td><td class="bmp-num"><b class="bmp-red">' + inr(g.gapRev) + '</b> / yr · ' + inr(g.monthlyRev) + ' / mo</td></tr></tbody></table>' : '<div class="note" style="margin-top:6px">Enter revenue, variable and fixed cost. Books profit or cash-withdrawable profit — RJ: "target cash-withdrawable profit is the game changer; the rest is notional."</div>') + '</div>' +
      '<div>' + (g.rev && avg && cr ? '<div class="bmp-kpis" style="margin-top:0">' + kpi('Clients / month', g.clientsPerMonth, 'new', 'at ' + inr(avg) + ' × ' + txn + ' txn / yr', '', 'teal') + kpi('Leads / month', g.leadsPerMonth, 'needed', 'at ' + cr + '% conversion', '', 'amber') + kpi('Leads / week', g.leadsPerWeek, 'needed', '', '') + kpi('Meetings / week', g.meetingsPerWeek || '—', 'needed', g.meetingsPerWeek ? 'from the funnel\'s lead → meeting C.R' : 'needs 10+ leads in the funnel', '') + '</div>' : '<div class="note">Fill the annual plan on the left (conversion %, average ₹ sale, transactions) and the required clients, leads and meetings per week appear here.</div>') +
      '<div class="bmp-rule"><b>SING to 4X:</b> if the week is not met, how do you meet the month? If the month is not met, how do you meet the quarter? Work on one of the 9 parameters for 2–3 months, then put it on continuous improvement and move to the next. Review first and last Saturday of the month in an O.O.O; offsite after 12 weeks. "Forget the turnover — it changes every time the G.P% changes. The 4X profit is the first target of the company."</div></div></div></div>';
  }
  window.bmpProfitSet = function (k, v) { BMP.cfg.profit = BMP.cfg.profit || {}; BMP.cfg.profit[k] = v; bmpSave('cfg'); render(); };
  window.bmpPlanSet = function (k, v) { BMP.cfg.plan[k] = v; bmpSave('cfg'); render(); };
  window.bmpPlanBase = function () { const R = { start: C.addDays(todayKey(), -89), end: todayKey() }; const m = C.meca(data(), R).team; const P = BMP.cfg.plan; P.leads = Math.max(4, (m.leads || m.connected) * 4); P.cr = m.conversion || 10; P.avg = m.avgTicket || 0; P.txn = P.txn || 1; bmpSave('cfg'); render(); toast('Plan seeded from the last 90 days — now edit the levers'); };
  window.bmpPlanStrat = function (k, v) { BMP.cfg.plan.strategies[k] = v; bmpSave('cfg'); };

  /* ================= 8. SETUP (admin) ================= */
  function vSetup() {
    const c = BMP.cfg; const n = (k, l, note) => '<div class="frow"><label>' + l + '</label><input type="number" value="' + (c[k] ?? '') + '" onchange="bmpCfgSet(\'' + k + '\',+this.value)">' + (note ? '<div class="note">' + note + '</div>' : '') + '</div>';
    const s = DB.settings;
    return '<div class="grid2"><div class="card"><h3>🧮 Negative M.I.S plan</h3>' + n('connPerDay', 'Connected conversations planned per working day (0 = don\'t score)', 'Daily target board stays ' + s.tC + '; this is the M.I.S plan — a number the person can actually keep, then raise (S.S.G, W1 p.7).') + n('rfqTatHrs', 'RFQ rates TAT (hours)') + n('eqcTatHrs', 'Enquiry quote TAT (hours)') + n('greenAt', 'Green when score is at or better than (e.g. −10)') + '</div>' +
      '<div class="card"><h3>🕵️ P.C queue</h3>' + n('hotIdleDays', 'Hot lead idle after (days)') + n('otdReportDays', 'OTD report to corridor clients every (days)') + n('refAskDays', 'Re-ask references after (days)') + n('nbdCrrDays', 'N.B.D of C.R.R — re-pitch clients with a wallet gap every (days)') + '<div class="note">Signed-but-no-load threshold uses Settings → Pipeline red-flags (' + (s.wonFlagDays || 30) + ' days).</div></div>' +
      '<div class="card"><h3>🤝 Meetings plan — negative MeCA (ASMP)</h3>' + n('meetingsPerWeek', 'Meetings / Zoom calls planned per person per week (team default)', '"Only job of a salesperson is Meetings & Conversion." Start with a number that can be kept, then S.S.G it up.') +
      '<div class="frow"><label>Per person override</label>' + users().filter(u => u !== 'suyashh').map(u => '<div class="bmp-inline" style="display:flex;gap:6px;align-items:center;margin-bottom:4px"><span style="min-width:90px">' + esc(u) + '</span><input type="number" style="width:80px" value="' + ((c.meetPlan || {})[u] ?? '') + '" placeholder="' + (c.meetingsPerWeek || 0) + '" onchange="bmpMeetPlan(\'' + u + '\',this.value)"></div>').join('') + '</div>' +
      '<div class="note">R.C profile, thresholds and the Black Circle rules are on the Golden Circle tab → R.C profile. Profit-planning inputs are on the Plan tab.</div></div>' +
      '<div class="card"><h3>⭐ Client rating weights</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><div class="frow"><label>Payment %</label><input type="number" value="' + c.weights.pay + '" onchange="bmpWeight(\'pay\',+this.value)"></div><div class="frow"><label>Volume %</label><input type="number" value="' + c.weights.vol + '" onchange="bmpWeight(\'vol\',+this.value)"></div><div class="frow"><label>G.P %</label><input type="number" value="' + c.weights.gp + '" onchange="bmpWeight(\'gp\',+this.value)"></div></div>' + n('corridorPremiumPct', 'Corridor premium %') + '<div class="frow"><label>Pure sales days (director)</label><input value="' + esc(c.salesDays || '') + '" onchange="bmpCfgSet(\'salesDays\',this.value)"><div class="note">2–3 days a week, no office, 4 new or top-20% clients a day (W0 p.3, W35 p.493).</div></div></div>' +
      '<div class="card"><h3>📧 Monday M.I.S email</h3><div class="note">Every Monday the server mails last week\'s scores, the E.M sheet and the P.C queue to Suyashh (needs SMTP in Settings → Email sending).</div>' +
      '<div style="display:flex;gap:8px;margin-top:8px;align-items:center"><span class="pill ' + (s.bmpWeeklyEmail ? 'on' : '') + '" onclick="DB.settings.bmpWeeklyEmail=!DB.settings.bmpWeeklyEmail;saveDB(\'settings\');render()">' + (s.bmpWeeklyEmail ? 'ON' : 'off') + '</span><input type="time" value="' + (s.bmpWeeklyTime || '08:30') + '" onchange="DB.settings.bmpWeeklyTime=this.value;saveDB(\'settings\')"><button class="btn sm ghost" onclick="bmpTestWeekly()">Send test now</button></div>' +
      '<div class="note" style="margin-top:6px">Last sent: ' + (s.lastBmpWeeklySent || 'never') + '</div></div></div>';
  }
  window.bmpCfgSet = function (k, v) { BMP.cfg[k] = v; bmpSave('cfg'); render(); };
  window.bmpWeight = function (k, v) { BMP.cfg.weights[k] = v; bmpSave('cfg'); render(); };
  window.bmpMeetPlan = function (u, v) { BMP.cfg.meetPlan = BMP.cfg.meetPlan || {}; if (v === '') delete BMP.cfg.meetPlan[u]; else BMP.cfg.meetPlan[u] = +v; bmpSave('cfg'); };
  window.bmpTestWeekly = async function () { try { const r = await fetch('/api/bmp-weekly-test', { method: 'POST' }); const j = await r.json(); if (!r.ok) throw new Error(j.error || 'failed'); toast('Weekly M.I.S email sent ✓'); } catch (e) { toast('⚠ ' + e.message); } };

  /* ================= LEAD COCKPIT PANEL (appended to the lead drawer) ================= */
  window.bmpLeadPanel = function (L) {
    if (!L) return '';
    const cl = BMP.clients.find(c => c.leadId === L.id || (c.co && L.co && c.co.toLowerCase() === L.co.toLowerCase()));
    const feb = L.feb || '';
    const tag = (k, l) => '<span class="bmp-tag ' + (feb.includes(k) ? 'on' : '') + '" onclick="bmpFeb(' + L.id + ',\'' + k + '\')" title="' + l + '">' + k + '</span>';
    return '<div class="frow" style="border:1px solid var(--line);border-radius:8px;padding:10px;background:#FBF9F9"><label>🧭 BMP sales sciences</label>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:8px"><span class="note">F.E.B</span>' + tag('F', 'Fastest sale — return-load lane') + tag('E', 'Easiest sale — referred') + tag('B', 'Biggest margin — corridor lane') +
      '<span class="note" style="margin-left:6px">₹ value / yr</span><input type="number" style="width:120px;padding:4px 6px" value="' + (L.value || '') + '" onchange="bmpLeadSet(' + L.id + ',\'value\',+this.value)">' + (cl ? '<span style="margin-left:6px">' + stars(cl.star) + '</span>' : '') + '</div>' +
      // ASMP: stream + R.C fit
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:8px"><span class="note">Stream</span>' + Object.entries(C.STREAMS).map(([k, s]) => '<span class="bmp-tag ' + (C.streamOf(L, BMP.clients) === k ? 'on' : '') + '" title="' + esc(s.long) + '" onclick="bmpLeadSet(' + L.id + ',\'stream\',\'' + k + '\');openDrawer(' + L.id + ')">' + s.short + '</span>').join('') + (L.stream ? '' : '<small class="note">guessed</small>') +
      '<span class="note" style="margin-left:6px">R.C fit</span>' + [['Y', '🚀 Yes'], ['N', 'No']].map(([k, l]) => '<span class="bmp-tag ' + (L.rcFit === k ? 'on' : '') + '" onclick="bmpLeadSet(' + L.id + ',\'rcFit\',' + (L.rcFit === k ? '\'\'' : '\'' + k + '\'') + ');openDrawer(' + L.id + ')">' + l + '</span>').join('') + (!L.rcFit && C.rcSuggest(L, BMP.cfg.rc) === 'Y' ? '<small class="note">looks like an R.C — confirm</small>' : '') + '</div>' +
      // ASMP: the S.C's meeting discipline — fix, confirm same morning, log held
      '<div class="bmp-inline" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px;padding:6px 8px;border:1px dashed var(--line);border-radius:6px"><span class="note">Meeting</span><input type="date" id="bm_meet_' + L.id + '" value="' + (L.meetAt || '') + '"><select id="bm_mode_' + L.id + '"><option ' + ((L.meetMode || 'zoom') === 'zoom' ? 'selected' : '') + '>zoom</option><option ' + (L.meetMode === 'visit' ? 'selected' : '') + '>visit</option><option ' + (L.meetMode === 'office' ? 'selected' : '') + '>office</option></select><button class="btn sm ghost" onclick="bmpMeetFix(' + L.id + ')">📅 Fix</button>' +
      (L.meetAt ? '<button class="btn sm ghost" onclick="bmpLeadStamp(' + L.id + ',\'meetConfirmedAt\',\'MEET\',\'Meeting reconfirmed\')">✅ Confirmed' + (L.meetConfirmedAt ? ' · ' + fmtD(L.meetConfirmedAt) : '') + '</button><button class="btn sm" onclick="bmpMeetHeld(' + L.id + ')">🤝 Held</button><button class="btn sm ghost" onclick="bmpMeetClear(' + L.id + ')" title="Cancelled / not held">✕</button>' : '<button class="btn sm ghost" onclick="bmpLeadMeeting(' + L.id + ')">🤝 Log a meeting held</button>') +
      (L.meetAt ? '<small class="note">' + fmtD(L.meetAt) + ' · ' + esc(L.meetMode || '') + (L.meetBy ? ' · fixed by ' + esc(L.meetBy) : '') + '</small>' : '') + '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
      '<button class="btn sm ghost" onclick="bmpLeadStamp(' + L.id + ',\'deckShownAt\',\'DECK\',\'Sales Deck shown\')">📕 Deck shown' + (L.deckShownAt ? ' · ' + fmtD(L.deckShownAt) : '') + '</button>' +
      '<button class="btn sm ghost" onclick="bmpLeadStamp(' + L.id + ',\'sorryCallAt\',\'SORRY\',\'Sorry call\')">🙏 Sorry call' + (L.sorryCallAt ? ' · ' + fmtD(L.sorryCallAt) : '') + '</button>' +
      '<button class="btn sm ghost" onclick="bmpLeadStamp(' + L.id + ',\'refsAskedAt\',\'REF\',\'References asked\')">🔗 Refs asked' + (L.refsAskedAt ? ' · ' + fmtD(L.refsAskedAt) : '') + '</button>' +
      '<button class="btn sm ghost" onclick="bmpEqcFromLead(' + L.id + ')">📥 Capture enquiry</button>' +
      '<select onchange="if(this.value){bmpObjHit(' + L.id + ',this.value);this.value=\'\'}" style="padding:4px 6px;font-size:12px"><option value="">🛡 Objection heard…</option>' + (BMP.cfg.objections || []).map(o => '<option value="' + esc(o.o) + '">' + esc(o.o) + '</option>').join('') + '</select>' +
      ((L.status === 'WON' || L.stage === 8) ? '<button class="btn sm ghost" onclick="bmpLeadStamp(' + L.id + ',\'handoverAt\',\'PC\',\'Handed over to C.R.M\')">🔁 C.R.M handover' + (L.handoverAt ? ' · ' + fmtD(L.handoverAt) : '') + '</button>' : '') +
      (cl ? '<button class="btn sm ghost" onclick="bmpClientDrawer(' + cl.id + ')">⭐ Client card</button>' : '<button class="btn sm ghost" onclick="bmpClientFromLead(' + L.id + ')">⭐ Make client</button>') +
      '</div>' + (L.pcNudges ? '<div class="note" style="margin-top:6px">P.C nudges: ' + L.pcNudges + ' (last ' + fmtD(L.pcLast) + ')</div>' : '') + '</div>';
  };
  window.bmpMeetFix = function (id) { const L = find(id); const d = ($('#bm_meet_' + id) || {}).value; if (!d) { toast('Pick the meeting date'); return; } L.meetAt = d; L.meetMode = ($('#bm_mode_' + id) || {}).value || 'zoom'; L.meetBy = me(); L.meetConfirmedAt = ''; saveDB('leads'); logAct(L, 'MEET', 'Meeting fixed — ' + L.meetMode, fmtD(d)); toast('Meeting fixed for ' + fmtD(d) + ' — confirm it that morning'); openDrawer(id); render(); };
  window.bmpMeetHeld = function (id) { const L = find(id); logAct(L, 'MEETING', 'Meeting — ' + (L.meetMode || 'zoom'), L.meetAt ? 'fixed for ' + fmtD(L.meetAt) : ''); L.lastMeeting = todayKey(); L.meetAt = ''; L.meetConfirmedAt = ''; saveDB('leads'); toast('Meeting logged ✓ — S.C: verification call today, proposal within TAT'); openDrawer(id); render(); };
  window.bmpMeetClear = function (id) { const L = find(id); if (!confirm('Meeting not held / cancelled? It stays on record as a meeting not done.')) return; logAct(L, 'MEET', 'Meeting not held', L.meetAt ? 'was fixed for ' + fmtD(L.meetAt) : ''); L.meetMissed = (L.meetMissed || 0) + 1; L.meetAt = ''; L.meetConfirmedAt = ''; saveDB('leads'); openDrawer(id); render(); };
  window.bmpObjHit = function (id, o) { const L = find(id); logAct(L, 'OBJ', o, ''); const ob = (BMP.cfg.objections || []).find(x => x.o === o); if (ob && ob.a) { navigator.clipboard.writeText(ob.a).then(() => toast('Objection logged — answer copied to clipboard')); } else toast('Objection logged'); };
  window.bmpFeb = function (id, k) { const L = find(id); const s = new Set((L.feb || '').split('')); if (s.has(k)) s.delete(k); else s.add(k); L.feb = [...s].join(''); saveDB('leads'); openDrawer(id); };
  window.bmpLeadSet = function (id, k, v) { const L = find(id); L[k] = v; saveDB('leads'); };
  window.bmpLeadStamp = function (id, k, ch, ty) { const L = find(id); L[k] = todayKey(); saveDB('leads'); logAct(L, ch, ty, ''); toast(ty + ' ✓'); openDrawer(id); render(); };
  window.bmpLeadMeeting = function (id) { const L = find(id); const kind = prompt('Meeting type: zoom / visit / office', 'zoom'); if (!kind) return; logAct(L, 'MEETING', 'Meeting — ' + kind, ''); L.lastMeeting = todayKey(); saveDB('leads'); toast('Meeting logged'); openDrawer(id); render(); };
  window.bmpEqcFromLead = function (id) { const L = find(id); go('bmp'); V.tab = 'eqc'; V.eqcForm = true; render(); setTimeout(() => { const s = (k, v) => { const el = $('#' + k); if (el) el.value = v || ''; }; s('eq_co', L.co); s('eq_name', L.name); s('eq_mob', L.mob); s('eq_lead', L.id); }, 30); };
  window.bmpClientFromLead = function (id) { const L = find(id); const c = bmpClientAdd({ co: L.co, name: L.name, mob: L.mob, leadId: L.id, owner: L.assignedTo || me(), monthlyRev: L.value ? Math.round(L.value / 12) : 0 }); toast('Client added — rate it'); bmpClientDrawer(c.id); };

  /* ================= RFQ negotiation prep (appended to the RFQ drawer) ================= */
  window.bmpRfqPanel = function (r) {
    if (!r) return ''; const n = r.nego || {}; const f = (k, ph, type) => '<input type="' + (type || 'text') + '" placeholder="' + ph + '" value="' + esc(n[k] ?? '') + '" onchange="bmpNego(' + r.id + ',\'' + k + '\',this.value)">';
    return '<div class="frow" style="margin-top:14px;border:1px solid var(--line);border-radius:8px;padding:10px;background:#FBF9F9"><label>🤝 Negotiation prep — BATNA / ZOPA (GTD p.667–669)</label>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' + f('objective', 'Objective') + f('fallback', 'Fallback position') + f('best', 'BEST rate ₹', 'number') + f('target', 'TARGET rate ₹', 'number') + f('worst', 'WORST (walk-away) ₹', 'number') + f('batna', 'BATNA — if no deal, we…') + f('theirs', 'Their priorities (price / volume / terms / QA)') + f('concessions', 'Concessions & their ₹ cost') + '</div>' +
      '<div class="note" style="margin-top:6px">Never exchange selling for negotiation; never give the whole discount at once; the director is not in the room (W35 p.495). Show the deck first — "deals don\'t break on money" (W29 p.468).</div></div>';
  };
  window.bmpNego = function (id, k, v) { const r = DB.rfq.find(x => x.id === id); r.nego = r.nego || {}; r.nego[k] = v; saveDB('rfq'); };

  /* ================= DASHBOARD STRIP ================= */
  window.bmpDashStrip = function () {
    try {
      const w = C.weekOf(todayKey()); const r = C.misWeek(data(), BMP.cfg, w, Date.now()); const us = users();
      let q = C.pcQueue(data(), pcCfg()); if (!IS_ADMIN) q = q.filter(x => x.owner === me());
      const m = C.meca(data(), { start: w.start, end: w.end }).team;
      const R30 = { start: C.addDays(todayKey(), -29), end: todayKey() }; const ss = C.streamSplit(data(), R30); const fn = C.funnel(data());
      return '<div class="card" style="margin-bottom:14px;cursor:pointer;border-left:4px solid var(--navy)" onclick="go(\'bmp\')"><div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center">' +
        '<div><div class="note">BMP · this week</div><b style="font-weight:900;font-size:16px">Negative M.I.S</b></div>' +
        us.map(u => { const s = r.byUser[u]; return '<div style="text-align:center"><div class="bmp-score ' + (s && s.planned ? scoreCls(s.score) : '') + '" style="font-size:26px">' + (s && s.planned ? s.score + '%' : '—') + '</div><small class="note">' + esc(u) + '</small></div>'; }).join('') +
        '<div style="text-align:center"><b style="font-size:20px;color:var(--red)">' + q.length + '</b><br><small class="note">P.C queue</small></div>' +
        '<div style="text-align:center"><b style="font-size:20px">' + m.meetings + ' · ' + m.conversion + '% · ' + (m.avgTicket ? inr(m.avgTicket) : '—') + '</b><br><small class="note">MeCA</small></div>' +
        '<div style="text-align:center"><b style="font-size:20px;color:' + (ss.nbdPctWon >= 50 ? '#1E7A4C' : 'var(--red)') + '">' + (ss.totWon ? ss.nbdPctWon + '%' : '—') + '</b><br><small class="note">N.B.D share · 30 d</small></div>' +
        (fn.bottleneck ? '<div style="text-align:center"><b style="font-size:14px;color:var(--red)">' + esc(fn.bottleneck.from) + ' → ' + esc(fn.bottleneck.to) + ' ' + fn.bottleneck.cr + '%</b><br><small class="note">funnel bottleneck</small></div>' : '') +
        '<span class="note" style="margin-left:auto">Open BMP Sales →</span></div></div>';
    } catch (e) { return ''; }
  };
})();
