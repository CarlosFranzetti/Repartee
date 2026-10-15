/* Act 2 — headless walkthroughs. RP.walkthroughs.act2 is the complete level from the couch to RP.completeAct.
   RP.walkthroughs.act2alt takes the other branches: honest shower, the sneak-in, a lemon from Eddie, failed
   mini-games with retries, the amp as a ticket.
   Every hotspot step is guarded: it must be visible and present in the current room (the engine's test hook skips that check).
   Every mini-game step queues its result when the game is installed, or the answers for the dialogue fallback when not. */
(function () {
"use strict";
const RP = window.RP, A2 = RP.a2;

const hot = (verb, id, item) => [["expect", (S, R) => A2.can(id) && (!item || S.inv.includes(item)), "'" + id + "' is reachable in " + "the current room" + (item ? " with " + item : "")], [verb, "hot:" + id, item]];
const inv = (verb, id, item) => [[verb, "inv:" + id, item]];
const say = txt => ["answers", [].concat(txt)];
const clear = () => ["run", (S, R) => { R.test.answers.length = 0; R.test.mgQ.length = 0; R.test.travelQ.length = 0; }];
const mg = (id, result, fb) => ["run", (S, R) => { if (R.mg.reg[id]) R.test.mgQ.push(result); else R.test.answers.push(...fb); }];
const queueTravel = loc => ["run", (S, R) => { R.test.travelQ.push(loc); }];
// leave through a "travel" exit hotspot: queue the destination, then use the stairs
const go = (exitId, loc) => [queueTravel(loc), ...hot("use", exitId), clear()];
const exp = (code, msg) => ["expect", code, msg];
const flat = a => a.reduce((o, x) => (Array.isArray(x[0]) ? o.push(...x) : o.push(x), o), []);
const W = (...steps) => flat(steps);

const FB = {
  buy: ["AT-LP120-USB pair", "Take it"],
  list: ["Stick to"],
  sound: ["Swap", "Lift", "Turn"],
  after: ["Text Marcus", "Text Dani", "Text Moxie"],
  talk: ["not in a rush", "I know your party", "white label"]
};

RP.walkthroughs.act2 = W(
  exp("S.room === 'a2_couch' && S.f.a2_ch === 1", "starts on Marcus's couch"),
  exp("S.inv.includes('usb_cat') && S.inv.includes('phone')", "phone and USB in the inventory"),
  hot("look", "a2_window"), hot("look", "a2_gear"), hot("look", "a2_fridge"),
  // Marcus: the plan, the shower hint (which also texts Dani), Vic, the next-step hint
  say(["plan", "shower", "pierogi", "Vic", "next", "Later"]), hot("talk", "marcus"), clear(),
  exp("S.f.a2_plan && S.f.a2_daniText && S.unlocked.includes('a2_loc_plasma') && S.unlocked.includes('a2_loc_van') && S.unlocked.includes('a2_loc_dani')", "Marcus's plan unlocked the map"),
  hot("use", "a2_bath"), hot("use", "a2_bath"),
  // out to the street, Mrs. Pearl's tips
  hot("use", "a2_door"),
  exp("S.room === 'a2_street'", "on the street"),
  say(["How does", "proof", "Thanks"]), hot("talk", "a2_pearl"), clear(),
  exp("S.f.a2_pearlTips", "Pearl's plasma tips"),
  hot("look", "a2_atm"), hot("pickup", "a2_pole"),
  // the old building: Lou's mail (proof of address) and the NYC 93 secret
  go("a2_subway", "a2_loc_hall"),
  exp("S.room === 'a2_hall'", "in the hall"),
  hot("look", "a2_notice"), hot("use", "a2_4c"),
  say(["mail", "NYC 93", "Gerald", "Basement", "Thanks"]), hot("talk", "a2_lou4b"), clear(),
  exp("S.inv.includes('a2_bill') && S.f.a2_louSecret", "Con Ed bill in hand and Lou admitted NYC 93 is his"),
  // plasma center
  go("a2_stairs", "a2_loc_plasma"),
  exp("S.room === 'a2_plasma'", "at the plasma center"),
  hot("use", "a2_pen"),
  say(["donate", "much", "Never"]), hot("talk", "a2_rhonda"), clear(),
  exp("S.inv.includes('a2_form')", "got Form 27-B"),
  hot("use", "a2_pen", "a2_form"),
  exp("S.f.a2_formDone", "form filled out"),
  hot("give", "a2_rhonda", "a2_form"),
  exp("S.f.a2_cleared && !S.inv.includes('a2_bill')", "cleared by Rhonda"),
  say([0]), hot("talk", "a2_bev"), clear(),
  exp("S.f.a2_plasma && S.inv.includes('a2_card') && S.f.a2_cardBal === 100", "donated, got the $100 card"),
  hot("use", "a2_exit"),
  exp("S.room === 'a2_plasma'", "still woozy: can't leave before aftercare"),
  hot("use", "a2_aftercare"),
  exp("S.f.a2_ate && !S.f.a2_woozy", "ate the cookie and drank the juice"),
  go("a2_exit", "a2_loc_couch"),
  exp("S.room === 'a2_street'", "back on Marcus's block"),
  // the bodega ATM
  say(["Withdraw"]), hot("use", "a2_atm", "a2_card"), clear(),
  exp("S.f.a2_cashed && !S.inv.includes('a2_card') && S.money > 80", "cashed the card out (fee included)"),
  // Eddie, window shopping (can't afford yet)
  go("a2_subway", "a2_loc_van"),
  exp("S.room === 'a2_van'", "at Eddie's van"),
  say(["How much", "records", "Vic", "boombox", "I want the", "Later"]), hot("talk", "eddie"), clear(),
  exp("S.f.a2_metEddie && S.hasRecordCheck !== 1 && RP.hasRecord('crystal_waters_gypsy_woman') && !S.f.a2_turntables", "met Eddie, bought Gypsy Woman, no turntables yet (not enough cash)"),
  hot("use", "a2_boombox"), hot("look", "a2_junk"),
  // Dani's shower
  go("a2_vanstairs", "a2_loc_dani"),
  exp("S.room === 'a2_dani'", "at Dani's"),
  hot("look", "a2_bath"),
  say(["pierogi", "seven settings"]), hot("talk", "a2_dani"), clear(),
  exp("S.f.a2_showered && S.f.a2_daniName && RP.hasRecord('snap_rhythm_is_a_dancer') && S.unlocked.includes('a2_loc_loft')", "clean, Dani's name to drop, a new record"),
  go("a2_exit", "a2_loc_couch"),
  hot("use", "a2_stoopdoor"),
  exp("S.room === 'a2_couch'", "home on the couch"),
  // sleep until Friday, work Marcus's door (guest.List)
  say(["Sleep"]), hot("use", "a2_couch"), clear(),
  exp("S.f.a2_ch === 2 && S.f.a2_partyStarted && S.f.noTravel", "Friday: the party starts"),
  mg("guestList", { ok: true, score: 80, admitted: 12, angry: 1 }, FB.list), hot("use", "a2_listdoor"), clear(),
  exp("S.f.a2_jessHere && S.f.a2_jar > 0", "the door is done, Jess is here, the jar paid"),
  hot("give", "jess", "usb_cat"),
  exp("S.f.a2_usbBack && S.f.a2_ampGot && S.inv.includes('a2_amp') && S.f.a2_twinkieGift && RP.hasRecord('robin_s_show_me_love')", "USB returned, amp borrowed, Twinkie's record"),
  exp("S.f.a2_ch === 3 && !S.f.noTravel && S.unlocked.includes('a2_loc_loft')", "Saturday morning, travel is free again"),
  // Saturday: Eddie sells the turntables (buy.Gear)
  hot("use", "a2_door"),
  go("a2_subway", "a2_loc_van"),
  say(["I want the", "Later"]), mg("buyGear", { ok: true, score: 85, bought: "at_lp120_usb", paid: 175 }, FB.buy), hot("talk", "eddie"), clear(),
  exp("S.f.a2_turntables && S.inv.includes('a2_tts') && S.gear.turntables === 'at_lp120_usb'", "own turntables"),
  // the Bushwick loft: Fitz, the guest list by Dani's name
  go("a2_vanstairs", "a2_loc_loft"),
  exp("S.room === 'a2_loftdoor'", "outside the loft"),
  say(["Dani says"]), hot("talk", "a2_fitz"), clear(),
  exp("S.room === 'a2_loft' && S.f.a2_inLoft && !S.f.a2_sneaked", "talked onto the list"),
  say(["spare amp", "Later"]), hot("talk", "a2_moxie"), clear(),
  say(["advice", "Never"]), hot("talk", "kosmo"), clear(),
  hot("look", "a2_flyerbs"), hot("look", "a2_flyer718"),
  hot("use", "a2_rack", "a2_amp"),
  exp("S.f.a2_ampInstalled && !S.inv.includes('a2_amp')", "amp installed in the rack"),
  mg("soundCheck", { ok: true, score: 80, fixed: 3 }, FB.sound), hot("use", "a2_booth"), clear(),
  exp("S.f.a2_loftFixed && S.f.a2_vicMet && S.unlocked.includes('a2_loc_basement') && S.f.a2_loftPaid", "PA fixed, Vic watched, the spot is on the map"),
  // the spot: Twinkie's basement (it's Vic's)
  hot("use", "a2_loftexit"),
  go("a2_loftstairs", "a2_loc_basement"),
  exp("S.room === 'a2_warehouse' && S.f.a2_whIntro && S.f.a2_whLights", "arrived at Basement Tapes"),
  mg("afterParty", { ok: true, score: 80, guests: 60 }, FB.after), hot("talk", "twinkie"), clear(),
  exp("S.f.a2_afterDone", "after.Party succeeded"),
  mg("promoterTalk", { ok: true, score: 82, deal: { slot: "monthly" } }, FB.talk), hot("use", "a2_whbooth", "a2_tts"), clear(),
  exp("S.f.a2_ttSet && S.f.a2_louPlayed && S.f.a2_slot", "turntables set up, NYC 93 played, slot booked"),
  exp("RP.hasRecord('mr_fingers_washing_machine_can_you_feel_it') && S.done.includes(2)", "act 2 complete")
);

/* ---- the other branches ---- */
RP.walkthroughs.act2alt = W(
  exp("S.act === 2", "act 2"),
  // skip the Marcus hint speech: go straight for what the plan says
  say(["plan", "Later"]), hot("talk", "marcus"), clear(),
  hot("use", "a2_door"),
  go("a2_subway", "a2_loc_hall"),
  say(["mail", "Thanks"]), hot("talk", "a2_lou4b"), clear(),
  go("a2_stairs", "a2_loc_plasma"),
  say(["donate", "Never"]), hot("talk", "a2_rhonda"), clear(),
  // wrong order on purpose: bill without the filled form is refused, then do it right
  hot("give", "a2_rhonda", "a2_bill"),
  exp("!S.f.a2_cleared", "Rhonda refuses an unfilled form"),
  hot("use", "a2_pen", "a2_form"), hot("give", "a2_rhonda", "a2_form"),
  exp("S.f.a2_cleared", "cleared"),
  say([2]), hot("talk", "a2_bev"), clear(),
  hot("use", "a2_aftercare"),
  go("a2_exit", "a2_loc_couch"),
  say(["Withdraw"]), hot("use", "a2_atm", "a2_card"), clear(),
  // Dani: the honest way
  queueTravel("a2_loc_dani"), hot("use", "a2_subway"), clear(),
  say(["I'll be honest"]), hot("talk", "a2_dani"), clear(),
  exp("S.f.a2_showered", "showered the honest way"),
  go("a2_exit", "a2_loc_couch"),
  hot("use", "a2_stoopdoor"),
  say(["Sleep"]), hot("use", "a2_couch"), clear(),
  // the party: a failed door still moves on (forgiving), then Jess and Twinkie
  mg("guestList", { ok: false, score: 20, admitted: 4, angry: 6 }, ["Stick to"]), hot("use", "a2_listdoor"), clear(),
  hot("give", "jess", "usb_cat"),
  exp("S.f.a2_ch === 3", "Saturday"),
  hot("use", "a2_door"),
  // Eddie: a lemon, refunded; then the real buy
  go("a2_subway", "a2_loc_van"),
  ["run", (S, R) => { S.f.__m0 = S.money; }],
  say(["I want the", "Later"]), mg("buyGear", { ok: false, score: 10, bought: null, paid: 120, lemon: "technics_sl_1200mk2", flaw: "wobble" }, ["AT-LP120-USB pair", "Take it"]), hot("talk", "eddie"), clear(),
  exp("!S.f.a2_turntables", "a lemon is not a purchase"),
  say(["I want the", "Later"]), mg("buyGear", { ok: true, score: 80, bought: "numark_tt1650", paid: 120 }, ["AT-LP120-USB pair", "Take it"]), hot("talk", "eddie"), clear(),
  exp("S.f.a2_turntables && S.inv.includes('a2_tts')", "bought the cheaper deck"),
  // the loft: sneak in through the fire escape; a failed sound check, retry
  go("a2_vanstairs", "a2_loc_loft"),
  hot("push", "a2_dumpster"),
  exp("S.f.a2_dumpster", "dumpster under the ladder"),
  hot("use", "a2_ladder"),
  exp("S.room === 'a2_loft' && S.f.a2_sneaked", "snuck in through the bathroom window"),
  hot("use", "a2_rack", "a2_amp"),
  mg("soundCheck", { ok: false, score: 10, fixed: 1 }, FB.sound), say([0]), hot("use", "a2_booth"), clear(),
  exp("!S.f.a2_loftFixed", "failed once"),
  say([0]), mg("soundCheck", { ok: true, score: 90, fixed: 3 }, FB.sound), hot("use", "a2_booth"), clear(),
  exp("S.f.a2_loftFixed", "fixed on the retry"),
  hot("use", "a2_loftexit"),
  go("a2_loftstairs", "a2_loc_basement"),
  // afterParty fails once, then succeeds; promoterTalk fails three times and Vic gives in
  mg("afterParty", { ok: false, score: 20, guests: 8 }, FB.after), say([0]), hot("talk", "twinkie"), clear(),
  exp("!S.f.a2_afterDone", "afterParty failed once"),
  mg("afterParty", { ok: true, score: 70, guests: 40 }, FB.after), hot("talk", "twinkie"), clear(),
  exp("S.f.a2_afterDone", "afterParty ok on retry"),
  ["run", (S, R) => { S.f.a2_vicFails = 2; }],
  mg("promoterTalk", { ok: false, score: 10, deal: null }, ["desperate"]), hot("use", "a2_whbooth", "a2_tts"), clear(),
  exp("S.f.a2_slot && S.done.includes(2)", "Vic gave in after the third miss: act 2 complete")
);
})();
