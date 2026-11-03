/* beat.Match — match the tempo and phase of two decks by ear and by eye, then bring
   deck B in with the crossfader. Params:
   { a: recordId, b: recordId, caller: "DANTE" (optional phone call framing), difficulty: 1..5,
     tolerance (BPM), story: bool, offset (BPM deck B starts off deck A; default: B starts at its own record's BPM when that is within reach of the pitch fader) }
   Result: { ok, score (0..100), time } */
(function () {
"use strict";
const RP = window.RP;
const { el, clamp } = RP.u;

const CSS = `
.bm-grid { display: grid; grid-template-columns: 1fr 1.25fr 1fr; gap: 10px; }
.deck, .bm-mix { background: #120e24; border: 1px solid var(--line); border-radius: 4px; padding: 10px; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.deck.a { border-top: 3px solid var(--pink); } .deck.b { border-top: 3px solid var(--cyan); }
.dhead { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
.dl { font-family: var(--logo); font-size: 14px; padding: 3px 6px; color: #12061a; }
.a .dl { background: var(--pink); } .b .dl { background: var(--cyan); }
.dt { font-size: 20px; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dsub { font-size: 15px; color: var(--muted); line-height: 1.05; overflow-wrap: anywhere; }
.bpm { font-size: 40px; line-height: 1; font-variant-numeric: tabular-nums; }
.a .bpm { color: var(--pink); } .b .bpm { color: var(--cyan); }
.bpm small { font-size: 18px; color: var(--muted); margin-left: 4px; }
.pitchread { font-size: 18px; color: var(--muted); font-variant-numeric: tabular-nums; } .pitchread b { color: var(--fg); font-weight: 400; }
.platrow { display: flex; gap: 10px; align-items: stretch; justify-content: center; }
.plat { width: 120px; height: 120px; max-width: 100%; }
.fader { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 15px; color: var(--muted); }
.fader input[type=range] { writing-mode: vertical-lr; direction: ltr; width: 28px; height: 120px; margin: 0; accent-color: var(--cyan); }
.bm-gridcv { width: 100%; height: 72px; display: block; background: #0a0816; border: 1px solid #241d48; }
.meter { display: grid; grid-template-columns: repeat(16, 1fr); gap: 2px; height: 14px; }
.meter i { background: #241d48; } .meter i.on { background: var(--pink); } .meter.good i.on { background: var(--ok); }
.readouts { display: flex; justify-content: space-between; font-size: 18px; color: var(--muted); font-variant-numeric: tabular-nums; gap: 8px; flex-wrap: wrap; }
.readouts b { color: var(--fg); font-weight: 400; }
.xf { display: flex; align-items: center; gap: 8px; font-size: 16px; color: var(--muted); } .xf input { flex: 1; accent-color: var(--pink); }
.bmsteps { display: flex; gap: 6px; flex-wrap: wrap; }
.stp { font-size: 17px; padding: 3px 8px; border: 1px solid var(--line); color: var(--muted); border-radius: 2px; }
.stp.cur { color: var(--fg); border-color: var(--pink); } .stp.done { color: var(--ok); border-color: #2a6a46; }
.tip { margin: auto 0 0; font-size: 17px; line-height: 1.1; color: var(--muted); }
.call { font-size: 19px; color: var(--fg); background: #1a0f22; border: 1px solid #4a1f3a; padding: 3px 10px; border-radius: 2px; display: flex; align-items: center; gap: 8px; }
.call i { width: 8px; height: 8px; background: #3fd07a; display: inline-block; animation: bmblink 1s steps(1) infinite; }
@keyframes bmblink { 50% { opacity: .2; } }
@media (max-width: 760px) { .bm-grid { grid-template-columns: 1fr 1fr; } .bm-mix { grid-column: 1 / -1; order: 3; } .plat { width: 92px; height: 92px; } .fader input[type=range] { height: 92px; } .bpm { font-size: 32px; } }
@media (prefers-reduced-motion: reduce) { .call i { animation: none; } }
`;
let cssDone = false;

RP.mg.register("beatMatch", {
  title: "beat.Match", order: 1,
  desc: "Match two decks by tempo and phase, then bring the new one in.",
  auto: () => ({ ok: true, score: 88 }),
  async play(host, p) {
    if (!cssDone) { el("style", { text: CSS }, document.head); cssDone = true; }
    const recA = RP.rec(p.a || "mood_ii_swing_closer"), recB = RP.rec(p.b || "hardrive_deep_inside");
    const diff = clamp(p.difficulty || 2, 1, 5);
    const BPM_A = recA.bpm || 122;
    const startOff = (p.offset != null ? p.offset : (2.2 + diff * 0.9)) * (Math.random() < 0.5 ? -1 : 1);
    /* deck B plays at its own record's tempo when that is within reach of the pitch fader (8%); otherwise it starts a few BPM off deck A */
    const gapB = recB.bpm ? recB.bpm - BPM_A : 0;
    const BASE_B = p.offset == null && Math.abs(gapB) >= 1 && Math.abs(gapB) <= BPM_A * 0.075 ? recB.bpm : BPM_A + startOff;
    const tolT = p.tolerance || [0.08, 0.06, 0.05, 0.04, 0.03][diff - 1];
    const tolP = [16, 12, 10, 8, 7][diff - 1];
    const root = host.root;
    const head = host.header("beat.Match", p.story ? "" : "Arcade");
    let callEl = null;
    if (p.caller) { callEl = el("div", { cls: "call" }, head); el("i", {}, callEl); callEl.appendChild(document.createTextNode("ON CALL · " + p.caller + " · ")); }
    const timer = el("span", { text: "0:00" }, callEl || head);
    const grid = el("div", { cls: "bm-grid" }, root);
    const deck = (cls, rec, sub) => {
      const s = el("section", { cls: "deck " + cls }, grid);
      const h = el("div", { cls: "dhead" }, s); el("span", { cls: "dl", text: cls.toUpperCase() }, h); el("span", { cls: "dt", text: rec.title }, h);
      el("div", { cls: "dsub", text: rec.artist + " · " + sub }, s);
      const bpm = el("div", { cls: "bpm", html: "0<small>BPM</small>" }, s);
      const pr = el("div", { cls: "platrow" }, s);
      const cv = el("canvas", { cls: "plat", width: 240, height: 240 }, pr);
      return { s, bpm, pr, cv, ctx: cv.getContext("2d") };
    };
    const A = deck("a", recA, "Master deck.");
    A.bpm.firstChild.nodeValue = BPM_A.toFixed(2);
    el("div", { cls: "pitchread", html: "PITCH <b>0.00%</b>" }, A.s);
    const mix = el("section", { cls: "bm-mix" }, grid);
    const gcv = el("canvas", { cls: "bm-gridcv", width: 640, height: 144 }, mix), gc = gcv.getContext("2d");
    const ro = el("div", { cls: "readouts" }, mix);
    const rdT = el("b", { text: "" }), rdP = el("b", { text: "" });
    const s1 = el("span", { text: "TEMPO " }, ro); s1.appendChild(rdT); const s2 = el("span", { text: "BEATS " }, ro); s2.appendChild(rdP);
    const meter = el("div", { cls: "meter" }, mix); for (let i = 0; i < 16; i++) el("i", {}, meter);
    const segs = [...meter.children];
    const xfw = el("div", { cls: "xf" }, mix); el("span", { text: "A" }, xfw);
    const xf = el("input", { type: "range", min: "0", max: "1", step: "0.01", value: "0", "aria-label": "Crossfader" }, xfw); el("span", { text: "B" }, xfw);
    const steps = el("div", { cls: "bmsteps" }, mix);
    const st1 = el("span", { cls: "stp cur", text: "1 TEMPO" }, steps), st2 = el("span", { cls: "stp", text: "2 BEATS" }, steps), st3 = el("span", { cls: "stp", text: "3 BRING IT IN" }, steps);
    el("p", { cls: "tip", text: "Use your ears. Two kicks a hair apart sound like a horse galloping. One clean thump means you're locked. Keys: up/down pitch, left/right nudge." }, mix);
    const B = deck("b", recB, "You control this one.");
    const fader = el("div", { cls: "fader" }, B.pr); el("span", { text: "−" }, fader);
    const pitch = el("input", { type: "range", min: "-8", max: "8", step: "0.01", value: "0", "aria-label": "Deck B pitch" }, fader); el("span", { text: "+" }, fader);
    const prd = el("div", { cls: "pitchread", html: "PITCH <b>+0.00%</b>" }, B.s);
    const row1 = el("div", { cls: "row" }, B.s), row2 = el("div", { cls: "row" }, B.s);
    const fineDn = el("button", { cls: "kbtn", type: "button", text: "−0.05" }, row1), fineUp = el("button", { cls: "kbtn", type: "button", text: "+0.05" }, row1);
    const nudgeL = el("button", { cls: "kbtn", type: "button", text: "◀ SLOW" }, row2), nudgeR = el("button", { cls: "kbtn", type: "button", text: "FAST ▶" }, row2);
    const msg = el("div", { cls: "mg-msg" }, root), said = el("div", { cls: "mg-say" }, root);
    const acts = el("div", { cls: "row" }, root); el("div", { cls: "spacer" }, acts);
    const hang = el("button", { cls: "btn", type: "button", text: p.caller ? "HANG UP" : "GIVE UP" }, acts);

    const caller = p.caller || "THE CROWD";
    const lines = {
      far: ["Is that a horse race?", "I hear two songs fighting.", "That's not a mix, that's an argument."],
      phase: ["Closer... it's flamming.", "Tempo's there. Now line it up.", "Almost. The kicks are tripping over each other."],
      sync: ["...Mm.", "Okay, okay.", "Now bring it in."],
      long: ["I'm getting old over here.", "My other line is ringing."]
    };
    const st = { pitch: 0, nudge: 0, xf: 0, phA: 0, phB: 0.28 + Math.random() * 0.14, step: 1, hold: 0, t: 0, prev: null, lastA: 0, lastB: 0, lastHat: 0, lastDan: -99, bEff: BASE_B };
    const bpmB = () => BASE_B * (1 + st.pitch / 100);
    const AC = RP.audio.ctx();
    let master = null, gA = null, gB = null;
    if (AC && !RP.audio.muted) { master = AC.createGain(); master.gain.value = 0.8; master.connect(AC.destination); gA = AC.createGain(); gB = AC.createGain(); gA.connect(master); gB.connect(master); }
    const D = RP.audio.drums;
    function schedule() {
      if (!gA) return;
      const now = AC.currentTime, la = 0.12;
      const deckS = (key, ph, bpm, isA) => {
        const rate = bpm / 60, nb = Math.floor(ph) + 1, tb = (nb - ph) / rate;
        if (tb < la && st[key] < nb) {
          st[key] = nb; const t = now + tb;
          if (isA) D.kick(t, gA, 0.9); else { D.kick(t, gB, 0.75); if (nb % 2) D.clap(t, gB, 0.35); }
        }
        if (isA) { const off = Math.floor(ph - 0.5) + 1.5, to = (off - ph) / rate; if (to < la && to >= 0 && st.lastHat < off) { st.lastHat = off; D.hat(now + to, gA, 0.16); } }
      };
      deckS("lastA", st.phA, BPM_A, true);
      deckS("lastB", st.phB, st.bEff, false);
    }
    function platter(c, phase, col, slip) {
      const s = 240, cx = s / 2, cy = s / 2;
      c.clearRect(0, 0, s, s);
      c.fillStyle = "#0b0a12"; c.beginPath(); c.arc(cx, cy, 116, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "#2a2838"; c.lineWidth = 2;
      for (let r = 50; r < 112; r += 8) { c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke(); }
      c.fillStyle = col; c.beginPath(); c.arc(cx, cy, 40, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#0b0a12"; c.beginPath(); c.arc(cx, cy, 6, 0, Math.PI * 2); c.fill();
      const a = phase * Math.PI / 2 - Math.PI / 2;
      c.strokeStyle = slip ? "#ffffff" : "#efeaff"; c.lineWidth = 6;
      c.beginPath(); c.moveTo(cx + Math.cos(a) * 52, cy + Math.sin(a) * 52); c.lineTo(cx + Math.cos(a) * 110, cy + Math.sin(a) * 110); c.stroke();
      c.strokeStyle = col; c.globalAlpha = 0.5; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, 116, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
    }
    function drawGrid() {
      const w = gcv.width, h = gcv.height;
      gc.fillStyle = "#0a0816"; gc.fillRect(0, 0, w, h);
      gc.fillStyle = "#1a1534"; gc.fillRect(0, h / 2 - 1, w, 2);
      const pps = w / 2.4;
      const ticks = (ph, bpm, y0, y1, col) => {
        const rate = bpm / 60;
        for (let n = Math.floor(ph) - 3; n <= Math.floor(ph) + 3; n++) {
          const t = (n - ph) / rate, x = w / 2 + t * pps;
          if (x < -4 || x > w + 4) continue;
          const down = ((n % 4) + 4) % 4 === 0;
          gc.fillStyle = col; gc.fillRect(Math.round(x) - (down ? 3 : 2), down ? y0 : y0 + 8, down ? 6 : 4, down ? y1 - y0 : y1 - y0 - 16);
        }
      };
      ticks(st.phA, BPM_A, 8, h / 2 - 6, "#ff3fa4");
      ticks(st.phB, st.bEff, h / 2 + 6, h - 8, "#39d0ff");
      gc.fillStyle = "#ffffff"; gc.fillRect(w / 2 - 1, 0, 2, h);
    }
    const setStep = n => {
      st.step = n;
      [st1, st2, st3].forEach((e, i) => { e.classList.toggle("cur", i + 1 === n); e.classList.toggle("done", i + 1 < n); });
      msg.textContent = n === 1 ? "Match the tempo: move Deck B's pitch fader until both BPMs read the same." : n === 2 ? "Line up the beats: hold SLOW or FAST to nudge Deck B until the kicks land together." : "Bring it in: slide the crossfader over toward B.";
    };
    const dan = kind => { const l = lines[kind]; said.textContent = caller + ": \"" + l[Math.floor(Math.random() * l.length)] + "\""; st.lastDan = st.t; };
    setStep(1); said.textContent = caller + ": \"Play me something.\"";
    pitch.addEventListener("input", () => { st.pitch = parseFloat(pitch.value); });
    xf.addEventListener("input", () => { st.xf = parseFloat(xf.value); });
    const fine = d => { st.pitch = clamp(Math.round((st.pitch + d) * 100) / 100, -8, 8); pitch.value = st.pitch; };
    let repeat = null;
    const hold = (b, on, off) => {
      const down = e => { e.preventDefault(); b.classList.add("down"); on(); };
      const up = () => { b.classList.remove("down"); off(); };
      b.addEventListener("pointerdown", down); b.addEventListener("pointerup", up); b.addEventListener("pointerleave", up); b.addEventListener("pointercancel", up);
    };
    const fh = d => [() => { clearInterval(repeat); fine(d); repeat = setInterval(() => fine(d), 160); }, () => clearInterval(repeat)];
    hold(fineDn, ...fh(-0.05)); hold(fineUp, ...fh(0.05));
    hold(nudgeL, () => { st.nudge = -1; }, () => { st.nudge = 0; });
    hold(nudgeR, () => { st.nudge = 1; }, () => { st.nudge = 0; });
    host.cleanup(() => clearInterval(repeat));
    host.onKey(e => {
      if (e.key === "ArrowUp") { e.preventDefault(); fine(-0.05); }
      if (e.key === "ArrowDown") { e.preventDefault(); fine(0.05); }
      if (e.key === "ArrowLeft" && !e.repeat) st.nudge = -1;
      if (e.key === "ArrowRight" && !e.repeat) st.nudge = 1;
    });
    host.onKeyUp(e => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") st.nudge = 0; });
    const sizeGrid = () => { const r = gcv.getBoundingClientRect(); const d = Math.min(2, window.devicePixelRatio || 1); gcv.width = Math.max(200, Math.round(r.width * d)); gcv.height = Math.round(72 * d); };
    sizeGrid();
    return new Promise(resolve => {
      let done = false;
      const finish = ok => {
        if (done) return; done = true;
        if (master) { const t = AC.currentTime; master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.0001, t + (ok ? 1.6 : 0.2)); setTimeout(() => { try { master.disconnect(); } catch (e) { /* ignore */ } }, 1800); }
        const score = ok ? Math.round(clamp(100 - Math.max(0, st.t - 20) * 0.6, 40, 100)) : 0;
        if (ok) {
          RP.sfx("success");
          const fl = el("div", { cls: "blend", text: "CLEAN BLEND" }, document.body);
          setTimeout(() => { fl.remove(); resolve({ ok: true, score, time: st.t }); }, 1500);
        } else resolve({ ok: false, score: 0, time: st.t });
      };
      hang.addEventListener("click", () => finish(false));
      host.raf(tm => {
        if (done) return false;
        const now = tm / 1000;
        let dt = st.prev == null ? 0 : now - st.prev; st.prev = now; dt = clamp(dt, 0, 0.1);
        st.t += dt;
        st.bEff = bpmB() * (1 + st.nudge * 0.06);
        st.phA += dt * BPM_A / 60; st.phB += dt * st.bEff / 60;
        schedule();
        const diffB = st.phB - st.phA, wrap = diffB - Math.round(diffB), offMs = wrap * 60000 / BPM_A;
        const tdiff = bpmB() - BPM_A, tOK = Math.abs(tdiff) <= tolT, pOK = Math.abs(offMs) <= tolP;
        B.bpm.firstChild.nodeValue = bpmB().toFixed(2);
        prd.querySelector("b").textContent = (st.pitch >= 0 ? "+" : "") + st.pitch.toFixed(2) + "%";
        rdT.textContent = (tdiff >= 0 ? "+" : "") + tdiff.toFixed(2); rdT.classList.toggle("ok", tOK);
        rdP.textContent = (offMs >= 0 ? "+" : "") + Math.round(offMs) + " ms"; rdP.classList.toggle("ok", pOK && tOK);
        const q = tOK ? clamp(1 - Math.abs(offMs) / 120, 0, 1) * 0.6 + 0.4 : clamp(1 - Math.abs(tdiff) / 4, 0, 1) * 0.4;
        const on = Math.round(q * 16); segs.forEach((s, i) => s.classList.toggle("on", i < on)); meter.classList.toggle("good", tOK && pOK);
        if (gA) { gA.gain.value = 1 - 0.7 * st.xf; gB.gain.value = 0.5 + 0.5 * st.xf; }
        if (st.step === 1 && tOK) { setStep(2); dan("phase"); }
        if (st.step >= 2 && !tOK) { setStep(1); st.hold = 0; }
        if (st.step === 2) { st.hold = pOK ? st.hold + dt : 0; if (st.hold > 2.2) { setStep(3); dan("sync"); } }
        if (st.step === 3) { if (Math.abs(offMs) > tolP * 2.5) { setStep(2); st.hold = 0; } else if (st.xf >= 0.6) { finish(true); return false; } }
        if (st.t - st.lastDan > 7) dan(st.t > 75 ? "long" : !tOK ? "far" : !pOK ? "phase" : "sync");
        const sec = Math.floor(st.t); timer.textContent = Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
        platter(A.ctx, st.phA, "#ff3fa4", false); platter(B.ctx, st.phB, "#39d0ff", st.nudge !== 0);
        drawGrid();
      });
      host.cleanup(() => { if (!done) { done = true; try { master && master.disconnect(); } catch (e) { /* ignore */ } } });
    });
  }
});
})();
