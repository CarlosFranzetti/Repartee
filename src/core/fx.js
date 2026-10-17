/* re:parteé — room lighting and particle effects.
   Lighting: every room gets a multiply light map (ambient + soft light pools in fine color steps,
   emissive rects kept full bright) and an additive glow layer. No ordered dithering: light falls
   off in smooth, slightly posterized steps so it reads as pixel art without dot patterns.
   Characters read the same light definition for their key-light direction and colored rim light.
   Effects: dust motes, rain, steam, haze, sweeping beams, strobes, confetti, blinking
   neon, passing headlights. All cheap, all pixel-snapped. */
(function () {
"use strict";
const RP = window.RP;
const { mk, clamp, hex, mulberry, R, P } = RP.u;

/* light levels: fine steps (posterized, never dithered) */
const STEPS = 32;
const smooth = t => t * t * (3 - 2 * t);
/* night rooms keep their color but never sink below a readable floor */
const LIFT = 0.1;

/* ---------------- light map ---------------- */
function buildLightmap(L, width, height) {
  const cv = mk(width, height), c = cv.getContext("2d");
  const img = c.createImageData(width, height), d = img.data;
  const a0 = hex(L.ambient || "#ffffff");
  const lift = L.lift == null ? LIFT : L.lift;
  const amb = a0.map(v => v + (255 - v) * lift);
  const lights = (L.lights || []).map(l => ({ x: l.x, y: l.y, r: l.r || 120, sy: l.sy || 1.2, steps: l.steps || 4,
    col: hex(l.color || "#ffffff"), power: l.power == null ? 1 : l.power, gamma: l.gamma || 1,
    box: l.box || null }));
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let r = amb[0], g = amb[1], b = amb[2];
    for (let i = 0; i < lights.length; i++) {
      const l = lights[i];
      let dd;
      if (l.box) { // rectangular light (window, door spill)
        const dx = Math.max(l.box[0] - x, 0, x - (l.box[0] + l.box[2])), dy = Math.max(l.box[1] - y, 0, y - (l.box[1] + l.box[3]));
        dd = Math.sqrt(dx * dx + dy * dy * l.sy * l.sy);
      } else { const dx = x - l.x, dy = (y - l.y) * l.sy; dd = Math.sqrt(dx * dx + dy * dy); }
      let t = 1 - dd / l.r;
      if (t <= 0) continue;
      t = smooth(t);
      if (l.gamma !== 1) t = Math.pow(t, l.gamma);
      t = Math.round(t * STEPS) / STEPS * l.power;
      if (t <= 0) continue;
      // screen blend toward the light color
      r = 255 - (255 - r) * (1 - l.col[0] / 255 * t);
      g = 255 - (255 - g) * (1 - l.col[1] / 255 * t);
      b = 255 - (255 - b) * (1 - l.col[2] / 255 * t);
    }
    const o = (y * width + x) * 4; d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  c.fillStyle = "#ffffff";
  (L.emissive || []).forEach(rc => c.fillRect(rc[0], rc[1], rc[2], rc[3]));
  return cv;
}

/* additive glow around lamps, neon and screens: a bright core and a wide soft bloom, in fine steps */
function buildHalos(L, width, height) {
  if (!L.halos || !L.halos.length) return null;
  const cv = mk(width, height), c = cv.getContext("2d");
  const img = c.createImageData(width, height), d = img.data;
  L.halos.forEach(h => {
    const col = hex(h.color || "#ffd27a"), r = (h.r || 20) * 1.35, st = h.strength || 1, sy = h.sy || 1;
    const x0 = Math.max(0, Math.floor(h.x - r)), x1 = Math.min(width - 1, Math.ceil(h.x + r));
    const y0 = Math.max(0, Math.floor(h.y - r / sy)), y1 = Math.min(height - 1, Math.ceil(h.y + r / sy));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const dd = Math.hypot(x - h.x, (y - h.y) * sy) / r;
      if (dd >= 1) continue;
      const k = 1 - dd;
      // core (tight, bright) + bloom (wide, faint)
      let v = (Math.pow(k, 3) * 0.55 + k * k * 0.22) * st;
      v = Math.round(v * 48) / 48;
      if (v <= 0) continue;
      const o = (y * width + x) * 4;
      d[o] = Math.min(255, d[o] + col[0] * v); d[o + 1] = Math.min(255, d[o + 1] + col[1] * v); d[o + 2] = Math.min(255, d[o + 2] + col[2] * v); d[o + 3] = 255;
    }
  });
  c.putImageData(img, 0, 0);
  return cv;
}

/* key light direction and rim light for an actor at (x, y) */
function actorLight(L, x, y) {
  if (!L) return { lx: 0, rim: null, cast: false, shadow: 0.5 };
  let best = null, bestS = 0;
  const ls = L.lights || [];
  if (L.key) best = L.key;
  else for (const l of ls) {
    if (l.box) continue;
    const dd = Math.hypot(l.x - x, (l.y - (y - 50)) * 0.7);
    const s = (l.power == null ? 1 : l.power) * (l.r || 120) / (dd + 30);
    if (s > bestS) { bestS = s; best = l; }
  }
  const lx = best ? clamp((best.x - x) / 110, -1, 1) : 0;
  let rim = null;
  const rims = L.rims || ls.filter(l => l.rim);
  let rb = 0;
  for (const l of rims) {
    const dd = Math.hypot(l.x - x, l.y - (y - 50));
    const s = (l.r || 160) / (dd + 1);
    if (dd < (l.r || 160) && s > rb) { rb = s; rim = { color: l.color, side: l.x > x ? 1 : -1 }; }
  }
  return { lx, rim, cast: L.cast !== false && !!best, shadow: L.shadow == null ? 0.6 : L.shadow };
}

/* ---------------- particles ---------------- */
const reduced = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();

function makeFx(spec, seed) {
  const r = mulberry(seed || 7);
  const fx = { spec, parts: [], t: 0 };
  const s = spec;
  if (s.type === "dust") {
    const [x, y, w, h] = s.rect; const n = s.count || 30;
    for (let i = 0; i < n; i++) fx.parts.push({ x: x + r() * w, y: y + r() * h, vx: (r() - 0.5) * 4, vy: (r() - 0.6) * 3, ph: r() * 6.28 });
  } else if (s.type === "rain") {
    const n = s.count || 90;
    for (let i = 0; i < n; i++) fx.parts.push({ x: r() * (s.width || 640), y: r() * 256, sp: 220 + r() * 120 });
  } else if (s.type === "confetti") {
    const n = s.count || 60;
    const cols = s.colors || ["#ff3fa4", "#39d0ff", "#ffd23f", "#9be15d", "#ffffff"];
    for (let i = 0; i < n; i++) fx.parts.push({ x: r() * (s.width || 640), y: -r() * 256, sp: 30 + r() * 40, c: cols[i % cols.length], ph: r() * 6 });
  } else if (s.type === "steam" || s.type === "smoke") {
    for (let i = 0; i < (s.count || 10); i++) fx.parts.push({ age: r() * 3, ph: r() * 6, k: r() });
  }
  fx.rnd = r;
  return fx;
}

function stepAndDraw(fx, c, dt, t, camX) {
  const s = fx.spec, r = fx.rnd;
  if (s.on && !s.on()) return;
  fx.t += dt;
  switch (s.type) {
    case "dust": {
      const [x0, y0, w, h] = s.rect;
      const col = s.color || "#fff4d6";
      for (const p of fx.parts) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < x0) p.x += w; if (p.x > x0 + w) p.x -= w; if (p.y < y0) p.y += h; if (p.y > y0 + h) p.y -= h;
        if (Math.sin(t / 700 + p.ph) > 0.2) P(c, p.x, p.y, col);
      }
      break;
    }
    case "rain": {
      const col = s.color || "rgba(180,190,255,0.55)", floor = s.floor || 256;
      c.fillStyle = col;
      for (const p of fx.parts) {
        p.y += p.sp * dt; p.x -= p.sp * dt * 0.12;
        if (p.y > floor) { if (r() < 0.5) { c.fillRect(p.x - 1, floor - 1, 3, 1); } p.y = -10 - r() * 40; p.x = r() * (s.width || 640) + 20; }
        c.fillRect(Math.round(p.x), Math.round(p.y), 1, 4);
      }
      break;
    }
    case "confetti": {
      for (const p of fx.parts) {
        p.y += p.sp * dt; p.x += Math.sin(t / 300 + p.ph) * 0.4;
        if (p.y > (s.floor || 250)) { p.y = -5 - r() * 60; p.x = r() * (s.width || 640); }
        R(c, p.x, p.y, Math.sin(t / 150 + p.ph) > 0 ? 2 : 1, 1, p.c);
      }
      break;
    }
    case "steam": case "smoke": {
      const col = s.color || (s.type === "steam" ? "#e8e4f0" : "#8a86a0");
      for (const p of fx.parts) {
        p.age += dt * (s.speed || 0.6);
        if (p.age > 3) p.age -= 3;
        const a = p.age / 3, rad = 2 + a * (s.size || 9);
        const cx = s.x + Math.sin(p.ph + p.age * 1.7) * 4 * a + (s.drift || 0) * a, cy = s.y - a * (s.rise || 40);
        // a translucent puff that thins out as it rises
        const al = Math.round((1 - a) * 6) / 6 * 0.32;
        if (al <= 0) continue;
        const pa = c.globalAlpha; c.globalAlpha = al; c.fillStyle = col;
        const rr = Math.round(rad);
        for (let y = -rr; y <= rr; y++) { const hw = Math.round(Math.sqrt(rr * rr - y * y)); c.fillRect(Math.round(cx - hw), Math.round(cy + y), hw * 2 + 1, 1); }
        c.globalAlpha = pa;
      }
      break;
    }
    case "haze": {
      // drifting fog band: a soft translucent layer, built once and scrolled (period 128px so it wraps cleanly)
      const [x0, y0, w, h] = s.rect, col = s.color || "#b8a8ff";
      if (!s._cv || s._cvKey !== col + w + "x" + h) {
        const cw = w + 128, cv = mk(cw, h), g = cv.getContext("2d"), img = g.createImageData(cw, h), dd = img.data;
        const [r, gg, b] = hex(col), dens = Math.min(2, (s.density || 3) / 3), TAU = Math.PI * 2;
        for (let y = 0; y < h; y++) {
          const k = Math.pow(1 - Math.abs(y / h * 2 - 1), 1.4);
          for (let x = 0; x < cw; x++) {
            const u = x / 128 * TAU;
            const n = 0.62 + 0.24 * Math.sin(u + y / 7) + 0.14 * Math.sin(u * 3 + y / 4 + 1.7);
            const i = (y * cw + x) * 4;
            dd[i] = r; dd[i + 1] = gg; dd[i + 2] = b; dd[i + 3] = Math.round(255 * Math.min(0.5, k * n * 0.2 * dens));
          }
        }
        g.putImageData(img, 0, 0); s._cv = cv; s._cvKey = col + w + "x" + h;
      }
      const off = reduced ? 0 : Math.floor(t / (s.slow || 90)) % 128;
      c.drawImage(s._cv, off, 0, w, h, x0, y0, w, h);
      break;
    }
    case "beams": {
      // sweeping light beams from origins, additive
      if (reduced && s.motion !== "always") { /* static beams only */ }
      c.save(); c.globalCompositeOperation = "lighter";
      (s.origins || []).forEach((o, i) => {
        const a = (s.base || Math.PI / 2) + Math.sin(t / (s.period || 1400) + i * 1.9) * (s.swing || 0.5) * (reduced ? 0.2 : 1);
        const len = s.len || 220, wdt = s.width || 18;
        const ex = o[0] + Math.cos(a) * len, ey = o[1] + Math.sin(a) * len;
        const px = -Math.sin(a), py = Math.cos(a);
        const col = (s.colors || ["#ff3fa4", "#39d0ff"])[i % (s.colors || [1, 2]).length];
        c.globalAlpha = s.alpha || 0.16;
        c.fillStyle = col;
        c.beginPath(); c.moveTo(o[0], o[1]); c.lineTo(ex + px * wdt, ey + py * wdt); c.lineTo(ex - px * wdt, ey - py * wdt); c.closePath(); c.fill();
      });
      c.restore();
      break;
    }
    case "strobe": {
      if (reduced) break;
      const per = s.period || 2400, on = (t % per) < (s.flash || 60);
      if (on) { c.save(); c.globalAlpha = s.alpha || 0.25; c.fillStyle = s.color || "#ffffff"; c.fillRect(camX, 0, 640, 256); c.restore(); }
      break;
    }
    case "blink": {
      (s.items || []).forEach((it, i) => {
        const on = Math.floor(t / (it.rate || 500) + (it.phase || i)) % 2 === 0;
        if (it.flicker && r() < 0.02) return;
        if (on) R(c, it.r[0], it.r[1], it.r[2], it.r[3], it.color);
        else if (it.off) R(c, it.r[0], it.r[1], it.r[2], it.r[3], it.off);
      });
      break;
    }
    case "cars": {
      // headlights sweeping across a street at y
      const per = s.period || 5200, w = s.width || 640;
      const k = (t % per) / per;
      const x = s.dir < 0 ? w + 60 - k * (w + 120) : -60 + k * (w + 120);
      c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = 0.5;
      c.fillStyle = s.color || "#fff2c0";
      // a beam that fades out ahead of the car, in steps
      for (let i = 0; i < 26; i++) { c.globalAlpha = 0.5 * Math.round((1 - i / 26) * 6) / 6; const hw = 2 + Math.round(i / 9); c.fillRect(Math.round(x + (s.dir < 0 ? -i : i)), s.y - hw, 1, hw * 2 + 1); }
      c.restore();
      break;
    }
    case "custom": if (s.draw) s.draw(c, dt, t, fx); break;
  }
}

RP.fx = { buildLightmap, buildHalos, actorLight, makeFx, stepAndDraw, reduced };
})();
