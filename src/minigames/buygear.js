/* buy.Gear — inspect, test and haggle for gear in Eddie Two-Times' van (or, in the endgame, a velvet boutique).
   Real models from RP.data.gear; some listings are lemons (wobbly platter you can SEE on the strobe dots and HEAR
   as a warble, gritty pitch fader, missing needle, dead channel, "it was working this morning", too-good price).
   Art + test-tone synth live in gearkit_lib.js (RP.gearkit), touched only inside play().

   Params (all optional):
     { slot: "turntables"|"decks"|"mixer"|"monitors"|"headphones",   default "turntables" ("mixer" for the boutique)
       options: [gearIds]        listings (the same id twice = two units from two sellers); default per slot
       seller: "Eddie Two-Times" | any name | "boutique"   ("boutique" = act-5 showroom: no scams, a waitlist instead of a haggle)
       budget: $ cash in hand    default: enough for the best working unit only if you haggle
       scams: n                  how many listings are lemons (default by difficulty, always leaves >= 1 good unit)
       flaws: [...]              scripted scenario: one flaw key per listing ("ok" | "cosmetic" | a lemon flaw). Prices are then
                                 fixed (not rolled), so the story can quote the tag: AT-LP120-USB asks $215.
       asks: { gearId: $ }       scripted scenario only: pin a listing's tag; its haggle floor scales with it (Act 3: CDJ-900 asks $280).
       difficulty: 1..5, seed, arcade }
   Tags are ASKING prices before haggling. Turntables, decks and monitors are sold as a PAIR; the UI says so.
   Result: { ok, score (0..100), bought: gearId|null, paid: $ }
     ok     true only if you drove home with WORKING gear.
     bought the gear id you got (null if you left empty-handed OR bought a lemon).
     paid   $ that left your pocket (non-zero even when you bought a lemon: apply it to the player's money!).
     extra  lemon: gearId|null (you bought junk), flaw, spotted (lemons you called out or found evidence on), haggled ($ saved), place + attempts (boutique).
   The calling level applies the purchase (RP.setGear / RP.money(-paid)); this game never touches RP.state. */
(function () {
"use strict";
const RP = window.RP;
const { el, clamp, mulberry, hashStr } = RP.u;

/* ------------------------------------------------------------------ data */
const DEFAULTS = {
  turntables: ["numark_tt1650", "at_lp120_usb", "technics_sl_1200mk2"],
  decks: ["pioneer_cdj_350", "pioneer_cdj_900", "pioneer_cdj_2000"],
  mixer: ["numark_m101usb", "pioneer_djm_350", "behringer_djx750"],
  monitors: ["krk_rokit_5_g4", "dynaudio_bm5_mkiii", "dynaudio_lyd_5"],
  headphones: ["sennheiser_hd25", "technics_rp_dh1200", "sennheiser_hd25"]
};
const FLAWS = {
  turntable: ["wobble", "scratchy", "noPlay", "dead", "deadCh", "fake"],
  cdj: ["wobble", "scratchy", "noPlay", "dead", "deadCh", "fake"],
  mixer: ["hum", "scratchy", "deadCh", "dead", "fake"],
  monitor: ["blown", "deadCh", "hum", "dead", "fake"],
  headphones: ["deadCh", "scratchy", "dead", "fake"],
  box: ["dead", "fake"]
};
const EASY = ["wobble", "noPlay", "dead", "deadCh", "blown", "hum"];
const PAIR = { turntables: 1, decks: 1, monitors: 1 }; // slots sold as a pair: the tag is for both units
const PROBES = ["power", "ctl", "listen", "look", "paper"];
const PLABEL = {
  turntable: ["SPIN PLATTER", "MOVE PITCH", "LISTEN", "LOOK CLOSER", "SERIAL / RECEIPT"],
  cdj: ["SPIN JOG", "MOVE TEMPO", "LISTEN", "LOOK CLOSER", "SERIAL / RECEIPT"],
  mixer: ["POWER UP", "SLIDE FADERS", "LISTEN", "LOOK CLOSER", "SERIAL / RECEIPT"],
  monitor: ["POWER ON", "TURN KNOB", "LISTEN", "LOOK CLOSER", "SERIAL / RECEIPT"],
  headphones: ["FLEX BAND", "WIGGLE CABLE", "LISTEN", "LOOK CLOSER", "SERIAL / RECEIPT"],
  box: ["POWER UP", "TRY IT", "LISTEN", "LOOK CLOSER", "SERIAL / RECEIPT"]
};
const PTAG = ["SPIN", "CTRL", "EARS", "EYES", "PAPER"];
/* what each probe tells you. [text, isEvidence]. Missing entries fall back to the "ok" line of that kind. */
const T = {
  turntable: {
    ok: ["Platter spins up fast. Strobe dots hold dead still.", "Pitch slides smooth. Dots drift evenly, no hiccups.", "Clean, centered, warm. Both sides sing.", "Stylus straight, platter clean, no cracks.", "Receipt: bought new, kept in a drawer. Serial matches."],
    wobble: { power: "The strobe dots swim left, then right. Over and over.", listen: "The note warbles like a drunk trombone.", look: "The platter sits a hair off-center on its spindle." },
    scratchy: { ctl: "Pitch fader is gritty. Crackle, and the reading jumps.", look: "The pitch fader cap is crusted with something. Spilled drink?", listen: "Clean, with a few random pops." },
    noPlay: { listen: "Silence. Just motor hum.", look: "Empty headshell. No cartridge. No needle!" },
    dead: { power: "Start/stop does nothing. No lamp. The platter is dead.", ctl: "The fader moves. Nothing else does.", listen: "Not even a hiss.", look: "The power cord is held together with electrical tape.", paper: "A sticker says TESTED OK. The date is smudged." },
    deadCh: { listen: "Left side only. The right is silent.", look: "One RCA plug is bent, half out of its jack." },
    fake: { power: "It spins. The strobe lamp flickers like a cheap candle.", listen: "Thin and tinny. Like a toy.", look: "The badge looks hand-painted. Is that a typo?", paper: "Serial: sanded off. Receipt is a napkin that says 'trust me'." },
    cosmetic: { look: "Dust cover is gone and the plinth is scuffed. Honest wear." }
  },
  cdj: {
    ok: ["The jog wheel turns true. Smooth bearing.", "Tempo slider glides. BPM readout steady.", "Loud, clean, both channels.", "Screen clear, slot clean, jog ring intact.", "Receipt: bought new. Serial matches the plate."],
    wobble: { power: "The jog wheel rocks side to side on a loose bearing.", listen: "The track warbles in pitch. Seasick.", look: "The jog wheel isn't sitting flat." },
    scratchy: { ctl: "Tempo slider is gritty. The BPM readout jumps around.", look: "The slider is gummed up with something sticky.", listen: "Clean, with a few random pops." },
    noPlay: { listen: "The slot clicks. USB light stays red. No audio.", look: "The disc slot is jammed with old chewing gum." },
    dead: { power: "Nothing lights up. Not even the screen.", ctl: "The slider moves. Nothing else does.", listen: "Not even a hiss.", look: "The power cable is wrapped in electrical tape.", paper: "A sticker says TESTED OK. The date is smudged." },
    deadCh: { listen: "Left output only. The right is silent.", look: "One output jack is loose and wobbly." },
    fake: { power: "The jog turns. The screen is dim and an odd color.", listen: "Tinny and thin, like a toy radio.", look: "The badge looks hand-painted. Is that a typo?", paper: "Serial: sanded off. Receipt is a napkin that says 'trust me'." },
    cosmetic: { look: "Scuffed, scratched case. Works fine. Honest wear." }
  },
  mixer: {
    ok: ["LEDs light up. Meters bounce.", "Faders and knobs feel smooth and tight.", "Both channels loud, clean and centered.", "Knobs tight, no cracks, jacks clean.", "Receipt: bought new. Serial matches the plate."],
    hum: { power: "The meters wiggle all by themselves.", listen: "A low buzz sits under everything. Ground hum.", look: "The ground wire is not attached to anything." },
    scratchy: { ctl: "The crossfader crackles and cuts out.", look: "The crossfader slot is crusted with old beer.", listen: "Clean, with a few random pops." },
    deadCh: { power: "The channel 2 meter never moves.", listen: "Channel 2 is silent. Channel 1 is fine.", look: "Channel 2 knobs don't match the others." },
    dead: { power: "The power switch clicks. Nothing lights.", ctl: "Knobs turn. Nothing responds.", listen: "Not even a hiss.", look: "The power brick is wrapped in electrical tape.", paper: "A sticker says TESTED OK. The date is smudged." },
    fake: { power: "LEDs light, but one flickers like a cheap candle.", listen: "Thin and tinny. The faders barely do anything.", look: "The badge looks hand-painted. Is that a typo?", paper: "Serial: sanded off. Receipt is a napkin that says 'trust me'." },
    cosmetic: { look: "Scuffed panel, one knob cap missing. Works fine." }
  },
  monitor: {
    ok: ["Power LED on. A soft thump from both speakers.", "Level knob is smooth. Clean volume change.", "Full range. Tight bass, clear highs.", "Cones intact, no dents. Tweeters clean.", "Receipt: bought new. Serial matches the plate."],
    blown: { ctl: "Smooth, but the crunch gets worse as it gets louder.", listen: "Highs are fizzy and crunchy. Something rattles.", look: "A tweeter dome has a hole in it." },
    deadCh: { power: "Only one power LED lights.", listen: "Only one speaker plays. The other is silent.", look: "One speaker cable end is stripped and loose." },
    hum: { power: "A faint buzz, even with nothing playing.", listen: "A constant buzz under the music.", look: "The power cable is frayed near the plug." },
    dead: { power: "No LED. No thump. Nothing.", ctl: "The knob turns. Nothing responds.", listen: "Not even a hiss.", look: "The power cable is wrapped in electrical tape.", paper: "A sticker says TESTED OK. The date is smudged." },
    fake: { power: "One LED lights. The other is a painted dot.", listen: "Thin and tinny. No bass at all.", look: "The grille is hot-glued on. The badge looks hand-painted.", paper: "Serial: sanded off. Receipt is a napkin that says 'trust me'." },
    cosmetic: { look: "Scuffed cabinet corners. The cones are perfect. Honest wear." }
  },
  headphones: {
    ok: ["The headband flexes with a springy snap.", "Cable steady, no crackle.", "Both cups loud and clear. Great detail.", "Pads intact, headband solid, hinges tight.", "Receipt: bought new. Serial matches."],
    deadCh: { ctl: "Right cup only, even when you wiggle.", listen: "Right cup only. The left is silent.", look: "The left cup's cable end is pinched flat." },
    scratchy: { ctl: "Crackles when you wiggle the cable. Loose jack.", look: "The cable is taped where it meets the jack.", listen: "Clean, with random crackle." },
    dead: { power: "The band flexes. That's all it does.", ctl: "Wiggle, wiggle. Nothing.", listen: "Both cups are dead. Not even a hiss.", look: "The cable is wrapped in electrical tape.", paper: "A sticker says TESTED OK. The date is smudged." },
    fake: { power: "The band creaks. Something rattles inside.", listen: "Tinny and thin. No bass at all.", look: "The badge looks hand-painted. Is that a typo?", paper: "Serial: sanded off. Receipt is a napkin that says 'trust me'." },
    cosmetic: { look: "Worn pads, scuffed band. The sound is fine. Honest wear." }
  },
  box: { ok: ["It powers up.", "It does what it does.", "Sounds like gear.", "Looks like gear.", "Receipt: it's a receipt."] }
};
const EDDIE_REACT = {
  wobble: ["It's, uh, vintage. They all do that.", "That's not a wobble, that's groove."],
  scratchy: ["That's vintage crackle! Costs extra on a new one.", "Needs a little wiggle. Just wiggle it."],
  noPlay: ["Needle? Needles are a state of mind.", "I'll throw one in. Somewhere. Eventually."],
  dead: ["It was working this morning!", "It was working this morning! I swear on the van."],
  deadCh: ["Left is the new right.", "That's called stereo imaging, kid."],
  hum: ["That's ambiance. You can't buy ambiance.", "Hum? What hum? That's soul."],
  blown: ["Tweeters are optional. Highs are overrated.", "It's... a feature. For your ears."],
  fake: ["Provenance? It's, uh, a vibe.", "Don't look at the badge. Look at the price!"],
  cosmetic: ["Character! You can't fake character.", "Honest wear. It's been loved."],
  ok: ["Told ya. A two-time deal.", "Mint. I'd keep it, but I need the van space.", "See? Beautiful. Ask me twice, I'll say it twice."]
};
const HYPE = ["Beauty, right? Came off a very nice estate. A very nice, quiet estate.", "My cousin's a roadie. This one has stories.", "Fell off a... I mean, came off a truck. A legit truck.", "One owner. Two, tops. Three.", "I don't sell gear, I match gear with destiny.", "It's a two-time deal. Ask me twice."];
const BOUT = [
  ["A soft click, a warm glow. Nothing hums.", "No faders: every knob clicks and glides the same way.", "Warm and quiet. No hum, no hiss. Just the music.", "Brass-ringed knobs, tight as a vault. Not a scratch.", "A certificate: handwired in Barcelona. Four channels, 100% analogue."],
  ["Powers up with a soft, confident thump.", "The controls feel built to last.", "Clean, deep and honest. It tells you the truth.", "Immaculate. Not a fingerprint on it.", "The shop's certificate. Everything checks out."]
];
const BOUTIQUE_INTRO = ["Take your time. Don't touch the knobs unless I say.", "Everything here is hand-wired. Nothing here is on sale."];

/* ------------------------------------------------------------------ scenario */
const vkOf = g => (RP.gearkit ? RP.gearkit.vkind(g) : (g.kind === "turntable" ? "turntable" : g.slot === "decks" ? "cdj" : g.slot === "mixer" ? "mixer" : g.slot === "monitors" ? "monitor" : g.slot === "headphones" ? "headphones" : "box"));
const r5 = n => Math.max(5, Math.round(n / 5) * 5);
function shuffle(a, rnd) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

function buildScenario(p) {
  p = p || {};
  const boutique = p.seller === "boutique";
  const slot = p.slot || (boutique ? "mixer" : "turntables");
  let ids = Array.isArray(p.options) && p.options.length ? p.options.slice(0, 5) : (boutique ? ["can_electric_taula_4_mr"] : (DEFAULTS[slot] || DEFAULTS.turntables));
  let gears = ids.map(id => RP.gearInfo(id)).filter(Boolean);
  if (!gears.length) gears = DEFAULTS.turntables.map(id => RP.gearInfo(id)).filter(Boolean);
  const diff = clamp(Math.round(p.difficulty || 2), 1, 5);
  const seed = (p.seed != null ? p.seed : Math.floor(Math.random() * 1e9)) >>> 0;
  const rnd = mulberry(seed ^ hashStr(gears.map(g => g.id).join(",")));
  const n = gears.length;
  let nScam = boutique ? 0 : (p.scams != null ? p.scams : [1, 1, 2, 2, 3][diff - 1]);
  nScam = clamp(Math.round(nScam), 0, Math.max(0, n - 1));
  const order = shuffle(gears.map((g, i) => i), rnd);
  const forced = Array.isArray(p.flaws) ? p.flaws : null;
  if (forced) nScam = forced.filter(f => f && f !== "cosmetic" && f !== "ok").length;
  const scamIdx = forced ? new Set(forced.map((f, i) => (f && f !== "cosmetic" && f !== "ok" ? i : -1)).filter(i => i >= 0)) : new Set(order.slice(0, nScam));
  const usedFlaws = new Set();
  const roll = (x, fixed) => (forced ? fixed : x); // a scripted scenario prices at fixed points (rnd() is still drawn, so seeds line up)
  const floorK = [0.84, 0.86, 0.88, 0.9, 0.92][diff - 1];
  let fakeUsed = false, cosmeticUsed = false;
  const listings = gears.map((g, i) => {
    const vk = vkOf(g);
    const L = { i, id: g.id, gear: g, vk, flaw: null, cosmetic: false, scam: false, seed: Math.floor(rnd() * 1000) };
    const factor = boutique ? 1 : 0.58 + roll(rnd(), 0.5) * 0.16;
    let fair = r5(g.price * factor);
    if (scamIdx.has(i)) {
      L.scam = true;
      let pool = FLAWS[vk] || FLAWS.box;
      pool = pool.filter(f => !(f === "fake" && fakeUsed) && !usedFlaws.has(f + vk));
      if (!pool.length) pool = (FLAWS[vk] || FLAWS.box).filter(f => !(f === "fake" && fakeUsed));
      if (diff <= 2) { const easy = pool.filter(f => EASY.indexOf(f) >= 0); if (easy.length) pool = easy; }
      L.flaw = forced && forced[i] ? forced[i] : pool[Math.floor(rnd() * pool.length)];
      if (L.flaw === "fake") fakeUsed = true;
      usedFlaws.add(L.flaw + vk);
      L.ask = L.flaw === "fake" ? r5(fair * 0.36) : r5(fair * (0.96 + roll(rnd(), 0.5) * 0.14));
      L.floor = r5(L.ask * 0.8);
    } else {
      if ((forced && forced[i] === "cosmetic") || (!forced && !boutique && !cosmeticUsed && diff >= 2 && n >= 3 && rnd() < 0.55)) { L.cosmetic = true; cosmeticUsed = true; fair = r5(fair * 0.84); }
      L.ask = boutique ? g.price : r5(fair * (1.16 + roll(rnd(), 0.9) * 0.1));
      L.floor = boutique ? g.price : r5(fair * floorK);
    }
    const pin = forced && p.asks ? Math.round(+p.asks[g.id]) : 0;
    if (pin > 0) { L.floor = r5(L.floor * pin / L.ask); L.ask = pin; }
    L.askNow = L.ask; L.floor0 = L.floor; L.ask0 = L.ask;
    L.patience = [5, 4, 4, 3, 3][diff - 1];
    L.status = "open"; L.agreed = null; L.lastOffer = null; L.probes = {}; L.notes = {}; L.seen = false; L.called = false; L.powered = false; L.cosLev = false;
    L.key = L.flaw || (L.cosmetic ? "cosmetic" : "ok");
    return L;
  });
  const working = listings.filter(l => !l.scam);
  let budget = p.budget;
  if (budget == null) {
    if (boutique) budget = r5(listings[0].ask * 1.12);
    else {
      const asks = working.map(l => l.ask).sort((a, b) => a - b);
      budget = asks.length > 1 ? r5(asks[asks.length - 1] * 0.92) : r5(asks[0] * 1.05);
      budget = Math.max(budget, asks[0]);
    }
  }
  const reachable = working.filter(l => l.floor <= budget);
  const best = reachable.slice().sort((a, b) => (b.gear.price - a.gear.price))[0] || null;
  return { listings, slot, boutique, pair: !boutique && !!PAIR[slot], budget, diff, best, seed, seller: boutique ? "Mercè" : (typeof p.seller === "string" ? p.seller : "Eddie Two-Times") };
}

function scoreWorking(sc, L, paid, info) {
  const base = 45;
  const pick = 20 * clamp(L.gear.price / Math.max(1, sc.best ? sc.best.gear.price : L.gear.price), 0, 1);
  const gap = Math.max(1, L.ask0 - L.floor0);
  const hag = 15 * clamp((L.ask0 - paid) / gap, 0, 1);
  const scams = sc.listings.filter(l => l.scam).length;
  const caught = sc.listings.filter(l => l.scam && (l.called || l.seen)).length;
  const sense = scams ? 20 * (caught / scams) : 20;
  const score = base + pick + hag + clamp(sense - 7 * (info.falseCalls || 0), 0, 20);
  return Math.round(clamp(score, 0, 100));
}

/* ------------------------------------------------------------------ css */
const CSS = `
.mg-buyGear .mg-wrap { margin-block: 0 auto; }
.bg-wrap { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.mg-head.bg-head { align-items: center; }
.bg-head .bg-cash { font-size: 24px; color: var(--lime); letter-spacing: .04em; font-variant-numeric: tabular-nums; margin-left: auto; }
.bg-head .bg-cash small { font-size: 16px; color: var(--muted); margin-right: 6px; }
.bg-head .bg-leave { font-size: 18px; padding: 2px 12px; }
.bg-main { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); grid-template-areas: "scene insp" "say insp" "cards insp" "notes insp"; grid-template-rows: auto auto auto 1fr; gap: 8px 10px; align-items: start; }
.bg-a-scene { grid-area: scene; } .bg-a-say { grid-area: say; } .bg-a-cards { grid-area: cards; } .bg-a-notes { grid-area: notes; align-self: stretch; } .bg-a-insp { grid-area: insp; }
.bg-box { background: #120e24; border: 1px solid var(--line); padding: 8px; border-radius: 4px; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.bg-frame { position: relative; line-height: 0; border: 2px solid #3a2f78; box-shadow: 0 0 0 2px #120a2c, 0 5px 0 #000; background: #05030a; }
.bg-frame canvas { width: 100%; height: auto; display: block; image-rendering: pixelated; image-rendering: crisp-edges; }
.bg-scene { cursor: pointer; aspect-ratio: 320 / 140; }
.bg-close { aspect-ratio: 160 / 120; }
.bg-say { min-height: 44px; font-size: 21px; line-height: 1.05; color: #ff8fcf; }
.bg-say b { font-weight: 400; color: var(--amber); }
.bg-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(138px, 1fr)); gap: 6px; }
.bg-card { text-align: left; background: #120e24; border: 1px solid #241d48; color: var(--fg); padding: 5px 8px; border-radius: 2px; cursor: pointer; display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "n p" "s d"; column-gap: 6px; align-items: baseline; font-size: 18px; line-height: 1.05; min-width: 0; }
.bg-card b { grid-area: n; font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bg-card .pr { grid-area: p; color: var(--amber); font-size: 22px; font-variant-numeric: tabular-nums; }
.bg-card .sub { grid-area: s; font-size: 15px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bg-card .dots { grid-area: d; font-size: 15px; letter-spacing: 2px; color: var(--cyan); justify-self: end; }
.bg-card:hover { border-color: var(--pink); }
.bg-card.sel { border-color: var(--amber); background: #1d1530; box-shadow: inset 0 0 0 1px var(--amber); }
.bg-card.gone { opacity: .45; text-decoration: line-through; }
.bg-card.junk { opacity: .55; border-color: #6a2030; }
.bg-card.junk .pr { color: #ff5a5a; }
.bg-ttl { font-size: 22px; color: #fff; line-height: 1; display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.bg-ttl small { font-size: 16px; color: var(--muted); white-space: nowrap; }
.bg-fact { font-size: 16px; line-height: 1.02; color: var(--cyan); max-height: 4.1em; overflow: hidden; }
.bg-probes { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 5px; }
.bg-probe { background: #1a1534; color: var(--fg); border: 1px solid #3a3070; border-radius: 3px; padding: 5px 4px 4px; cursor: pointer; font-size: 17px; line-height: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.bg-probe:hover { border-color: var(--cyan); color: var(--cyan); }
.bg-probe kbd { font-family: var(--ui); font-size: 13px; color: var(--muted); }
.bg-probe.done { border-color: #2a6a46; }
.bg-probe.done kbd { color: var(--ok); }
.bg-probe:disabled { opacity: .4; cursor: default; }
.bg-notes { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 3px; font-size: 18px; line-height: 1.02; color: #e4ddff; min-height: 104px; }
.bg-notes li { display: grid; grid-template-columns: 46px 1fr; gap: 6px; }
.bg-notes li i { font-style: normal; font-size: 14px; color: #12061a; background: var(--cyan); padding: 1px 3px; height: fit-content; text-align: center; }
.bg-notes li.warn i { background: var(--pink); }
.bg-notes li.good i { background: var(--ok); }
.bg-notes li.cos i { background: var(--amber); }
.bg-notes .empty { color: var(--muted); display: block; }
.bg-deal { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; background: #120e24; border: 1px solid var(--line); border-radius: 4px; padding: 8px 10px; }
.bg-deal.stick { position: sticky; bottom: 0; z-index: 3; box-shadow: 0 -6px 0 rgba(5, 3, 10, .9); }
.bg-ask { font-size: 20px; color: var(--muted); display: flex; flex-direction: column; line-height: 1; min-width: 92px; }
.bg-ask b { font-weight: 400; font-size: 34px; color: var(--amber); font-variant-numeric: tabular-nums; }
.bg-ask small { font-size: 15px; color: var(--muted); margin-top: 2px; white-space: nowrap; }
.bg-ask.deal b { color: var(--ok); }
.bg-offer { display: flex; align-items: center; gap: 6px; flex: 1 1 230px; min-width: 0; }
.bg-offer input[type=range] { flex: 1; min-width: 80px; accent-color: var(--pink); height: 28px; }
.bg-offer .val { font-size: 26px; min-width: 64px; text-align: right; color: var(--fg); font-variant-numeric: tabular-nums; }
.bg-offer .kbtn { min-width: 40px; padding: 4px 6px; }
.bg-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-left: auto; }
.bg-btns .btn { font-size: 20px; padding: 5px 12px; }
.bg-offer .of { display: none; font-size: 16px; color: var(--muted); white-space: nowrap; }
.bg-btns .btn.confirm { background: var(--ok); border-color: var(--ok); color: #06180e; }
.bg-meter { display: flex; align-items: center; gap: 8px; font-size: 20px; color: var(--muted); flex: 1 1 200px; }
.bg-meter b { font-weight: 400; color: var(--fg); font-size: 30px; }
.bg-pips { display: flex; gap: 3px; flex: 1; }
.bg-pips i { flex: 1; height: 12px; background: #1a1534; border: 1px solid #2d2456; }
.bg-pips i.on { background: var(--amber); }
.bg-pips i.me { background: var(--pink); }
.bg-aud { display: flex; flex-direction: column; gap: 6px; width: 100%; }
.bg-aud .q { font-size: 21px; color: var(--fg); line-height: 1.05; }
.bg-aud .q b { font-weight: 400; color: var(--amber); }
.bg-aud .opts { display: flex; flex-wrap: wrap; gap: 6px; }
.bg-aud .opts .btn { font-size: 19px; padding: 5px 10px; text-align: left; flex: 1 1 200px; }
.bg-spec { display: flex; gap: 4px; align-items: flex-end; height: 40px; padding: 4px; background: #0a0816; border: 1px solid #241d48; }
.bg-spec i { flex: 1; background: var(--cyan); min-height: 3px; transition: height .15s steps(4); }
.bg-card-end { background: #120e24; border: 2px solid var(--pink); padding: 14px; display: flex; flex-direction: column; gap: 10px; align-items: center; text-align: center; }
.bg-card-end h2 { font-family: var(--logo); font-weight: 400; font-size: clamp(16px, 3.6vw, 26px); margin: 0; color: #fff; }
.bg-card-end .big { font-size: 56px; color: var(--amber); line-height: 1; }
.bg-card-end p { margin: 0; font-size: 21px; line-height: 1.08; color: #e4ddff; max-width: 560px; }
.bg-card-end ul { list-style: none; margin: 0; padding: 0; font-size: 19px; color: var(--muted); display: grid; gap: 2px; text-align: left; }
.bg-card-end ul b { font-weight: 400; color: var(--fg); }
.bg-card-end canvas { width: min(480px, 100%); height: auto; image-rendering: pixelated; image-rendering: crisp-edges; border: 2px solid #3a2f78; }
.bg-wrap :focus-visible { outline: 2px solid var(--cyan); outline-offset: 1px; }
@media (max-width: 760px) {
  .bg-main { grid-template-columns: minmax(0, 1fr); grid-template-areas: "scene" "say" "cards" "insp" "notes"; grid-template-rows: auto; }
  .bg-cards { grid-template-columns: minmax(0, 1fr); gap: 4px; }
  .bg-card { grid-template-columns: minmax(0, 1fr) auto auto; grid-template-areas: "n d p"; padding: 7px 8px; column-gap: 8px; }
  .bg-card .sub { display: none; }
  .bg-notes { min-height: 70px; }
  .bg-say { min-height: 0; font-size: 20px; }
  .bg-deal { padding: 6px 8px; gap: 6px; }
  .bg-ask { display: none; }
  .bg-ask.always { display: flex; }
  .bg-offer { flex: 1 1 100%; }
  .bg-offer .of { display: inline; }
  .bg-btns { margin-left: 0; width: 100%; }
  .bg-btns .btn { flex: 1; padding: 6px 4px; }
  .bg-ttl { font-size: 20px; }
  .bg-meter { flex: 1 1 100%; }
}
`;
let cssDone = false;

/* ------------------------------------------------------------------ the game */
RP.mg.register("buyGear", {
  title: "buy.Gear", order: 8,
  desc: "Inspect, test and haggle in Eddie's van. Spot the lemon before you pay.",
  auto(params) {
    try {
      const sc = buildScenario(Object.assign({ seed: 7 }, params || {}));
      const cand = sc.listings.filter(l => !l.scam && l.floor <= sc.budget).sort((a, b) => b.gear.price - a.gear.price);
      if (!cand.length) return { ok: false, score: 0, bought: null, paid: 0 };
      const L = cand[0], paid = Math.min(sc.budget, L.askNow <= sc.budget ? L.floor : L.floor);
      return { ok: true, score: 88, bought: L.id, paid };
    } catch (e) { return { ok: true, score: 80, bought: null, paid: 0 }; }
  },

  async play(host, p) {
    p = p || {};
    if (!cssDone) { el("style", { text: CSS }, document.head); cssDone = true; }
    const GK = RP.gearkit;
    const sc = buildScenario(p);
    const boutique = sc.boutique;
    const L = sc.listings;
    const reduced = GK ? GK.reduced() : false;
    const root = host.root;
    const diff = sc.diff;
    const money = n => "$" + Math.round(n).toLocaleString("en-US");
    const wrap = el("div", { cls: "bg-wrap" }, root);
    root.removeChild(wrap); // header must be first
    const head = host.header("buy.Gear", boutique ? "Boutique · by appointment" : sc.seller + (/s$/i.test(sc.seller) ? "'" : "'s") + " van");
    head.classList.add("bg-head");
    const cashEl = el("span", { cls: "bg-cash", html: "<small>CASH</small>" + money(sc.budget) }, head);
    const leave = el("button", { cls: "btn bg-leave", type: "button", text: "LEAVE" }, head);
    root.appendChild(wrap);

    if (!GK) { // art kit failed to load: degrade to a plain pick list
      el("div", { cls: "mg-msg", text: "The van is dark. (art kit missing)" }, wrap);
    }

    /* ---------- state ---------- */
    const st = { sel: 0, said: "", mouth: 0, expr: "neutral", exprT: 0, view: "item", viewT: 0, anim: null, phase: 0, strobe: 0, drift: 0, pitch: 0.5, falseCalls: 0, done: false, buying: false, offer: 0, place: 0, attempts: 1, good: 0, t: 0, loupe: null, jit: 0, sigs: [0, 0, 0, 0], tone: null, bandTone: null };
    const cur = () => L[st.sel];
    let tone = null;
    const stopTone = () => { if (tone) { try { tone.stop(); } catch (e) { /* ignore */ } tone = null; } };
    host.cleanup(stopTone);
    host.cleanup(() => { try { st.bandStop && st.bandStop(); } catch (e) { /* ignore */ } });

    /* ---------- layout ---------- */
    const main = el("div", { cls: "bg-main" }, wrap);
    const sceneFrame = el("div", { cls: "bg-frame bg-a-scene" }, main);
    const scv = el("canvas", { cls: "px bg-scene", width: 320, height: 140, tabindex: "-1", role: "img", "aria-label": boutique ? "The showroom" : "Eddie's van, gear laid out on a blanket" }, sceneFrame);
    const sctx = scv.getContext("2d");
    const say = el("div", { cls: "bg-say bg-a-say", "aria-live": "polite" }, main);
    const cards = el("div", { cls: "bg-cards bg-a-cards", role: "list" }, main);
    const box = el("div", { cls: "bg-box bg-a-insp" }, main);
    const ttl = el("div", { cls: "bg-ttl" }, box);
    const closeFrame = el("div", { cls: "bg-frame" }, box);
    const ccv = el("canvas", { cls: "px bg-close", width: 160, height: 120, role: "img", "aria-label": "Close-up of the selected gear" }, closeFrame);
    const cctx = ccv.getContext("2d");
    const fact = el("div", { cls: "bg-fact" }, box);
    const probesEl = el("div", { cls: "bg-probes" }, box);
    const notesBox = el("div", { cls: "bg-box bg-a-notes" }, main);
    el("div", { cls: "bg-ttl", html: "<span>NOTEBOOK</span><small>what you found out</small>" }, notesBox);
    const notes = el("ul", { cls: "bg-notes", "aria-live": "polite" }, notesBox);
    const deal = el("div", { cls: "bg-deal stick" }, wrap);

    /* ---------- speech ---------- */
    const sellerChar = boutique ? "gk_merce" : "eddie";
    if (boutique && !RP.chars.get("gk_merce")) {
      try { RP.chars.define("gk_merce", { name: "Mercè", height: 94, figure: "curvy", skin: "#c98a62", hair: { style: "bun", color: "#2e1d16" }, top: { style: "shirt", color: "#f1e6d0" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "shoes", color: "#5a3424" }, acc: ["glasses", "earring"], voice: "#ffd27a" }); } catch (e) { /* ignore */ }
    }
    const who = boutique ? "MERCÈ" : sc.seller.split(" ")[0].toUpperCase();
    function speak(text, expr) {
      st.said = text; say.innerHTML = "<b>" + who + ":</b> “" + RP.u.esc(text) + "”";
      st.mouth = 1.3; if (expr) { st.expr = expr; st.exprT = 3.6; }
    }
    const pickR = a => a[Math.floor(Math.random() * a.length)];

    /* ---------- cards ---------- */
    const cardEls = L.map((l, i) => {
      const b = el("button", { cls: "bg-card", type: "button", role: "listitem" }, cards);
      el("b", { text: l.gear.brand + " " + l.gear.model }, b);
      el("span", { cls: "pr", text: money(l.askNow) }, b);
      el("span", { cls: "sub", text: (L.length > 1 ? "#" + (i + 1) : "On the stand") + (sc.pair ? " · pair" : "") + (l.gear.year ? " · " + l.gear.year : "") }, b); el("span", { cls: "dots", text: "" }, b);
      b.addEventListener("click", () => select(i));
      return b;
    });
    function refreshCards() {
      L.forEach((l, i) => {
        const b = cardEls[i];
        b.classList.toggle("sel", i === st.sel); b.classList.toggle("gone", l.status === "gone"); b.classList.toggle("junk", l.status === "busted");
        b.querySelector(".pr").textContent = l.status === "gone" ? "SOLD" : l.status === "busted" ? "JUNK" : money(l.agreed != null ? l.agreed : l.askNow);
        b.querySelector(".dots").textContent = PROBES.map(k => (l.probes[k] ? "●" : "○")).join("");
        b.setAttribute("aria-label", l.gear.brand + " " + l.gear.model + ", " + (l.status === "open" ? "asking " + money(l.askNow) + (sc.pair ? " for the pair" : "") : l.status));
      });
    }

    /* ---------- probes ---------- */
    const pBtns = PROBES.map((k, i) => {
      const b = el("button", { cls: "bg-probe", type: "button" }, probesEl);
      el("span", { cls: "t", text: "" }, b); el("kbd", { text: "[" + (i + 1) + "]" }, b);
      b.addEventListener("click", () => probe(i));
      return b;
    });
    function refreshProbes() {
      const l = cur(), lab = PLABEL[l.vk] || PLABEL.box;
      pBtns.forEach((b, i) => { b.firstChild.textContent = lab[i]; b.classList.toggle("done", !!l.probes[PROBES[i]]); });
    }
    function noteText(l, k) {
      if (boutique) return BOUT[l.id === "can_electric_taula_4_mr" || l.vk === "mixer" ? 0 : 1][PROBES.indexOf(k)];
      const tab = T[l.vk] || T.box, ok = tab.ok[PROBES.indexOf(k)];
      const f = tab[l.key];
      return (f && typeof f === "object" && f[k]) || ok;
    }
    const customFor = (l, k) => { const f = (T[l.vk] || T.box)[l.key]; return !!(f && typeof f === "object" && f[k]); };
    const isEvidence = (l, k) => !boutique && l.key !== "ok" && customFor(l, k);
    const firstEvidence = l => PROBES.find(k => customFor(l, k)) || "look";
    function refreshNotes() {
      const l = cur(); notes.innerHTML = "";
      const have = PROBES.filter(k => l.notes[k]);
      if (!have.length) { el("li", { html: "<span class='empty'>Nothing tested yet. Tap a test. Trust your eyes and ears, not Eddie.</span>" }, notes).className = "empty"; notes.firstChild.style.display = "block"; if (boutique) notes.firstChild.firstChild.textContent = "Look, listen, read the paperwork. Mercè is watching."; }
      have.forEach(k => {
        const n = l.notes[k]; const li = el("li", { cls: n.evidence ? (l.flaw ? "warn" : "cos") : "good" }, notes);
        el("i", { text: PTAG[PROBES.indexOf(k)] }, li); el("span", { text: n.text }, li);
      });
    }

    function startTone(l, k) {
      stopTone();
      const o = { vol: 0.5 }, flaw = l.flaw;
      const wob = [60, 48, 38, 30, 24][diff - 1];
      if (flaw === "dead") return null;
      if (flaw === "wobble") { o.wobble = wob; o.rate = 0.85 + (l.seed % 5) * 0.08; }
      if (flaw === "hum") o.hum = true;
      if (flaw === "scratchy") o.crackle = k === "ctl" ? 0.8 : 0.12;
      if (flaw === "deadCh") o.pan = l.seed % 2 ? 1 : -1;
      if (flaw === "fake") { o.thin = true; o.crackle = 0.15; o.vol = 0.35; }
      if (flaw === "blown") { o.distort = true; o.crackle = 0.25; }
      if (flaw === "noPlay") { o.silent = true; o.motor = l.vk === "turntable"; }
      if (k === "power" && flaw === "hum") { o.silent = true; o.hum = true; o.vol = 0.35; }
      return GK ? GK.tone(o) : null;
    }

    function probe(i) {
      if (st.done) return;
      const l = cur(), k = PROBES[i];
      if (l.status === "gone") { speak("That one's gone, kid. Pay attention.", "neutral"); return; }
      RP.sfx("select");
      l.probes[k] = (l.probes[k] || 0) + 1;
      const text = noteText(l, k), ev = isEvidence(l, k);
      if (!l.notes[k]) l.notes[k] = { text, evidence: ev };
      if (ev && l.flaw) l.seen = true;
      if (k === "power" && l.flaw !== "dead") l.powered = true;
      const dur = k === "power" ? 3.4 : k === "ctl" ? 3.6 : k === "listen" ? 3.2 : k === "look" ? 3.0 : 4.4;
      st.anim = { k, t0: st.t, dur, l };
      st.view = k === "paper" ? "paper" : "item"; st.viewT = st.t + dur;
      if (k === "look") { const f = GK ? GK.focus(l.vk, l.cosmetic && !l.flaw ? "cosmetic" : l.flaw || "ok") : [60, 40]; st.loupe = { fx: f[0], fy: f[1], from: [f[0] > 80 ? 20 : 140, f[1] > 60 ? 20 : 100] }; }
      stopTone();
      if (GK && (k === "listen" || k === "ctl" || (k === "power" && (l.flaw === "hum")))) tone = startTone(l, k);
      else if (k === "power") { RP.sfx(l.vk === "turntable" ? "needle" : "thump"); if (l.flaw === "dead") RP.sfx("buzz"); }
      else if (k === "look") RP.sfx("blip"); else if (k === "paper") RP.sfx("pickup");
      if (k === "ctl" && l.flaw === "scratchy") RP.sfx("crackle");
      // seller reaction
      if (boutique) speak(ev ? "..." : pickR(["Mm. Yes. It does that.", "Handled with care, thank you.", "Yes. It is meant to sound like that.", "Good. You use your eyes."]), "neutral");
      else if (ev && l.flaw) speak(pickR(EDDIE_REACT[l.flaw] || EDDIE_REACT.ok), l.flaw === "dead" || l.flaw === "fake" ? "worried" : "neutral");
      else if (l.cosmetic && ev) speak(pickR(EDDIE_REACT.cosmetic), "happy");
      else speak(pickR(EDDIE_REACT.ok), "happy");
      refreshNotes(); refreshProbes(); refreshCards(); refreshDeal();
    }

    /* ---------- selection ---------- */
    function select(i, quiet) {
      if (st.done || i < 0 || i >= L.length) return;
      if (st.sel !== i || !quiet) { st.sel = i; st.anim = null; st.view = "item"; st.loupe = null; st.buying = false; stopTone(); }
      const l = cur();
      st.offer = Math.max(5, Math.round((l.agreed != null ? l.agreed : l.askNow) * 0.85 / 5) * 5);
      if (!quiet) RP.sfx("click");
      ttl.innerHTML = ""; el("span", { text: l.gear.brand + " " + l.gear.model }, ttl); el("small", { text: PLABEL[l.vk] ? ({ turntable: "TURNTABLE", cdj: "DECK", mixer: "MIXER", monitor: "MONITORS", headphones: "HEADPHONES", box: "GEAR" })[l.vk] : "" }, ttl);
      fact.textContent = l.gear.fact || "";
      refreshProbes(); refreshNotes(); refreshCards(); refreshDeal();
      if (!quiet) {
        if (boutique) speak(l.status === "open" ? "The " + l.gear.model + ". " + pickR(BOUTIQUE_INTRO) : "...", "neutral");
        else if (l.status === "gone") speak("Sold! Guy came by while you were staring.", "happy");
        else speak(pickR(HYPE), "happy");
      }
    }
    scv.addEventListener("pointerdown", e => {
      const r = scv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 320, y = (e.clientY - r.top) / r.height * 140;
      let best = -1, bd = 1e9;
      L.forEach((l, i) => { if (!l.box) return; const [bx, by, bw, bh] = l.box; const dx = Math.max(bx - x, 0, x - (bx + bw)), dy = Math.max(by - y, 0, y - (by + bh)), d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = i; } });
      if (best >= 0 && bd < 22) select(best);
    });

    /* ---------- the deal bar (van: haggle; boutique: waitlist) ---------- */
    let ofEl = null, slider = null, offerVal = null, askEl = null, askLbl = null, askVal = null, askNote = null, btnOffer = null, btnBuy = null, btnBS = null, meterPips = null, meterNum = null, btnTalk = null;
    function buildDeal() {
      deal.innerHTML = "";
      if (boutique) {
        askEl = el("div", { cls: "bg-ask" }, deal); askLbl = el("span", { text: "PRICE (FIXED)" }, askEl); askVal = el("b", { text: "" }, askEl);
        const m = el("div", { cls: "bg-meter" }, deal);
        el("span", { text: "YOUR PLACE" }, m); meterNum = el("b", { text: "" }, m); meterPips = el("div", { cls: "bg-pips" }, m);
        for (let i = 0; i < 10; i++) el("i", {}, meterPips);
        const bt = el("div", { cls: "bg-btns" }, deal);
        btnTalk = el("button", { cls: "btn", type: "button", text: "SPEAK WITH MERCÈ" }, bt);
        btnBuy = el("button", { cls: "btn primary", type: "button", text: "BUY" }, bt);
        btnTalk.addEventListener("click", () => audience());
        btnBuy.addEventListener("click", () => buy());
        return;
      }
      askEl = el("div", { cls: "bg-ask" }, deal); askLbl = el("span", { text: "ASKING" }, askEl); askVal = el("b", { text: "" }, askEl); askNote = el("small", { text: "" }, askEl);
      const o = el("div", { cls: "bg-offer" }, deal);
      ofEl = el("span", { cls: "of", text: "" }, o);
      const dn = el("button", { cls: "kbtn", type: "button", text: "−5", "aria-label": "Offer five dollars less" }, o);
      slider = el("input", { type: "range", min: "5", max: "100", step: "1", value: "50", "aria-label": "Your offer" }, o);
      const up = el("button", { cls: "kbtn", type: "button", text: "+5", "aria-label": "Offer five dollars more" }, o);
      offerVal = el("span", { cls: "val", text: "" }, o);
      slider.addEventListener("input", () => { st.offer = parseInt(slider.value, 10) || 5; offerVal.textContent = money(st.offer); });
      dn.addEventListener("click", () => setOffer(st.offer - 5)); up.addEventListener("click", () => setOffer(st.offer + 5));
      const bt = el("div", { cls: "bg-btns" }, deal);
      btnOffer = el("button", { cls: "btn", type: "button", text: "OFFER" }, bt);
      btnBuy = el("button", { cls: "btn primary", type: "button", text: "BUY" }, bt);
      btnBS = el("button", { cls: "btn", type: "button", text: "CALL BS" }, bt);
      btnOffer.addEventListener("click", () => makeOffer());
      btnBuy.addEventListener("click", () => buy());
      btnBS.addEventListener("click", () => callBS());
    }
    function setOffer(v) { st.offer = clamp(Math.round(v), parseInt(slider.min, 10), parseInt(slider.max, 10)); slider.value = st.offer; offerVal.textContent = money(st.offer); }
    function priceOf(l) { return l.agreed != null ? l.agreed : l.askNow; }
    function refreshDeal() {
      const l = cur(), open = l.status === "open" && !st.done, price = priceOf(l);
      if (boutique) {
        askVal.textContent = money(l.ask); askEl.classList.toggle("deal", st.place === 1);
        meterNum.textContent = "#" + st.place;
        [...meterPips.children].forEach((e, i) => { const slot = 10 - i; e.className = slot === st.place ? "me" : slot > st.place ? "on" : ""; });
        btnBuy.textContent = st.buying ? "SURE? " + money(price) : sc.budget < price ? "NEED " + money(price - sc.budget) + " MORE" : st.place > 1 ? "BUY (LIST: #" + st.place + ")" : "BUY " + money(price);
        btnBuy.classList.toggle("confirm", st.buying);
        btnBuy.disabled = !open || sc.budget < price || st.place > 1;
        btnTalk.disabled = st.done || st.audience;
        return;
      }
      askVal.textContent = money(price); askEl.classList.toggle("deal", l.agreed != null);
      askLbl.textContent = (l.agreed != null ? "DEAL" : "ASKING") + (sc.pair ? " · PAIR" : "");
      askNote.textContent = l.agreed != null ? "after haggling" : l.askNow < l.ask0 ? "tag was " + money(l.ask0) : "tag price, before haggling";
      slider.max = String(Math.max(10, Math.round(l.askNow))); slider.min = String(Math.max(5, Math.round(l.ask0 * 0.3)));
      st.offer = clamp(st.offer, parseInt(slider.min, 10), parseInt(slider.max, 10)); slider.value = st.offer; offerVal.textContent = money(st.offer);
      slider.disabled = !open || l.agreed != null; btnOffer.disabled = !open || l.agreed != null;
      ofEl.textContent = (l.agreed != null ? "DEAL " : "ASK ") + money(price) + (sc.pair ? " · PAIR" : "");
      btnBS.disabled = !open;
      btnBuy.textContent = st.buying ? "SURE? " + money(price) : sc.budget < price ? "NEED " + money(price - sc.budget) + " MORE" : "BUY " + money(price);
      btnBuy.classList.toggle("confirm", st.buying);
      btnBuy.disabled = !open || sc.budget < price;
      cashEl.innerHTML = "<small>CASH</small>" + money(sc.budget);
    }
    buildDeal();

    /* ---------- haggling (van) ---------- */
    function makeOffer() {
      const l = cur(); if (l.status !== "open" || st.done) return;
      const offer = st.offer; st.buying = false;
      // an honest flaw you noticed is leverage
      if (l.cosmetic && l.probes.look && !l.cosLev) { l.cosLev = true; l.floor = r5(l.floor * 0.93); l.askNow = Math.min(l.askNow, r5(l.ask0 * 0.93)); speak("Fine, fine, the cover's gone. I'll knock a little off.", "worried"); RP.sfx("coin"); refreshCards(); refreshDeal(); return; }
      if (offer >= l.askNow) { l.agreed = l.askNow; speak("Sold! A two-time deal. Hand it over.", "happy"); RP.sfx("coin"); }
      else if (offer >= l.floor) { l.agreed = offer; speak(pickR(["Alright, alright. " + money(offer) + ". A two-time deal.", "You're killing me. Fine. " + money(offer) + ".", "Ugh. " + money(offer) + ". Don't tell my mother."]), "happy"); RP.sfx("coin"); }
      else {
        const r = offer / l.floor, twice = l.lastOffer != null && Math.abs(l.lastOffer - offer) <= 1;
        l.patience -= r < 0.6 ? 2 : r < 0.85 ? 1 : 0;
        l.lastOffer = offer;
        if (l.patience <= 0) {
          l.status = "gone"; speak("Deal's off. My guy just pulled up.", "angry"); RP.sfx("fail");
          const next = L.findIndex(x => x.status === "open"); if (next >= 0 && next !== st.sel) { /* stay put: the player sees SOLD */ }
        } else {
          const gap = l.askNow - l.floor, pull = (r > 0.9 ? 0.6 : r > 0.75 ? 0.45 : 0.25) + (twice ? 0.3 : 0);
          const na = Math.max(l.floor + 5, r5(l.askNow - gap * Math.min(0.95, pull)));
          const before = l.askNow; l.askNow = Math.min(before, na);
          const lines = r < 0.6 ? ["That's not an offer, that's a prank call.", "My van has feelings, you know."] : twice ? ["A two-time deal! You ask me twice, I come down twice. " + money(l.askNow) + "."] : ["How about " + money(l.askNow) + "? That's me bleeding."];
          if (l.patience <= 1) lines.push("Last offer, kid. " + money(l.askNow) + ". I mean it. Twice.");
          speak(pickR(lines), r < 0.6 ? "angry" : "worried"); RP.sfx("error");
        }
      }
      refreshCards(); refreshDeal();
    }
    function callBS() {
      const l = cur(); if (l.status !== "open" || st.done) return;
      if (l.scam) {
        l.called = true; l.status = "busted"; RP.sfx("success");
        const desc = noteText(l, firstEvidence(l));
        speak(pickR(["Okay, okay! It's got a little issue. A small one.", "...How did you know? Fine. Take it off the blanket."]), "surprised");
        l.notes.look = l.notes.look || { text: "Eddie admits it: " + desc.charAt(0).toLowerCase() + desc.slice(1), evidence: true };
      } else {
        st.falseCalls++; RP.sfx("fail");
        L.forEach(x => { if (x.status === "open") x.patience = Math.max(1, x.patience - 1); });
        l.askNow = Math.min(l.ask0, r5(l.askNow * 1.04));
        speak(st.falseCalls > 1 ? "Excuse me?! That's a beautiful unit. You're on thin ice, kid." : "BS?! That's a beautiful unit! I'm hurt. Right here.", "angry");
      }
      refreshNotes(); refreshCards(); refreshDeal();
    }

    /* ---------- boutique: the waitlist ---------- */
    st.place = 4 + diff;
    function band() { return ["LOW", "MID", "HIGH"][Math.floor(Math.random() * 3)]; }
    function audience() {
      if (st.done || st.audience) return;
      st.audience = true; st.good = 0; st.place = 4 + diff + (st.attempts - 1); refreshDeal();
      const ui = el("div", { cls: "bg-aud" }, deal); deal.querySelectorAll(":scope > *:not(.bg-aud)").forEach(n => { n.style.display = "none"; });
      const done = () => { ui.remove(); deal.querySelectorAll(":scope > *").forEach(n => { n.style.display = ""; }); st.audience = false; refreshDeal(); };
      const move = (n) => { st.place = clamp(st.place - n, 1, 12); refreshDeal(); };
      const ask = (q, opts, cb, extra) => {
        ui.innerHTML = ""; el("div", { cls: "q", html: q }, ui); if (extra) ui.appendChild(extra); const o = el("div", { cls: "opts" }, ui);
        opts.forEach(op => { const b = el("button", { cls: "btn", type: "button", text: op.t }, o); b.addEventListener("click", () => { o.querySelectorAll("button").forEach(x => { x.disabled = true; }); cb(op); }); });
        const first = o.querySelector("button"); if (first) first.focus({ preventScroll: true });
      };
      const next = (fn, ms) => host.timeout(fn, ms || 1500);
      const finish = () => {
        if (st.place <= 1) { speak("Number one. Today it is yours. Go on. Touch the knobs.", "happy"); RP.sfx("success"); done(); refreshDeal(); }
        else {
          const l = cur();
          speak("You are number " + st.place + " on my list. Come back when the list moves.", "neutral"); RP.sfx("fail");
          if (st.attempts >= 3) { ui.innerHTML = ""; el("div", { cls: "q", text: "Mercè closes the ledger. That's all the audience you get." }, ui); const o = el("div", { cls: "opts" }, ui); const b = el("button", { cls: "btn primary", type: "button", text: "LEAVE EMPTY-HANDED" }, o); b.addEventListener("click", () => finishGame(null)); b.focus({ preventScroll: true }); return; }
          ui.innerHTML = ""; el("div", { cls: "q", html: "You are <b>#" + st.place + "</b>. Ask again? She'll remember. (attempt " + (st.attempts + 1) + " of 3, one place back)" }, ui);
          const o = el("div", { cls: "opts" }, ui);
          const b1 = el("button", { cls: "btn primary", type: "button", text: "ASK AGAIN" }, o), b2 = el("button", { cls: "btn", type: "button", text: "LEAVE" }, o);
          b1.addEventListener("click", () => { st.attempts++; ui.remove(); deal.querySelectorAll(":scope > *").forEach(n => { n.style.display = ""; }); st.audience = false; audience(); });
          b2.addEventListener("click", () => finishGame(null)); b1.focus({ preventScroll: true });
        }
      };
      // round 1: the ear test
      const cut = band(); const ci = ["LOW", "MID", "HIGH"].indexOf(cut);
      speak("There is a list. First, your ears. I roll one isolator off. Which band did I cut?", "neutral");
      const noAudio = !RP.audio || !RP.audio.ctx || RP.audio.muted || !RP.audio.ctx();
      if (GK && GK.band) { st.bandStop && st.bandStop(); const h = GK.band(ci); st.bandStop = h.stop; }
      const spec = el("div", { cls: "bg-spec", "aria-hidden": "true" });
      for (let i = 0; i < 12; i++) el("i", {}, spec);
      const specTick = () => { [...spec.children].forEach((c, i) => { const bnd = i < 4 ? 0 : i < 8 ? 1 : 2; const h = (bnd === ci ? 0.12 : 0.55 + Math.random() * 0.4); c.style.height = Math.round(h * 100) + "%"; c.style.background = bnd === ci ? "var(--pink)" : "var(--cyan)"; }); };
      const specLive = () => { [...spec.children].forEach(c => { c.style.height = Math.round((0.4 + Math.random() * 0.5) * 100) + "%"; }); };
      if (noAudio) { specTick(); host.interval(specTick, 300); } else { specLive(); host.interval(specLive, 160); }
      ask(noAudio ? "(No sound here: watch the bars.) Which band is <b>cut</b>?" : "Which band is <b>cut</b>? Listen.", [{ t: "LOW (the thump)", i: 0 }, { t: "MID (the keys)", i: 1 }, { t: "HIGH (the hats)", i: 2 }], op => {
        st.bandStop && st.bandStop(); st.bandStop = null; spec.remove();
        if (op.i === ci) { st.good++; move(3); speak("Yes. The " + cut.toLowerCase() + ". You listen. Good.", "happy"); RP.sfx("success"); } else { move(-1); speak("No. It was the " + cut.toLowerCase() + ". Your ears need a nap.", "worried"); RP.sfx("error"); }
        next(round2);
      }, spec);
      function round2() {
        speak("Now tell me why a rotary. And do not lie to me.", "neutral");
        const opts = shuffle([{ t: "\"It looks incredible in photos.\"", d: -2 }, { t: "\"I want to shape every channel with my hands. Knobs, not faders.\"", d: 3 }, { t: "\"Axl Vanta says it's the only real mixer.\"", d: -3 }], Math.random);
        ask("<b>Why a rotary mixer?</b>", opts, op => {
          if (op.d > 0) { st.good++; move(op.d); speak("Yes. Knobs instead of faders. The Bozak did it first, in 1971. Everyone since is an echo.", "happy"); RP.sfx("success"); }
          else { move(op.d); speak(op.d < -2 ? "Axl Vanta has never once asked what is inside one." : "Photos. Hm. Photos do not mix.", "angry"); RP.sfx("error"); }
          next(round3);
        });
      }
      function round3() {
        speak("The price is " + money(cur().ask) + ". It is the price. What do you say?", "neutral");
        const opts = shuffle([{ t: "\"Can you do " + money(Math.round(cur().ask * 0.85 / 10) * 10) + "?\"", d: -2 }, { t: "\"Fair. Tell me about the first Taula.\"", d: 2 }, { t: "\"Cash, right now. Can we skip the list?\"", d: -1 }], Math.random);
        ask("<b>The price does not move.</b>", opts, op => {
          if (op.d > 0) { st.good++; move(op.d); speak("The first Taula was made for the record store Discos Paradiso. That is how it began. Good question.", "happy"); RP.sfx("success"); }
          else { move(op.d); speak(op.d < -1 ? "A hand-wired machine does not have a sale rack." : "Everyone has cash. Not everyone has ears.", "angry"); RP.sfx("error"); }
          next(finish, 1700);
        });
      }
    }
    st.audience = false;

    /* ---------- buying / ending ---------- */
    function buy() {
      if (st.done) return;
      const l = cur(), price = priceOf(l);
      if (l.status !== "open" || price > sc.budget) return;
      if (!st.buying) { st.buying = true; RP.sfx("blip"); host.timeout(() => { st.buying = false; refreshDeal(); }, 3200); refreshDeal(); return; }
      finishGame(l);
    }
    let resolveFn = null;
    function finishGame(l) {
      if (st.done) return; st.done = true; stopTone(); st.bandStop && st.bandStop();
      let res;
      if (!l) res = { ok: false, score: boutique ? clamp(st.good * 10, 0, 30) : 0, bought: null, paid: 0, place: boutique ? st.place : undefined, attempts: boutique ? st.attempts : undefined };
      else {
        const paid = priceOf(l), working = !l.scam;
        const spotted = L.filter(x => x.scam && (x.called || x.seen)).length;
        if (working) res = { ok: true, score: boutique ? clamp(55 + 15 * st.good - 8 * (st.attempts - 1), 40, 100) : scoreWorking(sc, l, paid, { falseCalls: st.falseCalls }), bought: l.id, paid, spotted, haggled: Math.max(0, l.ask0 - paid), lemon: null };
        else res = { ok: false, score: Math.round(clamp(10 * spotted / Math.max(1, L.filter(x => x.scam).length), 0, 10)), bought: null, paid, spotted, haggled: 0, lemon: l.id, flaw: l.flaw };
        if (boutique) { res.place = st.place; res.attempts = st.attempts; }
      }
      showEnd(l, res);
    }
    function showEnd(l, res) {
      wrap.remove(); head.remove();
      const hd = host.header("buy.Gear", boutique ? "Boutique" : sc.seller + (/s$/i.test(sc.seller) ? "'" : "'s") + " van");
      const card = el("div", { cls: "bg-card-end" }, root);
      const ecv = el("canvas", { cls: "px", width: 320, height: 140 }, card), ec = ecv.getContext("2d");
      if (GK) {
        ec.drawImage(boutique ? GK.boutiqueBG() : GK.vanBG(), 0, 0);
        const g = l ? l.gear : L[st.sel].gear, vk = l ? l.vk : L[st.sel].vk;
        if (l) { GK.item(ec, boutique && vk === "mixer" ? "hero" : vk, 150, boutique ? 106 : 120, { accent: GK.accent(g), tier: g.tier, nch: GK.nch(g), rotary: g.kind === "rotary", noNeedle: l.flaw === "noPlay", blown: l.flaw === "blown", seed: l.seed }); }
        try { RP.chars.draw(ec, { id: sellerChar, x: 282, y: 136, face: "left", act: "stand", expr: l ? (res.ok ? "happy" : "surprised") : "neutral" }, { lx: -0.6 }); } catch (e) { /* ignore */ }
        if (res.ok) { for (let i = 0; i < 14; i++) { const x = 60 + (i * 53) % 190, y = 30 + (i * 31) % 70; RP.u.R(ec, x, y, 2, 2, ["#ffd23f", "#ff3fa4", "#39d0ff", "#9be15d"][i % 4]); } }
        else if (l) { for (let i = 0; i < 9; i++) RP.u.ell(ec, 140 + (i % 3) * 8 + (i * 5) % 7, 78 - i * 5, 3 + (i % 3), 2, i % 2 ? "#3a3548" : "#5a566c"); RP.u.txtC(ec, "BZZT", 150, 30, "#ff5a5a", 3, 1); }
      }
      let title, msg;
      if (!l) { title = boutique ? "NOT TODAY" : "WALKED AWAY"; msg = boutique ? "Mercè closes the ledger. You're #" + st.place + ". The list will move eventually." : "You left with your cash and your dignity. Eddie waves like he's got a plane to catch."; }
      else if (res.ok) { title = "SOLD!"; msg = boutique ? "Mercè wraps the " + l.gear.model + " in velvet. “Take care of it. It will take care of you.”" : "You plug it in at home. It works. " + (res.haggled > 0 ? "You even shaved " + money(res.haggled) + " off Eddie's " + money(l.ask0) + " tag." : "Eddie wanted every dollar.") + " Rare for this van."; }
      else { title = "IT'S A LEMON"; msg = "You plug it in at home. " + noteText(l, PROBES.find(k => customFor(l, k)) || "look") + " You call Eddie. “It was working this morning!” NO REFUNDS."; }
      el("h2", { text: title }, card);
      if (l) el("div", { cls: "big", text: money(res.paid) }, card);
      el("p", { text: msg }, card);
      const ul = el("ul", {}, card);
      if (l) el("li", { html: "<b>" + RP.u.esc(l.gear.brand + " " + l.gear.model) + "</b>" + (sc.pair || !res.ok ? " (" + [sc.pair && "pair", !res.ok && "broken"].filter(Boolean).join(", ") + ")" : "") }, ul);
      if (!boutique) {
        // about the van, not the purchase: how many lemons were laid out, what you did about them (called out = flagged with CALL BS)
        const nL = L.filter(x => x.scam).length, nCalled = L.filter(x => x.scam && x.called).length;
        const verdict = !l ? "you walked away" : l.scam ? (nL === 1 ? "you bought it" : "you bought one") : "you steered clear";
        const what = [nCalled ? (nL === 1 ? "you called it out" : "you called out <b>" + nCalled + "</b> of " + nL) : "", verdict].filter(Boolean).join(" · ");
        el("li", { html: (nL === 1 ? "Lemon in the van: " : "Lemons in the van: ") + "<b>" + (nL || "none") + "</b>" + (nL ? " · " + what : "") }, ul);
        if (st.falseCalls) el("li", { html: "False accusations: <b>" + st.falseCalls + "</b>" }, ul);
      }
      else el("li", { html: "Your place on the list: <b>#" + st.place + "</b>" }, ul);
      el("li", { html: "Score: <b>" + res.score + " / 100</b>" }, ul);
      const go = el("button", { cls: "btn primary", type: "button", text: "CONTINUE" }, card);
      go.addEventListener("click", () => { if (resolveFn) { const f = resolveFn; resolveFn = null; f(res); } });
      go.focus({ preventScroll: true });
      RP.sfx(res.ok ? "cash" : l ? "fail" : "click");
    }

    /* ---------- drawing ---------- */
    function fxFor(l, now) {
      const a = st.anim && st.anim.l === l ? st.anim : null, k = a ? a.k : null, u = a ? clamp((now - a.t0) / a.dur, 0, 1) : 0, live = a && now - a.t0 < a.dur;
      const vk = l.vk, f = l.flaw;
      const fx = { power: l.powered, spin: 0, phase: st.phase, strobe: 0, pitch: 0.5, needle: !(f === "noPlay" && vk === "turntable"), fake: f === "fake", scuff: l.cosmetic, dusty: f === "scratchy", jam: f === "noPlay" && vk === "cdj", wob: 0, jitter: 0, sigL: 0, sigR: 0, sig: [0, 0, 0, 0], lcd: f === "noPlay" && vk === "cdj" ? "NO DISC" : "TRACK 01", bpm: "120.0 BPM", loupe: null, blown: f === "blown" ? (l.seed % 2) : undefined, xf: 0.5, fader: 0.7, flex: 0, cable: 0, crack: false, nch: GK ? GK.nch(l.gear) : 2, dead: f === "dead" };
      if (f === "wobble" && vk === "turntable") fx.wob = 1;     // sits a hair off-center
      const run = live && (k === "power" || k === "listen" || k === "ctl");
      const wobAmp = [6.5, 5.5, 4.5, 3.6, 3];
      const wob = f === "wobble" ? wobAmp[diff - 1] * Math.sin(now * 2 * Math.PI * (0.85 + (l.seed % 5) * 0.08)) : 0;
      const dead = f === "dead";
      if (run && !dead) {
        fx.power = true; fx.spin = (vk === "turntable" || vk === "cdj") && !(f === "noPlay" && vk === "cdj" && k === "listen") ? 1 : 0;
        if (k === "power" || k === "listen") { fx.strobe = wob + (f === "fake" ? Math.sin(now * 40) * 1.2 : 0); fx.wob = f === "wobble" && vk === "turntable" ? Math.round(wob * 0.2) : (f === "wobble" && vk === "cdj" ? Math.round(wob * 0.5) : 0); }
        if (k === "ctl") {
          const x = u < 0.3 ? 0.5 - u / 0.3 * 0.42 : u < 0.7 ? 0.08 + (u - 0.3) / 0.4 * 0.84 : 0.92 - (u - 0.7) / 0.3 * 0.42;
          fx.pitch = x; st.drift += (x - 0.5) * 70 * 0.016; fx.strobe = st.drift + wob; fx.jitter = f === "scratchy" ? 3 : 0; fx.xf = x; fx.fader = 0.4 + x * 0.5;
          if (tone) { const bend = (x - 0.5) * 270; tone.bend(f === "scratchy" && Math.random() < 0.3 ? bend + (Math.random() - 0.5) * 200 : bend); }
        }
        const beat = 0.5 + 0.5 * Math.sin(now * 14);
        if (k === "listen" || k === "power" || k === "ctl") {
          const base = k === "power" && vk !== "mixer" && vk !== "monitor" ? 0.0 : 0.35 + 0.5 * beat;
          fx.sigL = base; fx.sigR = base; fx.sig = [base, base * 0.8, base * 0.6, base * 0.7];
          if (f === "deadCh") { if (vk === "mixer") fx.sig[1] = 0; else if (l.seed % 2) fx.sigL = 0; else fx.sigR = 0; }
          if (f === "noPlay") { fx.sigL = fx.sigR = 0; fx.sig = [0, 0, 0, 0]; }
          if (f === "hum") fx.sig = fx.sig.map(v => Math.max(v * (k === "listen" ? 1 : 0), 0.25 + Math.random() * 0.15));
          if (k === "power" && vk === "mixer") fx.sig = [0.5 * beat + 0.2, f === "deadCh" ? 0 : 0.4 * beat + 0.2, 0.3, 0.3];
          if (k === "power" && vk === "monitor") { fx.sigL = 0.4 * beat; fx.sigR = f === "deadCh" && !(l.seed % 2) ? 0 : 0.4 * beat; if (f === "deadCh" && l.seed % 2) fx.sigL = 0; }
          if (k === "power" && vk === "headphones") fx.sigL = fx.sigR = 0;
        }
        if (k === "power" && vk === "headphones") fx.flex = Math.sin(u * Math.PI);
        if (k === "ctl" && vk === "headphones") { fx.cable = 1; if (f === "scratchy") fx.sigL = fx.sigR = Math.random() < 0.6 ? 0.7 : 0; }
        if (k === "power" && f === "fake" && vk === "cdj") fx.lcd = "TRACK 0I";
      }
      if (live && k === "power" && dead) { fx.power = false; fx.spin = 0; }
      if (live && k === "look" && st.loupe) {
        const e = u < 0.4 ? u / 0.4 : 1, ease = e * e * (3 - 2 * e), lp = st.loupe;
        fx.loupe = { x: lp.from[0] + (lp.fx - lp.from[0]) * ease, y: lp.from[1] + (lp.fy - lp.from[1]) * ease, r: 34 };
      }
      if (vk === "turntable" || vk === "cdj") fx.phase = st.phase;
      if (vk === "monitor" && f === "blown") fx.blown = l.seed % 2;
      return fx;
    }
    function drawScene(now) {
      if (!GK) return;
      sctx.clearRect(0, 0, 320, 140);
      sctx.drawImage(boutique ? GK.boutiqueBG() : GK.vanBG(), 0, 0);
      const n = L.length, zone = [14, 246];
      L.forEach((l, i) => {
        const x = boutique ? 150 + (i - (n - 1) / 2) * 60 : (n === 1 ? 130 : Math.round(zone[0] + (zone[1] - zone[0]) / n * (i + 0.5)));
        const yb = boutique ? 106 : 118;
        const sel = i === st.sel;
        if (l.status === "busted") { // removed from the blanket: a dent and a note
          RP.u.txtC(sctx, "JUNK", x, yb - 14, "#ff5a5a", 1); GK.tag(sctx, x, yb + 4, "JUNK", { sold: true }); l.box = [x - 20, yb - 20, 40, 30]; return;
        }
        const g = l.gear;
        const o = { accent: GK.accent(g), tier: g.tier, nch: GK.nch(g), rotary: g.kind === "rotary", noNeedle: l.flaw === "noPlay" && l.vk === "turntable", blown: l.flaw === "blown", cover: !l.cosmetic, seed: l.seed, on: l.powered || l.flaw !== "dead" };
        const bb = GK.item(sctx, boutique && l.vk === "mixer" ? "hero" : l.vk, x, yb, o);
        l.box = bb;
        if (l.status === "gone") { RP.u.R(sctx, x - 14, yb - 22, 28, 9, "#c0302c"); RP.u.txtC(sctx, "SOLD", x, yb - 20, "#ffffff", 1); }
        if (!boutique) GK.tag(sctx, x, yb + 4, l.status === "gone" ? "SOLD" : money(priceOf(l)), { sel, sold: l.status === "gone" });
        if (sel && l.status !== "gone") {
          const bob = reduced ? 0 : Math.round(Math.sin(now * 5) * 1.5);
          GK.arrow(sctx, x, (boutique ? 50 : bb[1] - 11) + bob, "#ffd23f");
        }
      });
      if (boutique) GK.boutiqueFG(sctx, now, { reduced }); else GK.vanFG(sctx, now, { reduced });
      const talking = st.mouth > 0;
      try { RP.chars.draw(sctx, { id: sellerChar, x: boutique ? 272 : 282, y: 136, face: "left", act: "stand", expr: st.expr, mouth: talking && Math.floor(now * 9) % 2 === 0 }, { lx: -0.6 }); } catch (e) { /* ignore */ }
    }
    function drawClose(now) {
      if (!GK) return;
      const l = cur();
      if (st.view === "paper" && now < st.viewT) {
        const g = l.gear, f = l.flaw;
        const o = { seed: l.seed, plate1: g.model.toUpperCase(), plate2: "SN " + String(10000 + (l.seed * 37) % 89999), lines: ["BOUGHT NEW", "SERIAL MATCHES", "PAID: " + money(g.price)], stamp: "PAID", stain: l.seed % 3 === 0 };
        if (boutique) {
          o.plate1 = g.brand.toUpperCase().slice(0, 24); o.plate2 = g.model.toUpperCase().slice(0, 14);
          o.lines = l.id === "can_electric_taula_4_mr" ? ["HANDWIRED IN BARCELONA", "4 CH 100% ANALOGUE", "ROTARY MIXER", "PRICE: " + money(l.ask)] : [g.brand.toUpperCase().slice(0, 26), g.model.toUpperCase(), g.year ? "LISTED: " + g.year : "NEW IN BOX", "PRICE: " + money(l.ask)];
          o.stamp = "FINAL"; o.stampBg = "#2a6a46";
        }
        else if (f === "fake") { o.sanded = true; o.napkin = true; o.lines = ["TRUST ME", "PAID: $0?", "DEFINITELY LEGIT"]; o.stamp = null; }
        else if (f === "dead") { o.lines = ["TESTED OK", "DATE: ??/??/??", "SOLD AS IS", "NO REFUNDS"]; o.stamp = "OK?"; o.stampBg = "#c08a20"; o.stain = true; }
        else if (l.cosmetic) { o.lines = ["BOUGHT NEW", "SERIAL MATCHES", "LOVED A LOT"]; }
        GK.paper(cctx, o);
        return;
      }
      if (st.view === "paper" && now >= st.viewT) st.view = "item";
      const fx = fxFor(l, now);
      GK.closeup(cctx, l.vk === "box" ? "mixer" : l.vk, { gear: l.gear, nch: fx.nch }, fx, now);
    }
    let last = null;
    host.raf(tm => {
      if (st.done) return false;
      const now = tm / 1000; let dt = last == null ? 0 : clamp(now - last, 0, 0.1); last = now; st.t = now;
      if (st.mouth > 0) st.mouth -= dt; if (st.exprT > 0) { st.exprT -= dt; if (st.exprT <= 0) st.expr = "neutral"; }
      const l = cur(), a = st.anim && st.anim.l === l ? st.anim : null, live = a && now - a.t0 < a.dur;
      const spinning = live && (a.k === "power" || a.k === "listen" || a.k === "ctl") && l.flaw !== "dead";
      if (spinning && (l.vk === "turntable" || l.vk === "cdj")) st.phase += dt * (reduced ? 1.3 : 3.5);
      if (st.anim && now - st.anim.t0 >= st.anim.dur + 0.1) { if (st.anim.k !== "look") { /* keep */ } stopTone(); st.anim = st.anim; }
      if (a && !live) { st.anim = null; stopTone(); st.drift *= 0.0; }
      drawScene(now); drawClose(now);
    });

    /* ---------- keys ---------- */
    host.onKey(e => {
      if (st.done) return;
      const tg = e.target && e.target.tagName;
      if (tg === "INPUT" && e.target.type === "range" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); select((st.sel + L.length - 1) % L.length); }
      else if (e.key === "ArrowRight") { e.preventDefault(); select((st.sel + 1) % L.length); }
      else if (/^[1-5]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) { probe(+e.key - 1); }
    });

    /* ---------- go ---------- */
    leave.addEventListener("click", () => { if (st.done) return; st.done = true; stopTone(); if (resolveFn) { const f = resolveFn; resolveFn = null; f({ ok: false, score: 0, bought: null, paid: 0 }); } });
    select(0, true);
    if (boutique) speak("Welcome. The " + L[0].gear.model + " is on the stand. " + pickR(BOUTIQUE_INTRO), "neutral");
    else speak("Welcome to the van! " + (L.length > 1 ? "Take a look. Take your time. Don't take anything." : "One beauty. Touch it. Test it.") + (sc.pair ? " Tags are for the pair, before we haggle." : ""), "happy");
    return new Promise(resolve => { resolveFn = resolve; host.cleanup(() => { if (resolveFn) { const f = resolveFn; resolveFn = null; f({ ok: false, score: 0, bought: null, paid: 0 }); } }); });
  }
});
})();
