/* Act 1 — items picked up after the bedroom (the bedroom's own items live in 10_bedroom.js).
   Flags: a1_package (has/had it), a1_peeked, a1_delivered, a1_gotUSB, a1_usbLoaded, a1_flyer ... */
(function () {
"use strict";
const RP = window.RP;
const A1 = RP.a1;
const { R, P, ell, txt } = RP.u;
const I = RP.icons;

/* ---- Smitty's package ---- */
async function peek(S) {
  if (S.f.a1_peeked) { await RP.say("Oregano. I checked. It's still oregano."); return; }
  const smitty = RP.curRoom().id === "a1_stoop" && RP.actor("a1_smitty");
  S.f.a1_peeked = true; RP.refreshInv();
  RP.sfx("zip");
  await RP.lines([
    "He said no peeking. I'm a person of my word, for about nine seconds.",
    "I tear a corner. A smell hits me: pizza. Pizza with a grudge.",
    "Green flecks. Dried leaves. A pound of them, maybe two.",
    "It's oregano. It's OREGANO. I've been walking around like a felon, and I'm a spice courier.",
    "Okay. Nobody's going to jail. That's a relief and a little bit of an insult."
  ]);
  if (smitty) await RP.lines(["@a1_smitty I can HEAR that bag. I said no peeking.", "@a1_smitty It's oregano. Everybody peeks. Nobody's ever impressed."]);
}
A1.peek = peek;
RP.item("a1_package", { name: "Smitty's package", short: "Package",
  icon: (c, S) => { I.bag(c, "#c8a070"); R(c, 6, 11, 20, 2, "#e8e0d0"); R(c, 12, 5, 2, 17, "#e8e0d0"); R(c, 19, 5, 2, 17, "#e8e0d0"); if (S.f.a1_peeked) { R(c, 22, 8, 4, 3, "#5a9a4a"); P(c, 21, 7, "#3e7a36"); } }, iconKey: S => S.f.a1_peeked ? 1 : 0,
  useAlone: true,
  look: S => S.f.a1_peeked ? "A bag of oregano with a torn corner. Sal's gonna think a raccoon got to it." : "A brown paper bag, taped shut with half a roll of packing tape. DO NOT PEEK, twice, in marker. Smitty has trust issues.",
  use: peek, open: peek, pull: peek, push: "It gives a little. It crunches. Dry. Leafy. I'm not going to think about it.",
  pickup: "I already have it. Unfortunately." });

/* ---- Sal's slice ---- */
RP.item("a1_slice", { name: "Sal's slice", short: "Slice", icon: c => I.slice(c),
  look: "A pepperoni slice from Sal's on a paper plate, folded right. It's still warm. In New York a warm slice is currency.",
  use: "Eating it would be a victory for me and a loss for the story. I'm saving it.",
  open: "It's a slice. It's open. It's been open since 1959.", push: "I fold it harder. It folds. Slices are very cooperative." });

/* ---- stoop cans (the safety net: NYC always has cans) ---- */
RP.item("cans2", { name: "bag of cans (found)", short: "Cans",
  icon: c => { R(c, 5, 6, 22, 17, "#cfd2de"); R(c, 5, 6, 22, 1, "#ffffff"); [[8, "#e0a020"], [13, "#8a4ad8"], [18, "#3ab8d8"], [22, "#d83a3a"]].forEach(([x, col]) => { R(c, x, 11, 4, 9, col); R(c, x, 11, 4, 1, "#c0c0cc"); }); },
  look: "A second bag of empties, fished out of the stoop recycling. It's not stealing, it's... entrepreneurship.", use: "The can machine at the bodega is the only one who will talk to this." });

/* ---- Linda's popcorn ---- */
RP.item("a1_popcorn", { name: "Linda's popcorn", short: "Popcorn",
  icon: c => { R(c, 8, 3, 16, 20, "#d83a3a"); R(c, 8, 3, 16, 2, "#ffffff55"); R(c, 10, 8, 12, 8, "#ffd23f"); R(c, 11, 9, 10, 1, "#c0302c"); txt(c, "POP", 12, 11, "#c0302c"); [[10, 2], [14, 1], [19, 2], [22, 3]].forEach(([x, y]) => ell(c, x, y, 1, 1, "#fff6dc")); },
  look: "Microwave popcorn, extra butter. LINDA is written across it in Sharpie. The bag says PRESS POPCORN ONCE. Whoever wrote that has never been desperate.",
  use: "It needs a microwave. And, I guess, a bad idea.", open: "It's sealed. Honest popcorn doesn't want to be opened outside a microwave." });

/* ---- USB 3-pack -> a USB stick ---- */
RP.item("a1_usb3", { name: "USB 3-pack", short: "USB x3",
  icon: c => { R(c, 3, 4, 26, 17, "#e8e4f0"); R(c, 3, 4, 26, 2, "#3a63c8"); [0, 1, 2].forEach(i => { R(c, 6 + i * 8, 9, 5, 9, "#2a2836"); R(c, 7 + i * 8, 6, 3, 4, "#c8c4d8"); }); R(c, 3, 20, 26, 1, "#a8a4b8"); },
  useAlone: true,
  look: "Three USB sticks in a blister pack: SYNERGEX. SYNERGY. SYNERGIZE. Property of a company that has never once used them.",
  use: async S => {
    RP.take("a1_usb3"); RP.give("a1_usb");
    await RP.lines(["I crack open the blister pack. Three sticks. I keep one.", "The other two? Future problems. Future-me can steal his own."]);
  },
  open: S => RP.runH(RP.items.a1_usb3.use, S) });
RP.item("a1_usb", { name: S => S.f.a1_usbLoaded ? "USB stick (my tracks)" : "blank USB stick", short: "USB",
  icon: (c, S) => { I.usb(c, S.f.a1_usbLoaded ? "#3fa660" : "#3a63c8"); if (S.f.a1_usbLoaded) { R(c, 8, 11, 6, 1, "#ffffff"); R(c, 8, 13, 4, 1, "#ffffff"); } }, iconKey: S => S.f.a1_usbLoaded ? 1 : 0,
  look: S => S.f.a1_usbLoaded ? "64 GB of the tracks I actually trust. For the second hour, after the vinyl. Dante: \"No CDs, no laptop.\"" : "A clean 64 GB USB stick with SYNERGEX on it. Free as in \"borrowed.\"",
  use: S => S.f.a1_usbLoaded ? "It's loaded. Now it just has to stay in my pocket until Saturday." : "Needs tracks. That's what the laptop's for." });

/* ---- the flyer (name spelled wrong, on purpose) ---- */
RP.item("a1_flyer", { name: "Nowhere flyer", short: "Flyer", icon: c => I.flyer(c),
  look: S => "NOWHERE. SAT 10PM. Opening: " + A1.mangle(S.name) + ". That's... me. If I squint, and the squinting is aggressive.",
  use: "It's a flyer. It's proof, technically. Proof of what, though.", open: "It's flat. Flyers don't open. That's their whole thing." });
})();
