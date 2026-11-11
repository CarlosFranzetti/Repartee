// Browser QA for re:parteé: layout across viewports, overlays, rotation, audio lifecycle, mini-game fit, long-run
// stability and the streaming patch. Drives the real UI (clicks/taps/keys); RP.test/RP.goto only to skip ahead.
//
//   node tests/browser.mjs --page <built game.html> [--out <dir>] [--only ui,rotate,audio,mg,long,stream] [--vp desktop,phoneL] [--long 60]
//
// Build your own copy first:  node tools/build.mjs --out /some/scratch/game.html
// Writes screenshots and results.json into --out and prints every finding as one line:
//   [bug|glitch|cosmetic|info] <viewport> <title> :: <evidence>
import { createRequire } from "module";
import path from "path";
import fs from "fs";
import os from "os";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const pageFile = opt("page") ? path.resolve(opt("page")) : null;
if (!pageFile) { console.error("usage: node tests/browser.mjs --page <game.html> [--out dir] [--only a,b] [--vp a,b] [--long secs]"); process.exit(2); }
const OUT = path.resolve(opt("out", path.join(os.tmpdir(), "repartee-browser")));
fs.mkdirSync(OUT, { recursive: true });
const only = (opt("only", "ui,rotate,audio,mg,long,stream")).split(",");
const LONG_SECS = +opt("long", 60);

const VPS = [
  { name: "desktop", w: 1280, h: 720 },
  { name: "laptop", w: 1366, h: 768, dsf: 1.25 },
  { name: "tablet", w: 1024, h: 768 },
  { name: "phoneL", w: 844, h: 390, mobile: true, dsf: 3 },
  { name: "phoneP", w: 390, h: 844, mobile: true, dsf: 3 }
];
const vpSel = opt("vp") ? opt("vp").split(",") : null;
const vps = VPS.filter(v => !vpSel || vpSel.includes(v.name));

const findings = [];
const add = (sev, vp, title, evidence, shot) => {
  findings.push({ sev, vp, title, evidence, shot: shot || null });
  console.log(`[${sev}] ${vp} ${title} :: ${typeof evidence === "string" ? evidence : JSON.stringify(evidence)}${shot ? " (" + shot + ")" : ""}`);
};
const wait = ms => new Promise(r => setTimeout(r, ms));

// -------------------------------------------------------------------------- page instrumentation
const INIT = `(() => {
  const Q = window.__qa = { iv: new Map(), ivMade: 0, ivCleared: 0, osc: new Set(), oscMade: 0, src: new Set(), rafCbs: 0, loopsLive: new Set(), loopsMade: 0 };
  const si = window.setInterval, ci = window.clearInterval;
  window.setInterval = function (fn, ms, ...a) { const id = si.call(window, fn, ms, ...a); Q.iv.set(id, { ms, at: ((new Error()).stack || '').split('\\n').slice(2, 4).map(s => s.trim().replace(/^at /, '')).join(' < ') }); Q.ivMade++; return id; };
  window.clearInterval = function (id) { if (Q.iv.delete(id)) Q.ivCleared++; return ci.call(window, id); };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = cb => raf(t => { Q.rafCbs++; cb(t); });
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
    const P = AC.prototype, co = P.createOscillator, cs = P.createBufferSource;
    P.createOscillator = function () {
      const o = co.call(this); const st = o.start.bind(o);
      o.start = function (...a) { if (!Q.osc.has(o)) { Q.osc.add(o); Q.oscMade++; o.addEventListener('ended', () => Q.osc.delete(o)); } return st(...a); };
      return o;
    };
    P.createBufferSource = function () {
      const s = cs.call(this); const st = s.start.bind(s);
      s.start = function (...a) { if (s.loop && !Q.src.has(s)) { Q.src.add(s); s.addEventListener('ended', () => Q.src.delete(s)); } return st(...a); };
      return s;
    };
  }
})();`;
// wrap RP.audio.recordLoop so loop handles can be counted (started and not yet stopped)
const WRAP_LOOPS = `(() => {
  const Q = window.__qa, a = window.RP.audio; if (a.__wrapped) return; a.__wrapped = true;
  const rl = a.recordLoop;
  a.recordLoop = (r, o) => { const h = rl(r, o); Q.loopsMade++; const s = h.start.bind(h), p = h.stop.bind(h);
    h.start = (...x) => { Q.loopsLive.add(h); return s(...x); }; h.stop = (...x) => { Q.loopsLive.delete(h); return p(...x); }; return h; };
})();`;

async function openPage(browser, vp, { init = true } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.dsf || 1,
    isMobile: !!vp.mobile, hasTouch: !!vp.mobile
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });
  page.on("requestfailed", r => { if (!/itunes/.test(r.url())) errs.push("requestfailed: " + r.url().slice(0, 100)); });
  if (init) await page.addInitScript(INIT);
  await page.goto("file://" + pageFile);
  await page.waitForSelector("#title .menu button", { timeout: 15000 });
  await wait(500);
  return { ctx, page, errs, vp, touch: !!vp.mobile };
}
// a real click on desktop, a real tap on touch viewports
const press = async (S, selOrLoc) => {
  const loc = typeof selOrLoc === "string" ? S.page.locator(selOrLoc).first() : selOrLoc;
  await loc.scrollIntoViewIfNeeded().catch(() => {});
  if (S.touch) await loc.tap({ timeout: 5000 }); else await loc.click({ timeout: 5000 });
};
const btn = (S, text) => S.page.locator("#title .menu button", { hasText: text }).first();
const shot = async (S, name) => { const f = path.join(OUT, `${S.vp.name}-${name}.png`); await S.page.screenshot({ path: f }); return f; };

const rectsJs = `(sels) => sels.map(s => [...document.querySelectorAll(s)].map(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
  return { sel: s, text: (e.textContent || '').trim().slice(0, 24), x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1), vis: cs.visibility !== 'hidden' && cs.display !== 'none' && r.width > 0 }; })).flat()`;
const rects = (S, sels) => S.page.evaluate(`(${rectsJs})(${JSON.stringify(sels)})`);
const inView = (r, vw, vh, scrollY = false) => r.x >= -0.5 && r.r <= vw + 0.5 && (scrollY ? true : r.y >= -0.5 && r.b <= vh + 0.5);
const overlap = (a, b) => { const w = Math.min(a.r, b.r) - Math.max(a.x, b.x), h = Math.min(a.b, b.b) - Math.max(a.y, b.y); return w > 1 && h > 1 ? +(w * h).toFixed(0) : 0; };

// elements whose content is taller/wider than the box but which do not scroll or clip on purpose
const OVERFLOW_JS = `(root) => { const out = []; const sc = document.querySelector(root) || document.body;
  sc.querySelectorAll('*').forEach(e => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return; const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
    if (!/^(DIV|P|SPAN|BUTTON|H1|H2|H3|LABEL|LI|A|SMALL|B)$/.test(e.tagName)) return;
    const ox = cs.overflowX, oy = cs.overflowY;
    if (e.scrollHeight > e.clientHeight + 1 && e.clientHeight > 0 && !/auto|scroll/.test(oy) && (e.textContent || '').trim()) out.push({ kind: 'h', tag: e.tagName, cls: e.className && e.className.toString().slice(0, 30), id: e.id, text: (e.textContent || '').trim().slice(0, 30), sh: e.scrollHeight, ch: e.clientHeight, oy });
    if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0 && !/auto|scroll/.test(ox) && (e.textContent || '').trim() && cs.textOverflow !== 'ellipsis') out.push({ kind: 'w', tag: e.tagName, cls: e.className && e.className.toString().slice(0, 30), id: e.id, text: (e.textContent || '').trim().slice(0, 30), sw: e.scrollWidth, cw: e.clientWidth, ox }); });
  return out.slice(0, 15); }`;
const overflowing = (S, root) => S.page.evaluate(`(${OVERFLOW_JS})(${JSON.stringify(root || "body")})`);

// -------------------------------------------------------------------------- 1. title
async function titleChecks(S) {
  const { page, vp } = S;
  const innerW = vp.w, innerH = vp.h;
  const d = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, ih: innerHeight, title: (() => { const t = document.getElementById("title"); return t ? { sh: t.scrollHeight, ch: t.clientHeight, sw: t.scrollWidth, cw: t.clientWidth } : null; })() }));
  if (d.sw > d.iw) add("bug", vp.name, "title: horizontal scroll", `scrollWidth ${d.sw} > innerWidth ${d.iw}`);
  if (d.title && d.title.sw > d.title.cw + 1) add("bug", vp.name, "title overlay wider than viewport", d.title);
  const rs = await rects(S, ["#title .logo", "#title .tag", "#title .tagline", "#title .menu button", "#title .small"]);
  const out = rs.filter(r => r.vis && !inView(r, innerW, innerH, true));
  if (out.length) add("bug", vp.name, "title: element outside viewport horizontally", out.map(r => `${r.sel} "${r.text}" x=${r.x} r=${r.r}`).join("; "));
  const lowest = Math.max(...rs.filter(r => r.vis).map(r => r.b));
  if (d.title && d.title.sh > d.title.ch + 1) add("info", vp.name, "title needs vertical scroll", `title scrollHeight ${d.title.sh} > clientHeight ${d.title.ch} (overlay is overflow:auto); lowest element bottom ${lowest} of ${innerH}`);
  const btns = rs.filter(r => r.sel === "#title .menu button");
  const mh = btns.map(b => `${b.text}:${b.h}`);
  if (S.touch) { const small = btns.filter(b => b.h < 32); if (small.length) add("bug", vp.name, "title buttons under 32px tall on touch", small.map(b => `${b.text}=${b.h}px`).join(", ")); }
  add("info", vp.name, "title button heights (css px)", mh.join(" "));
  const logo = rs.find(r => r.sel === "#title .logo");
  add("info", vp.name, "logo box", logo ? `x=${logo.x} w=${logo.w} h=${logo.h}` : "missing");
  return d;
}
async function panelChecks(S) {
  const { page, vp } = S;
  // HOW TO PLAY / CREDITS: open, measure, screenshot, close (click again)
  for (const [label, key] of [["HOW TO PLAY", "howto"], ["CREDITS", "credits"]]) {
    await press(S, btn(S, label)); await wait(250);
    const hid = await page.evaluate(() => { const p = document.querySelector("#title .panelbox"); return p ? p.hidden : null; });
    if (hid !== false) add("bug", vp.name, `${label} did not open`, `panelbox.hidden=${hid}`);
    const f = await shot(S, "title-" + key);
    const pr = (await rects(S, ["#title .panelbox"]))[0];
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > vp.w) add("bug", vp.name, `${label}: horizontal scroll`, `scrollWidth ${sw} > ${vp.w}`, f);
    if (pr && pr.r > vp.w + 0.5) add("bug", vp.name, `${label}: panel wider than viewport`, `r=${pr.r}`, f);
    const ov = await overflowing(S, "#title .panelbox");
    if (ov.length) add("glitch", vp.name, `${label}: text overflow`, ov, f);
    await press(S, btn(S, label)); await wait(200);
    const hid2 = await page.evaluate(() => document.querySelector("#title .panelbox").hidden);
    if (!hid2) add("bug", vp.name, `${label} did not close on second press`, "panelbox still visible");
  }
}
async function jukeboxChecks(S) {
  const { page, vp } = S;
  await press(S, btn(S, "JUKEBOX")); await wait(300);
  let f = await shot(S, "title-jukebox");
  const rows = await page.locator(".rb-row").count();
  if (!rows) add("bug", vp.name, "jukebox: no records", "0 .rb-row");
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  if (sw > vp.w) add("bug", vp.name, "jukebox: horizontal scroll", `scrollWidth ${sw} > ${vp.w}`, f);
  const rr = await rects(S, [".rb-row", ".rb-chip"]);
  const bad = rr.filter(r => r.vis && r.r > vp.w + 0.5);
  if (bad.length) add("bug", vp.name, "jukebox: rows/chips beyond viewport width", bad.slice(0, 4).map(r => `${r.sel} r=${r.r}`).join("; "), f);
  if (S.touch) { const sm = rr.filter(r => r.vis && r.h < 32); if (sm.length) add("glitch", vp.name, "jukebox rows/chips under 32px on touch", [...new Set(sm.map(r => `${r.sel}:${r.h}`))].slice(0, 5).join(", "), f); }
  await press(S, ".rb-row");
  await wait(600);
  const on = await page.evaluate(() => { const b = document.querySelector(".rb-row.on"); return b ? { pressed: b.getAttribute("aria-pressed"), label: b.querySelector(".rb-play").textContent } : null; });
  if (!on || on.label !== "STOP") add("bug", vp.name, "jukebox: record did not enter playing state", JSON.stringify(on));
  f = await shot(S, "title-jukebox-playing");
  const st = await page.evaluate(() => ({ ctx: RP.audio.ctx().state, loops: window.__qa.loopsLive.size, themeRunning: RP.audio.titleTheme.running }));
  if (st.themeRunning) add("glitch", vp.name, "title theme still running while jukebox record plays", JSON.stringify(st));
  await press(S, ".rb-row.on"); await wait(300);
  const off = await page.evaluate(() => ({ on: !!document.querySelector(".rb-row.on"), loops: window.__qa.loopsLive.size }));
  if (off.on || off.loops) add("bug", vp.name, "jukebox: record did not stop", JSON.stringify(off));
  await press(S, btn(S, "JUKEBOX")); await wait(200);
}

// -------------------------------------------------------------------------- 2. in-game UI
async function startLevel1(S) {
  const { page } = S;
  await press(S, ".split .new"); await wait(250);
  const inp = page.locator("#title input[type=text]");
  await inp.waitFor({ timeout: 3000 });
  await inp.fill("QA DJ");
  await shot(S, "newgame-name");
  await press(S, "#title .namebox .btn");
  await page.waitForSelector(".overlay.card .btn", { timeout: 8000 });
  await wait(700);
  const cf = await shot(S, "level1-card");
  const cr = await rects(S, [".cardbox", ".cardbox .btn"]);
  const cardBad = cr.filter(r => r.vis && !inView(r, S.vp.w, S.vp.h));
  if (cardBad.length) add("bug", S.vp.name, "level card outside viewport", cardBad.map(r => `${r.sel} y=${r.y} b=${r.b} r=${r.r}`).join("; "), cf);
  const co = await overflowing(S, ".cardbox"); if (co.length) add("glitch", S.vp.name, "level card text overflow", co, cf);
  await press(S, ".overlay.card .btn");
  // skip the intro dialogue with Space until the game is idle
  for (let i = 0; i < 80; i++) {
    const busy = await page.evaluate(() => RP.test.isBusy());
    if (!busy && i > 3) break;
    await page.keyboard.press("Space"); await wait(120);
  }
  await wait(500);
}
async function gameLayout(S, tag) {
  const { page, vp } = S;
  const sels = ["#app", "#frameBox", "#frame", "#cv", "#sentence", "#sentence .snd", "#sentence .menuBtn", "#sentence #sent", "#sentence .hud", "#panel", "#verbs", ".verb", "#inv", "#below", "#hint"];
  const rs = await rects(S, sels);
  const g = sel => rs.filter(r => r.sel === sel && r.vis);
  const f = await shot(S, tag);
  const doc = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, ih: innerHeight, p: document.body.classList.contains("p") }));
  if (doc.sw > vp.w) add("bug", vp.name, "game: horizontal scroll", `scrollWidth ${doc.sw} > ${vp.w}`, f);
  const portrait = doc.p;
  // everything must be inside the viewport (portrait may scroll vertically, landscape must not)
  const must = ["#frame", "#sentence", "#sentence .snd", "#sentence .menuBtn", "#sentence #sent", "#panel", ".verb"];
  must.forEach(s => g(s).forEach(r => { if (!inView(r, vp.w, vp.h, portrait)) add("bug", vp.name, `game: ${s} "${r.text}" outside viewport`, `x=${r.x} y=${r.y} r=${r.r} b=${r.b} viewport ${vp.w}x${vp.h}`, f); }));
  if (!portrait && doc.sh > doc.ih + 1) add("glitch", vp.name, "game: landscape page scrolls vertically", `scrollHeight ${doc.sh} > innerHeight ${doc.ih}`, f);
  if (portrait) {
    const lowest = Math.max(...g("#panel").map(r => r.b), 0);
    add("info", vp.name, "portrait stack", `frame b=${g("#frame")[0]?.b} sentence ${g("#sentence")[0]?.y}-${g("#sentence")[0]?.b} panel ${g("#panel")[0]?.y}-${lowest} docScrollH ${doc.sh} vs ih ${doc.ih}`);
    if (doc.sh > doc.ih + 1) add("info", vp.name, "portrait page scrolls vertically (frame+sentence+verbs+inventory)", `scrollHeight ${doc.sh} vs innerHeight ${doc.ih}; last element bottom ${lowest}`, f);
  }
  // overlaps among the sentence bar's children, and sentence vs canvas/panel
  const sent = ["#sentence .snd", "#sentence .menuBtn", "#sentence #sent", "#sentence .hud"].map(s => g(s)[0]).filter(Boolean);
  for (let i = 0; i < sent.length; i++) for (let j = i + 1; j < sent.length; j++) { const o = overlap(sent[i], sent[j]); if (o) add("bug", vp.name, "sentence bar children overlap", `${sent[i].sel} x ${sent[j].sel} area ${o}px2`, f); }
  const sb = g("#sentence")[0], pn = g("#panel")[0], cv = g("#cv")[0];
  if (sb && pn) { const o = overlap(sb, pn); if (o) add("bug", vp.name, "sentence bar overlaps verb panel", `area ${o}px2 sentence y${sb.y}-${sb.b} panel y${pn.y}-${pn.b}`, f); }
  if (sb && cv && !portrait) { const o = overlap(sb, cv); add("info", vp.name, "sentence bar over the canvas (by design in landscape)", `canvas y${cv.y}-${cv.b} sentence y${sb.y}-${sb.b} overlap ${o}px2`); }
  if (sb && cv && portrait) { const o = overlap(sb, cv); if (o) add("bug", vp.name, "portrait: sentence bar overlaps canvas", `area ${o}`, f); }
  const verbs = g(".verb");
  for (let i = 0; i < verbs.length; i++) for (let j = i + 1; j < verbs.length; j++) { const o = overlap(verbs[i], verbs[j]); if (o) add("bug", vp.name, "verb buttons overlap", `"${verbs[i].text}" x "${verbs[j].text}" ${o}px2`, f); }
  if (pn) verbs.forEach(v => { if (v.b > pn.b + 1 || v.r > pn.r + 1) add("glitch", vp.name, "verb button clipped by panel", `"${v.text}" b=${v.b} panel b=${pn.b}`, f); });
  // touch target sizes of in-game controls
  const small = [...g(".verb"), ...g("#sentence .snd"), ...g("#sentence .menuBtn")].filter(r => r.h < 32 || r.w < 32);
  if (S.touch && small.length) add("glitch", vp.name, "in-game touch targets smaller than 32px", [...new Set(small.map(r => `${r.sel.replace("#sentence ", "")} "${r.text}" ${r.w}x${r.h}`))].slice(0, 8).join("; "), f);
  else if (small.length) add("info", vp.name, "in-game controls smaller than 32px (pointer viewport)", [...new Set(small.map(r => `${r.sel.replace("#sentence ", "")} ${r.w}x${r.h}`))].slice(0, 4).join("; "));
  const ov = await overflowing(S, "#app");
  if (ov.length) add("glitch", vp.name, "game UI text overflow", ov, f);
  const cvInfo = await page.evaluate(() => { const c = document.getElementById("cv"); return { w: c.width, h: c.height, css: c.getBoundingClientRect().width, tr: document.getElementById("frame").style.transform }; });
  add("info", vp.name, "canvas", JSON.stringify(cvInfo));
  return { rs, doc };
}
async function clickCanvas(S, gx, gy) {
  const r = await S.page.evaluate(() => { const c = document.getElementById("cv").getBoundingClientRect(); return { x: c.left, y: c.top, w: c.width, h: c.height }; });
  const x = r.x + gx / 640 * r.w, y = r.y + gy / 360 * (r.w * 360 / 640);
  if (S.touch) await S.page.touchscreen.tap(x, y); else await S.page.mouse.click(x, y);
}
async function verbHotspot(S) {
  const { page, vp } = S;
  await press(S, '.verb[data-v="look"]'); await wait(150);
  const sent1 = await page.evaluate(() => document.getElementById("sent").textContent);
  if (!/Look/i.test(sent1)) add("bug", vp.name, "verb click did not update sentence", `sentence="${sent1}"`);
  // bedroom poster r=[40,36,60,86]
  await clickCanvas(S, 70, 80); await wait(400);
  const talk = await page.evaluate(() => { const t = document.getElementById("talk"); const r = t.getBoundingClientRect(); return { text: t.textContent.slice(0, 60), x: r.left, r: r.right, y: r.top, b: r.bottom, n: t.children.length }; });
  const f = await shot(S, "look-poster");
  if (!talk.text) add("glitch", vp.name, "Look at poster produced no speech text", JSON.stringify(talk), f);
  else if (talk.r > vp.w + 1 || talk.x < -1) add("bug", vp.name, "speech bubble outside viewport", JSON.stringify(talk), f);
  for (let i = 0; i < 20 && await page.evaluate(() => RP.test.isBusy()); i++) { await page.keyboard.press("Space"); await wait(150); }
  await wait(200);
}
async function closeTopOverlay(S) {
  const { page } = S;
  const b = page.locator("#overlays .overlay button").filter({ hasText: /^(CLOSE|BACK|DONE|OK)/i }).last();
  if (await b.count()) { await press(S, b); } else { await page.keyboard.press("Escape"); }
  await wait(250);
}
async function menuChecks(S) {
  const { page, vp } = S;
  const entries = ["Messages", "Record crate", "My setup", "Subway map", "Show what I can click", "Save game", "Back"];
  for (const e of entries) {
    if (await page.evaluate(() => RP.test.isBusy())) { for (let i = 0; i < 20 && await page.evaluate(() => RP.test.isBusy()); i++) { await page.keyboard.press("Space"); await wait(150); } }
    await press(S, "#sentence .menuBtn"); await wait(350);
    const ch = await rects(S, ["#choices", "#choices .choice"]);
    const cvis = ch.filter(r => r.vis);
    if (!cvis.length) { add("bug", vp.name, "MENU did not show choices", "no visible #choices"); return; }
    if (e === "Messages") {
      const f = await shot(S, "menu-open");
      cvis.forEach(r => { if (!inView(r, vp.w, vp.h)) add("bug", vp.name, "MENU choice outside viewport", `${r.sel} "${r.text}" y=${r.y} b=${r.b} viewport ${vp.w}x${vp.h}`, f); });
      const co = await overflowing(S, "#choices"); if (co.length) add("glitch", vp.name, "MENU text overflow", co, f);
      const smallC = cvis.filter(r => r.sel === "#choices .choice" && r.h < 28);
      if (S.touch && smallC.length) add("glitch", vp.name, "MENU entries under 28px tall on touch", smallC.map(r => `${r.text}:${r.h}`).join(", "), f);
      const panelB = cvis.find(r => r.sel === "#choices"); add("info", vp.name, "MENU list box", `${cvis.length - 1} entries, box y=${panelB.y} b=${panelB.b} h=${panelB.h} (viewport h ${vp.h})`);
    }
    const choice = page.locator("#choices .choice", { hasText: e }).first();
    if (!(await choice.count())) { add("info", vp.name, `MENU has no "${e}" entry`, "skipped"); const last = page.locator("#choices .choice", { hasText: "Back" }).first(); if (await last.count()) await press(S, last); await wait(200); continue; }
    await press(S, choice); await wait(500);
    if (["Messages", "Record crate", "My setup", "Subway map"].includes(e)) {
      const tag = "menu-" + e.toLowerCase().replace(/\W+/g, "");
      const f = await shot(S, tag);
      const ov = await rects(S, ["#overlays .overlay", ".phonecard", ".cratebox", ".gearbox", ".travelbox", "#overlays .overlay button"]);
      ov.filter(r => r.vis).forEach(r => { if (!inView(r, vp.w, vp.h)) add("bug", vp.name, `${e}: ${r.sel} "${r.text}" outside viewport`, `x=${r.x} y=${r.y} r=${r.r} b=${r.b} viewport ${vp.w}x${vp.h}`, f); });
      const o2 = await overflowing(S, "#overlays"); if (o2.length) add("glitch", vp.name, `${e}: text overflow`, o2, f);
      const btns = ov.filter(r => r.vis && r.sel === "#overlays .overlay button");
      if (S.touch) { const sm = btns.filter(r => r.h < 32); if (sm.length) add("glitch", vp.name, `${e}: buttons under 32px on touch`, sm.slice(0, 6).map(r => `"${r.text}" ${r.w}x${r.h}`).join(", "), f); }
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      if (sw > vp.w) add("bug", vp.name, `${e}: horizontal scroll`, `scrollWidth ${sw} > ${vp.w}`, f);
      await closeTopOverlay(S);
      const left = await page.locator("#overlays .overlay").count();
      if (left) add("bug", vp.name, `${e}: overlay did not close`, `${left} overlays remain`);
    } else if (e === "Show what I can click") { await wait(600); await shot(S, "menu-labels"); }
    else if (e === "Save game") { await wait(200); const t = await page.evaluate(() => (document.querySelector("#toast .toastItem") || {}).textContent); if (t !== "Saved.") add("glitch", vp.name, "Save game showed no 'Saved.' toast", `toast=${t}`); }
    await wait(300);
  }
}
async function uiSection(browser, vp) {
  const S = await openPage(browser, vp);
  try {
    await titleChecks(S);
    await shot(S, "title");
    await panelChecks(S);
    await jukeboxChecks(S);
    await shot(S, "title-after");
    await startLevel1(S);
    await gameLayout(S, "level1");
    await verbHotspot(S);
    await menuChecks(S);
    await shot(S, "level1-after-menu");
  } catch (e) { add("bug", vp.name, "ui section aborted", String(e && e.stack || e).split("\n").slice(0, 3).join(" | ")); try { await shot(S, "ui-abort"); } catch (_) {} }
  if (S.errs.length) add("bug", vp.name, "console/page errors in ui section", S.errs.slice(0, 6));
  await S.ctx.close();
}

// -------------------------------------------------------------------------- 3. rotation
async function rotateSection(browser) {
  for (const vp of vps.filter(v => v.mobile || v.name === "desktop")) {
    const start = vp.mobile ? vp : { name: "desktop", w: 1280, h: 720 };
    const S = await openPage(browser, start);
    try {
      await startLevel1(S);
      const { page } = S;
      const seq = vp.mobile ? [[844, 390], [390, 844], [844, 390], [390, 844], [844, 390], [390, 844]] : [[390, 844], [1280, 720], [390, 844], [1280, 720], [390, 844], [1280, 720]];
      const checkEnd = async (sq) => {
      for (const [w, h] of sq) { await page.setViewportSize({ width: w, height: h }); await wait(60); }
      await wait(500);
      const [fw, fh] = sq[sq.length - 1];
      const state = await page.evaluate(() => {
        const q = s => document.querySelectorAll(s);
        const sent = document.getElementById("sentence"), panel = document.getElementById("panel");
        return {
          portraitClass: document.body.classList.contains("p"), sentParent: sent.parentNode.id, panelParent: panel.parentNode.id,
          counts: { sentence: q("#sentence").length, panel: q("#panel").length, verbs: q("#verbs").length, verbBtns: q(".verb").length, inv: q("#inv").length, snd: q(".snd").length, menuBtn: q(".menuBtn").length, frame: q("#frame").length, cv: q("#cv").length, app: q("#app").length, below: q("#below").length },
          belowKids: [...document.getElementById("below").children].map(e => e.id), frameKids: [...document.getElementById("frame").children].map(e => e.id || e.tagName),
          sw: document.documentElement.scrollWidth, tr: document.getElementById("frame").style.transform, fh: document.getElementById("frame").style.height,
          boxW: document.getElementById("frameBox").style.width
        };
      });
      const wantP = fw < 600 && fh > fw;
      const wantParent = wantP ? "below" : "frame";
      const ok = state.portraitClass === wantP && state.sentParent === wantParent && state.panelParent === wantParent && state.counts.sentence === 1 && state.counts.panel === 1 && state.counts.verbBtns === 9 && state.counts.snd === 1 && state.counts.menuBtn === 1 && state.sw <= fw;
      const f = await shot(S, `rotate-final-${fw}x${fh}`);
      if (!ok) add("bug", start.name, `rotation leaves stale layout (${start.name} -> ${fw}x${fh})`, JSON.stringify({ wantP, wantParent, state }), f);
      else add("info", start.name, `rotation x${sq.length} ends clean at ${fw}x${fh}`, JSON.stringify({ sentParent: state.sentParent, belowKids: state.belowKids, frameKids: state.frameKids, tr: state.tr }));
      const order = state.frameKids.join(",");
      if (!wantP && !/cv,talk,toast,sentence,panel$/.test(order)) add("glitch", start.name, "frame child order changed after rotation", order, f);
      };
      await checkEnd(seq);
      await checkEnd(seq.slice(1).concat([seq[1]]).slice(0, 5).concat([seq[0]]));
      await press(S, '.verb[data-v="look"]'); const sx = await page.evaluate(() => document.getElementById("sent").textContent);
      if (!/Look/i.test(sx)) add("bug", start.name, "verb stops working after rotation", sx);
      await page.setViewportSize({ width: 768, height: 1024 }); await wait(400);
      const tp = await page.evaluate(() => ({ p: document.body.classList.contains("p"), sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, ih: innerHeight, fr: document.getElementById("frame").getBoundingClientRect().toJSON() }));
      const f2 = await shot(S, "tablet-portrait-768x1024");
      add("info", start.name, "768x1024 portrait tablet", JSON.stringify(tp), f2);
      if (tp.sw > 768) add("bug", start.name, "768x1024: horizontal scroll", JSON.stringify(tp), f2);
      await page.setViewportSize({ width: 667, height: 320 }); await wait(400);
      const sm = await gameLayoutLite(S);
      const f3 = await shot(S, "small-667x320");
      add("info", start.name, "667x320 landscape (old iPhone SE)", JSON.stringify(sm), f3);
    } catch (e) { add("bug", start.name, "rotate section aborted", String(e && e.stack || e).split("\n").slice(0, 3).join(" | ")); }
    if (S.errs.length) add("bug", start.name, "errors during rotation", S.errs.slice(0, 5));
    await S.ctx.close();
  }
}
async function gameLayoutLite(S) {
  return S.page.evaluate(() => { const r = id => { const b = document.getElementById(id).getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]; };
    return { frame: r("frame"), sentence: r("sentence"), panel: r("panel"), sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, ih: innerHeight }; });
}

// -------------------------------------------------------------------------- 4. audio
async function audioSection(browser) {
  const vp = VPS[0]; const S = await openPage(browser, vp); const { page } = S;
  try {
    await page.evaluate(WRAP_LOOPS);
    await press(S, btn(S, "HOW TO PLAY")); await wait(600);
    const st0 = await page.evaluate(() => { const c = RP.audio.ctx(); return { state: c && c.state, sr: c && c.sampleRate, base: c && c.baseLatency, theme: RP.audio.titleTheme.running }; });
    if (st0.state !== "running") add("bug", "desktop", "AudioContext not running after first click", JSON.stringify(st0)); else add("info", "desktop", "AudioContext after first click", JSON.stringify(st0));
    if (!st0.theme) add("glitch", "desktop", "title theme not running after first click", JSON.stringify(st0));
    // tab hide/show emulation
    const hv = await page.evaluate(async () => {
      const res = []; let threw = null;
      try {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
        Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
        document.dispatchEvent(new Event("visibilitychange"));
        res.push(["hidden", RP.audio.ctx().state]);
        await RP.audio.ctx().suspend(); res.push(["after suspend() (as a mobile browser would)", RP.audio.ctx().state]);
        delete document.hidden; delete document.visibilityState;
        document.dispatchEvent(new Event("visibilitychange"));
        await new Promise(r => setTimeout(r, 400));
        res.push(["shown", RP.audio.ctx().state]);
      } catch (e) { threw = String(e); }
      return { res, threw };
    });
    add(hv.threw || !hv.res[2] || hv.res[2][1] !== "running" ? "bug" : "info", "desktop", "visibilitychange hide/suspend/show", JSON.stringify(hv));
    // mute toggle: spy on master gain scheduling
    await page.locator("#title .split .new").click();
    await page.locator("#title input[type=text]").fill("QA"); await press(S, "#title .namebox .btn");
    await page.waitForSelector(".overlay.card .btn"); await wait(600); await press(S, ".overlay.card .btn");
    for (let i = 0; i < 80; i++) { if (!(await page.evaluate(() => RP.test.isBusy())) && i > 3) break; await page.keyboard.press("Space"); await wait(120); }
    await wait(500);
    await page.evaluate(() => { const orig = AudioParam.prototype.setTargetAtTime; window.__gainSet = []; AudioParam.prototype.setTargetAtTime = function (v, t, k) { window.__gainSet.push(+v.toFixed(3)); return orig.call(this, v, t, k); }; });
    const gain = () => page.evaluate(() => ({ muted: RP.audio.muted, label: document.querySelector(".snd").textContent, stored: localStorage.getItem("reparte.muted") }));
    const g0 = await gain();
    await press(S, ".snd"); await wait(400);
    const g1 = await gain(); const sets1 = await page.evaluate(() => window.__gainSet.splice(0));
    await press(S, ".snd"); await wait(400);
    const g2 = await gain(); const sets2 = await page.evaluate(() => window.__gainSet.splice(0));
    const mOK = g0.muted === false && g1.muted === true && g1.label === "SND OFF" && g2.muted === false && g2.label === "SND ON" && sets1.includes(0) && sets2.includes(0.85);
    add(mOK ? "info" : "bug", "desktop", "SND toggle", JSON.stringify({ g0, g1, g2, masterTargetsOff: sets1.slice(0, 4), masterTargetsOn: sets2.slice(0, 4) }));
    // back to the title through the game's own quit path
    const jb = await page.evaluate(async () => { RP.onQuit && RP.onQuit(); await new Promise(r => setTimeout(r, 900)); return !!document.getElementById("title"); });
    if (!jb) { add("glitch", "desktop", "could not get back to title for jukebox cycle test", "RP.onQuit missing or no #title"); }
    else {
      await page.mouse.click(10, 10); await wait(1200);
      const base = await page.evaluate(() => ({ iv: [...window.__qa.iv.values()].map(v => v.ms).sort((a, b) => a - b), osc: window.__qa.osc.size, src: window.__qa.src.size, theme: RP.audio.titleTheme.running, loops: window.__qa.loopsLive.size }));
      add("info", "desktop", "audio baseline on title", JSON.stringify(base));
      const hist = [];
      for (let i = 0; i < 5; i++) {
        await press(S, btn(S, "JUKEBOX")); await wait(500);
        await press(S, ".rb-row >> nth=" + i); await wait(700);
        const mid = await page.evaluate(() => ({ theme: RP.audio.titleTheme.running, loops: window.__qa.loopsLive.size, made: window.__qa.loopsMade, iv: window.__qa.iv.size, osc: window.__qa.osc.size }));
        await press(S, btn(S, "JUKEBOX")); // closes the panel while the record may still be playing
        await wait(300);
        const still = await page.evaluate(() => ({ loops: window.__qa.loopsLive.size, theme: RP.audio.titleTheme.running, previewRow: !!document.querySelector(".rb-row.on") }));
        await wait(2600);
        const after = await page.evaluate(() => ({ theme: RP.audio.titleTheme.running, loops: window.__qa.loopsLive.size, iv: window.__qa.iv.size, osc: window.__qa.osc.size, src: window.__qa.src.size }));
        hist.push({ cycle: i + 1, whilePlaying: mid, justAfterClose: still, after3s: after });
      }
      add("info", "desktop", "jukebox open/close x5", JSON.stringify(hist));
      const last = hist[hist.length - 1];
      if (!last.after3s.theme) add("bug", "desktop", "title theme did not return 3 s after jukebox closed", JSON.stringify(last));
      if (hist.some(h => h.justAfterClose.loops > 0)) add("glitch", "desktop", "record keeps playing after the jukebox panel is closed", JSON.stringify(hist.map(h => h.justAfterClose)));
      if (hist.some(h => h.after3s.loops > 0)) add("bug", "desktop", "record loop still live 3 s after closing the jukebox (and the title theme starts on top of it)", JSON.stringify(hist.map(h => h.after3s)));
      if (last.after3s.loops > hist[0].after3s.loops || last.after3s.iv > hist[0].after3s.iv) add("bug", "desktop", "live loops/intervals grow over jukebox cycles", JSON.stringify(hist.map(h => [h.after3s.loops, h.after3s.iv, h.after3s.osc])));
      await press(S, btn(S, "JUKEBOX")); await wait(300);
      await press(S, btn(S, "JUKEBOX"));
      let ret = null; for (let i = 0; i < 60; i++) { await wait(100); if (await page.evaluate(() => RP.audio.titleTheme.running)) { ret = i * 100 + 100; break; } }
      add(ret && ret >= 1800 && ret <= 2500 ? "info" : "glitch", "desktop", "title theme return delay after jukebox close", `${ret} ms (expected ~2000)`);
    }
    // ---- ambience leak across room moves (level 1)
    await page.evaluate(async () => { document.querySelectorAll("#title").forEach(e => e.remove()); RP.hideGame(false); RP.layout(); RP.audio.titleTheme.stop(0.1); RP.test.noSave = true; RP.reset(); RP.state.name = "QA"; await RP.startAct(1, { noCard: true, noIntro: true }); RP.test.setFast(true); });
    await wait(2500);
    const snap = () => page.evaluate(() => { const Q = window.__qa; const ivs = {}; [...Q.iv.values()].forEach(v => ivs[v.ms] = (ivs[v.ms] || 0) + 1); return { ivLive: Q.iv.size, ivByMs: ivs, osc: Q.osc.size, loopSrc: Q.src.size, made: Q.ivMade, cleared: Q.ivCleared, oscMade: Q.oscMade }; });
    const rooms = ["a1_stoop", "a1_synergex", "a1_nowhere_door", "a1_subway", "a1_hall"];
    const base2 = await snap(); add("info", "desktop", "ambience baseline (bedroom)", JSON.stringify(base2));
    const series = [];
    for (let i = 0; i < 10; i++) {
      const id = rooms[i % rooms.length];
      const ok = await page.evaluate(async id => { await RP.goto(id, undefined, undefined, undefined, { instant: true }); return RP.state.room === id; }, id);
      await wait(1600);
      const s = await snap(); series.push({ i: i + 1, room: id, ok, ...s });
    }
    add("info", "desktop", "ambience across 10 room moves (1.6 s apart)", JSON.stringify(series.map(s => ({ i: s.i, room: s.room, ivLive: s.ivLive, ivByMs: s.ivByMs, osc: s.osc, loopSrc: s.loopSrc }))));
    const first = series[4], lastS = series[9];
    if (lastS.ivLive > first.ivLive || lastS.osc > first.osc + 12 || lastS.loopSrc > first.loopSrc + 3) add("bug", "desktop", "ambience leak: live intervals/oscillators grow across room moves", JSON.stringify({ at5: [first.ivLive, first.osc, first.loopSrc], at10: [lastS.ivLive, lastS.osc, lastS.loopSrc] }));
    for (let i = 0; i < 10; i++) await page.evaluate(async id => { await RP.goto(id, undefined, undefined, undefined, { instant: true }); }, rooms[i % rooms.length]);
    const rapid = await snap(); await wait(3000); const settled = await snap();
    add(settled.ivLive > series[9].ivLive + 1 ? "bug" : "info", "desktop", "ambience after 10 rapid room moves, then 3 s settle", JSON.stringify({ rapid: [rapid.ivLive, rapid.osc, rapid.loopSrc], settled: [settled.ivLive, settled.osc, settled.loopSrc], ivByMs: settled.ivByMs }));
    await page.evaluate(() => { RP.audio.stopAll(0.2); }); await wait(6000);
    const stopped = await snap(); add("info", "desktop", "after audio.stopAll", JSON.stringify(stopped));
  } catch (e) { add("bug", "desktop", "audio section aborted", String(e && e.stack || e).split("\n").slice(0, 4).join(" | ")); }
  if (S.errs.length) add("bug", "desktop", "errors in audio section", S.errs.slice(0, 6));
  await S.ctx.close();
}

// -------------------------------------------------------------------------- 5. mini-game
async function mgSection(browser) {
  for (const vp of VPS.filter(v => ["desktop", "phoneL", "phoneP"].includes(v.name) && (!vpSel || vpSel.includes(v.name)))) {
    const S = await openPage(browser, vp); const { page } = S;
    try {
      await page.evaluate(() => { document.querySelectorAll("#title").forEach(e => e.remove()); RP.hideGame(false); RP.layout(); RP.test.noSave = true; RP.reset(); RP.state.name = "QA"; });
      await page.evaluate(() => { window.__mg = null; RP.mg.play("beatMatch", { arcade: true, difficulty: 2 }).then(r => window.__mg = r); });
      await wait(1000);
      const f = await shot(S, "mg-beatmatch");
      const rs = await rects(S, [".mg-wrap", ".mg-head", ".bm-grid", ".deck", ".plat", ".kbtn", ".fader input", ".xf input", ".mg-wrap .btn", ".readouts", ".bm-mix"]);
      const doc = await page.evaluate(() => { const w = document.querySelector(".mg-wrap"), o = document.querySelector(".overlay.mg"); return { sw: document.documentElement.scrollWidth, wrapSH: w.scrollHeight, wrapCH: w.clientHeight, ovSH: o.scrollHeight, ovCH: o.clientHeight, wrapOverflowY: getComputedStyle(w).overflowY, ovOverflowY: getComputedStyle(o).overflowY, active: !!RP.mg.active }; });
      if (doc.sw > vp.w) add("bug", vp.name, "beat.Match: horizontal scroll", `scrollWidth ${doc.sw} > ${vp.w}`, f);
      const out = rs.filter(r => r.vis && (r.x < -0.5 || r.r > vp.w + 0.5));
      if (out.length) add("bug", vp.name, "beat.Match: control beyond viewport width", out.slice(0, 5).map(r => `${r.sel} "${r.text}" x=${r.x} r=${r.r}`).join("; "), f);
      const giveUp = rs.find(r => r.sel === ".mg-wrap .btn" && /GIVE UP|HANG UP/.test(r.text));
      const scrollable = /auto|scroll/.test(doc.wrapOverflowY) || /auto|scroll/.test(doc.ovOverflowY);
      add("info", vp.name, "beat.Match fit", JSON.stringify({ viewport: [vp.w, vp.h], wrapScrollH: doc.wrapSH, wrapClientH: doc.wrapCH, overlayScrollH: doc.ovSH, scrollable, giveUp: giveUp && { y: giveUp.y, b: giveUp.b, h: giveUp.h } }), f);
      if (giveUp && giveUp.b > vp.h + 0.5 && !scrollable) add("bug", vp.name, "beat.Match: GIVE UP button unreachable (below viewport, no scroll)", `b=${giveUp.b} > ${vp.h}`, f);
      else if (giveUp && giveUp.b > vp.h + 0.5) add("glitch", vp.name, "beat.Match: GIVE UP is below the fold (needs scrolling mid-game)", `b=${giveUp.b} > ${vp.h}; content ${doc.wrapSH}px in ${doc.wrapCH}px`, f);
      const sm = rs.filter(r => r.vis && r.sel === ".kbtn" && (r.h < 32)); if (S.touch && sm.length) add("glitch", vp.name, "beat.Match: nudge buttons under 32px on touch", sm.map(r => `${r.text}:${r.w}x${r.h}`).join(", "), f);
      const xf = rs.find(r => r.sel === ".xf input"), pf = rs.find(r => r.sel === ".fader input");
      add("info", vp.name, "beat.Match sliders", JSON.stringify({ crossfader: xf && [xf.w, xf.h], pitch: pf && [pf.w, pf.h] }));
      if (giveUp) { await giveUpClick(S); await wait(600); const closed = await page.evaluate(() => !RP.mg.active && !document.querySelector(".overlay.mg")); if (!closed) add("bug", vp.name, "beat.Match did not close after GIVE UP", "overlay still present"); }
      else await page.evaluate(() => { const b = [...document.querySelectorAll(".mg-wrap .btn")].pop(); b && b.click(); });
      const live = await page.evaluate(() => ({ iv: window.__qa.iv.size, osc: window.__qa.osc.size }));
      await wait(2200);
      const live2 = await page.evaluate(() => ({ iv: window.__qa.iv.size, osc: window.__qa.osc.size, ivMs: [...window.__qa.iv.values()].map(v => v.ms) }));
      add("info", vp.name, "after beat.Match closes", JSON.stringify({ right: live, plus2s: live2 }));
    } catch (e) { add("bug", vp.name, "mini-game section aborted", String(e && e.stack || e).split("\n").slice(0, 3).join(" | ")); try { await shot(S, "mg-abort"); } catch (_) {} }
    if (S.errs.length) add("bug", vp.name, "errors in mini-game section", S.errs.slice(0, 5));
    await S.ctx.close();
  }
}
async function giveUpClick(S) {
  const b = S.page.locator(".mg-wrap .btn", { hasText: /GIVE UP|HANG UP/ }).first();
  await b.scrollIntoViewIfNeeded().catch(() => {});
  if (S.touch) await b.tap(); else await b.click();
}

// -------------------------------------------------------------------------- 6. long run
async function longSection(browser) {
  const vp = VPS[0]; const S = await openPage(browser, vp); const { page } = S;
  try {
    await page.evaluate(async () => {
      document.querySelectorAll("#title").forEach(e => e.remove()); RP.hideGame(false); RP.layout();
      RP.test.noSave = true; RP.test.setFast(true); RP.reset(); RP.state.name = "QA";
      await RP.startAct(1, { noCard: true });
      const r = await RP.test.run(RP.walkthroughs.act1); window.__wt = { ok: r.ok, failed: r.failed, step: r.step, room: RP.state.room, act: RP.state.act };
    });
    const wt = await page.evaluate(() => window.__wt);
    add(wt.ok ? "info" : "glitch", "desktop", "act1 walkthrough (fast mode)", JSON.stringify(wt));
    await page.evaluate(async () => { RP.test.setFast(false); RP.test.errors.length = 0; RP.audio.setMute(false); await RP.goto("a1_stoop", undefined, undefined, undefined, { instant: true }); });
    await wait(1500);
    const sample = async () => {
      const r0 = await page.evaluate(() => window.__qa.rafCbs); await wait(2000); const r1 = await page.evaluate(() => window.__qa.rafCbs);
      return page.evaluate(([a, b]) => ({ fps: +((b - a) / 2).toFixed(1), heap: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(2) : null, iv: window.__qa.iv.size, osc: window.__qa.osc.size, nodes: document.getElementsByTagName("*").length, canvases: document.getElementsByTagName("canvas").length, t: Math.round(performance.now() / 1000) }), [r0, r1]);
    };
    const samples = [await sample()];
    const t0 = Date.now();
    while (Date.now() - t0 < (LONG_SECS - 6) * 1000) { await wait(Math.min(10000, Math.max(0, (LONG_SECS - 6) * 1000 - (Date.now() - t0)))); samples.push(await sample()); }
    add("info", "desktop", `long run ${LONG_SECS}s idle in a1_stoop (rAF callbacks/s, JS heap MB)`, JSON.stringify(samples));
    const a = samples[0], b = samples[samples.length - 1];
    if (a.heap != null && b.heap - a.heap > 5) add("glitch", "desktop", "JS heap grew during idle", `${a.heap} MB -> ${b.heap} MB over ${LONG_SECS}s (gc may not have run; see series)`);
    if (b.fps < a.fps * 0.8) add("glitch", "desktop", "rAF rate dropped during idle", `${a.fps} -> ${b.fps}`);
    if (b.iv > a.iv || b.osc > a.osc + 15 || b.nodes > a.nodes + 20) add("glitch", "desktop", "live intervals/oscillators/DOM nodes grew during idle", JSON.stringify({ a, b }));
    if (a.fps < 50) add("glitch", "desktop", "rAF rate below 50/s in headless", `${a.fps}/s (headless software rendering)`);
    const errs = await page.evaluate(() => RP.test.errors.slice());
    if (errs.length) add("bug", "desktop", "RP.test.errors during idle", errs.slice(0, 3));
  } catch (e) { add("bug", "desktop", "long section aborted", String(e && e.stack || e).split("\n").slice(0, 4).join(" | ")); }
  if (S.errs.length) add("bug", "desktop", "errors in long run", S.errs.slice(0, 6));
  await S.ctx.close();
}

// -------------------------------------------------------------------------- 7. streaming patch
function wavBuf(sec = 0.5, hz = 440, sr = 22050) {
  const n = Math.floor(sec * sr), b = Buffer.alloc(44 + n * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * 2, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write("data", 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(2 * Math.PI * hz * i / sr) * 9000), 44 + i * 2);
  return b;
}
async function streamSection(browser) {
  const vp = VPS[0]; const S = await openPage(browser, vp); const { page } = S;
  const itunes = [];
  let mode = "ok";
  let curRec = { artist: "x", title: "y" }; // set before each play so the mock result scores as a match
  const hdr = { "access-control-allow-origin": "*" };
  // the game asks as a script tag first (JSONP, "callback=") and falls back to fetch; the mock serves both forms
  await page.route("**/itunes.apple.com/search**", route => {
    const url = route.request().url(); itunes.push(url);
    const cb = (/[?&]callback=([\w$]+)/.exec(url) || [])[1];
    const wrap = body => cb ? { headers: { ...hdr, "content-type": "text/javascript" }, body: cb + "(" + body + ");" } : { headers: { ...hdr, "content-type": "application/json" }, body };
    if (mode === "ok") return route.fulfill({ status: 200, ...wrap(JSON.stringify({ resultCount: 1, results: [{ artistName: curRec.artist, trackName: curRec.title.replace(/ \(.*\)$/, ""), previewUrl: "https://audio-ssl.itunes.apple.com/qa/preview.wav", trackTimeMillis: 2000 }] })) });
    if (mode === "fail") return route.abort("failed");
    if (mode === "500") return route.fulfill({ status: 500, headers: hdr, body: "no" });
    // "badjson": the script form gets valid JS that never calls back (the game must give up at onload, not after its timeout); the fetch form gets broken JSON
    return route.fulfill({ status: 200, headers: { ...hdr, "content-type": cb ? "text/javascript" : "application/json" }, body: cb ? "/* not jsonp */" : "{not json" });
  });
  let audioBody = wavBuf(2);
  await page.route("**/audio-ssl.itunes.apple.com/**", route => route.fulfill({ status: 200, headers: { ...hdr, "content-type": "audio/wav" }, body: audioBody }));
  const recOf = n => page.evaluate(n => { const recs = (RP.data.records || []).slice().sort((a, b) => a.artist.localeCompare(b.artist) || a.year - b.year); return { artist: recs[n].artist, title: recs[n].title, id: recs[n].id }; }, n);
  try {
    // code: 3 x "re:", 2 x "parteé", 3 x "re:"
    const clickN = async (sel, n) => { for (let i = 0; i < n; i++) { await page.locator(sel).first().click(); await wait(60); } };
    const flashSeen = page.waitForFunction(() => [...document.body.children].some(e => e.style && e.style.zIndex === "9999"), null, { timeout: 4000 }).then(() => true, () => false);
    await clickN(".logo .re", 3); await clickN(".logo .pa", 2); await clickN(".logo .re", 3);
    const flashed = await flashSeen;
    await wait(200);
    const f1 = await shot(S, "stream-after-code");
    // the toast host moves out of #app while the title is up, so judge the toast by its own visibility, not #app's
    const ti = await page.evaluate(() => { const t = document.querySelector("#toast .toastItem"); const r = t && t.getBoundingClientRect(); const hidden = !t || getComputedStyle(t).visibility === "hidden" || !r.height || r.bottom < 0 || r.top > innerHeight; return { toastText: t ? t.textContent : null, appVisibility: hidden ? "hidden" : "visible", on: RP.stream.on, unlocked: RP.stream.unlocked }; });
    add(flashed ? "info" : "bug", "desktop", "tap-code white flash", `flash element seen: ${flashed}`);
    if (!ti.unlocked || !ti.on) add("bug", "desktop", "tap code did not unlock/enable the streaming patch", JSON.stringify(ti), f1);
    if (ti.toastText && ti.appVisibility === "hidden") add("bug", "desktop", "streaming-patch toast is in the DOM but inside the hidden #app, so it is never visible on the title screen", JSON.stringify(ti), f1);
    else if (!ti.toastText) add("glitch", "desktop", "no toast element after tap code", JSON.stringify(ti), f1);
    else add("info", "desktop", "tap-code toast", JSON.stringify(ti));
    // toggle under HOW TO PLAY
    await press(S, btn(S, "HOW TO PLAY")); await wait(250);
    const tg = await page.evaluate(() => { const b = document.querySelector("#title .panelbox .btn"); return b ? b.textContent : null; });
    const f2 = await shot(S, "stream-howto-toggle");
    if (tg !== "ON") add("bug", "desktop", "streaming toggle missing/not ON under HOW TO PLAY after code", `button text=${tg}`, f2);
    await press(S, btn(S, "HOW TO PLAY")); await wait(200);
    // jukebox with mocked iTunes
    await page.evaluate(WRAP_LOOPS);
    curRec = await recOf(0); mode = "ok";
    await press(S, btn(S, "JUKEBOX")); await wait(300);
    await press(S, ".rb-row >> nth=0");
    await page.waitForFunction(() => /NOW PLAYING/.test((document.querySelector("#toast") || {}).textContent || ""), null, { timeout: 5000 }).catch(() => {});
    await wait(600);
    const np = await page.evaluate(() => { const t = document.querySelector("#toast"); const i = t && t.querySelector(".toastItem"); const r = i && i.getBoundingClientRect(); const hidden = !i || getComputedStyle(i).visibility === "hidden" || !r.height || r.bottom < 0 || r.top > innerHeight; return { toast: t && t.textContent, appVis: hidden ? "hidden" : "visible", ctx: RP.audio.ctx().state, els: 0 }; });
    const f3 = await shot(S, "stream-nowplaying");
    const gotToast = /NOW PLAYING/.test(np.toast || "");
    if (!gotToast) add("bug", "desktop", "NOW PLAYING toast did not appear", JSON.stringify({ np, itunesCalls: itunes.length }), f3);
    else if (np.appVis === "hidden") add("bug", "desktop", "NOW PLAYING toast exists in DOM but #app is visibility:hidden on the title, so the player never sees it", JSON.stringify(np), f3);
    else add("info", "desktop", "NOW PLAYING toast", JSON.stringify(np));
    add("info", "desktop", "iTunes request", itunes[0] || "none");
    const playing = await page.evaluate(() => ({ loops: window.__qa.loopsLive.size, row: !!document.querySelector(".rb-row.on") }));
    await press(S, ".rb-row.on"); await wait(800);
    const stopped = await page.evaluate(() => ({ loops: window.__qa.loopsLive.size, row: !!document.querySelector(".rb-row.on") }));
    add(stopped.row || stopped.loops ? "bug" : "info", "desktop", "stream stop", JSON.stringify({ playing, stopped }));
    // failing fetch -> fallback loop plays silently
    for (const m of ["fail", "500", "badjson"]) {
      mode = m;
      await page.evaluate(() => { RP.stream.cache = {}; });
      await press(S, ".rb-row >> nth=1"); await wait(2500);
      const fb = await page.evaluate(() => ({ row: !!document.querySelector(".rb-row.on"), toast: (document.querySelector("#toast") || {}).textContent || "", osc: window.__qa.osc.size, sched: [...window.__qa.iv.values()].some(v => v.ms === 25) }));
      add((fb.osc > 0 || fb.sched) && !/NOW PLAYING/.test(fb.toast) ? "info" : "bug", "desktop", `fetch ${m}: fallback loop`, JSON.stringify(fb));
      await press(S, ".rb-row.on").catch(() => {}); await wait(400);
    }
    // a preview that cannot be decoded -> element error -> fallback
    mode = "ok"; audioBody = Buffer.from("not audio at all");
    await page.evaluate(() => { RP.stream.cache = {}; });
    curRec = await recOf(2);
    await press(S, ".rb-row >> nth=2"); await wait(2200);
    const bad = await page.evaluate(() => ({ osc: window.__qa.osc.size, sched: [...window.__qa.iv.values()].some(v => v.ms === 25), row: !!document.querySelector(".rb-row.on") }));
    add(bad.osc > 0 || bad.sched ? "info" : "glitch", "desktop", "undecodable preview falls back to synth loop", JSON.stringify(bad));
    await press(S, ".rb-row.on").catch(() => {}); await wait(300);
  } catch (e) { add("bug", "desktop", "stream section aborted", String(e && e.stack || e).split("\n").slice(0, 4).join(" | ")); try { await shot(S, "stream-abort"); } catch (_) {} }
  // the browser itself logs "Failed to load resource" for the requests this section deliberately fails/500s
  const realErrs = S.errs.filter(e => !/Failed to load resource/.test(e));
  if (realErrs.length) add("bug", "desktop", "console/page errors in stream section", realErrs.slice(0, 8));
  else add("info", "desktop", "stream section: no console/page errors", "0");
  await S.ctx.close();
}

// -------------------------------------------------------------------------- main
const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
try {
  if (only.includes("ui")) for (const vp of vps) await uiSection(browser, vp);
  if (only.includes("rotate")) await rotateSection(browser);
  if (only.includes("audio")) await audioSection(browser);
  if (only.includes("mg")) await mgSection(browser);
  if (only.includes("long")) await longSection(browser);
  if (only.includes("stream")) await streamSection(browser);
} finally { await browser.close(); }
fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(findings, null, 1));
const bugs = findings.filter(f => f.sev === "bug").length, gl = findings.filter(f => f.sev === "glitch").length;
console.log(`\ndone: ${bugs} bug, ${gl} glitch, ${findings.length} total findings -> ${path.join(OUT, "results.json")}`);
process.exitCode = bugs ? 1 : 0;
