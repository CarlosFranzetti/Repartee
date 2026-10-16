/* go.Digging — flip through a record store's bins sleeve by sleeve, check the condition,
   preview a loop, haggle a little and buy within budget.
   Params (all optional):
     { store: "Deep Cuts", budget: $, bins: [{label, records:[ids], mult?}],
       want: {vibe?, genre?, maxPrice?, id?}, difficulty: 1..5, seed? }
   Result: { ok, score (0..100), bought: [recordIds], spent: $ }
   ok = you left with something that meets the want (or, with no want, bought anything).
   If you walk out without it (or press LEAVE) nothing is bought: { ok:false, bought:[], spent:0 }.
   Loaded helpers: RP.digkit (digkit_lib.js), used only inside play(). */
(function () {
"use strict";
const RP = window.RP;
const { mulberry, hashStr, clamp } = RP.u;

const CSS = `
.dg-flip { display: grid; grid-template-columns: 1fr 1.3fr 1fr; gap: 6px; }
.dg-flip .btn, .dg-flip .kbtn { font-size: 21px; padding: 8px 6px; }
.dg-hag { background: #170f2a; border: 1px solid #4a1f3a; border-radius: 3px; padding: 8px; display: flex; flex-direction: column; gap: 6px; }
.dg-hag .offer { display: flex; align-items: center; gap: 8px; }
.dg-hag .offer .dk-price { flex: 1; text-align: center; }
.dg-hag .kbtn { min-width: 48px; font-size: 24px; padding: 4px 8px; }
.dg-prev { display: flex; align-items: center; gap: 8px; font-size: 18px; color: var(--cyan); }
.dg-prev .dk-bar { flex: 1; }
.dg-empty { font-size: 22px; color: var(--muted); padding: 12px 4px; text-align: center; }
`;
let cssDone = false;

const RAY_QUIPS = {
  intro: ["The dollar bins. Where dreams go to get cheaper.", "Flip with your fingertips. The edges are the only thing holding half of these together."],
  idle: ["You're allowed to buy something. It's not a library.", "Browsing is free. Breathing on the vinyl is $2.", "The floor's not a bin, kid. Eyes up."],
  popdance: ["Somebody's cousin's wedding called. They want it back.", "That one's been in the bin since before you could spell 'bin'."],
  ambient: ["Chill. Literally. The heat's broken.", "Nobody ever bought that on purpose. Be the first."],
  hiphop: ["Handle it like it owes you money. Gently.", "That's a record, not a pancake. Flat hands."],
  techno: ["Loud. It's all loud.", "Four on the floor and nothing on the walls."],
  disco: ["Disco didn't die. It got filed under D.", "Somebody loved that one. You can tell by the ring wear."],
  beat: ["That one's been through a war. Several.", "Condition: 'it spun once.' Price reflects that.", "'Beat' is a grade. It's also a mood."],
  buy: ["Cash. The only language the bins speak.", "Bag's under the counter. Don't breathe on the vinyl.", "Good ears. Don't tell anyone I said that."],
  buyGem: ["Huh. Who put that in this bin? ...Not my problem. Cash is cash.", "My nephew sorted this crate. Don't tell him what you just did."],
  short: ["You're short. The bins don't do layaway.", "Money first. Then music."],
  preview: ["Listening's free. The opinions are extra.", "Needle's fresh. Mostly.", "One needle drop. Make it count."],
  warp: ["Hear that wobble? That's the 'beat' in 'beat up'.", "Warped. The record's doing yoga."],
  tooMany: ["This isn't a listening bar.", "You've heard half the store. Buy something."],
  accept: ["Fine. Take it before I change my mind.", "Deal. You drive a bad bargain. I mean a good one.", "Sold. Don't tell the other kids."],
  counter: ["Tell you what.", "Closer. Not quite.", "Meet me here and we both walk away annoyed."],
  insult: ["That's an insult. I'm insulted.", "I've seen kinder offers from a parking meter.", "Is that your offer or a typo?"],
  noPatience: ["No more haggling today, kid. I'm out of patience. And change.", "The price is the price. Go flip something."],
  tiny: ["It's a dollar. Haggle with the sidewalk.", "The sticker IS the discount."],
  leave: ["Come back when the bins have healed.", "Door's that way. Mind the cat."]
};
const FAMILY_ORDER = ["house", "deep house", "garage", "chicago house", "acid house", "disco", "boogie", "italo", "pop-dance", "electro", "hip-hop", "breaks", "funk", "jazz-funk", "soul", "smooth jazz", "detroit techno", "techno", "minimal", "ambient"];

RP.mg.register("goDigging", {
  title: "go.Digging", order: 5,
  desc: "Flip through the bins, preview the vinyl, haggle, and buy within budget.",
  auto(p, S) {
    p = p || {};
    const recs = (RP.data.records || []);
    const budget = p.budget != null ? p.budget : 10, want = p.want || null;
    let rec = null;
    if (want && want.id) rec = RP.rec(want.id);
    else {
      const DKm = (r) => (!want || ((!want.vibe || (r.vibe || []).includes(want.vibe)) && (!want.genre || String(r.genre).includes(want.genre))));
      const cap = want && want.maxPrice != null ? Math.min(want.maxPrice, budget) : budget;
      const have = (S && S.records) || [];
      const pool = recs.filter(r => DKm(r) && r.price <= cap).sort((a, b) => a.price - b.price || (a.id < b.id ? -1 : 1));
      rec = pool.find(r => !have.includes(r.id)) || pool[0] || recs.filter(r => r.price <= budget).sort((a, b) => a.price - b.price)[0] || null;
    }
    if (!rec) return { ok: false, score: 0, bought: [], spent: 0 };
    return { ok: true, score: 85, bought: [rec.id], spent: rec.price };
  },
  async play(host, p) {
    p = p || {};
    const DK = RP.digkit;
    if (!DK) return { ok: false, score: 0, bought: [], spent: 0, error: "digkit missing" };
    if (!cssDone) { RP.u.el("style", { text: CSS }, document.head); cssDone = true; }
    DK.css(); DK.chars();
    const { el, fmtMoney } = RP.u;
    const money = DK.money, RM = DK.reduced();
    const diff = clamp(Math.round(p.difficulty || 2), 1, 5);
    const seed = p.seed != null ? p.seed : Math.floor(Math.random() * 1e9);
    const rnd = mulberry(seed);
    const store = p.store || "Deep Cuts";
    const budget = p.budget != null ? p.budget : [14, 12, 10, 9, 8][diff - 1];
    let want;
    if (p.want === false) want = null;
    else if (p.want && typeof p.want === "object") want = p.want;
    else want = { vibe: DK.pick(["closer", "warmup", "peak", "builder"], rnd), maxPrice: Math.max(3, Math.round(budget * 0.6)) };
    const owned = new Set((host.S && host.S.records) || []);
    const isRay = /deep cuts/i.test(store);
    const clerkId = isRay ? "ray" : "dk_clerk";
    const clerkName = isRay ? "RAY" : "CLERK";

    /* ------------------------------------------------ build the bins */
    const all = DK.recs();
    const recOf = id => all.find(r => r.id === id) || RP.rec(id);
    const mk = (rec, o) => {
      o = o || {};
      const c = DK.makeCopy(rec, rnd, { cond: o.cond, mix: o.mix, warp: o.warp });
      c.gem = !!o.gem; c.bin = o.bin || 0;
      c.base = DK.stickerFor(rec, c.cond, o.mult || 1, c.gem);
      if (o.price != null) c.base = o.price;
      c.deal = null; c.sold = false; c.haggled = false; c.floorFrac = 0.62 + rnd() * 0.18 + ({ mint: 0.07, "vg+": 0.02, vg: -0.04, beat: -0.12 }[c.cond.id]) + (diff - 2) * 0.02;
      return c;
    };
    const wantRecs = want ? all.filter(r => DK.matchWant(r, want, null)) : [];
    let bins = [];
    if (Array.isArray(p.bins) && p.bins.length) {
      bins = p.bins.filter(b => b && Array.isArray(b.records)).map((b, i) => ({ label: b.label || "BIN " + (i + 1), mult: b.mult || 1, items: b.records.map(id => mk(recOf(id), { mult: b.mult || 1, bin: i })) }));
    }
    if (bins.length && want) {
      /* story-supplied bins: make sure at least one non-beat copy of a matching record is affordable */
      const okCopy = c => DK.matchWant(c.rec, want, c.base) && c.cond.id !== "beat";
      if (!bins.some(b => b.items.some(okCopy))) {
        let best = null;
        bins.forEach((b, bi) => b.items.forEach((c, ci) => { if (DK.matchWant(c.rec, want, null) && (!best || c.rec.price < best.c.rec.price)) best = { b, bi, ci, c }; }));
        if (best) best.b.items[best.ci] = mk(best.c.rec, { cond: "vg+", mult: best.b.mult || 1, bin: best.bi });
      }
    }
    if (!bins.length) {
      const used = new Set();
      const takeFrom = (pred, n) => { const pool = DK.shuffle(all.filter(r => !used.has(r.id) && !owned.has(r.id) && pred(r)), rnd).slice(0, n); pool.forEach(r => used.add(r.id)); return pool; };
      const dollar = [], fresh = [], glass = [];
      const dN = [10, 12, 14, 16, 18][diff - 1], nN = 7 + Math.min(3, diff), gN = 2 + Math.min(2, diff);
      /* the wanted record(s) */
      const goodMix = [6, 44, 40, 10];
      if (want) {
        if (want.id) {
          const r = recOf(want.id); used.add(r.id);
          const home = r.rarity === "rare" ? glass : r.rarity === "uncommon" ? fresh : dollar;
          home.push(mk(r, { cond: "vg+", bin: 0 }));
          if (home === dollar && diff >= 2) dollar.push(mk(r, { cond: "beat", warp: true }));
          if (home === dollar && diff <= 3) dollar.push(mk(r, { cond: "vg" }));
        } else {
          const hits = DK.shuffle(wantRecs.filter(r => !owned.has(r.id)), rnd);
          const cheap = hits.filter(r => r.price <= (want.maxPrice != null ? want.maxPrice : 99)).sort((a, b) => a.price - b.price);
          const rich = hits.filter(r => !cheap.includes(r));
          const nCheap = [3, 2, 2, 1, 1][diff - 1];
          cheap.slice(0, nCheap).forEach((r, i) => { used.add(r.id); dollar.push(mk(r, { cond: i === 0 ? "vg+" : i === 1 ? "beat" : "vg", warp: true })); });
          rich.slice(0, 3).forEach(r => { used.add(r.id); (r.rarity === "rare" ? glass : fresh).push(mk(r, {})); });
        }
      }
      /* filler */
      const nonWant = r => !want || !wantRecs.includes(r);
      takeFrom(r => r.rarity === "common" && r.price <= 11 && nonWant(r), Math.max(0, dN - dollar.length - 2)).forEach(r => dollar.push(mk(r, { mix: [4, 26, 40, 30] })));
      /* mispriced gems hiding in the dollar bin */
      takeFrom(r => r.rarity === "uncommon" && nonWant(r), diff <= 3 ? 2 : 1).forEach(r => dollar.push(mk(r, { gem: true, mix: [10, 50, 30, 10] })));
      takeFrom(r => r.rarity === "uncommon" && nonWant(r), Math.max(0, nN - fresh.length)).forEach(r => fresh.push(mk(r, { mix: [28, 46, 21, 5] })));
      takeFrom(r => r.rarity === "rare" && nonWant(r), Math.max(0, gN - glass.length)).forEach(r => glass.push(mk(r, { mix: [45, 45, 10, 0] })));
      const sorter = (a, b) => (FAMILY_ORDER.indexOf(a.rec.genre) + 1 || 99) - (FAMILY_ORDER.indexOf(b.rec.genre) + 1 || 99) || (a.rec.artist < b.rec.artist ? -1 : 1);
      bins = [{ label: "DOLLAR BIN", items: dollar.sort(sorter) }, { label: "NEW ARRIVALS", items: fresh.sort(sorter) }, { label: "BEHIND THE GLASS", items: glass.sort(sorter) }].filter(b => b.items.length);
    }
    bins.forEach((b, i) => b.items.forEach(c => { c.bin = i; }));
    if (!bins.some(b => b.items.length)) return { ok: false, score: 0, bought: [], spent: 0 };

    /* ------------------------------------------------ state */
    const S = { bin: 0, cur: 0, target: 0, mode: "flip", cash: budget, bag: [], patience: [4, 3, 3, 2, 2][diff - 1], maxPatience: [4, 3, 3, 2, 2][diff - 1],
      asks: 0, previews: 0, hag: null, say: "", sayT: 0, fly: null, prev: null, confirmLeave: false, done: false, saved: 0, lastIdle: 0, flips: 0 };
    const idx = bins.map(() => 0);
    const cur = () => { const b = bins[S.bin]; return b.items[clamp(idx[S.bin], 0, b.items.length - 1)] || null; };
    const binItems = () => bins[S.bin].items;

    /* ------------------------------------------------ DOM */
    const root = host.root; root.classList.add("dk");
    host.header("go.Digging", store.toUpperCase() + " · bins");
    const hud = el("div", { cls: "dk-hud" }, root);
    const wantEl = el("div", { cls: "want", text: want ? DK.wantText(want) : "No list today. Just dig." }, hud);
    const cashEl = el("span", { html: "CASH <b></b>" }, hud), bagEl = el("span", { html: "BAG <b></b>" }, hud);
    const cols = el("div", { cls: "dk-cols" }, root);
    const left = el("div", { cls: "dk-info" }, cols), right = el("div", { cls: "dk-info" }, cols);
    const stage = el("div", {}, left);
    const cv = el("canvas", { cls: "px", role: "img", tabindex: "0", "aria-label": "Record bin. Left and right arrows flip through sleeves, Enter inspects." }, stage);
    const flipRow = el("div", { cls: "dg-flip" }, left);
    const bPrev = el("button", { cls: "kbtn", type: "button", text: "◀ BACK" }, flipRow), bInspect = el("button", { cls: "kbtn", type: "button", text: "PULL IT OUT" }, flipRow), bNext = el("button", { cls: "kbtn", type: "button", text: "NEXT ▶" }, flipRow);
    const sayBox = el("div", { cls: "dk-say", "aria-live": "polite" }, left);
    sayBox.appendChild(DK.portrait(clerkId));
    const sayCol = el("div", {}, sayBox); el("div", { cls: "who", text: clerkName }, sayCol);
    const sayTxt = el("div", { cls: "txt" }, sayCol);
    const tabs = el("div", { cls: "dk-tabs", role: "tablist" }, right);
    const info = el("div", { cls: "dk-info mg-panel" }, right);
    const iTitle = el("div", { cls: "dk-title" }, info);
    const iMeta = el("div", { cls: "dk-meta" }, info);
    const iGrade = el("div", { cls: "dk-note" }, info);
    const buyRow = el("div", { cls: "dk-buyrow" }, info);
    const iPrice = el("div", { cls: "dk-price" }, buyRow);
    const iFact = el("div", { cls: "dk-fact" }, info);
    const iPrev = el("div", { cls: "dg-prev" }, info);
    const prevLbl = el("span", { text: "" }, iPrev), prevBar = el("div", { cls: "dk-bar" }, iPrev); const prevFill = el("i", {}, prevBar);
    const acts = el("div", { cls: "dk-actions" }, buyRow);
    const bListen = el("button", { cls: "btn sm", type: "button" }, acts), bHag = el("button", { cls: "btn sm", type: "button" }, acts), bBuy = el("button", { cls: "btn sm primary", type: "button" }, acts);
    const hag = el("div", { cls: "dg-hag" }, info);
    const hagMsg = el("div", { cls: "dk-note", text: "" }, hag);
    const hagOffer = el("div", { cls: "offer" }, hag);
    const hMinus = el("button", { cls: "kbtn", type: "button", text: "−", "aria-label": "Lower offer" }, hagOffer), hVal = el("div", { cls: "dk-price" }, hagOffer), hPlus = el("button", { cls: "kbtn", type: "button", text: "+", "aria-label": "Raise offer" }, hagOffer);
    const hagRow = el("div", { cls: "dk-actions" }, hag);
    const hGo = el("button", { cls: "btn sm primary", type: "button", text: "MAKE OFFER" }, hagRow), hTake = el("button", { cls: "btn sm", type: "button", text: "TAKE IT" }, hagRow), hBack = el("button", { cls: "btn sm", type: "button", text: "NEVER MIND" }, hagRow);
    const hPat = el("div", { cls: "dk-meta" }, hag);
    const keys = el("div", { cls: "dk-keys", style: "margin-top:2px", html: "<kbd>←</kbd><kbd>→</kbd> flip · <kbd>↑</kbd><kbd>↓</kbd> bins · <kbd>Enter</kbd> pull out / buy · <kbd>P</kbd> listen · <kbd>H</kbd> haggle · <kbd>?</kbd> ask Ray" }, right);
    const msg = el("div", { cls: "mg-msg", "aria-live": "polite" }, root);
    const foot = el("div", { cls: "row" }, root);
    const bLeave = el("button", { cls: "btn", type: "button", text: "LEAVE" }, foot); el("div", { cls: "spacer" }, foot);
    const bAsk = el("button", { cls: "btn", type: "button", text: "ASK " + clerkName }, foot);
    const bDone = el("button", { cls: "btn primary", type: "button", text: "PAY & GO" }, foot);
    const blurOnMouse = b => b.addEventListener("click", e => { if (e.detail) b.blur(); });
    [bPrev, bInspect, bNext, bListen, bHag, bBuy, hMinus, hPlus, hGo, hTake, hBack, bLeave, bAsk, bDone].forEach(blurOnMouse);

    /* ------------------------------------------------ layers */
    let L = null, bgCv = null, fgCv = null, coneCv = null, binCv = {}, bagCv = null;
    const PK = RP.PK;
    const safe = fn => { try { fn(); } catch (e) { /* art must never break the game */ } };
    function layout(W, H) {
      const wide = W >= 300, Ssz = W < 240 ? 72 : 84, floorY = H - 6, frontH = 22;
      const cx = wide ? Math.floor((W - 104) / 2) : Math.floor(W / 2);
      return { W, H, wide, S: Ssz, floorY, frontH, frontY: floorY - frontH, cx, binW: Ssz + 50, wallH: Math.floor(H * 0.56), yFocus: floorY - frontH - Math.round(Ssz * 0.84), ctrY: floorY - 32, ctrX: W - 102 };
    }
    function buildLayers() {
      const { W, H } = L, wallH = L.wallH, r = mulberry(hashStr(store));
      bgCv = DK.cv(W, H); const c = bgCv.getContext("2d");
      safe(() => PK.brick(c, 0, 0, W, wallH, { base: isRay ? "#7a4238" : "#6a4a52", seed: hashStr(store), worn: 0.3 }));
      safe(() => RP.u.R(c, 0, 0, W, 1, "#000"));
      safe(() => PK.dshade(c, 0, 0, W, wallH, "#140824", (x, y) => 0.38 + 0.3 * (1 - y / wallH), 0.5));
      safe(() => PK.planks(c, 0, wallH, W, H - wallH, { base: "#6a4838", horizonY: wallH - 34, seed: 3 }));
      safe(() => PK.baseboard(c, 0, wallH - 8, W, { color: "#4a3050" }));
      /* posters on either side */
      const lx0 = L.cx - Math.floor(L.binW / 2);
      const posters = L.wide ? [[6, 14, 30, 42], [40, 20, 24, 34], [lx0 + L.binW + 6, 12, 28, 40]] : [[3, 12, 28, 40], [W - 31, 16, 28, 38]];
      posters.forEach((q, i) => safe(() => PK.poster(c, q[0], q[1], q[2], q[3], { seed: 11 + i * 7, palette: ["neon", "paper", "sunset", "mono"][i % 4], tape: true })));
      if (L.wide) safe(() => PK.recordWall(c, L.ctrX + 2, 6, 94, 62, { seed: 4 }));
      /* pull the busy brick back behind the bin */
      safe(() => PK.dshade(c, lx0 - 6, 0, L.binW + 12, wallH, "#0a0414", (x, y) => 0.55 * (1 - Math.abs(x - L.cx) / (L.binW / 2 + 6)) , 0.5));
      /* neon sign */
      const name = DK.ascii(store).toUpperCase(), sc = name.length * 8 <= L.W - 40 ? 2 : 1;
      const sw = name.length * (3 * sc + sc) ;
      safe(() => PK.neon(c, name, Math.max(2, Math.round(L.cx - sw / 2)), 5, "#ff3fa4", { scale: sc }));
      /* tubes */
      safe(() => PK.fluorescent(c, L.cx - 60, 0, 46)); safe(() => PK.fluorescent(c, L.cx + 14, 0, 46));
      /* floor grime */
      safe(() => PK.speckle(c, 0, wallH + 4, W, H - wallH - 4, ["#4a3040", "#7a5a48"], 0.012, 5));
      /* light cones */
      coneCv = DK.cv(W, H); const cc = coneCv.getContext("2d");
      [L.cx - 60, L.cx + 14].forEach(tx => {
        for (let y = 6; y < L.floorY; y++) for (let x = tx - 10; x < tx + 56; x++) {
          const t = (y - 6) / (L.floorY - 6), half = 23 + t * 38, d = Math.abs(x - (tx + 23)) / half; if (d > 1) continue;
          const dens = (1 - t * 0.7) * (1 - d) * 0.55; if (dens * 16 > RP.u.bayer(x, y)) { cc.fillStyle = "#e8f4ff"; cc.fillRect(x, y, 1, 1); }
        }
      });
      /* foreground: counter + register */
      fgCv = DK.cv(W, H); const f = fgCv.getContext("2d");
      if (L.wide) {
        safe(() => PK.counter(f, L.ctrX, L.ctrY, 98, 32, { seed: 8 }));
        safe(() => PK.cashRegister(f, L.ctrX + 6, L.ctrY - 24));
        safe(() => PK.speckle(f, L.ctrX, L.ctrY - 1, 98, 1, ["#fff3d6"], 0.1, 4));
      }
      /* bin shells */
      binCv = {};
      bins.forEach((b, i) => {
        const bw = L.binW, back = DK.cv(bw, 26), front = DK.cv(bw, L.frontH + 24);
        DK.drawBinBack(back.getContext("2d"), 0, 0, bw, 26);
        const fc = front.getContext("2d");
        R(fc, 0, 0, 0, 0, "#000");
        DK.drawBinFront(fc, 0, 24, bw, L.frontH, b.label, {});
        const post = ramp("#a06a46");
        R(fc, 0, 4, 4, L.frontH + 20, "#a06a46"); R(fc, 0, 4, 1, L.frontH + 20, post[4]); R(fc, 3, 4, 1, L.frontH + 20, post[1]);
        R(fc, bw - 4, 4, 4, L.frontH + 20, "#a06a46"); R(fc, bw - 4, 4, 1, L.frontH + 20, post[3]); R(fc, bw - 1, 4, 1, L.frontH + 20, post[0]);
        binCv[i] = { back, front };
      });
      /* paper bag */
      bagCv = DK.cv(26, 30); const bc = bagCv.getContext("2d");
      R(bc, 2, 6, 22, 24, "#b98a58"); R(bc, 2, 6, 2, 24, "#d8a870"); R(bc, 22, 6, 2, 24, "#8a6038"); R(bc, 2, 28, 22, 2, "#7a5028"); R(bc, 4, 6, 18, 3, "#c89a68");
      for (let i = 0; i < 6; i++) R(bc, 5 + i * 3, 12 + (i % 2) * 4, 2, 1, "#a07848");
      RP.u.txt(bc, "DIG", 8, 18, "#5a3a1a", 1, 1);
    }
    const R = RP.u.R, ramp = RP.u.ramp;
    const sctx = () => cv.getContext("2d");

    /* ------------------------------------------------ say / ray */
    let cancelType = null;
    const say = (text, o) => {
      if (cancelType) cancelType(); S.say = text; S.sayT = performance.now();
      cancelType = DK.typer(host, sayTxt, text, null, 16);
    };
    const quip = k => say(DK.pick(RAY_QUIPS[k], Math.random));
    const genreQuip = rec => {
      const g = rec.genre;
      if (g === "pop-dance" || g === "italo") return "popdance"; if (g === "ambient") return "ambient"; if (g === "hip-hop" || g === "breaks") return "hiphop";
      if (g === "techno" || g === "detroit techno" || g === "minimal") return "techno"; if (g === "disco" || g === "boogie") return "disco"; return null;
    };

    /* ------------------------------------------------ preview */
    function stopPreview(fade) {
      const pv = S.prev; if (!pv) return; S.prev = null;
      try { pv.loop.stop(fade == null ? 0.25 : fade); } catch (e) { /* ignore */ }
    }
    host.cleanup(() => stopPreview(0));
    function startPreview() {
      const c = cur(); if (!c) return;
      if (S.prev && S.prev.copy === c) { stopPreview(); render(); return; }
      stopPreview(0.1); S.previews++;
      RP.sfx("needle");
      let loop = null;
      try { loop = RP.audio.recordLoop(c.rec); loop.start(); if (c.cond.id === "beat") loop.setFilter("lowpass", 1500); else if (c.cond.id === "vg") loop.setFilter("highpass", 90); } catch (e) { loop = { stop() {}, setBpm() {}, getBpm: () => 120 }; }
      S.prev = { loop, copy: c, t0: performance.now(), lastCrack: performance.now(), len: 9 };
      if (S.mode === "flip") setMode("inspect");
      if (S.previews > 5 && S.previews % 3 === 0) quip("tooMany"); else if (c.warped) quip("warp"); else quip("preview");
      render();
    }

    /* ------------------------------------------------ modes + render DOM */
    function setMode(m) {
      S.mode = m; if (m !== "inspect") { S.hag = null; }
      render();
    }
    const shortOf = b => b.short || ({ "DOLLAR BIN": "DOLLAR", "NEW ARRIVALS": "NEW", "BEHIND THE GLASS": "GLASS" }[b.label] || String(b.label).split(/\s+/)[0].slice(0, 9));
    const stepOf = v => v < 10 ? 0.5 : v < 40 ? 1 : 5;
    const priceOf = c => c.deal != null ? c.deal : c.base;
    function render() {
      const c = cur(), b = bins[S.bin];
      cashEl.querySelector("b").textContent = money(S.cash); bagEl.querySelector("b").textContent = S.bag.length + (S.bag.length ? " · " + money(S.bag.reduce((a, x) => a + x.paid, 0)) : "");
      cashEl.querySelector("b").className = S.cash < 2 ? "bad" : "";
      tabs.innerHTML = "";
      bins.forEach((bn, i) => { const t = el("button", { cls: "kbtn" + (i === S.bin ? " on" : ""), type: "button", role: "tab", title: bn.label, "aria-selected": String(i === S.bin), text: shortOf(bn) + " " + bn.items.length }, tabs); t.addEventListener("click", e => { if (e.detail) t.blur(); gotoBin(i); }); });
      const hasItem = !!c;
      bPrev.disabled = !hasItem || idx[S.bin] <= 0; bNext.disabled = !hasItem || idx[S.bin] >= b.items.length - 1;
      bInspect.textContent = S.mode === "inspect" ? "BACK IN THE BIN" : "PULL IT OUT"; bInspect.disabled = !hasItem;
      info.style.display = hasItem ? "" : "none";
      keys.style.display = "";
      if (hasItem) {
        iTitle.innerHTML = ""; iTitle.appendChild(document.createTextNode(c.rec.artist + " – " + c.rec.title));
        el("small", { text: [c.rec.label, c.rec.year, c.rec.format].filter(Boolean).join(" · ") }, iTitle);
        iMeta.innerHTML = "";
        const gr = el("span", { cls: "dk-grade", text: c.cond.name }, iMeta); gr.style.background = c.cond.col;
        iMeta.appendChild(document.createTextNode(c.rec.genre + " · ~" + c.rec.bpm + " BPM · " + "▮".repeat(c.rec.energy || 1)));
        iGrade.innerHTML = "<b style='color:#8c84b8;font-weight:400'>SLEEVE</b> " + DK.ascii(c.sleeveNote) + "<br><b style='color:#8c84b8;font-weight:400'>VINYL</b> " + DK.ascii(c.vinylNote);
        const pr = priceOf(c);
        iPrice.innerHTML = (c.deal != null && c.deal < c.base ? "<s>" + money(c.base) + "</s>" : "") + money(pr) + (c.deal != null ? " <small style='font-size:17px;color:#9be15d'>HAGGLED</small>" : "");
        const insp = S.mode === "inspect";
        iFact.style.display = insp && !S.hag ? "" : "none";
        iFact.textContent = insp ? (c.rec.fact || "") : "";
        if (insp) {
          const extra = [(c.rec.vibe || []).join(", "), c.rec.rarity ? c.rec.rarity.toUpperCase() : "", "guide ~" + money(c.rec.price)].filter(Boolean).join(" · ");
          iFact.innerHTML = ""; iFact.appendChild(document.createTextNode((c.rec.fact ? c.rec.fact + " " : "")));
          el("div", { text: extra, cls: "dk-meta" }, iFact);
        }
        const pv = S.prev && S.prev.copy === c;
        bListen.textContent = pv ? "■ STOP" : "▶ LISTEN"; iPrev.style.display = pv && !S.hag ? "" : "none";
        bHag.textContent = "HAGGLE"; bHag.disabled = c.haggled || c.deal != null || S.patience <= 0 || c.base < 2;
        bBuy.textContent = "BUY " + money(pr); bBuy.disabled = false;
        bBuy.classList.toggle("dk-short", S.cash < pr - 1e-9);
      }
      const inHag = !!S.hag && hasItem;
      hag.style.display = inHag ? "" : "none";
      if (inHag) {
        const h = S.hag;
        hVal.textContent = money(h.offer); hMinus.disabled = h.offer <= h.step + 1e-9; hPlus.disabled = h.offer >= c.base - 1e-9;
        hTake.style.display = h.counter != null ? "" : "none"; if (h.counter != null) hTake.textContent = "TAKE " + money(h.counter);
        hGo.style.display = h.counter != null ? "none" : "";
        hagMsg.textContent = h.msg || "Name your price.";
        if (!h.shown) { h.shown = true; host.timeout(() => { try { hag.scrollIntoView({ block: "nearest" }); } catch (e) { /* ignore */ } }, 30); }
        hPat.innerHTML = clerkName + "'S PATIENCE <span class='dk-pips'>" + Array.from({ length: S.maxPatience }, (_, i) => "<i class='" + (i < S.patience ? "" : "off") + "'></i>").join("") + "</span>";
      }
      buyRow.style.display = inHag ? "none" : "";
      const asks = 3 - S.asks; bAsk.textContent = "ASK " + clerkName + (asks > 0 ? "" : " (…)");
      const total = bins.reduce((a, x) => a + x.items.length, 0);
      bDone.textContent = "PAY & GO"; bDone.disabled = !S.bag.length;
      cv.setAttribute("aria-label", c ? "Record bin " + b.label + ", sleeve " + (idx[S.bin] + 1) + " of " + b.items.length + ": " + c.rec.artist + " – " + c.rec.title + ", " + c.cond.name + ", " + money(priceOf(c)) : "Empty bin");
    }

    /* ------------------------------------------------ flipping */
    function flip(d) {
      if (S.hag) return;
      if (S.mode === "inspect") { stopPreview(0.1); S.mode = "flip"; }
      const n = binItems().length; if (!n) return;
      const ni = clamp(idx[S.bin] + d, 0, n - 1); if (ni === idx[S.bin]) { RP.sfx("blip"); render(); return; }
      idx[S.bin] = ni; S.target = ni; S.flips++;
      if (S.prev && S.prev.copy !== cur()) stopPreview(0.1);
      RP.sfx("click");
      if (RM) S.cur = S.target;
      const c = cur();
      if (c && Math.random() < 0.2) { const gq = genreQuip(c.rec); if (c.cond.id === "beat" && Math.random() < 0.5) quip("beat"); else if (gq) quip(gq); }
      render();
    }
    function jump(i) { const n = binItems().length; idx[S.bin] = clamp(i, 0, Math.max(0, n - 1)); S.target = idx[S.bin]; if (RM) S.cur = S.target; stopPreview(0.1); RP.sfx("click"); render(); }
    function gotoBin(i) {
      i = (i + bins.length) % bins.length; if (i === S.bin && S.mode === "flip") return;
      stopPreview(0.1); S.bin = i; S.mode = "flip"; S.hag = null; S.cur = S.target = idx[i]; RP.sfx("whoosh"); render();
      if (isRay && bins.length === 3) say(i === 0 ? "Dollar bin. Mind the guy in the corner. He's been there since Tuesday." : i === 1 ? "New arrivals. Meaning somebody's kids cleared out the crates." : "Behind the glass. Look, don't breathe.");
      else say(bins[i].label + ". Take your time.");
    }
    function inspectToggle() {
      if (!cur()) return;
      if (S.mode === "inspect") { stopPreview(0.1); setMode("flip"); RP.sfx("drop"); } else { setMode("inspect"); RP.sfx("pickup"); const c = cur(); if (c.cond.id === "beat") say("Look at that. That's not vinyl, that's a potato chip."); else if (c.gem) say("Hm. Odd sticker on that one."); }
    }

    /* ------------------------------------------------ haggle */
    function startHaggle() {
      const c = cur(); if (!c) return;
      if (c.base < 2) { RP.sfx("error"); quip("tiny"); return; }
      if (S.patience <= 0) { RP.sfx("error"); quip("noPatience"); return; }
      if (c.haggled || c.deal != null) { RP.sfx("error"); say("We already shook on it."); return; }
      if (S.mode === "flip") setMode("inspect");
      const step = stepOf(c.base);
      S.hag = { offer: Math.max(step, Math.round(c.base * 0.7 / step) * step), step, counter: null, msg: "Name your price. Sticker says " + money(c.base) + "." };
      render();
    }
    function adjustOffer(d) { const h = S.hag, c = cur(); if (!h || !c) return; h.offer = clamp(Math.round((h.offer + d * h.step) / h.step) * h.step, h.step, c.base); h.counter = null; RP.sfx("blip"); render(); }
    function makeOffer() {
      const h = S.hag, c = cur(); if (!h || !c) return;
      const step = h.step, floorP = Math.max(step, Math.ceil(c.base * c.floorFrac / step - 1e-9) * step);
      if (floorP >= c.base - 1e-9) { h.msg = "No discount on that one."; say("Sticker's the sticker on this one. Take it or flip."); c.haggled = true; S.hag = null; RP.sfx("error"); render(); return; }
      if (h.offer >= c.base - 1e-9) { S.hag = null; render(); return; }
      if (h.offer >= floorP - 1e-9) { c.deal = h.offer; c.haggled = true; S.hag = null; RP.sfx("coin"); quip("accept"); render(); return; }
      if (h.offer >= floorP - step * 1.01 || h.offer >= floorP * 0.88) { h.counter = floorP; h.msg = "He counters at " + money(floorP) + "."; RP.sfx("click"); say(DK.pick(RAY_QUIPS.counter) + " " + money(floorP) + "."); render(); return; }
      S.patience--; RP.sfx("error");
      if (S.patience <= 0) { S.hag = null; c.haggled = true; quip("noPatience"); } else { h.msg = DK.pick(RAY_QUIPS.insult); say(h.msg); }
      render();
    }
    function takeCounter() { const h = S.hag, c = cur(); if (!h || !c || h.counter == null) return; c.deal = h.counter; c.haggled = true; S.hag = null; RP.sfx("coin"); quip("accept"); render(); }

    /* ------------------------------------------------ buy */
    function buy() {
      const c = cur(); if (!c || S.done) return;
      const pr = priceOf(c);
      if (S.cash < pr - 1e-9) { RP.sfx("error"); say("You're " + money(pr - S.cash) + " short. " + DK.pick(RAY_QUIPS.short)); return; }
      S.cash = Math.round((S.cash - pr) * 100) / 100; stopPreview(0.1);
      const flyCv = DK.sleeveCanvas(c.rec, c, L.S);
      const saved = Math.max(0, c.base - pr); S.saved += saved;
      S.bag.push({ copy: c, rec: c.rec, paid: pr, saved, gem: c.gem });
      const b = binItems(); const i = idx[S.bin]; b.splice(i, 1); idx[S.bin] = clamp(i, 0, Math.max(0, b.length - 1)); S.target = idx[S.bin];
      S.cur = S.target;
      S.fly = RM ? null : { cv: flyCv, t: 0, from: i }; S.hag = null; S.mode = "flip";
      RP.sfx("cash"); RP.sfx("pickup");
      if (c.gem) quip("buyGem"); else quip("buy");
      render();
      if (!b.length) say("That bin's empty. Like my wallet. Try another.");
    }

    /* ------------------------------------------------ hints */
    function askRay() {
      if (S.asks >= 3) { RP.sfx("error"); say("Three questions. That's my limit. Use your ears."); return; }
      S.asks++; RP.sfx("blip");
      const cands = [];
      bins.forEach((b, bi) => b.items.forEach((c, ci) => { if (want && DK.matchWant(c.rec, want, c.base) && c.cond.id !== "beat") cands.push({ bi, ci, c }); }));
      if (!want) { say("Dig for the weird stuff. If it's cheap and heavy, check the guide price."); render(); return; }
      if (!cands.length) { say("Honestly? I don't have what you want. I don't have anything anyone wants."); render(); return; }
      const best = cands.sort((a, b) => a.c.base - b.c.base)[0];
      const gen = best.c.rec.genre;
      if (S.asks === 1) say(want.vibe ? "A " + want.vibe + "? Try the " + bins[best.bi].label.toLowerCase() + ". Don't say I never gave you anything." : "Try the " + bins[best.bi].label.toLowerCase() + ", genius.");
      else if (S.asks === 2) say("It's filed under " + gen + ". Flip to it. Your fingers can read, can't they?");
      else { say("Slot " + (best.ci + 1) + " in the " + bins[best.bi].label.toLowerCase() + ". That's the last freebie."); }
      if (S.asks >= 2 && S.bin !== best.bi) gotoBin(best.bi);
      render();
    }

    /* ------------------------------------------------ finish / score */
    function wantMet() {
      if (!want) return S.bag.length > 0;
      return S.bag.some(b => DK.matchWant(b.rec, want, b.paid) && b.copy.cond.id !== "beat");
    }
    function scoreIt() {
      const bag = S.bag, spent = budget - S.cash;
      const matches = want ? bag.filter(b => DK.matchWant(b.rec, want, b.paid)) : bag;
      const good = matches.filter(b => b.copy.cond.id !== "beat");
      const best = good.sort((a, b) => a.paid - b.paid)[0] || matches[0] || null;
      let score = 0, ok = wantMet();
      if (ok) {
        const cp = { mint: 14, "vg+": 12, vg: 7, beat: 0 }[best.copy.cond.id];
        const savedPct = best.base ? best.saved / (best.paid + best.saved) : 0;
        const bestPaid = best.paid;
        const waste = clamp((spent - bestPaid - bag.filter(b => b.gem).reduce((a, b) => a + b.paid, 0)) / Math.max(1, budget), 0, 1);
        const gemPts = Math.min(16, bag.filter(b => b.gem).length * 8);
        score = 48 + cp + Math.min(10, savedPct * 40) + 10 * clamp(S.cash / Math.max(1, budget), 0, 1) + gemPts - 12 * waste - S.asks * 4 + (want && want.id ? 0 : 0);
        if (!want) score = 36 + gemPts + 8 * (bag.reduce((a, b) => a + b.rec.price, 0) > spent * 1.5 ? 1 : 0.5) + cp * 0.5 + Math.min(10, S.saved) + 10 * clamp(S.cash / Math.max(1, budget), 0, 1) - S.asks * 4;
      } else score = bag.length ? 12 : 0;
      return { ok, score: Math.round(clamp(score, 0, 100)), spent: Math.round(spent * 100) / 100 };
    }
    function finishCard(res, ok) {
      S.done = true; stopPreview(0.2);
      root.innerHTML = ""; host.header("go.Digging", store.toUpperCase());
      const box = el("div", { cls: "dk-end mg-panel" }, root);
      el("h2", { cls: ok ? "ok" : "bad", text: ok ? (want && want.id ? "GOT IT." : "NICE DIGGING.") : "EMPTY-HANDED." }, box);
      el("div", { cls: "dk-score", html: res.score + "<small>/ 100</small>" }, box);
      const lines = el("div", { cls: "dk-lines" }, box);
      const ln = (a, b) => { const d = el("div", {}, lines); el("span", { text: a }, d); el("span", { text: b }, d); };
      if (want) ln("Wanted", DK.wantText(want).replace(/^WANT: /, ""));
      ln("Spent", money(res.spent) + " of " + money(budget));
      if (S.saved > 0) ln("Haggled off", money(S.saved));
      const worth = S.bag.reduce((a, b) => a + b.rec.price * b.copy.cond.mult, 0);
      if (S.bag.length) ln("Guide value of the bag", "~" + money(worth));
      const bagEl2 = el("div", { cls: "dk-bag" }, box);
      S.bag.forEach(b => {
        const it = el("div", { cls: "dk-bagitem" }, bagEl2); const cc = DK.cv(56, 56); cc.className = "px"; cc.getContext("2d").drawImage(DK.sleeveCanvas(b.rec, b.copy, 56), 0, 0); it.appendChild(cc);
        const d = el("div", { text: b.rec.artist + " – " + b.rec.title }, it); el("small", { text: b.copy.cond.name + " · paid " + money(b.paid) + (b.gem ? " · a steal!" : "") + (want && DK.matchWant(b.rec, want, b.paid) ? " · what you wanted" : "") }, d);
      });
      el("div", { cls: "dk-note", text: clerkName[0] + clerkName.slice(1).toLowerCase() + ": \"" + (ok ? (res.score >= 85 ? "Okay, okay. You know your way around a crate." : res.score >= 60 ? DK.pick(RAY_QUIPS.buy) : "It'll do. Come back when you've got more than lunch money.") : DK.pick(RAY_QUIPS.leave)) + "\"" }, box);
      if (!ok && S.bag.length) el("div", { cls: "dk-meta", text: clerkName[0] + clerkName.slice(1).toLowerCase() + " puts it all back on the shelf. You leave with nothing and spend nothing." }, box);
      const row = el("div", { cls: "row" }, box); el("div", { cls: "spacer" }, row);
      const go = el("button", { cls: "btn primary", type: "button", text: "CONTINUE" }, row);
      go.addEventListener("click", () => { finish && finish(res); });
      host.onKey(e => { if (e.key === "Enter" && document.activeElement !== go) { e.preventDefault(); go.click(); } });
      setTimeout(() => { try { go.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 30);
      RP.sfx(ok ? "success" : "fail");
    }
    function tryFinish() {
      if (S.done) return;
      const ok = wantMet();
      if (!S.bag.length) { quit(); return; }
      if (!ok && !S.confirmLeave) {
        S.confirmLeave = true; RP.sfx("error");
        const missing = want ? "You haven't got " + (want.id ? "the record you came for" : "a " + (want.vibe || want.genre || "record") + " yet") + ". Press again to leave anyway; it all goes back." : "";
        msg.textContent = missing; say("Sure you're done? Not what you came for."); bDone.textContent = "LEAVE ANYWAY"; return;
      }
      if (!ok) { quit(); return; }
      const r = scoreIt();
      finishCard({ ok: true, score: r.score, bought: S.bag.map(b => b.rec.id), spent: r.spent }, true);
    }
    function quit() {
      if (S.done) return;
      finishCard({ ok: false, score: 0, bought: [], spent: 0 }, false);
    }
    let leaveArmed = false, finish = null;
    bLeave.addEventListener("click", () => {
      if (S.done) return;
      if (S.bag.length && !leaveArmed) { leaveArmed = true; bLeave.textContent = "REALLY LEAVE? (PUT IT ALL BACK)"; msg.textContent = "Leaving puts everything back on the shelf. Press again to confirm."; host.timeout(() => { leaveArmed = false; bLeave.textContent = "LEAVE"; }, 4000); return; }
      S.done = true; finish && finish({ ok: false, score: 0, bought: [], spent: 0 });
    });
    bDone.addEventListener("click", tryFinish);
    bAsk.addEventListener("click", askRay);

    /* ------------------------------------------------ buttons + keys + pointer */
    bPrev.addEventListener("click", () => flip(-1)); bNext.addEventListener("click", () => flip(1)); bInspect.addEventListener("click", inspectToggle);
    bListen.addEventListener("click", startPreview); bHag.addEventListener("click", startHaggle); bBuy.addEventListener("click", buy);
    hMinus.addEventListener("click", () => adjustOffer(-1)); hPlus.addEventListener("click", () => adjustOffer(1));
    hGo.addEventListener("click", makeOffer); hTake.addEventListener("click", takeCounter); hBack.addEventListener("click", () => { S.hag = null; render(); });
    cv.addEventListener("pointerdown", e => {
      if (S.done) return;
      const r = cv.getBoundingClientRect(), fx = (e.clientX - r.left) / Math.max(1, r.width);
      if (S.mode === "inspect") { inspectToggle(); return; }
      if (fx < 0.3) flip(-1); else if (fx > 0.7) flip(1); else inspectToggle();
    });
    host.onKey(e => {
      if (S.done || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key, onBtn = document.activeElement && (document.activeElement.tagName === "BUTTON");
      if (S.hag) {
        if (k === "ArrowUp" || k === "ArrowRight" || k === "+" || k === "=") { e.preventDefault(); adjustOffer(1); return; }
        if (k === "ArrowDown" || k === "ArrowLeft" || k === "-") { e.preventDefault(); adjustOffer(-1); return; }
        if (k === "Enter" && !onBtn) { e.preventDefault(); S.hag.counter != null ? takeCounter() : makeOffer(); return; }
        if (k === "Escape") { e.preventDefault(); S.hag = null; render(); return; }
        return;
      }
      if (k === "ArrowLeft") { e.preventDefault(); flip(-1); }
      else if (k === "ArrowRight") { e.preventDefault(); flip(1); }
      else if (k === "ArrowUp" || k === "[") { e.preventDefault(); gotoBin(S.bin - 1); }
      else if (k === "ArrowDown" || k === "]") { e.preventDefault(); gotoBin(S.bin + 1); }
      else if (k === "Home") { e.preventDefault(); jump(0); } else if (k === "End") { e.preventDefault(); jump(999); }
      else if (k === "Enter" && !onBtn) { e.preventDefault(); if (S.mode === "inspect") buy(); else inspectToggle(); }
      else if (k === " " && !onBtn) { e.preventDefault(); startPreview(); }
      else if (k === "p" || k === "P") startPreview();
      else if (k === "h" || k === "H") startHaggle();
      else if (k === "b" || k === "B") buy();
      else if (k === "?" || k === "/" ) askRay();
      else if (k === "Escape") { if (S.mode === "inspect") { stopPreview(0.1); setMode("flip"); } }
    });

    /* ------------------------------------------------ drawing */
    function drawScene(c, t, dt) {
      c.drawImage(bgCv, 0, 0);
      /* light cones with a flicker */
      const fl = RM ? 1 : (Math.sin(t / 3100) > 0.985 || (Math.floor(t / 7000) % 5 === 2 && (t % 7000) < 160)) ? 0.35 : 1;
      c.globalAlpha = 0.2 * fl; c.drawImage(coneCv, 0, 0); c.globalAlpha = 1;
      /* clerk */
      if (L.wide) {
        const talking = !RM && S.say && t - S.sayT < Math.min(2600, S.say.length * 16 + 400);
        safe(() => RP.chars.draw(c, { id: clerkId, x: L.ctrX + 62, y: L.ctrY + 6, face: "left", act: "stand", frame: 0, mouth: talking && Math.floor(t / 110) % 2 === 0, blink: Math.floor(t / 2600) % 7 === 0 && (t % 2600) < 140, scale: 0.72 }, { lx: -0.4, shadow: 0, cast: false }));
        c.drawImage(fgCv, 0, 0);
        /* bag on the counter */
        if (S.bag.length) { const bx = L.ctrX + 40, by = L.ctrY - 26; c.drawImage(bagCv, bx, by); const n = Math.min(4, S.bag.length); for (let i = 0; i < n; i++) { const it = S.bag[S.bag.length - 1 - i]; c.drawImage(DK.sleeveCanvas(it.rec, it.copy, 24), 0, 0, 24, 8, bx + 2 + i * 4, by + 2 - i, 18, 6); } c.drawImage(bagCv, 0, 12, 26, 18, bx, by + 12, 26, 18); }
      }
      if (S.mode === "inspect") drawInspect(c, t); else drawBin(c, t);
      /* dust */
      if (!RM) { dust.step(dt); dust.draw(c); }
      /* buy flight */
      if (S.fly) {
        const f = S.fly; f.t += dt / 0.35; const e = DK.ease(f.t), tx = L.wide ? L.ctrX + 50 : L.W - 18, ty = L.wide ? L.ctrY - 14 : L.H - 12, sx = L.cx - L.S / 2, sy = L.yFocus;
        const sz = Math.round(L.S * (1 - 0.7 * e)); if (f.t < 1 && !RM) c.drawImage(f.cv, Math.round(sx + (tx - sx) * e), Math.round(sy + (ty - sy) * e - Math.sin(e * 3.14) * 18), sz, sz); else S.fly = null;
      }
    }
    function drawBin(c, t) {
      const b = bins[S.bin], items = b.items, n = items.length, bx = L.cx - Math.floor(L.binW / 2), shells = binCv[S.bin];
      c.drawImage(shells.back, bx, L.frontY - 6);
      /* sleeves, far to near */
      const cur_ = S.cur, Sz = L.S, y0 = L.yFocus, bob = RM ? 0 : Math.round(Math.sin(t / 900) * 0.6);
      const hi = Math.min(n - 1, Math.floor(cur_) + (L.W < 240 ? 6 : 8)), lo = Math.max(0, Math.floor(cur_) - 1);
      for (let k = hi; k >= lo; k--) {
        const it = items[k], slot = k - cur_; let y, w = Sz;
        if (slot >= 0) { y = y0 - Math.round(Math.min(slot, 8) * 4); w = Sz - 2 * Math.round(Math.min(slot, 8)); }
        else y = y0 + Math.round(-slot * Sz * 0.95);
        if (y >= L.frontY + 4) continue;
        const sx = L.cx - Math.floor(w / 2), cvs = DK.sleeveCanvas(it.rec, it.copy, Sz);
        const dy = slot <= 0.001 ? bob : 0;
        c.drawImage(cvs, 0, 0, Sz, Sz, sx, y + dy, w, w);
        if (slot > 0.001) { c.globalAlpha = Math.min(0.55, 0.06 * slot + 0.04); R(c, sx, y, w, w, "#140824"); c.globalAlpha = 1; }
        /* divider tab on the first sleeve of each genre */
        if (slot >= 0.99 && slot <= 8 && (k === 0 || items[k - 1].rec.genre !== it.rec.genre)) {
          const lab = DK.ascii(it.rec.genre).toUpperCase().slice(0, 7), tw = RP.u.txtW(lab, 1, 1) + 6, tcol = ["#ff3fa4", "#39d0ff", "#ffd23f", "#9be15d", "#ff8a4c", "#c8b0ff"][hashStr(it.rec.genre) % 6];
          const tx = sx + 4 + (hashStr(it.rec.genre) % 3) * Math.max(8, Math.floor((w - tw - 8) / 2)), ty = y - 6; R(c, tx, ty, tw, 7, "#f4ead0"); R(c, tx, ty, tw, 2, tcol); RP.u.txt(c, lab, tx + 3, ty + 2, "#1d1622", 1, 1);
        }
        if (slot <= 0.001 && slot > -1) { const ptxt = money(it.deal != null ? it.deal : it.base); DK.sticker(c, sx + w - (RP.u.txtW(ptxt, 1, 1) + 5) - 3, y + dy + 3, ptxt, {}); }
      }
      if (!n) { RP.u.txtC(c, "EMPTY", L.cx, L.yFocus + 30, "#8c84b8", 2, 1); }
      c.drawImage(shells.front, bx, L.frontY - 24);
      /* nav arrows */
      if (n > 1) {
        const ay = L.yFocus + Math.floor(Sz * 0.4), pulse = RM ? 1 : (Math.floor(t / 500) % 2);
        if (idx[S.bin] > 0) RP.u.txt(c, "<", bx - 7 - pulse, ay, "#ffc44d", 2, 1);
        if (idx[S.bin] < n - 1) RP.u.txt(c, ">", bx + L.binW + 2 + pulse, ay, "#ffc44d", 2, 1);
        const pos = (idx[S.bin] + 1) + "/" + n; RP.u.txt(c, pos, bx + L.binW - 8 - RP.u.txtW(pos, 1, 1), L.frontY + 8, "#3a2418", 1, 1);
      }
    }
    function drawInspect(c, t) {
      const it = cur(); if (!it) { drawBin(c, t); return; }
      /* dim the bin scene */
      c.globalAlpha = 0.78; R(c, 0, 0, L.W, L.H, "#0a0614"); c.globalAlpha = 1;
      const Sz = L.W < 240 ? 72 : 96, r = Math.floor(Sz * 0.46), total = Sz + Math.round(r * 1.35), x0 = Math.floor((L.W - total) / 2), y0 = Math.floor((L.H - Sz - 28) / 2) + 6;
      /* display felt */
      R(c, x0 - 8, y0 - 8, total + 16, Sz + 36, "#1c1030"); R(c, x0 - 8, y0 - 8, total + 16, 1, "#4a3a7a"); R(c, x0 - 8, y0 + Sz + 27, total + 16, 1, "#0a0614"); R(c, x0 - 8, y0 - 8, 1, Sz + 36, "#33225a"); R(c, x0 + total + 7, y0 - 8, 1, Sz + 36, "#0a0614");
      const d = DK.discCanvas(it.rec, it.copy, r), pv = S.prev && S.prev.copy === it;
      const dcx = x0 + Sz + Math.round(r * 0.35), dcy = y0 + Math.round(Sz / 2);
      const rot = pv && !RM ? (t / 1000) * 3.4 : 0.6;
      const warp = it.warped ? (RM ? 1 : 2) : 0;
      DK.drawDisc(c, dcx, dcy, d, { rot, warp, phase: pv && !RM ? t / 160 : 1.3, sheen: pv && !RM ? rot * 0.15 + 0.9 : 0.9 });
      /* tonearm */
      if (pv) { RP.u.line(c, dcx + r + 3, dcy - r + 4, dcx + 4, dcy - r * 0.4, "#c8c4d8"); RP.u.line(c, dcx + r + 4, dcy - r + 4, dcx + 5, dcy - r * 0.4 + 1, "#6a667c"); R(c, dcx + 2, dcy - Math.round(r * 0.4) - 1, 3, 3, "#ffd23f"); }
      c.drawImage(DK.sleeveCanvas(it.rec, it.copy, Sz), x0, y0);
      DK.sticker(c, x0 + Sz - (RP.u.txtW(money(priceOf(it)), 1, 1) + 5) - 3, y0 + 3, money(priceOf(it)), {});
      /* VU while listening */
      if (pv) { const vx = x0 + total - 36; for (let i = 0; i < 6; i++) { const h = 2 + Math.round((Math.sin(t / 90 * (1 + i * 0.37) + i) * 0.5 + 0.5) * 11); R(c, vx + i * 5, y0 + Sz + 21 - h, 3, h, i > 3 ? "#ff5a5a" : i > 1 ? "#ffc44d" : "#5cff9a"); } }
      /* condition callouts */
      const tag = it.cond;
      DK.gradeTag(c, x0, y0 + Sz + 8, tag);
      if (it.warped) { RP.u.txt(c, "WARPED", x0 + 34, y0 + Sz + 11, "#ff5a5a", 1, 1); }
      if (L.W >= 240 && !it.warped) RP.u.txt(c, DK.ascii(it.cond.id === "mint" ? "SEALED SHINE" : it.cond.id === "beat" ? "SEE THE DAMAGE" : it.cond.id === "vg" ? "SCUFFS SHOW" : "CLEAN-ISH"), x0 + 34, y0 + Sz + 11, "#8c84b8", 1, 1);
    }

    /* ------------------------------------------------ boot */
    let dust = null;
    function refit() {
      const wideCols = root.clientWidth >= 820;
      const box = stage; const avail = wideCols ? Math.min(680, root.clientWidth - 300) : root.clientWidth;
      const holder = { clientWidth: Math.min(avail, root.clientWidth) };
      const fit = DK.fit(cv, holder, { scale: 2, minW: 160, maxW: 340, h: W => W < 240 ? 138 : 184, fallback: 328 });
      L = layout(fit.W, fit.H); buildLayers();
      dust = DK.dust(RM ? 0 : 14, [L.cx - 56, 8, 112, L.floorY - 24], Math.random);
    }
    refit();
    let rto = null; const onResize = () => { clearTimeout(rto); rto = setTimeout(() => { if (!S.done) refit(); }, 120); };
    window.addEventListener("resize", onResize); host.cleanup(() => window.removeEventListener("resize", onResize));
    render();
    say(isRay ? DK.pick(RAY_QUIPS.intro) : "Take your time. Bins are alphabetical, ish.");
    msg.textContent = want ? (want.id ? "Find the one record you came for. Mind the condition." : "Find a record that fits the list. Mind the condition and the price.") : "Dig around. Buy what sounds good.";
    if (p.debug) window.__dg = { S, bins, want, budget, cur: () => cur() };

    return new Promise(resolve => {
      let resolved = false;
      finish = res => { if (resolved) return; resolved = true; stopPreview(0); resolve(res); };
      let last = null;
      host.raf(tm => {
        if (resolved) return false;
        const dt = last == null ? 0.016 : clamp((tm - last) / 1000, 0, 0.1); last = tm;
        if (!S.done) {
          /* ease the flip */
          if (Math.abs(S.cur - S.target) > 0.001) { const d = S.target - S.cur, st = Math.min(Math.abs(d), dt * 9); S.cur += Math.sign(d) * Math.max(st, 0.0001); if (Math.abs(S.target - S.cur) < 0.02) S.cur = S.target; }
          /* preview timing, crackle and wow */
          const pv = S.prev;
          if (pv) {
            const el_ = (performance.now() - pv.t0) / 1000;
            prevFill.style.width = Math.min(100, el_ / pv.len * 100) + "%"; prevLbl.textContent = "▶ ~" + pv.copy.rec.bpm + " BPM  0:" + String(Math.floor(el_)).padStart(2, "0");
            const cid = pv.copy.cond.id, gap = cid === "beat" ? 1400 : cid === "vg" ? 2800 : cid === "vg+" ? 6000 : 0;
            if (gap && performance.now() - pv.lastCrack > gap) { pv.lastCrack = performance.now(); RP.sfx("crackle"); }
            if (pv.copy.warped) { try { pv.loop.setBpm(pv.copy.rec.bpm * (1 + 0.045 * Math.sin(el_ * 2.6))); } catch (e) { /* ignore */ } }
            if (el_ > pv.len) { stopPreview(0.5); render(); }
          }
          if (L) drawScene(sctx(), tm, dt);
        }
      });
      host.cleanup(() => { resolved = true; });
    });
  }
});
})();
