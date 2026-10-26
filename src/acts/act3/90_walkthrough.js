/* Act 3 — headless walkthrough: the whole level from the start of act 3 to RP.completeAct.
   Mini-game results are set right before each call (and the queue cleared first), so the test stays in step even
   when a mini-game module is missing (RP.mg.play then returns { ok: true, missing: true } without consuming the queue). */
(function () {
"use strict";
const RP = window.RP;

const mg = res => ["run", (S, R) => { R.test.mgQ.length = 0; R.test.mgQ.push(res); }];
const ans = list => ["run", (S, R) => { R.test.answers.length = 0; R.test.answers.push(...list); }];
const trav = id => ["run", (S, R) => { R.test.travelQ.length = 0; R.test.travelQ.push(id); }];
const GEMS = ["gwen_guthrie_padlock", "double_exposure_ten_percent", "dinosaur_l_go_bang", "peech_boys_dont_make_me_wait", "taana_gardner_heartbeat", "loleatta_holloway_love_sensation", "class_action_weekend", "strafe_set_it_off"];

RP.walkthroughs.act3 = [
  /* ---------------- Thursday afternoon, 4C ---------------- */
  ["expect", "S.act === 3 && S.room === 'a3_apartment'", "act 3 starts in the apartment"],
  ["expect", "S.gear.decks === 'pioneer_cdj_350' && S.records.length >= 10 && S.followers >= 400", "baseline setup"],
  ["look", "hot:a3_laptop"], ["look", "hot:a3_hole"], ["talk", "hot:a3_hole"], ["look", "hot:a3_tt"], ["look", "hot:a3_mixer"], ["look", "hot:a3_cdjs"], ["look", "hot:a3_monitors"],
  ["use", "hot:a3_bed"],                                           // too early to sleep
  trav("a3_loc_halcyon"), ["use", "hot:a3_door"],                  // no bag, no USB: the door says no
  ["expect", "S.room === 'a3_apartment'", "door refuses without bag"],
  ["pickup", "hot:a3_usb"], ["pickup", "hot:a3_crate"],
  ["expect", "RP.has('a3_bag') && RP.has('a3_usb')", "bag and USB packed"],
  trav("a3_loc_halcyon"), ["use", "hot:a3_door"],
  ["expect", "S.room === 'a3_street'", "arrived on Ludlow Street"],
  /* ---------------- Night 1: the street ---------------- */
  ["look", "hot:a3_club_door"], ["look", "hot:a3_marquee"], ["look", "hot:a3_brandonposter"], ["look", "hot:a3_van"], ["look", "hot:a3_bodega"], ["look", "hot:a3_cat"],
  ["talk", "hot:a3_eddie"],                                        // "come back when you're paid"
  ans([1]), ["use", "hot:a3_bodega"],                              // pork rinds (the wrong snack)
  ans([0]), ["use", "hot:a3_bodega"],                              // salt & vinegar chips
  ["expect", "RP.has('a3_chips') && RP.has('a3_rinds')", "snacks bought"],
  ["use", "hot:a3_club_door"],
  ["expect", "S.room === 'a3_halcyon' && S.f.a3_metOdessa", "inside the Halcyon Room, met Odessa"],
  /* ---------------- Night 1: floor, Gus, booth ---------------- */
  ["look", "hot:a3_h_bar"], ["look", "hot:a3_h_stage"], ["talk", "hot:a3_nico"], ["talk", "hot:a3_bex"], ["look", "hot:a3_h_wc"], ["use", "hot:a3_h_staff"],
  ["use", "hot:a3_h_stage"],                                       // the booth: monitors still asleep
  ["expect", "S.room === 'a3_booth'", "in the booth"],
  ["use", "hot:a3_b_cdjs"],
  ["expect", "!S.f.a3_opener", "no set before the soundcheck"],
  ["use", "hot:a3_b_steps"],
  ["expect", "S.room === 'a3_halcyon'", "back on the floor"],
  ans(["Never mind"]), ["talk", "hot:a3_gus"],
  ["give", "hot:a3_gus", "a3_rinds"],                              // "No."
  ["look", "hot:a3_gus"],
  ans(["What kind of snack", "Never mind"]), ["talk", "hot:a3_gus"],
  ["give", "hot:a3_gus", "a3_chips"],
  ["expect", "S.f.a3_soundcheck", "Gus woke the monitors"],
  ["use", "hot:a3_h_stage"],
  mg({ ok: true, score: 80, played: [] }), ["use", "hot:a3_b_cdjs"],       // crowd.Read: the empty bar
  ["expect", "S.f.a3_opener && S.f.a3_week && RP.has('a3_list') && S.money >= 300", "night 1 done: paid, napkin, week begins"],
  ["expect", "S.room === 'a3_apartment' && S.unlocked.includes('a3_loc_deepcuts')", "home, Deep Cuts unlocked"],
  ["look", "inv:a3_list"],
  /* ---------------- the week: gear from Eddie ---------------- */
  ["use", "hot:a3_bed"],                                           // not yet, the napkin has open items
  ["expect", "!S.f.a3_thu3", "bed refuses before the napkin is done"],
  trav("a3_loc_halcyon"), ["use", "hot:a3_door"],
  ["expect", "S.room === 'a3_street'", "week: street again"],
  ans([2]), ["use", "hot:a3_bodega"],                              // a pickle in a bag
  ["expect", "RP.has('a3_pickle')", "pickle bought"],
  ans([1, 2]), ["talk", "hot:a3_eddie"],                            // show me / later
  ans([0]), mg({ ok: true, score: 80, bought: "pioneer_cdj_900", paid: 170 }), ["talk", "hot:a3_eddie"],
  ["expect", "S.f.a3_cdj && S.gear.decks === 'pioneer_cdj_900'", "CDJ-900s bought from Eddie"],
  ["use", "hot:a3_club_door"],
  ["expect", "S.room === 'a3_halcyon' && S.f.a3_week", "club in daylight"],
  ["talk", "hot:a3_odessa"],
  ["give", "hot:a3_gus", "a3_pickle"],
  ["expect", "S.f.a3_dj350 && S.gear.mixer === 'pioneer_djm_350'", "DJM-350 from Gus"],
  /* ---------------- the week: Deep Cuts, the fair, the hunt ---------------- */
  ["travel", "a3_loc_deepcuts"],
  ["expect", "S.room === 'a3_deepcuts'", "Deep Cuts"],
  ["look", "hot:a3_dc_grails"], ["look", "hot:a3_dc_wall"], ["look", "hot:a3_dc_sign"],
  ans(["something for me", "dollar", "Later"]), mg({ ok: true, score: 70, bought: ["crystal_waters_gypsy_woman"], spent: 3 }), ["talk", "hot:a3_ray"],
  ["expect", "S.f.a3_rayTip && S.unlocked.includes('a3_loc_fair')", "Ray tipped the grail and the fair"],
  ["travel", "a3_loc_fair"],
  ["expect", "S.room === 'a3_fair'", "the record fair"],
  ["talk", "hot:a3_mort"],                                          // no coffee: grunts
  ["talk", "hot:a3_priya"], ["talk", "hot:a3_dj_danny_krivit"], ["talk", "hot:a3_vendor"],
  ["look", "hot:a3_f_cork"],
  ["talk", "hot:a3_pta"],
  ["expect", "RP.has('a3_coffee') && S.f.a3_clue3", "coffee bought, flyer found"],
  ["give", "hot:a3_mort", "a3_coffee"],
  ["expect", "S.f.a3_clue2 && S.f.a3_hunt && S.unlocked.includes('a3_loc_estate')", "the three clues add up: the Pruitt house"],
  /* ---------------- the Queens estate ---------------- */
  ["travel", "a3_loc_estate"],
  ["expect", "S.room === 'a3_estate' && S.f.a3_priyaAtEstate", "estate: Priya is arguing"],
  ["talk", "hot:a3_e_bird"], ["look", "hot:a3_e_tt"], ["look", "hot:a3_e_shelves"], ["pickup", "hot:a3_e_tt"],
  ans([2]), ["talk", "hot:a3_tanya"],                               // look around first
  ["expect", "!S.f.a3_estatePaid", "not bought yet"],
  ans([0, 0]), ["talk", "hot:a3_tanya"],                            // pay $90, keep the eight stars, sell the rest
  ["expect", "S.f.a3_estatePaid && S.f.a3_dug && " + JSON.stringify(GEMS) + ".every(id => RP.hasRecord(id))", "bought and sorted the collection"],
  ["pickup", "hot:a3_e_platter"], ["pickup", "hot:a3_e_tt"],
  ["expect", "S.f.a3_grail && S.f.a3_tt && S.f.a3_estateDone && S.gear.turntables === 'technics_sl_1210mk2' && RP.hasRecord('loose_joints_is_it_all_over_my_face')", "grail and Technics in the crate"],
  /* ---------------- the week: promo, then sleep until Thursday ---------------- */
  ["travel", "a3_loc_apartment"],
  ["expect", "S.room === 'a3_apartment'", "home"],
  ["use", "hot:a3_bed"],                                            // promo still missing
  ["expect", "!S.f.a3_thu3", "bed refuses: promo missing"],
  ans([1]), ["use", "hot:a3_laptop"],                                // the posting week: a clip a day
  ["expect", "S.f.a3_promo && S.followers >= 600", "promo week done"],
  ["use", "hot:a3_bed"],
  ["expect", "S.f.a3_thu3 && S.msgs.length >= 4", "Thursday again: anniversary night"],
  ["talk", "hot:a3_hole"],
  /* ---------------- Night 3: the street, Tiny, Marcus and plus three ---------------- */
  ["run", (S, R) => { R.test.travelQ.length = 0; R.test.travelQ.push("a3_loc_halcyon"); }],
  ["use", "hot:a3_door"],
  ["expect", "S.room === 'a3_street' && S.f.a3_arr3", "anniversary night on Ludlow Street"],
  ["talk", "hot:a3_twinkie"], ["talk", "hot:a3_marcus"], ["look", "hot:a3_queue"],
  ["use", "hot:a3_club_door"],
  ["expect", "S.room === 'a3_halcyon' && S.f.a3_n3intro && S.f.a3_swap && S.f.a3_night3in", "inside: Brandon hugged me"],
  ["talk", "hot:a3_marcus"], ["talk", "hot:a3_brandon"], ["talk", "hot:a3_kosmo"],
  ["use", "hot:a3_h_stage"],
  ["expect", "S.room === 'a3_booth' && S.f.a3_swapFound", "booth: the USB is full of Brandon"],
  ["use", "hot:a3_b_cdjs"],                                         // not yet
  ["expect", "!S.f.a3_kosmoDone", "can't set up yet"],
  ["use", "hot:a3_b_steps"],
  ans(["Brandon", "Never mind"]), ["talk", "hot:a3_gus"],
  ["talk", "hot:a3_odessa"],
  ["expect", "S.f.a3_toldOdessa", "told Odessa"],
  ["use", "hot:a3_h_player"],                                       // too early / wrong order? it asks for a record
  ["run", (S, R) => { R.test.answers.length = 0; R.test.answers.push("Acid Tracks"); }],
  ["use", "hot:a3_h_player"],
  ["expect", "!S.f.a3_feudOver", "wrong record: still feuding"],
  ans(["What happened", "not angry", "Never mind"]), ["talk", "hot:a3_nico"],
  ans(["not angry", "Never mind"]), ["talk", "hot:a3_bex"],
  ans(["Sylvester"]), ["use", "hot:a3_h_player"],
  ["expect", "S.f.a3_feudOver && RP.has('a3_key_nico') && RP.has('a3_key_bex')", "bartenders reconciled, two keys"],
  ["use", "hot:a3_h_staff"],
  ["expect", "S.room === 'a3_office'", "Odessa's office"],
  ["look", "hot:a3_o_calendar"], ["look", "hot:a3_o_cork"], ["use", "hot:a3_o_thermo"],
  ["use", "hot:a3_o_dvr"],
  ["expect", "S.f.a3_footageGot && RP.has('a3_footage') && !RP.has('a3_key_nico')", "bar-cam clip: Brandon caught"],
  ["use", "hot:a3_o_door"],
  ["expect", "S.room === 'a3_halcyon'", "back on the floor"],
  ans([0, 1]), ["give", "hot:a3_odessa", "a3_footage"],             // first shout (he wriggles), then say nothing and let the clip run
  ["expect", "S.f.a3_brandonDone && S.f.a3_usbBack", "Brandon confronted"],
  /* ---------------- Night 3: Kosmo overruns, then the anniversary set ---------------- */
  ["use", "hot:a3_h_stage"],
  mg({ ok: true, score: 80, played: [] }), ["use", "hot:a3_b_cdjs"],       // crowd.Read: the room Kosmo warmed up
  ["expect", "S.f.a3_kosmoDone", "followed Kosmo Delacroix"],
  ans([0, 0, 0, 2]), ["use", "hot:a3_b_cdjs"],                      // opener, closer -> set -> Saturday -> platform (hop the turnstile, then the man with the oranges) -> home -> ending
  ["expect", "S.f.a3_setDone && S.f.a3_saturday && S.gear.monitors === 'dynaudio_bm5_mkiii'", "anniversary set, Saturday, Dynaudios"],
  ["expect", "S.f.a3_train && S.f.a3_email", "home on the last train, the email arrived"],
  ["expect", "S.done.includes(3)", "act 3 complete"]
];
})();
