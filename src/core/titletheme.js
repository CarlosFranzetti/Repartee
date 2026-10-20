/* Title theme: a 16-bar house loop at 124 BPM with synth bleeps. Halfway through, a digitally crunched female voice
   sings "Re Party ... ree, ree, Party!" into a tempo-synced echo. Everything is synthesized with Web Audio (no audio
   files): the voice is a pitched sawtooth through three formant filters, plus short noise bursts for the P and T.
   RP.audio.titleTheme.start() / .stop(fadeSec) / .running; start needs a user gesture (the title wires that up). */
const RP = window.RP;
const audio = RP.audio;
const BPM = 124, STEP = 60 / BPM / 4, BARS = 16, STEPS = BARS * 16;
const midi = n => 440 * Math.pow(2, (n - 69) / 12);

// four-bar progression in E minor / G major: bass root, then the chord notes for stabs and pad
const PROG = [
  { r: 40, ch: [55, 59, 62, 64] }, // Em9
  { r: 36, ch: [55, 60, 64, 67] }, // C
  { r: 43, ch: [55, 59, 62, 66] }, // Gmaj7
  { r: 38, ch: [57, 62, 66, 69] }  // D
];
// the bleep riff (semitones above the bar's chord root + 52; 0 = rest), repeated every bar with a different density
const RIFF = [0, 24, 0, 31, 0, 24, 36, 0, 31, 0, 28, 0, 36, 0, 31, 24];
// vowel formants (F1, F2, F3 in Hz), approximate values for a female voice
const VOWEL = { i: [310, 2790, 3310], a: [850, 1220, 2810], r: [490, 1350, 1690] };
const FQ = [[7, 1], [10, 0.55], [12, 0.3]]; // [Q, gain] for each formant
// the sung line over two bars (steps from the start of a 32-step phrase)
const PHRASE = [
  { s: 0, syl: "re", n: 76, len: 3 },  // Re
  { s: 4, syl: "par", n: 79, len: 3 }, // Par-
  { s: 7, syl: "ty", n: 76, len: 7 },  // -ty
  { s: 16, syl: "re", n: 71, len: 3 }, // ree
  { s: 20, syl: "re", n: 74, len: 3 }, // ree
  { s: 24, syl: "par", n: 79, len: 3 }, // Par-
  { s: 27, syl: "ty", n: 83, len: 9 }  // -ty!
];
const SYL = {
  re: { pre: null, from: "r", to: "i", glide: 0.22 },
  par: { pre: "p", from: "a", to: "r", glide: 0.6, lateGlide: true },
  ty: { pre: "t", from: "i", to: "i", glide: 0.1 }
};
const VOICE_BARS = [8, 12]; // bars where the phrase starts: the middle of the loop, and again a bar-pair later

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
  // the voice: crunch it a little (quantize to ~32 steps), then dry and echo sends
  const vox = AC.createGain(); vox.gain.value = 1.5;
  const crush = AC.createWaveShaper();
  const curve = new Float32Array(2049);
  for (let i = 0; i < curve.length; i++) { const x = i / 1024 - 1; curve[i] = Math.max(-1, Math.min(1, Math.round(x * 16) / 16)); }
  crush.curve = curve;
  const voxHp = AC.createBiquadFilter(); voxHp.type = "highpass"; voxHp.frequency.value = 220;
  const voxOut = AC.createGain(); voxOut.gain.value = 0.42;
  const voxSend = AC.createGain(); voxSend.gain.value = 0.8;
  vox.connect(crush); crush.connect(voxHp); voxHp.connect(voxOut); voxOut.connect(out); voxHp.connect(voxSend); voxSend.connect(echoIn);
  const bleepSend = AC.createGain(); bleepSend.gain.value = 0.35; bleepSend.connect(echoIn);
  return { out, duck, echoIn, dl, fb, fl, echoOut, vox, crush, voxHp, voxOut, voxSend, bleepSend, noise: b.noise };
}

/* ---- voices ---- */
function burst(t, kind) {
  const s = AC.createBufferSource(); s.buffer = N.noise;
  const f = AC.createBiquadFilter();
  if (kind === "p") { f.type = "bandpass"; f.frequency.value = 1100; f.Q.value = 0.7; } else { f.type = "highpass"; f.frequency.value = 4200; f.Q.value = 0.7; }
  const g = AC.createGain(); const len = kind === "p" ? 0.035 : 0.022;
  g.gain.setValueAtTime(kind === "p" ? 0.5 : 0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  s.connect(f); f.connect(g); g.connect(N.vox); s.start(t, Math.random() * 0.4); s.stop(t + len + 0.02);
}
function sing(t, note, dur, name) {
  const sy = SYL[name], f0 = midi(note);
  const lead = sy.pre ? 0.03 : 0; // the vowel starts just after the P or T
  if (sy.pre) burst(t, sy.pre);
  const v0 = t + lead, end = t + dur;
  const amp = AC.createGain();
  amp.gain.setValueAtTime(0.0001, v0); amp.gain.linearRampToValueAtTime(0.5, v0 + 0.025);
  amp.gain.setValueAtTime(0.5, end - 0.07); amp.gain.exponentialRampToValueAtTime(0.0001, end);
  const lfo = AC.createOscillator(), lg = AC.createGain();
  lfo.frequency.value = 5.6; lg.gain.setValueAtTime(0, v0); lg.gain.linearRampToValueAtTime(f0 * 0.011, v0 + dur * 0.8);
  lfo.connect(lg);
  // two slightly detuned saws read as one fuller voice
  [-6, 6].forEach(c => {
    const o = AC.createOscillator(); o.type = "sawtooth"; o.detune.value = c;
    o.frequency.setValueAtTime(f0 * 0.96, v0); o.frequency.exponentialRampToValueAtTime(f0, v0 + 0.05);
    lg.connect(o.frequency); o.connect(amp); o.start(v0); o.stop(end + 0.05);
  });
  lfo.start(v0); lfo.stop(end + 0.05);
  const A = VOWEL[sy.from], B = VOWEL[sy.to];
  const gStart = sy.lateGlide ? v0 + (end - v0) * sy.glide : v0 + (end - v0) * 0.05;
  const gEnd = sy.lateGlide ? end : v0 + (end - v0) * Math.max(sy.glide, 0.1);
  FQ.forEach(([q, gain], k) => {
    const bp = AC.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = q;
    bp.frequency.setValueAtTime(A[k], v0); bp.frequency.setValueAtTime(A[k], gStart); bp.frequency.linearRampToValueAtTime(B[k], gEnd);
    const g = AC.createGain(); g.gain.value = gain * (k === 0 ? 1.6 : 1.1);
    amp.connect(bp); bp.connect(g); g.connect(N.vox);
  });
  // breath
  const ns = AC.createBufferSource(); ns.buffer = N.noise; ns.loop = true;
  const nf = AC.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 2600; nf.Q.value = 1.2;
  const ng = AC.createGain(); ng.gain.setValueAtTime(0.0001, v0); ng.gain.linearRampToValueAtTime(0.05, v0 + 0.03); ng.gain.exponentialRampToValueAtTime(0.0001, end);
  ns.connect(nf); nf.connect(ng); ng.connect(N.vox); ns.start(v0); ns.stop(end + 0.02);
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
function bass(t, note, len) {
  const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
  o.type = "sawtooth"; o.frequency.value = midi(note);
  f.type = "lowpass"; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(220, t + len); f.Q.value = 4;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.32, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(f); f.connect(g); g.connect(N.duck); o.start(t); o.stop(t + len + 0.02);
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

function schedule(step, t) {
  const bar = (step / 16) | 0, s = step % 16, ch = PROG[bar % 4];
  if (s % 4 === 0) kick(t);
  if (s % 4 === 2) hat(t, s % 8 === 6);
  if (bar >= 4 && (s === 4 || s === 12)) clap(t);
  if (bar >= 8 && s % 2 === 1) hat(t, false);
  if (s === 2 || s === 6 || s === 10 || s === 14) bass(t, ch.r + (s === 14 ? 12 : 0), STEP * 2.4);
  if (bar >= 2 && (s === 3 || s === 6 || s === 10 || s === 14)) stab(t, ch.ch, STEP * 1.6, bar >= 8 ? 0.05 : 0.035);
  if (s === 0 && bar >= 4) pad(t, ch.ch, STEP * 16);
  // bleeps: sparse in the first four bars, then the full riff, with a filter that opens as the loop goes on
  const dense = bar < 4 ? (s % 4 === 0 || s === 7 || s === 11) : true;
  const r = RIFF[s];
  if (r && dense) bleep(t, ch.r + r + (bar >= 12 && s % 4 === 3 ? 12 : 0), bar < 4 ? 0.05 : 0.07, 1800 + (bar / 16) * 3200);
  // the vocal phrase
  VOICE_BARS.forEach(vb => {
    if (bar < vb || bar >= vb + 2) return;
    const rel = (bar - vb) * 16 + s;
    PHRASE.forEach(p => { if (p.s === rel) sing(t, p.n, p.len * STEP, p.syl); });
  });
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
