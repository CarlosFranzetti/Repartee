/* setkit_lib.js — shared helpers for crowd.Read, set.Time and playlist.Order.
   Exposes RP.setkit. Load order inside src/minigames is alphabetical, so the three games only touch
   RP.setkit inside play()/auto(), never at load time.
   Contents: dither patterns & gradients, genre families/compatibility, record cards, a silent-safe
   sound crossfader, the end card, and K.Floor — the pixel crowd renderer (DJ-booth view and club view). */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u;
const { R, ell, line, poly, bayer, mulberry, hashStr, clamp, lerp, mix, txt, txtC, txtW, el } = U;
const K = RP.setkit = {};

K.reduced = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };

/* ======================================================================
   dithering
   ====================================================================== */
const pats = new Map();
let patCtx = null;
/* fill style that paints `color` on `level`/16 of the pixels (Bayer 4x4). Usable anywhere a color is. */
K.dpat = function (color, level) {
  level = clamp(Math.round(level), 0, 16);
  if (level <= 0) return "rgba(0,0,0,0)";
  if (level >= 16) return color;
  const key = color + "|" + level;
  let p = pats.get(key);
  if (!p) {
    if (!patCtx) patCtx = U.mk(1, 1).getContext("2d");
    const cv = U.mk(4, 4), cc = cv.getContext("2d");
    cc.fillStyle = color;
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (bayer(x, y) < level) cc.fillRect(x, y, 1, 1);
    p = patCtx.createPattern(cv, "repeat");
    pats.set(key, p);
  }
  return p;
};
/* banded + dithered vertical gradient */
K.vgrad = function (c, x, y, w, h, a, b, steps = 8) {
  const cols = []; for (let i = 0; i <= steps; i++) cols.push(mix(a, b, i / steps));
  for (let r = 0; r < h; r++) {
    const t = (r / Math.max(1, h - 1)) * steps, i = Math.min(steps - 1, Math.floor(t)), f = t - i;
    c.fillStyle = cols[i]; c.fillRect(x, y + r, w, 1);
    const lv = Math.round(f * 16);
    if (lv > 0) { c.fillStyle = K.dpat(cols[i + 1], lv); c.fillRect(x, y + r, w, 1); }
  }
};
/* dithered pixel ellipse (glow) */
K.glow = function (c, cx, cy, rx, ry, color, level) { ell(c, cx, cy, rx, ry, K.dpat(color, level)); };
/* pixel text with a 1px outline */
K.otxt = function (c, s, x, y, col, sc = 1, out = "#0a0410") {
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) txt(c, s, x + dx * sc, y + dy * sc, out, sc);
  txt(c, s, x, y, col, sc);
};
K.otxtC = (c, s, cx, y, col, sc = 1, out) => K.otxt(c, s, Math.round(cx - txtW(s, sc) / 2), y, col, sc, out);
const glyph = (c, rows, x, y, col) => { c.fillStyle = col; rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === "X") c.fillRect(x + i, y + j, 1, 1); }); };
const GLYPHS = {
  note: ["..XX.", "..X.X", "..X..", "..X..", "XXX..", "XXX.."],
  heart: [".X.X.", "XXXXX", "XXXXX", ".XXX.", "..X.."],
  bang: ["X", "X", "X", "X", " ", "X"],
  zzz: ["XXX", "..X", ".X.", "X..", "XXX"],
  star: ["..X..", ".XXX.", "XXXXX", ".XXX.", ".X.X."]
};
K.glyph = glyph; K.GLYPHS = GLYPHS;

/* ======================================================================
   records, genres
   ====================================================================== */
K.rec = id => RP.rec(id);
K.pair = r => r.artist + " – " + r.title;
K.full = r => r.artist + " – " + r.title + " (" + r.label + (r.year ? ", " + r.year : "") + ")";
K.sub = r => r.label + (r.year ? ", " + r.year : "");
K.allRecords = () => (RP.data.records || []).concat(Object.values(RP.data.extraRecords || {}));

const FAM = {
  house: "house", "deep house": "house", "chicago house": "house", garage: "house", soul: "house", balearic: "house", latin: "house",
  "acid house": "acid", disco: "disco", boogie: "disco", italo: "disco", "r&b": "disco", novelty: "pop",
  "pop-dance": "pop", eurodance: "pop", "hip-house": "pop",
  "detroit techno": "techno", techno: "techno", minimal: "techno",
  electro: "electro", "hip-hop": "hiphop", breaks: "breaks", funk: "funk", "jazz-funk": "funk",
  ambient: "ambient", "smooth jazz": "ambient"
};
K.family = g => FAM[g] || "house";
const FAMS = ["house", "disco", "acid", "techno", "electro", "pop", "hiphop", "breaks", "funk", "ambient"];
const CM = {
  house: { house: 1, disco: .85, acid: .8, techno: .55, electro: .5, pop: .6, hiphop: .25, breaks: .4, funk: .5, ambient: .45 },
  disco: { disco: 1, acid: .35, techno: .15, electro: .5, pop: .75, hiphop: .35, breaks: .45, funk: .85, ambient: .4 },
  acid: { acid: 1, techno: .85, electro: .7, pop: .2, hiphop: .1, breaks: .4, funk: .15, ambient: .3 },
  techno: { techno: 1, electro: .75, pop: .1, hiphop: .05, breaks: .35, funk: .1, ambient: .5 },
  electro: { electro: 1, pop: .45, hiphop: .7, breaks: .7, funk: .5, ambient: .3 },
  pop: { pop: 1, hiphop: .4, breaks: .3, funk: .45, ambient: .15 },
  hiphop: { hiphop: 1, breaks: .9, funk: .85, ambient: .2 },
  breaks: { breaks: 1, funk: .9, ambient: .2 },
  funk: { funk: 1, ambient: .35 },
  ambient: { ambient: 1 }
};
/* how well two genres sit next to each other (1 = same world, 0 = train wreck). Judgement call, not a fact. */
K.compat = function (g1, g2) {
  const a = K.family(g1), b = K.family(g2);
  if (a === b) return g1 === g2 ? 1 : 0.95;
  return (CM[a] && CM[a][b] != null) ? CM[a][b] : (CM[b] && CM[b][a] != null ? CM[b][a] : 0.5);
};
/* BPM jump -> 0..1 */
K.bpmJump = function (d) {
  d = Math.abs(d);
  return d <= 2 ? 1 : d <= 4 ? .92 : d <= 6 ? .78 : d <= 8 ? .6 : d <= 12 ? .35 : d <= 18 ? .15 : 0;
};
K.hasVibe = (r, v) => (r.vibe || []).indexOf(v) >= 0;
K.shuffle = (a, rnd) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
K.grade = s => s >= 92 ? "S" : s >= 80 ? "A" : s >= 68 ? "B" : s >= 55 ? "C" : s >= 40 ? "D" : "F";
K.vibeTags = r => {
  const o = [], v = r.vibe || [];
  if (v.indexOf("weird") >= 0) o.push(["WEIRD", "#ff3fa4"]);
  if (v.indexOf("peak") >= 0) o.push(["PEAK", "#ffc44d"]);
  if (v.indexOf("builder") >= 0) o.push(["BUILDER", "#9be15d"]);
  if (v.indexOf("warmup") >= 0) o.push(["WARMUP", "#62e6ff"]);
  if (v.indexOf("closer") >= 0) o.push(["CLOSER", "#c8b0ff"]);
  if (v.indexOf("sunrise") >= 0) o.push(["SUNRISE", "#ffb08a"]);
  if (v.indexOf("vocal") >= 0) o.push(["VOCAL", "#8c84b8"]);
  if (v.indexOf("tool") >= 0) o.push(["TOOL", "#8c84b8"]);
  return o;
};

/* ======================================================================
   css (injected once)
   ====================================================================== */
const CSS = `
.sk-stage { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.sk-cv { display: block; image-rendering: pixelated; image-rendering: crisp-edges; background: #05030a; border: 1px solid var(--line); margin-inline: auto; }
.sk-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.sk-chip { font-size: 17px; line-height: 1.15; padding: 1px 7px; border: 1px solid var(--line); border-radius: 2px; color: var(--muted); background: #0e0a1e; white-space: nowrap; }
.sk-chip b { color: var(--fg); font-weight: 400; }
.sk-chip.hot { border-color: var(--pink); } .sk-chip.hot b { color: var(--pink); }
.sk-card { display: grid; grid-template-columns: 48px minmax(0, 1fr); column-gap: 8px; row-gap: 1px; align-items: start; text-align: left; background: #120e24; border: 1px solid #2d2456; border-left: 3px solid var(--tone, #2d2456); color: var(--fg); padding: 5px 7px 5px 5px; cursor: pointer; border-radius: 2px; min-width: 0; font-family: var(--ui); position: relative; }
.sk-card:hover { border-color: var(--pink); }
.sk-card:focus-visible { outline: 2px solid var(--cyan); outline-offset: 1px; }
.sk-card.sel { border-color: var(--cyan); background: #181240; box-shadow: 0 0 0 1px var(--cyan) inset; }
.sk-card.used, .sk-card:disabled { opacity: .38; cursor: default; }
.sk-card > :not(canvas) { grid-column: 2; }
.sk-card canvas { grid-row: 1 / span 4; grid-column: 1; width: 48px; height: 48px; image-rendering: pixelated; image-rendering: crisp-edges; border: 1px solid #000; background: #000; }
.sk-t1 { font-size: 19px; line-height: 1; color: #fff; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow-wrap: anywhere; }
.sk-card.sel .sk-t1 { -webkit-line-clamp: 3; }
.sk-card.compact { grid-template-columns: 36px minmax(0, 1fr); column-gap: 7px; padding: 4px 6px 4px 4px; }
.sk-card.compact canvas { width: 36px; height: 36px; grid-row: 1 / span 3; }
.sk-card.compact .sk-t1 { font-size: 18px; -webkit-line-clamp: 1; }
.sk-card.compact.sel .sk-t1 { -webkit-line-clamp: 2; }
.sk-card.compact .sk-t2, .sk-card.compact .sk-t3 { font-size: 14px; gap: 1px 6px; }
.sk-t2 { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 7px; font-size: 15px; line-height: 1; color: var(--muted); }
.sk-t2 .w { color: var(--fg); }
.sk-t3 { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; font-size: 15px; line-height: 1; color: var(--muted); min-height: 0; }
.sk-t3:empty { display: none; } .sk-t3 .g { color: #b7aaf0; }
.sk-pips { display: inline-flex; gap: 1px; } .sk-pips i { display: block; width: 6px; height: 9px; background: #2a2250; } .sk-pips i.on { background: var(--c, var(--pink)); }
.sk-tag { font-size: 13px; line-height: 1; padding: 1px 4px 0; border-radius: 1px; color: #12061a; background: var(--c, #8c84b8); }
.sk-meter { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 2px; height: 14px; }
.sk-meter i { background: #241d48; } .sk-meter i.on { background: var(--c, var(--pink)); }
.sk-mrow { display: grid; grid-template-columns: 74px minmax(0, 1fr) 40px; gap: 8px; align-items: center; font-size: 17px; color: var(--muted); }
.sk-mrow b { color: var(--fg); font-weight: 400; text-align: right; }
.sk-end { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding: 14px 12px 16px; background: radial-gradient(ellipse at 50% 0%, #2a0d3a 0%, #120e24 75%); border: 1px solid var(--line); border-radius: 4px; max-width: 640px; width: 100%; margin-inline: auto; box-sizing: border-box; }
.sk-end .kick { font-size: 18px; letter-spacing: .14em; color: var(--muted); }
.sk-end h2 { font-family: var(--logo); font-weight: 400; font-size: clamp(16px, 4.6vw, 26px); line-height: 1.25; margin: 0; color: #fff; text-shadow: 0 3px 0 #2a0d3a; }
.sk-end h2.win { color: var(--lime); } .sk-end h2.lose { color: #ff6a6a; }
.sk-end .banner { image-rendering: pixelated; width: min(100%, 480px); height: auto; border: 1px solid var(--line); }
.sk-end .score { font-family: var(--logo); font-size: clamp(28px, 9vw, 48px); color: var(--amber); text-shadow: 0 3px 0 #000; font-variant-numeric: tabular-nums; }
.sk-end .score small { font-size: .38em; color: var(--muted); margin-left: 6px; }
.sk-end .lines { display: flex; flex-direction: column; gap: 3px; font-size: 20px; line-height: 1.1; color: var(--fg); max-width: 52ch; }
.sk-end .lines .dim { color: var(--muted); font-size: 18px; }
.sk-end .parts { display: flex; flex-direction: column; gap: 4px; width: min(100%, 420px); }
.sk-end .row { justify-content: center; }
.sk-pop { position: fixed; left: 0; right: 0; top: 40%; display: flex; justify-content: center; pointer-events: none; z-index: 30; font-family: var(--logo); font-size: clamp(16px, 4.4vw, 34px); text-shadow: 0 3px 0 #000; text-align: center; }
.sk-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;
let cssDone = false;
K.css = function () { if (cssDone) return; cssDone = true; el("style", { text: CSS }, document.head); };

/* fit a low-res canvas into its container: integer scale when it can, otherwise shrink */
K.fit = function (host, cv, W, H, parent, maxK) {
  const apply = () => {
    const p = parent || cv.parentElement; if (!p) return;
    const avail = Math.max(120, p.clientWidth || 320);
    let k = avail >= W * 2 ? Math.floor(avail / W) : (avail >= W ? 1 : avail / W);
    if (maxK) k = Math.min(k, maxK);
    cv.style.width = Math.round(W * k) + "px"; cv.style.height = Math.round(H * k) + "px";
  };
  apply();
  let ro = null;
  try { ro = new ResizeObserver(apply); ro.observe(parent || cv.parentElement); } catch (e) { window.addEventListener("resize", apply); }
  host.cleanup(() => { try { ro ? ro.disconnect() : window.removeEventListener("resize", apply); } catch (e) { /* ignore */ } });
  return apply;
};

/* ======================================================================
   record card (DOM)
   ====================================================================== */
const sleeveCache = new Map();
K.sleeveCanvas = function (host, rec, size = 24) {
  const key = rec.id + "|" + size;
  let src = sleeveCache.get(key);
  if (!src) {
    src = U.mk(size, size);
    try { host.sleeve(src.getContext("2d"), rec, 0, 0, size); } catch (e) { src.getContext("2d").fillStyle = "#3a2a60"; src.getContext("2d").fillRect(0, 0, size, size); }
    sleeveCache.set(key, src);
  }
  const cv = U.mk(size, size); cv.getContext("2d").drawImage(src, 0, 0);
  cv.className = "px";
  return cv;
};
K.pips = (n, color) => { const s = el("span", { cls: "sk-pips" }); if (color) s.style.setProperty("--c", color); for (let i = 1; i <= 5; i++) el("i", { cls: i <= n ? "on" : "" }, s); s.title = "Energy " + n + "/5"; return s; };
/* compact record card. o: { key: "1", tags: bool }. Returns the <button>; b.t3 is the third row (tags + extras) */
K.card = function (host, rec, o = {}) {
  const b = el("button", { cls: "sk-card" + (o.compact ? " compact" : ""), type: "button" });
  b.dataset.id = rec.id;
  b.title = K.full(rec);
  b.appendChild(K.sleeveCanvas(host, rec, o.compact ? 18 : 24));
  el("div", { cls: "sk-t1", text: (o.key ? o.key + "  " : "") + K.pair(rec) }, b);
  const t2 = el("div", { cls: "sk-t2" }, b);
  el("span", { text: "(" + K.sub(rec) + ")" }, t2);
  el("span", { cls: "w", text: rec.bpm + " BPM" }, t2);
  t2.appendChild(K.pips(rec.energy || 3));
  const t3 = el("div", { cls: "sk-t3" }, b);
  if (o.genre !== false) el("span", { cls: "g", text: rec.genre }, t3);
  if (o.tags !== false) K.vibeTags(rec).filter(x => x[0] !== "VOCAL" && x[0] !== "TOOL").slice(0, 2).forEach(([n, col]) => { const s = el("span", { cls: "sk-tag", text: n }, t3); s.style.setProperty("--c", col); });
  b.t3 = t3;
  return b;
};

/* ======================================================================
   sound: silent-safe crossfading record loops
   ====================================================================== */
K.sound = function (host) {
  const all = new Set();
  let cur = null, curRec = null;
  const S = {
    get rec() { return curRec; },
    play(rec, o) {
      o = Object.assign({ vol: 0.7, fade: 1.2, filter: null, energy: null, bpm: null }, o || {});
      const old = cur; let lp = null;
      try {
        lp = RP.audio.recordLoop(rec, { volume: 0.0001, energy: o.energy || rec.energy || 3, bpm: o.bpm || rec.bpm });
        if (o.filter) lp.setFilter(o.filter[0], o.filter[1]);
        lp.start(); lp.setVolume(o.vol, 0.18);
        all.add(lp);
      } catch (e) { lp = null; }
      cur = lp; curRec = rec;
      if (old) { try { old.setVolume(0.0001, Math.max(0.05, o.fade / 4)); old.stop(o.fade); } catch (e) { /* ignore */ } }
      return lp;
    },
    bed(spec) { // quiet background loop {genre,bpm,energy,vol,filter}
      const o = Object.assign({ genre: "house", bpm: 100, energy: 1, vol: 0.25, filter: ["lowpass", 700], seed: 5 }, spec || {});
      try {
        const lp = RP.audio.loop({ genre: o.genre, bpm: o.bpm, energy: o.energy, seed: o.seed, volume: 0.0001 });
        if (o.filter) lp.setFilter(o.filter[0], o.filter[1]);
        lp.start(); lp.setVolume(o.vol, 0.3); all.add(lp); cur = lp; curRec = null; return lp;
      } catch (e) { return null; }
    },
    volume(v, ramp) { try { cur && cur.setVolume(v, ramp || 0.1); } catch (e) { /* ignore */ } },
    filter(type, f) { try { cur && cur.setFilter(type, f); } catch (e) { /* ignore */ } },
    stop(fade) { const l = cur; cur = null; curRec = null; if (l) { try { l.setVolume(0.0001, Math.max(0.05, (fade || 0.6) / 4)); l.stop(fade || 0.6); } catch (e) { /* ignore */ } } },
    killAll() { all.forEach(l => { try { l.stop(0); } catch (e) { /* ignore */ } }); all.clear(); cur = null; }
  };
  host.cleanup(() => S.killAll());
  return S;
};

/* ======================================================================
   end card
   cfg: { ok, score, kicker, title, lines:[], dim:[], parts:[{label,v,color}], canAgain, againLabel, continueLabel, banner:{...} }
   resolves "continue" | "again"
   ====================================================================== */
K.endCard = function (host, parent, cfg) {
  K.css();
  const reduced = K.reduced();
  const box = el("section", { cls: "sk-end", role: "dialog", "aria-label": "Result" }, parent);
  el("div", { cls: "kick", text: cfg.kicker || (cfg.ok ? "SET COMPLETE" : "SET OVER") }, box);
  // banner: dithered sunburst + grade letter
  const bw = 160, bh = 40, bc = el("canvas", { cls: "banner px", width: bw, height: bh }, box), g = bc.getContext("2d");
  const grade = K.grade(cfg.score), win = !!cfg.ok;
  const A = win ? (cfg.accent || "#ff3fa4") : "#5a5a7a", B = win ? "#ffc44d" : "#3a3a5a";
  K.vgrad(g, 0, 0, bw, bh, win ? "#1b0b3a" : "#0e0c18", win ? "#3a1450" : "#1a1828", 8);
  for (let i = 0; i < 18; i++) {
    const a0 = (i / 18) * Math.PI * 2, a1 = a0 + (Math.PI * 2) / 36;
    poly(g, [[bw / 2, bh / 2 + 6], [bw / 2 + Math.cos(a0) * 200, bh / 2 + 6 + Math.sin(a0) * 200], [bw / 2 + Math.cos(a1) * 200, bh / 2 + 6 + Math.sin(a1) * 200]], K.dpat(A, win ? 4 : 2));
  }
  K.glow(g, bw / 2, bh / 2 + 4, 34, 14, B, win ? 5 : 2);
  K.otxtC(g, grade, bw / 2, 5, win ? "#fff3a0" : "#8a86a0", 4, "#12061a");
  const nst = cfg.score >= 90 ? 5 : cfg.score >= 75 ? 4 : cfg.score >= 60 ? 3 : cfg.score >= 40 ? 2 : cfg.score >= 20 ? 1 : 0;
  for (let i = 0; i < 5; i++) { const sx = bw / 2 - 17 + i * 7; glyph(g, GLYPHS.star, sx + 1, 29, "#12061a"); glyph(g, GLYPHS.star, sx, 28, i < nst ? "#ffd23f" : "#3a3560"); }
  el("h2", { cls: cfg.ok ? "win" : "lose", text: cfg.title || (cfg.ok ? "NAILED IT" : "NOT YOUR NIGHT") }, box);
  const sc = el("div", { cls: "score", html: "0<small>/100</small>" }, box);
  const parts = el("div", { cls: "parts" }, box);
  const rows = (cfg.parts || []).map(p => {
    const r = el("div", { cls: "sk-mrow" }, parts); el("span", { text: p.label }, r);
    const m = el("div", { cls: "sk-meter" }, r); if (p.color) m.style.setProperty("--c", p.color);
    for (let i = 0; i < 10; i++) el("i", {}, m);
    const v = el("b", { text: Math.round(clamp(p.v, 0, 1) * 100) + "%" }, r);
    return { m, v: clamp(p.v, 0, 1), vv: v };
  });
  const lines = el("div", { cls: "lines" }, box);
  (cfg.lines || []).forEach(t => el("div", { text: t }, lines));
  (cfg.dim || []).forEach(t => el("div", { cls: "dim", text: t }, lines));
  const acts = el("div", { cls: "row" }, box);
  return new Promise(resolve => {
    let done = false;
    const fin = v => { if (done) return; done = true; resolve(v); };
    if (cfg.canAgain) { const b = el("button", { cls: "btn", type: "button", text: cfg.againLabel || "TRY AGAIN" }, acts); b.addEventListener("click", () => fin("again")); }
    const cb = el("button", { cls: "btn primary", type: "button", text: cfg.continueLabel || "CONTINUE" }, acts);
    cb.addEventListener("click", () => fin("continue"));
    setTimeout(() => { try { cb.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 50);
    // count-up + meters
    const target = Math.round(clamp(cfg.score, 0, 100));
    const set = n => { sc.innerHTML = n + "<small>/100</small>"; rows.forEach(r => { const on = Math.round(r.v * 10 * Math.min(1, n / Math.max(1, target))); [...r.m.children].forEach((s, i) => s.classList.toggle("on", i < on)); }); };
    if (reduced) set(target);
    else { let n = 0; const iv = setInterval(() => { n = Math.min(target, n + Math.max(1, Math.round(target / 24))); set(n); if (n >= target) clearInterval(iv); }, 28); host.cleanup(() => clearInterval(iv)); }
    host.onKey(e => { if ((e.key === "Enter" || e.key === " ") && document.activeElement && document.activeElement.tagName !== "BUTTON") { e.preventDefault(); fin("continue"); } });
    host.cleanup(() => { done = true; });
  });
};

/* big flash text (reuses the shared .blend look but shorter-lived and non-blocking) */
K.flash = function (text, color, ms) {
  const f = el("div", { cls: "sk-pop", text }, document.body);
  if (color) f.style.color = color;
  setTimeout(() => f.remove(), ms || 1100);
  return f;
};

/* ======================================================================
   themes for the pixel floor
   ====================================================================== */
const THEMES = {
  "empty-bar": { sign: "NOWHERE", wallTop: "#0f0a20", wallBot: "#3b1f42", floorTop: "#2e1a34", floorBot: "#150c1e", accent: "#ffc44d", accent2: "#ff3fa4", rim: "#ffb04a", glow: "#ff9a4a", beams: ["#ffc44d", "#ff3fa4"], bar: [176, 140], barC: [258, 58], tender: 2, n: 9, plank: true, bar_: true },
  house: { sign: "HALCYON ROOM", wallTop: "#120a30", wallBot: "#4a1a58", floorTop: "#3a1c54", floorBot: "#1a0c2c", accent: "#ff3fa4", accent2: "#62e6ff", rim: "#ff6cbb", glow: "#ff3fa4", beams: ["#ff3fa4", "#62e6ff", "#c8b0ff"], bar: [4, 100], barC: [4, 60], tender: 1, n: 22, checker: ["#5a2c80", "#25103e"] },
  techno: { sign: "HALLE NEUN", wallTop: "#05060e", wallBot: "#18203a", floorTop: "#18203a", floorBot: "#080a14", accent: "#62e6ff", accent2: "#c8e8ff", rim: "#62e6ff", glow: "#39a0ff", beams: ["#62e6ff", "#c8e8ff", "#7a8cff"], bar: [4, 76], barC: [4, 60], tender: 1, n: 22, dark: true },
  festival: { sign: "HARBOR LIGHTS", wallTop: "#080c2a", wallBot: "#a8486a", floorTop: "#2e2440", floorBot: "#120c1c", accent: "#ffc44d", accent2: "#ff3fa4", rim: "#ffa070", glow: "#ffb04a", beams: ["#ffc44d", "#ff3fa4", "#62e6ff", "#9be15d"], bar: [232, 84], barC: [258, 58], tender: 2, n: 28, sky: true },
  loft: { sign: "MESEROLE", wallTop: "#2a1020", wallBot: "#6a2a2a", floorTop: "#523022", floorBot: "#20120f", accent: "#ffb04a", accent2: "#9be15d", rim: "#ffb04a", glow: "#ffa040", beams: ["#ffb04a", "#ff7a5a"], bar: [4, 120], barC: [4, 60], tender: 1, n: 16, brick: true, plank: true }
};
K.THEMES = THEMES;
const DARKS = ["#17131f", "#2a2836", "#0f0d18", "#3a2a4a", "#1c2a3a", "#2a1a2a"];

/* ---- static painters ---- */
const HZ = 58, HZC = 72; // wall/floor line in booth view / club view
function paintFloorPersp(c, W, H, T, hz) {
  K.vgrad(c, 0, hz, W, H - hz, T.floorTop, T.floorBot, 8);
  const vx = W / 2;
  if (T.checker) {
    c.fillStyle = T.checker[1]; c.fillRect(0, hz, W, H - hz);
    const rows = 9, sp = (H - hz) * 1.35;
    for (let r = 0; r < rows; r++) {
      const y0 = hz + Math.pow(r / rows, 1.7) * sp, y1 = hz + Math.pow((r + 1) / rows, 1.7) * sp;
      const cell = y => 12 + (y - hz) * 0.8;
      for (let ci = -14; ci < 14; ci++) {
        if (((r + ci) & 1) !== 0) continue;
        const x00 = vx + ci * cell(y0), x01 = vx + (ci + 1) * cell(y0), x10 = vx + ci * cell(y1), x11 = vx + (ci + 1) * cell(y1);
        poly(c, [[x00, y0], [x01, y0], [x11, y1], [x10, y1]], K.dpat(T.checker[0], 5 + Math.min(7, r)));
      }
    }
  } else if (T.plank) {
    for (let i = -14; i <= 14; i++) line(c, vx + i * 9, hz, vx + i * 46, H, mix(T.floorTop, "#000000", 0.4));
    for (let k = 1; k < 9; k++) R(c, 0, hz + Math.pow(k / 9, 1.6) * (H - hz), W, 1, mix(T.floorTop, "#000000", 0.3));
    c.fillStyle = K.dpat(mix(T.floorTop, "#ffffff", 0.25), 3); c.fillRect(0, hz + 1, W, 3);
  } else {
    for (let k = 1; k < 8; k++) { c.fillStyle = K.dpat(mix(T.floorTop, "#ffffff", 0.2), 5); c.fillRect(0, Math.round(hz + Math.pow(k / 8, 1.6) * (H - hz)), W, 1); }
    for (let i = -10; i <= 10; i++) line(c, vx + i * 14, hz, vx + i * 60, H, mix(T.floorTop, "#000000", 0.45));
  }
}
function paintBricks(c, W, h, base, rnd) {
  const rp = U.ramp(base);
  R(c, 0, 0, W, h, rp[1]);
  for (let y = 0, r = 0; y < h; y += 6, r++) {
    for (let x = -((r % 2) * 8); x < W; x += 16) {
      const col = rnd() < 0.5 ? rp[2] : rnd() < 0.5 ? rp[1] : rp[3];
      R(c, x + 1, y + 1, 14, 4, col); R(c, x + 1, y + 1, 14, 1, rp[3]);
      if (rnd() < 0.25) R(c, x + 3 + Math.floor(rnd() * 8), y + 2, 2, 1, rp[4]);
    }
  }
  c.fillStyle = K.dpat("#000000", 6); c.fillRect(0, 0, W, h);
}
function bottle(c, x, y, col, h) { R(c, x, y - h, 3, h, mix(col, "#000000", 0.25)); R(c, x + 1, y - h, 1, h, col); R(c, x + 1, y - h - 2, 1, 2, mix(col, "#000000", 0.4)); R(c, x, y - h + 1, 1, 2, "#ffffff"); }
function neon(c, s, cx, y, col, sc) {
  const w = txtW(s, sc), h = 5 * sc;
  K.glow(c, cx, y + h / 2, w / 2 + 12, h + 7, col, 2);
  K.glow(c, cx, y + h / 2, w / 2 + 6, h + 3, col, 4);
  R(c, cx - w / 2 - 4, y - 3, w + 8, h + 6, "#0a0612");
  R(c, cx - w / 2 - 4, y - 3, w + 8, 1, mix(col, "#000000", 0.35)); R(c, cx - w / 2 - 4, y + h + 2, w + 8, 1, mix(col, "#000000", 0.35));
  R(c, cx - w / 2 - 4, y - 3, 1, h + 6, mix(col, "#000000", 0.35)); R(c, cx + w / 2 + 3, y - 3, 1, h + 6, mix(col, "#000000", 0.35));
  txt(c, s, Math.round(cx - w / 2), y, mix(col, "#ffffff", 0.55), sc);
}
function speakerStack(c, x, y, w, h) {
  R(c, x, y, w, h, "#0a0710"); R(c, x, y, w, 1, "#2a2438"); R(c, x, y, 1, h, "#1a1626"); R(c, x + w - 1, y, 1, h, "#05030a");
  const rows = Math.floor(h / 24);
  for (let r = 0; r < rows; r++) {
    const cy = y + 12 + r * 24, cx = x + Math.floor(w / 2);
    ell(c, cx, cy, Math.floor(w / 2) - 3, 9, "#17131f"); ell(c, cx, cy, Math.floor(w / 2) - 6, 6, "#241f33"); ell(c, cx, cy, 3, 2, "#3a3452"); R(c, cx - 4, cy - 8, 3, 1, "#3a3452");
  }
}
function decorWall(c, W, T, club, rnd, venue) {
  const sign = venue || T.sign, hz = club ? HZC : HZ;
  if (T.brick) paintBricks(c, W, hz, "#8a3a2a", rnd);
  else K.vgrad(c, 0, 0, W, hz, T.wallTop, T.wallBot, 10);
  if (T.sky) { // open-air waterfront
    K.vgrad(c, 0, 0, W, hz, "#080c2a", "#d0587a", 12);
    for (let i = 0; i < 46; i++) { const x = Math.floor(rnd() * W), y = Math.floor(rnd() * 30); R(c, x, y, 1, 1, rnd() < 0.3 ? "#ffffff" : "#a8b8ff"); }
    let x = 0;
    while (x < W) { const w = 10 + Math.floor(rnd() * 16), h = 12 + Math.floor(rnd() * 26); R(c, x, hz - 8 - h, w, h + 8, "#140a24"); R(c, x, hz - 8 - h, w, 1, "#2a1a44"); for (let k = 0; k < 7; k++) if (rnd() < 0.5) R(c, x + 2 + Math.floor(rnd() * (w - 4)), hz - 8 - h + 3 + Math.floor(rnd() * (h - 4)), 1, 1, rnd() < 0.5 ? "#ffc44d" : "#fff0b0"); x += w + Math.floor(rnd() * 3); }
    R(c, 0, hz - 8, W, 8, "#1a1040");
    for (let i = 0; i < 70; i++) R(c, Math.floor(rnd() * W), hz - 7 + Math.floor(rnd() * 7), 2 + Math.floor(rnd() * 4), 1, rnd() < 0.5 ? "#ffc44d" : "#ff7a9a");
    R(c, 270, 6, 2, 40, "#0c0618"); R(c, 238, 8, 56, 2, "#0c0618"); R(c, 292, 8, 1, 14, "#0c0618");
    R(c, 0, 0, W, 3, "#0c0818"); for (let x2 = 0; x2 < W; x2 += 8) R(c, x2, 3, 1, 2, "#0c0818");
    for (let i = 0; i < 14; i++) { const x2 = 12 + i * 23, y2 = 6 + Math.round(Math.sin(i * 0.9) * 2 + 4); K.glow(c, x2, y2 + 1, 4, 3, "#ffd27a", 4); R(c, x2, y2, 2, 2, "#fff0b0"); }
  }
  if (T.checker) { // LED stripes + disco ball (+ speakers in booth view)
    for (let i = 0; i < 16; i++) R(c, 8 + i * 20, 0, 2, hz - 2, K.dpat(i % 2 ? T.accent : T.accent2, 3));
    const bx = 160, by = club ? 12 : 20;
    R(c, bx - 1, 0, 2, by - 8, "#8a86a0");
    ell(c, bx, by, 10, 10, "#b8b0d0"); ell(c, bx, by, 10, 10, K.dpat("#ffffff", 4));
    for (let yy = -9; yy <= 9; yy += 3) for (let xx = -9; xx <= 9; xx += 3) if (xx * xx + yy * yy < 90 && ((xx + yy) / 3) % 2 === 0) R(c, bx + xx, by + yy, 2, 2, "#ffffff");
    R(c, bx - 6, by - 8, 6, 2, "#e8e0ff");
    if (!club) { speakerStack(c, 4, 18, 28, 40); speakerStack(c, 288, 18, 28, 40); }
  }
  if (T.dark) { // concrete, pipes, led bars
    for (let i = 0; i < 260; i++) R(c, Math.floor(rnd() * W), Math.floor(rnd() * hz), 1, 1, rnd() < 0.5 ? "#232c48" : "#0a0e1c");
    for (let k = 0; k < 3; k++) { const y = 4 + k * 7; R(c, 0, y, W, 5, "#2a3250"); R(c, 0, y, W, 1, "#56648a"); R(c, 0, y + 4, W, 1, "#0c101e"); for (let x = 12; x < W; x += 54) R(c, x, y - 1, 3, 7, "#1a2038"); }
    for (let x = 40; x < W; x += 80) { R(c, x, 24, 4, hz - 24, "#1c2440"); R(c, x, 24, 1, hz - 24, "#3a4670"); }
    if (!club) { for (let i = 0; i < 20; i++) { const x = 24 + i * 14, h = 4 + Math.floor(rnd() * 14); R(c, x, 46 - h, 8, h, K.dpat("#62e6ff", 5)); R(c, x, 46 - h, 8, 1, "#62e6ff"); } speakerStack(c, 296, 14, 22, 44); }
  }
  if (T.brick) { // arched windows + edison bulbs
    const wins = club ? [24, 62, 232, 270] : [118, 168, 218];
    for (const wx of wins) { R(c, wx, 12, 30, 40, "#0a0a22"); ell(c, wx + 15, 14, 15, 8, "#0a0a22"); K.vgrad(c, wx + 2, 14, 26, 36, "#1a2a6a", "#d0788a", 6); for (let k = 0; k < 14; k++) R(c, wx + 3 + Math.floor(rnd() * 24), 24 + Math.floor(rnd() * 24), 1, 1, rnd() < .5 ? "#ffd27a" : "#fff"); R(c, wx + 14, 8, 2, 44, "#2a1410"); R(c, wx, 30, 30, 2, "#2a1410"); R(c, wx - 1, 50, 32, 3, "#4a2a20"); }
    R(c, 0, 0, W, 4, "#2a1410"); for (let x = 0; x < W; x += 52) R(c, x, 0, 6, 10, "#2a1410");
    for (let i = 0; i < 9; i++) { const x = 20 + i * 34, y = 12 + ((i * 7) % 3) * 5; R(c, x, 4, 1, y - 4, "#17100c"); K.glow(c, x, y + 2, 7, 6, "#ffb04a", 5); R(c, x - 1, y, 3, 4, "#fff0b0"); }
  }
  if (T.bar_) { // Nowhere: plum wall, jukebox, flyers, bulbs
    for (let i = 0; i < 10; i++) R(c, 0, i * 6 + 3, W, 1, K.dpat("#000", 4));
    const jx = club ? 100 : 14;
    if (!club) {
      R(c, jx, 20, 34, 38, "#3a1a2a"); ell(c, jx + 17, 22, 17, 8, "#3a1a2a"); R(c, jx, 20, 34, 38, K.dpat("#000", 3));
      ell(c, jx + 17, 26, 12, 8, "#ffb04a"); ell(c, jx + 17, 26, 12, 8, K.dpat("#ff3fa4", 6)); R(c, jx + 5, 34, 24, 14, "#1a0c18"); for (let i = 0; i < 5; i++) R(c, jx + 7 + i * 4, 36, 2, 10, i % 2 ? "#ffd27a" : "#ff6cbb");
      R(c, jx, 20, 2, 38, "#ff3fa4"); R(c, jx + 32, 20, 2, 38, "#62e6ff");
      K.glow(c, jx + 17, 40, 26, 22, "#ffb04a", 2);
      R(c, 62, 18, 20, 26, "#efe6d0"); R(c, 64, 21, 16, 8, "#c0302c"); txt(c, "LIVE", 66, 33, "#17131f"); txt(c, "SAT", 66, 39, "#17131f"); R(c, 86, 24, 16, 20, "#ffd23f"); R(c, 88, 27, 12, 2, "#17131f"); R(c, 88, 32, 12, 8, "#17131f");
    }
    for (const bx of (club ? [30, 70, 252, 296] : [58, 108])) { R(c, bx, 0, 1, 10, "#17100c"); K.glow(c, bx, 14, 9, 8, "#ffb04a", 5); R(c, bx - 1, 10, 3, 4, "#fff0b0"); }
  }
  if (!club) neon(c, sign, T.checker || T.dark ? 160 : T.brick ? 60 : T.sky ? 160 : 118, T.checker ? 34 : T.sky ? 14 : 10, T.accent, 2);
}
function paintBar(c, bar, T, rnd) {
  const [bx, bw] = bar;
  R(c, bx, 12, bw, 28, "#120a18"); R(c, bx, 12, bw, 1, "#3a2a48");
  K.glow(c, bx + bw / 2, 26, bw / 2, 16, T.accent, 3);
  for (const sy of [22, 34]) { R(c, bx + 2, sy, bw - 4, 2, "#5a3a2a"); R(c, bx + 2, sy, bw - 4, 1, "#8a5a3a"); for (let x = bx + 5; x < bx + bw - 6; x += 5 + Math.floor(rnd() * 3)) bottle(c, x, sy, ["#9be15d", "#ffc44d", "#ff7a5a", "#62e6ff", "#c8b0ff", "#e8e0d0"][Math.floor(rnd() * 6)], 6 + Math.floor(rnd() * 6)); }
  R(c, bx - 2, 10, bw + 4, 3, "#2a1a22"); R(c, bx - 2, 10, bw + 4, 1, "#6a4a3a");
  if (T.sky) for (let i = 0; i < bw + 4; i += 6) R(c, bx - 2 + i, 4, 6, 6, (i / 6) % 2 ? "#efe6d0" : "#c0302c");
}
function paintBarFront(c, bar, T, hz) {
  const [bx, bw] = bar, y0 = 40;
  R(c, bx - 2, y0, bw + 4, hz - y0 + 3, "#2a1620"); R(c, bx - 2, y0, bw + 4, 3, "#8a5a3a"); R(c, bx - 2, y0, bw + 4, 1, "#c8925a"); R(c, bx - 2, y0 + 3, bw + 4, 1, "#4a2a22");
  for (let x = bx; x < bx + bw; x += 8) R(c, x, y0 + 5, 7, hz - y0 - 4, (x / 8) % 2 ? "#3a1c28" : "#34182a");
  R(c, bx - 2, hz + 1, bw + 4, 2, "#0a0510");
  for (let x = bx + 10; x < bx + bw - 10; x += 22) { R(c, x, y0 - 4, 3, 4, "#c8dcf0"); R(c, x, y0 - 4, 1, 4, "#ffffff"); }
  c.fillStyle = K.dpat(T.glow, 4); c.fillRect(bx - 2, y0 - 1, bw + 4, 1);
}
/* club view: stage backdrop + platform (static part) */
const STG = { x: 92, w: 136, top: 52, feet: 64 };
function paintClubStage(c, W, T) {
  const { x, w, top } = STG;
  R(c, x + 6, 3, w - 12, 44, "#05030a"); R(c, x + 6, 3, w - 12, 1, "#3a3060"); R(c, x + 6, 46, w - 12, 1, "#3a3060"); R(c, x + 6, 3, 1, 44, "#2a2448"); R(c, x + w - 7, 3, 1, 44, "#2a2448");
  for (let i = 0; i < 6; i++) { const lx = x + 12 + i * 22; R(c, lx, 0, 4, 3, "#17122a"); K.glow(c, lx + 2, 5, 4, 3, T.beams[i % T.beams.length], 5); }
  R(c, x - 6, top - 6, w + 12, 3, "#0a0510"); R(c, x - 6, top - 5, w + 12, 18, "#17102a"); R(c, x - 6, top - 5, w + 12, 1, mix(T.accent, "#ffffff", 0.25));
  for (let xx = x - 2; xx < x + w + 6; xx += 8) R(c, xx, top + 6, 4, 1, K.dpat(T.accent2, 8));
  R(c, x - 6, top + 12, w + 12, 1, "#05030a");
  speakerStack(c, x - 28, 18, 22, 48); speakerStack(c, x + w + 6, 18, 22, 48);
}
function paintClubTable(c, T, sign) {
  const { x, w, top } = STG;
  R(c, x + 8, top, w - 16, 13, "#0e0a1a"); R(c, x + 8, top, w - 16, 1, "#5a4e88"); R(c, x + 8, top + 12, w - 16, 1, "#05030a");
  for (const dx of [x + 30, x + w - 30]) { ell(c, dx, top + 1, 12, 2, "#1a1626"); ell(c, dx, top, 9, 1, "#2a2438"); R(c, dx - 1, top - 1, 2, 1, T.accent); }
  R(c, 154, top - 1, 12, 3, "#241f33"); R(c, 156, top - 1, 2, 1, "#ff3fa4"); R(c, 160, top - 1, 2, 1, "#9be15d");
  for (let xx = x + 14; xx < x + w - 14; xx += 4) R(c, xx, top + 5, 2, 6, K.dpat(T.accent, 5));
  R(c, 160 - txtW(sign, 1) / 2 - 3, top + 4, txtW(sign, 1) + 6, 8, "#0e0a1a"); txtC(c, sign, 160, top + 6, mix(T.accent2, "#ffffff", 0.5), 1);
}

/* ======================================================================
   Floor: the pixel crowd
   ====================================================================== */
K.Floor = function (opts) {
  const o = Object.assign({ W: 320, H: 144, view: "booth", theme: "house", seed: 1, n: null, venue: null, reduced: K.reduced(), tenders: null }, opts);
  const T = THEMES[o.theme] || THEMES.house;
  const W = o.W, H = o.H, club = o.view === "club", hz = club ? HZC : HZ, bar = club ? T.barC : T.bar;
  const cv = U.mk(W, H), c = cv.getContext("2d");
  const rnd = mulberry(Math.floor(o.seed * 7919 + 13));
  const N = o.n || T.n;
  const F = { canvas: cv, ctx: c, W, H, E: 1, Es: 1, bpm: 120, lights: 0, bartDance: false, stage: null, T, people: [], pops: [], emotes: [], t: 0, last: null, reducedMotion: o.reduced };

  /* ---- static layers ---- */
  const bg = U.mk(W, H), bc = bg.getContext("2d"), barFront = U.mk(W, H), bfc = barFront.getContext("2d");
  const venue = o.venue ? String(o.venue).toUpperCase() : null;
  paintFloorPersp(bc, W, H, T, hz);
  const wall = U.mk(W, H), wc = wall.getContext("2d");
  decorWall(wc, W, T, club, mulberry(Math.floor(o.seed) + 5), venue);
  paintBar(wc, bar, T, mulberry(Math.floor(o.seed) + 11));
  if (club) paintClubStage(wc, W, T);
  bc.drawImage(wall, 0, 0, W, hz, 0, 0, W, hz);
  R(bc, 0, hz - 1, W, 1, "#05030a"); R(bc, 0, hz, W, 1, K.dpat("#ffffff", 3));
  paintBarFront(bfc, bar, T, hz);
  if (club && !venue === false) { /* custom venue names appear on the screen header (dynamic) */ }
  for (let i = 0; i < 4; i++) { bc.fillStyle = K.dpat("#05030a", 6 - i * 1.6); bc.fillRect(0, 0, 6 + i * 2, H); bc.fillRect(W - 6 - i * 2, 0, 6 + i * 2, H); }
  F.sign = venue || T.sign;

  /* ---- people ---- */
  const mkDef = (seed, tender) => {
    const d = RP.chars.random(seed);
    d.id = "sk" + (tender ? "b" : "p") + (T.dark ? "d" : "n") + seed; // modified defs get their own sprite-cache key
    if (T.dark && !tender) { d.top.color = DARKS[seed % DARKS.length]; d.top.color2 = DARKS[(seed + 2) % DARKS.length]; }
    if (tender) { d.name = "bartender"; d.top = { style: "tee", color: "#17131f", color2: "#17131f", print: null }; d.acc = (d.acc || []).filter(a => a !== "cap" && a !== "beanie" && a !== "bucket").concat(["apron"]); if (d.hair.style === "bald") d.hair = { style: "short", color: "#2a1a14" }; }
    return d;
  };
  const rows = club ? [[110, .5], [124, .62], [140, .76], [160, .92]] : [[94, .5], [106, .58], [118, .68], [133, .8]];
  const spots = [];
  {
    const tot = N + 2, wts = rows.map((r, i) => i + 2), sw = wts.reduce((a, b) => a + b, 0);
    rows.forEach((r, i) => {
      const cnt = Math.max(1, Math.round(tot * wts[i] / sw)), span = W - 60;
      for (let k = 0; k < cnt; k++) spots.push({ x: 30 + (k + 0.5 + (i % 2 ? 0.25 : -0.1)) * span / cnt + (rnd() - 0.5) * 8, y: r[0] + Math.round((rnd() - 0.5) * 4), sc: r[1] });
    });
    spots.sort((a, b) => (Math.abs(a.x - W / 2) * 0.7 + Math.abs(a.y - 118) * 1.2) - (Math.abs(b.x - W / 2) * 0.7 + Math.abs(b.y - 118) * 1.2));
  }
  const nt = o.tenders == null ? T.tender : o.tenders;
  const tendX = []; for (let i = 0; i < nt; i++) tendX.push(bar[0] + bar[1] * ((i + 0.5) / nt));
  const order = K.shuffle([...Array(N).keys()], rnd);
  for (let i = 0; i < N; i++) {
    const id = order[i];
    const th = 0.05 + 0.82 * Math.pow(i / Math.max(1, N - 1), 0.85);
    const sp = spots[Math.min(i, spots.length - 1)];
    const nearBar = !club && (o.theme === "empty-bar" ? rnd() < 0.72 : rnd() < 0.3);
    let hx, hy;
    if (nearBar) { for (let tries = 0; tries < 8; tries++) { hx = bar[0] + 8 + rnd() * (bar[1] - 16); if (tendX.every(x => Math.abs(x - hx) > 17)) break; } hy = hz + 5 + rnd() * 9; }
    else { const left = rnd() < 0.5; hx = left ? 8 + rnd() * 34 : W - 8 - rnd() * 34; hy = club ? 108 + rnd() * 40 : 84 + rnd() * 40; }
    const p = { def: mkDef(hashStr("p" + o.seed + ":" + id) % 100000), th, ph: rnd() < 0.7 ? 0 : 1 + Math.floor(rnd() * 3), hx, hy, fx: sp.x, fy: sp.y, sc: sp.sc, x: hx, y: hy, moving: false, bounce: rnd() * 6, lx: 0, side: 1 };
    p.lx = clamp((W / 2 - p.fx) / 190, -0.8, 0.8); p.side = p.fx < W / 2 ? -1 : 1;
    p.hsc = nearBar ? 0.5 : clamp(0.46 + (hy - 80) * 0.006, 0.46, 0.9); p.scNow = p.hsc;
    F.people.push(p);
  }
  const tenders = [];
  for (let i = 0; i < nt; i++) tenders.push({ def: mkDef(hashStr("b" + o.seed + ":" + i) % 100000, true), x: tendX[i], y: hz + 3, ph: i, lx: 0.3 });
  F.tenders = tenders;

  /* ---- public controls ---- */
  F.setEnergy = e => { F.E = clamp(e, 0, 5); };
  F.snap = e => { F.E = F.Es = clamp(e, 0, 5); F.people.forEach(p => { const d = F.Es / 5 >= p.th; p.x = d ? p.fx : p.hx; p.y = d ? p.fy : p.hy; p.scNow = d ? p.sc : p.hsc; }); };
  F.setBpm = b => { F.bpm = b || 120; };
  F.dancing = () => F.people.filter(p => F.Es / 5 >= p.th).length;
  F.pop = (text, color, x, y) => { F.pops.push({ text, color: color || "#ffffff", x: x == null ? W / 2 : x, y: y == null ? 36 : y, age: 0 }); if (F.pops.length > 3) F.pops.shift(); };
  F.emote = (kind, count) => {
    const ds = F.people.filter(p => F.Es / 5 >= p.th), src = ds.length ? ds : F.people;
    for (let i = 0; i < (count || 4); i++) { const p = src[Math.floor(rnd() * src.length)]; if (p) F.emotes.push({ kind, x: p.x + (rnd() - 0.5) * 6, y: p.y - 80 * p.scNow, age: -rnd() * 0.5, vx: (rnd() - 0.5) * 8 }); }
    if (F.emotes.length > 24) F.emotes.splice(0, F.emotes.length - 24);
  };
  F.snap(1);

  /* ---- per-frame ---- */
  F.draw = function (t) {
    const dt = F.last == null ? 0 : clamp(t - F.last, 0, 0.1); F.last = t; F.t = t;
    F.Es += (F.E - F.Es) * (1 - Math.exp(-dt * 1.6));
    const Es = F.Es, e5 = Es / 5, beat = (t * F.bpm / 60) % 1, pulse = o.reduced ? 0.4 : Math.max(0, 1 - beat * 3.2);
    c.drawImage(bg, 0, 0);
    // floor glow
    const gy = club ? 120 : 108;
    K.glow(c, W / 2, gy, 140, 26, T.glow, 1 + e5 * 3 + pulse);
    K.glow(c, W / 2, gy, 84, 14, T.beams[0], 1 + e5 * 3.5 + pulse * 1.5);
    // beams
    const nb = club ? 4 : 3;
    for (let i = 0; i < nb; i++) {
      const ox = club ? 106 + i * 36 : 50 + i * 110, y0 = club ? 6 : 0, yE = club ? 104 : 112;
      const sw = o.reduced ? 0 : Math.sin(t * (0.5 + i * 0.17) + i * 2) * 34, tx = ox + (i - (nb - 1) / 2) * (club ? 30 : 22) + sw, col = T.beams[i % T.beams.length], wd = 14 + e5 * 14;
      poly(c, [[ox - 2, y0], [ox + 2, y0], [tx + wd, yE], [tx - wd, yE]], K.dpat(col, 1 + Math.round(e5 * 2)));
      poly(c, [[ox - 1, y0], [ox + 1, y0], [tx + wd * 0.45, yE], [tx - wd * 0.45, yE]], K.dpat(col, 1 + Math.round(e5 * 2.4)));
      K.glow(c, tx, yE, 20 + e5 * 6, 4 + e5 * 2, col, 3 + Math.round(e5 * 4));
    }
    if (T.dark && !o.reduced && Es > 3.6 && ((t * 7) | 0) % 8 === 0) { c.fillStyle = K.dpat("#ffffff", 3); c.fillRect(0, 0, W, hz); }
    // club stage
    if (club) {
      const { x, w, top } = STG;
      for (let i = 0; i < 16; i++) {
        const bx = x + 10 + i * 7, hh = Math.max(1, Math.round((o.reduced ? 0.55 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 6 + i * 1.3) * Math.cos(t * 2.3 + i))) * (3 + Es * 6)));
        R(c, bx, 44 - hh, 5, hh, K.dpat(T.accent, 8)); R(c, bx, 44 - hh, 5, 1, mix(T.accent, "#ffffff", 0.4));
      }
      const stg = F.stage || [{ id: "kid", x: 160, act: "dj" }];
      stg.forEach(d => {
        if (!d.id) return;
        const def = RP.chars.get(d.id) || RP.chars.random(hashStr(d.id) % 9999);
        RP.chars.draw(c, { def, x: d.x, y: STG.feet, face: "front", act: d.act || "dj", frame: (d.act === "stand" || d.act === "talk") ? 0 : (((t * F.bpm / 60) | 0) % 2), scale: 0.6 }, { lx: 0, rim: { color: T.accent, side: d.x < 160 ? -1 : 1 }, shadow: 0 });
      });
      paintClubTable(c, T, F.sign);
      K.glow(c, 160, top + 2, 56, 3, T.accent, 2 + Math.round(pulse * 3));
    }
    // bartenders
    for (const b of tenders) {
      const bt = (t * F.bpm / 60 * 2 + b.ph) | 0;
      RP.chars.draw(c, { def: b.def, x: b.x, y: b.y, face: "front", act: F.bartDance ? "dance" : "stand", frame: F.bartDance ? [0, 2, 0, 3][bt % 4] : 0, scale: club ? 0.42 : 0.6 }, { lx: b.lx, rim: { color: T.accent, side: 1 }, shadow: 0 });
    }
    if (!F.bartDance && Es < 2.6 && tenders.length && !club) { const b = tenders[0], zy = b.y - 56 + Math.round(Math.sin(t * 2) * 1.5); glyph(c, GLYPHS.zzz, Math.round(b.x) + 7, zy, "#0a0410"); glyph(c, GLYPHS.zzz, Math.round(b.x) + 6, zy - 1, "#c8b0ff"); }
    c.drawImage(barFront, 0, 0);
    // crowd
    const tier = Es < 2.2 ? 0 : Es < 3.6 ? 1 : 2;
    for (const p of F.people) {
      const dance = e5 >= p.th;
      const tx = dance ? p.fx : p.hx, ty = dance ? p.fy : p.hy, tsc = dance ? p.sc : p.hsc;
      const dx = tx - p.x, dy = ty - p.y;
      p.moving = Math.abs(dx) > 0.6 || Math.abs(dy) > 0.6;
      if (p.moving) { const dl = Math.hypot(dx, dy) || 1, s = Math.min(26 * dt, dl); p.x += dx / dl * s; p.y += dy / dl * s; p.scNow += (tsc - p.scNow) * Math.min(1, dt * 3); }
      else { p.x = tx; p.y = ty; p.scNow = tsc; }
      p.dance = dance;
    }
    F.people.slice().sort((a, b) => a.y - b.y).forEach(p => {
      let act = "stand", frame = 0, yo = 0;
      if (p.moving) { act = "walk"; frame = ((t * 7 + p.bounce) | 0) % 4; }
      else if (p.dance) {
        act = "dance"; const k = (((t * F.bpm / 60) * 2 + p.ph) | 0) % 4;
        frame = tier === 0 ? [1, 1, 3, 1][k] : tier === 1 ? [1, 2, 1, 3][k] : [0, 2, 0, 3][k];
        if (tier === 2 && !o.reduced && k === 0) yo = -1 - (Es > 4.3 ? 1 : 0);
      }
      RP.chars.draw(c, { def: p.def, x: p.x, y: p.y + yo, face: club ? "back" : "front", act, frame, scale: Math.round(p.scNow * 20) / 20 }, { lx: p.lx, rim: { color: T.rim, side: p.side }, shadow: 0.3 });
    });
    if (!club) drawBooth(c, t, pulse, F);
    if (F.lights > 0.01) { c.fillStyle = K.dpat("#fff2d0", Math.round(F.lights * 11)); c.fillRect(0, 0, W, H); }
    // emotes + pops
    for (let i = F.emotes.length - 1; i >= 0; i--) {
      const m = F.emotes[i]; m.age += dt; if (m.age < 0) continue; m.y -= dt * 14; m.x += m.vx * dt;
      if (m.age > 1.6) { F.emotes.splice(i, 1); continue; }
      const g = GLYPHS[m.kind], col = m.kind === "heart" ? "#ff6cbb" : m.kind === "note" ? "#9be15d" : m.kind === "star" ? "#ffd23f" : "#c8b0ff";
      if (g) { glyph(c, g, Math.round(m.x) + 1, Math.round(m.y) + 1, "#0a0410"); glyph(c, g, Math.round(m.x), Math.round(m.y), col); }
      else if (m.kind === "?" || m.kind === "!") K.otxt(c, m.kind, Math.round(m.x), Math.round(m.y), m.kind === "!" ? "#ff5a5a" : "#ffd23f", 1);
    }
    for (let i = F.pops.length - 1; i >= 0; i--) {
      const m = F.pops[i]; m.age += dt;
      if (m.age > 1.9) { F.pops.splice(i, 1); continue; }
      if (m.age < 1.4 || ((m.age * 10) | 0) % 2 === 0) K.otxtC(c, m.text, m.x, Math.round(m.y - Math.min(m.age, 1) * 8), m.color, 2);
    }
    return F;
  };
  return F;
};

/* DJ-booth foreground: our decks and mixer */
function drawBooth(c, t, pulse, F) {
  const W = F.W, H = F.H, T = F.T, y0 = 120;
  K.vgrad(c, 0, y0, W, H - y0, "#241a38", "#0c0818", 5);
  R(c, 0, y0 - 1, W, 1, "#05030a"); R(c, 0, y0, W, 1, "#6a5a98"); R(c, 0, y0 + 1, W, 1, "#3a3060");
  c.fillStyle = K.dpat(T.glow, 3); c.fillRect(0, y0 + 2, W, 1);
  const spin = F.reducedMotion ? 0.6 : t * (F.bpm / 60) * Math.PI * 2 * 0.55 / 1.8;
  for (const [cx, dir] of [[70, 1], [250, -1]]) {
    R(c, cx - 36, y0 + 4, 72, 17, "#17122a"); R(c, cx - 36, y0 + 4, 72, 1, "#4a3e78"); R(c, cx - 36, y0 + 20, 72, 1, "#05030a");
    ell(c, cx, y0 + 12, 29, 8, "#05030a"); ell(c, cx, y0 + 11, 28, 7, "#120e1c");
    for (let r = 6; r < 26; r += 4) ell(c, cx, y0 + 11, r, Math.round(r * 0.26), K.dpat("#3a3458", 4));
    ell(c, cx, y0 + 11, 11, 3, T.accent); ell(c, cx, y0 + 11, 11, 3, K.dpat("#ffffff", 3)); ell(c, cx, y0 + 11, 2, 1, "#05030a");
    const a = spin * dir;
    R(c, cx + Math.cos(a) * 23, y0 + 11 + Math.sin(a) * 6, 2, 1, "#ffffff"); R(c, cx + Math.cos(a + 3.14) * 9, y0 + 11 + Math.sin(a + 3.14) * 2.5, 2, 1, "#ffffff");
    line(c, cx + dir * 32, y0 + 6, cx + dir * 14, y0 + 13, "#c8c4d8"); R(c, cx + dir * 32 - 1, y0 + 5, 3, 3, "#8a86a0");
    R(c, cx - dir * 32, y0 + 17, 4, 2, "#ff3fa4");
  }
  R(c, 118, y0 + 3, 84, 18, "#1a1530"); R(c, 118, y0 + 3, 84, 1, "#5a4e88"); R(c, 118, y0 + 20, 84, 1, "#05030a");
  for (let i = 0; i < 4; i++) { const kx = 126 + i * 10; R(c, kx, y0 + 6, 5, 5, "#0a0710"); R(c, kx + 2, y0 + 6, 1, 3, "#ffffff"); }
  for (let i = 0; i < 4; i++) { const kx = 168 + i * 8; R(c, kx, y0 + 6, 4, 4, "#0a0710"); R(c, kx + 1, y0 + 6, 1, 2, "#c8c4d8"); }
  const lv = 1 + Math.round(F.Es + pulse * 1.5);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 6; j++) R(c, 124 + i * 66 + (i ? 12 : 0), y0 + 19 - j * 2 - 1, 3, 1, j < lv ? (j > 4 ? "#ff3a3a" : j > 3 ? "#ffc44d" : "#3fd07a") : "#2a2250");
  R(c, 146, y0 + 14, 28, 3, "#05030a"); R(c, 158 + (F.reducedMotion ? 0 : Math.round(Math.sin(t * 0.7) * 6)), y0 + 13, 4, 5, "#c8c4d8");
  R(c, 4, y0 + 20, 20, 3, "#4a3220"); for (let i = 0; i < 4; i++) R(c, 5 + i * 5, y0 + 15, 4, 6, ["#ff3fa4", "#ffc44d", "#62e6ff", "#efe6d0"][i]);
  ell(c, 292, y0 + 19, 7, 2, "#0a0710"); R(c, 286, y0 + 14, 12, 2, "#2a2438");
}

})();
