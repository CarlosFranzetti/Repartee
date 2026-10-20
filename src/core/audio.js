/* re:parteé — synthesized audio. No samples: every kick, hat, bassline and crowd
   is built from oscillators and noise at runtime. Records in the game are real
   releases by name; what you hear is a loop "in the style of" their genre/tempo.
   All public calls are safe no-ops without an AudioContext. */
(function () {
"use strict";
const RP = window.RP;
const { mulberry, hashStr, clamp } = RP.u;

let AC = null, master = null, musicBus = null, sfxBus = null, ambBus = null, noiseBuf = null, comp = null;
const muteCbs = [];
const audio = RP.audio = { muted: false };

function ctx() {
  if (!AC) {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      AC = new C();
      comp = AC.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 6; comp.attack.value = 0.004; comp.release.value = 0.2;
      master = AC.createGain(); master.gain.value = audio.muted ? 0 : 0.85;
      musicBus = AC.createGain(); musicBus.gain.value = 0.8;
      sfxBus = AC.createGain(); sfxBus.gain.value = 0.9;
      ambBus = AC.createGain(); ambBus.gain.value = 0.55;
      musicBus.connect(comp); sfxBus.connect(comp); ambBus.connect(comp); comp.connect(master); master.connect(AC.destination);
      noiseBuf = AC.createBuffer(1, AC.sampleRate * 1, AC.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { AC = null; return null; }
  }
  if (AC.state === "suspended") { try { AC.resume(); } catch (e) { /* ignore */ } }
  return AC;
}
audio.ctx = ctx;
audio.buses = () => ({ music: musicBus, sfx: sfxBus, noise: noiseBuf });
audio.setMute = m => {
  audio.muted = !!m;
  if (master && AC) { master.gain.cancelScheduledValues(AC.currentTime); master.gain.setTargetAtTime(m ? 0 : 0.85, AC.currentTime, 0.05); }
  muteCbs.forEach(f => f(audio.muted));
};
audio.onMuteChange = f => muteCbs.push(f);
audio.setMusicVolume = v => { if (musicBus) musicBus.gain.value = v; };
audio.setSfxVolume = v => { if (sfxBus) sfxBus.gain.value = v; };
const ok = () => !audio.muted && ctx();

/* ---------------- voices ---------------- */
function env(g, t, a, peak, d, sus = 0.0001) {
  g.gain.cancelScheduledValues(t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + d);
}
function kick(t, dest, vol = 0.9, f0 = 150, f1 = 45, dec = 0.32) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + 0.11);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dec);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dec + 0.02);
  noise(t, dest, "highpass", 3000, vol * 0.18, 0.012);
}
function noise(t, dest, type, freq, vol, len, q = 1) {
  const s = AC.createBufferSource(); s.buffer = noiseBuf;
  s.playbackRate.value = 0.9 + Math.random() * 0.2;
  const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + len + 0.02);
}
function tone(t, dest, type, freq, vol, a, d, f2) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + a + d);
  env(g, t, a, vol, d);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + a + d + 0.05);
}
const snare = (t, d, v = 0.5) => { noise(t, d, "bandpass", 1900, v, 0.16, 0.8); tone(t, d, "triangle", 190, v * 0.5, 0.002, 0.08, 140); };
const clap = (t, d, v = 0.5) => { [0, 0.011, 0.022].forEach(o => noise(t + o, d, "bandpass", 1300, v * 0.8, 0.03, 1.2)); noise(t + 0.03, d, "bandpass", 1200, v, 0.18, 1); };
const hat = (t, d, v = 0.18, open = false) => noise(t, d, "highpass", 7600, v, open ? 0.22 : 0.04);
const shaker = (t, d, v = 0.08) => noise(t, d, "bandpass", 6000, v, 0.06, 2);
const conga = (t, d, f, v = 0.35) => { tone(t, d, "sine", f, v, 0.002, 0.18, f * 0.92); noise(t, d, "bandpass", f * 4, v * 0.15, 0.02); };
const cowbell = (t, d, v = 0.12) => { tone(t, d, "square", 540, v, 0.001, 0.12); tone(t, d, "square", 800, v * 0.7, 0.001, 0.12); };
const rim = (t, d, v = 0.2) => { tone(t, d, "square", 1700, v, 0.001, 0.025); noise(t, d, "bandpass", 2500, v * 0.5, 0.02, 3); };
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

function bass(t, dest, note, len, kind, vol = 0.5, cut = 900, acc = 0) {
  const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
  o.type = kind === "sine" ? "sine" : kind === "square" ? "square" : "sawtooth";
  o.frequency.setValueAtTime(midi(note), t);
  f.type = "lowpass"; f.Q.value = kind === "acid" ? 14 + acc * 6 : 3;
  const c0 = kind === "acid" ? cut * (1.5 + acc * 2) : cut * 1.6;
  f.frequency.setValueAtTime(c0, t); f.frequency.exponentialRampToValueAtTime(Math.max(90, cut * 0.35), t + len * 0.9);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.006); g.gain.setValueAtTime(vol, t + len * 0.75); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(t + len + 0.02);
  if (kind === "organ") { const o2 = AC.createOscillator(); o2.type = "square"; o2.frequency.value = midi(note + 12); const g2 = AC.createGain(); env(g2, t, 0.005, vol * 0.25, len); o2.connect(g2); g2.connect(dest); o2.start(t); o2.stop(t + len + 0.05); }
}
function chord(t, dest, notes, len, kind, vol = 0.12, cut = 2200) {
  const f = AC.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = cut; f.Q.value = 1;
  const g = AC.createGain();
  if (kind === "pad") { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + len * 0.3); g.gain.linearRampToValueAtTime(0.0001, t + len); }
  else if (kind === "epiano") env(g, t, 0.004, vol * 1.3, len * 0.9);
  else env(g, t, 0.003, vol * 1.4, Math.min(0.28, len));
  f.connect(g); g.connect(dest);
  notes.forEach(n => {
    [-5, 5].forEach(det => {
      const o = AC.createOscillator(); o.type = kind === "epiano" ? "triangle" : kind === "organ" ? "square" : "sawtooth";
      o.frequency.value = midi(n); o.detune.value = det + (kind === "eurodance" ? det * 2 : 0);
      o.connect(f); o.start(t); o.stop(t + len + 0.1);
    });
  });
}
function lead(t, dest, note, len, vol = 0.1, vib = true) {
  const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
  o.type = "sawtooth"; o.frequency.value = midi(note);
  if (vib) { const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = 5.2; lg.gain.value = 6; l.connect(lg); lg.connect(o.detune); l.start(t); l.stop(t + len + 0.1); }
  f.type = "lowpass"; f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(2200, t + 0.08); f.frequency.linearRampToValueAtTime(1300, t + len); f.Q.value = 2;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.06); g.gain.setValueAtTime(vol, t + len * 0.8); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  o.connect(f); f.connect(g); g.connect(dest); o.start(t); o.stop(t + len + 0.05);
}

/* ---------------- genres ---------------- */
const x16 = s => s.split("").map(c => c === "x" ? 1 : c === "o" ? 0.6 : 0);
const G = {
  house:      { k: "x...x...x...x...", c: "....x.......x...", h: "..x...x...x...x.", o: "", sh: "xxxxxxxxxxxxxxxx", bass: "organ", bp: ["x..x..x.x...x..x", "x.x..x..x.x..x.."], ch: "stab", sw: 0.04, scale: "minor7" },
  "deep house": { k: "x...x...x...x...", c: "....x.......x...", h: "..x...x...x...x.", sh: "x.x.x.x.x.x.x.x.", bass: "sine", bp: ["x.....x...x.....", "x..x......x.x..."], ch: "pad", ch2: "epiano", sw: 0.08, scale: "minor9" },
  garage:     { k: "x.....x.x.......", c: "....x.......x...", h: "..x..xx...x..xx.", sh: "x.xx.xx.x.xx.xx.", bass: "organ", bp: ["x..x...xx..x..x."], ch: "organ", sw: 0.16, scale: "minor7" },
  "chicago house": { k: "x...x...x...x...", c: "....x.......x...", h: "x.x.x.x.x.x.x.x.", o: "..x...x...x...x.", bass: "square", bp: ["x.xx.x.xx.x.x.xx"], ch: "stab", sw: 0.06, scale: "minor" },
  "acid house": { k: "x...x...x...x...", c: "....x.......x...", h: "..x...x...x...x.", o: "", bass: "acid", bp: ["xxx.xx.xx.xxx.xx"], ch: null, sw: 0.02, scale: "minor", acid: true },
  disco:      { k: "x...x...x...x...", c: "....x.......x...", h: "", o: "..x...x...x...x.", sh: "xxxxxxxxxxxxxxxx", bass: "octave", bp: ["x.x.x.x.x.x.x.x."], ch: "stab", ch2: "strings", sw: 0.05, scale: "major7" },
  boogie:     { k: "x.....x...x.....", c: "....x.......x...", h: "x.x.x.x.x.x.x.x.", bass: "square", bp: ["x..x.x....x..x.x"], ch: "epiano", sw: 0.1, scale: "minor9" },
  techno:     { k: "x...x...x...x...", c: "", h: "..x...x...x...x.", o: "..x...x...x...x.", rim: "......x.......x.", bass: "rumble", bp: ["..x...x...x...x."], ch: "stab", sw: 0, scale: "phryg", dark: true },
  "detroit techno": { k: "x...x...x...x...", c: "....x.......x...", h: "xxxxxxxxxxxxxxxx", bass: "saw", bp: ["x..x..x..x..x.x."], ch: "strings", sw: 0.02, scale: "minor9" },
  electro:    { k: "x......x..x.....", c: "....x.......x...", h: "x.x.x.x.x.x.x.x.", cb: "..x.....x.....x.", bass: "square", bp: ["x..x..x...x..x.."], ch: "stab", sw: 0.02, scale: "minor" },
  minimal:    { k: "x...x...x...x...", c: "", rim: "...x.......x..x.", h: "..x...x...x...x.", bass: "sine", bp: ["x.....x........."], ch: null, sw: 0.05, scale: "minor" },
  "hip-hop":  { k: "x......x.x......", sn: "....x.......x...", h: "x.x.x.x.x.x.x.x.", bass: "sine", bp: ["x......x.x......"], ch: "epiano", sw: 0.2, scale: "minor9", slow: true },
  breaks:     { k: "x.........x.....", sn: "....x.......x...", h: "x.x.x.x.x.x.x.x.", bass: "square", bp: ["x.........x....."], ch: "stab", sw: 0.12, scale: "minor7" },
  funk:       { k: "x.....x...x.....", sn: "....x.......x...", h: "x.x.x.x.x.x.x.x.", bass: "square", bp: ["x..x.x..x.xx..x."], ch: "stab", sw: 0.12, scale: "dom9" },
  soul:       { k: "x.......x.......", sn: "....x.......x...", h: "x.x.x.x.x.x.x.x.", bass: "sine", bp: ["x...x..xx...x..."], ch: "epiano", sw: 0.12, scale: "major7" },
  "jazz-funk": { k: "x.....x...x.....", sn: "....x.......x...", h: "xxxxxxxxxxxxxxxx", bass: "square", bp: ["x.xx..x.x.xx..x."], ch: "epiano", lead: true, sw: 0.1, scale: "minor9" },
  latin:      { k: "x...x...x...x...", c: "", h: "..x...x...x...x.", conga: "x..x..x...x.x...", clave: "x..x...x..x.x...", bass: "sine", bp: ["x..x...x..x....."], ch: "epiano", sw: 0.05, scale: "minor7" },
  balearic:   { k: "x.......x.......", c: "....x.......x...", sh: "x.x.x.x.x.x.x.x.", bass: "sine", bp: ["x.....x...x....."], ch: "pad", ch2: "epiano", sw: 0.06, scale: "major7" },
  italo:      { k: "x...x...x...x...", c: "....x.......x...", h: "..x...x...x...x.", bass: "octave", bp: ["xxxxxxxxxxxxxxxx"], ch: "stab", lead: true, sw: 0, scale: "minor" },
  ambient:    { k: "", c: "", h: "", bass: "sine", bp: ["x..............."], ch: "pad", sw: 0, scale: "major9" },
  eurodance:  { k: "x...x...x...x...", c: "....x.......x...", h: "..x...x...x...x.", o: "..x...x...x...x.", bass: "octave", bp: ["..x...x...x...x."], ch: "eurodance", sw: 0, scale: "minor", stabRhythm: "x..x..x.x..x..x." },
  novelty:    { k: "x...x...x...x...", c: "....x.......x...", h: "..x...x...x...x.", cb: "x.x...x.x.x...x.", bass: "square", bp: ["x.x.x.x.x.x.x.x."], ch: "stab", sw: 0, scale: "major" },
  "smooth jazz": { k: "x.......x.......", sn: "....x.......x...", h: "x.x.x.x.x.x.x.x.", bass: "sine", bp: ["x...x..x..x....."], ch: "epiano", lead: true, sw: 0.14, scale: "major9", soft: true },
  "r&b":      { k: "x......x..x.....", sn: "....x.......x...", h: "x.x.x.x.x.xxx.x.", bass: "sine", bp: ["x......x..x....."], ch: "epiano", sw: 0.16, scale: "minor9", slow: true },
  "pop-dance": { k: "x...x...x...x...", c: "....x.......x...", h: "..x...x...x...x.", bass: "octave", bp: ["x.x.x.x.x.x.x.x."], ch: "stab", lead: true, sw: 0, scale: "major" },
  "hip-house": { k: "x...x...x...x...", c: "....x.......x...", h: "..x...x...x...x.", bass: "square", bp: ["x..x..x.x..x..x."], ch: "stab", sw: 0.08, scale: "minor7" }
};
G.festival = Object.assign({}, G.house, { o: "..x...x...x...x.", ch: "eurodance", lead: true });
const SCALES = {
  minor: [0, 3, 7], minor7: [0, 3, 7, 10], minor9: [0, 3, 7, 10, 14], major: [0, 4, 7], major7: [0, 4, 7, 11], major9: [0, 4, 7, 11, 14], dom9: [0, 4, 10, 14], phryg: [0, 1, 7]
};
const PROGS = [[0, 0, 5, 3], [0, 5, 3, 4], [0, 3, 0, 5], [0, 0, 0, 0], [0, 8, 5, 7], [0, 10, 8, 7]];
audio.genres = Object.keys(G);

/* ---------------- loops & scheduler ---------------- */
const loops = new Set();
let timer = null;
function ensureTimer() { if (!timer) timer = setInterval(tick, 25); }
function tick() {
  if (!AC) return;
  const ahead = AC.currentTime + 0.12;
  loops.forEach(L => { if (L.running) while (L.next < ahead) { L.playStep(L.step, L.next); L.advance(); } });
  if (!loops.size) { clearInterval(timer); timer = null; }
}

function loop(opts = {}) {
  const c = ctx();
  const genre = G[opts.genre] ? opts.genre : (opts.genre && /house/.test(opts.genre) ? "house" : "house");
  const spec = G[genre];
  const rnd = mulberry((opts.seed || 1) >>> 0);
  const L = { genre, bpm: opts.bpm || 122, energy: opts.energy || 3, running: false, step: 0, next: 0, beatBase: 0, tBase: 0, beatCbs: [], filt: null };
  if (!c) {
    // silent stand-in with a working clock (for tests / no audio)
    const t0 = performance.now();
    return { start() { L.t0 = performance.now(); }, stop() {}, setBpm(b) { L.beatBase = this.phase(); L.t0 = performance.now(); L.bpm = b; }, getBpm: () => L.bpm, setVolume() {}, setFilter() {}, setEnergy(e) { L.energy = e; }, nudge(d) { L.beatBase += d; }, phase() { return L.beatBase + ((performance.now() - (L.t0 || t0)) / 1000) * L.bpm / 60; }, onBeat(f) { L.beatCbs.push(f); }, output: null, connect() {}, silent: true };
  }
  const out = AC.createGain(); out.gain.value = opts.volume == null ? 0.8 : opts.volume;
  const filt = AC.createBiquadFilter(); filt.type = "allpass"; filt.frequency.value = 20000;
  const drums = AC.createGain(), music = AC.createGain();
  drums.gain.value = spec.soft ? 0.55 : 0.9; music.gain.value = 0.9;
  drums.connect(filt); music.connect(filt); filt.connect(out);
  out.connect(opts.dest || (opts.bus === "sfx" ? sfxBus : musicBus));
  const root = 33 + Math.floor(rnd() * 10) + (spec.dark ? -2 : 0);
  const prog = PROGS[Math.floor(rnd() * PROGS.length)];
  const bp = x16(spec.bp[Math.floor(rnd() * spec.bp.length)]);
  const pat = k => spec[k] ? x16(spec[k]) : null;
  const P = { k: pat("k"), c: pat("c"), sn: pat("sn"), h: pat("h"), o: pat("o"), sh: pat("sh"), rim: pat("rim"), cb: pat("cb"), conga: pat("conga"), clave: pat("clave"), st: pat("stabRhythm") };
  const stabSteps = P.st || x16(["..x...x.......x.", "...x..x....x....", "x.....x...x.....", "..x..x....x..x.."][Math.floor(rnd() * 4)]);
  const leadNotes = [0, 3, 5, 7, 10, 12].map(n => n + root + 36);
  const lp = []; for (let i = 0; i < 16; i++) lp.push(rnd() < 0.28 ? leadNotes[Math.floor(rnd() * leadNotes.length)] : 0);
  const acidSeq = []; for (let i = 0; i < 16; i++) acidSeq.push([0, 0, 12, 3, 7, 0, 10, 12][Math.floor(rnd() * 8)] + (rnd() < 0.2 ? 12 : 0));
  const accents = []; for (let i = 0; i < 16; i++) accents.push(rnd() < 0.3 ? 1 : 0);
  const stepDur = () => 60 / L.bpm / 4;
  L.advance = () => {
    const sw = spec.sw || 0;
    L.next += stepDur() * (L.step % 2 === 0 ? 1 + sw : 1 - sw);
    L.step++;
  };
  L.playStep = (step, t) => {
    const s = step % 16, bar = Math.floor(step / 16) % 4, e = L.energy;
    const deg = prog[bar];
    if (s % 4 === 0) L.beatCbs.forEach(f => { try { f(Math.floor(step / 4), t); } catch (er) { /* ignore */ } });
    if (spec.slow && false) return;
    const on = (p) => p && p[s];
    // drums
    if (on(P.k) && !(e <= 1 && genre === "ambient")) kick(t, drums, spec.soft ? 0.55 : 0.95, genre === "techno" ? 130 : 150, genre === "hip-hop" ? 50 : 45, genre === "techno" ? 0.4 : 0.32);
    if (e >= 2 && on(P.h)) hat(t, drums, 0.14 * P.h[s]);
    if (e >= 3 && on(P.c)) clap(t, drums, 0.42);
    if (e >= 2 && on(P.sn)) snare(t, drums, 0.45);
    if (e >= 4 && on(P.o)) hat(t, drums, 0.12, true);
    if (e >= 3 && on(P.sh)) shaker(t, drums, 0.05);
    if (e >= 3 && on(P.rim)) rim(t, drums, 0.14);
    if (e >= 3 && on(P.cb)) cowbell(t, drums, 0.08);
    if (e >= 2 && on(P.conga)) conga(t, drums, [220, 330, 262][s % 3], 0.28);
    if (e >= 3 && on(P.clave)) rim(t, drums, 0.12);
    if (genre === "techno" && e >= 2 && s % 4 === 2) { kick(t, drums, 0.25, 70, 40, 0.25); }
    // bass
    const bnote = root + deg;
    if (bp[s] || (spec.acid)) {
      const kind = spec.bass;
      if (kind === "acid") { if (bp[s]) bass(t, music, root + 12 + acidSeq[s], stepDur() * 0.9, "acid", 0.32, 380 + 900 * (0.5 + 0.5 * Math.sin(step / 24)), accents[s]); }
      else if (kind === "octave") bass(t, music, bnote + (s % 2 ? 12 : 0), stepDur() * 1.6, "saw", 0.3, 700);
      else if (kind === "rumble") bass(t, music, bnote - 12, stepDur() * 2, "sine", 0.4, 300);
      else bass(t, music, bnote, stepDur() * (kind === "sine" ? 3 : 1.8), kind, kind === "sine" ? 0.5 : 0.3, kind === "organ" ? 900 : 700);
    }
    // chords
    const sc = SCALES[spec.scale] || SCALES.minor7;
    const notes = sc.map(i => root + 24 + deg + i);
    if (spec.ch === "pad" || spec.ch2 === "strings" || spec.ch === "strings") { if (s === 0 && e >= 1) chord(t, music, notes, stepDur() * 16, "pad", 0.06, 1600); }
    if ((spec.ch === "stab" || spec.ch === "organ" || spec.ch === "eurodance") && e >= 2 && stabSteps[s]) chord(t, music, notes, stepDur() * 1.5, spec.ch, spec.ch === "eurodance" ? 0.08 : 0.07, spec.ch === "organ" ? 1800 : 2400);
    if ((spec.ch === "epiano" || spec.ch2 === "epiano") && e >= 1 && (s === 0 || s === 6 || s === 10)) chord(t, music, notes, stepDur() * 4, "epiano", 0.07, 2600);
    if (spec.lead && e >= 4 && lp[s] && (bar % 2 === 1 || genre === "smooth jazz")) lead(t, music, lp[s] + deg, stepDur() * 2.5, genre === "smooth jazz" ? 0.09 : 0.06, true);
  };
  const ctl = {
    start(at) {
      const c2 = ctx(); if (!c2) return;
      L.running = true; L.step = 0; L.next = (at || c2.currentTime) + 0.05; L.tBase = L.next; L.beatBase = 0;
      loops.add(L); ensureTimer();
    },
    stop(fadeSec = 0) {
      if (!L.running) return;
      if (fadeSec > 0) { const t = AC.currentTime; out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0.0001, t + fadeSec); setTimeout(() => { L.running = false; loops.delete(L); try { out.disconnect(); } catch (e) { /* ignore */ } }, fadeSec * 1000 + 50); }
      else { L.running = false; loops.delete(L); try { out.disconnect(); } catch (e) { /* ignore */ } }
    },
    setBpm(b) { const ph = ctl.phase(); L.bpm = clamp(b, 40, 220); L.beatBase = ph; L.tBase = AC.currentTime; },
    getBpm: () => L.bpm,
    setVolume(v, ramp = 0.05) { out.gain.cancelScheduledValues(AC.currentTime); out.gain.setTargetAtTime(v, AC.currentTime, ramp); },
    setFilter(type, freq) {
      if (!type || type === "none") { filt.type = "allpass"; filt.frequency.value = 20000; return; }
      filt.type = type; filt.Q.value = 4; filt.frequency.setTargetAtTime(freq, AC.currentTime, 0.04);
    },
    setEnergy(e) { L.energy = clamp(Math.round(e), 1, 5); },
    nudge(db) { L.next -= db * 60 / L.bpm; L.beatBase += db; },
    phase() { if (!L.running) return 0; return L.beatBase + Math.max(0, AC.currentTime - L.tBase) * L.bpm / 60; },
    onBeat(f) { L.beatCbs.push(f); },
    output: out,
    connect(node) { try { out.disconnect(); } catch (e) { /* ignore */ } out.connect(node); }
  };
  return ctl;
}
audio.loop = loop;
audio.recordLoop = (r, o = {}) => loop(Object.assign({ genre: r.genre, bpm: r.bpm, seed: hashStr(r.id || "x"), energy: r.energy || 3 }, o));

audio.mixer = function () {
  const c = ctx();
  if (!c) return { a: null, b: null, setCrossfader() {}, setChannel() {}, setEQ() {}, output: null };
  const mk2 = () => {
    const inp = AC.createGain(), lo = AC.createBiquadFilter(), mid = AC.createBiquadFilter(), hi = AC.createBiquadFilter(), fader = AC.createGain(), xf = AC.createGain();
    lo.type = "lowshelf"; lo.frequency.value = 200; mid.type = "peaking"; mid.frequency.value = 1000; mid.Q.value = 0.8; hi.type = "highshelf"; hi.frequency.value = 4000;
    inp.connect(lo); lo.connect(mid); mid.connect(hi); hi.connect(fader); fader.connect(xf);
    return { inp, lo, mid, hi, fader, xf };
  };
  const a = mk2(), b = mk2(), out = AC.createGain();
  a.xf.connect(out); b.xf.connect(out); out.connect(musicBus);
  const m = {
    a: a.inp, b: b.inp, output: out,
    setCrossfader(x) { x = clamp(x, 0, 1); a.xf.gain.setTargetAtTime(Math.cos(x * Math.PI / 2), AC.currentTime, 0.02); b.xf.gain.setTargetAtTime(Math.sin(x * Math.PI / 2), AC.currentTime, 0.02); },
    setChannel(ch, v) { (ch === "a" ? a : b).fader.gain.setTargetAtTime(v, AC.currentTime, 0.02); },
    setEQ(ch, o) { const s = ch === "a" ? a : b; if (o.low != null) s.lo.gain.value = o.low; if (o.mid != null) s.mid.gain.value = o.mid; if (o.high != null) s.hi.gain.value = o.high; },
    disconnect() { try { out.disconnect(); } catch (e) { /* ignore */ } }
  };
  m.setCrossfader(0.5);
  return m;
};

/* ---------------- background music & ambience ---------------- */
let music = null, musicKey = "";
audio.setMusic = function (spec, fadeSec = 1.2) {
  const key = spec ? JSON.stringify(spec) : "";
  if (key === musicKey) return;
  musicKey = key;
  if (music) { const m = music; m.stop(fadeSec); music = null; }
  if (!spec || !ctx()) return;
  music = loop({ genre: spec.genre || "house", bpm: spec.bpm || 122, seed: spec.seed || hashStr(spec.genre || "x"), energy: spec.energy || 3, volume: 0.0001 });
  if (spec.filter) music.setFilter(spec.filter[0], spec.filter[1]);
  music.start();
  music.setVolume(spec.volume == null ? 0.5 : spec.volume, fadeSec / 3);
};
audio.music = () => music;
RP.setMusic = audio.setMusic;

let amb = null, ambKind = null;
audio.ambience = function (kind) {
  const c = ctx(); if (!c) return { stop() {}, setVolume() {} };
  const out = AC.createGain(); out.gain.value = 0.0001; out.connect(ambBus);
  const nodes = [], ivs = [];
  const bed = (type, freq, vol, q = 0.7) => {
    const s = AC.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = AC.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(out); s.start(); nodes.push(s); return { f, g };
  };
  let sub = null;
  if (kind === "street") { bed("lowpass", 500, 0.5); bed("bandpass", 1200, 0.06); ivs.push(setInterval(() => { if (Math.random() < 0.25 && !audio.muted) { const t = AC.currentTime; tone(t, out, "square", 380 + Math.random() * 80, 0.03, 0.01, 0.3); } }, 2500)); }
  else if (kind === "rain") { bed("highpass", 2500, 0.35); bed("lowpass", 400, 0.2); }
  else if (kind === "crowd") { const b = bed("bandpass", 700, 0.5, 1.4); const l = AC.createOscillator(), lg = AC.createGain(); l.frequency.value = 0.3; lg.gain.value = 250; l.connect(lg); lg.connect(b.f.frequency); l.start(); nodes.push(l); }
  else if (kind === "club_through_wall") { sub = loop({ genre: "house", bpm: 124, seed: 77, energy: 3, volume: 0.6, dest: out }); sub.setFilter("lowpass", 260); sub.start(); }
  else if (kind === "subway") { bed("lowpass", 180, 0.7); bed("bandpass", 900, 0.05); }
  else if (kind === "office") { const o = AC.createOscillator(); o.frequency.value = 60; const g = AC.createGain(); g.gain.value = 0.04; o.connect(g); g.connect(out); o.start(); nodes.push(o); bed("lowpass", 300, 0.15); ivs.push(setInterval(() => { if (Math.random() < 0.6 && !audio.muted) noise(AC.currentTime, out, "highpass", 4000, 0.05, 0.02); }, 300)); }
  else if (kind === "festival") { bed("bandpass", 600, 0.5, 0.8); sub = loop({ genre: "festival", bpm: 126, seed: 9, energy: 4, volume: 0.5, dest: out }); sub.setFilter("lowpass", 500); sub.start(); }
  else if (kind === "airport") { bed("lowpass", 700, 0.35); ivs.push(setInterval(() => { if (Math.random() < 0.15 && !audio.muted) { const t = AC.currentTime; tone(t, out, "sine", 660, 0.05, 0.02, 0.5); tone(t + 0.45, out, "sine", 523, 0.05, 0.02, 0.6); } }, 4000)); }
  else { bed("lowpass", 220, 0.15); }
  out.gain.setTargetAtTime(1, AC.currentTime, 0.4);
  return {
    stop(f = 1) { out.gain.setTargetAtTime(0.0001, AC.currentTime, f / 3); ivs.forEach(clearInterval); setTimeout(() => { nodes.forEach(n => { try { n.stop(); } catch (e) { /* ignore */ } }); if (sub) sub.stop(); try { out.disconnect(); } catch (e) { /* ignore */ } }, f * 1000 + 200); },
    setVolume(v) { out.gain.setTargetAtTime(v, AC.currentTime, 0.2); }
  };
};
audio.setAmbience = function (kind, f = 1) {
  if (kind === ambKind) return;
  ambKind = kind;
  if (amb) { amb.stop(f); amb = null; }
  if (kind && ctx()) amb = audio.ambience(kind);
};
audio.stopAll = function (f = 0.5) { audio.setMusic(null, f); audio.setAmbience(null, f); loops.forEach(L => { L.running = false; }); loops.clear(); };

/* ---------------- sfx ---------------- */
const S = {};
const D = () => sfxBus;
S.click = () => noise(AC.currentTime, D(), "highpass", 3000, 0.25, 0.03);
S.thump = () => { const t = AC.currentTime; [0, 0.32].forEach(o => kick(t + o, D(), 0.9, 90, 40)); };
S.crackle = () => { const t = AC.currentTime; for (let i = 0; i < 10; i++) noise(t + Math.random() * 0.6, D(), "bandpass", 2000 + Math.random() * 3000, 0.35, 0.04); };
S.ring = () => { const t = AC.currentTime; [0, 0.5].forEach(o => { tone(t + o, D(), "sine", 440, 0.1, 0.02, 0.33); tone(t + o, D(), "sine", 480, 0.08, 0.02, 0.33); }); };
S.buzz = () => { const t = AC.currentTime; [0, 0.3].forEach(o => tone(t + o, D(), "square", 120, 0.08, 0.01, 0.2)); };
S.ping = () => { const t = AC.currentTime; tone(t, D(), "sine", 1320, 0.12, 0.005, 0.15); tone(t + 0.09, D(), "sine", 1760, 0.1, 0.005, 0.2); };
S.door = () => { const t = AC.currentTime; noise(t, D(), "lowpass", 400, 0.5, 0.25); kick(t + 0.18, D(), 0.5, 110, 50, 0.2); };
S.doorBuzz = () => tone(AC.currentTime, D(), "sawtooth", 110, 0.12, 0.01, 0.7);
S.footstep = () => noise(AC.currentTime, D(), "lowpass", 600, 0.2, 0.05);
S.coin = () => { const t = AC.currentTime; tone(t, D(), "square", 988, 0.07, 0.002, 0.08); tone(t + 0.07, D(), "square", 1319, 0.07, 0.002, 0.25); };
S.cash = () => { const t = AC.currentTime; noise(t, D(), "bandpass", 3000, 0.25, 0.08); tone(t + 0.05, D(), "triangle", 2093, 0.12, 0.002, 0.35); tone(t + 0.05, D(), "triangle", 2637, 0.08, 0.002, 0.4); };
S.pickup = () => { const t = AC.currentTime; tone(t, D(), "triangle", 660, 0.12, 0.004, 0.08); tone(t + 0.06, D(), "triangle", 990, 0.1, 0.004, 0.12); };
S.drop = () => kick(AC.currentTime, D(), 0.4, 200, 80, 0.12);
S.error = () => { const t = AC.currentTime; tone(t, D(), "square", 180, 0.08, 0.005, 0.12); tone(t + 0.13, D(), "square", 140, 0.08, 0.005, 0.2); };
S.success = () => { const t = AC.currentTime; [523, 659, 784, 1047].forEach((f, i) => tone(t + i * 0.08, D(), "triangle", f, 0.12, 0.005, 0.25)); };
S.unlock = () => { const t = AC.currentTime; rim(t, D(), 0.3); rim(t + 0.09, D(), 0.25); };
S.camera = () => { const t = AC.currentTime; noise(t, D(), "highpass", 2000, 0.4, 0.04); noise(t + 0.07, D(), "highpass", 2500, 0.3, 0.05); };
S.typing = () => { const t = AC.currentTime; for (let i = 0; i < 6; i++) noise(t + i * 0.07 + Math.random() * 0.03, D(), "highpass", 3500, 0.15, 0.02); };
S.microwave = () => { const t = AC.currentTime; [0, 0.25, 0.5].forEach(o => tone(t + o, D(), "square", 2000, 0.06, 0.002, 0.12)); };
S.alarm = () => { const t = AC.currentTime; for (let i = 0; i < 6; i++) tone(t + i * 0.3, D(), "square", i % 2 ? 900 : 700, 0.08, 0.01, 0.26); };
S.spray = () => noise(AC.currentTime, D(), "highpass", 5000, 0.3, 0.5);
S.scratch = () => { const t = AC.currentTime; const s = AC.createBufferSource(); s.buffer = noiseBuf; const f = AC.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 3; f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(2400, t + 0.12); f.frequency.linearRampToValueAtTime(300, t + 0.3); const g = AC.createGain(); env(g, t, 0.01, 0.5, 0.3); s.connect(f); f.connect(g); g.connect(D()); s.start(t); s.stop(t + 0.35); };
S.needle = () => { const t = AC.currentTime; kick(t, D(), 0.3, 300, 100, 0.08); for (let i = 0; i < 8; i++) noise(t + 0.05 + Math.random() * 0.5, D(), "bandpass", 3000, 0.12, 0.015); };
S.rewind = () => { const t = AC.currentTime; tone(t, D(), "sawtooth", 1400, 0.06, 0.01, 0.4, 200); };
S.cheer = () => { const t = AC.currentTime; const s = AC.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const f = AC.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 900; f.Q.value = 0.6; const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5, t + 0.4); g.gain.linearRampToValueAtTime(0.0001, t + 2.2); s.connect(f); f.connect(g); g.connect(D()); s.start(t); s.stop(t + 2.3); for (let i = 0; i < 5; i++) tone(t + 0.2 + Math.random() * 0.8, D(), "sine", 900 + Math.random() * 600, 0.03, 0.05, 0.3); };
S.boo = () => { const t = AC.currentTime; tone(t, D(), "sawtooth", 160, 0.08, 0.2, 1.0, 120); noise(t, D(), "lowpass", 500, 0.25, 1.1); };
S.whoosh = () => { const t = AC.currentTime; const s = AC.createBufferSource(); s.buffer = noiseBuf; const f = AC.createBiquadFilter(); f.type = "bandpass"; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(3000, t + 0.3); const g = AC.createGain(); env(g, t, 0.1, 0.3, 0.25); s.connect(f); f.connect(g); g.connect(D()); s.start(t); s.stop(t + 0.4); };
S.train = () => { const t = AC.currentTime; noise(t, D(), "lowpass", 220, 0.7, 2.0); for (let i = 0; i < 6; i++) kick(t + i * 0.28, D(), 0.25, 80, 50, 0.1); tone(t + 1.4, D(), "sawtooth", 1800, 0.03, 0.05, 0.6, 1500); };
S.siren = () => { const t = AC.currentTime; const o = AC.createOscillator(), g = AC.createGain(); o.type = "triangle"; o.frequency.setValueAtTime(600, t); for (let i = 0; i < 4; i++) { o.frequency.linearRampToValueAtTime(900, t + i * 0.6 + 0.3); o.frequency.linearRampToValueAtTime(600, t + i * 0.6 + 0.6); } g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.04, t + 0.3); g.gain.linearRampToValueAtTime(0.0001, t + 2.4); o.connect(g); g.connect(D()); o.start(t); o.stop(t + 2.5); };
S.splash = () => noise(AC.currentTime, D(), "lowpass", 1500, 0.4, 0.4);
S.zip = () => { const t = AC.currentTime; for (let i = 0; i < 10; i++) noise(t + i * 0.02, D(), "bandpass", 2500 + i * 200, 0.12, 0.015, 4); };
S.shower = () => { const t = AC.currentTime; noise(t, D(), "highpass", 1800, 0.25, 1.6); };
S.knock = () => { const t = AC.currentTime; [0, 0.16, 0.32].forEach(o => kick(t + o, D(), 0.5, 220, 120, 0.08)); };
S.glass = () => { const t = AC.currentTime; tone(t, D(), "sine", 2400, 0.1, 0.002, 0.4); tone(t, D(), "sine", 3100, 0.06, 0.002, 0.3); };
S.horn = () => { const t = AC.currentTime; tone(t, D(), "square", 392, 0.06, 0.01, 0.35); tone(t, D(), "square", 330, 0.05, 0.01, 0.35); };
S.blip = () => tone(AC.currentTime, D(), "square", 1500, 0.05, 0.002, 0.04);
S.select = () => { const t = AC.currentTime; tone(t, D(), "square", 880, 0.05, 0.002, 0.05); tone(t + 0.04, D(), "square", 1320, 0.05, 0.002, 0.06); };
S.fail = () => { const t = AC.currentTime; [392, 330, 262].forEach((f, i) => tone(t + i * 0.12, D(), "triangle", f, 0.1, 0.005, 0.25)); };
audio.sfx = new Proxy(S, { get: (o, k) => (opt) => { if (!ok() || !o[k]) return; try { o[k](opt); } catch (e) { /* ignore */ } } });
audio.drums = { kick: (t, d, v) => ok() && kick(t, d || sfxBus, v), clap: (t, d, v) => ok() && clap(t, d || sfxBus, v), hat: (t, d, v, o) => ok() && hat(t, d || sfxBus, v, o), snare: (t, d, v) => ok() && snare(t, d || sfxBus, v) };
audio.tone = (freq, dur = 0.15, type = "square", vol = 0.08) => { if (ok()) tone(AC.currentTime, sfxBus, type, freq, vol, 0.005, dur); };
audio.now = () => (AC ? AC.currentTime : performance.now() / 1000);
})();
