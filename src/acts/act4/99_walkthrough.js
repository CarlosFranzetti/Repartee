/* Act 4 — headless walkthrough: the whole level from the start of act 4 to RP.completeAct.
   run: node tests/run.mjs walk act4 --act 4 --page <build>.html
   Also: RP.walkthroughs.act4fail drives the "unhappy" branches (mini-games failing, wrong answers, wrong ticket, taxi). */
(function () {
"use strict";
const RP = window.RP;
const A4 = RP.a4;

const jfk = [
  ["expect", "S.room === 'a4_jfk'", "at JFK"],
  ["look", "hot:a4_board"], ["look", "hot:a4_cart"], ["use", "hot:a4_vend"],                          // (empty answer queue: picks the last option = Never mind)
  ["pickup", "hot:a4_forms"], ["expect", "!RP.has('a4_form')", "no form before the airline tells me I'm in trouble"],
  ["use", "hot:a4_door_bag"], ["expect", "S.room === 'a4_jfk'", "Baggage Services is closed to me before check-in"],
  ["give", "hot:a4_dolores", "a4_bag"], ["expect", "!S.f.a4_bagChecked", "passport first"],
  ["give", "hot:a4_dolores", "a4_passport"], ["expect", "RP.has('a4_boarding')", "boarding pass"],
  ["give", "hot:a4_dolores", "a4_bag"],
  ["expect", "S.f.a4_bagChecked && RP.has('a4_claim') && S.f.a4_msgBag && !RP.has('a4_bag') && S.f.noTravel", "bag checked, claim tag, message, travel blocked"],
  ["pickup", "hot:a4_forms"], ["expect", "RP.has('a4_form')", "Form 7B"],
  ["answers", [1]], ["use", "hot:a4_vend"], ["expect", "RP.has('a4_jerky')", "jerky"],
  ["use", "hot:a4_door_bag"], ["expect", "S.room === 'a4_baggage'", "Baggage Services"]
];
const baggage = [
  ["look", "hot:a4_screen"], ["look", "hot:a4_carousel"], ["look", "hot:a4_bagpink"],
  ["give", "hot:a4_bernadette", "a4_form"],                                                             // before she knows about the bag
  ["answers", [0, 0, 0, 0]], ["talk", "hot:a4_bernadette"],
  ["expect", "S.f.a4_bernadetteTold && S.f.a4_bernadetteCat && S.f.a4_bernadetteProve && S.f.a4_formStamped", "Bernadette stamped Form 7B (the cat video)"],
  ["use", "hot:a4_door_out"], ["expect", "S.room === 'a4_jfk'", "back in the terminal"],
  ["use", "hot:a4_gates"], ["expect", "S.room === 'a4_security'", "security"]
];
const security = [
  ["look", "hot:a4_nugget"], ["pickup", "hot:a4_inspect"], ["expect", "!RP.has('a4_bag')", "the dog is on my bag"],
  ["give", "hot:a4_nugget", "a4_jerky"], ["expect", "!S.f.a4_dogFed", "form first"],
  ["give", "hot:a4_delgado", "a4_form"], ["expect", "S.f.a4_formSigned", "Delgado signed"],
  ["give", "hot:a4_nugget", "a4_jerky"], ["expect", "S.f.a4_dogFed", "Nugget got the jerky"],
  ["pickup", "hot:a4_inspect"], ["expect", "RP.has('a4_bag') && S.f.a4_bagBack", "bag recovered"],
  ["use", "hot:a4_gates"], ["expect", "S.room === 'a4_plane'", "on the plane"]
];
const plane = [
  ["use", "hot:a4_myseat"], ["expect", "S.room === 'a4_plane' && !S.f.a4_flown", "can't sit with the bag on my lap"],
  ["talk", "hot:a4_marguerite"], ["give", "hot:a4_kosmo", "a4_bag"], ["expect", "S.f.a4_kosmoBag && !RP.has('a4_bag')", "bag on Kosmo's spare seat"],
  ["use", "hot:a4_myseat"], ["expect", "S.room === 'a4_ber_platform' && RP.has('a4_bag') && S.f.a4_landed", "landed in Berlin with the bag"]
];
const platform = [
  ["use", "hot:a4_train"], ["expect", "!S.f.a4_trainDone", "no ticket, no train"],
  ["answers", [0]], ["use", "hot:a4_tmachine"], ["expect", "!RP.has('a4_ticket')", "wrong zones: no ticket"],
  ["answers", [2]], ["use", "hot:a4_tmachine"], ["expect", "RP.has('a4_ticket')", "ticket, zones ABC"],
  ["use", "hot:a4_train"], ["expect", "!S.f.a4_trainDone", "not validated"],
  ["use", "hot:a4_validator"], ["expect", "S.f.a4_validated", "validated"],
  ["mg", { ok: true, score: 82, minutesLate: 0 }], ["use", "hot:a4_train"],
  ["expect", "S.room === 'a4_berlin_street' && S.f.a4_trainDone && !S.f.a4_trainFailed", "made the last train"]
];
const street = [
  ["use", "hot:a4_hotel"], ["expect", "S.room === 'a4_berlin_street'", "hotel is for after the set"],
  ["pickup", "hot:a4_bottles"], ["answers", [0, 0, 1]], ["talk", "hot:a4_kemal"],
  ["expect", "S.f.a4_doorHint && S.f.a4_pfand", "Kemal: Sven hint, Pfand paid"],
  ["use", "hot:a4_to_halle"], ["expect", "S.room === 'a4_halle_door'", "at the door"]
];
const door = [
  ["use", "hot:a4_door"], ["expect", "S.room === 'a4_halle_door'", "locked until Sven agrees"],
  ["answers", ["BC 11", "BC 02", "Axis", "Ostgut"]], ["talk", "hot:a4_sven"],
  ["expect", "S.f.a4_quizDone && RP.has('a4_band')", "passed Sven's quiz (one wrong answer on the way)"],
  ["use", "hot:a4_door"], ["expect", "S.room === 'a4_halle'", "inside Halle Neun"]
];
const halle = [
  ["use", "hot:a4_exit"], ["expect", "S.room === 'a4_halle'", "can't leave before the set"],
  ["talk", "hot:a4_jeff"],
  ["mg", { ok: true, score: 78, time: 41 }], ["mg", { ok: true, score: 84, played: ["basic_channel_phylyps_trak", "jeff_mills_kat_moda_ep", "ben_klock_one", "robert_hood_minimal_nation", "marcel_dettmann_dettmann"], peak: 5, final: 4.6 }],
  ["use", "hot:a4_booth"], ["expect", "S.f.a4_handover && S.f.a4_setDone && S.f.a4_paid", "played the set and got paid"],
  ["use", "hot:a4_exit"], ["expect", "S.room === 'a4_berlin_street'", "back on the street"],
  ["use", "hot:a4_hotel"], ["expect", "S.room === 'a4_hotel'", "hotel"]
];
const hotel = [
  ["use", "hot:a4_elevator"], ["expect", "!S.f.a4_offer", "no key yet"],
  ["answers", [1, 1, 1]], ["talk", "hot:a4_brandt"], ["expect", "S.f.a4_brandtPen", "clerk's hint: Axl can't resist a pen"],
  ["give", "hot:a4_axl", "a4_passport"],
  ["pickup", "hot:a4_postcards"], ["expect", "RP.has('a4_postcard')", "postcard"],
  ["give", "hot:a4_axl", "a4_postcard"], ["expect", "RP.has('a4_postcard') && !S.f.a4_axlGone", "without the clerk on my side Axl keeps the key"],
  ["give", "hot:a4_brandt", "a4_passport"], ["expect", "S.f.a4_clerkOk", "clerk saw the passport"],
  ["give", "hot:a4_axl", "a4_postcard"], ["expect", "S.f.a4_axlGone", "Axl left for the Kaiserin Suite"],
  ["pickup", "hot:a4_keyspot"], ["expect", "RP.has('a4_key')", "room key"],
  ["use", "hot:a4_elevator"],
  ["expect", "S.done.includes(4)", "act 4 complete"]
];

RP.walkthroughs.act4 = [].concat(A4.wtStudio || [], jfk, baggage, security, plane, platform, street, door, halle, hotel);

/* unhappy paths: failing mini-games never dead-end; the taxi is the fallback; wrong answers just repeat */
RP.walkthroughs.act4fail = [
  ["use", "hot:a4_laptop"],
  ["pickup", "hot:a4_plant"], ["pickup", "hot:a4_rbox"],
  ["talk", "hot:a4_hole"],
  ["answers", [0, 0, 1]], ["talk", "hot:a4_lou"],
  ["use", "hot:a4_decks", "a4_white"],
  ["mg", { ok: false, score: 10 }], ["mg", { ok: false, score: 12 }], ["mg", { ok: false, score: 20 }],     // three failures: forced through, never stuck
  ["use", "hot:a4_sampler"], ["expect", "S.f.a4_track", "forced through after three failed tries"],
  ["use", "hot:a4_hole", "phone"],
  ["answers", [1]], ["mg", { ok: false, score: 5 }], ["mg", { ok: false, score: 5 }],                          // followers fails twice -> fallback
  ["mg", { ok: false, score: 20 }], ["mg", { ok: false, score: 20 }], ["mg", { ok: false, score: 20 }],
  ["use", "hot:a4_laptop"], ["expect", "S.f.a4_deal && S.f.a4_fee >= 350", "weak deal, but a deal"],
  ["pickup", "hot:a4_bag"],
  ["run", async (S, RP) => { RP.test.travelQ.push("a4_loc_jfk"); }], ["use", "hot:a4_door"], ["expect", "S.room === 'a4_jfk'", "at JFK"],
  ["goto", "a4_berlin_street", 40, 236],
  ["run", async (S, RP) => { S.f.a4_bagBack = true; S.f.a4_trainDone = false; }],
  ["goto", "a4_ber_platform", 52, 232],
  ["answers", [2]], ["use", "hot:a4_tmachine"], ["use", "hot:a4_validator"],
  ["mg", { ok: false, score: 10, minutesLate: 60 }], ["use", "hot:a4_train"],
  ["expect", "S.room === 'a4_berlin_street' && S.f.a4_trainFailed && S.f.a4_late > 0", "missed the train: taxi, late, still in Berlin"],
  ["use", "hot:a4_to_halle"],
  ["answers", [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 1, 2, 2]], ["talk", "hot:a4_sven"], ["expect", "S.f.a4_quizDone", "Sven let me in after wrong answers"],
  ["use", "hot:a4_door"],
  ["mg", { ok: false, score: 5 }], ["mg", { ok: false, score: 5 }], ["mg", { ok: false, score: 5 }],
  ["mg", { ok: false, score: 5 }], ["mg", { ok: false, score: 5 }], ["mg", { ok: false, score: 5 }],
  ["use", "hot:a4_booth"], ["expect", "S.f.a4_setDone", "set played even after failing"],
  ["expect", "S.money > 0", "paid"]
];
})();
