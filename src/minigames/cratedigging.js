/* crate.Digging — a collector's estate is dumped in boxes. Sort every record against the
   clock: KEEP the heat, SELL to the dealer, JUNK the rest. Spot the gems (rare records in
   decent condition), keep the best copy of a duplicate, don't feed the dealer garbage.
   Params (all optional):
     { records: [ids] (the collection, repeats = duplicates), budget: $ (what the lot cost you),
       time: seconds, difficulty: 1..5, seed?, keepSlots? (default 6) }
   Result: { ok, score (0..100), keep: [ids], sold: [ids], profit }
     profit = cash from the dealer minus the lot price (can be negative).
     Extra fields: cash, net (cash + 60% of the kept records' book value - lot), junked: [ids], undecided: n.
     ok = net >= 0 and you kept at least one record. LEAVE resolves { ok:false }.
   Uses RP.digkit (digkit_lib.js) inside play(). */
(function () {
"use strict";
const RP = window.RP;
const { mulberry, hashStr, clamp } = RP.u;

const CSS = `
.cd-clock { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; }
.cd-clock .dk-bar { height: 14px; }
.cd-clock b { font-size: 26px; font-weight: 400; font-variant-numeric: tabular-nums; color: #fff; }
.cd-clock b.warn { color: var(--amber); } .cd-clock b.bad { color: #ff5a5a; }
.cd-decide { display: grid; grid-template-columns: 1fr 1.25fr 1fr; gap: 6px; }
.cd-decide .btn { font-size: 21px; padding: 10px 4px; line-height: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.cd-decide .btn small { font-size: 16px; color: inherit; opacity: .85; }
.cd-decide .junk { border-color: #7a4a4a; } .cd-decide .junk:hover { color: #ff7a7a; border-color: #ff7a7a; }
.cd-decide .sell { border-color: #6a5a20; color: var(--amber); } .cd-decide .sell:hover { border-color: var(--amber); }
.cd-decide .keep { border-color: #2a7a4a; color: var(--ok); } .cd-decide .keep:hover { border-color: var(--ok); }
.cd-decide .btn:disabled { opacity: .35; }
.cd-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.cd-tag { font-size: 16px; padding: 1px 6px; border: 1px solid #3a3070; border-radius: 2px; color: var(--muted); }
.cd-tag.hot { color: var(--amber); border-color: #6a5a20; } .cd-tag.dup { color: var(--cyan); border-color: #2a6a80; } .cd-tag.gem { color: #5cff9a; border-color: #2a7a4a; }
.cd-intro { display: flex; flex-direction: column; gap: 10px; }
.cd-intro h2 { font-family: var(--logo); font-weight: 400; font-size: clamp(14px, 3vw, 20px); margin: 0; color: #fff; line-height: 1.3; }
.cd-intro ul { margin: 0; padding-left: 20px; font-size: 21px; line-height: 1.1; color: var(--fg); }
.cd-intro li { margin-bottom: 4px; } .cd-intro li b { font-weight: 400; }
.cd-intro .k { color: var(--ok); } .cd-intro .s { color: var(--amber); } .cd-intro .j { color: #ff7a7a; }
.cd-look { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cd-look .btn { flex: 0 0 auto; }
@media (max-width: 520px) { .cd-decide .btn { font-size: 20px; padding: 8px 2px; } .cd-intro ul { font-size: 19px; } .cd-clock b { font-size: 22px; } }
`;
let cssDone = false;

const MORT = {
  intro: ["Gus's whole basement? Let's see what the old man hid.", "Don't touch the plastic sheet. That's the good gear. I mean, the dusty gear."],
  keep: ["Keeping that one. Fine taste. For a kid.", "Into the crate. Don't let it near the radiator.", "A keeper. Even I felt that."],
  keepGem: ["Wait. WAIT. Is that what I think it is?", "You're keeping THAT? ...Yeah. Yeah, I would too."],
  sell: ["Cash on the table.", "Now we're talking.", "I'll take it. I'll regret it. But I'll take it."],
  sellGem: ["Ha! Pleasure doing business. You have no idea.", "Sold. Don't look it up. Seriously."],
  junk: ["Into the bag. Some things get a funeral.", "Landfill. Next.", "Not even I take that."],
  junkValuable: ["Hold on, you're throwing THAT out?!", "That's a good one. You sure?"],
  refuse: ["Can't move that. It's more crack than vinyl.", "Beat to death. I only buy the living."],
  junkSell: ["That's garbage. I'm not a landfill.", "More junk? My van has standards. Low ones."],
  dup: ["Two of those. Keep the clean one, sell the other.", "Duplicate. You don't need a second copy, do you?"],
  full: ["Crate's full. Something's gotta go.", "Six slots. You're a DJ, not a library."],
  hurry: ["Clock's ticking. The nephew's coming back at six.", "Faster. The nephew wants the van moved."],
  late: ["Time! The nephew's here. Everything else goes in a dumpster.", "That's the bell. The rest is mulch."],
  look: ["Looking it up. Guide book, page ... a lot.", "Don't trust my offer. Trust the book."],
  love: ["Today I'm paying extra for $G. Don't spend it all in one place."]
};

RP.mg.register("crateDigging", {
  title: "crate.Digging", order: 6,
  desc: "A dead collector's boxes: keep the gems, sell the rest to the dealer, junk the trash. Beat the clock.",
  auto(p, S) {
    p = p || {};
    const ids = Array.isArray(p.records) && p.records.length ? p.records.slice() : ["cece_peniston_finally", "loose_joints_is_it_all_over_my_face", "dinosaur_l_go_bang", "phuture_acid_tracks", "peech_boys_dont_make_me_wait", "taana_gardner_heartbeat", "black_box_ride_on_time", "snap_rhythm_is_a_dancer", "crystal_waters_gypsy_woman", "grover_washington_jr_winelight", "model_500_no_ufos", "cybotron_clear"];
    const recs = ids.map(id => RP.rec(id));
    const worth = recs.reduce((a, r) => a + r.price, 0), budget = p.budget != null ? p.budget : Math.round(worth * 0.4 / 5) * 5;
    const order = recs.map((r, i) => ({ r, i })).sort((a, b) => b.r.price - a.r.price), seen = new Set(), keep = [], sold = [];
    order.forEach(o => {
      if (!keep.length || (keep.length < 4 && o.r.price >= 25 && !seen.has(o.r.id))) { keep.push(o.r.id); seen.add(o.r.id); }
      else if (o.r.price >= 6) sold.push(o.r.id);
    });
    const cash = sold.reduce((a, id) => a + Math.round(RP.rec(id).price * 0.5), 0);
    return { ok: true, score: 82, keep, sold, profit: cash - budget };
  },
  async play(host, p) {
    p = p || {};
    const DK = RP.digkit;
    if (!DK) return { ok: false, score: 0, keep: [], sold: [], profit: 0, error: "digkit missing" };
    if (!cssDone) { RP.u.el("style", { text: CSS }, document.head); cssDone = true; }
    DK.css(); DK.chars();
    const { el } = RP.u, money = DK.money, RM = DK.reduced(), R = RP.u.R, ramp = RP.u.ramp, PK = RP.PK;
    const safe = fn => { try { fn(); } catch (e) { /* art must never break the game */ } };
    const diff = clamp(Math.round(p.difficulty || 2), 1, 5);
    const seed = p.seed != null ? p.seed : Math.floor(Math.random() * 1e9), rnd = mulberry(seed);
    const slots = p.keepSlots || 6;

    /* ------------------------------------------------ the collection */
    const owned = new Set((host.S && host.S.records) || []);
    const ids = Array.isArray(p.records) && p.records.length ? p.records.slice() : DK.estate(rnd, diff, owned);
    const copies = ids.map((id, i) => {
      const rec = RP.rec(id);
      const c = DK.makeCopy(rec, rnd, { mix: [8, 32, 38, 22] });
      c.n = i; c.looked = false; c.decision = null; c.offer = 0;
      return c;
    });
    copies.forEach(c => { c.dups = copies.filter(o => o !== c && o.id === c.id); });
    const N = copies.length;
    const timeTotal = p.time != null ? p.time : Math.round(N * [6.5, 5.5, 5, 4.2, 3.6][diff - 1]);
    const rate = [0.6, 0.57, 0.55, 0.52, 0.5][diff - 1];
    /* the dealer's weakness of the day: a genre he pays extra for */
    const gcount = {}; copies.forEach(c => { if (c.rec.rarity !== "rare" && c.cond.id !== "beat") gcount[c.rec.genre] = (gcount[c.rec.genre] || 0) + 1; });
    const love = Object.keys(gcount).sort((a, b) => gcount[b] - gcount[a] || (a < b ? -1 : 1))[0] || null;
    const loveWord = love ? love.split(" ")[0] : null;
    const gems = copies.filter(c => c.rec.rarity === "rare" && c.cond.id !== "beat");
    const useful = c => ({ common: 1, uncommon: 3, rare: 8 }[c.rec.rarity] || 1) * ({ mint: 1.1, "vg+": 1, vg: 0.7, beat: 0.1 }[c.cond.id]);

    /* the lot's price: a fraction of what an ideal sorter nets from selling everything but the best keepers */
    const idealKeep = (() => { const by = new Map(); copies.forEach(c => { const b = by.get(c.id); if (!b || useful(c) > useful(b)) by.set(c.id, c); }); return new Set([...by.values()].sort((a, b) => useful(b) - useful(a)).slice(0, slots)); })();
    const idealCash = copies.reduce((a, c) => a + (idealKeep.has(c) ? 0 : DK.dealerOffer(c, 1, rate, love)), 0);
    const budget = p.budget != null ? p.budget : Math.max(10, Math.round(idealCash * [0.8, 0.9, 0.95, 1.0, 1.05][diff - 1] / 5) * 5);

    /* ------------------------------------------------ state */
    const S = { i: 0, cash: 0, keep: [], sold: [], junk: [], hist: [], t: timeTotal, started: false, done: false, mood: 1, lookups: 0, fly: null, floats: [], undos: 0, mistakes: 0, junkSales: 0, hurried: false, say: "", sayT: 0 };
    const cur = () => copies[S.i] || null;
    const offerNow = c => c ? DK.dealerOffer(c, S.mood, rate, love) : 0;

    /* ------------------------------------------------ DOM */
    const root = host.root; root.classList.add("dk");
    host.header("crate.Digging", "Estate sale · Ridgewood, Queens");
    const clock = el("div", { cls: "cd-clock" }, root);
    const barW = el("div", { cls: "dk-bar" }, clock); const barFill = el("i", {}, barW);
    const timeEl = el("b", { text: "" }, clock);
    const hud = el("div", { cls: "dk-hud" }, root);
    const lotEl = el("span", { html: "LOT <b></b>" }, hud), cashEl = el("span", { html: "CASH <b></b>" }, hud), netEl = el("span", { html: "PROFIT <b></b>" }, hud);
    if (loveWord) el("div", { cls: "want", html: "TODAY MORT PAYS EXTRA FOR: <b style='color:#ffc44d;font-weight:400'>" + DK.ascii(love).toUpperCase() + "</b>" }, hud);
    const cols = el("div", { cls: "dk-cols" }, root);
    const left = el("div", { cls: "dk-info" }, cols), right = el("div", { cls: "dk-info" }, cols);
    const cv = el("canvas", { cls: "px", role: "img", tabindex: "0", "aria-label": "Estate boxes. Left arrow junk, down arrow sell, right arrow keep." }, left);
    const decide = el("div", { cls: "cd-decide" }, left);
    const bJunk = el("button", { cls: "btn junk", type: "button", html: "◀ JUNK<small>bin it</small>" }, decide);
    const bSell = el("button", { cls: "btn sell", type: "button", html: "▼ SELL<small></small>" }, decide);
    const bKeep = el("button", { cls: "btn keep", type: "button", html: "KEEP ▶<small></small>" }, decide);
    const info = el("div", { cls: "dk-info mg-panel" }, right);
    const iTitle = el("div", { cls: "dk-title" }, info), iMeta = el("div", { cls: "dk-meta" }, info), iNote = el("div", { cls: "dk-note" }, info), iTags = el("div", { cls: "cd-tags" }, info);
    const look = el("div", { cls: "cd-look" }, info);
    const bLook = el("button", { cls: "btn sm", type: "button", text: "LOOK IT UP (−3s)" }, look); const iGuide = el("span", { cls: "dk-meta", text: "" }, look);
    const sayBox = el("div", { cls: "dk-say", "aria-live": "polite" }, right);
    sayBox.appendChild(DK.portrait("dk_mort"));
    const sayCol = el("div", {}, sayBox); el("div", { cls: "who", text: "MORT, THE DEALER" }, sayCol);
    const sayTxt = el("div", { cls: "txt" }, sayCol);
    const keysEl = el("div", { cls: "dk-keys", html: "<kbd>←</kbd> junk · <kbd>↓</kbd> sell · <kbd>→</kbd> keep · <kbd>G</kbd> look up · <kbd>U</kbd> undo (−2s)" }, right);
    const msg = el("div", { cls: "mg-msg", "aria-live": "polite" }, root);
    const foot = el("div", { cls: "row" }, root);
    const bLeave = el("button", { cls: "btn", type: "button", text: "LEAVE" }, foot); el("div", { cls: "spacer" }, foot);
    const bUndo = el("button", { cls: "btn", type: "button", text: "UNDO (−2s)" }, foot);
    const bFinish = el("button", { cls: "btn", type: "button", text: "DONE SORTING" }, foot);
    const mouseBlur = b => b.addEventListener("click", e => { if (e.detail) b.blur(); });
    [bLook, bJunk, bSell, bKeep, bLeave, bUndo, bFinish].forEach(mouseBlur);

    /* ------------------------------------------------ canvas art */
    let L = null, bgCv = null, coneCv = null, boxCv = null, dust = null;
    /* arrow-mapped scene: JUNK flanks the box on the left, KEEP on the right, SELL (Mort's table) below */
    const layout = (W, H) => {
      const narrow = W < 240, Sz = narrow ? 64 : 80, boxW = Sz + (narrow ? 20 : 34), cx = Math.floor(W / 2);
      const yCard = narrow ? 22 : 28, boxY = yCard + Math.round(Sz * 0.8), floorY = boxY + 20;
      const tw = narrow ? 64 : 84, tableY = floorY + 8;
      return { W, H, narrow, S: Sz, boxW, cx, yCard, boxY, floorY, tw, tableY, tx: cx - Math.floor(tw / 2), wallH: boxY + 6,
        junkX: Math.round((cx - boxW / 2) / 2), keepX: Math.round(W - (cx - boxW / 2) / 2), peeks: narrow ? 4 : 5 };
    };
    function buildBg() {
      const { W, H } = L; bgCv = DK.cv(W, H); const c = bgCv.getContext("2d");
      safe(() => PK.concrete(c, 0, 0, W, L.wallH, { base: "#6a6680", seed: 5 }));
      safe(() => PK.dshade(c, 0, 0, W, L.wallH, "#0a0414", (x, y) => 0.22 + 0.4 * (1 - y / L.wallH), 0.55));
      safe(() => PK.concrete(c, 0, L.wallH, W, H - L.wallH, { base: "#4e4a5e", seed: 9, panelH: 22 }));
      safe(() => PK.dshade(c, 0, L.wallH, W, 6, "#0a0414", (x, y) => 1 - (y - L.wallH) / 6, 0.5));
      /* wide: shelf of boxes and a dust-sheeted turntable on the wall */
      if (!L.narrow) {
        safe(() => PK.shelf(c, 6, 8, 54, 46, { items: "boxes", seed: 3 }));
        safe(() => PK.shelf(c, W - 60, 8, 54, 46, { items: "records", seed: 8 }));
        /* two turntables under a dust sheet on the floor, bottom left */
        safe(() => { const x = 8, y = L.H - 34; PK.turntable(c, x, y, {}); RP.u.poly(c, [[x - 2, y + 32], [x + 4, y + 12], [x + 22, y + 4], [x + 48, y + 7], [x + 58, y + 16], [x + 56, y + 32]], "#cfc8d8"); RP.u.poly(c, [[x + 34, y + 6], [x + 58, y + 16], [x + 56, y + 32], [x + 38, y + 32]], "#b0a8c0"); for (let k = 0; k < 4; k++) RP.u.line(c, x + 8 + k * 10, y + 32, x + 11 + k * 10, y + 12 + (k % 2) * 4, "#a098b4"); });
      }
      safe(() => PK.bulb(c, L.cx, 0, { len: 6 }));
      safe(() => PK.speckle(c, 0, L.wallH + 8, W, H - L.wallH - 8, ["#3a364a", "#6a6680"], 0.012, 2));
      coneCv = DK.cv(W, H); const cc = coneCv.getContext("2d");
      for (let y = 10; y < H; y++) for (let x = 0; x < W; x++) {
        const dx = (x - L.cx) / (W * 0.5), dy = (y - 14) / (H * 0.95), d = Math.sqrt(dx * dx + dy * dy); if (d > 1) continue;
        if ((1 - d) * 0.8 * 16 > RP.u.bayer(x, y)) { cc.fillStyle = "#ffe2a0"; cc.fillRect(x, y, 1, 1); }
      }
      /* the box the records stand in */
      boxCv = DK.cv(L.boxW, 20); DK.drawBinFront(boxCv.getContext("2d"), 0, 0, L.boxW, 20, null, { wood: "#c8925a" });
      const bc = boxCv.getContext("2d"); R(bc, Math.floor(L.boxW / 2) - 8, 0, 16, 4, "#d8c8a0"); R(bc, Math.floor(L.boxW / 2) - 8, 3, 16, 1, "#a8986a");
      /* floor props: stacked boxes */
      if (!L.narrow) safe(() => PK.cardboardBox(c, 10, L.floorY - 26, 26, 18, { seed: 2 }));
    }
    const refit = () => {
      const avail = root.clientWidth >= 820 ? Math.min(680, root.clientWidth - 300) : root.clientWidth;
      const fit = DK.fit(cv, { clientWidth: avail }, { scale: 2, minW: 160, maxW: 340, h: W => W < 240 ? 150 : 180, fallback: 328 });
      L = layout(fit.W, fit.H); buildBg();
      dust = DK.dust(RM ? 0 : 12, [L.cx - 50, 8, 100, L.floorY - 10], Math.random);
    };

    /* ------------------------------------------------ speech */
    let cancelType = null;
    const say = text => { if (cancelType) cancelType(); S.say = text; S.sayT = performance.now(); cancelType = DK.typer(host, sayTxt, text, null, 14); };
    const quip = k => say(DK.pick(MORT[k]).replace("$G", loveWord || "everything"));

    /* ------------------------------------------------ rendering the DOM bits */
    function render() {
      const c = cur();
      lotEl.querySelector("b").textContent = money(budget);
      cashEl.querySelector("b").textContent = money(S.cash);
      const net = S.cash - budget; const nb = netEl.querySelector("b"); nb.textContent = (net >= 0 ? "+" : "−") + money(Math.abs(net)).replace("-", ""); nb.className = net >= 0 ? "ok" : "bad";
      const have = !!c && !S.done;
      info.style.display = have ? "" : "none";
      if (c) {
        iTitle.innerHTML = ""; iTitle.appendChild(document.createTextNode(c.rec.artist + " – " + c.rec.title));
        el("small", { text: [c.rec.label, c.rec.year, c.rec.format].filter(Boolean).join(" · ") }, iTitle);
        iMeta.innerHTML = ""; const gr = el("span", { cls: "dk-grade", text: c.cond.name }, iMeta); gr.style.background = c.cond.col;
        iMeta.appendChild(document.createTextNode(c.rec.genre + " · ~" + c.rec.bpm + " BPM"));
        iNote.innerHTML = "<b style='color:#8c84b8;font-weight:400'>SLEEVE</b> " + DK.ascii(c.sleeveNote) + "<br><b style='color:#8c84b8;font-weight:400'>VINYL</b> " + DK.ascii(c.vinylNote);
        iTags.innerHTML = "";
        if (c.dups.length) { const od = c.dups.map(o => o.cond.name).join(", "); el("span", { cls: "cd-tag dup", text: "2+ COPIES IN THE LOT (other: " + od + ")" }, iTags); }
        if (love && String(c.rec.genre).includes(love) && c.cond.id !== "beat") el("span", { cls: "cd-tag hot", text: "MORT PAYS EXTRA" }, iTags);
        if (c.cond.id === "beat") el("span", { cls: "cd-tag", text: "MORT WON'T BUY BEAT" }, iTags);
        if (c.looked) { el("span", { cls: "cd-tag" + (c.rec.rarity === "rare" ? " gem" : ""), text: c.rec.rarity.toUpperCase() }, iTags); }
        iTags.style.display = iTags.children.length ? "" : "none";
        iGuide.textContent = c.looked ? "GUIDE ~" + money(c.rec.price) + " clean · this copy ~" + money(c.worth) : "Guide price: ???";
        iGuide.style.color = c.looked ? "var(--amber)" : "";
        bLook.disabled = c.looked || !S.started; bLook.style.display = c.looked ? "none" : "";
        c.offer = offerNow(c);
        bSell.querySelector("small").textContent = c.cond.id === "beat" ? "won't take it" : "Mort: " + money(c.offer);
        bSell.disabled = !S.started; bJunk.disabled = !S.started;
        bKeep.querySelector("small").textContent = S.keep.length >= slots ? "crate full" : (slots - S.keep.length) + " slots left"; bKeep.disabled = !S.started;
        cv.setAttribute("aria-label", "Record " + (S.i + 1) + " of " + N + ": " + c.rec.artist + " – " + c.rec.title + ", " + c.cond.name);
      }
      decide.style.display = have ? "" : "none"; keysEl.style.display = have ? "" : "none";
      bUndo.disabled = !S.hist.length || S.done || !S.started;
    }

    /* ------------------------------------------------ decisions */
    function decide_(kind) {
      const c = cur(); if (!c || S.done || !S.started) return;
      if (S.fly && !RM) return;                            /* let the card land */
      let off = 0;
      if (kind === "sell") {
        if (c.cond.id === "beat") { RP.sfx("error"); quip("refuse"); return; }
        off = offerNow(c);
        if (c.worth < 4) { S.junkSales++; S.mood = Math.max(0.6, S.mood - 0.08); }
      }
      if (kind === "keep" && S.keep.length >= slots) { RP.sfx("error"); quip("full"); msg.textContent = "Your crate holds " + slots + ". Sell or junk something first — UNDO takes the last one back."; return; }
      c.decision = kind; c.paid = off;
      const dest = kind === "junk" ? 0 : kind === "sell" ? 1 : 2;
      if (kind === "keep") S.keep.push(c); else if (kind === "sell") { S.sold.push(c); S.cash += off; } else S.junk.push(c);
      S.hist.push({ c, kind, off, mood: S.mood });
      if (!RM) S.fly = { cv: DK.sleeveCanvas(c.rec, c, L.S), t: 0, dest, x: L.cx - Math.floor(L.S / 2), y: L.yCard };
      if (kind === "sell") { S.floats.push({ txt: "+" + money(off), x: L.cx - 14, y: L.tableY - 6, t: 0 }); RP.sfx("cash"); }
      else if (kind === "keep") RP.sfx(c.rec.rarity === "rare" && c.cond.id !== "beat" ? "success" : "pickup");
      else RP.sfx("drop");
      /* banter */
      const gem = c.rec.rarity === "rare" && c.cond.id !== "beat";
      if (kind === "keep") quip(gem ? "keepGem" : "keep");
      else if (kind === "sell") quip(gem ? "sellGem" : (c.worth < 4 ? "junkSell" : "sell"));
      else quip(c.worth >= 15 && c.cond.id !== "beat" ? "junkValuable" : "junk");
      S.i++;
      if (kind === "junk" && c.worth >= 15 && c.cond.id !== "beat") { S.mistakes++; }
      render();
      if (S.i >= N) host.timeout(() => doFinish("sorted"), RM ? 50 : 420);
    }
    function undo() {
      if (S.done || !S.started || !S.hist.length) { return; }
      const h = S.hist.pop(), c = h.c;
      if (h.kind === "keep") S.keep.splice(S.keep.indexOf(c), 1); else if (h.kind === "sell") { S.sold.splice(S.sold.indexOf(c), 1); S.cash -= h.off; S.mood = h.mood; } else S.junk.splice(S.junk.indexOf(c), 1);
      c.decision = null; S.i = c.n; S.t = Math.max(0, S.t - 2); S.undos++; S.fly = null; RP.sfx("rewind");
      render();
    }
    function lookUp() {
      const c = cur(); if (!c || c.looked || !S.started || S.done) return;
      c.looked = true; S.t = Math.max(0, S.t - 3); S.lookups++; RP.sfx("blip");
      if (c.rec.rarity === "rare" && c.cond.id !== "beat") { RP.sfx("success"); say("Guide says " + money(c.rec.price) + " clean. And my offer is " + money(offerNow(c)) + ". Funny, that."); }
      else quip("look");
      render();
    }

    /* ------------------------------------------------ scoring */
    function evaluate() {
      const kept = S.keep.slice(), seenId = new Set();
      const keptBest = []; kept.sort((a, b) => useful(b) - useful(a)).forEach(c => { if (!seenId.has(c.id)) { seenId.add(c.id); keptBest.push(c); } });
      const keptVal = kept.reduce((a, c) => a + c.worth, 0);
      const net = S.cash + 0.6 * keptVal - budget;
      /* the best an ideal sorter could keep */
      const bestById = new Map(); copies.forEach(c => { const b = bestById.get(c.id); if (!b || useful(c) > useful(b)) bestById.set(c.id, c); });
      const ideal = [...bestById.values()].map(useful).sort((a, b) => b - a).slice(0, slots).reduce((a, b) => a + b, 0) || 1;
      const coll = keptBest.reduce((a, c) => a + useful(c), 0) / ideal;
      let gemSum = 0; gems.forEach(g => { gemSum += g.decision === "keep" ? 1 : g.decision === "sell" ? 0.35 : 0; });
      const gemFrac = gems.length ? gemSum / gems.length : 1;
      const decided = copies.filter(c => c.decision).length;
      let mistakes = S.mistakes + kept.filter(c => c.cond.id === "beat").length + (kept.length - keptBest.length) + S.junkSales;
      const profitPts = 40 * clamp((net + 0.15 * budget) / (0.65 * budget), 0, 1);
      const collPts = 25 * clamp(coll, 0, 1), gemPts = 20 * gemFrac;
      const tidyPts = clamp(15 * (decided / N) - 2.5 * mistakes, 0, 15);
      const bonus = decided === N ? 5 * clamp(S.t / timeTotal, 0, 1) : 0;
      let score = Math.round(clamp(profitPts + collPts + gemPts + tidyPts + bonus, 0, 100));
      if (!kept.length) score = Math.min(score, 45);
      return { net, kept, keptVal, coll, gemFrac, decided, mistakes, profit: S.cash - budget, score, parts: { profitPts, collPts, gemPts, tidyPts, bonus } };
    }
    let finish = null, ended = false;
    function endCard(res, ev, why) {
      root.innerHTML = ""; host.header("crate.Digging", "Estate sale · Ridgewood, Queens");
      const ok = res.ok;
      const box = el("div", { cls: "dk-end mg-panel" }, root);
      el("h2", { cls: ok ? "ok" : "bad", text: why === "time" ? (ok ? "TIME! BUT YOU MADE IT PAY." : "TIME! THE NEPHEW WANTS THE VAN.") : ok ? "THE LOT PAID OFF." : "YOU LOST MONEY ON GUS'S BOXES." }, box);
      el("div", { cls: "dk-score", html: res.score + "<small>/ 100</small>" }, box);
      const lines = el("div", { cls: "dk-lines" }, box);
      const ln = (a, b) => { const d = el("div", {}, lines); el("span", { text: a }, d); el("span", { text: b }, d); };
      ln("Paid for the lot", money(budget)); ln("Cash from Mort", money(S.cash) + " (" + S.sold.length + " sold)");
      ln("Kept records", ev.kept.length + " worth ~" + money(ev.keptVal)); ln("Profit (cash − lot)", (res.profit >= 0 ? "+" : "−") + money(Math.abs(res.profit)).replace("-", ""));
      ln("Net with the keepers", (ev.net >= 0 ? "+" : "−") + money(Math.abs(ev.net)).replace("-", ""));
      const found = gems.filter(g => g.decision === "keep").length; if (gems.length) ln("Gems kept", found + " of " + gems.length);
      if (ev.decided < N) ln("Left in the boxes", (N - ev.decided) + " records");
      if (ev.kept.length) {
        const bag = el("div", { cls: "dk-bag" }, box);
        ev.kept.forEach(c => { const it = el("div", { cls: "dk-bagitem" }, bag); const cc = DK.cv(56, 56); cc.className = "px"; cc.getContext("2d").drawImage(DK.sleeveCanvas(c.rec, c, 56), 0, 0); it.appendChild(cc); const d = el("div", { text: c.rec.artist + " – " + c.rec.title }, it); el("small", { text: c.cond.name + " · " + c.rec.rarity + (c.rec.rarity === "rare" && c.cond.id !== "beat" ? " · GEM" : "") + " · ~" + money(c.worth) }, d); });
      }
      const missed = gems.filter(g => g.decision !== "keep");
      if (missed.length) el("div", { cls: "dk-fact", text: "Gem" + (missed.length > 1 ? "s" : "") + " " + (missed.some(g => g.decision === "sell") ? "sold" : "missed") + ": " + missed.map(g => g.rec.artist + " – " + g.rec.title + " (guide ~" + money(g.rec.price) + ")").join("; ") + "." }, box);
      const row = el("div", { cls: "row" }, box); el("div", { cls: "spacer" }, row);
      const go = el("button", { cls: "btn primary", type: "button", text: "CONTINUE" }, row);
      go.addEventListener("click", () => finish && finish(res));
      host.onKey(e => { if (e.key === "Enter" && document.activeElement !== go) { e.preventDefault(); go.click(); } });
      setTimeout(() => { try { go.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 30);
      RP.sfx(ok ? "success" : "fail");
    }
    function doFinish(why) {
      if (ended) return; ended = true; S.done = true;
      const ev = evaluate(), keepIds = ev.kept.map(c => c.id), soldIds = S.sold.map(c => c.id);
      const res = { ok: ev.net >= 0 && ev.kept.length > 0, score: ev.score, keep: keepIds, sold: soldIds, profit: Math.round(ev.profit * 100) / 100, cash: S.cash, net: Math.round(ev.net * 100) / 100, junked: S.junk.map(c => c.id), undecided: N - ev.decided };
      endCard(res, ev, why);
    }

    /* ------------------------------------------------ input */
    const startGame = () => { if (S.started) return; S.started = true; intro.remove(); mainBits.forEach(n => { n.style.display = ""; }); RP.sfx("whoosh"); quip("intro"); render(); };
    bLook.addEventListener("click", lookUp); bJunk.addEventListener("click", () => decide_("junk")); bSell.addEventListener("click", () => decide_("sell")); bKeep.addEventListener("click", () => decide_("keep"));
    bUndo.addEventListener("click", undo); bFinish.addEventListener("click", () => { if (S.started && !S.done) doFinish("done"); });
    bLeave.addEventListener("click", () => { if (S.done) return; S.done = true; ended = true; finish && finish({ ok: false, score: 0, keep: [], sold: [], profit: 0 }); });
    host.onKey(e => {
      if (S.done || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key, onBtn = document.activeElement && document.activeElement.tagName === "BUTTON";
      if (!S.started) { if ((k === "Enter" || k === " ") && !onBtn) { e.preventDefault(); startGame(); } return; }
      if (k === "ArrowLeft" || k === "j" || k === "J") { e.preventDefault(); decide_("junk"); }
      else if (k === "ArrowDown" || k === "s" || k === "S") { e.preventDefault(); decide_("sell"); }
      else if (k === "ArrowRight" || k === "k" || k === "K") { e.preventDefault(); decide_("keep"); }
      else if (k === "g" || k === "G" || k === "ArrowUp") { e.preventDefault(); lookUp(); }
      else if (k === "u" || k === "U" || k === "Backspace") { e.preventDefault(); undo(); }
    });
    cv.addEventListener("pointerdown", e => {
      if (!S.started || S.done) return; const r = cv.getBoundingClientRect(), fx = (e.clientX - r.left) / Math.max(1, r.width), fy = (e.clientY - r.top) / Math.max(1, r.height);
      if (fy > 0.55) decide_(fx < 0.34 ? "junk" : fx > 0.66 ? "keep" : "sell");
    });

    /* ------------------------------------------------ intro card */
    const mainBits = [clock, hud, cols, msg];
    mainBits.forEach(n => { n.style.display = "none"; });
    const intro = el("div", { cls: "cd-intro mg-panel" }, root);
    el("h2", { text: "GUS'S BASEMENT" }, intro);
    el("div", { cls: "dk-meta", html: "His nephew sold you the whole collection for <b>" + money(budget) + "</b>. Mort the dealer is parking the van. You've got <b>" + timeTotal + " seconds</b> and <b>" + N + " records</b>." }, intro);
    const ul = el("ul", {}, intro);
    el("li", { html: "<b class='k'>KEEP</b> the best: gems (rare + good condition) and your type of records. Your crate holds <b>" + slots + "</b>." }, ul);
    el("li", { html: "<b class='s'>SELL</b> to Mort for cash. He pays a share of the value, and he lowballs the rare stuff." }, ul);
    el("li", { html: "<b class='j'>JUNK</b> beat-up and worthless ones. Selling him garbage makes him stingy." }, ul);
    el("li", { html: "Not sure? <b>LOOK IT UP</b> (−3 s) shows the guide price. Duplicates: keep the better copy." }, ul);
    el("li", { html: "Goal: get the lot's cost back <b>and</b> a crate of heat." }, ul);
    const irow = el("div", { cls: "row" }, intro); const bLeave2 = el("button", { cls: "btn", type: "button", text: "LEAVE" }, irow); el("div", { cls: "spacer" }, irow);
    const bStart = el("button", { cls: "btn primary", type: "button", text: "START SORTING" }, irow);
    bStart.addEventListener("click", startGame); bLeave2.addEventListener("click", () => { S.done = true; ended = true; finish && finish({ ok: false, score: 0, keep: [], sold: [], profit: 0 }); });
    [bStart, bLeave2].forEach(mouseBlur);
    setTimeout(() => { try { bStart.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 30);
    foot.style.display = "none"; mainBits.push(foot);

    /* ------------------------------------------------ draw */
    const dest = k => k === 0 ? [L.junkX - 4, L.floorY - 12] : k === 1 ? [L.cx - 8, L.tableY + 2] : [L.keepX - 4, L.floorY - 12];
    function drawScene(c, t, dt) {
      c.drawImage(bgCv, 0, 0);
      const fl = RM ? 1 : (Math.floor(t / 5200) % 4 === 1 && (t % 5200) < 140 ? 0.4 : 1);
      c.globalAlpha = 0.2 * fl; c.drawImage(coneCv, 0, 0); c.globalAlpha = 1;
      /* the stack of remaining records standing in the box, current one on top */
      const left_ = N - S.i, cur_ = cur(), Sz = L.S, peeks = Math.min(left_ - 1, L.peeks);
      for (let k = peeks; k >= 1; k--) {
        const it = copies[S.i + k]; if (!it) continue;
        const w = Sz - 2 * k, y = L.yCard - k * 4, x = L.cx - Math.floor(w / 2);
        c.drawImage(DK.sleeveCanvas(it.rec, it, Sz), 0, 0, Sz, Sz, x, y, w, w);
        c.globalAlpha = Math.min(0.55, 0.06 * k + 0.04); R(c, x, y, w, w, "#140824"); c.globalAlpha = 1;
      }
      if (cur_) {
        const bob = RM ? 0 : Math.round(Math.sin(t / 700) * 0.6);
        c.drawImage(DK.sleeveCanvas(cur_.rec, cur_, Sz), L.cx - Math.floor(Sz / 2), L.yCard + bob);
        if (S.started && cur_.looked) { const pt = money(cur_.rec.price); DK.sticker(c, L.cx + Math.floor(Sz / 2) - (RP.u.txtW(pt, 1, 1) + 5) - 3, L.yCard + 3 + bob, pt, { col: "#9be15d" }); }
        if (S.started && cur_.looked && cur_.rec.rarity === "rare" && cur_.cond.id !== "beat" && !RM) { const tw = Math.floor(t / 130) % 8; RP.u.txt(c, "*", L.cx - Math.floor(Sz / 2) + 6 + tw * 9, L.yCard + 12 + ((tw * 7) % 30), "#fff6d8", 2, 0); }
      }
      c.drawImage(boxCv, L.cx - Math.floor(L.boxW / 2), L.boxY);
      DK.labelPlate(c, L.cx, L.boxY + 4, left_ > 0 ? left_ + " LEFT" : "EMPTY", "#3a2418");
      drawPiles(c, t);
      /* Mort behind his table, to the right */
      const talking = !RM && S.say && t - S.sayT < Math.min(2400, S.say.length * 14 + 300);
      if (!L.narrow) safe(() => RP.chars.draw(c, { id: "dk_mort", x: L.W - 22, y: L.floorY + 22, face: "left", act: "stand", frame: 0, mouth: talking && Math.floor(t / 110) % 2 === 0, blink: Math.floor(t / 2800) % 6 === 0 && (t % 2800) < 140, scale: 0.6 }, { lx: -0.4, shadow: 0.4, cast: false }));
      /* flying card */
      if (S.fly) {
        const f = S.fly; f.t += dt / 0.28; const e = DK.ease(f.t), d = dest(f.dest), sz = Math.round(Sz * (1 - 0.65 * e));
        if (f.t >= 1) S.fly = null; else c.drawImage(f.cv, Math.round(f.x + (d[0] - f.x) * e), Math.round(f.y + (d[1] - f.y) * e - Math.sin(e * 3.14) * 8), sz, sz);
      }
      S.floats = S.floats.filter(f => (f.t += dt) < 1.1); S.floats.forEach(f => RP.u.txt(c, f.txt, f.x, Math.round(f.y - f.t * 22), "#ffd23f", 2, 1));
      if (!RM) { dust.step(dt); dust.draw(c); }
      if (!S.started) { c.globalAlpha = 0.5; R(c, 0, 0, L.W, L.H, "#0a0614"); c.globalAlpha = 1; }
    }
    function drawPiles(c, t) {
      const fy = L.floorY, nar = L.narrow;
      /* JUNK (left of the box): trash can */
      const jx = L.junkX;
      safe(() => PK.trashCan(c, jx - 11, fy - 29, { full: true, w: 22, h: 28, seed: 1 }));
      for (let i = 0; i < Math.min(S.junk.length, 4); i++) { const it = S.junk[S.junk.length - 1 - i]; c.drawImage(DK.sleeveCanvas(it.rec, it, 24), 0, 0, 24, 10, jx - 9 + i * 3, fy - 36 - i, 14, 6); }
      DK.txtO(c, "JUNK " + S.junk.length, jx - Math.floor(RP.u.txtW("JUNK " + S.junk.length, 1, 1) / 2), fy - 48, "#ff9a9a", 1);
      /* KEEP (right of the box): milk crate with the kept sleeves standing in it */
      const kx = L.keepX, kw = nar ? 32 : 44;
      for (let i = 0; i < slots; i++) {
        const it = S.keep[i]; if (!it) continue;
        const wcol = Math.max(3, Math.floor((kw - 6) / slots)), x0 = kx - kw / 2 + 3 + Math.floor(i * (kw - 6) / slots);
        c.drawImage(DK.sleeveCanvas(it.rec, it, 24), 3, 0, wcol, 14, x0, fy - 30, wcol, 14);
      }
      R(c, kx - kw / 2, fy - 18, kw, 18, "#2f62b8"); R(c, kx - kw / 2, fy - 18, kw, 1, "#7aa8ff"); R(c, kx - kw / 2, fy - 1, kw, 1, "#17306a");
      for (let yy = fy - 17; yy < fy - 2; yy += 5) for (let xx = kx - kw / 2 + 3; xx < kx + kw / 2 - 5; xx += 7) { R(c, xx, yy, 4, 3, "#17306a"); R(c, xx, yy + 3, 4, 1, "#5a8ae0"); }
      const kt = "KEEP " + S.keep.length + "/" + slots; DK.txtO(c, kt, kx - Math.floor(RP.u.txtW(kt, 1, 1) / 2), fy - 38, S.keep.length >= slots ? "#ffd23f" : "#9be15d", 1);
      /* SELL (below the box): Mort's folding table with the cash tin */
      const tx = L.tx, ty = L.tableY, tw = L.tw;
      safe(() => PK.table(c, tx, ty, tw, H_TABLE(), { color: "#8a6a4a", top: "#c8b090", seed: 3 }));
      for (let i = 0; i < Math.min(S.sold.length, 6); i++) { const it = S.sold[S.sold.length - 1 - i]; c.drawImage(DK.sleeveCanvas(it.rec, it, 24), 0, 0, 24, 10, tx + 5 + (i % 3) * 3, ty - 6 - Math.floor(i / 2), 18, 7); }
      R(c, tx + tw - 22, ty - 9, 15, 8, "#8a8698"); R(c, tx + tw - 22, ty - 9, 15, 1, "#c8c4d8"); R(c, tx + tw - 21, ty - 13, 13, 4, "#9be15d"); RP.u.txt(c, "$", tx + tw - 16, ty - 8, "#1d3a2a", 1, 0);
      const st = "SELL " + S.sold.length + "  " + money(S.cash); DK.txtO(c, st, L.cx - Math.floor(RP.u.txtW(st, 1, 1) / 2), ty + 11, "#ffd23f", 1);
    }
    const H_TABLE = () => Math.max(20, Math.min(30, L.H - L.tableY - 4));

    /* ------------------------------------------------ boot */
    refit();
    let rto = null; const onResize = () => { clearTimeout(rto); rto = setTimeout(() => { if (!S.done) refit(); }, 120); };
    window.addEventListener("resize", onResize); host.cleanup(() => window.removeEventListener("resize", onResize));
    render();
    if (p.debug) window.__cd = { S, copies, budget, gems, N };

    return new Promise(resolve => {
      let resolved = false;
      finish = res => { if (resolved) return; resolved = true; resolve(res); };
      let last = null;
      host.raf(tm => {
        if (resolved) return false;
        const dt = last == null ? 0.016 : clamp((tm - last) / 1000, 0, 0.1); last = tm;
        if (S.started && !S.done) {
          S.t -= dt;
          const fr = clamp(S.t / timeTotal, 0, 1); barFill.style.width = (fr * 100) + "%"; barW.className = "dk-bar" + (fr < 0.15 ? " bad" : fr < 0.35 ? " warn" : "");
          const tt = Math.max(0, Math.ceil(S.t)); timeEl.textContent = Math.floor(tt / 60) + ":" + String(tt % 60).padStart(2, "0"); timeEl.className = fr < 0.15 ? "bad" : fr < 0.35 ? "warn" : "";
          if (S.t < timeTotal * 0.3 && !S.hurried) { S.hurried = true; quip("hurry"); RP.sfx("blip"); }
          if (S.t <= 0) { S.t = 0; RP.sfx("alarm"); quip("late"); doFinish("time"); }
        }
        if (!S.done && L) drawScene(cv.getContext("2d"), tm, dt);
      });
      host.cleanup(() => { resolved = true; });
    });
  }
});
})();
