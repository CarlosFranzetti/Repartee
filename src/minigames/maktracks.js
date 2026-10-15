/* mak.Tracks — a hardware-sampler-style 16-step sequencer + sampler. Chop Lou's 1993 white label ("NYC 93"),
   program kick / clap / hat / open hat / bass / chord stab / SAMPLE rows, arrange 8 bars
   (intro / build / drop / break / outro), keep Lou happy and make the drop hit. Everything is synthesized with
   Web Audio (no audio files): every "slice" of the record is a distinct synthesized phrase seeded from the record id.

   Params (all optional):
     { sample: recordId  (default "white_nyc93"),  bpm  (default: the record's bpm),  genre (swing flavor),
       difficulty: 1..5  (goals get tougher and MORE SOUNDS are available: 1 = starter kit, 5 = everything),
       collab: "Lou"  (default Lou when sampling the white label; any other value = no collaborator on screen),
       seed, arcade }
   Result: { ok, score (0..100), track: { name, bpm, pattern, sample, goals: "3/5", energy: [8 bars 0..100], lou: 0..100 } }
     ok     score >= 55 (a track worth releasing on Pipe Hole Records).
     track.pattern = { steps: 16, rows: {kick, clap, hat, ohat, bass, chord, sample: [16 ints]}, voices: {row: voiceId},
                       arrangement: [8 section ids], layers: [8][7 booleans], swing }
     Giving up resolves { ok: false, score: 0, track: null }.
   Keys (grid): arrows move, SPACE toggles the step, 1-8 pick a note/chord/slice for that row (and place it),
   BACKSPACE clears, M / S mute / solo the row, P play-stop, [ ] BPM. */
(function () {
"use strict";
const RP = window.RP;
const { el, clamp, mulberry, hashStr, R, P, ell, bayer, ramp, txt, txtC, txtW, mix } = RP.u;

/* ------------------------------------------------------------------ constants */
const STEPS = 16, BARS = 8;
const ROWS = [
  { id: "kick", name: "KICK", col: "#ff3fa4", kind: "drum" },
  { id: "clap", name: "CLAP", col: "#ffc44d", kind: "drum" },
  { id: "hat", name: "HAT", col: "#39d0ff", kind: "drum" },
  { id: "ohat", name: "OPEN HAT", short: "O.HAT", col: "#9be15d", kind: "drum" },
  { id: "bass", name: "BASS", col: "#a77bff", kind: "note" },
  { id: "chord", name: "CHORD", col: "#ff8a4a", kind: "note" },
  { id: "sample", name: "SAMPLE", col: "#f4f0ff", kind: "slice" }
];
const RID = ROWS.map(r => r.id);
/* voices: tier = the difficulty at which it is in the starter bank; the rest unlock as you complete goals */
const VOICES = {
  kick: [{ id: "808", name: "808 SUB", tier: 1 }, { id: "909", name: "909 PUNCH", tier: 2 }, { id: "hard", name: "HARD", tier: 4 }],
  clap: [{ id: "clap", name: "CLAP", tier: 1 }, { id: "snare", name: "SNARE", tier: 2 }, { id: "rim", name: "RIM", tier: 3 }],
  hat: [{ id: "hat", name: "CLOSED", tier: 1 }, { id: "shaker", name: "SHAKER", tier: 3 }, { id: "tick", name: "TICK", tier: 5 }],
  ohat: [{ id: "open", name: "OPEN", tier: 1 }, { id: "ride", name: "RIDE", tier: 4 }],
  bass: [{ id: "sub", name: "SUB", tier: 1 }, { id: "saw", name: "SAW", tier: 2 }, { id: "square", name: "SQUARE", tier: 3 }, { id: "acid", name: "ACID", tier: 4 }],
  chord: [{ id: "epiano", name: "E.PIANO", tier: 1 }, { id: "organ", name: "ORGAN", tier: 2 }, { id: "stab", name: "STAB", tier: 3 }, { id: "pad", name: "PAD", tier: 5 }]
};
const SLICE_TIER = [1, 1, 1, 1, 2, 2, 3, 3];            // slice n is in the starter bank at this difficulty
const SECS = {
  intro: { name: "INTRO", col: "#39d0ff", layers: ["hat", "chord", "sample"], f: [0.45, 0.5] },
  build: { name: "BUILD", col: "#ffc44d", layers: ["kick", "clap", "hat", "ohat", "chord", "sample"], f: [0.6, 1] },
  drop: { name: "DROP", col: "#ff3fa4", layers: RID.slice(), f: [1, 1] },
  break: { name: "BREAK", col: "#a77bff", layers: ["chord", "sample"], f: [0.55, 0.55] },
  outro: { name: "OUTRO", col: "#9be15d", layers: ["kick", "hat", "bass"], f: [0.8, 0.7] }
};
const SEC_ORDER = ["intro", "build", "drop", "break", "outro"];
const DEFAULT_ARR = ["intro", "intro", "build", "build", "drop", "drop", "break", "outro"];
const W_ROW = { kick: 0.24, bass: 0.18, clap: 0.08, hat: 0.08, ohat: 0.08, chord: 0.10, sample: 0.12 };
const W_FILT = 0.12;
const FILL = { kick: 4, clap: 2, hat: 8, ohat: 3, bass: 5, chord: 3, sample: 4 };
const NOTE_DEG = [0, 3, 5, 10];                          // bass 1-4 = i, bIII, iv, bVII
const CHORDS = [[0, 3, 7, 10], [3, 7, 10, 14], [5, 8, 12, 15], [10, 14, 17, 21]];  // i7, bIII, iv7, bVII
const CHORD_NAME = ["i", "III", "iv", "VII"];
const SWING = { garage: 0.14, house: 0.06, "deep house": 0.1, techno: 0, "hip-hop": 0.18, disco: 0.04, boogie: 0.1, breaks: 0.12 };
const TIER_GOALS = {
  drop: [55, 62, 70, 76, 82], jump: [16, 20, 22, 25, 28], taste: [50, 58, 65, 72, 78], chop: [2, 3, 3, 4, 4], build: [10, 12, 14, 16, 20]
};
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteName = m => NOTE_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

/* ------------------------------------------------------------------ sample slices (synthesized, seeded from the record id) */
const SLICE_TYPES = ["keys", "vox", "organ", "brass", "strings", "pluck", "bell", "breath"];
const TYPE_NAME = { keys: "KEYS", vox: "VOX", organ: "ORGAN", brass: "HORN", strings: "STRINGS", pluck: "PLUCK", bell: "BELL", breath: "BREATH" };
const VOWELS = { ah: [800, 1150, 2900], oh: [450, 800, 2830], ee: [300, 2300, 3000], oo: [325, 700, 2530] };
function makeSlices(rec) {
  const rnd = mulberry(hashStr(rec.id || "sample"));
  const root = 38 + (hashStr(rec.id || "sample") % 12);                 // D2..C#3
  const types = SLICE_TYPES.slice();
  for (let i = types.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [types[i], types[j]] = [types[j], types[i]]; }
  const lead = types.findIndex(t => t === "keys" || t === "vox" || t === "organ");   // the hook is something melodic
  [types[0], types[lead]] = [types[lead], types[0]];
  const pool = [0, 3, 7, 10, 12, 15, 17, 19];
  const slices = types.map((type, i) => {
    const nn = type === "pluck" ? 4 : type === "bell" ? 2 : type === "breath" ? 0 : type === "vox" ? 1 : 3;
    const start = Math.floor(rnd() * 4);
    const notes = []; for (let k = 0; k < nn; k++) notes.push(root + 24 + pool[(start + k * (type === "pluck" ? 1 : 2) + Math.floor(rnd() * 2)) % pool.length]);
    if (type === "keys" || type === "organ" || type === "strings") { notes.sort((a, b) => a - b); }
    return {
      i, type, notes, len: type === "strings" ? 4 : type === "breath" ? 3 : type === "bell" ? 4 : type === "pluck" ? 2 : type === "vox" ? 3 : 2 + Math.floor(rnd() * 2),
      vowel: ["ah", "oh", "ee", "oo"][Math.floor(rnd() * 4)], glide: (rnd() < 0.5 ? 1 : -1) * (1 + Math.floor(rnd() * 2)), bright: 0.5 + rnd() * 0.5,
      label: i === 0 ? "HOOK" : TYPE_NAME[type], seed: Math.floor(rnd() * 1e6)
    };
  });
  return { root, slices };
}
function shapeOf(sp) {         // 24 bar heights (0..1) for the pad thumbnail
  const rnd = mulberry(sp.seed || 1), n = 24, out = [];
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1); let v;
    if (sp.type === "keys") v = Math.pow(1 - t, 1.4) * (0.7 + 0.3 * Math.abs(Math.sin(t * 21)));
    else if (sp.type === "vox") v = Math.sin(Math.PI * Math.pow(t, 0.7)) * (0.7 + 0.3 * Math.sin(t * 34));
    else if (sp.type === "organ") v = (t < 0.1 ? t * 10 : t > 0.85 ? (1 - t) / 0.15 : 1) * (0.8 + 0.2 * Math.sin(t * 40));
    else if (sp.type === "brass") v = (t < 0.12 ? t / 0.12 : Math.pow(1 - t, 0.8)) * (0.85 + 0.15 * Math.sin(t * 17));
    else if (sp.type === "strings") v = Math.sin(Math.PI * Math.pow(t, 0.9)) * 0.9;
    else if (sp.type === "pluck") v = Math.pow(1 - ((t * 4) % 1), 1.6) * (1 - t * 0.5);
    else if (sp.type === "bell") v = Math.pow(1 - t, 2) * (0.8 + 0.2 * Math.sin(t * 60));
    else v = Math.pow(t, 1.5) * (0.5 + 0.5 * rnd());
    out.push(clamp(v * (0.85 + rnd() * 0.15), 0.06, 1));
  }
  return out;
}

/* ------------------------------------------------------------------ audio engine */
const midi = n => 440 * Math.pow(2, (n - 69) / 12);
function makeEngine() {
  let AC = null;
  try { AC = RP.audio && RP.audio.ctx && RP.audio.ctx(); } catch (e) { AC = null; }
  const E = { AC, live: false };
  if (!AC) return E;
  try {
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.18;
    const master = AC.createGain(); master.gain.value = 0.9;
    const filt = AC.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 20000; filt.Q.value = 0.9;
    filt.connect(comp); comp.connect(master); master.connect(AC.destination);
    const nb = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    Object.assign(E, { comp, master, filt, nb, live: true, bus: null });
    E.newBus = () => {
      if (E.bus) { const old = E.bus; try { old.gain.setTargetAtTime(0.0001, AC.currentTime, 0.02); } catch (e) { /* ignore */ } setTimeout(() => { try { old.disconnect(); } catch (e) { /* ignore */ } }, 400); }
      E.bus = AC.createGain(); E.bus.gain.value = 1; E.bus.connect(filt); return E.bus;
    };
    E.newBus();
    E.dispose = () => { try { master.gain.setTargetAtTime(0.0001, AC.currentTime, 0.03); } catch (e) { /* ignore */ } setTimeout(() => { try { master.disconnect(); filt.disconnect(); comp.disconnect(); if (E.bus) E.bus.disconnect(); } catch (e) { /* ignore */ } }, 400); };
  } catch (e) { E.live = false; }
  return E;
}
const audible = () => !RP.audio.muted;
function tone(E, t, type, f0, f1, peak, a, d, dest) {
  const AC = E.AC, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + a + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  o.connect(g); g.connect(dest || E.bus); o.start(t); o.stop(t + a + d + 0.03); return { o, g };
}
function noiz(E, t, type, freq, vol, len, q, dest) {
  const AC = E.AC, s = AC.createBufferSource(); s.buffer = E.nb; s.playbackRate.value = 0.9 + Math.random() * 0.2;
  const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 1;
  const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  s.connect(f); f.connect(g); g.connect(dest || E.bus); s.start(t, Math.random() * 0.5); s.stop(t + len + 0.03); return { f, g };
}
const DRUM = {
  kick: {
    "808": (E, t, v) => { tone(E, t, "sine", 120, 40, v, 0.003, 0.55); noiz(E, t, "highpass", 2500, v * 0.12, 0.01); },
    "909": (E, t, v) => { tone(E, t, "sine", 165, 46, v, 0.002, 0.3); noiz(E, t, "highpass", 3500, v * 0.2, 0.012); },
    hard: (E, t, v) => { tone(E, t, "sine", 230, 50, v, 0.001, 0.24); tone(E, t, "triangle", 120, 45, v * 0.5, 0.001, 0.18); noiz(E, t, "highpass", 2000, v * 0.3, 0.02); }
  },
  clap: {
    clap: (E, t, v) => { if (!audible()) return; RP.audio.drums.clap(t, E.bus, v * 0.6); },
    snare: (E, t, v) => { if (!audible()) return; RP.audio.drums.snare(t, E.bus, v * 0.7); },
    rim: (E, t, v) => { tone(E, t, "square", 1750, 0, v * 0.22, 0.001, 0.03); noiz(E, t, "bandpass", 2600, v * 0.18, 0.025, 3); }
  },
  hat: {
    hat: (E, t, v) => { if (!audible()) return; RP.audio.drums.hat(t, E.bus, v * 0.22, false); },
    shaker: (E, t, v) => { noiz(E, t, "bandpass", 6200, v * 0.14, 0.07, 2); },
    tick: (E, t, v) => { tone(E, t, "square", 4200, 0, v * 0.07, 0.001, 0.02); }
  },
  ohat: {
    open: (E, t, v) => { if (!audible()) return; RP.audio.drums.hat(t, E.bus, v * 0.18, true); },
    ride: (E, t, v) => { [263, 400, 421, 474, 587, 845].forEach(f => tone(E, t, "square", f * 4.1, 0, v * 0.018, 0.001, 0.38)); noiz(E, t, "highpass", 9000, v * 0.1, 0.3); }
  }
};
function bassNote(E, voice, note, t, len, v) {
  const AC = E.AC, f = midi(note);
  if (voice === "sub") { tone(E, t, "sine", f, 0, v * 0.9, 0.006, len); tone(E, t, "triangle", f * 2, 0, v * 0.12, 0.006, len * 0.5); return; }
  const o = AC.createOscillator(), fl = AC.createBiquadFilter(), g = AC.createGain();
  o.type = voice === "square" ? "square" : "sawtooth"; o.frequency.setValueAtTime(f, t);
  fl.type = "lowpass"; fl.Q.value = voice === "acid" ? 13 : 2.5;
  const c0 = voice === "acid" ? 2600 : voice === "square" ? 1100 : 1600;
  fl.frequency.setValueAtTime(c0, t); fl.frequency.exponentialRampToValueAtTime(voice === "acid" ? 260 : 340, t + len * 0.9);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * (voice === "acid" ? 0.5 : 0.55), t + 0.008); g.gain.setValueAtTime(v * 0.5, t + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(fl); fl.connect(g); g.connect(E.bus); o.start(t); o.stop(t + len + 0.03);
}
function chordHit(E, voice, notes, t, len, v) {
  const AC = E.AC;
  if (voice === "epiano") { notes.forEach(n => { tone(E, t, "triangle", midi(n), 0, v * 0.2, 0.004, len * 1.4); tone(E, t, "sine", midi(n + 12), 0, v * 0.07, 0.002, len * 0.6); }); return; }
  const fl = AC.createBiquadFilter(), g = AC.createGain();
  fl.type = "lowpass"; fl.Q.value = 1; fl.frequency.value = voice === "stab" ? 2200 : voice === "pad" ? 1400 : 1800;
  if (voice === "pad") { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.16, t + len * 0.35); g.gain.linearRampToValueAtTime(0.0001, t + len * 1.1); }
  else if (voice === "stab") { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.22, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.min(0.3, len)); }
  else { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.17, t + 0.01); g.gain.setValueAtTime(v * 0.15, t + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + len); }
  fl.connect(g); g.connect(E.bus);
  const end = t + (voice === "pad" ? len * 1.15 : len) + 0.05;
  notes.forEach(n => [-6, 6].forEach(det => { const o = AC.createOscillator(); o.type = voice === "organ" ? "square" : "sawtooth"; o.frequency.value = midi(n); o.detune.value = det; o.connect(fl); o.start(t); o.stop(end); }));
}
function playSlice(E, sp, t, v, sd) {
  const AC = E.AC, len = sp.len * sd;
  if (sp.type === "keys") { sp.notes.forEach((n, k) => { tone(E, t + k * 0.012, "triangle", midi(n), 0, v * 0.2, 0.003, len * 1.6); tone(E, t + k * 0.012, "sine", midi(n + 12), 0, v * 0.08, 0.002, len * 0.7); tone(E, t, "square", midi(n), 0, v * 0.03, 0.001, 0.05); }); return; }
  if (sp.type === "bell") { sp.notes.forEach((n, k) => { const f = midi(n + 12); tone(E, t + k * sd * 0.5, "sine", f, 0, v * 0.18, 0.002, len * 1.4); tone(E, t + k * sd * 0.5, "sine", f * 3.51, 0, v * 0.07, 0.002, len * 0.5); }); return; }
  if (sp.type === "pluck") { sp.notes.forEach((n, k) => { const tt = t + k * sd * 0.5; tone(E, tt, "triangle", midi(n), 0, v * 0.2, 0.002, sd * 0.9); noiz(E, tt, "bandpass", midi(n) * 3, v * 0.04, 0.03, 2); }); return; }
  if (sp.type === "breath") { const n = noiz(E, t, "bandpass", 500, v * 0.35, len * 1.1, 2.5); n.f.frequency.setValueAtTime(400, t); n.f.frequency.exponentialRampToValueAtTime(3600, t + len); return; }
  const fl = AC.createBiquadFilter(), g = AC.createGain();
  if (sp.type === "vox") {
    const vw = VOWELS[sp.vowel], mixg = AC.createGain(); mixg.gain.value = 1;
    const o = AC.createOscillator(); o.type = "sawtooth"; const f = midi(sp.notes[0] || 60);
    o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * Math.pow(2, sp.glide / 12), t + len * 0.5); o.frequency.linearRampToValueAtTime(f, t + len);
    const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = 5.5; lg.gain.value = 9; l.connect(lg); lg.connect(o.detune); l.start(t); l.stop(t + len + 0.1);
    vw.forEach((fq, k) => { const b = AC.createBiquadFilter(); b.type = "bandpass"; b.frequency.value = fq; b.Q.value = 7 + k * 2; const bg = AC.createGain(); bg.gain.value = [1, 0.7, 0.35][k]; o.connect(b); b.connect(bg); bg.connect(mixg); });
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.5, t + len * 0.18); g.gain.setValueAtTime(v * 0.45, t + len * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + len * 1.05);
    mixg.connect(g); g.connect(E.bus); o.start(t); o.stop(t + len * 1.1 + 0.05); return;
  }
  fl.type = "lowpass"; fl.Q.value = 1.2;
  let a = 0.01, tail = 1.2, sustain = 0.8, ftop = 2400 * sp.bright + 600;
  if (sp.type === "strings") { a = len * 0.35; tail = 1.1; sustain = 0.9; ftop = 2200; }
  if (sp.type === "brass") { a = 0.025; tail = 0.9; ftop = 3600; fl.frequency.setValueAtTime(500, t); fl.frequency.linearRampToValueAtTime(ftop, t + 0.08); fl.frequency.linearRampToValueAtTime(1300, t + len); }
  else fl.frequency.value = ftop;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * (sp.type === "strings" ? 0.17 : 0.2), t + a); g.gain.setValueAtTime(v * 0.17 * sustain, t + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + len * tail);
  fl.connect(g); g.connect(E.bus);
  sp.notes.forEach(n => [-7, 7].forEach(det => { const o = AC.createOscillator(); o.type = sp.type === "organ" ? "square" : "sawtooth"; o.frequency.value = midi(n); o.detune.value = det; o.connect(fl); o.start(t); o.stop(t + len * tail + 0.05); }));
}
function riser(E, t, dur, v) { const n = noiz(E, t, "bandpass", 300, 0.0008, dur, 3); n.f.frequency.setValueAtTime(300, t); n.f.frequency.exponentialRampToValueAtTime(7000, t + dur); n.g.gain.cancelScheduledValues(t); n.g.gain.setValueAtTime(0.0008, t); n.g.gain.exponentialRampToValueAtTime(v * 0.35, t + dur * 0.97); n.g.gain.linearRampToValueAtTime(0.0001, t + dur); }
function impact(E, t, v) { tone(E, t, "sine", 70, 28, v * 0.9, 0.003, 0.9); const n = noiz(E, t, "lowpass", 4000, v * 0.5, 1.1, 1); n.f.frequency.exponentialRampToValueAtTime(200, t + 1); }

/* ------------------------------------------------------------------ studio art (Lou's place) */
let studioCache = null;
function studioBG() {
  if (studioCache) return studioCache;
  const cv = RP.u.mk(320, 130), c = cv.getContext("2d");
  const rnd = mulberry(404);
  const wl = ramp("#3a2c62");
  // wallpaper with pinstripes, dithered toward the ceiling
  for (let y = 0; y < 98; y++) for (let x = 0; x < 320; x++) { const stripe = (x % 12) < 2; const t = y / 98; const lv = stripe ? 2 : 1; P(c, x, y, wl[bayer(x, y) / 16 < (1 - t) * 0.55 ? Math.max(0, lv - 1) : lv]); }
  for (let i = 0; i < 90; i++) P(c, rnd() * 320, rnd() * 96, wl[3]);
  R(c, 0, 96, 320, 5, "#1c1230"); R(c, 0, 96, 320, 1, "#5a4690");
  // floor
  const fl = ramp("#6a4430");
  for (let y = 101; y < 130; y++) { R(c, 0, y, 320, 1, fl[(y % 6) < 1 ? 1 : 2]); }
  for (let y = 101; y < 130; y += 6) { R(c, 0, y, 320, 1, fl[0]); for (let x = (y % 12) * 3; x < 320; x += 46 + (y % 5) * 3) R(c, x, y, 1, 6, fl[0]); }
  for (let i = 0; i < 160; i++) P(c, rnd() * 320, 101 + rnd() * 29, fl[rnd() < 0.5 ? 1 : 3]);
  // rug
  ell(c, 150, 118, 96, 9, "#3a1a3e"); ell(c, 150, 117, 94, 8, "#7a1f5a"); ell(c, 150, 117, 80, 6, "#a02878"); ell(c, 150, 117, 62, 4, "#7a1f5a");
  for (let a = 0; a < 40; a++) P(c, 150 + Math.cos(a / 40 * 6.28) * 90, 117 + Math.sin(a / 40 * 6.28) * 7, "#ffc44d");
  // pipe hole + pipe (Lou talks through it)
  ell(c, 24, 74, 8, 8, "#0a0612"); ell(c, 24, 74, 6, 6, "#000"); ring(c, 24, 74, 8, "#6a5a90");
  R(c, 0, 70, 20, 8, "#8a5a2a"); R(c, 0, 70, 20, 2, "#e0a860"); R(c, 0, 76, 20, 2, "#5a3a18"); R(c, 17, 68, 4, 12, "#c8803a"); R(c, 17, 68, 4, 1, "#ffe0a0");
  txt(c, "4B", 5, 81, "#8a7ac0", 1);
  // neon sign
  R(c, 56, 8, 112, 34, "#14091e"); R(c, 56, 8, 112, 1, "#3a2f78"); R(c, 56, 41, 112, 1, "#0a0412");
  txtC(c, "PIPE HOLE", 112, 13, "#ff3fa4", 2, 1); txtC(c, "PIPE HOLE", 112, 14, "#7a1040", 2, 1); txtC(c, "PIPE HOLE", 112, 13, "#ff8fcf", 2, 1);
  txtC(c, "RECORDS", 112, 29, "#39d0ff", 2, 1);
  for (let y = 4; y < 46; y++) for (let x = 50; x < 174; x++) { const dx = Math.max(56 - x, 0, x - 168), dy = Math.max(8 - y, 0, y - 42), d = Math.hypot(dx, dy); if (d > 0 && d < 6 && bayer(x, y) < (6 - d) * 1.0) P(c, x, y, "#ff3fa4"); }
  // poster + flyers
  R(c, 232, 14, 30, 42, "#efe6d0"); R(c, 232, 14, 30, 1, "#fff"); R(c, 232, 55, 30, 1, "#b8a888"); txtC(c, "SAT", 247, 18, "#c0302c", 1); txtC(c, "1993", 247, 26, "#1d1622", 2, 1); txtC(c, "NYC", 247, 40, "#1d1622", 1); R(c, 238, 48, 18, 2, "#c0302c");
  R(c, 196, 20, 24, 18, "#1b1440"); txtC(c, "NO", 208, 23, "#ff3fa4", 1); txtC(c, "WHERE", 208, 30, "#39d0ff", 1);
  // speakers
  [[6], [282]].forEach(([x]) => {
    const cab = ramp("#24202e");
    R(c, x, 40, 32, 58, cab[2]); R(c, x, 40, 32, 2, cab[4]); R(c, x, 40, 1, 58, cab[3]); R(c, x + 31, 40, 1, 58, cab[1]); R(c, x, 96, 32, 2, cab[0]);
    R(c, x + 3, 43, 26, 52, cab[1]);
    ell(c, x + 16, 52, 6, 6, "#c8c4d8"); ell(c, x + 16, 52, 5, 5, "#16141e");
  });
  // desk
  const dk = ramp("#7a5236");
  R(c, 58, 84, 150, 5, dk[3]); R(c, 58, 84, 150, 1, dk[4]); R(c, 58, 89, 150, 2, dk[0]);
  R(c, 62, 91, 4, 9, dk[1]); R(c, 200, 91, 4, 9, dk[1]); R(c, 62, 91, 1, 9, dk[3]);
  // laptop base + mug + headphones + sleeve
  R(c, 84, 79, 40, 5, "#8a86a0"); R(c, 84, 79, 40, 1, "#c8c4d8"); R(c, 84, 83, 40, 1, "#4a4658");
  R(c, 172, 76, 7, 8, "#efeaf6"); R(c, 172, 76, 7, 1, "#fff"); R(c, 179, 78, 2, 4, "#c8c4d8"); P(c, 174, 74, "#c8c4d8"); P(c, 176, 73, "#c8c4d8");
  ring(c, 150, 80, 8, 6, "#1c1a24", Math.PI, Math.PI * 2); R(c, 141, 80, 4, 4, "#2a2634"); R(c, 155, 80, 4, 4, "#2a2634");
  R(c, 190, 74, 14, 10, "#efe6d0"); R(c, 190, 74, 14, 1, "#fff"); ell(c, 197, 79, 3, 3, "#d8d0c0");
  studioCache = cv;
  return cv;
}
function ring(c, cx, cy, r, col) { for (let a = 0; a < 48; a++) P(c, cx + Math.cos(a / 48 * 6.283) * r, cy + Math.sin(a / 48 * 6.283) * r, col); }

/* ------------------------------------------------------------------ css */
const CSS = `
.mg-makTracks .mg-wrap { margin-block: 0 auto; width: min(1060px, 100%); }
.mt-wrap { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.mg-head.mt-head { align-items: center; }
.mt-head .mt-leave { font-size: 18px; padding: 2px 12px; }
.mt-head .btn.primary { font-size: 18px; padding: 2px 12px; margin-left: auto; }
.mt-bfin { display: none; font-size: 20px; }
.mt-cols { display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 10px; align-items: start; }
.mt-col { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.mt-box { background: #120e24; border: 1px solid var(--line); border-radius: 4px; padding: 8px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.mt-h { font-size: 17px; color: var(--muted); letter-spacing: .08em; display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.mt-h b { color: var(--fg); font-weight: 400; }
.mt-machine { position: relative; background: linear-gradient(#1d1738, #120e24); border: 2px solid #3a2f78; box-shadow: 0 0 0 2px #120a2c, 0 6px 0 #000; border-radius: 4px; padding: 8px; display: grid; grid-template-columns: minmax(260px, 340px) minmax(0, 1fr); gap: 8px; align-items: center; }
.mt-machine > .mt-grid { grid-column: 1 / -1; }

.mt-lcdwrap { border: 3px solid #0a0716; background: #0a1a14; box-shadow: inset 0 0 0 1px #2a4a3a; line-height: 0; }
.mt-lcdwrap canvas { width: 100%; height: auto; display: block; image-rendering: pixelated; image-rendering: crisp-edges; aspect-ratio: 160 / 28; }
.mt-trans { display: flex; flex-wrap: wrap; gap: 6px 8px; align-items: center; justify-content: flex-end; }
.mt-trans .btn { font-size: 20px; padding: 5px 12px; }
.mt-trans .lg { }
.mt-trans .btn.on { background: var(--ok); border-color: var(--ok); color: #06180e; }
.mt-bpm { display: flex; align-items: center; gap: 6px; font-size: 18px; color: var(--muted); }
.mt-bpm input[type=range] { width: 110px; accent-color: var(--pink); }
.mt-bpm .kbtn { min-width: 32px; padding: 3px 6px; }
.mt-hint { font-size: 19px; color: var(--cyan); min-height: 1.1em; }
.mt-grid { display: grid; grid-template-columns: 124px repeat(16, minmax(0, 1fr)); grid-template-rows: 18px repeat(7, 32px); gap: 3px; position: relative; }
.mt-num { grid-row: 1; grid-column: calc(var(--si) + 2); font-size: 13px; text-align: center; color: #6a5fa8; line-height: 18px; background: #0f0b20; border: 1px solid #241d48; }
.mt-num.b { color: #b7aaf0; }
.mt-num.play { background: var(--cyan); color: #12061a; border-color: var(--cyan); }
.mt-rh { grid-column: 1; grid-row: calc(var(--ri) + 2); display: flex; align-items: center; gap: 4px; background: #0f0b20; border: 1px solid #241d48; padding: 0 3px; min-width: 0; }
.mt-rh .led { width: 8px; height: 8px; flex: none; background: #2a2234; }
.mt-rh .led.on { background: var(--rc); box-shadow: 0 0 6px var(--rc); }
.mt-rh .nm { flex: 1; text-align: left; background: none; border: 0; color: var(--rc); font-size: 17px; padding: 0 2px; cursor: pointer; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: .03em; }
.mt-rh .nm small { display: block; font-size: 12px; color: var(--muted); line-height: 1; margin-top: -2px; overflow: hidden; text-overflow: ellipsis; }
.mt-rh.armed { border-color: var(--rc); box-shadow: inset 0 0 0 1px var(--rc); }
.mt-rh .ms { width: 20px; height: 22px; flex: none; font-size: 14px; padding: 0; background: #1a1534; color: var(--muted); border: 1px solid #3a3070; cursor: pointer; }
.mt-rh .ms.on { background: var(--amber); color: #12061a; border-color: var(--amber); }
.mt-rh .ms.s.on { background: var(--cyan); border-color: var(--cyan); }
.mt-step { grid-column: calc(var(--si) + 2); grid-row: calc(var(--ri) + 2); background: #1a1534; border: 2px solid; border-color: #2e2660 #0a0716 #0a0716 #2e2660; padding: 0; font: 16px var(--ui); color: #12061a; cursor: pointer; min-width: 0; line-height: 1; touch-action: manipulation; }
.mt-step.g { background: #211a44; }
.mt-step.b4 { margin-left: 5px; }
.mt-step.on { background: var(--rc); border-color: var(--rl) var(--rd) var(--rd) var(--rl); box-shadow: inset 2px 2px 0 rgba(255, 255, 255, .28); }
.mt-step.play { box-shadow: 0 0 0 2px rgba(98, 230, 255, .8); z-index: 1; }
.mt-step.on.play { box-shadow: inset 2px 2px 0 rgba(255, 255, 255, .5), 0 0 0 2px rgba(98, 230, 255, .8); filter: brightness(1.25); }
.mt-step:focus-visible { outline: 2px solid #fff; outline-offset: 0; z-index: 2; }
.mt-step.dim { opacity: .45; }
.mt-pads { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 5px; }
.mt-pad { position: relative; background: #1a1534; border: 2px solid; border-color: #3a3070 #0a0716 #0a0716 #3a3070; padding: 3px 3px 2px; cursor: pointer; display: flex; flex-direction: column; align-items: stretch; gap: 1px; color: var(--fg); font-size: 15px; line-height: 1; min-width: 0; }
.mt-pad canvas { width: 100%; height: auto; image-rendering: pixelated; image-rendering: crisp-edges; display: block; aspect-ratio: 28 / 14; background: #0a0816; }
.mt-pad .l { display: flex; justify-content: space-between; gap: 2px; color: var(--muted); }
.mt-pad .l b { font-weight: 400; color: var(--fg); }
.mt-pad.sel { border-color: #fff var(--rc) var(--rc) #fff; background: #2a2050; }
.mt-pad.hit { background: var(--pink); }
.mt-pad.lock { opacity: .4; cursor: default; }
.mt-pad.lock::after { content: "LOCKED"; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; color: var(--amber); background: rgba(10, 8, 22, .6); }
.mt-bank { display: flex; flex-wrap: wrap; gap: 5px; }
.mt-bank .grp { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
.mt-bank .gl { font-size: 15px; color: var(--muted); letter-spacing: .06em; margin-right: 2px; }
.mt-vb { font-size: 17px; padding: 4px 9px; background: #1a1534; border: 2px solid; border-color: #3a3070 #0a0716 #0a0716 #3a3070; color: var(--fg); cursor: pointer; line-height: 1; }
.mt-vb.sel { background: var(--rc); color: #12061a; border-color: var(--rl) var(--rd) var(--rd) var(--rl); }
.mt-vb.lock { opacity: .45; cursor: default; }
.mt-vb.new { animation: mtnew .7s steps(2) 3; }
@keyframes mtnew { 50% { background: var(--amber); color: #12061a; } }
.mt-studio { border: 2px solid #3a2f78; box-shadow: 0 0 0 2px #120a2c, 0 5px 0 #000; line-height: 0; background: #05030a; }
.mt-studio canvas { width: 100%; height: auto; display: block; image-rendering: pixelated; image-rendering: crisp-edges; aspect-ratio: 320 / 130; }
.mt-lou { font-size: 20px; line-height: 1.05; color: #9be15d; min-height: 42px; }
.mt-lou b { font-weight: 400; color: var(--amber); }
.mt-hearts { display: flex; align-items: center; gap: 4px; font-size: 17px; color: var(--muted); }
.mt-hearts .hp { display: flex; gap: 2px; flex: 1; }
.mt-hearts .hp i { flex: 1; height: 12px; background: #1a1534; border: 1px solid #2d2456; }
.mt-hearts .hp i.on { background: var(--pink); } .mt-hearts .hp i.hi { background: var(--ok); }
.mt-goals { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.mt-goals li { display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; gap: 6px; align-items: start; font-size: 18px; line-height: 1.02; color: var(--muted); }
.mt-goals li::before { content: "[ ]"; color: var(--muted); }
.mt-goals li.y { color: var(--fg); } .mt-goals li.y::before { content: "[x]"; color: var(--ok); }
.mt-goals li small { font-size: 15px; color: var(--muted); white-space: nowrap; }
.mt-goals li.y small { color: var(--ok); }
.mt-arr { display: grid; grid-template-columns: 38px repeat(8, minmax(0, 1fr)); gap: 3px; align-items: stretch; }
.mt-arr .rl { font-size: 12px; color: var(--muted); display: flex; align-items: center; justify-content: flex-end; padding-right: 2px; }
.mt-sec { font-size: 13px; padding: 3px 0; border: 2px solid; border-color: var(--sc) #0a0716 #0a0716 var(--sc); background: #1a1534; color: var(--sc); cursor: pointer; line-height: 1; min-width: 0; overflow: hidden; }
.mt-sec.play { background: var(--sc); color: #12061a; }
.mt-em { position: relative; height: 54px; display: flex; flex-direction: column-reverse; gap: 1px; background: #0a0816; border: 1px solid #241d48; padding: 1px; cursor: pointer; }
.mt-em i { flex: 1; background: #1a1534; }
.mt-em i.on { background: var(--ec); }
.mt-em.play { box-shadow: 0 0 0 2px rgba(98, 230, 255, .8); z-index: 1; }
.mt-em .tl { position: absolute; left: 0; right: 0; height: 0; border-top: 2px dotted #fff; opacity: .7; pointer-events: none; }
.mt-ly { height: 12px; background: #1a1534; border: 1px solid #2d2456; padding: 0; cursor: pointer; min-width: 0; }
.mt-ly.on { background: var(--lc); border-color: var(--lc); }
.mt-ly.play { box-shadow: 0 0 0 1px rgba(98, 230, 255, .8); }
.mt-arr .elbl { font-size: 12px; color: var(--muted); display: flex; align-items: flex-end; justify-content: flex-end; padding: 0 2px 2px 0; }
.mt-modal { position: fixed; inset: 0; z-index: 40; background: rgba(5, 3, 10, .86); display: flex; align-items: center; justify-content: center; padding: 16px; }
.mt-card { width: min(560px, 100%); background: #120e24; border: 2px solid var(--pink); padding: 14px; display: flex; flex-direction: column; gap: 10px; max-height: 100%; overflow: auto; }
.mt-card h2 { font-family: var(--logo); font-weight: 400; font-size: clamp(15px, 3.4vw, 22px); margin: 0; color: #fff; line-height: 1.2; }
.mt-card p { margin: 0; font-size: 21px; line-height: 1.08; color: #e4ddff; }
.mt-card label { font-size: 18px; color: var(--muted); }
.mt-card input[type=text] { font-family: var(--ui); font-size: 24px; background: #0a0816; color: var(--fg); border: 2px solid var(--line); padding: 4px 8px; width: 100%; box-sizing: border-box; -webkit-user-select: text; user-select: text; }
.mt-card .big { font-size: 56px; color: var(--amber); line-height: 1; text-align: center; }
.mt-card ul { list-style: none; margin: 0; padding: 0; font-size: 19px; color: var(--muted); display: grid; gap: 2px; }
.mt-card ul b { font-weight: 400; color: var(--fg); }
.mt-card .row { justify-content: flex-end; }
.mt-card canvas { width: 100%; image-rendering: pixelated; image-rendering: crisp-edges; border: 2px solid #3a2f78; aspect-ratio: 320 / 130; }
.mt-toast { position: absolute; left: 50%; top: 6px; transform: translateX(-50%); background: var(--amber); color: #12061a; font-size: 20px; padding: 3px 12px; z-index: 5; pointer-events: none; border: 2px solid #fff; }
.mt-wrap :focus-visible { outline: 2px solid var(--cyan); outline-offset: 1px; }
@media (max-width: 860px) {
  .mt-head .btn.primary { display: none; }
  .mt-bfin { display: block; }
  .mt-cols { grid-template-columns: minmax(0, 1fr); }
  .mt-machine { grid-template-columns: minmax(0, 1fr); }
  .mt-trans { justify-content: space-between; position: sticky; top: 0; z-index: 6; background: #1a1434; padding: 6px 4px; margin: 0 -4px; border-bottom: 2px solid #3a2f78; flex-wrap: nowrap; gap: 6px; }
  .mt-trans .btn { font-size: 19px; padding: 5px 9px; }
  .mt-trans .lg { display: none; }
  .mt-bpm input[type=range] { display: none; }
  .mt-bpm { gap: 4px; }
  .mt-bfin { width: 100%; }
  .mt-grid { grid-template-columns: 20px repeat(7, minmax(0, 1fr)); grid-template-rows: auto repeat(16, 28px); gap: 3px; }
  .mt-num { grid-row: calc(var(--si) + 2); grid-column: 1; line-height: 28px; font-size: 12px; }
  .mt-rh { grid-column: calc(var(--ri) + 2); grid-row: 1; flex-wrap: wrap; justify-content: center; gap: 1px; padding: 2px; }
  .mt-rh .nm { flex: 1 1 100%; text-align: center; font-size: 15px; letter-spacing: 0; padding: 0; }
  .mt-rh .nm small { display: none; }
  .mt-rh .led { display: none; }
  .mt-rh .ms { width: 17px; height: 20px; font-size: 12px; }
  .mt-step { grid-column: calc(var(--ri) + 2); grid-row: calc(var(--si) + 2); }
  .mt-step.b4 { margin-left: 0; margin-top: 4px; }
  .mt-pads { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) { .mt-vb.new { animation: none; } }
`;
let cssDone = false;

/* ------------------------------------------------------------------ the game */
const defaultPattern = () => ({
  kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  ohat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  bass: [1, 0, 0, 1, 0, 0, 1, 0, 3, 0, 0, 3, 0, 0, 2, 0],
  chord: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 0, 0],
  sample: [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0]
});
const defaultName = () => "NYC 93 (" + ((RP.state && RP.state.name) ? RP.state.name : "YOU") + " Remix)";

RP.mg.register("makTracks", {
  title: "mak.Tracks", order: 9,
  desc: "Chop Lou's 1993 white label into a track. Make the drop hit.",
  auto(params, S) {
    const p = params || {}, rec = RP.rec(p.sample || "white_nyc93");
    const name = ((S && S.name) || (RP.state && RP.state.name) || "YOU");
    const pattern = { steps: STEPS, rows: defaultPattern(), voices: { kick: "808", clap: "clap", hat: "hat", ohat: "open", bass: "sub", chord: "epiano" }, arrangement: DEFAULT_ARR.slice(), layers: DEFAULT_ARR.map(s => RID.map(r => SECS[s].layers.indexOf(r) >= 0)), swing: 0.12 };
    return { ok: true, score: 84, track: { name: (rec.id === "white_nyc93" ? "NYC 93" : rec.title) + " (" + name + " Remix)", bpm: p.bpm || rec.bpm || 120, pattern, sample: rec.id, goals: "4/4", energy: [34, 36, 62, 72, 94, 96, 31, 70], lou: 82 } };
  },

  async play(host, p) {
    p = p || {};
    if (!cssDone) { el("style", { text: CSS }, document.head); cssDone = true; }
    const rec = RP.rec(p.sample || "white_nyc93");
    const diff = clamp(Math.round(p.difficulty || 2), 1, 5);
    const withLou = p.collab != null ? /^lou$/i.test(String(p.collab)) : rec.id === "white_nyc93";
    const origBpm = rec.bpm || 120;
    const genre = p.genre || rec.genre || "garage";
    const kit = makeSlices(rec);
    const reduced = (() => { try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; } })();
    const root = host.root;
    const baseName = rec.id === "white_nyc93" ? "NYC 93" : String(rec.title || "SAMPLE").replace(/\(.*?\)/g, "").replace(/["]/g, "").trim();
    const defName = baseName + " (" + ((RP.state && RP.state.name) ? RP.state.name : "YOU") + " Remix)";

    /* ---------- state ---------- */
    const pat = {}; RID.forEach(r => { pat[r] = new Array(STEPS).fill(0); });
    pat.kick = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];       // a skeleton so there is sound from the first second
    const st = {
      bpm: clamp(Math.round(p.bpm || origBpm), 70, 170), swing: SWING[genre] != null ? SWING[genre] : 0.1, playing: false, mode: "pat", gs: 0, next: 0, t: 0,
      armed: "kick", brush: { bass: 1, chord: 1, sample: 1 }, voice: {}, mute: {}, solo: {},
      arr: DEFAULT_ARR.slice(), layers: [], unlockedVoices: new Set(), unlockedSlices: new Set(), done: false, name: defName,
      goalsDone: {}, queue: [], curStep: -1, curBar: -1, pulse: 0, kickAt: -9, louMsg: "", louT: 0, louFlash: 0, louExpr: "neutral", used: new Set(), lastTaste: 0, rowFlash: {}, padFlash: {}
    };
    RID.forEach(r => { st.voice[r] = (VOICES[r] || [{ id: null }])[0].id; });
    st.layers = st.arr.map(s => RID.map(r => SECS[s].layers.indexOf(r) >= 0));
    // starter bank for this difficulty
    RID.forEach(r => (VOICES[r] || []).forEach(v => { if (v.tier <= diff) st.unlockedVoices.add(r + ":" + v.id); }));
    kit.slices.forEach((s, i) => { if (SLICE_TIER[i] <= diff) st.unlockedSlices.add(i + 1); });
    const lockedList = () => {                       // what the next goals unlock, easiest first
      const a = [];
      RID.forEach(r => (VOICES[r] || []).forEach(v => { if (!st.unlockedVoices.has(r + ":" + v.id)) a.push({ kind: "voice", row: r, id: v.id, name: v.name, tier: v.tier }); }));
      kit.slices.forEach((s, i) => { if (!st.unlockedSlices.has(i + 1)) a.push({ kind: "slice", n: i + 1, name: "SLICE " + (i + 1), tier: SLICE_TIER[i] }); });
      return a.sort((x, y) => x.tier - y.tier);
    };
    const E = makeEngine();
    host.cleanup(() => { try { E.dispose && E.dispose(); } catch (e) { /* ignore */ } });
    const clock = () => (E.live ? E.AC.currentTime : performance.now() / 1000);
    const secOf = b => st.arr[b];
    const origSlice = n => kit.slices[n - 1];

    /* ---------- evaluation: energy curve, Lou's taste, goals ---------- */
    const count = r => pat[r].filter(v => v > 0).length;
    function filtOf(b) {                    // filter openness 0..1 at the start/end of bar b (ramps across a run of the same section)
      const sec = SECS[st.arr[b]]; let a = b, z = b;
      while (a > 0 && st.arr[a - 1] === st.arr[b]) a--; while (z < BARS - 1 && st.arr[z + 1] === st.arr[b]) z++;
      const n = z - a + 1, j = b - a;
      return [sec.f[0] + (sec.f[1] - sec.f[0]) * (j / n), sec.f[0] + (sec.f[1] - sec.f[0]) * ((j + 1) / n)];
    }
    function energy() {
      const out = [];
      for (let b = 0; b < BARS; b++) {
        let e = 0; RID.forEach((r, ri) => { if (st.layers[b][ri]) e += W_ROW[r] * Math.min(1, count(r) / FILL[r]); });
        const f = filtOf(b); e += W_FILT * (f[0] + f[1]) / 2;
        let v = e * 100;
        const sec = st.arr[b];
        if (sec === "build") { let a = b; while (a > 0 && st.arr[a - 1] === "build") a--; let z = b; while (z < BARS - 1 && st.arr[z + 1] === "build") z++; v += 14 * (b - a + 1) / (z - a + 1); }
        if (sec === "drop" && b > 0 && st.arr[b - 1] !== "drop") v += 6;
        out.push(Math.round(clamp(v, 0, 100)));
      }
      return out;
    }
    function taste() {
      const ns = count("sample"), used = new Set(pat.sample.filter(v => v > 0)), dist = used.size;
      const presence = ns === 0 ? 0 : ns <= 2 ? 0.55 : ns === 3 ? 0.85 : ns <= 7 ? 1 : ns <= 10 ? 0.7 : 0.4;
      const variety = dist === 0 ? 0 : dist === 1 ? 0.4 : dist === 2 ? 0.75 : dist <= 4 ? 1 : dist <= 6 ? 0.85 : 0.6;
      const hookAt = pat.sample.findIndex(v => v === 1);
      const hook = hookAt < 0 ? 0.15 : (pat.sample[0] === 1 || pat.sample[8] === 1) ? 1 : 0.7;
      let adj = 0; for (let i = 0; i < STEPS - 1; i++) if (pat.sample[i] > 0 && pat.sample[i + 1] > 0) adj++;
      const space = adj >= 4 ? 0.6 : adj >= 3 ? 0.85 : 1;
      let onKick = 0; for (let i = 0; i < STEPS; i++) if (pat.sample[i] > 0 && pat.kick[i] > 0) onKick++;
      const mud = ns === 0 ? 0 : onKick / ns > 0.99 ? 0.5 : onKick / ns > 0.5 ? 0.75 : 1;      // don't bury the sample under every kick
      const d = Math.abs(st.bpm - origBpm), tempo = d <= 4 ? 1 : d <= 10 ? 0.8 : d <= 18 ? 0.55 : 0.3;
      const sb = st.layers.filter(l => l[RID.indexOf("sample")]).length;
      const arrQ = sb === 0 ? 0.2 : sb <= 2 ? 0.7 : sb <= 7 ? 1 : 0.75;
      const t = 100 * (0.22 * presence + 0.18 * variety + 0.18 * hook + 0.12 * tempo + 0.10 * arrQ + 0.08 * space + 0.12 * mud);
      return { t: Math.round(ns === 0 ? Math.min(t, 12) : t), ns, dist, hookAt, adj, d, sb, onKick, presence, variety, hook, tempo, arrQ, space, mud };
    }
    function goalsEval() {
      const en = energy(), tz = taste();
      const di = diff - 1;
      const drops = []; st.arr.forEach((s, b) => { if (s === "drop") drops.push(b); });
      let dropMin = 0, jump = 0;
      if (drops.length) {
        dropMin = Math.min(...drops.map(b => en[b]));
        const b0 = drops[0], prev = b0 > 0 ? en[b0 - 1] : 0;
        jump = Math.round(drops.reduce((a, b) => a + en[b], 0) / drops.length - prev);
      }
      const kickN = count("kick"), hatN = count("hat"), clapN = count("clap");
      const gGroove = diff <= 1 ? kickN >= 3 && hatN >= 3 : diff === 2 ? kickN >= 4 && hatN >= 4 : kickN >= 4 && clapN >= 2 && hatN >= 6;
      const list = [
        { id: "groove", t: "GET A GROOVE", d: diff <= 1 ? "kick 3+, hats 3+" : diff === 2 ? "kick 4+, hats 4+" : "kick 4+, clap 2+, hats 6+", ok: gGroove, prog: "K" + kickN + " C" + clapN + " H" + hatN },
        { id: "chop", t: "CHOP THE SAMPLE", d: TIER_GOALS.chop[di] + "+ different slices", ok: tz.dist >= TIER_GOALS.chop[di], prog: tz.dist + "/" + TIER_GOALS.chop[di] },
        { id: "drop", t: "MAKE THE DROP HIT", d: "drop energy " + TIER_GOALS.drop[di] + "+, " + TIER_GOALS.jump[di] + "+ above what's before it", ok: drops.length > 0 && dropMin >= TIER_GOALS.drop[di] && jump >= TIER_GOALS.jump[di], prog: drops.length ? dropMin + " / +" + Math.max(0, jump) : "no drop" }
      ];
      if (withLou) list.push({ id: "lou", t: "KEEP LOU HAPPY", d: "Lou's mood " + TIER_GOALS.taste[di] + "%+", ok: tz.t >= TIER_GOALS.taste[di], prog: tz.t + "%" });
      if (diff >= 3) {
        const bi = st.arr.indexOf("build"); let ok = false, rise = 0;
        if (bi >= 0 && drops.length) { let z = bi; while (z < BARS - 1 && st.arr[z + 1] === "build") z++; const before = bi > 0 ? en[bi - 1] : 0; rise = en[z] - before; ok = st.arr[z + 1] === "drop" && rise >= TIER_GOALS.build[di] + 6; }
        list.push({ id: "build", t: "BUILD THE TENSION", d: "a build into the drop, +" + (TIER_GOALS.build[di] + 6) + " lift", ok, prog: bi >= 0 ? "+" + Math.max(0, rise) : "no build" });
      }
      return { en, tz, list, dropMin, jump, drops };
    }
    let ev = null;

    /* ---------- layout ---------- */
    const wrap = el("div", { cls: "mt-wrap" }, root); root.removeChild(wrap);
    const head = host.header("mak.Tracks", withLou ? "Lou's place · remix session" : "Bedroom studio");
    head.classList.add("mt-head");
    const leave = el("button", { cls: "btn mt-leave", type: "button", text: "GIVE UP" }, head);
    root.appendChild(wrap);
    const hint = el("div", { cls: "mt-hint", "aria-live": "polite" }, wrap);
    const cols = el("div", { cls: "mt-cols" }, wrap);
    const colA = el("div", { cls: "mt-col" }, cols), colB = el("div", { cls: "mt-col" }, cols);

    /* machine: LCD + transport + grid */
    const machine = el("div", { cls: "mt-machine" }, colA);
    const lcdw = el("div", { cls: "mt-lcdwrap" }, machine);
    const lcv = el("canvas", { width: 160, height: 28, "aria-hidden": "true" }, lcdw), lc = lcv.getContext("2d");
    const trans = el("div", { cls: "mt-trans" }, machine);
    const bPlay = el("button", { cls: "btn", type: "button", text: "PLAY", "aria-label": "Play / stop (P)" }, trans);
    const bMode = el("button", { cls: "btn", type: "button", title: "Pattern = loop the 16 steps. Song = play the 8-bar arrangement.", "aria-label": "Loop mode" }, trans);
    const setModeLabel = () => { bMode.innerHTML = "<span class='lg'>LOOP: </span>" + (st.mode === "pat" ? "PATTERN" : "SONG"); };
    const bpmw = el("div", { cls: "mt-bpm" }, trans);
    const bDn = el("button", { cls: "kbtn", type: "button", text: "−", "aria-label": "Slower" }, bpmw);
    const bpmIn = el("input", { type: "range", min: "70", max: "170", step: "1", value: String(st.bpm), "aria-label": "BPM" }, bpmw);
    const bUp = el("button", { cls: "kbtn", type: "button", text: "+", "aria-label": "Faster" }, bpmw);
    const bpmTxt = el("span", { text: "" }, bpmw);
    const bFin = el("button", { cls: "btn primary", type: "button", text: "FINISH TRACK" }); head.insertBefore(bFin, leave);
    const bFin2 = el("button", { cls: "btn primary mt-bfin", type: "button", text: "FINISH TRACK: NAME IT AND BOUNCE" }, wrap);

    const grid = el("div", { cls: "mt-grid", role: "grid", "aria-label": "16-step sequencer" }, machine);
    const toastHost = machine;
    const numEls = [], rowEls = {}, stepEls = {}, ledEls = {}, nameEls = {}, msEls = {};
    for (let s = 0; s < STEPS; s++) {
      const n = el("div", { cls: "mt-num" + (s % 4 === 0 ? " b" : ""), text: String(s + 1), style: "--si:" + s }, grid); numEls.push(n);
    }
    ROWS.forEach((r, ri) => {
      const rc = r.col, rl = mix(rc, "#ffffff", 0.45), rd = mix(rc, "#000000", 0.55);
      const rh = el("div", { cls: "mt-rh", style: "--ri:" + ri + ";--rc:" + rc }, grid); rowEls[r.id] = rh;
      ledEls[r.id] = el("span", { cls: "led" }, rh);
      const nm = el("button", { cls: "nm", type: "button", tabindex: "-1", "aria-label": "Select the " + r.name + " row" }, rh); nameEls[r.id] = nm;
      nm.addEventListener("click", () => arm(r.id));
      const mBtn = el("button", { cls: "ms m", type: "button", text: "M", title: "Mute (M)", tabindex: "-1", "aria-label": "Mute " + r.name }, rh);
      const sBtn = el("button", { cls: "ms s", type: "button", text: "S", title: "Solo (S)", tabindex: "-1", "aria-label": "Solo " + r.name }, rh);
      msEls[r.id] = [mBtn, sBtn];
      mBtn.addEventListener("click", () => { st.mute[r.id] = !st.mute[r.id]; refreshRows(); });
      sBtn.addEventListener("click", () => { st.solo[r.id] = !st.solo[r.id]; refreshRows(); });
      stepEls[r.id] = [];
      for (let s = 0; s < STEPS; s++) {
        const b = el("button", { cls: "mt-step" + ((s >> 2) % 2 ? " g" : "") + (s > 0 && s % 4 === 0 ? " b4" : ""), type: "button", tabindex: "-1", style: "--si:" + s + ";--ri:" + ri + ";--rc:" + rc + ";--rl:" + rl + ";--rd:" + rd, role: "gridcell" }, grid);
        b.dataset.r = r.id; b.dataset.s = String(s);
        stepEls[r.id].push(b);
      }
    });
    // pads (the sampler)
    const padBox = el("div", { cls: "mt-box" }, colA);
    const padH = el("div", { cls: "mt-h" }, padBox);
    const padTitle = el("span", { html: "SAMPLER" }, padH); const padInfo = el("span", { text: "" }, padH);
    const pads = el("div", { cls: "mt-pads" }, padBox);
    const padEls = kit.slices.map((sp, i) => {
      const b = el("button", { cls: "mt-pad", type: "button", style: "--rc:" + ROWS[6].col }, pads);
      const cv = el("canvas", { width: 28, height: 14, "aria-hidden": "true" }, b);
      const l = el("span", { cls: "l" }, b); el("b", { text: String(i + 1) }, l); el("span", { text: sp.label }, l);
      b.setAttribute("aria-label", "Slice " + (i + 1) + ", " + sp.label);
      const c = cv.getContext("2d"), sh = shapeOf(sp);
      c.fillStyle = "#0a0816"; c.fillRect(0, 0, 28, 14);
      sh.forEach((h, k) => { const hh = Math.max(1, Math.round(h * 12)); R(c, 2 + k, 7 - Math.floor(hh / 2), 1, hh, i === 0 ? "#ffd23f" : "#f4f0ff"); });
      R(c, 0, 7, 28, 1, "#3a3070");
      b.addEventListener("click", () => { if (!st.unlockedSlices.has(i + 1)) { RP.sfx("error"); setHint("Locked. Finish a goal to unlock more of the record."); return; } st.brush.sample = i + 1; arm("sample"); previewSlice(i + 1); refreshPads(); });
      return b;
    });
    const bankBox = el("div", { cls: "mt-box" }, colA);
    const bankH = el("div", { cls: "mt-h" }, bankBox); const bankTitle = el("span", { text: "SOUND BANK" }, bankH); const bankInfo = el("span", { text: "" }, bankH);
    const bank = el("div", { cls: "mt-bank" }, bankBox);

    /* right column: Lou, goals, arrangement */
    let scv = null, sc = null, louSayEl = null, hearts = null, heartEls = [];
    if (withLou) {
      const stu = el("div", { cls: "mt-studio" }, colB);
      scv = el("canvas", { width: 320, height: 130, role: "img", "aria-label": "Lou in the studio" }, stu); sc = scv.getContext("2d");
      louSayEl = el("div", { cls: "mt-lou", "aria-live": "polite" }, colB);
      hearts = el("div", { cls: "mt-hearts" }, colB); el("span", { text: "LOU'S MOOD" }, hearts); const hp = el("div", { cls: "hp" }, hearts); for (let i = 0; i < 10; i++) heartEls.push(el("i", {}, hp));
    }
    const goalBox = el("div", { cls: "mt-box" }, colB);
    el("div", { cls: "mt-h", html: "<b>GOALS</b><span>level " + diff + "</span>" }, goalBox);
    const goalUl = el("ul", { cls: "mt-goals" }, goalBox);
    const arrBox = el("div", { cls: "mt-box" }, colB);
    el("div", { cls: "mt-h", html: "<b>ARRANGEMENT</b><span>tap a bar name to change it</span>" }, arrBox);
    const arrG = el("div", { cls: "mt-arr" }, arrBox);
    const secEls = [], emEls = [], lyEls = [];
    el("div", { cls: "rl", text: "BAR" }, arrG);
    for (let b = 0; b < BARS; b++) {
      const bt = el("button", { cls: "mt-sec", type: "button", text: "", "aria-label": "Bar " + (b + 1) + " section" }, arrG); secEls.push(bt);
      bt.addEventListener("click", () => { cycleSection(b); });
    }
    el("div", { cls: "elbl", text: "ENERGY" }, arrG);
    for (let b = 0; b < BARS; b++) {
      const em = el("div", { cls: "mt-em", title: "Jump here", role: "button", tabindex: "0", "aria-label": "Energy of bar " + (b + 1) + ". Activate to play from here." }, arrG); emEls.push(em);
      for (let k = 0; k < 10; k++) el("i", {}, em);
      el("div", { cls: "tl" }, em);
      const go = () => cueBar(b); em.addEventListener("click", go); em.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    }
    RID.forEach((r, ri) => {
      el("div", { cls: "rl", text: (ROWS[ri].short || ROWS[ri].name).slice(0, 5) }, arrG);
      lyEls[ri] = [];
      for (let b = 0; b < BARS; b++) {
        const ly = el("button", { cls: "mt-ly", type: "button", style: "--lc:" + ROWS[ri].col, "aria-label": ROWS[ri].name + " in bar " + (b + 1), "aria-pressed": "false" }, arrG); lyEls[ri][b] = ly;
        ly.addEventListener("click", () => { st.layers[b][ri] = !st.layers[b][ri]; RP.sfx("blip"); onChange(); });
      }
    });

    /* ---------- hint / toast ---------- */
    let hintT = 0;
    function setHint(t) { hint.textContent = t; hintT = st.t; }
    function toast(t) {
      const d = el("div", { cls: "mt-toast", text: t }, toastHost); host.timeout(() => d.remove(), 2600);
    }

    /* ---------- grid refresh ---------- */
    const stepLabel = (r, v) => r === "bass" ? noteName(kit.root + NOTE_DEG[v - 1]).replace(/[0-9]/g, "") : r === "chord" ? CHORD_NAME[v - 1] : r === "sample" ? String(v) : "";
    function refreshStep(r, s) {
      const b = stepEls[r][s], v = pat[r][s];
      b.classList.toggle("on", v > 0); b.textContent = v > 0 ? stepLabel(r, v) : "";
      b.setAttribute("aria-label", ROWS[RID.indexOf(r)].name + " step " + (s + 1) + (v > 0 ? ", on" + (stepLabel(r, v) ? " " + stepLabel(r, v) : "") : ", off"));
      b.setAttribute("aria-pressed", v > 0 ? "true" : "false");
    }
    function refreshGrid() { RID.forEach(r => { for (let s = 0; s < STEPS; s++) refreshStep(r, s); }); }
    function refreshRows() {
      const anySolo = RID.some(r => st.solo[r]);
      ROWS.forEach(r => {
        const nm = nameEls[r.id], vname = r.kind === "slice" ? "NYC 93" : ((VOICES[r.id] || []).find(v => v.id === st.voice[r.id]) || {}).name;
        nm.innerHTML = (r.short || r.name) + "<small>" + (vname || "") + "</small>";
        rowEls[r.id].classList.toggle("armed", st.armed === r.id);
        msEls[r.id][0].classList.toggle("on", !!st.mute[r.id]); msEls[r.id][1].classList.toggle("on", !!st.solo[r.id]);
        const silent = st.mute[r.id] || (anySolo && !st.solo[r.id]);
        stepEls[r.id].forEach(b => b.classList.toggle("dim", !!silent));
      });
    }
    function refreshPads() {
      padEls.forEach((b, i) => { b.classList.toggle("sel", st.armed === "sample" && st.brush.sample === i + 1); b.classList.toggle("lock", !st.unlockedSlices.has(i + 1)); });
      const used = new Set(pat.sample.filter(v => v > 0));
      padInfo.textContent = "slices in use: " + used.size;
    }
    const recLine = () => {
      const lab = rec.label && String(rec.title).toLowerCase().indexOf(String(rec.label).toLowerCase()) < 0 ? " (" + rec.label + (rec.year ? ", " + rec.year : "") + ")" : (rec.year ? " (" + rec.year + ")" : "");
      return rec.artist + " – " + rec.title + lab;
    };
    padTitle.innerHTML = "SAMPLER <b>" + RP.u.esc(recLine()) + "</b>";
    function refreshBank() {
      const r = ROWS.find(x => x.id === st.armed), rl = mix(r.col, "#ffffff", 0.45), rd = mix(r.col, "#000000", 0.55);
      bank.innerHTML = ""; bank.style.setProperty("--rc", r.col); bank.style.setProperty("--rl", rl); bank.style.setProperty("--rd", rd);
      bankTitle.innerHTML = "SOUND BANK · <b style='color:" + r.col + "'>" + r.name + "</b>";
      if (r.kind === "slice") {
        const sp = origSlice(st.brush.sample);
        bankInfo.textContent = "";
        const g = el("div", { cls: "grp" }, bank); el("span", { cls: "gl", text: "BRUSH" }, g);
        el("span", { text: "Slice " + st.brush.sample + ": " + sp.label + " · " + sp.len + " steps long. Pick a pad, then tap steps. Tap a lit step to clear it." }, g).style.fontSize = "18px";
        return;
      }
      const vs = VOICES[r.id] || [];
      const g1 = el("div", { cls: "grp" }, bank); el("span", { cls: "gl", text: "SOUND" }, g1);
      vs.forEach(v => {
        const un = st.unlockedVoices.has(r.id + ":" + v.id);
        const b = el("button", { cls: "mt-vb" + (st.voice[r.id] === v.id ? " sel" : "") + (un ? "" : " lock") + (st.newVoice === r.id + ":" + v.id ? " new" : ""), type: "button", text: un ? v.name : "🔒 " + v.name }, g1);
        b.setAttribute("aria-label", v.name + (un ? "" : ", locked"));
        b.addEventListener("click", () => { if (!un) { RP.sfx("error"); setHint("Locked. Complete a goal to unlock a new sound."); return; } st.voice[r.id] = v.id; previewRow(r.id); refreshBank(); refreshRows(); });
      });
      if (r.kind === "note") {
        const g2 = el("div", { cls: "grp" }, bank); el("span", { cls: "gl", text: r.id === "bass" ? "NOTES" : "CHORDS" }, g2);
        for (let k = 1; k <= 4; k++) {
          const b = el("button", { cls: "mt-vb" + (st.brush[r.id] === k ? " sel" : ""), type: "button", text: k + " " + (r.id === "bass" ? noteName(kit.root + NOTE_DEG[k - 1]) : CHORD_NAME[k - 1] + "7") }, g2);
          b.addEventListener("click", () => { st.brush[r.id] = k; previewRow(r.id, k); refreshBank(); });
        }
        bankInfo.textContent = "key of " + NOTE_NAMES[kit.root % 12] + " minor";
      } else bankInfo.textContent = "";
    }
    function arm(rid) { if (st.armed !== rid) { st.armed = rid; refreshBank(); refreshRows(); refreshPads(); } }

    /* ---------- audio: preview + scheduler ---------- */
    const barDur = () => 60 / st.bpm * 4;
    function trig(rid, s, t, v) {
      if (!E.live || !audible()) return;
      const val = pat[rid][s], sd = 60 / st.bpm / 4;
      try {
        if (rid === "kick") DRUM.kick[st.voice.kick](E, t, v);
        else if (rid === "clap") DRUM.clap[st.voice.clap](E, t, v);
        else if (rid === "hat") DRUM.hat[st.voice.hat](E, t, v);
        else if (rid === "ohat") DRUM.ohat[st.voice.ohat](E, t, v);
        else if (rid === "bass") {
          let gap = 1; while (gap < 5 && pat.bass[(s + gap) % STEPS] === 0) gap++;
          bassNote(E, st.voice.bass, kit.root + NOTE_DEG[val - 1], t, Math.max(sd * 0.9, Math.min(gap, 4) * sd * 0.92), v);
        } else if (rid === "chord") {
          let gap = 1; while (gap < 6 && pat.chord[(s + gap) % STEPS] === 0) gap++;
          chordHit(E, st.voice.chord, CHORDS[val - 1].map(n => kit.root + 24 + n), t, Math.max(sd * 1.2, Math.min(gap, 5) * sd * 0.95), v);
        } else if (rid === "sample") playSlice(E, origSlice(val), t, v, sd);
      } catch (e) { /* never throw */ }
    }
    function previewRow(rid, k) {
      if (!E.live) return;
      const save = pat[rid][0]; pat[rid][0] = rid === "bass" || rid === "chord" ? (k || st.brush[rid]) : 1;
      const t = E.AC.currentTime + 0.02; try { trig(rid, 0, t, 0.9); } catch (e) { /* ignore */ }
      pat[rid][0] = save;
    }
    function previewSlice(n) { if (!E.live || !audible()) { st.padFlash[n] = st.t; return; } try { playSlice(E, origSlice(n), E.AC.currentTime + 0.02, 0.9, 60 / st.bpm / 4); } catch (e) { /* ignore */ } st.padFlash[n] = st.t; }
    const layerOn = (bar, rid) => st.mode === "pat" ? true : !!st.layers[bar][RID.indexOf(rid)];
    const isAudible = rid => { const anySolo = RID.some(r => st.solo[r]); return anySolo ? !!st.solo[rid] : !st.mute[rid]; };
    function sched(gs, t) {
      const s = gs % STEPS, bar = st.mode === "song" ? Math.floor(gs / STEPS) % BARS : -1, sd = 60 / st.bpm / 4;
      const fired = [];
      if (E.live && st.mode === "song" && s === 0) {
        const f = filtOf(bar), cut = v => 250 * Math.pow(80, clamp(v, 0, 1));
        try { E.filt.frequency.setTargetAtTime(Math.min(20000, cut(f[0])), Math.max(t - 0.02, E.AC.currentTime), 0.02); E.filt.frequency.linearRampToValueAtTime(Math.min(20000, cut(f[1])), t + barDur() * 0.95); } catch (e) { /* ignore */ }
        const sec = st.arr[bar], prev = st.arr[(bar + BARS - 1) % BARS];
        if (audible()) {
          if (sec === "build" && prev !== "build") try { let n = 0; while (bar + n < BARS && st.arr[bar + n] === "build") n++; riser(E, t, barDur() * n, 0.9); } catch (e) { /* ignore */ }
          if (sec === "drop" && prev !== "drop") try { impact(E, t, 0.9); } catch (e) { /* ignore */ }
        }
      }
      if (E.live && st.mode === "pat" && s === 0 && gs === st.gs0) try { E.filt.frequency.cancelScheduledValues(0); E.filt.frequency.setValueAtTime(20000, t); } catch (e) { /* ignore */ }
      RID.forEach(rid => {
        if (pat[rid][s] <= 0) return;
        if (st.mode === "song" && !layerOn(bar, rid)) return;
        if (!isAudible(rid)) { fired.push(rid); return; }
        trig(rid, s, t, rid === "kick" ? 0.95 : rid === "sample" ? 0.85 : 0.8);
        fired.push(rid);
      });
      // build fill: a clap/snare roll on the last steps of the bar before a drop
      if (E.live && st.mode === "song" && audible() && s >= 12 && st.arr[bar] === "build" && st.arr[(bar + 1) % BARS] === "drop" && isAudible("clap") && RID.indexOf("clap") >= 0 && layerOn(bar, "clap")) {
        try { DRUM.clap[st.voice.clap](E, t + sd * 0.5, 0.35 + (s - 12) * 0.12); } catch (e) { /* ignore */ }
      }
      st.queue.push({ t, s, bar, fired }); if (st.queue.length > 80) st.queue.shift();
    }
    function advance() { const sd = 60 / st.bpm / 4, sw = st.swing; st.next += sd * (st.gs % 2 === 0 ? 1 + sw : 1 - sw); st.gs++; }
    function tick() {
      if (!st.playing || st.done) return;
      const now = clock(), ahead = now + 0.14;
      while (st.next < ahead) { sched(st.gs, st.next); advance(); }
    }
    host.interval(tick, 25);
    function play(fromBar) {
      if (st.done) return;
      if (E.live) { try { E.AC.resume && E.AC.resume(); E.newBus(); E.master.gain.cancelScheduledValues(E.AC.currentTime); E.master.gain.setTargetAtTime(0.9, E.AC.currentTime, 0.01); } catch (e) { /* ignore */ } }
      st.playing = true; st.gs = fromBar != null ? fromBar * STEPS : 0; st.gs0 = st.gs; st.next = clock() + 0.06; st.queue.length = 0;
      bPlay.textContent = "STOP"; bPlay.classList.add("on");
      setHint(st.mode === "song" ? "Song mode: the arrangement decides what plays each bar." : "Pattern mode: all rows loop. Switch to SONG to hear your arrangement.");
    }
    function stop() {
      st.playing = false; st.queue.length = 0; st.curStep = -1; st.curBar = -1;
      if (E.live) { try { E.bus.gain.cancelScheduledValues(E.AC.currentTime); E.bus.gain.setTargetAtTime(0.0001, E.AC.currentTime, 0.015); E.filt.frequency.setValueAtTime(20000, E.AC.currentTime); } catch (e) { /* ignore */ } }
      bPlay.textContent = "PLAY"; bPlay.classList.remove("on"); showPlayhead(-1, -1);
    }
    const toggle = () => { if (st.playing) stop(); else play(); };
    function cueBar(b) { st.mode = "song"; setModeLabel(); if (E.live) { try { E.newBus(); } catch (e) { /* ignore */ } } play(b); RP.sfx("blip"); }
    host.cleanup(() => { st.playing = false; });

    /* ---------- editing ---------- */
    function place(rid, s, mode) {          // mode: undefined = toggle with brush, "set" = force set, "clear"
      const r = ROWS.find(x => x.id === rid), cur = pat[rid][s];
      let nv = 0;
      if (mode === "clear") nv = 0;
      else if (r.kind === "drum") nv = mode === "set" ? 1 : cur ? 0 : 1;
      else { const br = st.brush[rid]; nv = mode === "set" ? br : (cur === br ? 0 : br); }
      if (nv === cur) return;
      pat[rid][s] = nv; refreshStep(rid, s);
      if (nv > 0) {
        if (r.kind === "slice") { const first = !st.used.has(nv); st.used.add(nv); previewSlice(nv); if (first) cheerFor("new", nv); }
        else if (!st.playing) previewRow(rid, nv);
        RP.sfx && 0;
      }
      if (rid === "sample") refreshPads();
      onChange(rid);
    }
    function clearRow(rid) { pat[rid].fill(0); refreshGrid(); onChange(rid); }
    function cycleSection(b) {
      const i = SEC_ORDER.indexOf(st.arr[b]); st.arr[b] = SEC_ORDER[(i + 1) % SEC_ORDER.length];
      st.layers[b] = RID.map(r => SECS[st.arr[b]].layers.indexOf(r) >= 0); RP.sfx("blip"); onChange();
    }
    // pointer painting (mouse): press on a cell, drag across the row
    let paint = null;
    grid.addEventListener("pointerdown", e => {
      const b = e.target.closest && e.target.closest(".mt-step"); if (!b) return;
      if (e.pointerType !== "mouse" || e.button !== 0) return;   // touch + keyboard use the click event
      e.preventDefault();
      const rid = b.dataset.r, s = +b.dataset.s, r = ROWS.find(x => x.id === rid);
      if (r.kind === "slice" && !st.unlockedSlices.has(st.brush.sample)) { RP.sfx("error"); return; }
      arm(rid);
      const on = pat[rid][s] > 0 && (r.kind === "drum" || pat[rid][s] === st.brush[rid]);
      paint = { rid, mode: on ? "clear" : "set" };
      place(rid, s, paint.mode); cursor = { r: RID.indexOf(rid), s }; setRoving(false);
    });
    grid.addEventListener("pointerover", e => {
      if (!paint) return; const b = e.target.closest && e.target.closest(".mt-step"); if (!b || b.dataset.r !== paint.rid) return;
      place(paint.rid, +b.dataset.s, paint.mode);
    });
    const endPaint = () => { paint = null; };
    document.addEventListener("pointerup", endPaint); host.cleanup(() => document.removeEventListener("pointerup", endPaint));
    grid.addEventListener("click", e => {
      const b = e.target.closest && e.target.closest(".mt-step"); if (!b) return;
      if (e.detail > 0 && e.pointerType === "mouse") return;      // handled on pointerdown
      if (e.detail > 0 && !("pointerType" in e)) return;
      const rid = b.dataset.r, s = +b.dataset.s, r = ROWS.find(x => x.id === rid);
      if (r.kind === "slice" && !st.unlockedSlices.has(st.brush.sample)) { RP.sfx("error"); return; }
      arm(rid); place(rid, s); cursor = { r: RID.indexOf(rid), s }; setRoving(false);
    });
    // keyboard cursor
    let cursor = { r: 0, s: 0 };
    function setRoving(focus) {
      RID.forEach((rid, ri) => stepEls[rid].forEach((b, s) => { b.tabIndex = (ri === cursor.r && s === cursor.s) ? 0 : -1; }));
      if (focus) stepEls[RID[cursor.r]][cursor.s].focus({ preventScroll: false });
    }
    setRoving(false);
    host.onKey(e => {
      if (st.done) return;
      const tg = e.target, tag = tg && tg.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const inGrid = tg && tg.closest && tg.closest(".mt-grid");
      const free = !tg || tg === document.body || inGrid;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "p" || e.key === "P") { e.preventDefault(); toggle(); return; }
      if (e.key === "[") { setBpm(st.bpm - 1); return; }
      if (e.key === "]") { setBpm(st.bpm + 1); return; }
      if (!free) return;
      const rid = RID[cursor.r], r = ROWS[cursor.r];
      if (e.key === "ArrowRight") { e.preventDefault(); cursor.s = Math.min(STEPS - 1, cursor.s + 1); arm(RID[cursor.r]); setRoving(true); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); cursor.s = Math.max(0, cursor.s - 1); setRoving(true); }
      else if (e.key === "ArrowDown") { e.preventDefault(); cursor.r = Math.min(RID.length - 1, cursor.r + 1); arm(RID[cursor.r]); setRoving(true); }
      else if (e.key === "ArrowUp") { e.preventDefault(); cursor.r = Math.max(0, cursor.r - 1); arm(RID[cursor.r]); setRoving(true); }
      else if (e.key === " " && !inGrid) { e.preventDefault(); arm(rid); place(rid, cursor.s); setRoving(true); }
      else if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); place(rid, cursor.s, "clear"); }
      else if (/^[1-8]$/.test(e.key)) {
        const n = +e.key;
        if (r.kind === "slice") { if (!st.unlockedSlices.has(n)) { RP.sfx("error"); return; } st.brush.sample = n; arm("sample"); place("sample", cursor.s, "set"); refreshBank(); refreshPads(); }
        else if (r.kind === "note" && n <= 4) { st.brush[rid] = n; arm(rid); place(rid, cursor.s, "set"); refreshBank(); }
      }
      else if (e.key === "m" || e.key === "M") { st.mute[rid] = !st.mute[rid]; refreshRows(); }
      else if (e.key === "s" || e.key === "S") { st.solo[rid] = !st.solo[rid]; refreshRows(); }
    });
    function setBpm(v) {
      st.bpm = clamp(Math.round(v), 70, 170); bpmIn.value = st.bpm; bpmTxt.textContent = st.bpm + " BPM"; onChange("bpm");
    }
    bpmIn.addEventListener("input", () => setBpm(parseInt(bpmIn.value, 10)));
    bDn.addEventListener("click", () => setBpm(st.bpm - 2)); bUp.addEventListener("click", () => setBpm(st.bpm + 2));
    bPlay.addEventListener("click", toggle);
    bMode.addEventListener("click", () => { st.mode = st.mode === "pat" ? "song" : "pat"; setModeLabel(); if (st.playing) { stop(); play(st.mode === "song" ? 0 : null); } onChange(); });

    /* ---------- Lou ---------- */
    const LOU = {
      idle: ["Go on, kid. Don't break it. I know what it's called.", "Every Saturday, 1993. Don't make it sound like a Tuesday.", "Put the hook somewhere I can find it."],
      none: ["Where's my track? You're sampling the silence.", "Nothing? You came to a remix with no record?"],
      nohook: ["Where's the hook? Start with the hook!", "That's not the hook. The hook is slice one."],
      hook: ["That's it! That's the hook. Every Saturday, 1993.", "There she is. There's the hook."],
      salad: ["Easy! It's not a salad. Don't chop it to confetti.", "That's not a chop, that's a blender."],
      stutter: ["Stuttering? It's a record, not a record scratch.", "Let it breathe. We had room in '93."],
      mud: ["Don't bury it under every kick. Let it swing.", "The sample's on top of the kick. Give it some air."],
      fast: ["Too fast. We danced slower in '93. We had knees.", "Slow down. It's not a race, it's a groove."],
      slow: ["Slower? It's garage, not a lullaby.", "Pick it up. The floor is falling asleep."],
      one: ["Use more than one bit of it. I made the whole thing.", "One slice? That's a ringtone, kid."],
      good: ["Mm. Yeah. That's the room.", "Now THAT sounds like something.", "Hm. Hm. Okay. Okay!"],
      newslice: ["Oh, you found that bit. I forgot that bit.", "That's the one from the second chorus. Nice."],
      wall: ["It never shuts up. Give the sample a rest.", "Let it breathe in the break."]
    };
    const pickR = a => a[Math.floor(Math.random() * a.length)];
    function cheerFor(kind, n) { if (!withLou) return; if (kind === "new") { if (n === 1) louSayKey("hook"); else if (Math.random() < 0.5) louSayKey("newslice"); } }
    function louSayKey(k) { const msg = pickR(LOU[k] || LOU.idle); st.louMsg = msg; st.louT = st.t; st.louFlash = st.t + 2.4; st.louExpr = (k === "hook" || k === "good" || k === "newslice") ? "happy" : (k === "salad" || k === "none" || k === "stutter" || k === "nohook") ? "angry" : (k === "fast" || k === "slow" || k === "one" || k === "wall" || k === "mud") ? "worried" : "surprised"; if (louSayEl) louSayEl.innerHTML = "<b>LOU:</b> “" + RP.u.esc(msg) + "”"; }
    function louReact(tz, why) {
      if (!withLou) return;
      let key = null;
      if (why === "bpm") key = tz.d > 10 ? (st.bpm > origBpm ? "fast" : "slow") : null;
      else if (why === "sample") key = tz.ns === 0 ? "none" : tz.ns > 10 ? "salad" : tz.adj >= 5 ? "stutter" : tz.hookAt < 0 && tz.ns >= 2 ? "nohook" : tz.dist === 1 && tz.ns >= 4 ? "one" : null;
      else if (why === "arr") key = tz.sb >= 8 ? "wall" : null;
      if (!key && why === "sample" && tz.ns >= 3 && tz.mud < 0.8) key = "mud";
      if (key) louSayKey(key);
    }

    /* ---------- change handling ---------- */
    function onChange(why) {
      ev = goalsEval();
      const tz = ev.tz;
      if (withLou) {
        heartEls.forEach((h, i) => { h.className = i < Math.round(tz.t / 10) ? (tz.t >= TIER_GOALS.taste[diff - 1] ? "hi" : "on") : ""; });
        if (why === "sample" || why === "bpm" || why === "arr") louReact(tz, why);
        if (why === "bpm" || why === "sample") { /* react above */ }
        if (st.louMsg === "" || st.t - st.louT > 8) { if (!st.louMsg) { st.louMsg = LOU.idle[0]; if (louSayEl) louSayEl.innerHTML = "<b>LOU:</b> “" + RP.u.esc(st.louMsg) + "”"; } }
        const mood = tz.t >= 70 ? "happy" : tz.t >= 45 ? "neutral" : tz.t >= 25 ? "worried" : "angry";
        if (st.t > st.louFlash) st.louExpr = mood;
        if (why !== undefined && why !== "sample" && why !== "bpm" && why !== "arr" && tz.t >= 70 && st.lastTaste < 70 && st.louFlash < st.t) louSayKey("good");
        st.lastTaste = tz.t;
      }
      // goals list
      goalUl.innerHTML = "";
      ev.list.forEach(g => {
        const li = el("li", { cls: g.ok ? "y" : "" }, goalUl);
        const mid = el("span", {}, li); mid.innerHTML = RP.u.esc(g.t) + "<br><small style='color:var(--muted)'>" + RP.u.esc(g.d) + "</small>";
        el("small", { text: g.prog }, li);
        if (g.ok && !st.goalsDone[g.id]) { st.goalsDone[g.id] = true; if (!st.firstEval) rewardGoal(g); }
      });
      // arrangement
      for (let b = 0; b < BARS; b++) {
        const sec = SECS[st.arr[b]];
        secEls[b].textContent = sec.name; secEls[b].style.setProperty("--sc", sec.col);
        const e = ev.en[b], lit = Math.round(e / 10);
        const em = emEls[b]; em.style.setProperty("--ec", e >= 80 ? "#ffffff" : e >= 60 ? "#ff3fa4" : e >= 35 ? "#ffc44d" : "#39d0ff");
        [...em.querySelectorAll("i")].forEach((i, k) => i.classList.toggle("on", k < lit));
        const tl = em.querySelector(".tl"); tl.style.bottom = (TIER_GOALS.drop[diff - 1] / 100 * 52) + "px"; tl.style.display = st.arr[b] === "drop" ? "block" : "none";
        RID.forEach((r, ri) => { lyEls[ri][b].classList.toggle("on", !!st.layers[b][ri]); lyEls[ri][b].setAttribute("aria-pressed", st.layers[b][ri] ? "true" : "false"); });
      }
      refreshPads(); refreshHint();
    }
    function rewardGoal(g) {
      RP.sfx("success");
      const lk = lockedList();
      if (lk.length) {
        const u = lk[0];
        if (u.kind === "voice") { st.unlockedVoices.add(u.row + ":" + u.id); st.newVoice = u.row + ":" + u.id; toast("NEW SOUND: " + u.name + " (" + ROWS.find(r => r.id === u.row).name + ")"); }
        else { st.unlockedSlices.add(u.n); toast("NEW SLICE: " + origSlice(u.n).label + " (pad " + u.n + ")"); }
        RP.sfx("unlock"); refreshBank(); refreshPads();
      } else toast("GOAL: " + g.t);
      if (withLou && g.id !== "lou") louSayKey(g.id === "drop" ? "good" : "newslice");
    }
    function refreshHint() {
      if (st.t - hintT < 6 && hint.textContent) return;
      let t;
      if (count("kick") < 3) t = "Start with the KICK row: tap a few steps, then press PLAY (or P).";
      else if (pat.sample.every(v => v === 0)) t = "Pick a pad (the white label's slices) and tap steps on the SAMPLE row.";
      else if (ev && !ev.list.find(g => g.id === "drop").ok) t = "Switch to SONG and shape the arrangement. A DROP needs everything on and a quiet bar before it.";
      else if (ev && ev.list.some(g => !g.ok)) t = "Check the goals on the right. Tap the energy bars to jump around the song.";
      else t = "All goals done. Press FINISH TRACK when it sounds right.";
      hint.textContent = t;
    }

    /* ---------- playhead ---------- */
    function showPlayhead(s, bar) {
      if (s === st.curStep && bar === st.curBar) return;
      if (st.curStep >= 0) { numEls[st.curStep].classList.remove("play"); RID.forEach(r => stepEls[r][st.curStep].classList.remove("play")); }
      if (st.curBar >= 0) { secEls[st.curBar].classList.remove("play"); emEls[st.curBar].classList.remove("play"); RID.forEach((r, ri) => lyEls[ri][st.curBar].classList.remove("play")); }
      st.curStep = s; st.curBar = bar;
      if (s >= 0) { numEls[s].classList.add("play"); RID.forEach(r => stepEls[r][s].classList.add("play")); }
      if (bar >= 0) { secEls[bar].classList.add("play"); emEls[bar].classList.add("play"); RID.forEach((r, ri) => lyEls[ri][bar].classList.add("play")); }
    }

    /* ---------- drawing ---------- */
    function drawLCD(now) {
      lc.fillStyle = "#0b1e18"; lc.fillRect(0, 0, 160, 28);
      for (let y = 0; y < 28; y += 2) { lc.fillStyle = "#0e2a20"; lc.fillRect(0, y, 160, 1); }
      const ink = "#9be15d", dim = "#4a7a3a";
      const nm = String(st.name).toUpperCase(); txt(lc, nm.length > 28 ? nm.slice(0, 27) + "." : nm, 3, 3, ink, 1);
      txt(lc, String(st.bpm), 126, 3, "#ffd23f", 2, 1); txt(lc, "BPM", 143, 10, dim, 1);
      const bar = st.curBar >= 0 ? st.curBar + 1 : (st.mode === "song" ? 0 : "-");
      txt(lc, (st.mode === "song" ? "SONG" : "PAT") + " BAR " + (st.mode === "song" ? (st.curBar >= 0 ? (st.curBar + 1) + "/8" : "-/8") : "-") + " " + (st.curBar >= 0 ? SECS[st.arr[st.curBar]].name : ""), 3, 11, dim, 1);
      for (let s = 0; s < STEPS; s++) { const on = s === st.curStep; R(lc, 3 + s * 8, 20, 6, 5, on ? "#ffd23f" : (s % 4 === 0 ? "#2a5a3a" : "#16382a")); if (on) R(lc, 3 + s * 8, 19, 6, 1, "#ffffff"); }
      txt(lc, st.playing ? ">" : "#", 150, 20, st.playing ? "#ffd23f" : dim, 1);
    }
    const drawn = { speakerL: 0, speakerR: 0 };
    function drawStudio(now) {
      if (!sc) return;
      sc.drawImage(studioBG(), 0, 0);
      const pulse = reduced ? 0 : clamp(1 - (now - st.kickAt) * 7, 0, 1);
      [[22, 70], [298, 70]].forEach(([cx]) => {
        const r = 8 + Math.round(pulse * 2);
        ell(sc, cx, 80, r, r, "#0a0612"); ell(sc, cx, 80, r - 1, r - 1, "#2a2634"); ell(sc, cx, 80, r - 3, r - 3, "#3a3548"); ell(sc, cx, 80, 3, 3, "#14121c");
        if (pulse > 0.2) { ring(sc, cx, 80, r + 2, "#ff3fa4"); }
        ell(sc, cx, 52, 5, 5, "#c8c4d8"); ell(sc, cx, 52, 4, 4, "#16141e"); ell(sc, cx, 52, 2, 2, "#48445a");
      });
      // laptop screen: energy bars
      R(sc, 86, 56, 36, 24, "#0a0612"); R(sc, 87, 57, 34, 22, "#10303a"); R(sc, 86, 56, 36, 1, "#8a86a0");
      const en = ev ? ev.en : [0, 0, 0, 0, 0, 0, 0, 0];
      for (let b = 0; b < 8; b++) { const h = Math.max(1, Math.round(en[b] / 100 * 18)); const live = st.curBar === b; R(sc, 89 + b * 4, 77 - h, 3, h, live ? "#ffffff" : st.arr[b] === "drop" ? "#ff3fa4" : "#39d0ff"); }
      // pad controller: the current step lights a pad
      for (let k = 0; k < 16; k++) { const x = 126 + (k % 4) * 6, y = 74 + Math.floor(k / 4) * 3; const on = st.curStep >= 0 && st.curStep === k; R(sc, x, y, 5, 2, on ? "#ffd23f" : (pat.sample[k] ? "#f4f0ff" : "#2a2438")); }
      R(sc, 124, 72, 26, 1, "#6a667c");
      // Lou
      const happy = st.louExpr === "happy" && st.playing && !reduced;
      const fr = Math.floor(now * 4) % 4;
      const lx = 222, ly = 126;
      try { RP.chars.draw(sc, { id: "lou", x: lx, y: ly, face: "front", act: happy ? "dance" : "stand", frame: fr, expr: st.louExpr, mouth: now < st.louFlash && Math.floor(now * 8) % 2 === 0 }, { lx: -0.5, rim: { color: "#ff3fa4", side: -1 } }); } catch (e) { /* ignore */ }
      if (st.padFlash && false) { /* reserved */ }
    }
    function drawPadFlash(now) { padEls.forEach((b, i) => { b.classList.toggle("hit", st.padFlash[i + 1] != null && now - st.padFlash[i + 1] < 0.12); }); }

    /* ---------- finish ---------- */
    let resolveFn = null;
    function finishFlow() {
      if (st.done) return;
      const wasPlaying = st.playing; if (wasPlaying) stop();
      ev = goalsEval();
      if (RID.every(r => count(r) === 0)) { setHint("It's empty. Tap some steps first."); RP.sfx("error"); return; }
      const m = el("div", { cls: "mt-modal", role: "dialog", "aria-modal": "true", "aria-label": "Finish the track" }, root);
      const card = el("div", { cls: "mt-card" }, m);
      el("h2", { text: "NAME YOUR TRACK" }, card);
      el("label", { text: "Released on Pipe Hole Records. Make it good.", for: "mtname" }, card);
      const inp = el("input", { type: "text", id: "mtname", maxlength: "40", value: st.name, "aria-label": "Track name", autocomplete: "off", spellcheck: "false" }, card);
      const ul = el("ul", {}, card);
      ev.list.forEach(g => el("li", { html: (g.ok ? "<b>[x]</b> " : "[ ] ") + RP.u.esc(g.t) + " <span style='color:var(--muted)'>" + RP.u.esc(g.prog) + "</span>" }, ul));
      const row = el("div", { cls: "row" }, card);
      const back = el("button", { cls: "btn", type: "button", text: "KEEP EDITING" }, row), go = el("button", { cls: "btn primary", type: "button", text: "BOUNCE IT" }, row);
      back.addEventListener("click", () => { m.remove(); });
      const bounce = () => { st.name = (inp.value || "").trim() || defName; m.remove(); bounceTrack(); };
      go.addEventListener("click", bounce); inp.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Enter") bounce(); if (e.key === "Escape") m.remove(); });
      inp.focus(); inp.select();
    }
    function bounceTrack() {
      if (st.done) return; st.done = true; stop();
      ev = goalsEval();
      const di = diff - 1, done = ev.list.filter(g => g.ok).length, total = ev.list.length;
      const goalsPart = 56 * done / total;
      const energyQ = 0.6 * clamp((ev.dropMin - 40) / 50, 0, 1) + 0.4 * clamp(ev.jump / 30, 0, 1);
      const score = Math.round(clamp(goalsPart + 22 * energyQ + 22 * ev.tz.t / 100, 0, 100));
      const res = { ok: score >= 55, score, track: { name: st.name, bpm: st.bpm, pattern: { steps: STEPS, rows: JSON.parse(JSON.stringify(pat)), voices: Object.assign({}, st.voice), arrangement: st.arr.slice(), layers: st.layers.map(l => l.slice()), swing: st.swing }, sample: rec.id, goals: done + "/" + total, energy: ev.en.slice(), lou: ev.tz.t } };
      wrap.remove(); head.remove();
      host.header("mak.Tracks", "Bounced");
      const card = el("div", { cls: "mt-card", style: "margin: 0 auto; border-color: var(--pink)" }, root);
      if (withLou) { const ecv = el("canvas", { width: 320, height: 130 }, card), ec = ecv.getContext("2d"); ec.drawImage(studioBG(), 0, 0); try { RP.chars.draw(ec, { id: "lou", x: 222, y: 126, face: "front", act: "stand", expr: ev.tz.t >= 65 ? "happy" : ev.tz.t >= 40 ? "neutral" : "worried" }, { lx: -0.5, rim: { color: "#ff3fa4", side: -1 } }); } catch (e) { /* ignore */ } }
      el("h2", { text: res.ok ? "TRACK DONE" : "NOT QUITE" }, card);
      el("p", { html: "<b style='color:var(--amber);font-weight:400'>" + RP.u.esc(st.name) + "</b> · " + st.bpm + " BPM" }, card);
      el("div", { cls: "big", text: String(score) }, card);
      const t = ev.tz.t;
      let line;
      if (!withLou) line = res.ok ? "Mastered, named, ready for Pipe Hole Records." : "It needs another pass before it goes anywhere.";
      else if (t >= 75) line = "Lou, quiet for a second: “...That's it. That's the room. I haven't heard it through speakers since '93.” He sniffs. “The bass is too loud.”";
      else if (t >= 50) line = "Lou, arms folded: “It's not 1993. But it's not bad. Don't tell anyone I said that.”";
      else line = "Lou: “You put my track in a blender, kid. ...Do it again. Slower.”";
      el("p", { text: line }, card);
      const ul = el("ul", {}, card);
      ev.list.forEach(g => el("li", { html: (g.ok ? "<b>[x]</b> " : "[ ] ") + RP.u.esc(g.t) }, ul));
      el("li", { html: "Drop energy: <b>" + (ev.drops.length ? ev.dropMin : "-") + "</b> · Lou's mood: <b>" + t + "%</b> · Goals: <b>" + done + "/" + total + "</b>" }, ul);
      const row = el("div", { cls: "row" }, card);
      const cont = el("button", { cls: "btn primary", type: "button", text: "CONTINUE" }, row);
      cont.addEventListener("click", () => { if (resolveFn) { const f = resolveFn; resolveFn = null; f(res); } });
      cont.focus({ preventScroll: true });
      RP.sfx(res.ok ? "success" : "fail");
    }
    bFin.addEventListener("click", finishFlow); bFin2.addEventListener("click", finishFlow);
    leave.addEventListener("click", () => { if (st.done) return; st.done = true; stop(); if (resolveFn) { const f = resolveFn; resolveFn = null; f({ ok: false, score: 0, track: null }); } });

    /* ---------- main loop ---------- */
    let last = null;
    host.raf(tm => {
      if (st.done) return false;
      const now = tm / 1000; last = now; st.t = now;
      if (st.playing && st.queue.length) {
        const c = clock();
        while (st.queue.length && st.queue[0].t <= c) {
          const e = st.queue.shift();
          showPlayhead(e.s, e.bar);
          e.fired.forEach(r => { ledEls[r].classList.add("on"); st.rowFlash[r] = now; });
          if (e.fired.indexOf("kick") >= 0) st.kickAt = now;
          if (e.fired.indexOf("sample") >= 0) { const v = pat.sample[e.s]; if (v) st.padFlash[v] = now; }
        }
      }
      RID.forEach(r => { if (ledEls[r].classList.contains("on") && now - (st.rowFlash[r] || 0) > 0.1) ledEls[r].classList.remove("on"); });
      drawLCD(now); drawStudio(now); drawPadFlash(now);
    });

    /* ---------- go ---------- */
    setModeLabel(); refreshGrid(); refreshRows(); refreshBank(); refreshPads(); setBpm(st.bpm);
    st.t = 0; st.firstEval = true; onChange(); st.firstEval = false;
    setHint("Welcome to the studio. Tap the grid to program a beat, then press PLAY. Arrow keys + SPACE work too.");
    if (withLou) { st.louMsg = LOU.idle[0]; louSayEl.innerHTML = "<b>LOU:</b> “" + RP.u.esc(st.louMsg) + "”"; }
    return new Promise(resolve => { resolveFn = resolve; host.cleanup(() => { if (resolveFn) { const f = resolveFn; resolveFn = null; f({ ok: false, score: 0, track: null }); } }); });
  }
});
})();
