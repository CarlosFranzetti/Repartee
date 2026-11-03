/* Act 4 — headless walkthrough: the whole level from the start of act 4 to RP.completeAct.
   run: node tests/run.mjs walk act4 --act 4 --page <build>.html
   Also: RP.walkthroughs.act4fail drives the "unhappy" branches (mini-games failing, wrong answers, wrong ticket, taxi). */
(function () {
"use strict";
const RP = window.RP;
const A4 = RP.a4;

const jfk = [
  ["expect", "S.room === 'a4_jfk'", "at JFK"],
  ["look", "hot:a4_board"], ["look", "hot:a4_cart"], ["use", "hot:a4_vend"], ["look", "hot:a4_pax2"], ["look", "inv:a4_rider"], ["run", async (S, RP) => { RP.test.m0 = S.money; }], ["expect", "S.money <= 220", "a tight start: $150 less the cab to JFK, never more than $220"],                          // (empty answer queue: picks the last option = Never mind)
  ["pickup", "hot:a4_forms"], ["expect", "!RP.has('a4_form')", "no form before the airline tells me I'm in trouble"],
  ["use", "hot:a4_door_bag"], ["expect", "S.room === 'a4_jfk'", "Baggage Services is closed to me before check-in"],
  ["give", "hot:a4_dolores", "a4_bag"], ["expect", "!S.f.a4_bagChecked", "passport first"],
  ["give", "hot:a4_dolores", "a4_passport"], ["expect", "RP.has('a4_boarding')", "boarding pass"],
  ["give", "hot:a4_dolores", "a4_bag"],
  ["expect", "S.f.a4_bagChecked && RP.has('a4_claim') && S.f.a4_msgBag && !RP.has('a4_bag') && S.f.noTravel", "bag checked, claim tag, message, travel blocked"],
  ["expect", "S.money === RP.test.m0 - 95", "the walk-up bag fee cost $95"],
  ["pickup", "hot:a4_forms"], ["expect", "RP.has('a4_form')", "Form 7B"],
  ["answers", [1]], ["use", "hot:a4_vend"], ["expect", "RP.has('a4_jerky')", "jerky"],
  ["answers", [2]], ["use", "hot:a4_vend"], ["expect", "RP.has('a4_water')", "rider item 1: water ($3)"],
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
  ["talk", "hot:a4_marguerite"], ["look", "hot:a4_cart"],
  ["answers", [0]], ["use", "hot:a4_cart"], ["answers", [1]], ["use", "hot:a4_cart"], ["expect", "RP.has('a4_towel') && RP.has('a4_veg') && S.f.a4_vegKind === 'celery'", "rider items 2 and 3 from the cart: hot towel, celery from the tomato juice"],
  ["talk", "hot:a4_kosmo"], ["expect", "!S.f.a4_kosmoLoan", "Kosmo lends nothing to a man with $40 or more"],
  ["give", "hot:a4_kosmo", "a4_bag"], ["expect", "S.f.a4_kosmoBag && !RP.has('a4_bag')", "bag on Kosmo's spare seat"],
  ["use", "hot:a4_myseat"], ["expect", "S.room === 'a4_ber_platform' && RP.has('a4_bag') && S.f.a4_landed", "landed in Berlin with the bag"]
];
const platform = [
  ["use", "hot:a4_train"], ["expect", "!S.f.a4_trainDone", "no ticket, no train"],
  ["look", "hot:a4_map"], ["pickup", "hot:a4_bin"], ["expect", "RP.has('a4_bottles') && S.f.a4_nPlastic === 8", "eight one-way bottles from the platform bin"],
  ["answers", [0]], ["use", "hot:a4_tmachine"], ["expect", "RP.has('a4_ticket') && S.f.a4_wrongZone", "zones AB: a ticket, but the wrong one"],
  ["answers", [0]], ["use", "hot:a4_tmachine"], ["expect", "RP.has('a4_ticket') && !S.f.a4_wrongZone", "upgraded to ABC at the machine ($2)"],
  ["use", "hot:a4_train"], ["expect", "!S.f.a4_trainDone", "not validated"],
  ["use", "hot:a4_validator"], ["expect", "S.f.a4_validated", "validated"],
  ["answers", [0]], ["use", "hot:a4_train"],
  ["expect", "S.room === 'a4_berlin_street' && S.f.a4_trainDone && !S.f.a4_trainFailed && !S.f.a4_fined", "made the last train, no fine"]
];
const street = [
  ["use", "hot:a4_hotel"], ["expect", "S.room === 'a4_berlin_street'", "hotel is for after the set"],
  ["pickup", "hot:a4_bottles"], ["look", "inv:a4_bottles"],
  ["answers", [0, 0, 0, 3, 3]], ["talk", "hot:a4_kemal"],
  ["expect", "S.f.a4_doorHint && S.f.a4_pfand && RP.has('a4_mate')", "Kemal: Sven hint, Pfand paid, a Club-Mate for the door"],
  ["use", "hot:a4_to_halle"], ["expect", "S.room === 'a4_halle_door'", "at the door"]
];
const door = [
  ["use", "hot:a4_door"], ["expect", "S.room === 'a4_halle_door'", "locked until Sven agrees"],
  ["give", "hot:a4_sven", "a4_mate"], ["expect", "S.f.a4_q1 && !RP.has('a4_mate')", "the Club-Mate bought question one"],
  ["answers", ["Tresor", "Axis", "Ostgut"]], ["talk", "hot:a4_sven"],
  ["expect", "S.f.a4_quizDone && RP.has('a4_band')", "passed Sven's quiz (one wrong answer on the way)"],
  ["use", "hot:a4_door"], ["expect", "S.room === 'a4_halle'", "inside Halle Neun"]
];
const halle = [
  ["use", "hot:a4_exit"], ["expect", "S.room === 'a4_halle'", "can't leave before the set"],
  ["talk", "hot:a4_jeff"], ["look", "inv:a4_rider"],
  ["give", "hot:a4_katja", "a4_water"], ["give", "hot:a4_katja", "a4_towel"], ["expect", "S.f.a4_rWater && S.f.a4_rTowel && !S.f.a4_rVeg", "two of three handed over"],
  ["mg", { ok: true, score: 78, time: 41 }], ["mg", { ok: true, score: 84, played: ["basic_channel_phylyps_trak", "jeff_mills_kat_moda_ep", "ben_klock_one", "robert_hood_minimal_nation", "marcel_dettmann_dettmann"], peak: 5, final: 4.6 }],
  ["use", "hot:a4_booth"], ["expect", "S.f.a4_handover && S.f.a4_setDone && S.f.a4_paid && S.f.a4_rVeg", "played the set and got paid (the last rider item went over at the till)"],
  ["expect", "S.money > 1800", "fee plus the complete-rider bonus"],
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

/* unhappy paths: failing mini-games never dead-end, the bad train choice ends in the taxi; the taxi is the fallback; wrong answers just repeat */
RP.walkthroughs.act4fail = [
  ["use", "hot:a4_laptop"],
  ["pickup", "hot:a4_plant"], ["pickup", "hot:a4_rbox"],
  ["talk", "hot:a4_hole"],
  ["answers", [0, 0, 1]], ["talk", "hot:a4_lou"],
  ["use", "hot:a4_decks", "a4_white"],
  ["mg", { ok: false, score: 10 }], ["mg", { ok: false, score: 12 }], ["mg", { ok: false, score: 20 }],     // three failures: forced through, never stuck
  ["use", "hot:a4_sampler"], ["expect", "S.f.a4_track", "forced through after three failed tries"],
  ["answers", [0]], ["use", "hot:a4_hole", "phone"], ["run", async (S, RP) => { RP.test.answers.length = 0; }],
  ["answers", [1, 0]],                                                                                          // title, then the dullest release week
  ["mg", { ok: false, score: 20 }], ["mg", { ok: false, score: 20 }], ["mg", { ok: false, score: 20 }],
  ["use", "hot:a4_laptop"], ["expect", "S.f.a4_deal && S.f.a4_fee >= 350", "weak deal, but a deal"],
  ["pickup", "hot:a4_bag"],
  ["run", async (S, RP) => { RP.test.travelQ.push("a4_loc_jfk"); }], ["use", "hot:a4_door"], ["expect", "S.room === 'a4_jfk'", "at JFK"],
  // JFK: the pickle trap, then a bag fee I cannot pay, then two records to the man in the Hawaiian shirt
  ["run", async (S, RP) => { RP.test.m0 = S.money; }],
  ["answers", [3]], ["use", "hot:a4_vend"], ["expect", "RP.has('a4_pickle') && S.money === RP.test.m0 - 3", "a pickle: $3 for the wrong vegetable"],
  ["give", "hot:a4_dolores", "a4_passport"],
  ["run", async (S, RP) => { S.money = 20; }],
  ["give", "hot:a4_dolores", "a4_bag"], ["expect", "!S.f.a4_bagChecked && RP.has('a4_bag')", "$20 will not cover the bag fee"],
  ["answers", [0, 0]], ["talk", "hot:a4_pax2"], ["answers", [0, 0]], ["talk", "hot:a4_pax2"], ["expect", "S.money === 100 && S.f.a4_sold === 2", "two crate records sold at $40"],
  ["give", "hot:a4_dolores", "a4_bag"], ["expect", "S.f.a4_bagChecked && S.money === 5", "bag fee paid; $5 left"],
  // the plane: broke, so Kosmo gets a joke (two bad ones first)
  ["goto", "a4_plane", 330, 230],
  ["answers", [1, 1, 2, 0]], ["talk", "hot:a4_kosmo"], ["expect", "S.f.a4_kosmoLoan && S.money === 65", "Kosmo laughed and paid $60"],
  ["goto", "a4_ber_platform", 52, 232],
  ["run", async (S, RP) => { S.money = 2; }],
  ["answers", [2, 0]], ["use", "hot:a4_tmachine"], ["expect", "!RP.has('a4_ticket') && S.money === 22 && S.f.a4_sold === 3", "no money for the ticket: the stag party buys a record ($20)"],
  ["answers", [0]], ["use", "hot:a4_tmachine"], ["expect", "S.f.a4_wrongZone && RP.has('a4_ticket')", "the wrong ticket (zones AB)"],
  ["use", "hot:a4_validator"], ["pickup", "hot:a4_bin"],
  ["run", async (S, RP) => { S.f.a4_trainDone = false; }],
  ["answers", [1]], ["use", "hot:a4_train"],
  ["expect", "S.room === 'a4_berlin_street' && S.f.a4_trainFailed && S.f.a4_late > 0 && S.f.a4_fined && S.money === 0", "fined for the wrong ticket, then the taxi: skint, late, still in Berlin"],
  ["pickup", "hot:a4_bottles"],
  ["run", async (S, RP) => { S.f.a4_bagBack = true; RP.give("a4_bag"); }],   // (the bag's trip through baggage and security is covered by the main walkthrough)
  // the Spaeti is the recovery: Pfand, two busked records, one sold, then water, carrot and a dish towel for the rider (the towel was skipped on the plane)
  ["answers", [0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 2]], ["talk", "hot:a4_kemal"],
  ["expect", "S.f.a4_pfand && S.f.a4_busks === 2 && RP.has('a4_water') && RP.has('a4_veg') && RP.has('a4_towel') && S.f.a4_towelKind === 'dish' && S.money > 45", "skint no more: bottles, busking and a record paid for the rider"],
  ["use", "hot:a4_to_halle"],
  ["answers", [0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 1, 2, 2]], ["talk", "hot:a4_sven"], ["expect", "S.f.a4_quizDone", "Sven let me in after wrong answers"],
  ["use", "hot:a4_door"],
  ["mg", { ok: false, score: 5 }], ["mg", { ok: false, score: 5 }], ["mg", { ok: false, score: 5 }],
  ["mg", { ok: false, score: 5 }], ["mg", { ok: false, score: 5 }], ["mg", { ok: false, score: 5 }],
  ["use", "hot:a4_booth"], ["expect", "S.f.a4_setDone", "set played even after failing"],
  ["expect", "S.money > 0", "paid"]
];
})();
