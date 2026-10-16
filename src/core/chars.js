/* re:parteé — parametric pixel characters with VGA-adventure shading.

   A character is a plain definition (skin, hair, clothes, build, accessories).
   Each frame is rasterized flat into a small buffer that remembers which body part
   owns every pixel, then a shading pass lights every part as a little cylinder from
   the room's key light (hue-shifted ramps, Bayer-dithered steps), adds contact
   occlusion under overhangs (chin, hem, fringe), a dark selective outline and an
   optional colored rim light from the room's neon. Cast shadows are projected
   from the silhouette. Results are cached per (character, pose, frame, facing, light). */
(function () {
"use strict";
const RP = window.RP;
const { bayer, mk, clamp, hex, toHex, ramp, mix, mulberry, hashStr } = RP.u;

/* ---------------- definitions ---------------- */
const DEFS = {};
const BUILDS = {
  thin:    { tw: 16, lw: 5, aw: 3, hx: 6, belly: 0 },
  average: { tw: 20, lw: 6, aw: 3, hx: 7, belly: 0 },
  stocky:  { tw: 24, lw: 7, aw: 4, hx: 7, belly: 2 },
  big:     { tw: 28, lw: 8, aw: 5, hx: 8, belly: 4 }
};
const SKINS = ["#f1c7a5", "#e8b48f", "#e0a27a", "#c98a62", "#b07650", "#8d5a3b", "#6e4329", "#57331f"];
const HAIRC = ["#1c1418", "#2e1d16", "#3a2014", "#5a3520", "#7a4a2a", "#a8743e", "#d8b070", "#e8e0d0", "#9a9aa6", "#c0302c", "#ff6cbb", "#5a8ad8"];

function define(id, def) {
  DEFS[id] = Object.assign({ id, name: id, height: 96, build: "average", skin: "#e0a27a",
    hair: { style: "short", color: "#3a2014" }, top: { style: "tee", color: "#3a3f58" },
    bottom: { style: "jeans", color: "#2f5a96" }, shoes: { style: "sneakers", color: "#efeaf6" },
    acc: [], facial: null, figure: null, voice: "#ffffff" }, def);
  invalidate(id);
  return DEFS[id];
}
function update(id, patch) { const d = DEFS[id]; if (!d) return; Object.assign(d, patch); invalidate(id); }
function get(id) { return DEFS[id]; }

/* random NYC-nightlife NPC (crowds, background people) */
function random(seed, opts = {}) {
  const r = mulberry(seed * 9301 + 49297);
  const pk = a => a[Math.floor(r() * a.length)];
  const fem = r() < 0.5;
  const tops = ["tee", "tee", "tank", "hoodie", "jacket", "shirt", "bomber", "mesh", "dress", "vest"];
  const topCols = ["#17131f", "#efeaf6", "#c0302c", "#2f62b8", "#3fa66a", "#ffd23f", "#ff3fa4", "#39d0ff", "#7a3fb0", "#e07a2a", "#2a2836", "#8a86a0", "#d8c0a0"];
  const hairStyles = fem ? ["long", "bob", "bun", "curly", "afro", "ponytail", "locs", "buzz", "messy"] : ["short", "buzz", "curly", "afro", "messy", "slick", "locs", "bald", "mohawk", "short"];
  const style = opts.top || pk(fem ? tops : tops.filter(t => t !== "dress"));
  const def = {
    id: "rnd" + seed, name: opts.name || "partygoer", height: Math.round((fem ? 88 : 92) + r() * 12),
    build: pk(["thin", "average", "average", "stocky", r() < 0.2 ? "big" : "average"]),
    skin: pk(SKINS), figure: fem ? "curvy" : null,
    hair: { style: pk(hairStyles), color: pk(HAIRC.slice(0, r() < 0.85 ? 8 : 12)) },
    top: { style, color: pk(topCols), color2: pk(topCols), print: r() < 0.3 ? pk(["stripe", "logo", "circle"]) : null },
    bottom: { style: style === "dress" ? "none" : pk(fem ? ["jeans", "skirt", "pants", "shorts", "jeans"] : ["jeans", "pants", "cargo", "track", "jeans", "shorts"]), color: pk(["#2f5a96", "#17131f", "#2a2836", "#5a4a3a", "#3a5a3a", "#8a86a0", "#21416f"]) },
    shoes: { style: pk(["sneakers", "sneakers", "boots", "shoes"]), color: pk(["#efeaf6", "#17131f", "#c0302c", "#5a3424", "#efeaf6"]) },
    acc: [], facial: !fem && r() < 0.35 ? pk(["mustache", "beard", "goatee", "stubble"]) : null, voice: "#ffffff"
  };
  if (r() < 0.25) def.acc.push(pk(["shades", "glasses"]));
  if (r() < 0.2) def.acc.push(pk(["cap", "beanie", "bucket"]));
  if (r() < 0.25) def.acc.push(pk(["chain", "earring", "bag", "headphones"]));
  return Object.assign(def, opts.override || {});
}

/* ---------------- raster buffer ---------------- */
const SW = 72;            // sprite width; anchor (feet center) at x = 36
function Buf(h) {
  this.w = SW; this.h = h + 30; this.ax = SW / 2; this.ay = this.h - 4;
  this.c = new Int16Array(this.w * this.h).fill(-1);
  this.p = new Uint8Array(this.w * this.h);
  this.u = new Uint8Array(this.w * this.h);   // shaded part underneath an overlay pixel
  this.pal = []; this.pi = new Map(); this.parts = [null]; this.clip = null;
}
Buf.prototype.part = function (name, o = {}) { this.parts.push({ name, shade: o.shade !== false, tex: o.tex || null, ao: o.ao !== false, overlay: !!o.overlay }); return this.parts.length - 1; };
Buf.prototype.col = function (h) { let i = this.pi.get(h); if (i === undefined) { i = this.pal.length; this.pal.push(h); this.pi.set(h, i); } return i; };
Buf.prototype.rect = function (pt, x, y, w, h, col) {
  const ci = col == null ? -1 : this.col(col);
  x = Math.round(x + this.ax); y = Math.round(y + this.ay); w = Math.round(w); h = Math.round(h);
  const ov = this.parts[pt] && this.parts[pt].overlay, clip = this.clip;
  for (let yy = Math.max(0, y); yy < Math.min(this.h, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(this.w, x + w); xx++) {
    if (clip && !clip(xx - this.ax, yy - this.ay)) continue;
    const o = yy * this.w + xx;
    const prev = this.p[o];
    this.c[o] = ci; this.p[o] = ci < 0 ? 0 : pt;
    this.u[o] = ci < 0 ? 0 : ov ? (this.parts[prev] && this.parts[prev].overlay ? this.u[o] : prev) : pt;
  }
};
Buf.prototype.px = function (pt, x, y, col) { this.rect(pt, x, y, 1, 1, col); };
Buf.prototype.ell = function (pt, cx, cy, rx, ry, col) {
  for (let dy = -ry; dy <= ry; dy++) {
    const h = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry || 1))));
    this.rect(pt, cx - h, cy + dy, 2 * h + 1, 1, col);
  }
};
/* trapezoid rows from (y0, x0a..x0b) to (y1, x1a..x1b) */
Buf.prototype.trap = function (pt, y0, xa0, xb0, y1, xa1, xb1, col) {
  for (let y = y0; y <= y1; y++) { const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0); const a = Math.round(xa0 + (xa1 - xa0) * t), b = Math.round(xb0 + (xb1 - xb0) * t); this.rect(pt, a, y, b - a, 1, col); }
};
Buf.prototype.mirror = function () {
  const { w, h } = this;
  for (let y = 0; y < h; y++) for (let x = 0; x < w / 2; x++) {
    const a = y * w + x, b = y * w + (w - 1 - x);
    let t = this.c[a]; this.c[a] = this.c[b]; this.c[b] = t;
    t = this.p[a]; this.p[a] = this.p[b]; this.p[b] = t;
  }
};

/* ---------------- body painter ---------------- */
function metrics(d) {
  const h = d.height || 96, B = BUILDS[d.build] || BUILDS.average;
  const legTop = -Math.round(h * 0.40), torsoTop = legTop - Math.round(h * 0.31);
  const neckH = h > 100 ? 4 : 3, ry = Math.round(h * 0.083);
  return { h, ...B, legTop, torsoTop, neckH, ry, headCy: torsoTop - neckH - ry + 1, curvy: d.figure === "curvy" };
}
const darker = (c, t = 0.25) => mix(c, "#140c1c", t);
const lighter = (c, t = 0.25) => mix(c, "#ffffff", t);

/* pose = { view: "front"|"back"|"side", act: "stand"|"walk"|"talk"|"reach"|"dance"|"dj"|"sit"|"crouch"|"point"|"phone", frame, mouth, blink, expr } */
function paint(d, pose) {
  const m = metrics(d);
  const B = new Buf(m.h);
  const P = {};
  // parts, in draw order (later = in front)
  ["armB", "legB", "hairBack", "shoeB", "legF", "shoeF", "pants", "torso", "skirt", "neck", "head", "face", "hair", "armF", "hand", "acc"].forEach(n => {
    P[n] = B.part(n, { shade: n !== "face", overlay: n === "face", tex: n === "hair" || n === "hairBack" ? "hair" : (n === "pants" || n === "legF" || n === "legB") && /jeans|cargo/.test(d.bottom.style) ? "denim" : null, ao: n !== "face" });
  });
  P.detail = B.part("detail", { shade: false, ao: false, overlay: true });
  P.print = B.part("print", { shade: true, ao: false, overlay: true });
  if (pose.view === "side") paintSide(B, P, d, m, pose); else paintFrontBack(B, P, d, m, pose);
  return B;
}

function shoe(B, pt, x, y, w, d, dir) {
  const st = d.shoes.style, col = d.shoes.color;
  if (st === "boots") { B.rect(pt, x, y - 7, w, 7, col); B.rect(pt, x, y - 1, w, 1, darker(col, 0.5)); return; }
  B.rect(pt, x, y - 5, w, 5, col);
  B.rect(pt, x, y - 1, w, 1, st === "sneakers" ? "#2a2833" : darker(col, 0.55));
  if (st === "sneakers" && dir) B.px(pt, dir > 0 ? x + w - 2 : x + 1, y - 4, lighter(col, 0.4));
}

function pantsCol(d) { return d.bottom.color; }
function topLong(d) { return /hoodie|jacket|coat|bomber|suit|shirt|cardigan|track/.test(d.top.style) && d.top.sleeves !== "short"; }
function sleeveLen(d, armLen) {
  const s = d.top.style;
  if (s === "tank" || s === "dress" && d.top.sleeves !== "long" || s === "mesh" && false) return 0;
  if (topLong(d) || d.top.sleeves === "long") return armLen;
  if (s === "vest") return 0;
  return Math.round(armLen * 0.36);
}
function topColor(d) { return d.top.color; }

function paintFrontBack(B, P, d, m, pose) {
  const back = pose.view === "back";
  const { lw, tw, aw, hx, ry, legTop, torsoTop, neckH, belly, curvy } = m;
  const act = pose.act, f = pose.frame || 0;
  const skin = d.skin, skinD = darker(skin, 0.18);
  let bob = 0, sit = act === "sit";
  if (act === "dance") bob = [0, 2, 0, 1][f % 4];
  if (act === "dj") bob = f % 2;
  if (act === "crouch") bob = 10;
  const ly = legTop + bob, ty = torsoTop + bob, hcy = m.headCy + bob;
  const pc = pantsCol(d), bst = d.bottom.style;
  /* ---- legs ---- */
  const legLift = act === "walk" ? [0, 2, 0, 2][f % 4] : 0;
  const which = act === "walk" ? (f % 4 === 1 ? -1 : f % 4 === 3 ? 1 : 0) : 0;
  const hipW = Math.max(tw - 4, lw * 2 + 2) + (curvy ? 2 : 0);
  const seat = Math.round(legTop * 0.5);   // underside of the thighs = chair height (legTop < 0)
  if (sit) {
    // seated, facing out: hips drop to the chair, thighs foreshortened toward us, knees a little apart, shins down
    const thighC = bst === "skirt" || bst === "none" ? (bst === "skirt" ? d.bottom.color : topColor(d)) : pc;
    B.rect(P.pants, -hipW / 2 - 1, seat - 7, hipW + 2, 8, thighC);
    [-1, 1].forEach(s => {
      const x = s < 0 ? -lw - 2 : 2;
      const shin = bst === "shorts" || bst === "skirt" || bst === "none" ? (d.bottom.tights || skin) : pc;
      B.rect(s < 0 ? P.legB : P.legF, x, seat + 1, lw, -seat - 5, shin);
      if (/jeans|pants|cargo|track/.test(bst)) B.rect(s < 0 ? P.legB : P.legF, x, -5, lw, 1, darker(pc, 0.3));
      shoe(B, s < 0 ? P.shoeB : P.shoeF, x - 1, 0, lw + 2, d, 0);
    });
  } else {
    [-1, 1].forEach(s => {
      const x = s < 0 ? -lw - 1 : 1;
      const lift = which === s ? legLift : 0;
      const pt = s < 0 ? P.legB : P.legF;
      const kneeY = ly + Math.round((-5 - ly) * 0.5);
      let legCol = pc;
      if (bst === "skirt" || bst === "none" || bst === "shorts") legCol = d.bottom.tights || skin;
      if (act === "crouch") {
        B.rect(pt, x + s * 2, ly, lw, -5 - ly - lift, bst === "shorts" || bst === "skirt" ? skin : pc);
      } else {
        B.rect(pt, x, ly, lw, -5 - ly - lift, legCol);
        if (bst === "shorts") B.rect(pt, x, ly, lw, Math.round((kneeY - ly) * 0.9), pc);
        if (bst === "track") B.rect(P.detail, s < 0 ? x : x + lw - 1, ly + 2, 1, -9 - ly - lift, "#efeaf6");
        if (/jeans|pants|cargo|track/.test(bst)) B.rect(pt, x, -6 - lift, lw, 1, darker(pc, 0.3)); // hem
        if (bst === "cargo") B.rect(P.detail, s < 0 ? x : x + lw - 3, kneeY - 3, 3, 4, darker(pc, 0.2));
      }
      shoe(B, s < 0 ? P.shoeB : P.shoeF, x - (s < 0 ? 1 : 0), -lift, lw + 1, d, 0);
    });
    // crotch / hips
    const crotchCol = bst === "skirt" || bst === "none" ? null : pc;
    if (crotchCol) B.rect(P.pants, -hipW / 2, ly, hipW, 6, crotchCol);
    if (bst === "skirt") B.trap(P.skirt, ly - 1, -hipW / 2, hipW / 2, ly + Math.round((-5 - ly) * 0.45), -hipW / 2 - 3, hipW / 2 + 3, d.bottom.color);
  }
  /* ---- torso ---- */
  const tc = topColor(d), st = d.top.style;
  const tBot = sit ? seat - 5 : ly + 1;
  const tTop = sit ? tBot - (legTop + 1 - torsoTop) : ty;
  const offY = sit ? tTop - ty : 0; // shift for upper body when seated
  const T = (y) => y + offY;
  const half = tw / 2;
  for (let y = tTop; y <= tBot; y++) {
    const t = (y - tTop) / Math.max(1, tBot - tTop);
    let w = half;
    if (y - tTop < 1) w -= 2; else if (y - tTop < 2) w -= 1;
    if (belly && t > 0.45) w += Math.round(belly * Math.sin((t - 0.45) / 0.55 * Math.PI * 0.9));
    if (curvy) { if (t > 0.35 && t < 0.7) w -= 2; if (t >= 0.85) w += 1; }
    B.rect(P.torso, -w, y, w * 2, 1, tc);
  }
  if (st === "coat" || st === "dress") {
    const hemY = st === "coat" ? T(ly) + Math.round((-5 - ly) * 0.6) : T(ly) + Math.round((-5 - ly) * 0.42);
    B.trap(P.skirt, tBot, -half - (curvy ? 1 : 0), half + (curvy ? 1 : 0), hemY, -half - 3, half + 3, tc);
    if (st === "coat" && !back) B.rect(P.detail, -1, tTop + 6, 1, hemY - tTop - 6, darker(tc, 0.35));
  }
  if (!back) {
    if (st === "jacket" || st === "bomber" || st === "suit" || st === "cardigan") {
      const inner = d.top.color2 || "#efeaf6";
      B.trap(P.print, tTop + 1, -2, 2, tBot - 2, -4, 4, inner);
      if (st === "suit" && d.top.tie !== false) B.rect(P.detail, 0, tTop + 2, 1, Math.round((tBot - tTop) * 0.55), d.top.tieColor || "#c0302c");
      B.rect(P.detail, -4, tTop + 1, 1, 6, darker(tc, 0.35)); B.rect(P.detail, 4, tTop + 1, 1, 6, darker(tc, 0.35));
      if (st === "bomber") B.rect(P.torso, -half, tBot - 2, tw, 3, darker(tc, 0.2));
    }
    if (st === "hoodie") {
      B.rect(P.detail, -2, tTop + 2, 1, 6, "#efeaf6"); B.rect(P.detail, 2, tTop + 2, 1, 7, "#efeaf6");
      B.rect(P.print, -6, tBot - 9, 12, 6, darker(tc, 0.15)); B.rect(P.detail, -6, tBot - 9, 12, 1, darker(tc, 0.35));
    }
    if (st === "shirt" || st === "polo") {
      B.px(P.detail, -2, tTop + 1, lighter(tc, 0.5)); B.px(P.detail, 1, tTop + 1, lighter(tc, 0.5));
      for (let y = tTop + 4; y < tBot - 1; y += 5) B.px(P.detail, 0, y, darker(tc, 0.45));
    }
    if (st === "vest") { for (let y = tTop + 4; y < tBot; y += 4) B.rect(P.detail, -half + 1, y, tw - 2, 1, darker(tc, 0.3)); }
    if (st === "mesh") { for (let y = tTop + 1; y < tBot; y++) for (let x = -half + 1; x < half; x++) if ((x + y) % 3 === 0) B.px(P.print, x, y, skin); }
    if (st === "apron" || d.acc.includes("apron")) B.trap(P.print, tTop + 6, -half + 3, half - 3, T(ly) + 8, -half + 2, half - 2, d.top.apron || "#efeaf6");
    const pr = d.top.print;
    if (pr === "circle") {
      const cx = 0, cy = tTop + 14, p = d.top.printColor || "#e8e4f0";
      [[-2, -4], [-1, -4], [0, -4], [1, -4], [2, -4], [-3, -3], [3, -3], [-4, -2], [4, -2], [-4, -1], [4, -1], [-4, 0], [4, 0], [-4, 1], [4, 1], [-3, 2], [3, 2], [-2, 3], [-1, 3], [0, 3], [1, 3], [2, 3],
        [-2, -1], [2, -1], [-2, 1], [-1, 2], [0, 2], [1, 2], [2, 1]].forEach(([dx, dy]) => B.px(P.print, cx + dx, cy + dy, p));
    } else if (pr === "stripe") {
      for (let y = tTop + 4; y < tBot - 1; y += 4) B.rect(P.print, -half + 1, y, tw - 2, 1, d.top.printColor || d.top.color2 || "#efeaf6");
    } else if (pr === "logo") {
      B.rect(P.print, -4, tTop + 7, 8, 5, d.top.printColor || d.top.color2 || "#ff3fa4");
    } else if (pr === "text") {
      RP.u.txt({ fillStyle: "", fillRect: (x, y, w, h) => B.rect(P.detail, x, y, w, h, d.top.printColor || "#efeaf6") }, d.top.text || "STAFF", -Math.round(RP.u.txtW(d.top.text || "STAFF") / 2), tTop + 8, "#fff");
    }
    if (d.figure === "curvy" && st !== "vest") B.rect(P.detail, -half + 3, tTop + 9, tw - 6, 1, darker(tc, 0.18));
  } else {
    if (st === "hoodie") { B.trap(P.torso, tTop - 3, -6, 6, tTop + 3, -8, 8, darker(tc, 0.08)); }
    if (d.top.backText) RP.u.txt({ fillStyle: "", fillRect: (x, y, w, h) => B.rect(P.detail, x, y, w, h, d.top.printColor || "#efeaf6") }, d.top.backText, -Math.round(RP.u.txtW(d.top.backText) / 2), tTop + 6, "#fff");
  }
  // belt line
  if (!sit && /jeans|pants|cargo/.test(bst) && st !== "coat" && st !== "dress") B.rect(P.pants, -hipW / 2, ly + 1, hipW, 1, darker(pc, 0.35));
  /* ---- arms ---- */
  const armLen = (ly - 2) - (tTop + 1);
  const sl = sleeveLen(d, armLen);
  const armX = half + (belly ? 1 : 0);
  const armsPose = (side) => {
    // returns list of segments for the arm on `side` (-1 left, +1 right) in screen space
    const x0 = side < 0 ? -armX - aw : armX;
    if (act === "dance") {
      const up = f % 4 === 0 || (f % 4 === 2 && side < 0) || (f % 4 === 3 && side > 0);
      if (up) return { kind: "up", x0: side < 0 ? -armX - aw + 1 : armX - 1, lean: side * 6 };
      return { kind: "bent", x0 };
    }
    if (act === "dj") return { kind: back ? "fwd" : "down", x0, nod: f % 2 };
    if (act === "phone" && side > 0) return { kind: "phone", x0 };
    if (act === "point" && side > 0) return { kind: "out", x0 };
    if (act === "reach" && side > 0) return { kind: back ? "upreach" : "out", x0 };
    if (act === "crouch") return { kind: "down", x0, short: 4 };
    return { kind: "down", x0, swing: act === "walk" ? (f % 4 === 1 ? side : f % 4 === 3 ? -side : 0) : 0 };
  };
  const sleeveC = st === "tank" || st === "dress" && sl === 0 ? skin : (st === "jacket" || st === "suit" || st === "bomber" || st === "hoodie" || st === "coat" || st === "cardigan" || st === "track") ? tc : tc;
  const drawArm = (side) => {
    const a = armsPose(side), pt = side < 0 ? P.armB : P.armF;
    const ty0 = tTop + 1;
    if (a.kind === "down") {
      const y0 = ty0 + (a.swing || 0), len = armLen - (a.short || 0);
      B.rect(pt, a.x0, y0, aw, len, skin);
      if (sl) B.rect(pt, a.x0, y0, aw, Math.min(len, sl), sleeveC);
      if (sl && sl < len) B.rect(P.detail, a.x0, y0 + sl, aw, 1, darker(skin, 0.15));
      B.rect(P.hand, a.x0, y0 + len, aw, 4, skin);
      B.rect(P.hand, a.x0, y0 + len + 3, aw, 1, skinD);
    } else if (a.kind === "up") {
      // raised arm: shoulder → above head
      const topY = hcy - ry - 3;
      for (let y = topY; y <= ty0 + 4; y++) {
        const t = (y - topY) / (ty0 + 4 - topY);
        const x = Math.round(a.x0 + a.lean * (1 - t));
        const inSleeve = (ty0 + 4 - y) <= sl * 0.9;
        B.rect(pt, x, y, aw, 1, inSleeve ? sleeveC : skin);
      }
      B.rect(P.hand, a.x0 + a.lean, topY - 3, aw, 4, skin);
    } else if (a.kind === "bent") {
      // elbows out, hands near shoulders
      const ex = a.x0 + (a.x0 < 0 ? -2 : 2);
      B.rect(pt, a.x0, ty0, aw, 10, sl ? sleeveC : skin);
      B.rect(pt, ex, ty0 + 6, aw, 4, sl >= 10 ? sleeveC : skin);
      B.rect(pt, ex + (a.x0 < 0 ? 1 : -1), ty0 - 4, aw, 10, sl > 14 ? sleeveC : skin);
      B.rect(P.hand, ex + (a.x0 < 0 ? 1 : -1), ty0 - 7, aw, 4, skin);
    } else if (a.kind === "fwd" || a.kind === "upreach") {
      // seen from behind: forearms go forward/down onto the decks, or up to a shelf
      const len = a.kind === "fwd" ? Math.round(armLen * 0.7) : armLen + 8;
      const y0 = a.kind === "fwd" ? ty0 : ty0 - len + 8;
      const xi = a.kind === "fwd" ? (a.x0 < 0 ? a.x0 + 2 : a.x0 - 2) : a.x0;
      B.rect(pt, xi, y0, aw, len, sl ? sleeveC : skin);
      if (a.kind === "upreach") B.rect(P.hand, xi, y0 - 3, aw, 4, skin);
    } else if (a.kind === "out" || a.kind === "phone") {
      // arm raised to the side / phone at ear
      if (a.kind === "phone") {
        B.rect(pt, a.x0, ty0, aw, 12, sl ? sleeveC : skin);
        B.rect(pt, a.x0 - 1, ty0 - 8, aw, 10, sl > 12 ? sleeveC : skin);
        B.rect(P.hand, a.x0 - 2, hcy - 2, aw, 5, skin);
        B.rect(P.acc, a.x0 - 3, hcy - 5, 2, 8, "#1c1a24");
      } else {
        for (let i = 0; i < 16; i++) B.rect(pt, a.x0 + i, ty0 + 2 - Math.round(i * 0.15), 1, aw, i < sl * 0.6 ? sleeveC : skin);
        B.rect(P.hand, a.x0 + 16, ty0 - 1, 3, aw + 1, skin);
      }
    }
  };
  if (act === "sit") {
    // hands resting on the thighs
    const aH = (seat - 7) - (tTop + 1), sl2 = sleeveLen(d, aH);
    [-1, 1].forEach(side => { const x0 = side < 0 ? -armX - aw : armX; const pt = side < 0 ? P.armB : P.armF; B.rect(pt, x0, tTop + 1, aw, aH, sl2 ? sleeveC : skin); if (sl2 < aH) B.rect(pt, x0, tTop + 1 + sl2, aw, aH - sl2, skin); B.rect(P.hand, x0 + (side < 0 ? 2 : -2), seat - 8, aw + 1, 3, skin); });
  } else { drawArm(-1); drawArm(1); }
  /* ---- neck & head ---- */
  const hY = sit ? hcy + offY : hcy;
  const nodY = act === "dj" && pose.frame % 2 ? 1 : 0;
  const HC = hY + nodY;
  B.rect(P.neck, -2, HC + ry - 1, 5, neckH + 2, skin);
  hairLayer(B, P, d, m, HC, back ? "back" : "front", "behind");
  B.ell(P.head, 0, HC, hx, ry, skin);
  B.rect(P.head, -hx - 1, HC - 1, 1, 3, skin); B.rect(P.head, hx + 1, HC - 1, 1, 3, skin); // ears
  if (!back) face(B, P, d, m, HC, pose, 0);
  if (!back) B.clip = (x, y) => !(y >= HC - 2 && y <= HC + ry && Math.abs(x) <= hx - 2) && !(y >= HC - 3 && Math.abs(x) <= 1);
  hairLayer(B, P, d, m, HC, back ? "back" : "front", "front");
  B.clip = null;
  accessories(B, P, d, m, HC, back ? "back" : "front", tTop, tBot, half);
}

function face(B, P, d, m, cy, pose, dir) {
  const skin = d.skin, ry = m.ry;
  const eye = "#1a1020", brow = darker(d.hair.color === "#e8e0d0" ? "#9a9aa6" : d.hair.color, 0.1);
  const expr = pose.expr || "neutral";
  if (dir === 0) {
    const ey = cy - 1;
    if (pose.blink) { B.rect(P.face, -3, ey + 1, 1, 1, darker(skin, 0.35)); B.rect(P.face, 3, ey + 1, 1, 1, darker(skin, 0.35)); }
    else { B.rect(P.face, -3, ey, 1, 2, eye); B.rect(P.face, 3, ey, 1, 2, eye); }
    // brows
    if (expr === "angry") { B.px(P.face, -4, ey - 3, brow); B.px(P.face, -3, ey - 2, brow); B.px(P.face, 4, ey - 3, brow); B.px(P.face, 3, ey - 2, brow); }
    else if (expr === "sad" || expr === "worried") { B.px(P.face, -4, ey - 2, brow); B.px(P.face, -3, ey - 3, brow); B.px(P.face, 4, ey - 2, brow); B.px(P.face, 3, ey - 3, brow); }
    else if (expr === "surprised") { B.rect(P.face, -4, ey - 4, 2, 1, brow); B.rect(P.face, 3, ey - 4, 2, 1, brow); }
    else { B.rect(P.face, -4, ey - 3, 2, 1, brow); B.rect(P.face, 3, ey - 3, 2, 1, brow); }
    B.px(P.face, 0, cy + 2, darker(skin, 0.22));
    B.px(P.face, 1, cy + 1, darker(skin, 0.12));
    const my = cy + 5;
    const lip = darker(skin, 0.38);
    if (pose.mouth) { B.rect(P.face, -1, my, 3, 2, "#5a1e24"); B.px(P.face, 0, my + 1, "#c05a5a"); }
    else if (expr === "happy") { B.px(P.face, -2, my - 1, lip); B.rect(P.face, -1, my, 3, 1, lip); B.px(P.face, 2, my - 1, lip); }
    else if (expr === "sad") { B.px(P.face, -2, my + 1, lip); B.rect(P.face, -1, my, 3, 1, lip); B.px(P.face, 2, my + 1, lip); }
    else if (expr === "surprised") B.rect(P.face, 0, my - 1, 1, 2, "#5a1e24");
    else B.rect(P.face, -1, my, 3, 1, lip);
    if (d.blush) { B.px(P.face, -5, cy + 2, mix(skin, "#ff6070", 0.4)); B.px(P.face, 5, cy + 2, mix(skin, "#ff6070", 0.4)); }
    const fh = d.facial, hc = d.hair.color === "none" ? "#3a2014" : (d.facialColor || d.hair.color);
    if (fh === "mustache") B.rect(P.hair, -2, my - 1, 5, 1, hc);
    if (fh === "beard") { for (let y = cy + 2; y <= cy + ry + 1; y++) { const w = Math.round(m.hx * Math.sqrt(Math.max(0, 1 - ((y - cy) * (y - cy)) / ((ry + 1) * (ry + 1))))); B.rect(P.hair, -w, y, w * 2 + 1, 1, hc); } B.rect(P.face, -1, my, 3, 1, pose.mouth ? "#5a1e24" : darker(skin, 0.38)); B.rect(P.hair, -2, my - 1, 5, 1, hc); }
    if (fh === "goatee") { B.rect(P.hair, -1, my + 1, 3, 2, hc); B.rect(P.hair, -2, my - 1, 5, 1, hc); }
    if (fh === "stubble") for (let y = cy + 3; y <= cy + ry; y++) for (let x = -m.hx + 2; x <= m.hx - 2; x++) if ((x + y * 2) % 3 === 0 && !(y === my)) B.px(P.face, x, y, darker(skin, 0.2));
  } else {
    // side view, facing +x (mirrored later for left)
    const ex = 4, ey = cy - 1;
    if (pose.blink) B.px(P.face, ex, ey + 1, darker(skin, 0.35)); else B.rect(P.face, ex, ey, 1, 2, eye);
    if (expr === "angry") { B.px(P.face, ex - 1, ey - 3, brow); B.px(P.face, ex, ey - 2, brow); }
    else B.rect(P.face, ex - 1, ey - 3, 2, 1, brow);
    B.px(P.head, m.hx + 1, cy + 1, skin); B.px(P.face, m.hx + 1, cy + 2, darker(skin, 0.2));
    const my = cy + 5;
    if (pose.mouth) B.rect(P.face, ex, my, 2, 2, "#5a1e24"); else B.rect(P.face, ex, my, 2, 1, darker(skin, 0.38));
    B.px(P.face, -2, cy, darker(skin, 0.25)); // ear
    const fh = d.facial, hc = d.facialColor || d.hair.color;
    if (fh === "mustache") B.rect(P.hair, ex - 1, my - 1, 4, 1, hc);
    if (fh === "beard") { for (let y = cy + 2; y <= cy + m.ry + 1; y++) B.rect(P.hair, -3, y, m.hx + 4 - Math.max(0, y - cy - 5), 1, hc); B.rect(P.face, ex, my, 2, 1, pose.mouth ? "#5a1e24" : darker(skin, 0.38)); }
    if (fh === "goatee") B.rect(P.hair, ex - 1, my + 1, 3, 2, hc);
  }
}

/* hair styles. layer: "behind" (drawn before head) or "front" */
function hairLayer(B, P, d, m, cy, view, layer, dir = 1) {
  const s = d.hair.style, c = d.hair.color, hx = m.hx, ry = m.ry;
  const hasHat = d.acc.some(a => a === "cap" || a === "beanie" || a === "bucket" || a === "hood");
  if (!s || s === "bald" || s === "none") return;
  const top = cy - ry;
  const pt = layer === "behind" ? P.hairBack : P.hair;
  if (layer === "behind") {
    if (s === "afro") B.ell(pt, view === "side" ? -2 : 0, cy - 4, hx + 6, ry + 5, c);
    if (s === "long" || s === "locs") {
      const len = s === "locs" ? 26 : 22;
      B.rect(pt, view === "side" ? -hx - 3 : -hx - 2, cy - 2, view === "side" ? hx + 2 : 2 * hx + 5, len, c);
      if (s === "locs") for (let x = -hx - 2; x < hx + 3; x += 2) B.rect(P.detail, x, cy + 2, 1, len - 4, darker(c, 0.3));
    }
    if (s === "bob") B.rect(pt, -hx - 2, cy - 3, 2 * hx + 5, ry + 6, c);
    if (s === "curly") for (let i = 0; i < 9; i++) { const a = Math.PI * (0.9 + i * 0.15); B.ell(pt, Math.round(Math.cos(a) * (hx + 1)) * (view === "side" ? 0.6 : 1), cy - 2 + Math.round(Math.sin(a) * (ry + 1)), 3, 3, c); }
    if (s === "ponytail" && view !== "front") B.rect(pt, view === "side" ? -hx - 4 : -2, cy - 2, view === "side" ? 4 : 5, 14, c);
    return;
  }
  if (hasHat && s !== "long" && s !== "locs") { /* hat covers the top; just sideburns */
    if (view !== "back") { B.rect(pt, -hx, cy - 4, 2, 4, c); if (view === "front") B.rect(pt, hx - 1, cy - 4, 2, 4, c); }
    return;
  }
  if (view === "back") {
    // whole back of head
    if (s === "buzz") { for (let y = top; y < cy + ry - 1; y++) for (let x = -hx; x <= hx; x++) if (((x - 0) * (x - 0)) / (hx * hx) + ((y - cy) * (y - cy)) / (ry * ry) <= 1 && bayer(x + 40, y + 40) < 9) B.px(pt, x, y, c); return; }
    B.ell(pt, 0, cy - 1, hx + 1, ry, c);
    if (s === "messy") [[-8, -6, 3], [8, -6, 3], [-5, -11, 3], [4, -12, 3], [0, -13, 2], [-9, -1, 2], [9, -1, 2]].forEach(([dx, dy, r]) => B.ell(pt, dx, cy + dy, r, r, c));
    if (s === "bun") B.ell(pt, 0, top - 2, 4, 3, c);
    if (s === "mohawk") B.rect(pt, -2, top - 5, 5, ry + 3, c);
    if (s === "ponytail") B.rect(pt, -2, cy + 2, 4, 12, c);
    if (s === "short" || s === "slick" || s === "messy" || s === "curly") B.rect(P.head, -hx + 2, cy + ry - 2, 2 * hx - 3, 1, d.skin); // nape
    return;
  }
  if (view === "front") {
    switch (s) {
      case "messy": {
        B.ell(pt, 0, cy - 7, hx + 3, 7, c);
        [[-8, -5, 3], [8, -5, 3], [-5, -12, 3], [4, -13, 3], [0, -14, 2], [-10, 0, 2], [10, 0, 2], [9, -9, 2], [-9, -10, 2]].forEach(([dx, dy, r]) => B.ell(pt, dx, cy + dy, r, r, c));
        for (let dx = -hx; dx <= hx; dx++) { const h = [3, 4, 3, 5, 3, 2, 4, 3, 5, 2, 4, 3, 5, 3, 4, 3, 4][dx + hx] || 3; B.rect(pt, dx, cy - 7, 1, h + 1, c); }
        break;
      }
      case "short": case "slick": {
        B.ell(pt, 0, cy - 3, hx + 1, ry - 2, c);
        B.rect(P.head, -hx + 1, cy - 3, 2 * hx - 1, 3, d.skin);
        B.rect(pt, -hx - 1, cy - 4, 2, 4, c); B.rect(pt, hx, cy - 4, 2, 4, c);
        B.rect(pt, -hx + 1, cy - 4, 2 * hx - 1, 1, c);
        if (s === "slick") B.rect(P.detail, -3, cy - ry + 1, 1, 3, lighter(c, 0.3));
        break;
      }
      case "buzz": for (let y = top; y < cy - 3; y++) for (let x = -hx; x <= hx; x++) if ((x * x) / (hx * hx) + ((y - cy) * (y - cy)) / (ry * ry) <= 1 && bayer(x + 40, y + 40) < 10) B.px(pt, x, y, c); break;
      case "curly": case "afro": {
        const R = s === "afro" ? 3 : 2;
        for (let x = -hx - 1; x <= hx + 1; x += 3) B.ell(pt, x, cy - ry + 1 + (Math.abs(x) > hx - 2 ? 3 : 0), R, R, c);
        B.ell(pt, 0, cy - ry + 2, hx, 3, c);
        break;
      }
      case "long": case "bob": case "locs": {
        B.ell(pt, 0, cy - 3, hx + 2, ry - 1, c);
        B.rect(P.head, -hx + 2, cy - 2, 2 * hx - 3, 2, d.skin);
        B.rect(pt, -hx - 2, cy - 4, 3, s === "bob" ? ry + 4 : ry + 9, c); B.rect(pt, hx, cy - 4, 3, s === "bob" ? ry + 4 : ry + 9, c);
        B.rect(pt, -hx + 1, cy - 5, 2 * hx - 1, 2, c); // fringe line
        if (s === "locs") for (let x = -hx - 2; x <= hx + 2; x += 2) B.px(P.detail, x, cy + 3, darker(c, 0.3));
        break;
      }
      case "bun": case "ponytail": {
        B.ell(pt, 0, cy - 3, hx + 1, ry - 2, c);
        B.rect(P.head, -hx + 1, cy - 3, 2 * hx - 1, 3, d.skin);
        B.rect(pt, -hx + 1, cy - 4, 2 * hx - 1, 1, c);
        B.rect(pt, -hx - 1, cy - 4, 2, 5, c); B.rect(pt, hx, cy - 4, 2, 5, c);
        if (s === "bun") B.ell(pt, 0, top - 2, 4, 3, c);
        break;
      }
      case "mohawk": B.rect(pt, -2, top - 6, 5, 8, c); break;
    }
    return;
  }
  // side view (facing +x)
  switch (s) {
    case "messy":
      B.ell(pt, -1, cy - 7, hx + 2, 7, c);
      [[-8, -4, 3], [6, -6, 3], [-4, -12, 3], [3, -12, 3], [-9, 1, 2], [-1, -14, 2]].forEach(([dx, dy, r]) => B.ell(pt, dx, cy + dy, r, r, c));
      B.rect(pt, -hx - 2, cy - 5, 5, 12, c);
      for (let dx = 0; dx <= hx + 1; dx++) B.rect(pt, dx, cy - 7, 1, [4, 3, 5, 3, 4, 2, 3, 2, 2][dx] || 2, c);
      break;
    case "short": case "slick": case "bun": case "ponytail":
      B.ell(pt, -1, cy - 3, hx + 1, ry - 2, c); B.rect(pt, -hx - 1, cy - 4, 6, 9, c);
      B.rect(P.head, 2, cy - 3, hx - 1, 3, d.skin);
      if (s === "bun") B.ell(pt, -3, top - 1, 4, 3, c);
      break;
    case "buzz": for (let y = top; y < cy - 2; y++) for (let x = -hx; x <= hx; x++) if ((x * x) / (hx * hx) + ((y - cy) * (y - cy)) / (ry * ry) <= 1 && bayer(x + 40, y + 40) < 10) B.px(pt, x, y, c); break;
    case "curly": case "afro":
      for (let x = -hx - 1; x <= hx; x += 3) B.ell(pt, x, cy - ry + 1, s === "afro" ? 3 : 2, s === "afro" ? 3 : 2, c);
      B.ell(pt, -3, cy - 2, 4, ry - 1, c);
      break;
    case "long": case "bob": case "locs":
      B.ell(pt, -1, cy - 3, hx + 2, ry - 1, c); B.rect(pt, -hx - 2, cy - 4, hx + 1, s === "bob" ? ry + 4 : ry + 10, c);
      B.rect(P.head, 3, cy - 2, hx - 2, 3, d.skin);
      break;
    case "mohawk": B.rect(pt, -4, top - 6, 7, 8, c); break;
  }
}

function accessories(B, P, d, m, cy, view, tTop, tBot, half, dir = 1) {
  const A = d.acc, hx = m.hx, ry = m.ry, top = cy - ry;
  const hatCol = d.hatColor || "#c0302c";
  for (const a of A) {
    if (a === "glasses" && view !== "back") {
      const fc = d.glassesColor || "#1a1020";
      if (view === "front") { B.rect(P.acc, -5, cy - 2, 4, 3, fc); B.rect(P.acc, 2, cy - 2, 4, 3, fc); B.rect(P.face, -4, cy - 1, 2, 1, "#c8dcf0"); B.rect(P.face, 3, cy - 1, 2, 1, "#c8dcf0"); B.rect(P.acc, -1, cy - 2, 3, 1, fc); }
      else { B.rect(P.acc, 3, cy - 2, 4, 3, fc); B.rect(P.face, 4, cy - 1, 2, 1, "#c8dcf0"); B.rect(P.acc, -2, cy - 2, 5, 1, fc); }
    }
    if (a === "shades" && view !== "back") {
      if (view === "front") { B.rect(P.acc, -5, cy - 2, 4, 3, "#0b0712"); B.rect(P.acc, 2, cy - 2, 4, 3, "#0b0712"); B.rect(P.acc, -1, cy - 2, 3, 1, "#0b0712"); B.px(P.detail, -4, cy - 2, "#8a86a0"); B.px(P.detail, 3, cy - 2, "#8a86a0"); }
      else { B.rect(P.acc, 3, cy - 2, 5, 3, "#0b0712"); B.rect(P.acc, -2, cy - 2, 5, 1, "#0b0712"); B.px(P.detail, 4, cy - 2, "#8a86a0"); }
    }
    if (a === "cap") {
      if (view === "front") { B.ell(P.acc, 0, cy - 4, hx + 1, ry - 3, hatCol); B.rect(P.acc, -hx - 1, cy - 4, 2 * hx + 3, 2, darker(hatCol, 0.3)); }
      else if (view === "back") { B.ell(P.acc, 0, cy - 4, hx + 1, ry - 3, hatCol); B.rect(P.detail, -2, cy - 2, 5, 1, darker(hatCol, 0.4)); }
      else { B.ell(P.acc, -1, cy - 4, hx + 1, ry - 3, hatCol); B.rect(P.acc, 2, cy - 4, hx + 5, 2, darker(hatCol, 0.25)); }
    }
    if (a === "beanie") {
      const bc = d.hatColor || "#2f62b8";
      B.ell(P.acc, view === "side" ? -1 : 0, cy - 4, hx + 1, ry - 2, bc); B.rect(P.acc, -hx - 1, cy - 4, 2 * hx + 3, 3, darker(bc, 0.2));
      for (let x = -hx; x <= hx; x += 2) B.px(P.detail, x, cy - 3, darker(bc, 0.35));
    }
    if (a === "bucket") {
      const bc = d.hatColor || "#d8c0a0";
      B.ell(P.acc, 0, cy - 5, hx, ry - 3, bc); B.rect(P.acc, -hx - 3, cy - 4, 2 * hx + 7, 2, darker(bc, 0.15));
    }
    if (a === "hood") { const hc = d.top.color; B.ell(P.acc, view === "side" ? -1 : 0, cy - 1, hx + 2, ry + 1, hc); if (view === "front") B.ell(P.face, 0, cy + 1, hx - 1, ry - 1, d.skin); }
    if (a === "headphones") {
      const hc = d.headphonesColor || "#1c1a24";
      if (d.headphonesOn) {
        if (view === "front") { B.rect(P.acc, -hx - 1, top - 1, 2 * hx + 3, 1, hc); B.rect(P.acc, -hx - 2, top, 1, ry, hc); B.rect(P.acc, hx + 2, top, 1, ry, hc); B.rect(P.acc, -hx - 3, cy - 2, 3, 6, hc); B.rect(P.acc, hx + 1, cy - 2, 3, 6, hc); }
        else if (view === "back") { B.rect(P.acc, -hx - 1, top - 1, 2 * hx + 3, 1, hc); B.rect(P.acc, -hx - 3, cy - 2, 3, 6, hc); B.rect(P.acc, hx + 1, cy - 2, 3, 6, hc); }
        else { B.rect(P.acc, -2, top - 1, 3, ry + 1, hc); B.ell(P.acc, -1, cy, 3, 3, hc); }
      } else {
        // around the neck
        const ny = cy + ry + 1;
        if (view === "side") { B.ell(P.acc, 1, ny + 1, 3, 2, hc); }
        else { B.rect(P.acc, -5, ny, 11, 2, hc); B.rect(P.acc, -6, ny - 1, 3, 4, hc); B.rect(P.acc, 4, ny - 1, 3, 4, hc); }
      }
    }
    if (a === "chain" && view !== "back") { const y = tTop + 3; if (view === "front") for (let x = -4; x <= 4; x++) B.px(P.detail, x, y + Math.round((16 - x * x) / 6), "#ffd23f"); else B.px(P.detail, 3, y + 2, "#ffd23f"); }
    if (a === "earring" && view !== "back") B.px(P.detail, view === "front" ? -hx - 1 : -2, cy + 2, "#ffd23f");
    if (a === "lanyard" && view === "front") { B.rect(P.detail, -3, tTop + 1, 1, 9, "#ff3fa4"); B.rect(P.detail, 3, tTop + 1, 1, 9, "#ff3fa4"); B.rect(P.detail, -2, tTop + 10, 5, 6, "#efeaf6"); B.rect(P.detail, -1, tTop + 11, 3, 1, "#39d0ff"); }
    if (a === "bag") {
      const bc = d.bagColor || "#5a3424";
      if (view === "front") { for (let i = 0; i < 14; i++) B.px(P.detail, -half + 2 + i, tTop + 1 + i, darker(bc, 0.3)); B.rect(P.acc, half - 3, tTop + 14, 7, 8, bc); }
      else if (view === "back") { for (let i = 0; i < 14; i++) B.px(P.detail, half - 2 - i, tTop + 1 + i, darker(bc, 0.3)); }
      else B.rect(P.acc, -6, tTop + 12, 6, 8, bc);
    }
    if (a === "clipboard" && view === "front") { B.rect(P.acc, half - 1, tTop + 12, 8, 10, "#c8925a"); B.rect(P.detail, half, tTop + 13, 6, 8, "#efeaf6"); for (let y = tTop + 15; y < tTop + 20; y += 2) B.rect(P.detail, half + 1, y, 4, 1, "#55516a"); }
    if (a === "watch" && view === "front") B.rect(P.detail, -half - m.aw, tTop + m.torsoTop * 0 + 26, m.aw, 1, "#c8c4d8");
    if (a === "tattoo" && view !== "back") { for (let y = tTop + 12; y < tTop + 26; y += 2) B.px(P.detail, view === "front" ? half + 1 : 1, y, "#2a4a6a"); }
  }
}

function paintSide(B, P, d, m, pose) {
  const { lw, tw, aw, hx, ry, legTop, torsoTop, neckH, belly, curvy } = m;
  const act = pose.act, f = pose.frame || 0;
  const skin = d.skin;
  const walking = act === "walk";
  const stv = walking ? [4, 0, -4, 0][f % 4] : 0;
  const bob = walking && (f % 2 === 1) ? -1 : 0;
  const crouch = act === "crouch" ? 10 : 0;
  const sit = act === "sit", seat = Math.round(legTop * 0.5);
  const drop = sit ? seat - 6 - legTop : 0;           // seated: the hip line sits on the chair
  const ly = legTop + bob + crouch + drop, ty = torsoTop + bob + crouch + drop, hcy = m.headCy + bob + crouch + drop;
  const pc = pantsCol(d), bst = d.bottom.style;
  const sw = Math.max(10, Math.round(tw * 0.62)) + (belly ? 2 : 0);
  const thigh = Math.round(-legTop * 0.42) + 2;      // seated: hip to knee, reaching forward
  // legs: back leg first (darker), front leg
  const leg = (s, pt, sh, back) => {
    let thighCol = pc, shinCol = pc;
    if (bst === "shorts") shinCol = skin;
    if (bst === "skirt" || bst === "none") { thighCol = d.bottom.tights || skin; shinCol = thighCol; }
    const kneeY = ly + Math.round((-5 - ly) * 0.48);
    if (sit) {
      const dx = back ? -2 : 0, kx = -3 + dx + thigh;
      B.rect(pt, -3 + dx, ly, thigh + lw, seat - ly + 1, thighCol);
      B.rect(pt, kx, seat, lw, -5 - seat, shinCol);
      if (/jeans|pants|cargo|track/.test(bst)) B.rect(pt, kx, -6, lw, 1, darker(pc, 0.3));
      shoe(B, sh, kx, 0, lw + 2, d, 1);
      return;
    }
    if (crouch) {
      B.rect(pt, -3 + 4, ly, lw, 7, thighCol); B.rect(pt, -3 + 6, ly + 6, lw, -5 - ly - 6, shinCol);
      shoe(B, sh, 2, 0, lw + 2, d, 1);
      return;
    }
    B.rect(pt, -3 + Math.round(s / 2), ly, lw, kneeY - ly + 1, thighCol);
    B.rect(pt, -3 + s, kneeY, lw, -5 - kneeY, shinCol);
    if (/jeans|pants|cargo|track/.test(bst)) B.rect(pt, -3 + s, -6, lw, 1, darker(pc, 0.3));
    shoe(B, sh, -3 + s, 0, lw + 2, d, 1);
  };
  leg(-stv, P.legB, P.shoeB, true);
  leg(stv, P.legF, P.shoeF, false);
  if (bst !== "skirt" && bst !== "none") B.rect(P.pants, -sw / 2 + 1, ly, sw - 1, 6, pc);
  if (bst === "skirt") {
    if (sit) B.rect(P.skirt, -sw / 2, ly - 1, sw / 2 + thigh, seat - ly + 3, d.bottom.color);
    else B.trap(P.skirt, ly - 1, -sw / 2, sw / 2, ly + Math.round((-5 - ly) * 0.45), -sw / 2 - 2, sw / 2 + 3, d.bottom.color);
  }
  // far arm (behind torso)
  const armLen = (ly - 2) - (ty + 1);
  const sl = sleeveLen(d, armLen);
  const tc = topColor(d);
  const sleeveC = d.top.style === "tank" ? skin : tc;
  const swing = walking ? -stv : 0;
  const arm = (pt, a, sh) => {
    B.rect(pt, -1 + Math.round(a / 2), ty + 1, aw, 12, sl ? sleeveC : skin);
    B.rect(pt, -1 + a, ty + 12, aw, armLen - 11, sl > 12 ? sleeveC : skin);
    B.rect(P.hand, -1 + a, ly - 2, aw, 4, skin);
  };
  const armSit = (pt, dx) => {
    // upper arm down, forearm forward to rest the hand on the thigh
    const ey = ty + 12, x0 = -1 + dx, hx2 = thigh - 7 + dx, hy = ly - 3, n = Math.max(1, hx2 - x0);
    B.rect(pt, x0, ty + 1, aw, ey - ty, sl ? sleeveC : skin);
    for (let i = 0; i <= n; i++) B.rect(pt, x0 + i, ey + Math.round((hy - ey) * i / n), 1, aw, sl > 12 && i < n - 2 ? sleeveC : skin);
    B.rect(P.hand, hx2, hy, 3, aw + 1, skin);
  };
  if (sit) armSit(P.armB, -2);
  else if (act !== "reach" && act !== "point" && act !== "phone") arm(P.armB, -swing, true);
  // torso
  const st = d.top.style;
  for (let y = ty; y <= ly + 1; y++) {
    const t = (y - ty) / Math.max(1, ly + 1 - ty);
    let x0 = -Math.floor(sw / 2), x1 = Math.ceil(sw / 2);
    if (y - ty < 1) { x0 += 1; x1 -= 1; }
    if (belly && t > 0.4) x1 += Math.round(belly * Math.sin((t - 0.4) / 0.6 * Math.PI * 0.9));
    if (curvy && t > 0.12 && t < 0.38) x1 += 1;
    B.rect(P.torso, x0, y, x1 - x0, 1, tc);
  }
  if (st === "coat" || st === "dress") {
    if (sit) { B.rect(P.skirt, -sw / 2, ly, sw / 2 + thigh - 1, seat - ly + 2, tc); B.rect(P.skirt, thigh - 6, seat, 6, st === "coat" ? 8 : 5, tc); }
    else {
      const hemY = st === "coat" ? ly + Math.round((-5 - ly) * 0.6) : ly + Math.round((-5 - ly) * 0.42);
      B.trap(P.skirt, ly, -sw / 2, sw / 2, hemY, -sw / 2 - 2, sw / 2 + 3, tc);
    }
  }
  if (st === "hoodie") B.rect(P.torso, -sw / 2 - 1, ty - 1, 5, 6, darker(tc, 0.08));
  if (st === "jacket" || st === "suit" || st === "bomber" || st === "cardigan") B.rect(P.print, Math.ceil(sw / 2) - 2, ty + 1, 2, ly - ty - 2, d.top.color2 || "#efeaf6");
  if (d.top.print === "stripe") for (let y = ty + 4; y < ly; y += 4) B.rect(P.print, -sw / 2 + 1, y, sw - 1, 1, d.top.printColor || d.top.color2 || "#efeaf6");
  if (st === "apron" || d.acc.includes("apron")) B.rect(P.print, Math.ceil(sw / 2) - 2, ty + 6, 2, ly - ty + 2, d.top.apron || "#efeaf6");
  if (bst !== "skirt" && bst !== "none" && st !== "coat" && st !== "dress") B.rect(P.pants, -sw / 2 + 1, ly + 1, sw - 1, 1, darker(pc, 0.35));
  // neck, head
  B.rect(P.neck, -1, hcy + ry - 1, 4, neckH + 2, skin);
  hairLayer(B, P, d, m, hcy, "side", "behind");
  B.ell(P.head, 1, hcy, hx, ry, skin);
  B.px(P.head, hx + 2, hcy + 1, skin);
  face(B, P, d, m, hcy, pose, 1);
  B.clip = (x, y) => !(x >= 1 && y >= hcy - 2 && y <= hcy + ry);
  hairLayer(B, P, d, m, hcy, "side", "front");
  B.clip = null;
  // near arm
  if (act === "reach" || act === "point") {
    const ay = ty + 6;
    B.rect(P.armF, 0, ty + 1, aw, 6, sl ? sleeveC : skin);
    for (let i = 0; i < 15; i++) B.rect(P.armF, 1 + i, ay + Math.round(i * (act === "point" ? -0.1 : 0.12)), 1, aw, i < sl * 0.7 ? sleeveC : skin);
    B.rect(P.hand, 16, ay - 1 + (act === "point" ? -1 : 2), 3, aw + 1, skin);
  } else if (act === "phone") {
    B.rect(P.armF, 0, ty + 1, aw, 11, sl ? sleeveC : skin);
    B.rect(P.armF, 2, hcy + 3, aw, ty - hcy + 10, sl > 11 ? sleeveC : skin);
    B.rect(P.hand, 2, hcy, aw, 4, skin); B.rect(P.acc, 2, hcy - 4, 2, 9, "#1c1a24");
  } else if (sit) armSit(P.armF, 0);
  else arm(P.armF, swing, false);
  accessories(B, P, d, m, hcy, "side", ty, ly, sw / 2);
}

/* ---------------- shading ---------------- */
/* character ramp: shadows multiply toward a cool plum (never a saturated red on skin),
   lights lift toward warm white. [deep, shadow, base, light, highlight] as rgb arrays */
const crampCache = new Map();
function cramp(base) {
  let r = crampCache.get(base);
  if (r) return r;
  const [R0, G0, B0] = hex(base);
  const mul = (a, b, c) => [R0 * a, G0 * b, B0 * c].map(v => clamp(Math.round(v), 0, 255));
  const lift = (a, b, c) => [R0 + (255 - R0) * a, G0 + (255 - G0) * b, B0 + (255 - B0) * c].map(v => clamp(Math.round(v), 0, 255));
  r = [mul(0.5, 0.46, 0.64), mul(0.75, 0.71, 0.85), [R0, G0, B0], lift(0.2, 0.18, 0.12), lift(0.42, 0.4, 0.3)];
  crampCache.set(base, r);
  return r;
}
function shadeBuffer(B, lx, rim) {
  const { w, h } = B;
  const out = new Uint8ClampedArray(w * h * 4);
  const ramps = B.pal.map(c => cramp(c));
  const flat = B.pal.map(hex);
  const val = new Float32Array(w * h);
  // per-part horizontal runs → cylinder normal
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const o = y * w + x, pt = B.u[o];
      if (!pt || B.c[o] < 0) { x++; continue; }
      let x2 = x; while (x2 + 1 < w && B.u[y * w + x2 + 1] === pt && B.c[y * w + x2 + 1] >= 0) x2++;
      const span = x2 - x + 1;
      for (let xx = x; xx <= x2; xx++) {
        const nx = span <= 1 ? 0 : ((xx - x + 0.5) / span) * 2 - 1;
        val[y * w + xx] = nx;
      }
      x = x2 + 1;
    }
  }
  // part vertical extents → top-lit
  const part = B.parts;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = y * w + x, ci = B.c[o];
    if (ci < 0) continue;
    const pt = B.p[o], P = part[pt];
    let r, g, b;
    if (!P || !P.shade) { [r, g, b] = flat[ci]; }
    else {
      const nx = val[o];
      let v = nx * lx * 0.95 - Math.pow(Math.abs(nx), 3) * 0.55;
      // top of a part catches overhead light
      const up = y > 0 ? B.u[o - w] : 0;
      if (up !== B.u[o]) v += 0.45;
      // occlusion under overhangs (chin, hem, fringe, hat brim)
      if (P.ao && y > 0) {
        const me = B.u[o], a1 = B.p[o - w], a2 = y > 1 ? B.p[o - 2 * w] : 0;
        if (a1 && B.u[o - w] !== me && part[a1] && part[a1].ao && B.c[o - w] >= 0) v -= 0.9;
        else if (a2 && B.u[o - 2 * w] !== me && part[a2] && part[a2].ao && B.c[o - 2 * w] >= 0) v -= 0.4;
      }
      // material texture
      if (P.tex === "hair") v += ((x * 3 + y * 7) % 5 === 0) ? 0.5 : ((x * 5 + y * 3) % 7 === 0 ? -0.35 : 0);
      if (P.tex === "denim") v += ((x + y) % 4 === 0) ? -0.18 : 0;
      // clean bands like hand-shaded VGA sprites; dither only right at band edges
      const u = v + (bayer(x, y) / 16 - 0.5) * 0.22;
      const idx = u > 0.95 ? 4 : u > 0.42 ? 3 : u > -0.38 ? 2 : u > -0.92 ? 1 : 0;
      [r, g, b] = ramps[ci][idx];
    }
    const q = o * 4; out[q] = r; out[q + 1] = g; out[q + 2] = b; out[q + 3] = 255;
  }
  // rim light: opaque edge pixels facing the rim light
  if (rim) {
    const [rr, rg, rb] = hex(rim.color), side = rim.side;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const o = y * w + x; if (B.c[o] < 0) continue;
      const nx = x + side;
      const edge = nx < 0 || nx >= w || B.c[y * w + nx] < 0;
      const edge2 = !edge && (nx + side < 0 || nx + side >= w || B.c[y * w + nx + side] < 0);
      if (edge || (edge2 && bayer(x, y) < 6)) {
        const q = o * 4, t = edge ? 0.62 : 0.35;
        out[q] = out[q] + (rr - out[q]) * t; out[q + 1] = out[q + 1] + (rg - out[q + 1]) * t; out[q + 2] = out[q + 2] + (rb - out[q + 2]) * t;
      }
    }
  }
  // selective dark outline
  const res = new Uint8ClampedArray(out);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = y * w + x; if (B.c[o] >= 0) continue;
    let n = -1;
    if (x > 0 && B.c[o - 1] >= 0) n = o - 1; else if (x < w - 1 && B.c[o + 1] >= 0) n = o + 1;
    else if (y > 0 && B.c[o - w] >= 0) n = o - w; else if (y < h - 1 && B.c[o + w] >= 0) n = o + w;
    if (n < 0) continue;
    const q = o * 4, s = n * 4;
    res[q] = out[s] * 0.28 + 6; res[q + 1] = out[s + 1] * 0.22 + 3; res[q + 2] = out[s + 2] * 0.3 + 12; res[q + 3] = 235;
  }
  return res;
}

/* ---------------- cache & public draw ---------------- */
const cache = new Map();
const shadowCache = new Map();
function invalidate(id) { for (const k of [...cache.keys()]) if (k.startsWith(id + "|")) cache.delete(k); for (const k of [...shadowCache.keys()]) if (k.startsWith(id + "|")) shadowCache.delete(k); }
const qlx = v => Math.round(clamp(v, -1, 1) * 2) / 2;

function poseKey(p) { return [p.view, p.act, p.frame | 0, p.mouth ? 1 : 0, p.blink ? 1 : 0, p.expr || "", p.flip ? 1 : 0].join(","); }

function sprite(def, pose, lx, rim) {
  const key = def.id + "|" + poseKey(pose) + "|" + qlx(lx) + "|" + (rim ? rim.color + rim.side : "");
  let s = cache.get(key);
  if (s) return s;
  const B = paint(def, pose);
  if (pose.flip) B.mirror();
  const data = shadeBuffer(B, qlx(lx), rim);
  const cv = mk(B.w, B.h);
  const cx = cv.getContext("2d");
  const img = cx.createImageData(B.w, B.h); img.data.set(data); cx.putImageData(img, 0, 0);
  // trimmed bounds for hit-testing
  let x0 = B.w, x1 = 0, y0 = B.h, y1 = 0;
  for (let y = 0; y < B.h; y++) for (let x = 0; x < B.w; x++) if (B.c[y * B.w + x] >= 0) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  s = { cv, ax: B.ax, ay: B.ay, w: B.w, h: B.h, box: [x0 - B.ax, y0 - B.ay, x1 - x0 + 1, y1 - y0 + 1], buf: B };
  if (cache.size > 2500) cache.clear();
  cache.set(key, s);
  return s;
}

/* projected cast shadow from the silhouette, away from the key light; pre-dithered and cached */
function castShadow(def, pose, lx, sp) {
  const key = def.id + "|" + poseKey(pose) + "|" + qlx(lx);
  let s = shadowCache.get(key);
  if (s) return s;
  const B = sp.buf, len = 0.2, skew = -qlx(lx) * 0.75;
  const pad = 70, cv = mk(B.w + pad * 2, 40), c = cv.getContext("2d");
  c.fillStyle = "#0a0410";
  const baseY = 30, seen = new Uint8Array(cv.width * cv.height);
  for (let y = 0; y < B.h; y++) for (let x = 0; x < B.w; x++) {
    if (B.c[y * B.w + x] < 0) continue;
    const hgt = B.ay - y;
    const sx = Math.round(pad + x + hgt * skew), sy = Math.round(baseY - hgt * len);
    if (sx < 0 || sy < 0 || sx >= cv.width || sy >= cv.height || seen[sy * cv.width + sx]) continue;
    seen[sy * cv.width + sx] = 1;
    if ((sx + sy) & 1) c.fillRect(sx, sy, 1, 1);
  }
  s = { cv, ox: pad + B.ax, oy: baseY };
  if (shadowCache.size > 1500) shadowCache.clear();
  shadowCache.set(key, s);
  return s;
}
/* dithered contact shadow ellipse, cached by size */
const contactCache = new Map();
function contactShadow(rx, ry, level) {
  const key = rx + "," + ry + "," + level;
  let cv = contactCache.get(key);
  if (cv) return cv;
  cv = mk(rx * 2 + 1, ry * 2 + 1);
  const c = cv.getContext("2d"); c.fillStyle = "#0a0410";
  for (let x = -rx; x <= rx; x++) for (let y = -ry; y <= ry; y++) if ((x * x) / (rx * rx) + (y * y) / (ry * ry) < 1 && bayer(x + 64, y + 64) < level) c.fillRect(x + rx, y + ry, 1, 1);
  contactCache.set(key, cv);
  return cv;
}

/* draw a character instance onto ctx at world (x,y)=feet.
   inst: { def or id, x, y, face, act, frame, mouth, blink, expr, scale }
   light: { lx, rim:{color,side}|null, shadow: 0..1, cast: bool } */
function draw(ctx, inst, light = {}) {
  const def = typeof inst.def === "string" ? DEFS[inst.def] : inst.def || DEFS[inst.id];
  if (!def) return null;
  const face = inst.face || "front";
  const view = face === "left" || face === "right" ? "side" : face;
  const pose = { view, act: inst.act || "stand", frame: inst.frame || 0, mouth: inst.mouth, blink: inst.blink, expr: inst.expr, flip: face === "left" };
  if (view !== "side" && (pose.act === "walk")) pose.frame = inst.frame || 0;
  const lx = light.lx || 0;
  const rim = light.rim ? { color: light.rim.color, side: light.rim.side * (pose.flip ? 1 : 1) } : null;
  const sp = sprite(def, pose, pose.flip ? lx : lx, rim);
  const sc = inst.scale || 1;
  const X = Math.round(inst.x), Y = Math.round(inst.y);
  // shadows
  const sh = light.shadow == null ? 0.55 : light.shadow;
  if (sh > 0 && !inst.noShadow) {
    const rx = Math.round(11 * sc + (def.build === "big" ? 3 : def.build === "stocky" ? 2 : 0)), ryy = Math.max(1, Math.round(2 * sc));
    ctx.drawImage(contactShadow(rx, ryy, Math.round(9 * sh + 2)), X - rx, Y - ryy);
    if (light.cast && Math.abs(lx) > 0.2 && !inst.noCast) {
      const cs = castShadow(def, pose, lx, sp);
      ctx.save(); ctx.globalAlpha = Math.min(1, 0.85 * sh + 0.2);
      ctx.drawImage(cs.cv, Math.round(X - cs.ox * sc), Math.round(Y - cs.oy * sc), Math.round(cs.cv.width * sc), Math.round(cs.cv.height * sc));
      ctx.restore();
    }
  }
  ctx.imageSmoothingEnabled = false;
  if (inst.alpha != null && inst.alpha < 1) { ctx.save(); ctx.globalAlpha = inst.alpha; }
  ctx.drawImage(sp.cv, Math.round(X - sp.ax * sc), Math.round(Y - sp.ay * sc), Math.round(sp.w * sc), Math.round(sp.h * sc));
  if (inst.alpha != null && inst.alpha < 1) ctx.restore();
  const b = sp.box;
  return [X + b[0] * sc, Y + b[1] * sc, b[2] * sc, b[3] * sc];
}

/* head-top position for speech anchoring */
function headTop(id, scale = 1, act) { const d = DEFS[id]; if (!d) return 100; const m = metrics(d); const drop = act === "sit" ? Math.round(m.legTop * 0.5) - 6 - m.legTop : act === "crouch" ? 10 : 0; return (-(m.headCy - m.ry) + 10 - drop) * scale; }

/* inventory/portrait icon of a character face */
function portrait(id, size = 32) {
  const d = DEFS[id]; if (!d) return mk(size, size);
  const sp = sprite(d, { view: "front", act: "stand", frame: 0 }, -0.5, null);
  const m = metrics(d);
  const cv = mk(size, size), c = cv.getContext("2d");
  c.imageSmoothingEnabled = false;
  const top = sp.ay + m.headCy - m.ry - 8;
  c.drawImage(sp.cv, sp.ax - size / 2, top, size, size, 0, 0, size, size);
  return cv;
}

RP.chars = { define, update, get, random, draw, sprite, headTop, portrait, invalidate, DEFS, SKINS, HAIRC, metrics };
})();
