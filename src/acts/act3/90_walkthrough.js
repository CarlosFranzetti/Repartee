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

const WALK3 = [
  /* ---------------- Thursday afternoon, 4C ---------------- */
  ["expect", "S.act === 3 && S.room === 'a3_apartment'", "act 3 starts in the apartment"],
  ["expect", "S.gear.decks === 'pioneer_cdj_350' && S.records.length >= 10 && S.followers >= 400", "baseline setup"],
  ["look", "hot:a3_laptop"], ["look", "hot:a3_hole"], ["talk", "hot:a3_hole"], ["look", "hot:a3_tt"], ["look", "hot:a3_mixer"], ["look", "hot:a3_cdjs"], ["look", "hot:a3_monitors"],
  ["use", "hot:a3_bed"],                                           // too early to sleep
  trav("a3_loc_halcyon"), ["use", "hot:a3_door"],                  // no bag, no USB: the door says no
  ["expect", "S.room === 'a3_apartment'", "door refuses without bag"],
  ["pickup", "hot:a3_usb"], ["pickup", "hot:a3_crate"],
  ["expect", "RP.has('a3_bag') && RP.has('a3_usb')", "bag and USB packed"],
  ["look", "hot:a3_drawer"], ["pickup", "hot:a3_drawer"],
  ["expect", "RP.has('a3_usb_old')", "the old cat USB is in the bag (a decoy, later)"],
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
  ["look", "hot:a3_b_smiley"], ["pickup", "hot:a3_b_smiley"],
  ["expect", "RP.has('a3_smiley')", "peeled Brandon's smiley"],
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
  ["expect", "S.f.a3_opener && S.f.a3_week && RP.has('a3_list') && S.money >= 300 && S.money <= 330", "night 1 done: paid, napkin, week begins with a budget"],
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
  ans([0]), ["talk", "hot:a3_odessa"],                              // "I'm a bit short": one weekday shift
  ["expect", "S.f.a3_shifts === 1", "worked a shift for Odessa"],
  ["give", "hot:a3_gus", "a3_pickle"],
  ["expect", "S.f.a3_mixerBox && !S.f.a3_dj350", "Gus's mixer has no power brick"],
  ["use", "hot:a3_h_door"],
  ["expect", "S.room === 'a3_street'", "back to Eddie's van"],
  ans([0]), ["talk", "hot:a3_eddie"],                              // the power brick, $35
  ["expect", "S.f.a3_dj350 && S.gear.mixer === 'pioneer_djm_350'", "DJM-350 running on Eddie's brick"],
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
  ["look", "hot:a3_f_cork"], ["pickup", "hot:a3_f_cork"],
  ["talk", "hot:a3_pta"],
  ["expect", "RP.has('a3_coffee') && S.f.a3_clue3 && RP.has('a3_flyer')", "coffee bought, flyer in the pocket"],
  ["give", "hot:a3_mort", "a3_coffee"],
  ["expect", "S.f.a3_clue2 && S.f.a3_hunt && S.f.a3_knowHal && S.unlocked.includes('a3_loc_estate')", "the three clues add up: the Pruitt house"],
  ans([0, 0]), ["talk", "hot:a3_mort"],                            // sell one record to Mort
  ["expect", "S.f.a3_sold === 1", "sold a record at the fair"],
  /* ---------------- the Queens estate ---------------- */
  ["travel", "a3_loc_estate"],
  ["expect", "S.room === 'a3_estate' && S.f.a3_priyaAtEstate", "estate: Priya is arguing"],
  ["talk", "hot:a3_e_bird"], ["look", "hot:a3_e_tt"], ["look", "hot:a3_e_sh0"], ["pickup", "hot:a3_e_tt"], ["talk", "hot:a3_priya"],
  ans(["look around"]), ["talk", "hot:a3_tanya"],                   // Priya's $110 stands; look around first
  ["expect", "!S.f.a3_estatePaid", "not bought yet"],
  ans(["flyer"]), ["talk", "hot:a3_tanya"],                         // the small print beats Priya: $70
  ["expect", "S.f.a3_estatePaid && S.f.a3_estatePrice === 70 && !S.f.a3_priyaAtEstate", "the flyer beat Priya's bid"],
  ans([0]), ["use", "hot:a3_e_sh0"], ans([0]), ["use", "hot:a3_e_sh1"], ans([0]), ["use", "hot:a3_e_sh2"],   // keep Hal's stars
  ["expect", "S.f.a3_dug && " + JSON.stringify(GEMS) + ".every(id => RP.hasRecord(id))", "sorted by the stars: all eight kept"],
  ["pickup", "hot:a3_e_tt"],                                        // the left deck is wrong: ask the bird
  ["expect", "!S.f.a3_tt && !S.f.a3_platterKnown", "Bernard has not spoken yet"],
  ["talk", "hot:a3_e_bird"], ["talk", "hot:a3_e_bird"],
  ["expect", "S.f.a3_platterKnown", "Bernard: left platter"],
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
  ["use", "inv:a3_bag", "a3_usb"],                                  // the USB goes into a Sylvester sleeve in the bag (the old cat stick stays in the pocket)
  ["expect", "S.f.a3_usbHidden && RP.has('a3_usb_old')", "real USB hidden, decoy in the pocket"],
  /* ---------------- Night 3: the street, Tiny, Marcus and plus three ---------------- */
  ["run", (S, R) => { R.test.travelQ.length = 0; R.test.travelQ.push("a3_loc_halcyon"); }],
  ["use", "hot:a3_door"],
  ["expect", "S.room === 'a3_street' && S.f.a3_arr3", "anniversary night on Ludlow Street"],
  ["talk", "hot:a3_twinkie"], ["talk", "hot:a3_marcus"], ["look", "hot:a3_queue"],
  ["use", "hot:a3_club_door"],
  ["expect", "S.room === 'a3_halcyon' && S.f.a3_n3intro && S.f.a3_night3in && S.f.a3_foiled === 'cat' && !S.f.a3_swap && !RP.has('a3_usb_old')", "inside: Brandon hugged me and took the cat"],
  ["talk", "hot:a3_marcus"], ["talk", "hot:a3_brandon"], ["talk", "hot:a3_kosmo"],
  ["use", "hot:a3_h_stage"],
  ["expect", "S.room === 'a3_booth' && S.f.a3_swapFound && !S.f.a3_usbHidden", "booth: the real USB is all mine"],
  ["use", "hot:a3_b_cdjs"],                                         // not yet
  ["expect", "!S.f.a3_kosmoDone", "can't set up yet"],
  ["use", "hot:a3_b_steps"],
  ["expect", "S.room === 'a3_halcyon' && S.f.a3_brandonDone && S.f.a3_catFamous && S.f.a3_usbBack && !S.f.a3_footageGot", "Brandon plugged in the cat; Odessa sent him off"],
  ["talk", "hot:a3_odessa"],
  /* ---------------- Night 3: Kosmo overruns, then the anniversary set ---------------- */
  ["use", "hot:a3_h_stage"],
  mg({ ok: true, score: 80, played: [] }), ["use", "hot:a3_b_cdjs"],       // crowd.Read: the room Kosmo warmed up
  ["expect", "S.f.a3_kosmoDone", "followed Kosmo Delacroix"],
  ans([0, 0, 2]), ["use", "hot:a3_b_cdjs"],                         // opener, closer -> set -> Saturday -> platform (ask the man with the oranges) -> home -> ending
  ["expect", "S.f.a3_setDone && S.f.a3_saturday && S.gear.monitors === 'dynaudio_bm5_mkiii'", "anniversary set, Saturday, Dynaudios"],
  ["expect", "S.f.a3_train && S.f.a3_email", "home on the last train, the email arrived"],
  ["expect", "S.done.includes(3)", "act 3 complete"]
];
RP.walkthroughs.act3 = WALK3;

/* the fallback and the wrong turns: a sorry budget (shifts, a record sold), Hal's reputation instead of the flyer, a wrong shelf, tags for the promo,
   no one reads the hint so Brandon swaps the USB, the bartenders' feud, the clip, shouting at Brandon, then jumping the turnstile */
RP.walkthroughs.act3alt = [
  ["expect", "S.act === 3 && S.room === 'a3_apartment'", "act 3 starts in the apartment"],
  ["pickup", "hot:a3_usb"], ["pickup", "hot:a3_crate"],
  trav("a3_loc_halcyon"), ["use", "hot:a3_door"],
  ans([0]), ["use", "hot:a3_bodega"],                              // chips
  ["use", "hot:a3_club_door"],
  ["give", "hot:a3_gus", "a3_chips"],
  ["use", "hot:a3_h_stage"],
  mg({ ok: true, score: 80, played: [] }), ["use", "hot:a3_b_cdjs"],
  ["expect", "S.f.a3_week && S.money > 300", "night 1 done"],
  trav("a3_loc_halcyon"), ["use", "hot:a3_door"],
  ans([2]), ["use", "hot:a3_bodega"],                              // pickle
  ans([0]), mg({ ok: true, score: 80, bought: "pioneer_cdj_900", paid: 260 }), ["talk", "hot:a3_eddie"],
  ["expect", "S.f.a3_cdj && S.money < 70", "decks cost the earth: the week is tight now"],
  ["use", "hot:a3_club_door"],
  ["give", "hot:a3_gus", "a3_pickle"],
  ["use", "hot:a3_h_door"],
  ans([0]), ["talk", "hot:a3_eddie"],                               // brick, $35 (still affordable)
  ["use", "hot:a3_club_door"],
  ans([0]), ["talk", "hot:a3_odessa"], ans([0]), ["talk", "hot:a3_odessa"],   // two shifts
  ["expect", "S.f.a3_shifts === 2 && S.f.a3_dj350", "two shifts worked; mixer powered"],
  ["talk", "hot:a3_odessa"],
  ["travel", "a3_loc_deepcuts"],
  ans(["something for me", "Later"]), ["talk", "hot:a3_ray"],
  ["travel", "a3_loc_fair"],
  ["talk", "hot:a3_pta"],
  ["look", "hot:a3_f_cork"],
  ["give", "hot:a3_mort", "a3_coffee"],
  ["expect", "S.f.a3_hunt && S.f.a3_knowHal && !RP.has('a3_flyer')", "hunt solved; no flyer taken"],
  ans([0, 0]), ["talk", "hot:a3_mort"], ans([0, 0]), ["talk", "hot:a3_mort"],
  ["expect", "S.f.a3_sold === 2", "sold two records to Mort"],
  ["travel", "a3_loc_estate"],
  ans(["Pitch"]), ["talk", "hot:a3_tanya"],                         // sweet, but not a number
  ["expect", "!S.f.a3_estatePaid", "the pitch doesn't beat $110"],
  ans(["Mort and Ray"]), ["talk", "hot:a3_tanya"],                  // Hal's reputation: $90
  ["expect", "S.f.a3_estatePaid && S.f.a3_estatePrice === 90", "Hal's reputation beat Priya"],
  ans([1]), ["use", "hot:a3_e_sh0"], ans([0]), ["use", "hot:a3_e_sh1"], ans([0]), ["use", "hot:a3_e_sh2"],   // the big names on shelf one: two stars sold
  ["expect", "S.f.a3_dug && S.f.a3_gems === 6", "sorted: six of eight stars kept"],
  ["talk", "hot:a3_e_bird"], ["talk", "hot:a3_e_bird"], ["talk", "hot:a3_e_bird"],
  ["pickup", "hot:a3_e_platter"], ["pickup", "hot:a3_e_tt"],
  ["expect", "S.f.a3_estateDone", "estate done"],
  ["travel", "a3_loc_apartment"],
  ans([2]), ["use", "hot:a3_laptop"],                               // tag every bar: a $40 fine
  ["expect", "S.f.a3_promo && S.f.a3_fines === 40", "tags cost a fine"],
  ["use", "hot:a3_bed"],
  ["expect", "S.f.a3_thu3", "Thursday"],
  ["run", (S, R) => { R.test.travelQ.length = 0; R.test.travelQ.push("a3_loc_halcyon"); }], ["use", "hot:a3_door"],
  ["use", "hot:a3_club_door"],
  ["expect", "S.f.a3_swap && !S.f.a3_foiled", "no one hid anything: Brandon swapped the USB"],
  ["use", "hot:a3_h_stage"],
  ["expect", "S.f.a3_swapFound", "the USB is full of Brandon"],
  ["use", "hot:a3_b_steps"],
  ans(["Brandon", "Never mind"]), ["talk", "hot:a3_gus"],
  ["talk", "hot:a3_odessa"],
  ["run", (S, R) => { R.test.answers.length = 0; R.test.answers.push("Sylvester"); }],
  ["use", "hot:a3_h_player"],
  ["expect", "S.f.a3_feudOver && RP.has('a3_key_nico') && RP.has('a3_key_bex')", "bartenders reconciled"],
  ["use", "hot:a3_h_staff"], ["use", "hot:a3_o_dvr"],
  ["expect", "S.f.a3_footageGot", "bar-cam clip"],
  ["use", "hot:a3_o_door"],
  ans([0]), ["give", "hot:a3_odessa", "a3_footage"],                // shout: a fine and fewer fans
  ["expect", "S.f.a3_brandonDone && S.f.a3_usbBack && S.f.a3_shouted && S.f.a3_fines === 80", "Brandon caught, but loudly"],
  ["use", "hot:a3_h_stage"],
  mg({ ok: true, score: 80, played: [] }), ["use", "hot:a3_b_cdjs"],
  ["expect", "S.f.a3_kosmoDone", "followed Kosmo"],
  ans([0, 0, 0]), ["use", "hot:a3_b_cdjs"],                         // opener, closer, jump the turnstile
  ["expect", "S.f.a3_setDone && S.f.a3_saturday && S.f.a3_train && S.f.a3_ticket !== undefined", "set, Saturday, a ticket on the way home"],
  ["expect", "S.f.a3_email && S.done.includes(3)", "act 3 complete"]
];
})();
