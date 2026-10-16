/* crowd.Read — read the room and build the floor, record by record.
   Params (all optional):
     records: [recordIds]   the set you can play (each once)       crowd: "empty-bar"|"house"|"techno"|"festival"|"loft"
     rounds: 4              records you get to play                 goal: floor-energy target (0-5; a value >5 is read as 0-100)
     difficulty: 1-5        venue: label for the sign / header      arcade: bool   seed: number
   Result: { ok, score 0-100, played: [ids], peak (0-5), final (0-5), goal, bartenders: bool, rounds }
   ok = the floor energy at the end of the last round reached the goal (empty-bar: the bartenders are dancing). */
(function () {
"use strict";
const RP = window.RP;
const U = RP.u;
const { clamp, mulberry, hashStr, el } = U;
const K = () => RP.setkit;

/* ======================================================================
   the model (pure; exposed on the registered def for tests)
   ====================================================================== */
const CROWDS = {
  "empty-bar": { name: "THE EMPTY BAR", e0: 1.8, goal: 3.5, step: 0.7, bpm: [108, 124], warm: 2.2, rounds: 4, theme: "empty-bar", venue: "NOWHERE",
    taste: { house: 1, disco: .9, funk: .75, pop: .8, acid: .45, techno: .25, electro: .6, hiphop: .75, breaks: .6, ambient: .3 },
    over: { garage: .95, boogie: .9, "deep house": .85, "chicago house": .9, italo: .85, "smooth jazz": .35, minimal: .3 },
    tell: ["Three people nurse drinks. The bartenders are polishing the same glass.", "A couple at the bar nods along, politely.", "People drift toward the floor. Slowly. Cautiously.", "A real little floor now. The bar is losing customers.", "The room is moving. Even the staff are tapping a foot."],
    ask: ["Bartender: \"Slow night. Don't scare the regulars.\"", "Bartender: \"They want warm, not weird. Not yet.\"", "Regular: \"Play something I can bob my head to.\""] },
  house: { name: "THE HOUSE HEADS", e0: 2.6, goal: 4.2, step: 0.5, bpm: [118, 128], warm: 2.4, rounds: 5, theme: "house", venue: "HALCYON ROOM",
    taste: { house: 1, disco: .85, acid: .8, techno: .45, electro: .4, pop: .55, hiphop: .25, breaks: .35, funk: .4, ambient: .25 },
    over: { garage: 1, "chicago house": 1, "deep house": .95, boogie: .75, italo: .6, minimal: .45 },
    tell: ["A few early birds on the floor, arms folded.", "The regulars find their spots and start to move.", "Now it's a floor. Whistles over the break.", "Hot in here. Hands up on the drop.", "Sweat on the ceiling. They want more."],
    ask: ["Regular: \"Keep it deep and keep it rolling.\"", "Regular: \"Vocals! Give me a vocal.\"", "Regular: \"Don't you dare drop the tempo.\""] },
  techno: { name: "THE TECHNO FLOOR", e0: 2.6, goal: 4.3, step: 0.45, bpm: [124, 140], warm: 1.8, rounds: 5, theme: "techno", venue: "HALLE NEUN",
    taste: { techno: 1, acid: .8, electro: .75, house: .45, disco: .1, pop: .1, hiphop: .1, breaks: .3, funk: .1, ambient: .35 },
    over: { "detroit techno": 1, minimal: .9, "chicago house": .35, "deep house": .35, garage: .2, italo: .35 },
    tell: ["Black clothes, folded arms, nobody smiles. That's a good sign.", "Heads down. The floor is starting to lock in.", "A wall of bodies. Nobody talks.", "Hypnotized. Hands come up on the break.", "A single organism, 135 beats per minute."],
    ask: ["Door guy: \"Harder. Straight. No singing.\"", "Regular: \"Hypnotic. Not pop.\"", "Regular: \"Keep it dark.\""] },
  festival: { name: "THE FESTIVAL FIELD", e0: 3.0, goal: 4.5, step: 0.35, bpm: [120, 130], warm: 3.0, rounds: 5, theme: "festival", venue: "HARBOR LIGHTS",
    taste: { pop: 1, house: .95, disco: .8, acid: .6, techno: .55, electro: .5, hiphop: .6, breaks: .45, funk: .5, ambient: .15 },
    over: { italo: .85, garage: .7, "chicago house": .7, "deep house": .55, boogie: .6, minimal: .25 },
    tell: ["A big field, a bigger sunset. They came to party.", "Phones up. Singalong on the hook.", "Thousands of arms. The whole field is bouncing.", "Everyone is somebody's best friend right now.", "Pure noise from the waterfront. It's wonderful."],
    ask: ["Stage manager: \"Big and bright. They know the hits.\"", "Stage manager: \"No weird stuff. It's a festival.\"", "Fan at the barrier: \"SING-ALONG!\""] },
  loft: { name: "THE LOFT HEADS", e0: 2.0, goal: 3.8, step: 0.5, bpm: [96, 124], warm: 1.6, rounds: 5, theme: "loft", venue: "MESEROLE",
    taste: { disco: 1, house: .85, funk: .85, breaks: .8, hiphop: .7, electro: .8, ambient: .75, acid: .75, techno: .35, pop: .4 },
    over: { boogie: 1, garage: .95, "deep house": .95, "jazz-funk": .9, italo: .8, "chicago house": .8, minimal: .55 },
    tell: ["Mismatched couches, mismatched people. Everyone is listening.", "A few people dance with their eyes closed.", "The old-timers are showing the kids a step.", "Warm, close, loud. A proper party.", "Raw and joyful. The wood floor is bouncing."],
    ask: ["Old-timer: \"Surprise me.\"", "Old-timer: \"Play the record I can't name.\"", "Regular: \"Weird is welcome. Boring is not.\""] }
};
const FAM = ["house", "disco", "acid", "techno", "electro", "pop", "hiphop", "breaks", "funk", "ambient"];

function affinity(C, rec) {
  if (C.over[rec.genre] != null) return C.over[rec.genre];
  const f = K() ? K().family(rec.genre) : "house";
  return C.taste[f] != null ? C.taste[f] : 0.4;
}
function tolScale(diff) { return 1.25 - 0.125 * (diff - 1); }
const isWeird = r => (r.vibe || []).indexOf("weird") >= 0;
const hasV = (r, v) => (r.vibe || []).indexOf(v) >= 0;

/* score one pick. st: { E, prev (record|null), round (0-based), rounds, goal, diff, rnd } */
function evalPick(C, st, rec) {
  const diff = st.diff || 2, ts = tolScale(diff);
  const last = st.round >= st.rounds - 1;
  const want = clamp(st.E + (st.E >= st.goal ? 0.25 : C.step), 1, 5);
  const d = (rec.energy || 3) - want;
  const tolUp = (st.E < 2.2 ? 0.9 : 1.25) * ts, tolDn = 1.6 * ts;
  const fe = clamp(d >= 0 ? 1 - Math.max(0, d - 0.35) / tolUp : 1 - Math.max(0, -d - 0.35) / tolDn, 0, 1);
  const lo = C.bpm[0], hi = C.bpm[1];
  const outside = rec.bpm < lo ? lo - rec.bpm : rec.bpm > hi ? rec.bpm - hi : 0;
  const range = clamp(1 - outside / (12 * ts), 0, 1);
  const jump = st.prev ? K().bpmJump((rec.bpm - st.prev.bpm) / ts) : 1;
  const fb = st.prev ? 0.6 * jump + 0.4 * range : range;
  const fg = affinity(C, rec);
  let bonus = 0;
  if (hasV(rec, "closer")) bonus += last ? 0.1 : -0.08;
  if (hasV(rec, "peak") && st.E < 2.0) bonus -= 0.12;
  if (hasV(rec, "warmup") && st.E > 3.2) bonus -= 0.12;
  if (hasV(rec, "warmup") && st.E < 2.4) bonus += 0.05;
  if (hasV(rec, "vocal") && C.theme !== "techno") bonus += 0.03;
  let fit = clamp(0.5 * fe + 0.25 * fb + 0.25 * fg + bonus, 0, 1);
  let surprise = null, extra = 0;
  if (isWeird(rec)) {
    const luck = (st.rnd ? st.rnd() - 0.5 : 0) * 0.16;
    const works = st.E + luck >= C.warm * (0.85 + 0.1 * (diff - 1) / 2) - 0.1 && fg >= 0.4 && fe >= 0.4;
    if (works) { surprise = "win"; fit = clamp(fit + 0.2, 0, 1); extra = 0.18; }
    else { surprise = "flop"; fit = fit * 0.5; extra = -0.25; }
  }
  const gain = (fit - 0.45) * 1.3 + extra;
  const E2 = clamp(st.E + gain, 0.4, 5);
  // why: the weakest part
  const parts = { energy: fe, tempo: fb, taste: fg };
  let why = "ok";
  if (fit < 0.5 || surprise === "flop") {
    const min = Math.min(fe, fb, fg);
    why = surprise === "flop" ? "weird" : min === fe ? (d > 0 ? "hard" : "soft") : min === fb ? "tempo" : "taste";
  }
  return { fit, fe, fb, fg, want, d, E2, gain, surprise, why, parts, jump: st.prev ? rec.bpm - st.prev.bpm : 0 };
}

function summarize(C, E0, steps, goal) {
  // steps: [{fit,fe,fb,fg,E2}]
  const n = steps.length || 1;
  const avg = k => steps.reduce((a, s) => a + s[k], 0) / n;
  const Es = [E0].concat(steps.map(s => s.E2));
  const final = Es[Es.length - 1], peak = Math.max.apply(null, Es);
  let rising = 0; for (let i = 1; i < Es.length; i++) if (Es[i] > Es[i - 1] + 0.08) rising++;
  const build = 0.6 * (rising / n) + 0.4 * (1 - clamp((peak - final) / 1.2, 0, 1));
  const goalR = clamp((final - E0) / Math.max(0.5, goal - E0), 0, 1);
  const score = Math.round(100 * (0.3 * avg("fe") + 0.2 * avg("fg") + 0.15 * avg("fb") + 0.15 * build + 0.2 * goalR));
  return { score: clamp(score, 0, 100), final, peak, build, energy: avg("fe"), taste: avg("fg"), tempo: avg("fb"), goalR, ok: final >= goal - 1e-6 };
}

/* ---- defaults ---- */
function normGoal(g, C, diff) {
  if (g == null || isNaN(+g)) return clamp(C.goal + (diff - 2) * 0.15, 2, 4.9);
  g = +g; if (g > 5) g /= 20;
  return clamp(g, 1.5, 4.9);
}
function pickDefaultRecords(C, rounds, rnd, diff) {
  const all = (RP.data.records || []).concat(Object.values(RP.data.extraRecords || {})).filter(r => r.bpm && r.energy);
  const good = all.filter(r => affinity(C, r) >= 0.7 && r.bpm >= C.bpm[0] - 4 && r.bpm <= C.bpm[1] + 4 && !isWeird(r));
  const chosen = [];
  let E = C.e0, prev = null;
  for (let r = 0; r < rounds; r++) {
    const st = { E, prev, round: r, rounds, goal: C.goal, diff, rnd: null };
    let best = null, bs = -1;
    K().shuffle(good, rnd).forEach(rec => { if (chosen.indexOf(rec) >= 0) return; const ev = evalPick(C, st, rec); const sc = ev.fit + rnd() * 0.06 - (hasV(rec, "closer") && r < rounds - 1 ? 0.2 : 0) + (hasV(rec, "closer") && r === rounds - 1 ? 0.1 : 0); if (sc > bs) { bs = sc; best = { rec, ev }; } });
    if (!best) break;
    chosen.push(best.rec); E = best.ev.E2; prev = best.rec;
  }
  // decoys: a weird one, an off-taste one, one too hard/too soft
  const rest = K().shuffle(all.filter(r => chosen.indexOf(r) < 0), rnd);
  const weird = rest.find(r => isWeird(r) && affinity(C, r) >= 0.45);
  const off = rest.find(r => affinity(C, r) < 0.4 && r !== weird);
  const soft = rest.find(r => (r.energy <= 2 || r.energy >= 5) && affinity(C, r) >= 0.4 && r !== weird && r !== off);
  [weird, off, soft].forEach(r => { if (r) chosen.push(r); });
  return K().shuffle(chosen, rnd).map(r => r.id);
}
function resolveParams(p, host) {
  p = p || {};
  const rnd = mulberry(Math.floor((p.seed != null ? +p.seed : Math.random() * 1e9)) + 77);
  const diff = clamp(Math.round(p.difficulty || 2), 1, 5);
  let key = p.crowd;
  if (!CROWDS[key]) key = p.arcade ? Object.keys(CROWDS)[Math.floor(rnd() * 5)] : "house";
  const C = CROWDS[key];
  let ids = Array.isArray(p.records) ? p.records.filter(Boolean) : [];
  const ids0 = ids.slice();
  let rounds = clamp(Math.round(p.rounds || (ids.length ? Math.min(C.rounds >= 5 ? 5 : 4, ids.length) : 4)), 2, 8);
  if (ids.length) rounds = Math.min(rounds, ids.length);
  if (!ids.length) ids = pickDefaultRecords(C, rounds, rnd, diff);
  ids = ids.filter((id, i) => ids.indexOf(id) === i);
  rounds = Math.min(rounds, ids.length);
  return { C, key, rnd, diff, ids, ids0, rounds, goal: normGoal(p.goal, C, diff), venue: p.venue ? String(p.venue) : null, seed: Math.floor(rnd() * 1e6) };
}

/* ======================================================================
   UI
   ====================================================================== */
const CSS = `
.cr-main { display: grid; grid-template-columns: minmax(0, 640px) minmax(0, 1fr); gap: 10px; align-items: start; }
.cr-left { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.cr-side { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.cr-scene { position: relative; }
.cr-gauge { display: flex; flex-direction: column; gap: 3px; }
.cr-gauge .lab { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; font-size: 17px; color: var(--muted); }
.cr-gauge .lab b { color: var(--fg); font-weight: 400; }
.cr-bar { position: relative; height: 18px; background: #0a0816; border: 1px solid #241d48; image-rendering: pixelated; }
.cr-bar i { position: absolute; top: 0; bottom: 0; left: 0; background: repeating-linear-gradient(90deg, var(--pink) 0 5px, transparent 5px 7px); transition: width .7s steps(12); }
.cr-bar u { position: absolute; top: -4px; bottom: -4px; width: 0; border-left: 2px solid var(--amber); text-decoration: none; }
.cr-bar s { position: absolute; top: 0; bottom: 0; background: rgba(155, 225, 93, .28); border-inline: 1px dashed var(--lime); text-decoration: none; transition: left .4s, width .4s; }
.cr-bar.win i { background: repeating-linear-gradient(90deg, var(--ok) 0 5px, transparent 5px 7px); }
.cr-tell { font-size: 19px; line-height: 1.1; color: #e4ddff; min-height: 3.4em; }
.cr-now { font-size: 17px; line-height: 1.1; color: var(--muted); } .cr-now b { color: var(--fg); font-weight: 400; }
.cr-hand { display: grid; grid-template-columns: minmax(0, 1fr); gap: 5px; }
.cr-hand .sk-card .jump { font-size: 15px; } .cr-hand .sk-card .jump.g { color: var(--ok); } .cr-hand .sk-card .jump.a { color: var(--amber); } .cr-hand .sk-card .jump.r { color: #ff6a6a; }
.cr-hand .sk-card.star::after { content: "\\2605 HUNCH"; position: absolute; right: 5px; top: 3px; font-size: 13px; color: var(--amber); }
.cr-act { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.cr-act .spacer { flex: 1; }
.cr-msg { min-height: 1.2em; } .cr-say { min-height: 1.2em; }
.cr-timer { font-size: 18px; color: var(--muted); } .cr-timer.low { color: #ff6a6a; }
@media (max-width: 860px) {
  .cr-main { display: flex; flex-direction: column; gap: 8px; align-items: stretch; }
  .cr-left, .cr-side { display: contents; }
  .cr-scene { order: 1; } .cr-now { order: 2; } .cr-gauge { order: 3; } .cr-chips { order: 4; } .cr-msg { order: 5; } .cr-say { order: 6; } .cr-tell { order: 7; }
  .cr-hand { order: 8; } .cr-act { order: 9; } .cr-hist { order: 10; }
}
`;
let cssDone = false;

const LINES = {
  great: ["That's the one. The whole floor leans in.", "Somebody whoops. It might be you.", "Heads nod in time. It's contagious.", "Half the room just found its feet.", "The bartender stops polishing and nods."],
  good: ["Solid. The floor gets a little braver.", "They're with you. Keep building.", "Two more people drift in from the bar."],
  meh: ["Fine. Nobody leaves, nobody loves it.", "Polite nodding. Polite is not a party.", "It's a record. People heard it."],
  hard: ["Too much, too soon. A few people drift back to the bar.", "You scared them. Somebody checks their phone.", "The floor stares at the booth like you owe them money."],
  soft: ["You let the air out. Hands come down.", "Somebody sighs. That felt like closing time.", "The floor sags. They wanted more than that."],
  tempo: ["That tempo jump tripped everyone up.", "Dancers stumble. The groove they had is gone."],
  taste: ["Wrong crowd for that sound. Blank stares.", "Nobody here knows this. Nobody here wants to."],
  weirdWin: ["WEIRD, and they LOVE it. Nobody knows what this is.", "Nobody can name it. Everybody is dancing to it."],
  weirdFlop: ["That was... a choice.", "The sound of a record clearing a room."]
};
const pick = (a, rnd) => a[Math.floor((rnd || Math.random)() * a.length)];

RP.mg.register("crowdRead", {
  title: "crowd.Read", order: 3,
  desc: "Read the room. Pick the record the floor needs next, and build it.",
  model: { CROWDS, evalPick, summarize, affinity, resolveParams },
  auto(params) {
    try {
      const R = resolveParams(Object.assign({ seed: 1 }, params));
      const recs = R.ids.map(id => RP.rec(id));
      let E = R.C.e0, prev = null; const steps = [], played = [], left = recs.slice();
      for (let r = 0; r < R.rounds; r++) {
        let best = null;
        left.forEach(rec => { const ev = evalPick(R.C, { E, prev, round: r, rounds: R.rounds, goal: R.goal, diff: R.diff, rnd: null }, rec); if (!best || ev.fit > best.ev.fit) best = { rec, ev }; });
        left.splice(left.indexOf(best.rec), 1); steps.push(best.ev); played.push(best.rec.id); E = best.ev.E2; prev = best.rec;
      }
      const sm = summarize(R.C, R.C.e0, steps, R.goal);
      return { ok: true, score: Math.max(72, sm.score), played, peak: Math.round(sm.peak * 10) / 10, final: Math.round(sm.final * 10) / 10, goal: R.goal, bartenders: true, rounds: R.rounds, auto: true };
    } catch (e) { return { ok: true, score: 80, played: [], peak: 4, auto: true }; }
  },
  async play(host, params) {
    const kit = K();
    if (!cssDone) { cssDone = true; el("style", { text: CSS }, document.head); }
    kit.css();
    const reduced = kit.reduced();
    const root = host.root;
    let R = resolveParams(params, host);
    const C = R.C;
    const head = host.header("crowd.Read", (R.venue || C.venue) + " · " + (params && params.arcade ? "Arcade" : C.name));
    const stage = el("div", { cls: "sk-stage" }, root);
    const endBox = el("div", {}, root);
    const sound = kit.sound(host);

    return new Promise(resolve => {
      let finished = false;
      const done = res => { if (finished) return; finished = true; sound.stop(0.4); resolve(res); };

      /* ----- scene ----- */
      const main = el("div", { cls: "cr-main" }, stage);
      const left = el("div", { cls: "cr-left" }, main);
      const side = el("div", { cls: "cr-side" }, main);
      const sceneWrap = el("div", { cls: "cr-scene" }, left);
      let floor = null;
      const W = 320, H = 144;
      const cv = el("canvas", { cls: "sk-cv px", width: W, height: H, role: "img", "aria-label": "The dance floor, seen from the DJ booth" }, sceneWrap);
      const sc = cv.getContext("2d");
      kit.fit(host, cv, W, H, sceneWrap);

      /* ----- under the scene ----- */
      const now = el("div", { cls: "cr-now" }, left);
      const gauge = el("div", { cls: "cr-gauge" }, left);
      const glab = el("div", { cls: "lab" }, gauge);
      const gl1 = el("span", { html: "FLOOR ENERGY <b>0.0</b>" }, glab), gl2 = el("span", { html: "" }, glab);
      const bar = el("div", { cls: "cr-bar", "aria-hidden": "true" }, gauge);
      const barFill = el("i", {}, bar), barBand = el("s", {}, bar), barGoal = el("u", {}, bar);
      const chips = el("div", { cls: "sk-chips cr-chips" }, left);
      const cRound = el("span", { cls: "sk-chip" }, chips), cDance = el("span", { cls: "sk-chip" }, chips), cBart = el("span", { cls: "sk-chip" }, chips), cTimer = el("span", { cls: "sk-chip cr-timer" }, chips);
      const msg = el("div", { cls: "mg-msg cr-msg", "aria-live": "polite" }, left);
      const said = el("div", { cls: "mg-say cr-say" }, left);
      const tell = el("div", { cls: "mg-panel cr-tell", "aria-live": "polite" }, left);

      /* ----- right column: your crate ----- */
      const hand = el("div", { cls: "cr-hand", role: "listbox", "aria-label": "Your records" }, side);
      const acts = el("div", { cls: "cr-act" }, side);
      const playBtn = el("button", { cls: "btn primary", type: "button", text: "PLAY IT ▶", disabled: "disabled" }, acts);
      el("div", { cls: "spacer" }, acts);
      const giveUp = el("button", { cls: "btn", type: "button", text: "GIVE UP" }, acts);
      const histCv = el("canvas", { cls: "sk-cv px cr-hist", width: 160, height: 46, role: "img", "aria-label": "Floor energy after each round" }, left);
      kit.fit(host, histCv, 160, 46, left, 2);

      /* ----- state ----- */
      let lastDn = -1;
      let S, cards, sel = null, phase = "pick", pickTimer = 0, timerOn = false, last = null, nextAt = 0;
      const timeLimit = [0, 0, 32, 26, 20][R.diff - 1];
      const barPct = e => Math.round(clamp(e / 5, 0, 1) * 1000) / 10 + "%";

      function setup() {
        S = { E: R.C.e0, prev: null, round: 0, steps: [], played: [], used: new Set(), rnd: mulberry(R.seed + 5), bart: false, peak: R.C.e0 };
        floor = kit.Floor({ theme: C.theme, venue: R.venue || C.venue, seed: R.seed, view: "booth" });
        floor.snap(S.E); floor.setBpm(Math.round((C.bpm[0] + C.bpm[1]) / 2));
        floor.bartDance = false;
        barGoal.style.left = barPct(R.goal);
        sound.bed({ genre: "soul", bpm: 92, energy: 1, vol: 0.2, filter: ["lowpass", 600], seed: R.seed }); // the house tape, until your first record
        buildHand();
        refresh(true);
        say(C.ask[0]);
        msg.textContent = "GOAL: floor energy " + R.goal.toFixed(1) + (C.theme === "empty-bar" ? " — get the bartenders dancing." : " by the last record.") + " " + R.rounds + " records. Build; don't peak early.";
        phase = "pick"; setTimer(timeLimit);
        updatePlay();
      }

      const say = t => { said.textContent = t; };

      function buildHand() {
        hand.innerHTML = ""; cards = [];
        const ranked = R.ids.map(id => RP.rec(id));
        ranked.forEach((rec, i) => {
          const b = kit.card(host, rec, { key: String(i + 1) });
          b.setAttribute("role", "option"); b.setAttribute("aria-selected", "false");
          b.addEventListener("click", () => { if (phase !== "pick" || S.used.has(rec.id)) return; if (sel === rec.id) doPlay(); else select(rec.id); });
          hand.appendChild(b); cards.push({ rec, b, jump: el("span", { cls: "jmp" }, b.t3) });
        });
      }

      function select(id) {
        sel = id; host.sfx("select");
        cards.forEach(c => { const on = c.rec.id === id; c.b.classList.toggle("sel", on); c.b.setAttribute("aria-selected", on ? "true" : "false"); });
        const rec = RP.rec(id);
        msg.textContent = "Selected: " + kit.full(rec) + ". Press PLAY IT (or Enter).";
        updatePlay();
      }
      function updatePlay() {
        const can = phase === "pick" && !!sel;
        playBtn.disabled = phase === "pick" ? !can : false;
        if (phase === "pick") { playBtn.textContent = can ? "PLAY IT ▶" : "PICK A RECORD"; }
      }

      function jumpTag(rec) {
        if (!S.prev) { const mid = (C.bpm[0] + C.bpm[1]) / 2; const dd = rec.bpm - mid; return { t: (Math.abs(rec.bpm - mid) <= (C.bpm[1] - C.bpm[0]) / 2 + 2 ? "tempo fits" : "off tempo"), c: Math.abs(dd) <= (C.bpm[1] - C.bpm[0]) / 2 + 2 ? "g" : "a" }; }
        const dj = rec.bpm - S.prev.bpm, a = Math.abs(dj);
        return { t: (dj >= 0 ? "+" : "") + dj + " BPM vs now", c: a <= 4 ? "g" : a <= 8 ? "a" : "r" };
      }

      function refresh(first) {
        const E = S.E;
        gl1.innerHTML = "FLOOR ENERGY <b>" + E.toFixed(1) + "</b>";
        gl2.textContent = "GOAL " + R.goal.toFixed(1);
        barFill.style.width = barPct(E);
        bar.classList.toggle("win", E >= R.goal);
        // hint band (difficulty 1 only)
        if (R.diff <= 1 && phase === "pick") {
          const want = clamp(E + (E >= R.goal ? 0.25 : C.step), 1, 5);
          barBand.style.display = ""; barBand.style.left = barPct(want - 0.45); barBand.style.width = barPct(0.9);
        } else barBand.style.display = "none";
        cRound.innerHTML = "ROUND <b>" + Math.min(S.round + 1, R.rounds) + "/" + R.rounds + "</b>";
        floor && (cDance.innerHTML = "DANCING <b>" + floor.dancing() + "/" + floor.people.length + "</b>");
        cBart.innerHTML = "BARTENDERS <b>" + (S.bart ? "DANCING" : "ZZZ") + "</b>"; cBart.classList.toggle("hot", S.bart);
        const lvl = E < 1.5 ? 0 : E < 2.5 ? 1 : E < 3.3 ? 2 : E < 4.1 ? 3 : 4;
        const mood = C.tell[lvl];
        const want = clamp(E + (E >= R.goal ? 0.25 : C.step), 1, 5);
        tell.innerHTML = ""; el("div", { text: mood }, tell);
        if (phase === "pick") {
          if (R.diff <= 2) el("div", { cls: "muted", text: want - E > 0.55 ? "They're ready for a real step up." : "A small step up would land. Don't overshoot." }, tell);
          if (R.diff <= 1) el("div", { cls: "muted", text: "Aim for energy " + Math.max(1, Math.round(want - 0.5)) + "–" + Math.min(5, Math.round(want + 0.5)) + " (see the green band)." }, tell);
          if (R.diff <= 3) {
            const fams = FAM.map(f => [f, C.taste[f] || 0]).sort((a, b) => b[1] - a[1]);
            const row = el("div", { cls: "sk-chips" }, tell);
            el("span", { cls: "sk-chip", html: "LIKES <b>" + fams.slice(0, 3).map(x => x[0]).join(" · ") + "</b>" }, row);
            el("span", { cls: "sk-chip", html: "AVOID <b>" + fams.slice(-2).map(x => x[0]).join(" · ") + "</b>" }, row);
            el("span", { cls: "sk-chip", html: "TEMPO <b>" + C.bpm[0] + "–" + C.bpm[1] + "</b>" }, row);
          }
        }
        drawHist();
        // now playing
        now.innerHTML = "";
        if (S.prev) now.innerHTML = "♪ NOW PLAYING <b>" + esc(kit.pair(S.prev)) + "</b> (" + esc(kit.sub(S.prev)) + ") · <b>" + S.prev.bpm + "</b> BPM";
        else now.innerHTML = "♪ NOW PLAYING <b>the house tape</b> — a quiet mix. You're up.";
        // jump hints on cards
        cards.forEach(c => {
          c.b.classList.toggle("used", S.used.has(c.rec.id)); c.b.disabled = S.used.has(c.rec.id);
          if (S.used.has(c.rec.id)) { c.jump.textContent = "played · round " + (S.played.indexOf(c.rec.id) + 1); c.jump.className = "jmp"; return; }
          const j = jumpTag(c.rec); c.jump.className = "jmp jump " + j.c; c.jump.textContent = j.t;
        });
        cards.forEach(c => c.b.classList.remove("star"));
        // difficulty 1: star the best fit
        if (R.diff <= 1 && phase === "pick") {
          let best = null; cards.forEach(c => { if (S.used.has(c.rec.id)) return; const ev = evalPick(C, { E, prev: S.prev, round: S.round, rounds: R.rounds, goal: R.goal, diff: R.diff, rnd: null }, c.rec); if (!best || ev.fit > best.fit) best = { fit: ev.fit, c }; });
          cards.forEach(c => c.b.classList.toggle("star", !!best && best.c === c));
        }
      }
      const esc = U.esc;
      function drawHist() {
        const g = histCv.getContext("2d"), w = 160, h = 46;
        g.fillStyle = "#0a0816"; g.fillRect(0, 0, w, h);
        const n = R.rounds + 1, bw = Math.floor((w - 24) / n) - 3, x0 = 14, yb = h - 9, yt = 6, ey = e => Math.round(yb - clamp(e / 5, 0, 1) * (yb - yt));
        for (let v = 1; v <= 5; v++) { g.fillStyle = kit.dpat("#8c84b8", 3); g.fillRect(x0 - 2, ey(v), w - x0, 1); }
        for (let v = 1; v <= 5; v += 2) U.txt(g, String(v), 4, ey(v) - 2, "#5a5290");
        const Es = [C.e0].concat(S.steps.map(s2 => s2.E2));
        for (let i = 0; i < n; i++) {
          const x = x0 + i * (bw + 3), done = i < Es.length;
          if (done) {
            const y = ey(Es[i]), col = Es[i] >= R.goal ? "#3fd07a" : "#ff3fa4";
            g.fillStyle = col; g.fillRect(x, y, bw, yb - y); g.fillStyle = kit.dpat("#ffffff", 4); g.fillRect(x, y, bw, 2); g.fillStyle = "#12061a"; for (let yy = y + 3; yy < yb; yy += 3) g.fillRect(x, yy, bw, 1);
          } else { g.fillStyle = kit.dpat("#8c84b8", 3); g.fillRect(x, yb - 3, bw, 3); }
          U.txt(g, i === 0 ? "START" : "R" + i, x + (i === 0 ? -3 : Math.floor(bw / 2) - 3), h - 6, i < Es.length ? "#c8c4d8" : "#5a5290");
        }
        const gy = ey(R.goal); g.fillStyle = "#ffc44d"; for (let x = x0 - 2; x < w; x += 4) g.fillRect(x, gy, 2, 1);
        U.txt(g, "GOAL", w - 17, gy - 6, "#ffc44d");
      }

      /* ----- timer (higher difficulties: dead air) ----- */
      function setTimer(sec) { pickTimer = sec; timerOn = sec > 0 && phase === "pick"; cTimer.style.display = timerOn ? "" : "none"; showTimer(); }
      function showTimer() { if (!timerOn) return; const s = Math.max(0, Math.ceil(pickTimer)); cTimer.innerHTML = "DEAD AIR IN <b>0:" + String(s).padStart(2, "0") + "</b>"; cTimer.classList.toggle("low", s <= 8); }
      let strikes = 0;
      function deadAir() {
        strikes++;
        host.sfx("boo"); floor.pop("DEAD AIR!", "#ff6a6a", 160, 64); floor.emote("?", 5);
        S.E = clamp(S.E - 0.4, 0.4, 5); floor.setEnergy(S.E); say("Bartender: \"Hello? Is anyone driving this thing?\""); refresh();
        if (strikes >= 2) {
          const free = cards.filter(c => !S.used.has(c.rec.id));
          if (free.length) { select(free[0].rec.id); doPlay(true); }
        } else setTimer(Math.max(10, Math.round(timeLimit / 2)));
      }

      /* ----- play a record ----- */
      function doPlay(forced) {
        if (phase !== "pick" || !sel) return;
        const rec = RP.rec(sel); phase = "play"; timerOn = false; cTimer.style.display = "none";
        S.used.add(rec.id);
        const ev = evalPick(C, { E: S.E, prev: S.prev, round: S.round, rounds: R.rounds, goal: R.goal, diff: R.diff, rnd: S.rnd }, rec);
        S.steps.push(ev); S.played.push(rec.id);
        sound.play(rec, { vol: 0.72, fade: 1.3 });
        floor.setBpm(rec.bpm);
        host.sfx("blip");
        msg.textContent = "Now playing: " + kit.full(rec);
        playBtn.disabled = true; playBtn.textContent = "THE FLOOR REACTS...";
        cards.forEach(c => { c.b.disabled = true; });
        const E1 = ev.E2;
        host.timeout(() => {
          S.E = E1; S.prev = rec; S.peak = Math.max(S.peak, S.E); floor.setEnergy(S.E);
          const tier = ev.surprise === "win" ? "weirdWin" : ev.surprise === "flop" ? "weirdFlop" : ev.fit >= 0.8 ? "great" : ev.fit >= 0.62 ? "good" : ev.fit >= 0.45 ? "meh" : ev.why === "hard" ? "hard" : ev.why === "soft" ? "soft" : ev.why === "tempo" ? "tempo" : "taste";
          const good = ev.fit >= 0.62 || ev.surprise === "win";
          const bad = ev.fit < 0.45 || ev.surprise === "flop";
          const label = ev.surprise === "win" ? "THEY GET IT!" : ev.surprise === "flop" ? "WHAT WAS THAT?" : ev.fit >= 0.8 ? "PERFECT BUILD" : ev.fit >= 0.62 ? "NICE ONE" : ev.fit >= 0.45 ? "OKAY" : tier === "hard" ? "TOO MUCH" : tier === "soft" ? "FLOOR DROP" : tier === "tempo" ? "TRAIN WRECK" : "WRONG ROOM";
          floor.pop(label, good ? "#9be15d" : bad ? "#ff6a6a" : "#ffd23f", 160, 64);
          if (good) { host.sfx("cheer"); floor.emote(ev.fit >= 0.8 ? "heart" : "note", ev.fit >= 0.8 ? 5 : 4); floor.emote("note", 3); }
          else if (bad) { host.sfx("boo"); floor.emote("?", 5); }
          const dir = ev.gain > 0.05 ? "▲" : ev.gain < -0.05 ? "▼" : "■";
          say(pick(LINES[tier], S.rnd));
          msg.innerHTML = "";
          msg.appendChild(document.createTextNode(label + "  " + dir + " floor " + S.E.toFixed(1) + (ev.gain >= 0 ? "  (+" : "  (") + ev.gain.toFixed(1) + ")"));
          msg.className = "mg-msg cr-msg " + (good ? "ok" : bad ? "bad" : "");
          const was = S.bart; S.bart = S.E >= R.goal; floor.bartDance = S.bart;
          if (S.bart && !was) { host.timeout(() => { floor.pop("BARTENDERS DANCING!", "#ffd23f", 236, 26); host.sfx("cheer"); floor.emote("star", 4); }, 700); }
          if (!S.bart && was) say("The bartenders put the bottle down. Back to work.");
          refresh();
          nextAt = performance.now();
          const lastRound = S.round >= R.rounds - 1;
          host.timeout(() => {
            phase = "wait";
            playBtn.disabled = false; playBtn.textContent = lastRound ? "FINISH SET ▶" : "NEXT ROUND ▶";
            playBtn.focus({ preventScroll: true });
          }, 1100);
        }, 900);
      }

      function next() {
        if (phase !== "wait") return;
        msg.className = "mg-msg cr-msg";
        S.round++;
        if (S.round >= R.rounds) { finish(); return; }
        phase = "pick"; sel = null; strikes = 0;
        cards.forEach(c => { c.b.classList.remove("sel"); c.b.disabled = S.used.has(c.rec.id); });
        say(pick(C.ask, S.rnd));
        msg.textContent = "Round " + (S.round + 1) + ": what does the room need now?";
        refresh(); setTimer(timeLimit); updatePlay();
      }

      async function finish() {
        phase = "end";
        const sm = summarize(C, C.e0, S.steps, R.goal);
        sound.stop(1.6);
        const ok = sm.ok;
        const parts = [{ label: "ENERGY FIT", v: sm.energy, color: "#ff3fa4" }, { label: "CROWD TASTE", v: sm.taste, color: "#62e6ff" }, { label: "TEMPO FLOW", v: sm.tempo, color: "#9be15d" }, { label: "THE BUILD", v: sm.build, color: "#ffc44d" }];
        const lines = [];
        lines.push(ok ? (C.theme === "empty-bar" ? "The bartenders are DANCING. Floor energy " + S.E.toFixed(1) + " / goal " + R.goal.toFixed(1) + "." : "The floor is going off. Energy " + S.E.toFixed(1) + " / goal " + R.goal.toFixed(1) + ".") : "The floor stopped at " + S.E.toFixed(1) + " — the goal was " + R.goal.toFixed(1) + ".");
        const dim = [];
        const worst = S.steps.reduce((w, s, i) => (!w || s.fit < w.fit ? { fit: s.fit, i, why: s.why } : w), null);
        if (worst && worst.fit < 0.6) dim.push("Weakest pick: round " + (worst.i + 1) + " — " + ({ hard: "too much, too soon", soft: "you dropped the floor", tempo: "the tempo jump", taste: "wrong sound for this crowd", weird: "the weird one flopped", ok: "just a little off" }[worst.why] || "a bit off") + ".");
        if (sm.peak - S.E > 0.5) dim.push("You peaked early (" + sm.peak.toFixed(1) + ") and let it slide.");
        dim.push("Set: " + S.played.map(id => RP.rec(id).title).join("  ›  "));
        host.sfx(ok ? "success" : "fail");
        if (ok) host.timeout(() => host.sfx("cheer"), 400);
        stage.hidden = true;
        const res = { ok, score: sm.score, played: S.played.slice(), peak: Math.round(S.peak * 10) / 10, final: Math.round(S.E * 10) / 10, goal: R.goal, bartenders: S.bart, rounds: R.rounds };
        const choice = await kit.endCard(host, endBox, { ok, score: sm.score, kicker: R.venue || C.venue, title: ok ? (C.theme === "empty-bar" ? "BARTENDERS DANCING" : "PACKED FLOOR") : "THE FLOOR STAYS COLD", parts, lines, dim, canAgain: !ok, againLabel: "TRY AGAIN" });
        if (finished) return;
        if (choice === "again") { endBox.innerHTML = ""; stage.hidden = false; R = resolveParams(Object.assign({}, params, { records: R.ids, crowd: R.key, rounds: R.rounds, goal: R.goal, seed: R.seed + 1 })); setup(); return; }
        done(res);
      }

      /* ----- events ----- */
      playBtn.addEventListener("click", () => { if (phase === "pick") doPlay(); else if (phase === "wait") next(); });
      giveUp.addEventListener("click", () => { host.sfx("click"); done({ ok: false, score: 0, played: S ? S.played.slice() : [], peak: S ? S.peak : 0, goal: R.goal, rounds: R.rounds }); });
      host.onKey(e => {
        if (finished || e.ctrlKey || e.metaKey || e.altKey) return;
        const k = e.key;
        if (phase === "pick" && /^[1-9]$/.test(k)) { const c = cards[+k - 1]; if (c && !S.used.has(c.rec.id)) { e.preventDefault(); select(c.rec.id); c.b.focus({ preventScroll: true }); } }
        else if (k === "Enter" && (!document.activeElement || document.activeElement.tagName !== "BUTTON" || (document.activeElement.closest && document.activeElement.closest(".cr-hand")))) {
          e.preventDefault(); if (phase === "pick") doPlay(); else if (phase === "wait") next();
        }
      });

      /* ----- frame loop ----- */
      setup();
      host.raf(tm => {
        if (finished) return false;
        const t = tm / 1000;
        if (stage.hidden) return;
        if (last == null) last = t;
        const dt = clamp(t - last, 0, 0.1); last = t;
        if (timerOn && phase === "pick") { pickTimer -= dt; showTimer(); if (pickTimer <= 0) { timerOn = false; deadAir(); } }
        floor.draw(t);
        sc.imageSmoothingEnabled = false;
        sc.drawImage(floor.canvas, 0, 0);
        const dn = floor.dancing(); if (dn !== lastDn) { lastDn = dn; cDance.innerHTML = "DANCING <b>" + dn + "/" + floor.people.length + "</b>"; }
      });
      host.cleanup(() => { finished = true; });
    });
  }
});
})();
