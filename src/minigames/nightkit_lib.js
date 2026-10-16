/* nightkit — small shared toolbox for the "night shift" mini-games:
   sound.Check, after.Party and last.Train.
   Everything lives on RP.nightkit and is only touched from inside play(), so the file
   load order does not matter. No state of its own beyond the injected <style> tags. */
(function () {
"use strict";
const RP = window.RP;
const { R, P, line, txt, txtC, bayer, ramp, el, clamp } = RP.u;
const NK = RP.nightkit = {};

/* ---------- environment ---------- */
NK.reduced = () => { try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; } };
NK.css = (id, text) => {
  try {
    if (document.getElementById(id)) return;
    const s = document.createElement("style"); s.id = id; s.textContent = text; document.head.appendChild(s);
  } catch (e) { /* ignore */ }
};
NK.pick = (a, rnd) => a[Math.floor((rnd || Math.random)() * a.length)];
NK.shuffle = (a, rnd) => { const r = rnd || Math.random, b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* landscape phones: short viewport, so the games switch to a compact side-by-side layout */
NK.CSS_COMPACT = `
.nk-compact { gap: 4px !important; }
.nk-compact .mg-head { gap: 6px; align-items: baseline; flex-wrap: nowrap; justify-content: space-between; }
.nk-compact .mg-logo { font-size: 14px; } .nk-compact .mg-sub { font-size: 15px; }
.nk-compact .mg-msg { font-size: 17px; } .nk-compact .mg-say { font-size: 15px; }
.nk-compact .btn { font-size: 18px; padding: 3px 12px; }
.nk-compact .nk-end { gap: 4px; padding: 8px 10px; } .nk-compact .nk-end h2 { font-size: 14px; } .nk-compact .nk-end .nk-kick { font-size: 15px; }
.nk-compact .nk-end .nk-stamp { width: 144px; height: 60px; } .nk-compact .nk-end .nk-score { display: none; }
.nk-compact .nk-end .nk-blurb { font-size: 16px; line-height: 1.05; } .nk-compact .nk-end ul { column-count: 2; column-gap: 14px; width: 100%; } .nk-compact .nk-end li { font-size: 15px; break-inside: avoid; }
`;
NK.isCompact = () => { try { return window.innerHeight <= 460 && window.innerWidth >= 560; } catch (e) { return false; } };
NK.setCompact = (host, on) => {
  try { NK.css("nk-compact-css", NK.CSS_COMPACT); host.root.classList.toggle("nk-compact", !!on); host.ov.style.paddingTop = on ? "6px" : ""; host.ov.style.paddingBottom = on ? "6px" : ""; } catch (e) { /* ignore */ }
};

/* minutes after midnight (may exceed 1440) -> "4:07 AM" */
NK.clock = mins => {
  let m = Math.round(mins) % 1440; if (m < 0) m += 1440;
  const h24 = Math.floor(m / 60), mm = m % 60, h = h24 % 12 === 0 ? 12 : h24 % 12;
  return h + ":" + String(mm).padStart(2, "0") + " " + (h24 < 12 ? "AM" : "PM");
};
NK.mmss = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

/* ---------- canvases ---------- */
NK.canvas = (parent, w, h, cls) => {
  const cv = el("canvas", { cls: "px " + (cls || ""), width: w, height: h }, parent);
  const c = cv.getContext("2d"); c.imageSmoothingEnabled = false;
  return { cv, c };
};
NK.offscreen = (w, h) => { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const c = cv.getContext("2d"); c.imageSmoothingEnabled = false; return { cv, c }; };
/* size a logical-pixel canvas to its container: integer scale when it fits >= 2x, else fractional */
NK.fit = (cv, box, w, h, maxW) => {
  const bw = Math.max(200, Math.min(maxW || 99999, (box && box.clientWidth) || w));
  let sc = bw / w; if (sc >= 2) sc = Math.floor(sc);
  cv.style.width = Math.round(w * sc) + "px"; cv.style.height = Math.round(h * sc) + "px";
  return sc;
};
/* map a pointer event to logical canvas pixels */
NK.pt = (cv, e) => {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (cv.width / Math.max(1, r.width)), y: (e.clientY - r.top) * (cv.height / Math.max(1, r.height)) };
};
NK.onResize = (host, fn) => {
  try {
    let t = null;
    const h = () => { clearTimeout(t); t = setTimeout(() => { try { fn(); } catch (e) { /* ignore */ } }, 60); };
    window.addEventListener("resize", h);
    host.cleanup(() => { clearTimeout(t); window.removeEventListener("resize", h); });
  } catch (e) { /* ignore */ }
};

/* ---------- pixel helpers ---------- */
/* little bevelled slab: light top/left, deep bottom/right */
NK.bevel = (c, x, y, w, h, base, hi) => {
  const r = ramp(base);
  R(c, x, y, w, h, r[2]);
  R(c, x, y, w, 1, hi ? r[4] : r[3]); R(c, x, y, 1, h, r[3]);
  R(c, x, y + h - 1, w, 1, r[0]); R(c, x + w - 1, y, 1, h, r[1]);
};
/* vertical dithered gradient between evenly spaced colour stops */
NK.dgrad = (c, x, y, w, h, stops, ox) => {
  const n = stops.length;
  for (let j = 0; j < h; j++) {
    const t = n === 1 ? 0 : (j / Math.max(1, h - 1)) * (n - 1), i = Math.min(n - 2, Math.floor(t)), f = t - i;
    for (let i2 = 0; i2 < w; i2++) {
      const col = bayer(x + i2 + (ox || 0), y + j) / 16 >= f ? stops[i] : stops[Math.min(n - 1, i + 1)];
      c.fillStyle = col; c.fillRect(x + i2, y + j, 1, 1);
    }
  }
};
/* checker/bayer dark overlay: density 0..16 */
NK.dither = (c, x, y, w, h, col, density, ox) => {
  c.fillStyle = col;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (bayer(x + i + (ox || 0), y + j) < density) c.fillRect(x + i, y + j, 1, 1);
};
NK.speckle = (c, x, y, w, h, cols, rnd, amount) => {
  const n = Math.round(w * h * amount);
  for (let i = 0; i < n; i++) P(c, x + Math.floor(rnd() * w), y + Math.floor(rnd() * h), cols[Math.floor(rnd() * cols.length)]);
};
/* parabolic sag between two points -> array of [x,y] */
NK.sag = (x0, y0, x1, y1, sag, n) => {
  n = n || Math.max(10, Math.round(Math.hypot(x1 - x0, y1 - y0) / 3));
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + Math.sin(Math.PI * t) * sag]); }
  return pts;
};
NK.stroke = (c, pts, col, thick) => {
  for (let i = 0; i < pts.length - 1; i++) {
    line(c, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], col);
    if (thick > 1) line(c, pts[i][0], pts[i][1] + 1, pts[i + 1][0], pts[i + 1][1] + 1, col);
  }
};
NK.pathLen = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
/* point at distance d along a polyline */
NK.along = (pts, d) => {
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= seg || i === pts.length - 1) { const t = seg ? clamp(d / seg, 0, 1) : 0; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]; }
    d -= seg;
  }
  return pts[pts.length - 1];
};
/* soft light pool: concentric alpha bands with ordered dithering between them (no speckle) */
NK.glow = (c, cx, cy, r, col, strength) => {
  const bands = 4, st = strength == null ? 1 : strength;
  c.save(); c.fillStyle = col;
  let lastA = -1;
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    const d = Math.sqrt(x * x + y * y); if (d >= r) continue;
    const lv = (1 - d / r) * bands, k0 = Math.floor(lv), k = k0 + (bayer(cx + x, cy + y) / 16 < lv - k0 ? 1 : 0);
    if (k <= 0) continue;
    const a = Math.min(1, k / bands * 0.55 * st);
    if (a !== lastA) { c.globalAlpha = a; lastA = a; }
    c.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
  }
  c.restore();
};
NK.hashN = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; };

/* ---------- characters ---------- */
/* a head-and-shoulders canvas for any character def (cast id or an RP.chars.random definition) */
NK.portrait = (idOrDef, size) => {
  size = size || 28;
  const out = NK.offscreen(size, size);
  try {
    const d = typeof idOrDef === "string" ? RP.chars.get(idOrDef) : idOrDef;
    if (!d) return out;
    const sp = RP.chars.sprite(d, { view: "front", act: "stand", frame: 0 }, -0.5, null), m = RP.chars.metrics(d);
    const top = sp.ay + m.headCy - m.ry - 8;
    out.c.drawImage(sp.cv, sp.ax - size / 2, top, size, size, 0, 0, size, size);
  } catch (e) { /* ignore */ }
  return out;
};
NK.drawChar = (c, def, x, y, o) => {
  try { return RP.chars.draw(c, Object.assign({ def, x, y, face: "front", act: "stand" }, o || {}), { lx: -0.4, shadow: 0.5 }); } catch (e) { return null; }
};

/* ---------- end card ---------- */
NK.CSS_END = `
.nk-end { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; background: #120e24; border: 1px solid var(--line); border-radius: 4px; padding: 16px 14px 14px; }
.nk-end .nk-kick { font-size: 20px; letter-spacing: .12em; color: var(--muted); }
.nk-end h2 { font-family: var(--logo); font-weight: 400; font-size: clamp(16px, 4.4vw, 26px); margin: 0; line-height: 1.25; color: #fff; text-shadow: 0 3px 0 #2a0d3a; }
.nk-end h2.bad { color: #ff7a7a !important; } .nk-end h2.ok { color: var(--ok) !important; }
.nk-end .nk-stamp { image-rendering: pixelated; width: 192px; height: 80px; }
.nk-end .nk-score { font-family: var(--logo); font-size: clamp(22px, 6vw, 34px); color: var(--amber); }
.nk-end .nk-score small { font-size: .5em; color: var(--muted); }
.nk-end .nk-blurb { font-size: 21px; color: #e4ddff; max-width: 560px; line-height: 1.12; }
.nk-end ul { list-style: none; margin: 0; padding: 0; width: min(520px, 100%); display: flex; flex-direction: column; gap: 3px; text-align: left; }
.nk-end li { display: flex; gap: 8px; font-size: 19px; color: var(--muted); border-bottom: 1px dotted #2a2250; padding: 1px 0; }
.nk-end li b { font-weight: 400; color: var(--fg); margin-left: auto; text-align: right; }
.nk-end li.y { color: var(--fg); } .nk-end li.y b { color: var(--ok); } .nk-end li.n b { color: #ff7a7a; }
.nk-end li .l { flex: 1; min-width: 0; }
`;
NK.grade = score => score >= 90 ? "A+" : score >= 75 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D";
/* Replaces the game screen with a result card; resolves when the player presses CONTINUE.
   o = { kicker, title, ok, score, lines: [[label, value, "y"|"n"|""]], blurb, button } */
NK.endCard = (host, o) => new Promise(resolve => {
  NK.css("nk-end-css", NK.CSS_END);
  let done = false;
  const finish = () => { if (done) return; done = true; resolve(); };
  try {
    const root = host.root;
    [...root.children].forEach(ch => { ch.style.display = "none"; });
    const card = el("div", { cls: "nk-end" }, root);
    if (o.kicker) el("div", { cls: "nk-kick", text: o.kicker }, card);
    el("h2", { cls: o.ok ? "ok" : "bad", text: o.title || (o.ok ? "NICE." : "NOPE.") }, card);
    const st = NK.canvas(card, 96, 40, "nk-stamp");
    const c = st.c, col = o.ok ? "#9be15d" : "#ff5a7a", g = NK.grade(o.score || 0);
    R(c, 0, 0, 96, 40, "#0a0816");
    NK.dither(c, 0, 0, 96, 40, "#1d1440", 6);
    R(c, 2, 2, 92, 36, "#0a0816"); R(c, 2, 2, 92, 1, col); R(c, 2, 37, 92, 1, col); R(c, 2, 2, 1, 36, col); R(c, 93, 2, 1, 36, col);
    txtC(c, g, 21, g.length > 1 ? 11 : 9, col, g.length > 1 ? 4 : 5, 1);
    txt(c, o.ok ? "CLEAR" : "FAILED", 42, 9, col, 2, 1);
    txt(c, String(Math.round(o.score || 0)), 42, 23, "#efeaff", 2, 1); txt(c, "/100", 42 + String(Math.round(o.score || 0)).length * 7 + 3, 27, "#8c84b8", 1, 1);
    el("div", { cls: "nk-score", html: Math.round(o.score || 0) + "<small> / 100</small>" }, card);
    if (o.blurb) el("div", { cls: "nk-blurb", text: o.blurb }, card);
    if (o.lines && o.lines.length) {
      const ul = el("ul", {}, card);
      o.lines.forEach(l => { const li = el("li", { cls: l[2] || "" }, ul); el("span", { cls: "l", text: l[0] }, li); if (l[1] != null) el("b", { text: String(l[1]) }, li); });
    }
    const b = el("button", { cls: "btn primary", type: "button", text: o.button || "CONTINUE" }, card);
    b.addEventListener("click", finish);
    try { b.focus(); } catch (e) { /* ignore */ }
    host.onKey(e => { if ((e.key === "Escape") && o.escapes !== false) finish(); });
    try { root.closest(".overlay").scrollTop = 0; } catch (e) { /* ignore */ }
  } catch (e) { finish(); }
});
})();
