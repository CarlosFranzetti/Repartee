/* Act 5 — headless walkthrough: the whole level, from the studio on Thursday to RP.completeAct at sunrise.
   run: node tests/run.mjs walk act5 --act 5 --page <build>.html
   Mini-game results are queued only for games that are registered (the queue is consumed in play order). */
(function () {
"use strict";
const RP = window.RP;
const TAULA = "can_electric_taula_4_mr";
const q = (id, res) => ["run", (S, R) => { if (R.mg.reg[id]) R.test.mgQ.push(res); }];

const thursday = [
  ["expect", "S.act === 5 && S.room === 'a5_studio' && S.f.a5_calledMargo", "act 5 starts in the studio; Margo called"],
  ["expect", "S.money >= 10000", "advance landed"],
  ["look", "hot:a5_poster"], ["look", "hot:a5_neon"], ["look", "hot:a5_gerald"], ["look", "hot:a5_mixer"],
  ["use", "hot:a5_bed"], ["expect", "S.f.a5_day === 1", "can't sleep before the rig is bought"],
  ["answers", [0]], ["use", "hot:a5_rail"], ["expect", "S.f.a5_outfit === 'coat'", "pink-lined coat on"],
  ["travel", "a5_loc_boutique"], ["expect", "S.room === 'a5_boutique' && S.f.a5_boutiqueMet", "Lacquer & Wire"],
  ["look", "hot:a5_taula"], ["pickup", "hot:a5_taula"],
  ["answers", ["Tell me about", "Why is Eddie", "I want the Taula", "What about decks", "Take the whole", "Thanks"]],
  q("buyGear", { ok: true, score: 90, bought: TAULA, paid: 1650, place: 1 }),
  ["talk", "hot:a5_merce"],
  ["expect", "S.gear.mixer === 'can_electric_taula_4_mr' && S.f.a5_gearDecks && S.gear.decks === 'pioneer_cdj_3000'", "Taula + CDJ-3000s + MK7s"],
  ["answers", ["Core 47", "Later"]],
  q("buyGear", { ok: true, score: 85, bought: "dynaudio_core_47", paid: 3200 }),
  ["talk", "hot:eddie"],
  ["expect", "S.gear.monitors === 'dynaudio_core_47' && S.f.a5_gearDone", "the whole rig"],
  ["travel", "a5_loc_studio"], ["expect", "S.room === 'a5_studio'", "home"],
  ["look", "hot:a5_boxes"], ["use", "hot:a5_crate"],
  ["use", "hot:a5_bed"], ["expect", "S.f.a5_day === 2", "Friday"]
];

const friday = [
  ["expect", "S.f.a5_tod === 'day'", "Friday morning"],
  ["travel", "a5_loc_radio"], ["expect", "S.room === 'a5_radio'", "Radio Harbor"],
  ["look", "hot:a5_rwin"], ["look", "hot:a5_rair"],
  ["answers", [0, 0, 0, 0, 2]], ["talk", "hot:a5_dana"],
  ["expect", "S.f.a5_interviewDone && S.f.a5_danteOnAir && S.f.a5_interviewScore >= 6", "interview nailed; Dante on the record"],
  ["travel", "a5_loc_gate"], ["expect", "S.room === 'a5_gate'", "the gate"],
  ["talk", "hot:marcus"], ["expect", "!S.f.a5_guestDone", "Whit's list first"],
  ["talk", "hot:a5_whit"], ["expect", "RP.has('a5_pass') && S.f.a5_gateMet", "typo'd artist pass"],
  ["answers", [2]], ["talk", "hot:a5_whit"],
  ["answers", [1]], ["talk", "hot:marcus"], ["expect", "S.f.a5_guestDone && S.f.a5_guestIn === 9 && RP.has('a5_loupass')", "guest list done (nine in); Lou's envelope"],
  ["travel", "a5_loc_studio"], ["expect", "S.f.a5_tod === 'night'", "Friday night at home"],
  ["use", "hot:a5_bed"], ["expect", "S.f.a5_day === 2", "can't sleep: Lou's pass first"],
  ["answers", ["I want you to come", "Never mind"]], ["talk", "hot:a5_hole"],
  ["give", "hot:a5_hole", "a5_loupass"], ["expect", "S.f.a5_louComing && !RP.has('a5_loupass')", "Lou is coming"],
  ["use", "hot:a5_bed"], ["expect", "S.f.a5_day === 3", "Saturday"]
];

const saturday = [
  ["walk", "hot:a5_door"], ["expect", "S.room === 'a5_gate' && S.f.a5_metMargo && S.f.noTravel", "Saturday at the gate; Margo; no travel"],
  ["talk", "hot:a5_margo"], ["talk", "hot:a5_whit"],
  ["walk", "hot:a5_gexit"], ["expect", "S.room === 'a5_grounds'", "the grounds"],
  ["answers", ["Sharpie", "advice", "crate", "See you"]], ["talk", "hot:ray"], ["expect", "RP.has('a5_marker')", "Ray's Sharpie"],
  ["answers", ["Axl Vanta", "after-party", "Any news", "Later"]], ["talk", "hot:twinkie"], ["expect", "S.f.a5_axlIntel", "Twinkie's Axl intel"],
  ["answers", ["Whiskers", "bring him", "shout-out", "See you"]], ["talk", "hot:jess"], ["expect", "S.f.a5_whiskersShout", "Mr. Whiskers news"],
  ["answers", [1]], ["talk", "hot:eddie"],
  ["look", "hot:a5_wferris"], ["look", "hot:a5_wstage"], ["look", "hot:a5_wcat"],
  ["talk", "hot:a5_gloria"], ["expect", "!S.f.a5_gloriaOK", "the typo'd pass doesn't work on Gloria"],
  ["give", "hot:a5_gloria", "a5_pass"], ["expect", "!S.f.a5_gloriaOK", "still no"],
  ["use", "inv:a5_marker", "a5_pass"], ["expect", "S.f.a5_passFixed", "fixed the pass with the Sharpie"],
  ["give", "hot:a5_gloria", "a5_pass"], ["expect", "S.f.a5_gloriaOK", "Gloria lets me through"],
  ["walk", "hot:a5_wgate"], ["expect", "S.room === 'a5_backstage'", "backstage"],
  ["look", "hot:a5_baxl"], ["look", "hot:a5_btrailer"], ["look", "hot:a5_bboard"], ["look", "hot:a5_dj_louie_vega"],
  ["talk", "hot:a5_dj_louie_vega"], ["talk", "hot:a5_dj_spinna"], ["talk", "hot:a5_dj_francois_k"],
  ["use", "hot:a5_baxl"], ["expect", "S.room === 'a5_backstage' && !S.f.a5_axlDone", "no door without Roz's tip and a smoothie"],
  ["talk", "hot:a5_roz"], ["expect", "S.f.a5_rozMet", "Roz"],
  ["walk", "hot:a5_bwings"], ["expect", "S.room === 'a5_wings'", "the wings"],
  ["walk", "hot:a5_wexit"], ["expect", "S.room === 'a5_mainstage' && S.f.a5_phase === 0", "the main stage, afternoon"],
  ["look", "hot:a5_mled"], ["look", "hot:a5_mstacks"],
  q("soundCheck", { ok: true, score: 88, fixed: 4 }),
  ["use", "hot:a5_mbooth"], ["expect", "S.f.a5_soundDone && S.f.a5_phase === 1", "soundcheck done"],
  ["walk", "hot:a5_mwings"], ["expect", "S.room === 'a5_wings'", "back in the wings"],
  ["walk", "hot:a5_wback"], ["expect", "S.room === 'a5_backstage'", "backstage again"],
  ["talk", "hot:a5_roz"], ["expect", "S.f.a5_axlAsked", "Roz: Axl wants the slot; bring a smoothie"],
  ["pickup", "hot:a5_bsmoothie"], ["expect", "RP.has('a5_smoothie')", "Axl's smoothie"],
  ["answers", ["Alex"]],
  ["use", "hot:a5_baxl"],
  ["expect", "S.f.a5_axlWon && S.f.a5_axlLeverage", "Twinkie's intel won the slot"],
  ["expect", "S.f.a5_axlDone && S.f.a5_phase === 2 && S.room === 'a5_backstage' && S.f.a5_louArrived", "Axl handled; Lou and Marcus arrive"],
  ["talk", "hot:lou"], ["talk", "hot:marcus"],
  ["answers", [0]],
  ["walk", "hot:a5_bwings"], ["expect", "S.room === 'a5_wings' && S.f.a5_overrunDone && S.f.a5_phase === 3 && S.f.a5_overrunHow === 0", "the wings: Axl overran, Roz's call, Axl is off the stage"],
  ["talk", "hot:a5_roz"],
  ["talk", "hot:lou"],
  ["walk", "hot:a5_wexit"], ["expect", "S.room === 'a5_mainstage' && S.f.a5_phase === 3", "the main stage at night"],
  ["look", "hot:a5_mcrowd"], ["look", "hot:a5_mimag"], ["look", "hot:a5_mbooth"]
];

const set = [
  ["answers", [0, 0]],
  q("crowdRead", { ok: true, score: 90, peak: 5, final: 4.5, played: [] }),
  q("beatMatch", { ok: true, score: 92 }),
  ["use", "hot:a5_mbooth"],
  ["expect", "S.f.a5_setOpener && S.f.a5_setCloser === 'mood_ii_swing_closer'", "opener and closer picked"],
  ["expect", "S.f.a5_setDone && S.f.a5_kosmoName && S.room === 'a5_pier'", "headline set done; Kosmo said the name; sunrise on the pier"]
];

const pier = [
  ["look", "hot:a5_psun"], ["look", "hot:a5_pring"], ["look", "hot:a5_psign"],
  ["use", "hot:a5_psun"], ["expect", "!S.done.includes(5)", "not yet: talk to Lou and Dante first"],
  ["talk", "hot:lou"], ["talk", "hot:dante"], ["expect", "RP.has('a5_tickets')", "Dante paid in drink tickets"],
  ["talk", "hot:marcus"], ["talk", "hot:ray"], ["talk", "hot:twinkie"], ["talk", "hot:eddie"], ["talk", "hot:jess"], ["talk", "hot:a5_margo"], ["talk", "hot:kosmo"],
  ["use", "hot:a5_psun"],
  ["expect", "S.done.includes(5)", "act 5 complete"]
];

RP.walkthroughs.act5 = [].concat(thursday, friday, saturday, set, pier);
})();
