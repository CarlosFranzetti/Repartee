/* Act 1 — home hooks used by the bedroom: door exit, laptop (load the USB), bed (sleep until Saturday),
   arrival lines at dusk and on Saturday. Flags: a1_usbLoaded, a1_sat, a1_homeEve, a1_satHome. */
(function () {
"use strict";
const RP = window.RP;
const A1 = RP.a1;

/* ---- the bedroom door: hall, stairs, the rest of New York ---- */
RP.act1DoorExit = S => {
  if (!S.f.a1_texts) return "My phone's at 1%. It's my lifeline, my alarm and my flashlight, and I'm not going anywhere with it dying. The charger's in this room somewhere.";
  if (S.f.time === "night" && !S.f.a1_booked) return RP.act1DanteBlock(S, true);
  if (S.f.time === "morning" && S.f.a1_acidUnder) return "Acid Tracks is still under the mattress. I'm not leaving it for the dust bunnies. I should pick it up first.";
  if (S.f.time === "sat") return { room: "a1_hall", x: 566, y: 232, face: "left" };
  return { room: "a1_hall", x: 566, y: 232, face: "left" };
};

/* ---- laptop: copy tracks onto the new USB ---- */
async function loadTracks(S) {
  await RP.walkTo(142, 222, "back");
  await RP.lines(["Okay. Plug in the Synergex stick. New folder: SATURDAY.", "Dante said no laptop in the booth. The laptop can stay home and do the heavy lifting."]);
  const i = await RP.choose(["Soulful warm-up, then house", "All peak, all night", "A little of everything (the safe one)"]);
  const pool = [
    ["Inner City, \"Good Life.\" The soul in my soul-less folder structure.", "Crystal Waters, \"Gypsy Woman.\" Hands in the air, a 1991 requirement."],
    ["Black Box, \"Ride On Time.\" Robin S, \"Show Me Love.\" Subtlety is for the first hour.", "If the floor's empty, I'm going to blame the floor."],
    ["Inner City, Robin S, Black Box, Crystal Waters. Four tracks that have never let me down.", "Safe is a strategy. Dante said \"don't be late,\" he didn't say \"be brave.\""]
  ][i];
  RP.sfx("typing");
  await RP.say("Copying...");
  await RP.wait(500);
  await RP.lines(pool);
  S.f.a1_usbLoaded = true; RP.refreshInv(); RP.sfx("success");
  await RP.lines(["Done. 64 gigs of music on a stick I stole from a temp office.", "First hour: vinyl. Second hour: this. I'm a real DJ with a real plan, and a USB with someone else's logo on it."]);
}
RP.act1LaptopUse = async S => {
  if (RP.has("a1_usb") && !S.f.a1_usbLoaded) { await loadTracks(S); return; }
  if (RP.has("a1_usb")) return "The USB's loaded. I'm not touching it again. It's a good folder.";
  if (RP.has("a1_usb3")) return "I should crack open the 3-pack first. Then I'll have a USB to copy onto.";
  return S.f.a1_booked ? "Tracks onto a USB for Saturday. Which needs a USB with room on it." : "My whole music library is in there. The CD-Rs in the decks came out of this thing.";
};

/* ---- the bed: Wednesday dusk -> Saturday night ---- */
async function sleepToSaturday(S) {
  if (!S.f.a1_usbLoaded) { await RP.lines(["Not yet. If I fall asleep now, Saturday-me wakes up with a blank USB and a lot of feelings.", S.f.a1_usb || RP.has("a1_usb") ? "The tracks go on the stick first. The laptop's right there." : "I still need a USB. A real one. Midtown had a closet full of them."]); return; }
  if (!S.f.a1_closer) { await RP.lines(["Hold on. Four records for the vinyl hour, and I'm counting three. I need a closer.", "Deep Cuts. The dollar bin. Ray's going to enjoy this."]); return; }
  await RP.walkTo(100, 222, "back");
  await RP.lines(["Everything's ready: records, USB, a flyer. All that's left is Saturday.", "Sleeping is the only free way to make Saturday come faster."]);
  await RP.fadeTo(1, 900);
  await RP.say("Thursday. Friday. Somewhere in there, rent was due. The landlord slid a note under the door. It says \"ha.\"", "nar");
  A1.setTime(S, "sat", "SAT 7:48 PM");
  S.f.a1_sat = true; S.f.a1_lampOff = false; S.f.battery = "100%"; RP.refreshInv();
  RP.unlock("a1_loc_nowhere");
  const k = RP.actor("kid"); k.x = 120; k.y = 224; k.face = "front";
  await RP.fadeTo(0, 900);
  RP.text("DANTE (NOWHERE)", "10pm. dont be late. tank's on the door. ur not on the list. bring the flyer");
  await RP.lines(["Saturday. 7:48 PM. I feel like a person who slept through two days.", "Four records. A stolen USB. A flyer with my name spelled wrong. Time to go be late on time."]);
}
RP.act1BedUse = async S => {
  if (S.f.time === "sat") { await RP.say("It's Saturday night. Sleep is for people without a gig."); return true; }
  if (S.f.time === "evening") { await sleepToSaturday(S); return true; }
  return false;
};

/* ---- arriving home ---- */
RP.act1BedroomEnter = async (S, from) => {
  if (from === "a1_hall" && S.f.time === "evening" && !S.f.a1_homeEve) {
    S.f.a1_homeEve = true;
    RP.text("MARCUS", "heard u got nowhere?!! put me + 3 on the list. + my cousin. thats 5 its fine");
    await RP.lines(["Home. Dusk. A USB I stole, a record I paid two dollars for, and a flyer with my name misspelled.", S.f.a1_usbLoaded ? "Tracks are on the stick already. So: sleep until Saturday." : "Next: tracks on the new USB. The laptop's on the bed. Then I sleep until Saturday, which is how rich people do it, and also broke people."]);
  }
  if (from === "a1_hall" && S.f.time === "sat" && !S.f.a1_satHome) { S.f.a1_satHome = true; }
};
})();
