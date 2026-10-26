/* Act 3 — story scripts for the Halcyon Room: Night 1 (a routine Thursday, six months in), the week, Night 3 (Kosmo, Brandon, the anniversary set),
   the bartender feud, Gus and his snacks. Everything hangs off RP.A3.* so the room files stay readable. */
(function () {
"use strict";
const RP = window.RP;
const A3 = RP.A3;
const U = RP.u;

const say = (t, who) => RP.say(t, who);
const lines = a => RP.lines(a);
const GRAIL = "loose_joints_is_it_all_over_my_face";
const TAB = 200;   // the anniversary envelope, and the anniversary bar tab: the same two hundred dollars
const AC = id => RP.actor(id) || {};   // actors only exist in their own room; a missing one is a harmless dummy

/* ====================================================================== room entry */
A3.hallEnter = async function (S, from) {
  const open = !S.f.a3_week || S.f.a3_thu3;
  // ---- Night 1, first time through the door
  if (!S.f.a3_week && !S.f.a3_thu3 && !S.f.a3_metOdessa) {
    S.f.a3_metOdessa = true; S.f.noTravel = true; RP.setClock("THU 9:08 PM");
    await RP.walkTo(100, 232, "right");
    await lines(["@nar The Halcyon Room. Thursday, 9:08 PM.", "Smells like fog juice and ambition. Same as every Thursday.", "@a3_odessa Nine-oh-eight. Cutting it close.", "Doors are at ten.", "@a3_odessa Six months, never late. Don't start the week before the anniversary.",
      "Six months ago Odessa came down to Vic's Basement Tapes for my monthly and offered me Thursdays before the last record ended. I still play Vic's. Thursdays pay the rent.",
      "@a3_odessa Next Thursday's the anniversary. Six months. I want the room full and you on it.", "And Saturday?", "@a3_odessa Saturday is Brandon Shine's. Gold vest. Sunglasses indoors. Same as last week.",
      "@a3_odessa Fill tonight. Then we'll talk Saturday.", "@a3_odessa Gus has the monitors. They're asleep. You know the rule.", "Snack.", "@a3_odessa Don't say it out loud. He can hear it."]);
    return;
  }
  // ---- the week: the club in daylight
  if (S.f.a3_week && !S.f.a3_thu3 && !S.f.a3_weekHall) {
    S.f.a3_weekHall = true;
    await lines(["The Halcyon Room in daylight. Work lights, mop buckets, and chairs upside-down on tables. It looks like a club that's been caught with its pants down.", "@a3_odessa Don't look at it. It doesn't like being looked at."]);
    return;
  }
  // ---- Night 3 arrival: Brandon's big hug
  if (S.f.a3_thu3 && !S.f.a3_n3intro) {
    S.f.a3_n3intro = true; S.f.noTravel = true; S.f.a3_floor = "full"; RP.setClock("THU 8:58 PM");
    await RP.walkTo(100, 232, "right");
    await lines(["@nar Anniversary night. Six months of Thursdays.", "The room's filling fast. The banner says '6 MONTHS.' It doesn't say my name. It's for the room. It's still my favorite banner.",
      "@a3_odessa Six months. You've been late zero times. I've never had a DJ be early six months in a row.", "@a3_odessa Kosmo's here. He's in the booth. Don't speak unless spoken to. And if spoken to, don't speak too much.",
      "@a3_brandon THERE he is! The Thursday kid!"]);
    AC("a3_brandon").x = 150; AC("a3_brandon").y = 232;
    AC("a3_brandon").face = "right";
    await lines(["@a3_brandon Six months! Big night! Come here, come here, I'm a hugger.", "Brandon. Uh. Hi."]);
    RP.sfx("whoosh"); await RP.wait(500);
    await lines(["@a3_brandon I'm a fan. Honestly. The way you... stand at things. Nice jacket!", "@a3_brandon Break a leg. Both. Whichever.",
      "That was the longest hug I've had since I was nine.", "He smells like a hotel gift shop. And he patted my jacket twice. Weird. Probably a hugger thing."]);
    S.f.a3_swap = true;
    await RP.npcWalk("a3_brandon", 214, 222, "left");
    await say("Kosmo's in the booth. Let me go say hi. Carefully.");
  }
};

A3.boothEnter = async function (S, from) {
  if (S.f.a3_thu3 && !S.f.a3_kosmoMet) {
    S.f.a3_kosmoMet = true;
    await lines(["@a3_kosmo Wendell! My boy! There you are.", "It's actually-", "@a3_kosmo Wendell. I never forget a face. Or a name. Faces are hard. Names are Wendell.", "...Okay.",
      "@a3_kosmo I play until midnight. Not a minute more. Then you take the room, Wendell. Don't wreck it.", "@a3_kosmo Rule one: don't look at the crowd. Rule two: don't look at me. Rule three: don't look at your phone.",
      "That's three rules about looking.", "@a3_kosmo It's a visual art."]);
    await say("Let me check my USB on the spare CDJ. With headphones, so I don't wreck his vibe.");
    RP.sfx("click"); await RP.wait(300);
    await lines(["Track one: BRANDON SHINE - SUMMER OF SHINE (EXTENDED SHINE MIX). Track two: SHINE ON ME (RADIO SHINE). Track three: it's Brandon again.",
      "Sixteen gigs of Brandon. Same shade of blue. Same size. A smiley sticker where mine has a scratch. It's NOT mine.", "The hug. The pat. 'Nice jacket!' Brandon.",
      "@a3_kosmo Problem, Wendell?", "No. All fine.", "@a3_kosmo You've gone white. It's a good look. Very moody.",
      "I can't accuse the Saturday guy without proof. Odessa's going to want proof. A bar camera, maybe? I know she has one. Somewhere."]);
    S.f.a3_swapFound = true; RP.setClock("THU 10:20 PM");
    RP.toast("Mission: prove Brandon swapped your USB");
  }
};

/* ====================================================================== the booth: sets */
async function night1Set(S) {
  RP.setClock("THU 10:00 PM");
  await lines(["Ten PM. The floor's empty: five people at the bar, four of whom work here.", "Gus gives me a thumbs-up from the desk. His other hand is in the chips."]);
  S.f.a3_brandonSeen = true;
  const res = await A3.mg("setTime", { scenario: "opener", records: A3.pool(S, 8), minutes: 60, promoter: "Odessa", promoterId: "a3_odoff", promoterPronoun: "she", difficulty: 1 }, {
    giveUp: "Not yet", onFail: async () => { await lines(["The floor's still empty. The bartenders have started to dance on their own, out of pity.", "Go again, softer."]); },
    assist: async () => { await say("A couple walks in, sees me trying, and starts dancing out of mercy. It's a start."); } });
  if (res.giveUp) return;
  S.f.a3_floor = "full"; RP.relight();
  RP.followers(40);
  RP.setClock("THU 11:10 PM");
  await lines(["It builds. Slowly, then all at once. The floor fills like a tub.", "@a3_odoff Eighty people. On a Thursday. You're getting good at this.", "@a3_odoff Next Thursday I want two hundred."]);
  RP.sfx("cheer");
  await RP.fadeTo(1, 600); S.f.a3_opener = true; await RP.fadeTo(0, 600);
  await lines(["Odessa finds me at the bar, holds out an envelope. Two hundred dollars and a napkin with lipstick on it.", "@a3_odoff Your pay. Don't spend it in one place. Spend it in several, like an adult.", "@a3_odoff Read the napkin. Do the napkin. Come back with the napkin."]);
  RP.money(200); RP.give("a3_list");
  await lines(["Gear that doesn't embarrass her. A sound of my own. A crowd. And the anniversary, next Thursday. Odessa's whole business plan, in lipstick.",
    "@a3_brandonoff Cute. Cute set. I'd say 'I'm proud,' but then I'd have to be. See you Saturdays. Oh wait. You won't."]);
  AC("a3_brandon").expr = "angry";
  await RP.fadeTo(1, 700);
  S.f.a3_week = true; S.f.noTravel = false; S.f.a3_floor = null;
  RP.unlock("a3_loc_deepcuts");
  RP.text("RAY", "Deep Cuts. Tomorrow. Got something you're too young for. -R");
  RP.text("EDDIE TWO-TIMES", "Heard you got paid. Two-time deal on those CDJ-900s. Come to the van. -E2T", true);
  RP.setClock("FRI 1:20 PM");
  await RP.goto("a3_apartment", 560, 232, "left");
  await RP.fadeTo(0, 800);
  await lines(["@nar Friday, 1:20 PM. I slept through the entire morning.", "Phone: two texts. Ray, and Eddie. Both about money. Both from people who know I have some."]);
}

A3.boothUse = async function (S) {
  const gear = RP.actor("kid");
  // ---------- Night 1
  if (!S.f.a3_thu3) {
    if (S.f.a3_week) { await say("The booth in daylight: nobody's here, and the gear's asleep. It's a better look for it, honestly."); return; }
    if (!S.f.a3_soundcheck) { await lines(["The booth monitors are dead. The LEDs are asleep.", "Gus has to wake them. Gus is out at the desk. Gus responds to snacks."]); return; }
    await night1Set(S); return;
  }
  // ---------- Night 3
  if (!S.f.a3_swapFound) { await say("I should say hi to Kosmo first. Properly. With my hands where he can see them."); return; }
  if (!S.f.a3_brandonDone) {
    await lines(["I could play vinyl and skip the drama. But Brandon should answer for the USB first.", "And Kosmo's still on. I don't want to be the guy who walks into a legend's last record.", "Odessa needs to see what he did. I need the bar camera."]);
    return;
  }
  if (!S.f.a3_kosmoDone) { await kosmoOverrun(S); return; }
  if (!S.f.a3_setDone) { await anniversarySet(S); return; }
  await say("It's over. I'm standing at the decks like a statue of someone who just finished a great set. Go home.");
};

A3.usbIn = async function (S) {
  if (!S.f.a3_thu3) { await say("The USB's my backup. Vinyl first; tracks only if a record skips. I'll plug it in at the booth if I need it."); return; }
  if (S.f.a3_swap && !S.f.a3_usbBack) { await lines(["I plug it in and cue the first track. 'SUMMER OF SHINE.' It's still Brandon.", "I unplug it before the CDJ catches 'Shine.'"]); return; }
  await say("My real USB's back in my pocket. I'll play vinyl and keep it as a backup.");
};

async function kosmoOverrun(S) {
  RP.setClock("FRI 12:04 AM");
  await lines(["Midnight. Kosmo's still playing.", "@a3_kosmo Wendell! One more. One more. The room is alive!", "Kosmo, it's twelve-oh-four.", "@a3_kosmo Time is a flat circle, Wendell."]);
  const res = await A3.mg("setTime", { scenario: "follow-legend", followName: "Kosmo Delacroix", records: A3.pool(S, 8), minutes: 25, difficulty: 2 }, {
    giveUp: "A minute", onFail: async () => { await lines(["The floor drifts. Half of it is on its phones, the other half is asking Odessa for something she doesn't have.", "Right: breathe, watch the clock, pick the right moment."]); },
    assist: async () => { await say("Odessa steps up with a sheet of paper that says 'FIVE MORE MINUTES' in lipstick. The legend reads it. The legend wraps."); } });
  if (res.giveUp) return;
  await lines(["@a3_kosmo ...Not bad, Wendell. Not bad at all.", "@a3_kosmo Keep the room warm. I'm going to find a sandwich."]);
  S.f.a3_kosmoDone = true; RP.relight();
  RP.followers(25);
  await lines(["He hands me the headphones like a sacred object and walks off the stage.", "Kosmo Delacroix just told me 'not bad.' In the right light, that's practically a knighthood."]);
  RP.setClock("FRI 12:30 AM");
  await say("Now the room's mine. Time to play the set. Plan it first.");
}

async function anniversarySet(S) {
  const pool = A3.pool(S, 10);
  const res = await A3.mg("playlistOrder", { records: pool, slots: Math.min(8, pool.length), arc: "journey", difficulty: 2 }, {
    giveUp: "A minute", onFail: async () => { await lines(["It doesn't flow. The crowd's with me for four records, then it stumbles.", "Rule of thumb: build, don't jump."]); },
    assist: async () => { await say("Gus, from the desk, mouths 'snack?' and gives me a thumbs-up. It's the most support I've had from him."); } });
  if (res.giveUp) return;
  S.f.a3_setDone = true;
  RP.followers(80);
  RP.setClock("FRI 1:15 AM");
  const hasGrail = RP.hasRecord(GRAIL);
  const ids = (res.order || []).filter(id => id && RP.rec(id)), nm = id => id === "white_nyc93" ? "the white label" : RP.rec(id).artist.replace(/ (featuring|feat\.?|ft\.?) .*$/i, "");
  const wi = ids.indexOf("white_nyc93"), gi = ids.indexOf(GRAIL);
  const setLines = ["The first record drops" + (ids[0] ? ": " + nm(ids[0]) : "") + ". The room settles like a sigh."];
  if (ids.length >= 3) setLines.push("Then " + nm(ids[1]) + ", then " + nm(ids[2]) + ". Build, don't jump. For once, I don't jump.");
  setLines.push(wi >= 0 && wi < 3 ? "The white label is Lou's 1993. Nobody in here has heard it. The room goes quiet for a beat, then loud."
    : wi >= 0 || !ids.length ? "Somewhere in there, something nobody in here has heard: the white label. Lou's 1993. The room goes quiet for a beat, then loud."
    : "Then one record that isn't on the plan: the white label. Lou's 1993. Nobody in here has heard it. The room goes quiet for a beat, then loud.");
  await lines(setLines);
  if (hasGrail) await lines([(gi >= 0 && gi < ids.length - 1 ? "When its turn comes, I pull out" : "For the last record I pull out") + " the one sleeve in the bag that says 'FOR COMPANY.' Loose Joints. 'Is It All Over My Face?' Larry Levan's remix, the one everyone knows. On the Technics' cousin in the booth.",
    "Somebody screams. Somebody cries. Somebody films it, which is the same thing."]);
  RP.sfx("cheer");
  S.f.a3_vegaHere = true;
  await lines(["At the end of the booth, a guy with headphones round his neck gives me a thumbs-up. Louie Vega. Masters At Work, with Kenny 'Dope' Gonzalez.", "@a3_dj_louie_vega Nice blend."]);
  await say("Nice blend. Louie Vega said 'nice blend.' I'm going to put it on my gravestone.");
  await lines(["@a3_odoff ...That's the one. That's the set. That's Saturday.", "@a3_odoff Saturday. Eleven PM. The main floor. Prime time. Brandon's got a vacation.", "@a3_odoff Take the old booth monitors. Dynaudio BM5s. Too good for Gus, who only listens to the sound of a bag opening."]);
  RP.setGear("monitors", "dynaudio_bm5_mkiii");
  S.f.a3_saturday = true;
  await lines(["@a3_odoff And your envelope. Two hundred. Thursdays are cash."]);
  RP.money(TAB);
  await lines(["@a3_marcusoff That was... the best night of my life. And I've been to a lot of nights.", "I'm going to cry. In front of Marcus. In front of Rico, Dee and the guy from the cab."]);
  RP.setClock("FRI 1:35 AM");
  await lines(["Twenty minutes of hugging strangers later, Dee, Rico and the guy from the cab have put eleven rounds on 'the DJ.' Odessa covers half. My half is the envelope: two hundred dollars.",
    "I hand Nico the envelope without opening it. I just played the best set of my life for free."]);
  RP.money(-TAB);
  await lines(["Phone: 3%. Bag: every record I own. Time: twenty-five to two."]);
  await RP.fadeTo(1, 800); S.f.noTravel = false;
  await RP.goto("a3_platform", 540, 230, "left");
  await RP.fadeTo(0, 400);
}

/* ====================================================================== Gus (snacks only) */
A3.gusTalk = async function (S) {
  await say(S.f.a3_soundcheck ? "Snack?" : "Snack.", "a3_gus");
  await RP.convo([
    { text: "Hi, Gus. Six months of Thursdays. Do you know my name yet?", run: () => say("Snack.", "a3_gus") },
    { text: "What do I have to do for the monitors?", when: S2 => !S2.f.a3_soundcheck, run: () => say("Snack.", "a3_gus") },
    { text: "What kind of snack?", when: S2 => !S2.f.a3_soundcheck, run: () => lines(["@a3_gus Salt. Vinegar. Chip. Blue bag.", "That's the most words I've ever heard. He used four. He's showing off."]) },
    { text: "Any spare gear around, Gus?", when: S2 => !!S2.f.a3_soundcheck && !S2.f.a3_dj350, run: () => lines(["@a3_gus ...Mixer. Lost and found. Lost since 2019.", "The mixer's in the lost and found. What does it cost?", "@a3_gus Snack. Different one. Green. Wet. Sour.", "A pickle. The man wants a pickle."]) },
    { text: "Did you see Brandon near the booth?", when: S2 => !!S2.f.a3_swapFound && !S2.f.a3_brandonDone, run: () => lines(["@a3_gus Pretzel.", "Pretzel?", "@a3_gus Brandon gave me a pretzel. I looked at the pretzel.", "He didn't look at the booth. He looked at the pretzel. Brandon's smarter than he looks, and he doesn't look that smart."]) },
    { text: "Never mind.", end: true }
  ]);
};
A3.gusGive = async function (S, item) {
  if (item === "a3_chips") {
    if (S.f.a3_soundcheck) { await say("Another? I'm full. Almost.", "a3_gus"); return; }
    RP.take("a3_chips");
    await lines(["I hand Gus the bag. He opens it with one finger. He eats one chip. He closes his eyes.", "@a3_gus ...Okay.", "He puts on his headphones. A hand goes up and something wakes up in the ceiling. A clap, at the desk. A clap in the booth. Both clap together, like old friends.",
      "@a3_gus Monitors. Up. Channel one: clap.", "A clap test. That's the test. I've been paying attention to the wrong things my entire life."]);
    S.f.a3_soundcheck = true; RP.sfx("success");
    await say("Gear's awake. Time to go to the booth.");
    return;
  }
  if (item === "a3_pickle") {
    if (!S.f.a3_soundcheck) { await say("Later. Chips first.", "a3_gus"); return; }
    if (S.f.a3_dj350) { await say("Done. Thank you for the pickle. Snack.", "a3_gus"); return; }
    RP.take("a3_pickle");
    await lines(["Gus holds the pickle up to the light, like a diamond. He takes a bite. He closes his eyes.", "@a3_gus ...Lost and found.", "He reaches under the desk and pulls out a dusty box: a Pioneer DJM-350.",
      "@a3_gus Lost since 2019. Found now.", "You want me to have it?", "@a3_gus Lose it again. Somewhere else."]);
    RP.setGear("mixer", "pioneer_djm_350"); S.f.a3_dj350 = true; RP.relight();
    await lines(["Pioneer DJM-350. A budget two-channel mixer, announced at Musikmesse 2010 next to my old CDJ-350. Two channels. Zero crackle. Zero vodka.", "Gus just gave me a mixer for a pickle. The market is a funny place."]);
    return;
  }
  if (item === "a3_rinds") { await lines(["Gus takes one sniff.", "@a3_gus No.", "It's the first full word I've gotten out of him all week. It's a word I'll treasure."]); return; }
  await say("Gus looks at it. It's not a snack. He doesn't say a word. He just looks.");
};

/* ====================================================================== Odessa */
A3.odessaTalk = async function (S) {
  if (!S.f.a3_thu3) {
    if (!S.f.a3_week) { await lines(["Anything else, Odessa?", S.f.a3_soundcheck ? "@a3_odessa Gus is awake. Booth. Set. In that order." : "@a3_odessa Gus. Snack. Booth. Set. In that order."]); return; }
    const left = A3.todoLeft(S);
    await say("Odessa. Where am I on the napkin?");
    if (left.length) { await say("Still on the list: " + left.join("; ") + ".", "a3_odessa"); await say("And do it before the anniversary. After that, nobody's counting.", "a3_odessa"); }
    else await say("You're done. Go home. Sleep. Come back Thursday. I want you rested and terrified.", "a3_odessa");
    return;
  }
  if (!S.f.a3_swapFound) { await lines(["@a3_odessa Go say hi to Kosmo. Say it once. And don't say 'big fan.' He hates that."]); return; }
  if (!S.f.a3_footageGot) {
    if (!S.f.a3_toldOdessa) {
      S.f.a3_toldOdessa = true;
      await lines(["Odessa. Brandon swapped my USB. It's full of Brandon.", "@a3_odessa Brandon? Brandon Shine? He's the biggest draw I've got. Bring me proof, not feelings.",
        "What kind of proof?", "@a3_odessa I got a camera behind the bar. A DVR in my office. Two-key rule: insurance. Nico has one key. Bex has the other.",
        "@a3_odessa They've been not speaking since March. Don't ask me why. It's a lemon thing. Good luck."]);
    } else await lines(["@a3_odessa Proof. Not feelings. Nico's key, Bex's key, the DVR. Go."]);
    return;
  }
  await lines(["@a3_odessa You've got something to show me?"]);
};
A3.odessaGive = async function (S, item) {
  if (item === "a3_footage") { await A3.footageToOdessa(S); return; }
  if (item === "a3_chips" || item === "a3_pickle" || item === "a3_rinds") { await say("Odessa doesn't eat on the floor. And she doesn't take gifts. She takes bodies, in a line, with ID.", "a3_odessa"); return; }
  await say("Odessa looks at it, then at me. 'Is it money?' 'No.' 'Then I don't want it.'");
};
A3.footageToOdessa = async function (S) {
  if (S.f.a3_brandonDone) { await say("It's over. Brandon's been dealt with. Odessa's still holding the clip like it's a very small, very guilty child."); return; }
  await lines(["@a3_odessa A clip? ...Show me.", "She watches it. The hug. The pat. The swap. The yawn.", "@a3_odessa ...Brandon. BRANDON. Here. Now."]);
  AC("a3_brandon").expr = "worried";
  await RP.npcWalk("a3_brandon", 170, 226, "left");
  await A3.confrontBrandon(S, true);
};

/* ====================================================================== Brandon */
A3.brandonTalk = async function (S) {
  if (!S.f.a3_thu3) { await lines(["@a3_brandon Cute set. Cute. I don't mean it. I mean, I mean it, but not the way you want."]); return; }
  if (S.f.a3_brandonDone) { await lines(["@a3_brandon I have nothing to say to you. Or to your tiny face."]); return; }
  if (!S.f.a3_swapFound) { await lines(["@a3_brandon Having fun? Six months. They grow up so fast. Break a leg."]); return; }
  if (S.f.a3_footageGot) { await A3.confrontBrandon(S); return; }
  await lines(["You swapped my USB.", "@a3_brandon What? A USB? I don't touch USBs. I use hard drives. Fancy ones. Why would I touch your cheap thing?",
    "You gave Gus a pretzel.", "@a3_brandon Pretzel? That's a free country, and I'm a generous man. Move along. I've got a Saturday to protect."]);
};
A3.brandonGive = async function (S, item) {
  if (item === "a3_footage") { await A3.confrontBrandon(S); return; }
  await say("I don't want to give Brandon anything. Except a long, long look.");
};
A3.confrontBrandon = async function (S, withOdessa) {
  if (S.f.a3_brandonDone) return;
  if (!S.f.a3_footageGot) { await say("I'd need proof. A clip. Otherwise it's my word against a gold vest."); return; }
  if (!withOdessa) {
    await lines(["Brandon. Walk with me.", "@a3_brandon Why? I'm busy. I'm hydrating."]);
    await RP.npcWalk("a3_odessa", 180, 226, "right");
  }
  await lines(["@a3_odessa ...Explain the yawn. I want to hear him explain the yawn.", "@a3_brandon That's not me. It's a lookalike. It's a very handsome lookalike. It's a plot to frame me!"]);
  AC("a3_brandon").expr = "angry";
  const res = await A3.mg("clubDrama", { scenario: "rival", rival: "DJ Brandon Shine", venue: "Halcyon Room", boss: "Odessa", difficulty: 2 }, {
    giveUp: "Back off", tries: 2,
    onFail: async () => { await lines(["@a3_brandon You can't prove I meant it! It's entrapment! It's a hug!", "Try again. Stay calm. Let him dig."]); },
    assist: async () => { await say("Odessa pulls the plug on the argument: 'Brandon, the clip's got your face, your vest, and a very bad yawn.'", "kid"); } });
  if (res.giveUp) { await say("I'll come back with the clip. Nobody leaves the building. Odessa makes sure of it."); return; }
  S.f.a3_brandonDone = true; S.f.a3_usbBack = true; RP.relight();
  if (RP.has("a3_footage")) RP.take("a3_footage");
  RP.followers(15);
  await lines(["@a3_brandon Fine. FINE. Here. Your USB. It was a joke. A prank. A harmless, extremely illegal prank.", "He slaps my real USB into my palm and unwraps a blue-and-gold one from his pocket like a trophy.",
    "@a3_odessa Brandon. My office. Now. We're discussing your Saturday.", "@a3_brandon You can't do that! It's MY Saturday!", "@a3_odessa It's a Saturday. I'm the one who has it.",
    "He storms off, gold vest flapping like a very expensive bird."]);
  S.f.a3_brandonGone = true;
  AC("a3_brandon").vis = () => false;
  await lines(["@a3_odessa Kosmo's about to wrap. Go to the booth. Be ready.", "I'm ready. I'm so ready. I'm terrified. It's the same feeling."]);
  RP.setClock("THU 11:50 PM");
};

/* ====================================================================== Kosmo */
A3.kosmoTalk = async function (S) {
  if (!S.f.a3_thu3) return;
  await lines(["@a3_kosmo Wendell. Don't talk to me while I'm working.", "It's \"" + (S.name || "...") + "\"... never mind. Good luck."]);
};

/* ====================================================================== the bartenders, the feud, the bar record player */
A3.nicoTalk = async function (S) {
  if (!S.f.a3_week) {
    await lines(["Hi. Can I get a water?", "@a3_nico On the house. Tell Bex she's the reason it's lukewarm.", "She's right there.", "@a3_nico I know where she is."]); return;
  }
  await say("What'll it be? I'm not speaking to her. Neither is she. So it's just us.", "a3_nico");
  await RP.convo([
    { text: "What happened between you two?", when: S2 => !S2.f.a3_feudKnown, run: async () => { S.f.a3_feudKnown = true; await lines(["@a3_nico The lemon incident. March. I cut lemons into wedges. She says wheels. We haven't spoken since.", "Over lemons?", "@a3_nico It's never about the lemons. It's about wedges."]); } },
    { text: "What do you listen to when you're not angry?", when: S2 => !!S2.f.a3_swapFound && !S2.f.a3_feudOver, run: () => lines(["@a3_nico ...Sylvester. 'You Make Me Feel (Mighty Real).' Don't tell her. She thinks I only like opera.", "I'll keep it to myself."]) },
    { text: "Can you open the bar-cam DVR for me?", when: S2 => !!S2.f.a3_swapFound && !S2.f.a3_feudOver, run: () => lines(["@a3_nico The DVR needs two keys: mine and Bex's, turned at the same time.", "@a3_nico We haven't been in the same room voluntarily since March. Ask her. Don't ask her. Ask her."]) },
    { text: "Tell Bex the limes are in the walk-in.", when: S2 => !S2.f.a3_feudOver, run: () => lines(["I'll tell her. ...She heard you. She says she knows.", "@a3_nico She says she KNOWS? Tell her I know she knows."]) },
    { text: "Never mind.", end: true }
  ]);
};
A3.bexTalk = async function (S) {
  if (!S.f.a3_week) {
    await lines(["Hi. A water?", "@a3_bex Sure. And tell Nico the ice machine is HIS now. I've given up.", "He's right there.", "@a3_bex I know where he is."]); return;
  }
  await say("Don't speak to me about him. Order or leave.", "a3_bex");
  await RP.convo([
    { text: "What happened between you two?", when: S2 => !S2.f.a3_feudKnown, run: async () => { S.f.a3_feudKnown = true; await lines(["@a3_bex He cut lemons into wedges. Wedges. For a Collins. It's a wheel drink.", "That's it?", "@a3_bex That's the tip of it."]); } },
    { text: "What do you listen to when you're not angry?", when: S2 => !!S2.f.a3_swapFound && !S2.f.a3_feudOver, run: () => lines(["@a3_bex ...Sylvester. 'Mighty Real.' Don't tell Nico. He thinks I only listen to drill.", "I'll take it to my grave. Or to a record player."]) },
    { text: "Can you open the bar-cam DVR for me?", when: S2 => !!S2.f.a3_swapFound && !S2.f.a3_feudOver, run: () => lines(["@a3_bex Two keys. Mine and Nico's. At the same time. I'd rather swallow mine.", "@a3_bex Find a way to make him laugh first. I'll think about it. I won't."]) },
    { text: "Tell Nico the ice machine's his now.", when: S2 => !S2.f.a3_feudOver, run: () => lines(["I'll tell him. ...He heard you. He says it's always been his.", "@a3_bex It was always mine. Tell him I'll never forgive him."]) },
    { text: "Never mind.", end: true }
  ]);
};
A3.barGive = async function (S, who, item) {
  await say(who === "nico" ? "Nico looks at it. 'Not for me. Try the other one.' He doesn't look at Bex." : "Bex looks at it. 'Not for me.' She doesn't look at Nico.", who === "nico" ? "a3_nico" : "a3_bex");
};

const BAR_PICKS = ["phuture_acid_tracks", "cece_peniston_finally", "mood_ii_swing_closer", "sylvester_you_make_me_feel_mighty_real", "inner_city_good_life", "crystal_waters_gypsy_woman"];
A3.barPlayer = async function (S) {
  if (!S.f.a3_swapFound) { await say("A house rule: vinyl on the bar before doors. Nobody's put anything on yet. I'm not going to be the first. Not yet."); return; }
  if (S.f.a3_feudOver) { await say("It's playing already. Nico and Bex are not looking at each other. For the first time, that's because they're laughing."); return; }
  const owned = BAR_PICKS.filter(id => RP.hasRecord(id));
  const opts = owned.map(id => { const r = RP.rec(id); return r.artist + ": " + r.title.replace(/ \(.*\)/, ""); }).concat("Never mind");
  await say("The bar's record player. Everybody's guilty about something. Let me put on something that fits.");
  const i = await RP.choose(opts);
  if (i >= owned.length) return;
  const id = owned[i], r = RP.rec(id);
  let lp = null;
  try { lp = RP.audio && RP.audio.recordLoop ? RP.audio.recordLoop(r, { volume: 0.5 }) : null; if (lp && lp.start) lp.start(); } catch (e) { lp = null; }
  const stop = () => { try { if (lp && lp.stop) lp.stop(0.4); } catch (e) { /* ignore */ } };
  if (id !== "sylvester_you_make_me_feel_mighty_real") {
    const wrong = {
      phuture_acid_tracks: ["@a3_nico Turn it off. I haven't eaten.", "@a3_bex It's a cry for help."],
      cece_peniston_finally: ["@a3_nico It's lovely. It's not it.", "@a3_bex Almost. Not it."],
      mood_ii_swing_closer: ["@a3_nico A closer, at the start of the night? Bold.", "@a3_bex Nice. Wrong record."],
      inner_city_good_life: ["@a3_bex Good life? I'd like one.", "@a3_nico Don't agree with her. Don't."],
      crystal_waters_gypsy_woman: ["@a3_nico Lovely. Not it.", "@a3_bex Hm. Not it."]
    }[id] || ["@a3_nico Nice.", "@a3_bex Not it."];
    await RP.wait(1200); stop();
    await lines(wrong.concat(["They both stand there, not looking at each other. It's not the one. They both know the one."]));
    return;
  }
  // the right one: both bartenders freeze, then thaw
  AC("a3_nico").face = "right"; AC("a3_bex").face = "left";
  await RP.wait(900);
  await lines(["Both bartenders stop. A glass is held in mid-polish. A hand freezes on a bottle.", "@a3_nico ...", "@a3_bex ..."]);
  AC("a3_nico").act = "dance"; AC("a3_bex").act = "dance";
  await RP.wait(1600);
  await lines(["@a3_nico You like this?", "@a3_bex ...Since I was nine.", "@a3_nico Me too. I didn't want you to know.", "@a3_bex I didn't want YOU to know."]);
  await RP.wait(600);
  await lines(["@a3_nico Wedges. Fine. Wedges AND wheels.", "@a3_bex I'll cut wheels. You cut wedges. We'll never speak of this.", "They shake on it and laugh, which is when I realize they've never laughed in front of me before."]);
  await RP.wait(500); stop();
  AC("a3_nico").act = "stand"; AC("a3_bex").act = "stand"; AC("a3_nico").face = "front"; AC("a3_bex").face = "front";
  S.f.a3_feudOver = true;
  RP.give("a3_key_nico"); RP.give("a3_key_bex");
  await lines(["@a3_nico You need the DVR? Take my key. Odessa's rule: both keys, both people.", "@a3_bex And mine. Don't lose them. Please don't make it weird.", "Two keys on lanyards. I'm now a keeper of a ceasefire."]);
  RP.sfx("success");
};
})();
