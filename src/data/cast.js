/* Recurring cast. Fictional characters appear across several levels, so they live here.
   Each act may restyle them with RP.chars.update(id, {...}) in its setup().
   Real-DJ cameo characters use ids "dj_<lore id>" and are defined by the act that uses them. */
(function () {
"use strict";
const RP = window.RP;
const def = (id, d) => RP.chars.define(id, d);

// Lou, 4B. Cranky neighbor, went out every Saturday in 1993. Owner of a secret.
def("lou", { name: "Lou", height: 90, build: "big", skin: "#c98a62", hair: { style: "bald", color: "#9a9aa6" }, facial: "mustache", facialColor: "#b8b8c4",
  top: { style: "cardigan", color: "#7a5a3a", color2: "#efe6d0" }, bottom: { style: "pants", color: "#4a4a5a" }, shoes: { style: "shoes", color: "#3a2418" }, acc: ["glasses"], voice: "#9be15d" });
// Dante. Runs Nowhere. Always pays you next week.
def("dante", { name: "Dante", height: 100, skin: "#8d5a3b", hair: { style: "buzz", color: "#1c1418" }, facial: "goatee",
  top: { style: "bomber", color: "#1c1a24", color2: "#ff3fa4" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: ["chain"], voice: "#ff8fcf" });
// Ray. Owns Deep Cuts. Knows everything, sells you nothing you don't need.
def("ray", { name: "Ray", height: 94, build: "stocky", skin: "#f1c7a5", hair: { style: "short", color: "#9a9aa6" }, facial: "beard", facialColor: "#c8c8d0",
  top: { style: "shirt", color: "#5a7a4a" }, bottom: { style: "jeans", color: "#21416f" }, shoes: { style: "boots", color: "#5a3424" }, acc: ["glasses"], voice: "#ffd27a" });
// Marcus. Your best friend. Always "plus three" on the guest list.
def("marcus", { name: "Marcus", height: 98, skin: "#6e4329", hair: { style: "afro", color: "#1c1418" },
  top: { style: "tee", color: "#ffd23f", print: "logo", color2: "#17131f" }, bottom: { style: "cargo", color: "#3a5a3a" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: ["bag"], voice: "#ffd23f" });
// Kosmo Delacroix. Legendary DJ. Has never once remembered your name.
def("kosmo", { name: "Kosmo Delacroix", height: 102, build: "thin", skin: "#e8b48f", hair: { style: "long", color: "#e8e0d0" },
  top: { style: "coat", color: "#2a1c3a", color2: "#c0302c" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "boots", color: "#17131f" }, acc: ["shades", "chain"], voice: "#c8b0ff" });
// Eddie Two-Times. Sells gear out of a van. Every deal is "a two-time deal."
def("eddie", { name: "Eddie Two-Times", height: 92, build: "stocky", skin: "#e0a27a", hair: { style: "slick", color: "#1c1418" }, facial: "stubble",
  top: { style: "jacket", color: "#5a3424", color2: "#c8925a" }, bottom: { style: "track", color: "#17131f" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: ["chain", "earring"], voice: "#ff9a5a" });
// Twinkie. After-hours regular. Knows everyone, remembers everything, sleeps never.
def("twinkie", { name: "Twinkie", height: 90, figure: "curvy", skin: "#b07650", hair: { style: "bob", color: "#c8b0ff" },
  top: { style: "mesh", color: "#17131f" }, bottom: { style: "skirt", color: "#ff3fa4" }, shoes: { style: "boots", color: "#17131f" }, acc: ["shades", "earring"], voice: "#ff6cbb" });
// Axl Vanta. Superstar DJ. Ego visible from space.
def("axl", { name: "Axl Vanta", height: 104, skin: "#f1c7a5", hair: { style: "mohawk", color: "#ffd23f" },
  top: { style: "tank", color: "#efeaf6" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "sneakers", color: "#ffd23f" }, acc: ["shades", "chain", "headphones"], headphonesOn: false, voice: "#ffd23f" });
// Jess. Your ex. Owner of Mr. Whiskers.
def("jess", { name: "Jess", height: 92, figure: "curvy", skin: "#e8b48f", hair: { style: "ponytail", color: "#a8743e" },
  top: { style: "hoodie", color: "#7a3fb0" }, bottom: { style: "jeans", color: "#2f5a96" }, shoes: { style: "sneakers", color: "#efeaf6" }, acc: [], voice: "#d0a8ff" });
})();
