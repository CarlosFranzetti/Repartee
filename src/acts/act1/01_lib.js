/* Act 1 — shared helpers (RP.a1). Loaded right after 00_act1.js, before any room.
   - baking: paint paint-kit props once into an offscreen canvas so they can be used as
     depth-sorted sprites without re-running the (expensive) painters every frame
   - time of day, name mangling, money safety nets, clock beats */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u;
const { R, P, ell, mk, mulberry, txt, txtW } = U;
const A1 = RP.a1 = RP.a1 || {};

/* ---------- baking ---------- */
const memo = {};
/* paint fn(c) onto a fresh w*h canvas (origin 0,0). fn may return emissive rects (relative). */
A1.bake = (w, h, fn) => { const cv = mk(w, h); const em = fn(cv.getContext("2d")); return { cv, w, h, em: Array.isArray(em) ? em : [] }; };
/* same, cached under key */
A1.memo = (key, w, h, fn) => memo[key] || (memo[key] = A1.bake(w, h, fn));
A1.blit = (c, b, x, y) => { c.drawImage(b.cv, Math.round(x), Math.round(y)); };
/* blit a horizontal slice [sy, sy+sh) of a baked prop to (dx, dy) */
A1.slice = (c, b, sy, sh, dx, dy) => { if (sh > 0) c.drawImage(b.cv, 0, sy, b.w, sh, Math.round(dx), Math.round(dy), b.w, sh); };
A1.emAt = (b, dx, dy) => b.em.map(r => [r[0] + dx, r[1] + dy, r[2], r[3]]);

/* ---------- time of day ---------- */
/* S.f.time: "night" (Tue night), "morning" (Wed), "evening" (Wed dusk), "sat" (Saturday night) */
A1.tod = S => ({ night: "night", sat: "night", morning: "day", evening: "dusk" }[S.f.time] || "night");
A1.setTime = (S, time, clock) => { S.f.time = time; if (clock) RP.setClock(clock); RP.relight(); };

/* ---------- the promoters spell your name wrong ---------- */
A1.mangle = name => {
  const n = String(name || "").toUpperCase().replace(/^DJ\s+/, "").replace(/[^A-Z0-9 '&.-]/g, "").trim();
  if (!n) return "DJ WHAT'S-HIS-NAME";
  const a = n.split("");
  if (a.length >= 4) { const t = a[1]; a[1] = a[2]; a[2] = t; }
  else a.push(a[a.length - 1]);
  let out = a.join("");
  if (out === n) out += "Z";
  return "DJ " + out;
};
A1.djName = () => { const n = String(RP.state.name || "").trim(); return n ? (/^DJ\s/i.test(n) ? n.toUpperCase() : "DJ " + n.toUpperCase()) : "DJ NOBODY"; };

/* ---------- small helpers ---------- */
A1.fare = 3;
A1.say = (S, who, lines) => RP.lines(lines.map(l => (who ? "@" + who + " " + l : l)));
A1.pick = (arr, seed) => arr[Math.abs(seed | 0) % arr.length];
/* hotspot by id of the current room */
A1.hot = id => RP.curRoom().def.hotspots.find(h => h.id === id);
/* run another hotspot's verb handler */
A1.runVerb = (id, verb, ...args) => RP.runH(A1.hot(id)[verb], ...args);

/* subway exit (shared by every "street" hotspot that opens the map) */
A1.travelExit = (S, strict) => {
  if (S.f.time === "night" && !S.f.a1_slept) return "It's midnight. Nothing's open in Midtown but the lights. Tomorrow: the shift. Tonight: sleep.";
  if (S.f.time === "morning" && S.f.a1_acidUnder) return "Acid Tracks is still under my mattress. I'm not leaving it to the dust bunnies. I should pick it up first.";
  if (strict && S.money < A1.fare - 1e-9) return "The fare's " + U.fmtMoney(A1.fare) + ". I've got " + U.fmtMoney(S.money) + ". Cans on the curb by the scaffold are worth a nickel each. The city runs on nickels.";
  return "travel";
};

/* fire alarm beeper (Synergex floor + break room): call from update(dt, S, t) */
let lastBeep = -1;
A1.alarmTick = (S, t) => { if (!S.f.a1_alarm) { lastBeep = -1; return; } const k = Math.floor(t / 2600); if (k !== lastBeep) { lastBeep = k; RP.sfx("alarm"); } };

/* every sprite/prop that needs a little animated flicker uses this */
A1.flick = (t, rate, seed) => ((Math.floor(t / rate) * 2654435761 + (seed || 0) * 97) >>> 7) % 100;

/* nice looping crowd chatter: toasts from a pool (used sparingly) */
A1.cap = s => s.charAt(0).toUpperCase() + s.slice(1);
})();
