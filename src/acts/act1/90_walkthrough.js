/* Act 1 — full headless walkthrough: Tuesday night in 4C -> Wednesday (stoop, bodega, Sal's, Synergex, Deep Cuts)
   -> home, USB, sleep until Saturday -> Nowhere door (Tank) -> Nowhere (crowd.Read) -> act complete. */
(function () {
"use strict";
const RP = window.RP;
RP.walkthroughs = RP.walkthroughs || {};
const bed = RP.walkthroughs.bedroom || [];
RP.walkthroughs.act1 = [
  ...bed,
  ["expect", "S.f.time === 'morning' && S.f.a1_acidFlat", "Wednesday morning, Acid Tracks flat"],
  /* leave: hall -> stairs -> stoop (Smitty's offer: answers = \"Twenty? I'm in.\", \"Fine. Hand it over.\") */
  ["answers", [2, 0]],
  ["walk", "hot:door"], ["expect", "S.room === 'a1_hall'", "in the hall"],
  ["talk", "hot:door4b"],
  ["walk", "hot:stairs"], ["expect", "S.room === 'a1_stoop' && S.f.a1_package", "Smitty gave me the package"],
  ["use", "inv:a1_package"], ["expect", "S.f.a1_peeked", "peeked: oregano"],
  /* bodega: can machine ($2.40) */
  ["walk", "hot:bodegaDoor"], ["expect", "S.room === 'a1_bodega'", "in the bodega"],
  ["use", "hot:canmachine", "cans"], ["expect", "S.money === 7.4 && S.f.a1_cansDone", "$7.40 after the cans"],
  ["look", "hot:a1_ali"], ["look", "hot:cat"], ["use", "hot:cat"],
  ["walk", "hot:bdDoor"], ["expect", "S.room === 'a1_stoop'", "back on the stoop"],
  /* Sal's: deliver the oregano */
  ["walk", "hot:salsDoor"], ["expect", "S.room === 'a1_sals'", "in Sal's"],
  ["answers", [0]],
  ["give", "hot:a1_sal", "a1_package"], ["expect", "S.f.a1_delivered && S.money === 27.4 && RP.has('a1_slice')", "$20 and a slice"],
  ["walk", "hot:slDoor"],
  /* subway to Midtown */
  ["walk", "hot:subwayStairs"], ["expect", "S.room === 'a1_subway'", "on the platform"],
  ["travel", "a1_loc_synergex"], ["expect", "S.room === 'a1_synergex' && S.money === 24.4", "Synergex, fare paid"],
  ["answers", [1, 3, 99]], ["talk", "hot:a1_brenda"], ["look", "hot:closet"],
  ["talk", "hot:a1_greg"], ["talk", "hot:a1_dev"],
  ["walk", "hot:breakDoor"], ["expect", "S.room === 'a1_breakroom'", "in the break room"],
  ["pickup", "hot:cupboard"], ["expect", "RP.has('a1_popcorn')", "Linda's popcorn"],
  ["answers", [0, 0]], ["use", "hot:microwave"],
  ["expect", "S.f.a1_alarm && S.room === 'a1_synergex' && S.f.a1_brendaGone", "fire alarm, floor evacuated"],
  ["open", "hot:closet"], ["expect", "S.f.a1_gotUSB && RP.has('a1_usb3')", "USB 3-pack"],
  /* Deep Cuts */
  ["travel", "a1_loc_deepcuts"], ["expect", "S.room === 'a1_deepcuts'", "Deep Cuts"],
  ["talk", "hot:ray"],
  ["mg", { ok: true, score: 88, bought: ["cece_peniston_finally"], spent: 2 }],
  ["use", "hot:dollar"], ["expect", "S.f.a1_closer === 'cece_peniston_finally' && RP.has('a1_flyer') && S.f.time === 'evening' && RP.hasRecord('cece_peniston_finally')", "closer + flyer"],
  /* home: load tracks, sleep until Saturday */
  ["travel", "a1_loc_home"], ["expect", "S.room === 'a1_stoop'", "home street"],
  ["walk", "hot:buildingDoor"], ["walk", "hot:door4c"], ["expect", "S.room === 'bedroom'", "home"],
  ["use", "inv:a1_usb3"], ["expect", "RP.has('a1_usb')", "got a USB"],
  ["answers", [2]], ["use", "hot:laptop", "a1_usb"], ["expect", "S.f.a1_usbLoaded", "tracks on the USB"],
  ["use", "hot:bed"], ["expect", "S.f.time === 'sat' && S.f.a1_sat", "Saturday night"],
  /* to Nowhere */
  ["walk", "hot:door"], ["walk", "hot:stairs"], ["walk", "hot:subwayStairs"],
  ["travel", "a1_loc_nowhere"], ["expect", "S.room === 'a1_nowhere_door'", "outside Nowhere"],
  ["talk", "hot:a1_tank"],
  ["give", "hot:a1_tank", "a1_flyer"], ["give", "hot:a1_tank", "a1_slice"],
  ["expect", "S.f.a1_tankIn", "Tank lets me in"],
  ["walk", "hot:ndDoor"], ["expect", "S.room === 'a1_nowhere'", "inside Nowhere"],
  ["talk", "hot:a1_mia"],
  ["mg", { ok: true, score: 90, played: ["everything_but_the_girl_missing", "phuture_acid_tracks", "white_nyc93", "cece_peniston_finally"], peak: 92 }],
  ["use", "hot:booth"],
  ["expect", "S.f.a1_setGood", "the bartenders danced"],
  ["expect", "S.done.includes(1)", "act 1 complete"]
];
})();
