/* Act 1 — characters (ids prefixed a1_). Recurring cast (lou, dante, ray) lives in src/data/cast.js.
   Everyone gets a distinct silhouette and a voice color. */
(function () {
"use strict";
const RP = window.RP;
const def = (id, d) => RP.chars.define(id, d);

/* Smitty: stoop philosopher, "package" courier. Beanie, shades, hoodie, never moves. */
def("a1_smitty", { name: "Smitty", height: 94, build: "average", skin: "#8d5a3b", hair: { style: "short", color: "#1c1418" }, facial: "goatee", facialColor: "#2a2028",
  top: { style: "hoodie", color: "#4c6a58", color2: "#efeaf6" }, bottom: { style: "track", color: "#1c1a24" }, shoes: { style: "sneakers", color: "#d8d4e4" },
  acc: ["beanie", "shades", "chain"], hatColor: "#c0302c", voice: "#9ad0ff" });
/* Sal: Sal's Pizza. Apron, mustache, paper hat, opinions. */
def("a1_sal", { name: "Sal", height: 92, build: "stocky", skin: "#e0a27a", hair: { style: "short", color: "#9a9aa6" }, facial: "mustache", facialColor: "#7a7a86",
  top: { style: "apron", color: "#c0302c", apron: "#efeaf6" }, bottom: { style: "pants", color: "#2a2836" }, shoes: { style: "shoes", color: "#17131f" },
  acc: ["cap"], hatColor: "#efeaf6", voice: "#ffb070" });
/* Ali: the bodega counter. Runs the block. */
def("a1_ali", { name: "Ali", height: 94, build: "average", skin: "#c98a62", hair: { style: "short", color: "#1c1418" }, facial: "beard", facialColor: "#2a2028",
  top: { style: "polo", color: "#2f5a96" }, bottom: { style: "pants", color: "#3a3648" }, shoes: { style: "sneakers", color: "#efeaf6" },
  acc: ["apron", "glasses"], voice: "#8affc8" });
/* Brenda: Facilities & Compliance, Synergex. Guards the supply closet like a dragon guards a lease. */
def("a1_brenda", { name: "Brenda", height: 92, build: "average", figure: "curvy", skin: "#6e4329", hair: { style: "bun", color: "#8a8696" },
  top: { style: "cardigan", color: "#8a5aa0", color2: "#efeaf6" }, bottom: { style: "skirt", color: "#2a2836" }, shoes: { style: "shoes", color: "#17131f" },
  acc: ["glasses", "lanyard", "clipboard"], glassesColor: "#ff6cbb", voice: "#7ae0d0" });
/* Synergex office people */
def("a1_dev", { name: "Dev", height: 96, build: "thin", skin: "#b07650", hair: { style: "messy", color: "#1c1418" },
  top: { style: "hoodie", color: "#3a4a7a", color2: "#efeaf6" }, bottom: { style: "jeans", color: "#2a2836" }, shoes: { style: "sneakers", color: "#efeaf6" },
  acc: ["headphones", "lanyard"], headphonesOn: true, voice: "#c0e0a0" });
def("a1_marge", { name: "Marge", height: 88, build: "average", figure: "curvy", skin: "#f1c7a5", hair: { style: "curly", color: "#d8d0c0" },
  top: { style: "cardigan", color: "#d8a090", color2: "#efeaf6" }, bottom: { style: "pants", color: "#4a5a6a" }, shoes: { style: "shoes", color: "#3a2418" },
  acc: ["glasses", "lanyard"], voice: "#ffd8a0" });
def("a1_greg", { name: "Greg", height: 100, build: "big", skin: "#f1c7a5", hair: { style: "short", color: "#7a4a2a" }, facial: "mustache", facialColor: "#6a3a1a",
  top: { style: "suit", color: "#5a5a6a", color2: "#efeaf6", tie: true, tieColor: "#c0302c" }, bottom: { style: "pants", color: "#3a3a4a" }, shoes: { style: "shoes", color: "#17131f" },
  acc: ["lanyard"], voice: "#c8c8e8" });
def("a1_yuki", { name: "Yuki", height: 90, build: "thin", skin: "#f1c7a5", hair: { style: "bob", color: "#1c1418" },
  top: { style: "shirt", color: "#efeaf6" }, bottom: { style: "pants", color: "#2a2836" }, shoes: { style: "shoes", color: "#c0302c" },
  acc: ["glasses", "lanyard"], glassesColor: "#39d0ff", voice: "#b0e0ff" });
/* Tank: the door at Nowhere. Fills a doorway. Has not eaten since noon. */
def("a1_tank", { name: "Tank", height: 108, build: "big", skin: "#57331f", hair: { style: "bald", color: "#1c1418" }, facial: "stubble", facialColor: "#2a1a12",
  top: { style: "bomber", color: "#0e0c14", color2: "#c0302c" }, bottom: { style: "pants", color: "#17131f" }, shoes: { style: "boots", color: "#17131f" },
  acc: ["shades", "earring", "watch"], voice: "#ff6a6a" });
/* Nowhere bartenders + regulars */
def("a1_mia", { name: "Mia", height: 92, build: "thin", figure: "curvy", skin: "#e8b48f", hair: { style: "mohawk", color: "#39d0ff" },
  top: { style: "tank", color: "#17131f" }, bottom: { style: "jeans", color: "#17131f" }, shoes: { style: "boots", color: "#17131f" },
  acc: ["earring", "apron"], voice: "#39d0ff" });
def("a1_rafa", { name: "Rafa", height: 97, build: "average", skin: "#c98a62", hair: { style: "curly", color: "#1c1418" }, facial: "beard", facialColor: "#1c1418",
  top: { style: "tee", color: "#c0302c" }, bottom: { style: "jeans", color: "#21416f" }, shoes: { style: "sneakers", color: "#17131f" },
  acc: ["apron", "chain"], voice: "#ff9a4a" });
def("a1_twig", { name: "Twig", height: 100, build: "thin", skin: "#e8b48f", hair: { style: "messy", color: "#e0a030" },
  top: { style: "tee", color: "#ffd23f", print: "logo", color2: "#17131f" }, bottom: { style: "cargo", color: "#3a4a3a" }, shoes: { style: "sneakers", color: "#efeaf6" },
  acc: ["bucket"], hatColor: "#39d0ff", voice: "#c0ff8a" });
def("a1_coco", { name: "Coco", height: 90, build: "average", figure: "curvy", skin: "#6e4329", hair: { style: "afro", color: "#1c1418" },
  top: { style: "bomber", color: "#a05cff", color2: "#ff3fa4" }, bottom: { style: "skirt", color: "#17131f", tights: "#17131f" }, shoes: { style: "boots", color: "#ff3fa4" },
  acc: ["earring", "shades"], voice: "#ffb26a" });
def("a1_hank", { name: "Old Hank", height: 88, build: "stocky", skin: "#e0a27a", hair: { style: "short", color: "#e8e0d0" }, facial: "beard", facialColor: "#e8e0d0",
  top: { style: "vest", color: "#3a4a3a", color2: "#efeaf6" }, bottom: { style: "pants", color: "#4a4a5a" }, shoes: { style: "shoes", color: "#3a2418" },
  acc: ["glasses"], voice: "#d0d0d8" });
/* subway busker */
def("a1_busker", { name: "Busker", height: 94, build: "average", skin: "#b07650", hair: { style: "afro", color: "#1c1418" },
  top: { style: "hoodie", color: "#c0302c", color2: "#efeaf6" }, bottom: { style: "jeans", color: "#2a2836" }, shoes: { style: "boots", color: "#3a2418" },
  acc: ["headphones"], headphonesOn: false, voice: "#ffb03a" });

/* anonymous door-line and floor people (stable looks) */
const rnd = (id, seed, o) => def(id, Object.assign(RP.chars.random(seed, o || {}), { id, name: "partygoer" }));
["a1_q1", "a1_q2", "a1_q3"].forEach((id, i) => rnd(id, 41 + i * 7));
["a1_f1", "a1_f2", "a1_f3", "a1_f4"].forEach((id, i) => rnd(id, 71 + i * 5));
})();
