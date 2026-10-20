// Readability check: every visible piece of DOM text in the main views and every mini-game, measured
// against what is actually behind it (background colours composited up the tree, opacity included).
// Flags text under WCAG AA: 4.5:1, or 3:1 for large text (24px+, or 18.66px+ bold). Text drawn on a
// canvas, or sitting over one, can't be measured from the DOM and is skipped.
// usage: node tests/contrast.mjs [--page dist/index.html] [--all]   (--all lists every failure, not just the worst per view)
import { createRequire } from "module";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const pi = args.indexOf("--page");
const page0 = path.resolve(pi >= 0 ? args[pi + 1] : path.join(root, "dist/index.html"));

const AUDIT = () => {
  const parse = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ""); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const over = (top, under) => { const a = top[3]; return [0, 1, 2].map(i => top[i] * a + under[i] * (1 - a)); };
  const out = [];
  const seen = new Set();
  for (const el of document.querySelectorAll("body *")) {
    if (!el.offsetParent && getComputedStyle(el).position !== "fixed") continue;
    const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(" ");
    if (!own) continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden") continue;
    // backgrounds from the element upward until one is opaque; stop if a canvas or image sits behind
    const layers = []; let op = 1, e = el, unknown = false;
    while (e && e !== document.documentElement) {
      const s = getComputedStyle(e);
      op *= parseFloat(s.opacity);
      if (s.backgroundImage && s.backgroundImage !== "none") { const m = /rgba?\([^)]+\)/.exec(s.backgroundImage); if (m) layers.push(parse(m[0])); else { unknown = true; break; } }
      const c = parse(s.backgroundColor); if (c && c[3] > 0) layers.push(c);
      if (layers.length && layers[layers.length - 1][3] >= 1) break;
      if (e.parentElement && [...e.parentElement.children].some(k => k !== e && (k.tagName === "CANVAS" || k.tagName === "IMG") && k.getBoundingClientRect().width > r.width / 2)) { unknown = true; break; }
      e = e.parentElement;
    }
    if (unknown) continue;
    let bg = [0, 0, 0];
    const body = parse(getComputedStyle(document.body).backgroundColor); if (body) bg = body.slice(0, 3);
    for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg);
    let fg = parse(cs.color); if (!fg) continue;
    fg = over([...fg.slice(0, 3), fg[3] * op], bg);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    const cr = ratio(fg, bg);
    if (cr < need) {
      const key = own.slice(0, 40) + "|" + cs.color;
      if (seen.has(key)) continue; seen.add(key);
      const sel = el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "");
      out.push({ text: own.slice(0, 48), ratio: Math.round(cr * 100) / 100, need, sel, color: cs.color, size, op: Math.round(op * 100) / 100, disabled: !!el.closest("[disabled]") });
    }
  }
  return out.sort((a, b) => a.ratio - b.ratio);
};

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errs = [];
p.on("pageerror", e => errs.push(e.message));
await p.goto("file://" + page0);
await p.waitForTimeout(500);
const report = {};
report.title = await p.evaluate(AUDIT);

// the game: verbs, inventory, sentence line, a dialogue choice list, a card, the phone menu, the crate
await p.evaluate(async () => { const RP = window.RP; document.querySelectorAll("#title").forEach(e => e.remove()); RP.hideGame(false); RP.layout(); RP.reset(); RP.test.setFast(true); await RP.startAct(2, { noCard: true, noIntro: true }); RP.test.setFast(false); });
await p.waitForTimeout(400);
report.game = await p.evaluate(AUDIT);
await p.evaluate(() => { window.RP.choose(["First option", "Second option", "Third option"]); });
await p.waitForTimeout(200);
report.choices = await p.evaluate(AUDIT);
await p.evaluate(() => { document.querySelectorAll("#choices button")[0].click(); window.RP.card({ kicker: "LEVEL 2", title: "UNDERGROUND HUSTLER", sub: "Bed-Stuy", body: ["Body text of a card."], checks: [[true, "done thing"], [false, "missed thing"]] }); });
await p.waitForTimeout(200);
report.card = await p.evaluate(AUDIT);
await p.evaluate(() => { document.querySelectorAll("#overlays .overlay").forEach(o => o.remove()); window.RP.crateView(); });
await p.waitForTimeout(200);
report.crate = await p.evaluate(AUDIT);
await p.evaluate(() => { document.querySelectorAll("#overlays .overlay").forEach(o => o.remove()); window.RP.gearView(); });
await p.waitForTimeout(200);
report.gear = await p.evaluate(AUDIT);
await p.close();

// every mini-game's opening screen
const ids = await (async () => { const q = await browser.newPage(); await q.goto("file://" + page0); await q.waitForTimeout(300); const l = await q.evaluate(() => window.RP.mg.list().map(m => m.id)); await q.close(); return l; })();
for (const id of ids) {
  const q = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  q.on("pageerror", e => errs.push(id + ": " + e.message));
  await q.goto("file://" + page0); await q.waitForTimeout(300);
  await q.evaluate(id => { document.querySelectorAll("#title").forEach(e => e.remove()); window.RP.mg.play(id, { arcade: true, difficulty: 2 }); }, id);
  await q.waitForTimeout(1500);
  report["mg:" + id] = await q.evaluate(AUDIT);
  await q.close();
}
await browser.close();

let total = 0;
for (const [view, list] of Object.entries(report)) {
  total += list.length;
  if (!list.length) { console.log("ok    " + view); continue; }
  console.log("LOW   " + view + "  (" + list.length + ")");
  (args.includes("--all") ? list : list.slice(0, 6)).forEach(f => console.log("        " + f.ratio.toFixed(2) + " < " + f.need + "  " + JSON.stringify(f.text) + "  " + f.sel.slice(0, 60) + "  " + f.color + (f.op < 1 ? "  opacity " + f.op : "") + (f.disabled ? "  [disabled]" : "")));
}
console.log(total + " low-contrast text element(s)" + (errs.length ? "; page errors: " + errs.slice(0, 3).join(" | ") : ""));
process.exitCode = total ? 1 : 0;
