/* re:parteé — 32x24 inventory icon painters that items can reuse.
   Usage in an item: icon: c => RP.icons.record(c, "#ff8a4c") */
(function () {
"use strict";
const RP = window.RP;
const { R, P, ell, txt, hashStr, mulberry } = RP.u;
const I = RP.icons = {};

I.record = (c, label = "#ff8a4c", warp = false, sleeve = null) => {
  if (sleeve) { R(c, 2, 1, 22, 22, sleeve); R(c, 2, 1, 22, 1, "#ffffff22"); }
  const ox = sleeve ? 6 : 0;
  for (let dy = -10; dy <= 10; dy++) {
    const h = Math.round(Math.sqrt(100 - dy * dy));
    const off = warp ? Math.round(Math.sin((dy + 10) / 3) * 1.6) : 0;
    R(c, 16 + ox - h + off, 12 + dy, 2 * h + 1, 1, "#141218");
  }
  ell(c, 16 + ox, 12, 7, 7, "#24222c"); ell(c, 16 + ox, 12, 6, 6, "#141218");
  ell(c, 16 + ox, 12, 3, 3, label); P(c, 16 + ox, 12, "#000"); P(c, 12 + ox, 6, "#5a5668"); P(c, 13 + ox, 5, "#5a5668");
};
I.cd = (c, label = "#efeaff") => { ell(c, 16, 12, 10, 10, "#c8c4d8"); ell(c, 16, 12, 9, 9, "#e8e4f0"); ell(c, 13, 9, 3, 2, "#ffffff"); ell(c, 16, 12, 3, 3, "#8a86a0"); ell(c, 16, 12, 1, 1, "#141218"); R(c, 9, 16, 10, 2, label); };
I.usb = (c, body = "#3a63c8") => { R(c, 5, 8, 17, 9, body); R(c, 5, 8, 17, 1, "#ffffff55"); R(c, 22, 9, 6, 7, "#c8c4d8"); R(c, 24, 10, 1, 2, "#55516a"); R(c, 24, 13, 1, 2, "#55516a"); };
I.cash = (c, amt = "5") => { R(c, 3, 6, 26, 13, "#6ab86a"); R(c, 4, 7, 24, 11, "#4e9a52"); ell(c, 16, 12, 4, 4, "#8ad08a"); txt(c, amt, 16 - amt.length * 2, 10, "#1f4a24"); };
I.coins = c => { [[10, 14], [16, 11], [21, 15]].forEach(([x, y]) => { ell(c, x, y, 5, 3, "#a87a2a"); ell(c, x, y - 1, 5, 3, "#e0b84a"); P(c, x - 2, y - 2, "#fff0a0"); }); };
I.card = (c, col = "#2f62b8", text = "") => { R(c, 3, 5, 26, 15, col); R(c, 3, 5, 26, 1, "#ffffff55"); R(c, 6, 9, 6, 4, "#ffd23f"); if (text) txt(c, text, 14, 14, "#efeaf6"); };
I.key = (c, col = "#e0c870") => { ell(c, 9, 12, 5, 5, col); ell(c, 9, 12, 2, 2, "#00000000"); R(c, 13, 11, 14, 3, col); R(c, 22, 14, 2, 3, col); R(c, 26, 14, 2, 4, col); c.clearRect(8, 11, 3, 3); };
I.paper = (c, col = "#efe6d0", lines = "#55516a") => { R(c, 8, 2, 16, 21, col); R(c, 20, 2, 4, 4, "#c8c0b0"); for (let y = 7; y < 21; y += 3) R(c, 11, y, 10, 1, lines); };
I.flyer = (c, bg = "#1b1440", fg = "#ff3fa4") => { R(c, 7, 1, 18, 22, bg); ell(c, 16, 8, 5, 5, fg); R(c, 10, 15, 12, 2, fg); R(c, 11, 18, 10, 1, "#39d0ff"); };
I.ticket = (c, col = "#ffd23f") => { R(c, 3, 7, 26, 11, col); for (let y = 8; y < 17; y += 2) P(c, 9, y, "#00000055"); R(c, 12, 10, 14, 1, "#00000066"); R(c, 12, 13, 10, 1, "#00000066"); };
I.bag = (c, col = "#c8925a") => { R(c, 7, 7, 18, 16, col); R(c, 7, 7, 18, 2, "#00000033"); R(c, 11, 2, 2, 6, col); R(c, 19, 2, 2, 6, col); R(c, 11, 2, 10, 2, col); };
I.bottle = (c, col = "#cfe4ef", cap = "#c0302c") => { R(c, 12, 8, 9, 15, col); R(c, 14, 3, 5, 5, col); R(c, 14, 1, 5, 2, cap); R(c, 12, 13, 9, 4, "#efe6f6"); R(c, 13, 9, 1, 12, "#ffffff"); };
I.can = (c, col = "#d83a3a") => { R(c, 12, 4, 9, 17, col); R(c, 12, 4, 9, 2, "#c0c0cc"); R(c, 13, 6, 1, 13, "#ffffff88"); };
I.slice = c => { for (let i = 0; i < 16; i++) R(c, 6 + i, 4 + i * 0.5, 22 - i * 1.2, 1, i < 2 ? "#c8925a" : "#f2c84a"); [[12, 7], [17, 9], [14, 11]].forEach(([x, y]) => ell(c, x, y, 1, 1, "#c0302c")); };
I.phone = (c, on = true) => { R(c, 11, 1, 10, 22, "#1c1a24"); R(c, 12, 3, 8, 16, on ? "#39d0ff" : "#2a2836"); if (on) { R(c, 13, 5, 6, 2, "#ff3fa4"); R(c, 13, 9, 4, 2, "#efeaff"); } R(c, 15, 20, 2, 1, "#55516a"); };
I.headphones = (c, col = "#1c1a24") => { for (let i = 0; i <= 16; i++) { const y = 12 - Math.round(Math.sin(i / 16 * Math.PI) * 9); R(c, 8 + i, y, 1, 2, col); } R(c, 5, 11, 5, 8, col); R(c, 23, 11, 5, 8, col); R(c, 6, 12, 2, 6, "#55516a"); R(c, 24, 12, 2, 6, "#55516a"); };
I.cable = (c, col = "#efeaf6") => { R(c, 3, 7, 7, 8, col); for (let i = 0; i < 18; i++) P(c, 10 + i, 11 + Math.round(Math.sin(i / 2) * 3), col); };
I.box = (c, col = "#c8925a") => { R(c, 5, 6, 22, 16, col); R(c, 5, 6, 22, 2, "#ffffff33"); R(c, 14, 6, 4, 16, "#00000022"); };
I.clothes = (c, col = "#efeaf6") => { R(c, 8, 6, 16, 16, col); R(c, 3, 6, 6, 7, col); R(c, 23, 6, 6, 7, col); R(c, 13, 6, 6, 3, "#00000033"); };
I.towel = (c, col = "#5a8ad8") => { R(c, 6, 4, 20, 17, col); for (let y = 6; y < 20; y += 3) R(c, 6, y, 20, 1, "#ffffff44"); };
I.letter = (c, ch = "?", col = "#8c84b8") => { R(c, 6, 2, 20, 20, "#1c1930"); txt(c, ch, 14, 9, col, 1); };
I.generic = (c, id) => {
  const r = mulberry(hashStr(String(id)));
  const col = ["#ff3fa4", "#39d0ff", "#ffd23f", "#9be15d", "#ff8a4c", "#b394ff"][Math.floor(r() * 6)];
  R(c, 7, 3, 18, 18, "#1c1930"); R(c, 7, 3, 18, 1, col); txt(c, String(id)[0] || "?", 14, 9, col);
};
/* a record item icon from catalog data (sleeve colored by id) */
I.fromRecord = (c, recId, warp) => {
  const r = RP.rec(recId);
  const cv = document.createElement("canvas"); cv.width = 20; cv.height = 20;
  RP.sleeve(cv.getContext("2d"), r, 0, 0, 20);
  c.drawImage(cv, 2, 2);
  I.record(c, ["#ff8a4c", "#d8ff3a", "#39d0ff", "#ff3fa4", "#efeaf6"][hashStr(recId) % 5], warp, null);
};
})();
