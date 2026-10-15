/* record.Hunt — track down one rare record across a pixel map of NYC. Read the clues, pick
   a spot, pay the fare (or walk), ask people about what you know. Wrong spots are funny
   dead ends that hand you new clues; the right chain ends in a satisfying reveal.
   Params (all optional):
     { target: recordId (default "loose_joints_is_it_all_over_my_face"),
       clues: [strings]   (first = what you start with; extra ones replace the default tips in order),
       places: [{id, label, hint, kind?, area?, u?, v?, opens?, closes?, found?: true (the final spot)}],
       difficulty: 1..5, seed? }
   Result: { ok, score (0..100), found: bool }   (LEAVE / GIVE UP => { ok:false, score:0, found:false })
   Uses RP.digkit (digkit_lib.js) inside play(). All shops and people are fictional. */
(function () {
"use strict";
const RP = window.RP;
const { mulberry, hashStr, clamp } = RP.u;

const CSS = `
.rh-stage { position: relative; width: max-content; max-width: 100%; margin: 0 auto; }
.rh-pin { position: absolute; width: 30px; height: 30px; margin: -15px 0 0 -15px; padding: 0; background: transparent; border: 0; cursor: pointer; border-radius: 50%; }
.rh-pin:hover, .rh-pin:focus-visible { outline: 2px solid var(--cyan); outline-offset: -2px; }
.rh-pin[disabled] { cursor: default; }
.rh-card { display: flex; flex-direction: column; gap: 6px; }
.rh-card h3 { margin: 0; font-weight: 400; font-size: 24px; color: #fff; line-height: 1; }
.rh-card h3 small { display: block; font-size: 18px; color: var(--cyan); margin-top: 2px; }
.rh-go { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.rh-go .btn { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 21px; padding: 7px 4px; line-height: 1; }
.rh-go .btn small { font-size: 16px; opacity: .85; }
.rh-asks { display: flex; flex-direction: column; gap: 6px; }
.rh-asks .btn { text-align: left; font-size: 19px; padding: 6px 10px; line-height: 1.02; }
.rh-asks .btn small { display: block; color: var(--muted); font-size: 15px; }
.rh-log { display: flex; flex-direction: column; gap: 3px; font-size: 19px; line-height: 1.05; color: #e4ddff; min-height: 3.2em; }
.rh-log p { margin: 0; } .rh-log .you { color: var(--cyan); } .rh-log .npc { color: #ffd9a0; } .rh-log .nar { color: var(--muted); font-style: normal; }
.rh-notes { background: #120e24; border: 1px solid var(--line); border-radius: 4px; padding: 6px 10px; }
.rh-notes summary { cursor: pointer; font-size: 20px; color: var(--amber); list-style: none; display: flex; justify-content: space-between; gap: 8px; }
.rh-notes summary::-webkit-details-marker { display: none; }
.rh-notes ol { margin: 6px 0 0; padding-left: 22px; font-size: 18px; line-height: 1.05; color: #e4ddff; }
.rh-notes li { margin-bottom: 5px; } .rh-notes li.new { color: #fff; } .rh-notes li.new::marker { color: var(--pink); }
.rh-tag { font-size: 15px; color: var(--pink); border: 1px solid #6a1f4a; border-radius: 2px; padding: 0 4px; margin-left: 4px; }
.rh-status { display: flex; flex-wrap: wrap; gap: 4px 12px; font-size: 18px; color: var(--muted); }
.rh-status b { color: var(--fg); font-weight: 400; } .rh-status .warn { color: var(--amber); } .rh-status .bad { color: #ff5a5a; }
.rh-reveal { display: grid; grid-template-columns: 96px 1fr; gap: 10px; align-items: center; }
.rh-reveal canvas { width: 96px; height: 96px; image-rendering: pixelated; border: 1px solid #4a3a7a; }
@media (max-width: 520px) { .rh-card h3 { font-size: 21px; } .rh-log { font-size: 18px; } .rh-asks .btn { font-size: 18px; } }
`;
let cssDone = false;

const fmtT = m => { const h = Math.floor(m / 60) % 24, mm = m % 60, ap = h >= 12 ? "PM" : "AM"; return ((h % 12) || 12) + ":" + String(mm).padStart(2, "0") + " " + ap; };
const fmtH = h => ((h % 12) || 12) + (h >= 12 ? "PM" : "AM");
const FARE = 3;
const FLAVOR_JUNK = ["black_box_ride_on_time", "snap_rhythm_is_a_dancer", "cc_music_factory_gonna_make_you_sweat", "crystal_waters_gypsy_woman", "reel_2_real_i_like_to_move_it", "grover_washington_jr_winelight", "bucketheads_the_bomb", "robin_s_show_me_love"];

/* ------------------------------------------------------------ the default story */
function buildScenario(rec, p, rnd, diff, DK) {
  const T = rec.title.replace(/\s*\(.*\)\s*$/, ""), A = rec.artist;
  const P = {
    flea: { id: "flea", label: "Ronnie's Flea", kind: "flea", area: "Brooklyn", u: 0.66, v: 0.7, opens: 10, closes: 15, hint: "Weekend flea market. Cash only. Bad coffee. Open 10 to 3.", npc: "dk_ronnie", npcName: "RONNIE",
      intro: ["RONNIE: \"Cash only. Coffee's a dollar. It's also a threat.\""],
      asks: { c1: { say: ["YOU: \"Ray says a clean copy of '" + T + "' left here in a tote bag.\"", "RONNIE: \"Tote bag guy! Cheap shades, four crates, never smiles. Sold the whole lot to the church-fair dealers.\"", "RONNIE: \"Basement of a church, West Side. Folding tables. Everybody whispers like it's a library.\""], gives: "c2" } },
      fallback: { say: ["RONNIE: \"Don't know that one. Wanna buy a lamp shaped like a saxophone? It plays nothing.\""], find: true } },
    fair: { id: "fair", label: "Church Basement Record Fair", kind: "fair", area: "Manhattan", u: 0.49, v: 0.3, opens: 11, closes: 17, fee: 2, hint: "Record fair in a church basement. $2 donation for the roof. Open 11 to 5.", npc: "dk_deacon", npcName: "DEACON",
      intro: ["DEACON: \"Suggested donation: two dollars. Suggested volume: whisper.\""],
      asks: { c2: { say: ["YOU: \"I'm after '" + T + "'. The tote bag guy's crates came through here.\"", "DEACON: \"Table four. Table four is... no longer here. The dealer took it home to Queens.\"", "DEACON: \"Mind you, Hal's widow still keeps his whole dance wall. Mrs. Feld, Rego Park. Fourth floor, no elevator. Bring lungs.\""], gives: "c3" } },
      fallback: { say: ["DEACON: \"Records? Everyone here has records. Be specific. Be quiet, too.\"", "A dealer hisses across table two: \"A name, kid. Not a genre. Where did the tip start?\""], gives: "s4", find: true } },
    apt: { id: "apt", label: "Mrs. Feld's walk-up", kind: "apt", area: "Rego Park, Queens", u: 0.83, v: 0.4, opens: 12, closes: 19, hint: "Fourth-floor walk-up in Rego Park. Ring twice. Open noon to 7. Nap time is sacred.", npc: "dk_feld", npcName: "MRS. FELD",
      intro: ["MRS. FELD, through the chain: \"Who is it? If it's the census, I'm dead.\""],
      asks: { c3: { say: ["YOU: \"The church dealers said you might still have Hal's dance records. I'm after '" + T + "'.\"", "MRS. FELD: \"Hal's wall! Come in, come in. Wipe your feet. Not on the carpet. On the other carpet.\"", "She lifts a cedar chest lid that smells like 1981 and mothballs..."], found: true } },
      fallback: { say: ["MRS. FELD: \"Who sent you? Nobody sent you? Then goodbye, nobody.\"", "The chain goes back on. Through the door: \"Try the church people! They send everyone!\""], gives: "s5" } },
    thrift: { id: "thrift", label: "Second Chance Thrift", kind: "thrift", area: "The Bronx", u: 0.66, v: 0.1, opens: 10, closes: 18, hint: "Thrift store. Mostly clothes, a box of records. Open 10 to 6.", npc: "dk_clerk", npcName: "CLERK",
      intro: ["CLERK: \"Everything's two dollars. Except the stuff that's three.\""],
      asks: {},
      fallback: { say: ["CLERK: \"Records? One box. Polka, hymns, and a whale-sounds LP somebody cried over.\"", "CLERK: \"The good ones go to the church fair. We just get the hymns.\""], gives: "s1", find: true, junk: true } },
    back: { id: "back", label: "Deep Cuts, the back room", kind: "back", area: "East Village, Manhattan", u: 0.43, v: 0.55, opens: 11, closes: 19, hint: "Ray's stockroom behind the store. Open 11 to 7. Ray hates visitors.", npc: "ray", npcName: "RAY",
      intro: ["RAY: \"You came BACK? I said it once. I'm not saying it twice.\""],
      asks: {},
      fallback: { say: ["RAY: \"I looked already. Back room: eurodance, a cat, and a water stain shaped like a mistake.\"", "RAY: \"Flea. Market. I said it twice. Now get out of my cat's light.\""], gives: "s2", find: true } },
    swap: { id: "swap", label: "Harbor Swap Meet", kind: "swap", area: "Staten Island", u: 0.21, v: 0.78, opens: 10, closes: 16, hint: "Swap meet on Staten Island. Ferry weather. Open 10 to 4.", npc: "dk_swap", npcName: "VENDOR",
      intro: ["VENDOR: \"Everything's one price: make an offer, I'll be offended.\""],
      asks: {},
      fallback: { say: ["VENDOR: \"Tote bag guy? Sounds Brooklyn. We're Staten Island. We don't do tote bags. We do boats.\"", "He sells you nothing. You still feel ripped off."], gives: "s3", find: true, junk: true } }
  };
  let order = ["flea", "fair", "apt", "thrift"];
  if (diff >= 2) order.push("back");
  if (diff >= 3) order.push("swap");
  const clues = {
    c1: { id: "c1", short: "Ray's tip: the tote-bag buyer", text: "Ray's tip: a clean copy of '" + T + "' by " + A + " left a shop in a tote bag. The buyer sells at a flea market. Cash only, terrible coffee." },
    c2: { id: "c2", short: "The tote-bag guy's crates went to the church fair", text: "The tote-bag guy sold his crates to the church-fair dealers: a basement on the West Side, folding tables, everybody whispering." },
    c3: { id: "c3", short: "Hal's widow and the dance wall", text: "The church dealers say Hal's widow keeps his whole wall of dance records. Mrs. Feld, Rego Park, fourth floor, no elevator." },
    s1: { id: "s1", short: "The thrift cashier: hymns only", text: "Thrift cashier: \"The good records go to the church fair. We only get hymns.\"" },
    s2: { id: "s2", short: "Ray: \"Flea. Market.\"", text: "Ray, again: \"Flea. Market. I said it twice.\"" },
    s3: { id: "s3", short: "Wrong borough: \"sounds Brooklyn\"", text: "Staten Island vendor: the tote-bag guy \"sounds Brooklyn.\" This isn't Brooklyn." },
    s4: { id: "s4", short: "Fair dealers want a name", text: "Fair dealers want a name, not a genre: where did the tip start? (It started at a flea market.)" },
    s5: { id: "s5", short: "Mrs. Feld wants a referral", text: "Mrs. Feld only opens up for people the church-fair dealers send." }
  };
  let places = order.map(k => P[k]), final = "apt", start = "c1";
  /* custom clue strings replace the default tips in order */
  if (Array.isArray(p.clues) && p.clues.length) { ["c1", "c2", "c3"].forEach((id, i) => { if (p.clues[i]) clues[id].text = String(p.clues[i]); }); }
  /* custom places: generic engine (any ask at the final spot finds it; elsewhere a dead end that hands out the next clue) */
  if (Array.isArray(p.places) && p.places.length) {
    const used = new Set(), kinds = ["flea", "fair", "apt", "thrift", "back", "swap"];
    const base = p.places.map((q, i) => {
      const kind = q.kind || (/flea|market|swap/i.test(q.label || "") ? "flea" : /fair|church/i.test(q.label || "") ? "fair" : /apt|walk-up|apartment|feld|home|house/i.test(q.label || "") ? "apt" : /thrift/i.test(q.label || "") ? "thrift" : /back|store|shop|records/i.test(q.label || "") ? "back" : kinds[i % kinds.length]);
      const d = P[kind] || P.flea, id = q.id || ("p" + i);
      return Object.assign({}, d, { id, label: q.label || d.label, hint: q.hint || d.hint, kind, area: q.area || d.area, generic: true, asks: {}, fallback: Object.assign({}, d.fallback, { gives: null }), custom: true,
        u: q.u != null ? q.u : d.u + (used.has(kind) ? 0.05 : 0), v: q.v != null ? q.v : d.v + (used.has(kind) ? 0.05 : 0), opens: q.opens != null ? q.opens : d.opens, closes: q.closes != null ? q.closes : d.closes, found: !!q.found, say: q.say }, (q.fee != null ? { fee: q.fee } : {}));
    });
    base.forEach(b => used.add(b.kind));
    final = (base.find(b => b.found) || base[base.length - 1]).id;
    places = base; const extra = (Array.isArray(p.clues) ? p.clues : []).slice(1);
    clues.g = extra.map((t, i) => ({ id: "g" + i, text: t }));
    places.forEach(b => { b.found = b.id === final; });
  }
  places.forEach(b => { if (b.id === final) b.final = true; });
  return { places, clues, final, start };
}

RP.mg.register("recordHunt", {
  title: "record.Hunt", order: 7,
  desc: "Follow the clues across NYC to find one rare record before everything closes.",
  auto: () => ({ ok: true, score: 82, found: true }),
  async play(host, p) {
    p = p || {};
    const DK = RP.digkit;
    if (!DK) return { ok: false, score: 0, found: false, error: "digkit missing" };
    if (!cssDone) { RP.u.el("style", { text: CSS }, document.head); cssDone = true; }
    DK.css(); DK.chars();
    const C = RP.chars;
    if (!C.get("dk_swap")) C.define("dk_swap", Object.assign(C.random(77, { name: "Vendor" }), { id: "dk_swap" }));
    const { el } = RP.u, money = DK.money, RM = DK.reduced(), R = RP.u.R, ramp = RP.u.ramp, PK = RP.PK, txt = RP.u.txt, txtW = RP.u.txtW, poly = RP.u.poly, line = RP.u.line, ell = RP.u.ell;
    const safe = fn => { try { fn(); } catch (e) { /* art must never break the game */ } };
    const diff = clamp(Math.round(p.difficulty || 2), 1, 5);
    const seed = p.seed != null ? p.seed : Math.floor(Math.random() * 1e9), rnd = mulberry(seed);
    const rec = RP.rec(p.target || "loose_joints_is_it_all_over_my_face");
    const sc = buildScenario(rec, p, rnd, diff, DK);
    const places = sc.places, byId = {}; places.forEach(q => { byId[q.id] = q; q.visits = 0; q.done = false; q.gaveFallback = false; q.closedHit = false; });
    const startMin = 600, endMin = [1140, 1140, 1110, 1080, 1050][diff - 1], startMoney = [40, 34, 30, 24, 20][diff - 1];
    const home = { u: 0.6, v: 0.6 };
    const S = { min: startMin, money: startMoney, at: null, pos: { u: home.u, v: home.v }, mode: "intro", sel: places[0].id, clues: [], newClue: null, wrong: 0, trips: 0, asked: {}, over: false, fly: null, travel: null, say: "", sayT: 0, log: [], found: false, spent: 0, walked: 0, revealT: 0, lastNpcTalk: 0 };
    const clueList = Object.assign({}, sc.clues);
    const extraG = clueList.g || []; delete clueList.g;
    const giveClue = id => {
      if (!id) return null;
      const c = clueList[id] || extraG.find(g => g.id === id); if (!c || S.clues.includes(id)) return null;
      S.clues.push(id); S.newClue = id; return c;
    };
    giveClue(sc.start);
    const clueObj = id => clueList[id] || extraG.find(g => g.id === id);
    const distMin = (a, b) => 10 + Math.round(Math.hypot((a.u - b.u) * 1.7, (a.v - b.v)) * 95 / 5) * 5;

    /* ------------------------------------------------ DOM */
    const root = host.root; root.classList.add("dk");
    host.header("record.Hunt", "NYC · one record · one day");
    const hud = el("div", { cls: "rh-status" }, root);
    const clockEl = el("span", { html: "<b></b>" }, hud), leftEl = el("span", { html: "" }, hud), moneyEl = el("span", { html: "CASH <b></b>" }, hud), clueCnt = el("span", { html: "CLUES <b></b>" }, hud);
    const barW = el("div", { cls: "dk-bar" }, root); const barFill = el("i", {}, barW);
    const cols = el("div", { cls: "dk-cols" }, root);
    const left = el("div", { cls: "dk-info" }, cols), right = el("div", { cls: "dk-info" }, cols);
    const stage = el("div", { cls: "rh-stage" }, left);
    const cv = el("canvas", { cls: "px", role: "img", "aria-label": "Pixel map of New York City with spots to visit" }, stage);
    const pinLayer = el("div", {}, stage);
    const card = el("div", { cls: "rh-card mg-panel" }, right);
    const notes = el("details", { cls: "rh-notes" }, right); const nSum = el("summary", {}, notes); const nList = el("ol", {}, notes);
    const msg = el("div", { cls: "mg-msg", "aria-live": "polite" }, root);
    const foot = el("div", { cls: "row" }, root);
    const bLeave = el("button", { cls: "btn", type: "button", text: "GIVE UP" }, foot); el("div", { cls: "spacer" }, foot); const keysEl = el("div", { cls: "dk-keys", html: "<kbd>←</kbd><kbd>→</kbd> pick a spot · <kbd>Enter</kbd> go · <kbd>S</kbd> subway · <kbd>W</kbd> walk" }, foot);
    const blurM = b => b.addEventListener("click", e => { if (e.detail) b.blur(); });
    [bLeave].forEach(blurM);

    /* ------------------------------------------------ art: NYC map */
    let L = null, mapCv = null, sceneCache = {};
    const POLY = {
      nj: [[0, 0], [0.30, 0], [0.34, 0.12], [0.31, 0.30], [0.33, 0.45], [0.30, 0.56], [0.20, 0.58], [0.12, 0.62], [0.04, 0.56], [0, 0.6]],
      manh: [[0.40, 0.70], [0.37, 0.62], [0.39, 0.53], [0.42, 0.42], [0.46, 0.30], [0.51, 0.18], [0.56, 0.10], [0.60, 0.12], [0.57, 0.22], [0.54, 0.34], [0.51, 0.46], [0.48, 0.57], [0.45, 0.66], [0.43, 0.72]],
      bronx: [[0.56, 0.10], [0.60, 0.03], [0.80, 0.03], [0.84, 0.12], [0.76, 0.20], [0.66, 0.19], [0.60, 0.12]],
      queens: [[0.62, 0.22], [0.76, 0.21], [0.86, 0.16], [0.99, 0.2], [0.99, 0.44], [0.9, 0.54], [0.76, 0.52], [0.68, 0.46], [0.62, 0.36]],
      bklyn: [[0.44, 0.74], [0.47, 0.62], [0.53, 0.52], [0.62, 0.50], [0.7, 0.54], [0.8, 0.58], [0.84, 0.7], [0.74, 0.8], [0.58, 0.82], [0.48, 0.8]],
      si: [[0.12, 0.66], [0.2, 0.62], [0.3, 0.68], [0.32, 0.8], [0.26, 0.9], [0.14, 0.92], [0.07, 0.8]]
    };
    function buildMap() {
      const { W, H } = L; mapCv = DK.cv(W, H); const c = mapCv.getContext("2d");
      /* water */
      R(c, 0, 0, W, H, "#12204a");
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = Math.sin(x * 0.21 + y * 0.5) + Math.sin(x * 0.09 - y * 0.31); if (v > 1.2 && RP.u.bayer(x, y) < 8) { c.fillStyle = "#1a3070"; c.fillRect(x, y, 1, 1); } }
      const P2 = pts => pts.map(q => [q[0] * (W - 1), q[1] * (H - 1)]);
      const land = (key, col, edge) => {
        const pts = P2(POLY[key]);
        poly(c, pts.map(q => [q[0] + 1, q[1] + 2]), "#0a1030");                       /* drop shadow */
        poly(c, pts, col);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (RP.u.bayer(x, y) < 3 && (x + y * 2) % 5 === 0) { /* speckle only on land */ }
        for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; line(c, a[0], a[1], b[0], b[1], edge); }
      };
      land("nj", "#2c4a3a", "#5a8a5a"); land("si", "#325a3a", "#6a9a62"); land("bronx", "#3e5a4a", "#7aa070"); land("queens", "#45603a", "#86a868"); land("bklyn", "#4a5a3a", "#8aa868"); land("manh", "#5a6a44", "#b0c47c");
      /* land texture: dithered lighter patches, then streets as faint grid on Manhattan */
      Object.keys(POLY).forEach(k => {
        const pts = P2(POLY[k]); let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1; pts.forEach(q => { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
        const r = mulberry(hashStr(k));
        for (let i = 0; i < (x1 - x0) * (y1 - y0) * 0.05; i++) { const x = Math.floor(x0 + r() * (x1 - x0)), y = Math.floor(y0 + r() * (y1 - y0)), d = c.getImageData(x, y, 1, 1).data; if (d[0] + d[1] + d[2] > 150 && d[2] < 110) { c.fillStyle = r() < 0.5 ? "#6a8a58" : "#3a5236"; c.fillRect(x, y, 1, 1); } }
      });
      /* Central Park */
      const cp = P2([[0.49, 0.30]])[0]; R(c, Math.round(cp[0] - 2), Math.round(cp[1] - 5), 4, 12, "#3c8a46"); R(c, Math.round(cp[0] - 2), Math.round(cp[1] - 5), 4, 1, "#7fd070");
      /* bridges */
      [[[0.45, 0.66], [0.52, 0.62]], [[0.47, 0.56], [0.54, 0.54]], [[0.5, 0.42], [0.62, 0.4]], [[0.58, 0.16], [0.63, 0.2]]].forEach(b => { const a = P2([b[0]])[0], e = P2([b[1]])[0]; line(c, a[0], a[1], e[0], e[1], "#c8a878"); line(c, a[0], a[1] + 1, e[0], e[1] + 1, "#6a4a30"); });
      /* subway lines */
      [[["0.43", "0.70"], ["0.47", "0.56"], ["0.5", "0.4"], ["0.56", "0.14"]], [["0.46", "0.52"], ["0.62", "0.45"], ["0.82", "0.4"]], [["0.45", "0.64"], ["0.55", "0.7"], ["0.66", "0.7"]]].forEach((ln, i) => {
        const col = ["#a0307a", "#2a88a8", "#a88a3a"][i]; let prev = null;
        ln.forEach(q => { const pt = [parseFloat(q[0]) * (W - 1), parseFloat(q[1]) * (H - 1)]; if (prev) { line(c, prev[0], prev[1], pt[0], pt[1], col); } R(c, Math.round(pt[0]) - 1, Math.round(pt[1]) - 1, 2, 2, "#c8c4d8"); prev = pt; });
      });
      /* labels */
      const lab = (t, u, v, col) => txt(c, t, Math.round(u * (W - 1) - txtW(t, 1, 1) / 2), Math.round(v * (H - 1)), col || "#9ab090", 1, 1);
      lab("N.J.", 0.12, 0.2, "#6a8a70"); lab("BRONX", 0.72, 0.045, "#a8c8a0"); lab("QUEENS", 0.88, 0.3, "#b0cca0"); lab("BROOKLYN", 0.62, 0.77, "#b0c8a0"); lab("S.I.", 0.19, 0.84, "#9ac090");
      lab("HUDSON", 0.35, 0.7, "#3a5aa0"); lab("EAST R.", 0.62, 0.64, "#3a5aa0");
      /* frame */
      R(c, 0, 0, W, 1, "#2a3a7a"); R(c, 0, H - 1, W, 1, "#0a1030");
    }

    /* ------------------------------------------------ art: spot scenes */
    function sceneBg(kind, W, H) {
      const key = kind + "|" + W + "|" + H; if (sceneCache[key]) return sceneCache[key];
      const bg = DK.cv(W, H), fg = DK.cv(W, H), c = bg.getContext("2d"), f = fg.getContext("2d"), wh = Math.floor(H * 0.55), narrow = W < 240;
      const rr = mulberry(hashStr(kind));
      const table = (cc, x, y, w, h, col, top) => safe(() => PK.table(cc, x, y, w, h, { color: col, top, seed: Math.floor(x) }));
      const sleeveRow = (cc, x, y, w, n) => { for (let i = 0; i < n; i++) { const col = ["#e8e4f0", "#c0302c", "#2f62b8", "#ffd23f", "#ff3fa4", "#39d0ff", "#f4ead0", "#3a6a3a"][Math.floor(rr() * 8)]; R(cc, x + i * Math.floor(w / n), y, Math.max(3, Math.floor(w / n) - 1), 9, col); R(cc, x + i * Math.floor(w / n), y, Math.max(3, Math.floor(w / n) - 1), 1, "#ffffff"); } };
      if (kind === "flea" || kind === "swap") {
        safe(() => PK.sky(c, 0, 0, W, wh, { time: "day", seed: 4 }));
        if (kind === "swap") { R(c, 0, Math.floor(wh * 0.55), W, Math.floor(wh * 0.45), "#2a5a9a"); for (let x = 0; x < W; x += 6) R(c, x, Math.floor(wh * 0.6) + (x % 12 ? 2 : 0), 3, 1, "#6a9ad0"); poly(c, [[W * 0.62, wh * 0.62], [W * 0.62 + 40, wh * 0.62], [W * 0.62 + 46, wh * 0.5], [W * 0.62 + 6, wh * 0.5]], "#e08a30"); R(c, W * 0.62 + 12, wh * 0.4, 14, 10, "#f4ead0"); R(c, W * 0.62 + 16, wh * 0.3, 4, 10, "#c0302c"); }
        else safe(() => PK.brick(c, 0, Math.floor(wh * 0.22), W, Math.floor(wh * 0.8), { base: "#8a4a3e", seed: 6 }));
        safe(() => PK.asphalt(c, 0, wh, W, H - wh, { seed: 2 }));
        /* striped canopies */
        const canopy = (x, y, w, col) => { poly(c, [[x, y + 14], [x + w * 0.5, y], [x + w, y + 14]], col); for (let i = 0; i < 6; i++) poly(c, [[x + i * w / 6, y + 14], [x + w * 0.5, y], [x + (i + 0.5) * w / 6, y + 14]], i % 2 ? "#f4ead0" : col); R(c, x + w / 2 - 1, y + 14, 2, 28, "#6a5a4a"); };
        canopy(2, wh - 40, narrow ? 44 : 54, "#c0302c"); canopy(W - (narrow ? 48 : 58), wh - 40, narrow ? 44 : 54, "#2f62b8");
        table(c, 4, wh - 4, narrow ? 40 : 50, 22, "#8a6a4a", "#c8b090"); table(c, W - (narrow ? 46 : 56), wh - 4, narrow ? 40 : 50, 22, "#8a6a4a", "#c8b090");
        sleeveRow(c, 8, wh - 12, narrow ? 32 : 42, 6); sleeveRow(c, W - (narrow ? 42 : 52), wh - 12, narrow ? 32 : 42, 6);
        safe(() => PK.crate(c, Math.floor(W * 0.5) - 52, wh + 6, { w: 30, h: 16, color: "#c8925a" }));
        const nm = kind === "swap" ? "SWAP MEET" : "RONNIE'S FLEA"; R(f, Math.floor(W / 2) - 38, 2, 76, 11, "#f4ead0"); R(f, Math.floor(W / 2) - 38, 2, 76, 1, "#fff"); RP.u.txtC(f, nm, Math.floor(W / 2), 5, "#c0302c", 1, 1);
        table(f, Math.floor(W / 2) - 28, H - 24, 56, 20, "#8a5a3e", "#c8b090");
        sleeveRow(f, Math.floor(W / 2) - 22, H - 32, 44, 7);
      } else if (kind === "fair") {
        safe(() => PK.concrete(c, 0, 0, W, wh, { base: "#8a9a8a", seed: 7, panelH: 18 }));
        safe(() => PK.concrete(f, 0, 0, 0, 0, {}));
        safe(() => PK.tiles(c, 0, wh, W, H - wh, { a: "#b8b0a0", b: "#8a8478", size: 28, seed: 3 }));
        safe(() => PK.fluorescent(c, 8, 0, 44)); safe(() => PK.fluorescent(c, W - 54, 0, 44));
        /* banner + bunting */
        R(c, Math.floor(W / 2) - 44, 8, 88, 13, "#f4ead0"); R(c, Math.floor(W / 2) - 44, 8, 88, 1, "#fff"); R(c, Math.floor(W / 2) - 44, 20, 88, 1, "#bfb08c"); RP.u.txtC(c, "RECORD FAIR", Math.floor(W / 2), 12, "#2f62b8", 1, 1);
        for (let x = 4; x < W - 6; x += 12) poly(c, [[x, 24], [x + 10, 24], [x + 5, 33]], ["#c0302c", "#ffd23f", "#2f62b8"][(x / 12 | 0) % 3]);
        R(c, 0, 24, W, 1, "#6a5a4a");
        /* bake sale in the corner */
        if (!narrow) { table(c, W - 52, wh - 6, 46, 20, "#8a6a4a", "#f4ead0"); R(c, W - 46, wh - 16, 10, 8, "#e0a050"); R(c, W - 32, wh - 16, 10, 8, "#c88040"); RP.u.txtC(c, "BAKE SALE", W - 29, wh - 24, "#c0302c", 1, 1); }
        table(c, 4, wh - 2, narrow ? 44 : 60, 22, "#7a7a8a", "#d8d4c8"); sleeveRow(c, 8, wh - 10, narrow ? 36 : 52, 7);
        table(f, Math.floor(W / 2) - 36, H - 26, 72, 22, "#7a7a8a", "#d8d4c8"); sleeveRow(f, Math.floor(W / 2) - 30, H - 34, 60, 9);
      } else if (kind === "apt") {
        safe(() => PK.plaster(c, 0, 0, W, wh, { base: "#c8a8a0", seed: 12, stains: 0, cracks: 0, patches: 0 }));
        for (let x = 0; x < W; x += 8) R(c, x, 0, 1, wh, "#b88c88");
        safe(() => PK.carpet(c, 0, wh, W, H - wh, { pattern: "hotel", base: "#6a3a4a", accent: "#c8a050", seed: 4 }));
        safe(() => PK.baseboard(c, 0, wh - 8, W, { color: "#8a5a48" }));
        safe(() => PK.frame(c, 8, 12, 22, 28, { color: "#6a4a30" })); safe(() => PK.frame(c, W - 32, 14, 20, 26, { color: "#6a4a30" })); safe(() => PK.window(c, Math.floor(W / 2) - 20, 8, 40, 40, { time: "day", view: "city" }));
        R(c, 12, 16, 14, 20, "#e8d8c0"); ell(c, 19, 24, 4, 5, "#c8a080"); R(c, W - 28, 18, 12, 18, "#d8c8b0"); ell(c, W - 22, 25, 3, 4, "#a8806a");
        if (!narrow) safe(() => PK.couch(c, 4, wh - 14, 70, { color: "#8a6a7a" }));
        safe(() => PK.lamp(c, narrow ? 4 : 78, wh - 26, { kind: "floor", on: true }));
        /* plastic cover sheen */
        if (!narrow) { for (let i = 0; i < 40; i++) AP2(c, 8 + (i * 7) % 60, wh - 12 + (i * 3) % 24, "#ffffff", 0.2); }
        /* cedar chest */
        const cx = Math.floor(W / 2) - 52; R(f, cx, H - 26, 44, 20, "#9a5a32"); R(f, cx, H - 26, 44, 2, "#c88a5a"); R(f, cx, H - 8, 44, 2, "#5a3018"); R(f, cx + 20, H - 22, 4, 5, "#e8c858"); for (let i = 0; i < 6; i++) R(f, cx + 3 + i * 7, H - 26 + 4, 1, 14, "#7a4222");
      } else if (kind === "thrift") {
        safe(() => PK.plaster(c, 0, 0, W, wh, { base: "#8a8aa8", seed: 21, stains: 1, cracks: 0, patches: 1 }));
        safe(() => PK.tiles(c, 0, wh, W, H - wh, { a: "#c8c4d4", b: "#9a96a8", size: 28 }));
        safe(() => PK.fluorescent(c, Math.floor(W / 2) - 22, 0, 44));
        R(c, 4, 18, W - 8, 1, "#4a4658"); for (let x = 8; x < W - 14; x += 6) { const col = ["#c0302c", "#2f62b8", "#ffd23f", "#3fa66a", "#ff3fa4", "#7a3fb0", "#e8e4f0"][Math.floor(rr() * 7)]; R(c, x, 19, 4, 18 + Math.floor(rr() * 6), col); R(c, x, 19, 4, 1, "#fff"); R(c, x + 1, 18, 1, 1, "#8a869c"); }
        RP.u.txtC(c, "ALL $2*", Math.floor(W / 2), 6, "#f4ead0", 1, 1);
        if (!narrow) safe(() => PK.shelf(c, W - 52, wh - 38, 46, 36, { items: "boxes", seed: 5 }));
        safe(() => PK.recordBins(c, 2, wh + 2, narrow ? 60 : 90, 36, { seed: 4 }));
        safe(() => PK.counter(f, Math.floor(W / 2) - 36, H - 30, 72, 26, { seed: 3 }));
      } else {                                                                 /* back room */
        safe(() => PK.concrete(c, 0, 0, W, wh, { base: "#5a566a", seed: 31 }));
        safe(() => PK.concrete(c, 0, wh, W, H - wh, { base: "#46425a", seed: 33 }));
        safe(() => PK.shelf(c, 4, 6, 50, 56, { items: "boxes", seed: 6 })); if (!narrow) safe(() => PK.shelf(c, W - 54, 6, 50, 56, { items: "records", seed: 7 }));
        safe(() => PK.bulb(c, Math.floor(W / 2), 0, { len: 12 }));
        safe(() => PK.cardboardBox(c, narrow ? 60 : 62, wh + 6, 26, 18, { seed: 3 })); safe(() => PK.cardboardBox(c, W - (narrow ? 90 : 96), wh + 8, 28, 20, { seed: 8 }));
        /* a cat asleep on a box */
        const cx = W - (narrow ? 90 : 96) + 4, cy = wh + 4; ell(f, cx + 12, cy + 2, 11, 5, "#8a8a9a"); ell(f, cx + 5, cy - 1, 4, 3, "#9a9aaa"); poly(f, [[cx + 2, cy - 4], [cx + 4, cy - 7], [cx + 6, cy - 4]], "#9a9aaa"); R(f, cx + 22, cy + 2, 6, 2, "#8a8a9a"); R(f, cx + 3, cy, 3, 1, "#3a3a4a");
        RP.u.txt(f, "ZZZ", cx + 4, cy - 14, "#cfc8ff", 1, 1);
      }
      sceneCache[key] = { bg, fg };
      return sceneCache[key];
    }
    const AP2 = (c, x, y, col, a) => DK.AP(c, x, y, col, a);

    const layout = (W, H) => ({ W, H, narrow: W < 240 });
    const refit = () => {
      const avail = root.clientWidth >= 820 ? Math.min(680, root.clientWidth - 300) : root.clientWidth;
      const fit = DK.fit(cv, { clientWidth: avail }, { scale: 2, minW: 160, maxW: 340, h: W => W < 240 ? 150 : 188, fallback: 328 });
      L = layout(fit.W, fit.H); sceneCache = {}; buildMap(); placePins();
      if (!notes.hasAttribute("data-init")) { notes.setAttribute("data-init", "1"); if (!L.narrow) notes.open = true; }
    };
    const pinsDom = {};
    function placePins() {
      pinLayer.innerHTML = "";
      places.forEach(q => {
        const b = el("button", { cls: "rh-pin", type: "button", "aria-label": q.label + ", " + q.area }, pinLayer);
        b.style.left = (q.u * (L.W - 1) * 2) + "px"; b.style.top = (q.v * (L.H - 1) * 2) + "px";
        b.addEventListener("click", e => { if (e.detail) b.blur(); selectPlace(q.id); });
        b.addEventListener("focus", () => { if (S.mode === "map") { S.sel = q.id; renderCard(); } });
        pinsDom[q.id] = b;
      });
      pinLayer.style.display = S.mode === "map" ? "" : "none";
    }

    /* ------------------------------------------------ speech / log */
    let cancelType = null;
    const log = (kind, text) => { S.log.push({ kind, text }); };
    const typeInto = (node, text) => { if (cancelType) cancelType(); cancelType = DK.typer(host, node, text, null, 12); };

    /* ------------------------------------------------ DOM render */
    const clockLabel = () => fmtT(S.min);
    function renderHud() {
      clockEl.querySelector("b").textContent = clockLabel();
      const left_ = endMin - S.min; const hh = Math.floor(left_ / 60), mm = left_ % 60;
      leftEl.innerHTML = "SHOPS CLOSE <b class='" + (left_ < 90 ? "bad" : left_ < 180 ? "warn" : "") + "'>" + (left_ > 0 ? hh + "h " + String(mm).padStart(2, "0") + "m left" : "NOW") + "</b>";
      moneyEl.querySelector("b").textContent = money(S.money); clueCnt.querySelector("b").textContent = S.clues.length;
      const fr = clamp((endMin - S.min) / (endMin - startMin), 0, 1); barFill.style.width = (fr * 100) + "%"; barW.className = "dk-bar" + (fr < 0.2 ? " bad" : fr < 0.4 ? " warn" : "");
    }
    function renderNotes() {
      nSum.innerHTML = ""; el("span", { text: "NOTEBOOK · " + S.clues.length + " CLUE" + (S.clues.length === 1 ? "" : "S") }, nSum); el("span", { text: notes.open ? "−" : "+" }, nSum);
      nList.innerHTML = "";
      S.clues.forEach(id => { const li = el("li", { cls: id === S.newClue ? "new" : "" }, nList); li.appendChild(document.createTextNode(clueObj(id).text)); if (id === S.newClue) el("span", { cls: "rh-tag", text: "NEW" }, li); });
    }
    notes.addEventListener("toggle", () => { const s2 = nSum.lastChild; if (s2) s2.textContent = notes.open ? "−" : "+"; if (notes.hasAttribute("data-auto")) notes.removeAttribute("data-auto"); else notes.setAttribute("data-user", "1"); });
    const hoursOf = q => fmtH(q.opens) + "–" + fmtH(q.closes);
    function travelInfo(q) {
      const from = S.at ? byId[S.at] : home, m = S.at === q.id ? 0 : distMin(from, q);
      return { min: m, walk: m * 3, fare: m ? FARE : 0 };
    }
    function renderCard() {
      card.innerHTML = "";
      if (S.mode === "map" || S.mode === "travel") {
        const q = byId[S.sel] || places[0], ti = travelInfo(q), arrive = S.min + ti.min, open = arrive >= q.opens * 60 && arrive < q.closes * 60;
        const h = el("h3", { text: q.label }, card); el("small", { text: q.area + " · " + hoursOf(q) + (q.visits ? " · visited" : "") }, h);
        el("div", { cls: "dk-meta", text: q.hint }, card);
        const st = el("div", { cls: "rh-status" }, card);
        el("span", { html: "FARE <b>" + money(ti.fare) + "</b>" }, st); el("span", { html: "SUBWAY <b>" + ti.min + " min</b>" }, st); el("span", { html: "WALK <b>" + ti.walk + " min</b>" }, st);
        if (q.fee) el("span", { html: "ENTRY <b>" + money(q.fee) + "</b>" }, st);
        if (!open && arrive < q.closes * 60 + 1) { /* opens later */ }
        if (arrive >= q.closes * 60) el("div", { cls: "dk-note", html: "<span class='bad' style='color:#ff7a7a'>You'd arrive after closing (" + fmtT(arrive) + ").</span>" }, card);
        else if (arrive < q.opens * 60) el("div", { cls: "dk-note", html: "<span style='color:#ffc44d'>Not open until " + fmtH(q.opens) + ". You'd wait.</span>" }, card);
        const go = el("div", { cls: "rh-go" }, card);
        const bSub = el("button", { cls: "btn primary", type: "button", html: "SUBWAY<small>" + money(ti.fare) + " · " + ti.min + " min</small>" }, go);
        const bWalk = el("button", { cls: "btn", type: "button", html: "WALK<small>free · " + ti.walk + " min</small>" }, go);
        bSub.disabled = S.money < ti.fare - 1e-9 || S.mode === "travel"; bWalk.disabled = S.mode === "travel";
        bSub.addEventListener("click", e => { if (e.detail) bSub.blur(); travelTo(q.id, "subway"); }); bWalk.addEventListener("click", e => { if (e.detail) bWalk.blur(); travelTo(q.id, "walk"); });
        if (S.money < ti.fare - 1e-9) el("div", { cls: "dk-note", text: "Not enough for the subway. Walking is free, just slow." }, card);
      } else if (S.mode === "visit") {
        const q = byId[S.at];
        const h = el("h3", { text: q.label }, card); el("small", { text: q.area + " · " + clockLabel() }, h);
        const lg = el("div", { cls: "rh-log", "aria-live": "polite" }, card);
        S.log.forEach(l => { const ln = el("p", { cls: l.kind }, lg); ln.textContent = l.text; });
        const q_ = S.log.length ? lg.lastChild : null;
        if (q_ && S.fresh) { const full = S.log[S.log.length - 1].text; S.fresh = false; typeInto(q_, full); }
        if (S.visitClosed) { el("div", { cls: "dk-note", text: "Nobody's here. The gate's chained." }, card); }
        else if (!S.found) {
          el("div", { cls: "dk-meta", text: "ASK ABOUT (10 min each):" }, card);
          const asks = el("div", { cls: "rh-asks" }, card);
          S.clues.forEach(id => {
            const cl = clueObj(id), b = el("button", { cls: "btn", type: "button" }, asks);
            b.textContent = (id <= "9" ? "" : "") + (S.clues.indexOf(id) + 1) + ". " + (cl.short || (cl.text.length > 60 ? cl.text.slice(0, 58) + "…" : cl.text));
            b.addEventListener("click", e => { if (e.detail) b.blur(); askAbout(id); });
          });
        }
        if (!S.found) { const bb = el("button", { cls: "btn", type: "button", text: "BACK TO THE MAP" }, card); bb.addEventListener("click", e => { if (e.detail) bb.blur(); leaveVisit(); }); }
      } else if (S.mode === "reveal") {
        const h = el("h3", { text: "THERE IT IS." }, card); el("small", { text: byId[S.at].label }, h);
        el("div", { cls: "dk-meta", text: "Under the mothballs and a crocheted doily: " + rec.artist + " – " + rec.title + "." }, card);
      } else if (S.mode === "intro") {
        el("h3", { text: "THE HUNT" }, card);
      }
      /* the notebook folds away on wide screens during a visit (the ask buttons already list the clues) */
      if (!L.narrow && !notes.hasAttribute("data-user")) { const want = S.mode !== "visit" && S.mode !== "reveal"; if (notes.open !== want) { notes.setAttribute("data-auto", "1"); notes.open = want; } }
      renderHud(); renderNotes();
    }

    /* ------------------------------------------------ flow */
    function selectPlace(id) {
      if (S.mode !== "map") return; S.sel = id; RP.sfx("blip"); renderCard(); try { pinsDom[id].focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
    function advance(mins) { S.min += mins; }
    function travelTo(id, how) {
      if (S.mode !== "map") return;
      const q = byId[id], ti = travelInfo(q), mins = how === "walk" ? ti.walk : ti.min;
      if (how === "subway") { if (S.money < ti.fare - 1e-9) { RP.sfx("error"); return; } S.money = Math.round((S.money - ti.fare) * 100) / 100; S.spent += ti.fare; RP.sfx("coin"); } else S.walked++;
      S.trips++;
      const from = { u: S.pos.u, v: S.pos.v }; S.mode = "travel"; pinLayer.style.display = "none";
      S.travel = { from, to: { u: q.u, v: q.v }, t: 0, dur: RM ? 0.01 : (how === "walk" ? 1.6 : 1.1), mins, how, min0: S.min, id };
      RP.sfx(how === "walk" ? "footstep" : "train");
      renderCard();
    }
    function arrive(id) {
      const q = byId[id]; S.at = id; S.pos = { u: q.u, v: q.v }; S.log = []; S.fresh = false; S.visitClosed = false;
      q.visits++;
      const now = S.min;
      if (now >= endMin) { gameOver("late"); return; }
      if (now >= q.closes * 60) {
        S.visitClosed = true; q.closedHit = true; S.mode = "visit"; S.wrong++;
        log("nar", "It's " + fmtT(now) + ". The " + q.label + " closed at " + fmtH(q.closes) + ". A hand-lettered sign: \"CLOSED. NO, REALLY.\"");
        RP.sfx("error"); S.fresh = true; renderCard(); return;
      }
      if (now < q.opens * 60) { const wait = q.opens * 60 - now; advance(wait); log("nar", "You wait " + wait + " minutes for them to open. It is a very long " + wait + " minutes."); }
      if (q.fee) { if (S.money >= q.fee) { S.money = Math.round((S.money - q.fee) * 100) / 100; S.spent += q.fee; log("nar", "You pay the " + money(q.fee) + " donation. For the roof."); } else log("nar", "You can't cover the " + money(q.fee) + " donation. They let you in for a nod and a mumbled prayer."); }
      advance(10);
      (q.intro || []).forEach(t => log("npc", t));
      S.mode = "visit"; S.fresh = true; RP.sfx("door"); renderCard(); pinLayer.style.display = "none";
    }
    function askAbout(clueId) {
      if (S.mode !== "visit" || S.found) return;
      const q = byId[S.at]; if (S.min >= endMin) { gameOver("late"); return; }
      advance(10); const key = q.id + ":" + clueId; const first = !S.asked[key]; S.asked[key] = true;
      let ent = q.asks && q.asks[clueId];
      if (q.generic) {                                          /* custom places: the final spot finds it, others hand out the next clue */
        if (q.final) ent = { say: q.say ? [].concat(q.say) : ["YOU: \"I'm looking for '" + rec.title + "'.\"", "\"...You're in luck.\""], found: true };
        else ent = { say: [q.say ? [].concat(q.say)[0] : q.fallback.say[0]], gives: (extraG.find(g => !S.clues.includes(g.id)) || {}).id || null };
      }
      S.log = S.log.slice(-3);
      if (ent) {
        ent.say.forEach(t => log(t.startsWith("YOU") ? "you" : t.startsWith("She ") || t.startsWith("The chain") || t.startsWith("He ") ? "nar" : "npc", t));
        if (ent.found) { S.fresh = true; foundIt(); return; }
        const c = giveClue(ent.gives); if (c) { log("nar", "New clue in your notebook."); RP.sfx("ping"); q.done = true; } else RP.sfx("click");
      } else {
        const fb = q.fallback || { say: ["Nothing. Nobody knows anything."] };
        if (first || !q.gaveFallback) fb.say.forEach(t => log(t.startsWith("YOU") ? "you" : "npc", t)); else log("npc", "\"We already did this. Do you need a coat?\"");
        if (fb.junk && !q.junkShown) { q.junkShown = true; const jid = FLAVOR_JUNK[Math.floor(rnd() * FLAVOR_JUNK.length)], jr = RP.rec(jid); log("nar", "You flip a bin: " + jr.artist + " – " + jr.title + " (" + jr.label + ", " + jr.year + "). Not it."); }
        const c = !q.gaveFallback ? giveClue(fb.gives) : null; q.gaveFallback = true;
        if (c) { log("nar", "New clue in your notebook."); RP.sfx("ping"); } else { RP.sfx("error"); if (!q.wrongCounted) { q.wrongCounted = true; S.wrong++; } }
        if (!q.wrongCounted && q.id !== sc.final) { q.wrongCounted = true; S.wrong++; }
      }
      S.fresh = true; renderCard();
      if (S.min >= endMin) { host.timeout(() => gameOver("late"), 900); }
    }
    function leaveVisit() {
      if (S.mode !== "visit") return; S.mode = "map"; S.at = q_at(); S.log = []; S.newClue = S.newClue; pinLayer.style.display = ""; RP.sfx("door");
      if (S.min >= endMin) { gameOver("late"); return; }
      renderCard();
    }
    const q_at = () => S.at;

    /* ------------------------------------------------ the reveal + end */
    function foundIt() {
      S.found = true; S.mode = "reveal"; S.revealT = 0; renderCard(); RP.sfx("success");
      host.timeout(() => RP.sfx("cheer"), 500);
      host.timeout(() => endCard(true), RM ? 600 : 3600);
    }
    function gameOver(why) {
      if (S.over) return; S.over = true; S.mode = "over"; RP.sfx("alarm");
      endCard(false, why);
    }
    function scoreIt(found) {
      const left = clamp((endMin - S.min) / (endMin - startMin), 0, 1);
      if (found) return Math.round(clamp(52 + 22 * left + 10 * clamp(S.money / startMoney, 0, 1) + 16 * clamp(1 - S.wrong / 4, 0, 1), 0, 100));
      return Math.round(clamp(S.clues.length * 6 + places.filter(q => q.done).length * 3, 0, 34));
    }
    let finish = null, ended = false;
    function endCard(found, why) {
      if (ended) return; ended = true; S.over = true;
      const score = scoreIt(found), res = { ok: found, score, found };
      root.innerHTML = ""; host.header("record.Hunt", "NYC · one record · one day");
      const box = el("div", { cls: "dk-end mg-panel" }, root);
      el("h2", { cls: found ? "ok" : "bad", text: found ? "FOUND IT." : why === "give" ? "YOU GAVE UP." : "THE CITY CLOSED ON YOU." }, box);
      el("div", { cls: "dk-score", html: score + "<small>/ 100</small>" }, box);
      if (found) {
        const rv = el("div", { cls: "rh-reveal" }, box); const cc = DK.cv(96, 96); cc.className = "px"; cc.getContext("2d").drawImage(DK.sleeveCanvas(rec, DK.makeCopy(rec, mulberry(3), { cond: "vg+" }), 96), 0, 0); rv.appendChild(cc);
        const d = el("div", { cls: "dk-info" }, rv); el("div", { cls: "dk-title", html: "" }, d).appendChild(document.createTextNode(rec.artist + " – " + rec.title));
        el("div", { cls: "dk-meta", text: [rec.label, rec.year, rec.format, rec.genre].filter(Boolean).join(" · ") + " · guide ~" + money(rec.price) }, d);
        if (rec.fact) el("div", { cls: "dk-fact", text: rec.fact }, d);
      } else el("div", { cls: "dk-meta", text: why === "give" ? "The record is still out there. So is the cat." : "It's " + fmtT(S.min) + ". Every door in the five boroughs has a sign on it. The record is still out there." }, box);
      const lines = el("div", { cls: "dk-lines" }, box); const ln = (a, b) => { const dd = el("div", {}, lines); el("span", { text: a }, dd); el("span", { text: b }, dd); };
      ln("Time", fmtT(S.min) + " (of " + fmtT(endMin) + ")"); ln("Cash left", money(S.money) + " of " + money(startMoney)); ln("Spots visited", places.filter(q => q.visits).length + " of " + places.length); ln("Clues", String(S.clues.length)); ln("Dead ends", String(S.wrong));
      const row = el("div", { cls: "row" }, box); el("div", { cls: "spacer" }, row);
      const go = el("button", { cls: "btn primary", type: "button", text: "CONTINUE" }, row);
      go.addEventListener("click", () => finish && finish(res));
      host.onKey(e => { if (e.key === "Enter" && document.activeElement !== go) { e.preventDefault(); go.click(); } });
      setTimeout(() => { try { go.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 30);
      RP.sfx(found ? "success" : "fail");
    }

    /* ------------------------------------------------ intro */
    const mainBits = [hud, barW, cols, msg, foot]; mainBits.forEach(n => { n.style.display = "none"; });
    const intro = el("div", { cls: "cd-intro mg-panel" }, root);
    el("h2", { text: "THE HUNT" }, intro);
    el("div", { cls: "dk-meta", html: "Somewhere in the five boroughs is a clean copy of <b>" + DK.ascii(rec.artist) + " – " + DK.ascii(rec.title) + "</b> (" + [rec.label, rec.year].filter(Boolean).join(", ") + "). It's 10 AM. Everything closes by <b>" + fmtH(Math.floor(endMin / 60)) + (endMin % 60 ? ":" + endMin % 60 : "") + "</b>." }, intro);
    const ul = el("ul", {}, intro);
    el("li", { html: "Pick a spot on the map. <b class='s'>Subway</b> costs " + money(FARE) + " and is quick. <b class='k'>Walking</b> is free and takes three times as long." }, ul);
    el("li", { html: "At a spot, <b>ASK ABOUT</b> a clue from your notebook. Right question, right place: a new lead. Wrong place: a funny dead end, usually with a hint." }, ul);
    el("li", { html: "Mind the opening hours. Some places close early, and the clock doesn't care." }, ul);
    el("li", { html: "You have " + money(startMoney) + ". Start with Ray's tip." }, ul);
    const irow = el("div", { cls: "row" }, intro); const bL2 = el("button", { cls: "btn", type: "button", text: "LEAVE" }, irow); el("div", { cls: "spacer" }, irow); const bStart = el("button", { cls: "btn primary", type: "button", text: "START HUNTING" }, irow);
    blurM(bL2); blurM(bStart);
    const startGame = () => { if (S.mode !== "intro") return; S.mode = "map"; intro.remove(); mainBits.forEach(n => { n.style.display = ""; }); pinLayer.style.display = ""; RP.sfx("whoosh"); renderCard(); msg.textContent = "Tip: read the notebook, then pick the spot that fits the clue."; };
    bStart.addEventListener("click", startGame);
    const quit = () => { if (S.over) return; S.over = true; ended = true; finish && finish({ ok: false, score: 0, found: false }); };
    bL2.addEventListener("click", quit);
    bLeave.addEventListener("click", () => { if (S.over || S.mode === "reveal") return; if (S.mode === "intro") { quit(); return; } quit(); });
    setTimeout(() => { try { bStart.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 30);

    /* ------------------------------------------------ input */
    host.onKey(e => {
      if (S.over || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key, onBtn = document.activeElement && document.activeElement.tagName === "BUTTON";
      if (S.mode === "intro") { if ((k === "Enter" || k === " ") && !onBtn) { e.preventDefault(); startGame(); } return; }
      if (S.mode === "map") {
        const idx = places.findIndex(q => q.id === S.sel);
        if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); selectPlace(places[(idx + 1) % places.length].id); }
        else if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); selectPlace(places[(idx - 1 + places.length) % places.length].id); }
        else if ((k === "Enter" || k === "s" || k === "S") && !(onBtn && k === "Enter")) { e.preventDefault(); const q = byId[S.sel], ti = travelInfo(q); travelTo(S.sel, S.money >= ti.fare - 1e-9 ? "subway" : "walk"); }
        else if (k === "w" || k === "W") travelTo(S.sel, "walk");
      } else if (S.mode === "visit") {
        if (/^[1-9]$/.test(k)) { const id = S.clues[+k - 1]; if (id && !S.found && !S.visitClosed) askAbout(id); }
        else if (k === "Escape" || k === "Backspace") leaveVisit();
      }
    });

    /* ------------------------------------------------ drawing */
    const pinIcon = (c, x, y, kind, state, t) => {
      const col = state === "done" ? "#7a76a0" : state === "closed" ? "#a05a5a" : "#ffc44d", k = ramp(col);
      ell(c, x, y + 9, 3, 1, "#0a1030");
      poly(c, [[x - 5, y - 1], [x + 5, y - 1], [x, y + 8]], "#140a24");
      ell(c, x, y - 3, 6, 6, "#140a24");
      poly(c, [[x - 4, y], [x + 4, y], [x, y + 6]], col);
      ell(c, x, y - 3, 5, 5, col); ell(c, x - 1, y - 4, 3, 3, k[3]); ell(c, x, y - 3, 4, 4, col);
      R(c, x - 3, y - 6, 3, 1, k[4]);
      const g = { flea: "F", fair: "R", apt: "H", thrift: "T", back: "B", swap: "S" }[kind] || "?"; txt(c, g, x - 1, y - 5, "#1d1230", 1, 0);
    };
    function drawMap(c, t, dt) {
      c.drawImage(mapCv, 0, 0);
      const px = u => Math.round(u * (L.W - 1)), py = v => Math.round(v * (L.H - 1));
      /* route preview */
      const sel = byId[S.sel];
      if (S.mode === "map" && sel) { const a = S.pos, b = sel; const n = 14; for (let i = 1; i < n; i += 2) { const tt = i / n; R(c, px(a.u + (b.u - a.u) * tt), py(a.v + (b.v - a.v) * tt), 2, 2, "#ffffff"); } }
      /* pins */
      places.forEach(q => {
        const state = q.done || q.visits && !q.final && q.gaveFallback ? "done" : q.closedHit ? "closed" : "open";
        const bob = (q.id === S.sel && S.mode === "map" && !RM) ? Math.round(Math.sin(t / 220) * 1.5) : 0;
        pinIcon(c, px(q.u), py(q.v) - 4 + bob, q.kind, state, t);
        if (q.id === S.sel && S.mode === "map") { const lab = DK.ascii(q.label).toUpperCase(); const w = txtW(lab, 1, 1) + 6; let lx = Math.round(px(q.u) - w / 2); lx = clamp(lx, 1, L.W - w - 1); const ly = py(q.v) + 6; R(c, lx, ly, w, 9, "#0c0618"); R(c, lx, ly, w, 1, "#ffc44d"); txt(c, lab, lx + 3, ly + 2, "#ffe8a0", 1, 1); }
      });
      /* you */
      const mx = px(S.pos.u), my = py(S.pos.v);
      if (!S.at && S.mode !== "travel") { R(c, mx - 3, my - 3, 7, 7, "#ff3fa4"); R(c, mx - 2, my - 2, 5, 5, "#ffffff"); R(c, mx - 1, my - 1, 3, 3, "#ff3fa4"); txt(c, "YOU", mx - 5, my + 5, "#ffd0ec", 1, 1); }
      else if (S.at && S.mode !== "travel") { R(c, mx - 4, my + 4, 9, 2, "#ff3fa4"); }
      /* travelling dot */
      if (S.travel) {
        const tr = S.travel; tr.t += dt / Math.max(0.01, tr.dur); const e = DK.ease(tr.t);
        const u = tr.from.u + (tr.to.u - tr.from.u) * e, v = tr.from.v + (tr.to.v - tr.from.v) * e;
        for (let i = 0; i < 12; i++) { const tt = e * i / 12; R(c, px(tr.from.u + (tr.to.u - tr.from.u) * tt), py(tr.from.v + (tr.to.v - tr.from.v) * tt), 1, 1, "#ff8fcf"); }
        R(c, px(u) - 2, py(v) - 2, 5, 5, "#ff3fa4"); R(c, px(u) - 1, py(v) - 1, 3, 3, "#ffffff");
        S.min = Math.round(tr.min0 + tr.mins * clamp(e, 0, 1));
        if (tr.t >= 1) { S.min = tr.min0 + tr.mins; S.travel = null; arrive(tr.id); }
      }
    }
    function drawScene(c, t) {
      const q = byId[S.at]; if (!q) return;
      const sb = sceneBg(q.kind === "swap" ? "swap" : q.kind, L.W, L.H);
      c.drawImage(sb.bg, 0, 0);
      const npcId = q.npc, scl = L.narrow ? 0.82 : 1.0;
      if (!S.visitClosed) {
        const talking = !RM && S.fresh === false && t - S.lastNpcTalk < 2600;
        safe(() => RP.chars.draw(c, { id: npcId, x: Math.floor(L.W / 2) + (q.kind === "apt" ? 18 : 0), y: L.H - 12, face: "front", act: "stand", frame: 0, mouth: !RM && Math.floor(t / 120) % 2 === 0 && S.mode === "visit" && (t - S.sayT < 2200), blink: Math.floor(t / 2700) % 7 === 0 && (t % 2700) < 150, scale: scl }, { lx: -0.3, shadow: 0.5, cast: false }));
      }
      c.drawImage(sb.fg, 0, 0);
      if (S.visitClosed) { c.globalAlpha = 0.5; R(c, 0, 0, L.W, L.H, "#0a0614"); c.globalAlpha = 1; R(c, Math.floor(L.W / 2) - 36, Math.floor(L.H / 2) - 14, 72, 28, "#c0302c"); R(c, Math.floor(L.W / 2) - 36, Math.floor(L.H / 2) - 14, 72, 2, "#ff7a6a"); RP.u.txtC(c, "CLOSED", Math.floor(L.W / 2), Math.floor(L.H / 2) - 6, "#ffffff", 2, 1); }
      /* label plate */
      DK.labelPlate(c, Math.floor(L.W / 2), L.H - 14, q.npcName + " · " + clockLabel(), "#3a2418");
    }
    function drawReveal(c, t, dt) {
      S.revealT += dt; const T = S.revealT, q = byId[S.at];
      drawScene(c, t);
      c.globalAlpha = clamp(T / 0.6, 0, 0.72); R(c, 0, 0, L.W, L.H, "#0a0614"); c.globalAlpha = 1;
      const cx = Math.floor(L.W / 2), cy = Math.floor(L.H * 0.46), Sz = L.narrow ? 72 : 96;
      /* light rays */
      if (!RM) for (let i = 0; i < 12; i++) { const a0 = T * 0.4 + i / 12 * 6.283, a1 = a0 + 0.12, rr = Math.max(L.W, L.H); poly(c, [[cx, cy], [cx + Math.cos(a0) * rr, cy + Math.sin(a0) * rr], [cx + Math.cos(a1) * rr, cy + Math.sin(a1) * rr]], "rgba(255,240,170,0.10)"); }
      const rise = RM ? 1 : DK.ease(clamp((T - 0.5) / 1.1, 0, 1));
      const copy = DK.makeCopy(rec, mulberry(3), { cond: "vg+" });
      const y = Math.round(cy + Sz * 0.5 - rise * Sz * 0.9 - Sz * 0.1);
      c.drawImage(DK.sleeveCanvas(rec, copy, Sz), cx - Math.floor(Sz / 2), y);
      for (let i = 0; i < 14; i++) { const a = T * 1.3 + i * 0.9, rr = 16 + (i * 13) % 40; const sx = Math.round(cx + Math.cos(a) * rr * 1.5), sy = Math.round(y + Sz / 2 + Math.sin(a * 1.2) * rr); if ((Math.floor(T * 8) + i) % 3) txt(c, "*", sx, sy, i % 2 ? "#fff6d8" : "#ffd23f", 1, 0); }
      if (T > 1.4) { const b = "YOU FOUND IT!"; const w = txtW(b, 2, 1) + 12; R(c, cx - w / 2, Math.floor(L.H * 0.04), w, 17, "#0c0618"); R(c, cx - w / 2, Math.floor(L.H * 0.04), w, 1, "#ffd23f"); RP.u.txtC(c, b, cx, Math.floor(L.H * 0.04) + 4, "#ffd23f", 2, 1); }
    }
    cv.setAttribute("tabindex", "-1");

    /* ------------------------------------------------ boot */
    refit();
    let rto = null; const onResize = () => { clearTimeout(rto); rto = setTimeout(() => { if (!S.over) { refit(); renderCard(); } }, 120); };
    window.addEventListener("resize", onResize); host.cleanup(() => window.removeEventListener("resize", onResize));
    renderCard();
    if (p.debug) window.__rh = { S, places, clueList, sc, byId, rec, endMin, startMoney };

    return new Promise(resolve => {
      let resolved = false;
      finish = res => { if (resolved) return; resolved = true; resolve(res); };
      let last = null;
      host.raf(tm => {
        if (resolved) return false;
        const dt = last == null ? 0.016 : clamp((tm - last) / 1000, 0, 0.1); last = tm;
        if (!S.over || S.mode === "reveal") {
          const c = cv.getContext("2d");
          if (L) {
            if (S.mode === "visit") drawScene(c, tm); else if (S.mode === "reveal") drawReveal(c, tm, dt); else drawMap(c, tm, dt);
            if (S.mode === "visit" || S.mode === "reveal") { /* keep the HUD ticking */ }
          }
          if (S.mode === "map" || S.mode === "travel") renderHudLite();
        }
      });
      host.cleanup(() => { resolved = true; });
      let lastMin = -1; function renderHudLite() { if (S.min !== lastMin) { lastMin = S.min; renderHud(); } }
    });
  }
});
})();
