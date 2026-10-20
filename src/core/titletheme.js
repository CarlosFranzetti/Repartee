/* Title theme: a 16-bar, 124 BPM house loop. A deep, filtered bass with one dark offbeat note, synth bleeps, and low-mid
   plucks that land at random and ring out through a tempo-synced echo. Everything is synthesized with Web Audio (no audio
   files). RP.audio.titleTheme.start() / .stop(fadeSec) / .running; start needs a user gesture (the title wires that up). */
const RP = window.RP;
const audio = RP.audio;
const BPM = 124, STEP = 60 / BPM / 4, BARS = 16, STEPS = BARS * 16;
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

// four-bar progression in E minor / G major: bass root, then the chord notes for stabs and pad
const PROG = [
  { r: 40, ch: [55, 59, 62, 64] }, // Em9
  { r: 36, ch: [55, 60, 64, 67] }, // C
  { r: 31, ch: [55, 59, 62, 66] }, // Gmaj7 (bass an octave down)
  { r: 38, ch: [57, 62, 66, 69] }  // D
];
// the bleep riff (semitones above the bar's chord root + 52; 0 = rest), repeated every bar with a different density
const RIFF = [0, 24, 0, 31, 0, 24, 36, 0, 31, 0, 28, 0, 36, 0, 31, 24];
let AC = null, N = null; // N: the live node graph while running
const T = audio.titleTheme = { running: false };

function build() {
  const b = audio.buses();
  const out = AC.createGain(); out.gain.value = 0.0001; out.connect(b.music);
  const duck = AC.createGain(); duck.connect(out);
  // echo: a dotted eighth that repeats and darkens
  const echoIn = AC.createGain();
  const dl = AC.createDelay(2); dl.delayTime.value = STEP * 3;
  const fb = AC.createGain(); fb.gain.value = 0.46;
  const fl = AC.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = 3000;
  const echoOut = AC.createGain(); echoOut.gain.value = 0.6;
  echoIn.connect(dl); dl.connect(fl); fl.connect(fb); fb.connect(dl); dl.connect(echoOut); echoOut.connect(out);
  const bleepSend = AC.createGain(); bleepSend.gain.value = 0.35; bleepSend.connect(echoIn);
  const pluckSend = AC.createGain(); pluckSend.gain.value = 0.95; pluckSend.connect(echoIn);
  return { out, duck, echoIn, bleepSend, pluckSend, noise: b.noise };
}

/* ---- the band ---- */
function kick(t) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
  g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  o.connect(g); g.connect(N.out); o.start(t); o.stop(t + 0.32);
  N.duck.gain.setValueAtTime(0.35, t); N.duck.gain.linearRampToValueAtTime(1, t + 0.2); // sidechain pump
}
function hat(t, open) {
  const s = AC.createBufferSource(); s.buffer = N.noise;
  const f = AC.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7600;
  const g = AC.createGain(), len = open ? 0.2 : 0.04;
  g.gain.setValueAtTime(open ? 0.2 : 0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  s.connect(f); f.connect(g); g.connect(N.out); s.start(t, Math.random() * 0.4); s.stop(t + len + 0.02);
}
function clap(t) {
  [0, 0.012, 0.024].forEach(o => {
    const s = AC.createBufferSource(); s.buffer = N.noise;
    const f = AC.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1300; f.Q.value = 1;
    const g = AC.createGain(); g.gain.setValueAtTime(0.3, t + o); g.gain.exponentialRampToValueAtTime(0.001, t + o + (o > 0.02 ? 0.16 : 0.03));
    s.connect(f); f.connect(g); g.connect(N.out); s.start(t + o, Math.random() * 0.4); s.stop(t + o + 0.2);
  });
}
function bass(t, note, len, dark) {
  // a saw through a low, closing filter for the body, a sine on top of it for weight; the dark note closes further and sits a little flat
  const f = AC.createBiquadFilter(), g = AC.createGain();
  f.type = "lowpass"; f.Q.value = dark ? 7 : 4;
  f.frequency.setValueAtTime(dark ? 380 : 520, t); f.frequency.exponentialRampToValueAtTime(dark ? 90 : 120, t + len);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(dark ? 0.36 : 0.4, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  f.connect(g); g.connect(N.duck);
  const saw = AC.createOscillator(); saw.type = "sawtooth"; saw.frequency.value = midi(note); if (dark) saw.detune.value = -18;
  const sub = AC.createOscillator(); sub.type = "sine"; sub.frequency.value = midi(note); if (dark) sub.detune.value = -18;
  const sg = AC.createGain(); sg.gain.value = 0.9;
  saw.connect(f); sub.connect(sg); sg.connect(g);
  saw.start(t); sub.start(t); saw.stop(t + len + 0.02); sub.stop(t + len + 0.02);
}
function stab(t, notes, len, vol) {
  const f = AC.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(700, t + len);
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  f.connect(g); g.connect(N.duck);
  notes.forEach(n => { const o = AC.createOscillator(); o.type = "sawtooth"; o.frequency.value = midi(n); o.detune.value = (n % 3 - 1) * 5; o.connect(f); o.start(t); o.stop(t + len + 0.02); });
}
function pad(t, notes, len) {
  const g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.03, t + 0.5); g.gain.setValueAtTime(0.03, t + len - 0.5); g.gain.linearRampToValueAtTime(0.0001, t + len);
  const f = AC.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1500;
  f.connect(g); g.connect(N.duck);
  notes.forEach(n => { const o = AC.createOscillator(); o.type = "triangle"; o.frequency.value = midi(n); o.connect(f); o.start(t); o.stop(t + len + 0.05); });
}
function bleep(t, note, vol, bright) {
  const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
  o.type = "square"; o.frequency.setValueAtTime(midi(note) * 1.5, t); o.frequency.exponentialRampToValueAtTime(midi(note), t + 0.025);
  f.type = "lowpass"; f.frequency.value = bright; f.Q.value = 6;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  o.connect(f); f.connect(g); g.connect(N.out); g.connect(N.bleepSend); o.start(t); o.stop(t + 0.12);
}

/* a low-mid pluck: a triangle that drops in pitch, a woody click, a filter that closes; most of it goes to the echo */
function pluck(t, note, vol) {
  const f0 = midi(note);
  const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
  o.type = "triangle"; o.frequency.setValueAtTime(f0 * 1.05, t); o.frequency.exponentialRampToValueAtTime(f0, t + 0.03);
  f.type = "lowpass"; f.frequency.setValueAtTime(1800, t); f.frequency.exponentialRampToValueAtTime(380, t + 0.18); f.Q.value = 3;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(f); f.connect(g); g.connect(N.out); g.connect(N.pluckSend); o.start(t); o.stop(t + 0.25);
  const s = AC.createBufferSource(); s.buffer = N.noise;
  const nf = AC.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = f0 * 5; nf.Q.value = 2;
  const ng = AC.createGain(); ng.gain.setValueAtTime(vol * 0.5, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
  s.connect(nf); nf.connect(ng); ng.connect(N.pluckSend); ng.connect(N.out); s.start(t, Math.random() * 0.4); s.stop(t + 0.04);
}

function schedule(step, t) {
  const bar = (step / 16) | 0, s = step % 16, ch = PROG[bar % 4];
  if (s % 4 === 0) kick(t);
  if (s % 4 === 2) hat(t, s % 8 === 6);
  if (bar >= 4 && (s === 4 || s === 12)) clap(t);
  if (bar >= 8 && s % 2 === 1) hat(t, false);
  if (s === 2 || s === 6 || s === 10) bass(t, ch.r, STEP * 3);
  if (s === 14) bass(t, ch.r + 1, STEP * 3.4, true); // the dark offbeat note: a flat second above the root
  if (bar >= 2 && (s === 3 || s === 6 || s === 10 || s === 14)) stab(t, ch.ch, STEP * 1.6, bar >= 8 ? 0.05 : 0.035);
  if (s === 0 && bar >= 4) pad(t, ch.ch, STEP * 16);
  // bleeps: sparse in the first four bars, then the full riff, with a filter that opens as the loop goes on
  const dense = bar < 4 ? (s % 4 === 0 || s === 7 || s === 11) : true;
  const r = RIFF[s];
  // plucks at random: a few per bar from bar 3 on, now and then in pairs, never on the kick
  if (bar >= 2 && s % 4 !== 0 && Math.random() < (bar >= 8 ? 0.3 : 0.2)) {
    const pool = Math.random() < 0.25 ? ch.ch.map(n => n - 12) : ch.ch;
    pluck(t, pool[(Math.random() * pool.length) | 0], 0.1 + Math.random() * 0.08);
    if (Math.random() < 0.18) pluck(t + STEP * 0.5, pool[(Math.random() * pool.length) | 0], 0.07);
  }
  if (r && dense) bleep(t, (ch.r < 33 ? ch.r + 12 : ch.r) + r + (bar >= 12 && s % 4 === 3 ? 12 : 0), bar < 4 ? 0.05 : 0.07, 1800 + (bar / 16) * 3200);
}

T.start = function (fadeSec = 1.2) {
  if (T.running) return;
  AC = audio.ctx(); if (!AC || !audio.buses().music) return;
  N = build();
  N.out.gain.setValueAtTime(0.0001, AC.currentTime); N.out.gain.linearRampToValueAtTime(0.9, AC.currentTime + fadeSec);
  T.running = true;
  let step = 0, next = AC.currentTime + 0.1;
  const tick = () => { while (next < AC.currentTime + 0.18) { schedule(step, next); next += STEP; step = (step + 1) % STEPS; } };
  tick();
  N.timer = setInterval(tick, 30);
};
T.stop = function (fadeSec = 0.6) {
  if (!T.running) return;
  T.running = false;
  const n = N; clearInterval(n.timer);
  try { n.out.gain.cancelScheduledValues(AC.currentTime); n.out.gain.setValueAtTime(Math.max(n.out.gain.value, 0.0001), AC.currentTime); n.out.gain.linearRampToValueAtTime(0.0001, AC.currentTime + fadeSec); } catch (e) { /* context gone */ }
  setTimeout(() => { try { n.out.disconnect(); } catch (e) { /* already gone */ } }, (fadeSec + 0.3) * 1000);
};
