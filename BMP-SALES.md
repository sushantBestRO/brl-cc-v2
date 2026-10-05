# cc11 — ASMP additions (Advanced Sales & Marketing Program) on top of cc10

What the ASMP notes add that BMP did not have, and where it now lives. No new storage keys,
no new npm packages, no server routes changed. New optional fields only:
leads `stream, rcFit, meetAt, meetMode, meetBy, meetConfirmedAt, meetMissed, handoverAt`;
EQC `stream`; clients `rcFlags, rcOverride, bcFlags, bccAction, bccNote, bccDoneAt, spendTotal, lanesNot, competitors, nbdCrrAt`;
cfg (`brl-bmp`) `meetingsPerWeek, meetPlan, nbdCrrDays, rc, profit, objections, tools` + 4 scripts.
New activity channels `MEET` (meeting fixed / reconfirmed / not held) and `OBJ` (objection heard).

| ASMP science | Where | What it does |
|---|---|---|
| **C.R.R / N.B.D streams** (Pillar 1) | Scoreboard → "C.R.R vs N.B.D"; EQC form + drawer; lead cockpit → Stream | Every enquiry, lead and win is C.R.R, N.B.D Incoming, N.B.D of C.R.R or N.B.D Outgoing (guessed from client list / channel / campaign until tagged). Shows N.B.D share of wins vs the 50:50 target. |
| **Negative MeCA** (M.I.S level 2/3) | Scoreboard → "Negative MeCA — this week"; Setup → meetings plan | % meetings not done + ₹ of meetings missed, % conversion below the person's own best week, % avg ₹ sale lost + ₹, ₹ of clients lost. One negative score per person. |
| **Sales funnel · 5-for-9 · I.P.L** (Pillar 4) | new tab **Funnel · 5-for-9** | Leads → Contacted → Meeting → Proposal → Negotiation → Won from existing stages/outcomes; the 9 parameters incl. sales lead time; the bottleneck step (largest loss) with a P.O.S.T hint; per-person step C.R with **R.T** (re-training) flags; lead-gen order (sorry calls → N.B.D-C.R.R → lost prospects → references → EQC → Dream 150 → fresh data). |
| **Golden Circle** (Pillar 3) | new tab **Golden Circle**; client card → R.C / Black Circle / Wallet panels; lead cockpit → R.C fit | Rocket Client = 8 flags (4 auto from rating inputs) → R.C at ≥ 5 or manual; Black Circle reasons + **B.C.C** decision (re-price / advance / stop); wallet share = ours ÷ their total freight → N.B.D of C.R.R gap list, biggest first; G.C metrics (% leads / meetings outside R.C, % ₹ from R.C…). R.C profile ("Sharmaji") + sector keywords that suggest R.C-fit on leads. |
| **S.C meeting discipline** (N.B.D engine steps 4–7) | lead cockpit → Meeting: Fix · Confirmed · Held · ✕ | Fixed meetings are promises; P.C queue nags **Meeting to confirm** (same morning) and **Meeting not logged**; not-held meetings feed negative MeCA. |
| **N.B.D → C.R.M handover** | lead cockpit (WON) → C.R.M handover; P.C queue **C.R.M handover** | The salesperson never keeps the client. Script in Playbook. |
| **P.O.S.T — Objection handling** | Deck · Playbook → Objection handling; cockpit → "Objection heard…" | 8 BRL objections with answers (editable, video link); every hit logged from the cockpit sorts the list, so the FAQ writes itself; answer copied to clipboard on log. |
| **Sales tools / Marketing Engine** | Deck · Playbook → Sales tools | 12-item readiness checklist with links (deck, videos, competition-using-us list, testimonials, brochure, sales kit, drip). |
| **Profit planning / gap analysis → leads needed** (SING to 4X) | Plan · 4X → "Profit planning" | Revenue, variable, fixed cost → N.P; target ×2/×4; F.C +10%; new G.P; revenue needed; the **gap** converted into clients, leads and meetings per month/week using the plan's C.R, avg sale, transactions and the funnel's lead→meeting C.R. |
| **Scripts** | Playbook | Tele-caller qualify (don't sell), S.C verification call, C.R.M handover, client interview (why start / stay / leave). |
| **Monday email** | server.js | Adds N.B.D share, negative MeCA per person, funnel bottleneck + lead time, Golden Circle summary. |

Rule B (sheet before software) note: the computed views (streams, funnel, negative MeCA, G.C metrics, gap analysis)
need no new process — they read existing data. The three things that do need a habit — tagging the stream, fixing/confirming
meetings in the cockpit, and filling "their total freight ₹/month" on client cards — should run for four weeks with the
S.C auditing them before anyone is scored on them.

---

# cc10 — BMP Sales module + house redesign of BRL Command Center

Rahul Jain's sales sciences, built into the existing cockpit. Page references are to
*The BMP Notebook* (W = week, p = original notebook page).

## Files changed / added
| File | What |
|---|---|
| `public/theme.css` | **new** — the whole UI restyled in the house design language of the 2026 corporate profile and hiring collateral: white paper, hairline rules, brand red `#C8102E`, ink `#141414`, Inter 800/900 uppercase headlines, letter-spaced red kickers, numbered nav (01…12), red stat numbers, square corners, no gradients. Replaces the old inline `<style>` block; every existing class is covered, so no markup changed. |
| `public/login.html` | redesigned to match (logo strip, kicker, black/red headline, red button). |
| `public/brand.png` | the logo strip (copy of `assets/brl-header.png`) used by the rail and the login page; served without login. |
| `public/bmp-core.js` | **new** — pure functions: negative M.I.S scoring, MeCA, 5-parameter compounding, client star rating, P.C queue. Shared by the browser and the server. |
| `public/bmp.js` | **new** — the "🧭 BMP Sales" tab (8 sub-tabs), the BMP panel inside every lead cockpit, negotiation prep inside every RFQ, the dashboard strip. |
| `public/index.html` | 10 small hooks: loads the two scripts, nav item + badge, `render()` branch, `loadDB()` loads BMP keys, lead-drawer panel, RFQ-drawer panel, dashboard strip, `MEETING` counted in meetings, new Activity filters. Nothing else touched. |
| `server.js` | 4 new storage keys (`brl-eqc`, `brl-clients` caller-scoped like leads; `brl-bmp`, `brl-mis` admin-write / all-read); `/api/deck-pdf`; Monday M.I.S + P.C-queue email (cron) with `/api/bmp-weekly-test` and `/api/bmp-weekly-preview`; empty defaults instead of 404 for new keys. |

No new npm dependencies. No changes to existing data files or their shapes; new fields on
leads/RFQs (`value`, `feb`, `deckShownAt`, `refsAskedAt`, `sorryCallAt`, `pcNudges`, `nego`) are
optional and only written when used.

## Deploy (VPS, PM2)
```
scp server.js user@103.168.19.182:/var/www/brl-cc/server.js
scp public/index.html public/bmp.js public/bmp-core.js user@103.168.19.182:/var/www/brl-cc/public/
ssh user@103.168.19.182 "pm2 restart brl-cc"
```
Data files are created on first save. Callers (Jagruti, Sunaina…) see only their own enquiries
and clients, exactly like leads; only `suyashh` edits the deck, scripts, plan and thresholds.

## The eight sub-tabs
1. **Scoreboard · MeCA** — Meetings, Conversion, Average ticket per person and team, for this week / last week / month / 90 days, plus enquiries, won, ₹ revenue, decks shown, references asked, sorry calls. Plan-vs-actual once the 5-for-5 plan is filled. (W24 p.382, W25 p.402)
2. **Negative M.I.S · E.M** — one negative number per person per week: average of K.R.A percentages (follow-ups kept on the promised date, connected-call plan, RFQ rates within TAT, RFQ follow-ups on date, enquiries quoted within TAT, enquiry follow-ups). Promises are reconstructed from history (every outcome that auto-sets a next date is a promise), so the plan cannot be edited away. Green at −10 or better. E.M panel: "how much red next week?" commitment, E.M done/skipped, 8-week trend, list of promises not kept, snapshot for appraisal (D.S 20% / M.I.S 80%, W29 p.480). (W26 p.425–427, W35 p.489, W4 p.50)
3. **P.C Queue** — every broken promise, owner-wise: overdue follow-ups, never dialled, hot lead idle, signed-no-load, RFQ TAT / follow-up, negotiation without prep, enquiry TAT / follow-up, deck not shown to 4–5★, OTD report due, references < 5, sorry call pending, top-client visit overdue. Nudge = verbal help slip; the third nudge raises a Help Ticket to Suyashh by email. Copy-for-WhatsApp. (W11 p.221, W3 p.41, W17 p.288)
4. **Enquiry Capture (EQC)** — every rate enquiry from any channel: lane, vehicle, quantity, target rate, ₹/yr value. Quote TAT clock, follow-up log with promised next date, Won/Lost/Regret with reason, push to RFQ tracker, CSV export. Feeds "Leads" and conversion in MeCA and two K.R.As in the M.I.S. (W2 p.22–23, W5 p.55)
5. **Clients ★ · Corridor** — 60/30/10 scoring (payment days, ₹/month, G.P%) ranked → 1–5★ with manual override; VIP/Ambulance corridor flag + dedicated CRM; 5 reference slots with de-risk script and one-click "add named refs as leads" (tagged Easiest sale); deck shown / OTD report sent / visited / sorry call stamps; lapsed list. Pull WON leads in one click. (W15 p.257, W19 p.324, W20 p.332, W12 p.224)
6. **Sales Deck · Playbook** — P-I-S pages (Problem · Impact · Solution · system shown · live link) with BRL defaults, Authority and Trust lists, **Generate deck PDF** in the house style (cover, one page per P-I-S with a screenshot box, A&T page). Scripts, editable and copy-able: sorry call (odd minutes), reference de-risk, 7-minute ask, discovery questions (Stab & Twist), Science of Denial, negotiation prep, F.E.B, pitch rules. (W21 p.347–349, W23 p.367, W26 p.414, W38 p.600)
7. **5-for-5 Plan** — the five parameters (leads, conversion, average sale, transactions, margin) last-30-days vs annual plan with a strategy per lever; compounding table (+11% / +20% on each lever) reproducing RJ's 10,000 → 15,181 → 20,736; focus lever for the 2-month block; seed from last 90 days. (W35 p.498–500, W38 p.602–603)
8. **Setup** (admin) — connected-conversations plan per day, RFQ/enquiry TAT hours, green threshold, hot-idle days, OTD/reference cadences, rating weights, corridor premium, Monday M.I.S email on/off + time + test send.

## Inside existing screens
- **Lead cockpit** → "BMP sales sciences" panel: F.E.B tags, ₹ value/yr, Deck shown, Log meeting (Zoom/visit), Sorry call, Refs asked, Capture enquiry, Make client / Client card, P.C nudge count.
- **RFQ drawer** → Negotiation prep: objective, fallback, BEST / TARGET / WORST, BATNA, their priorities, concessions and cost. Missing prep on a NEGOTIATION RFQ shows up in the P.C queue.
- **Dashboard** → strip with this week's M.I.S score per caller, P.C queue count, MeCA.
- **Activity** → new channels MEETING, DECK, REF, SORRY, EQC, PC.
- **Monday 08:30 email** (when switched on in Setup): last week's scores with K.R.A breakdown, MeCA, P.C queue by owner, and the E.M rule.

## What the first week will look like
The M.I.S reconstructs promises from the existing activity log, so scores for past weeks are
already there — and they are red (Jagruti's follow-ups kept on the promised day: 2 of 36 last
week). RJ says that is normal: "initially it will be all red, takes 6–8 weeks for the D.S to
become clean" (W4 p.54). Start with the P.C queue (216 overdue follow-ups on day one), keep the
connected-conversations plan at a number that can actually be kept (Setup, default 10/day), and
raise it in S.S.G steps.
