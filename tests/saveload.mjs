// Save slots, pause and the sound switch, headless.
// usage: node tests/saveload.mjs [--page dist/index.html] [--shots <dir>]
//   1. Level 2 in fast mode: a few walkthrough steps, save to slot 2, change things, load slot 2, compare.
//   2. Reload: the title shows CONTINUE and LOAD enabled; LOAD -> slot 2 restores the same state.
//   3. Pause in Level 1 (real time): nothing moves, the AudioContext is suspended, resume -> running.
//   4. Pause inside beat.Match: its canvases and timer stand still, then move again after resume.
//   5. M toggles the one mute state (SND label, title SOUND label, RP.audio.muted).
// --shots <dir> also saves the sentence bar / pause overlay at 1280x720 and 390x844.
import { createRequire } from "module";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const page = path.resolve(opt("page", path.join(root, "dist/index.html")));
const shots = opt("shots", null);

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
let failures = 0;
const check = (ok, label, extra) => { console.log((ok ? "PASS " : "FAIL ") + label + (extra ? " — " + extra : "")); if (!ok) failures++; };
const errorsOf = p => { const errors = []; p.on("pageerror", e => errors.push("pageerror: " + e.message)); p.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); }); return errors; };

/* ---------------- 1 + 2: slots ---------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errors = errorsOf(p);
  await p.goto("file://" + page);
  await p.waitForTimeout(300);
  const r = await p.evaluate(async () => {
    const RP = window.RP;
    RP.test.noSave = false; RP.test.setFast(true);
    document.querySelectorAll("#title").forEach(e => e.remove());
    RP.hideGame(false); RP.layout(); RP.reset(); RP.state.name = "DJ TEST";
    await RP.startAct(2, { noCard: true });
    const steps = RP.walkthroughs.act2;
    const a = await RP.test.run(steps.slice(0, 7));
    if (!a.ok) return { ok: false, failed: "walkthrough part 1: " + a.failed };
    const snap = JSON.parse(JSON.stringify({ room: RP.state.room, inv: RP.state.inv, f: RP.state.f, money: RP.state.money, act: RP.state.act, clock: RP.state.clock }));
    const saved = RP.saveSlot(2);
    const slots = RP.slots();
    // change things: more of the walkthrough (fridge, Linda, the bathroom, out to the street)
    let i = 7;
    for (; i < steps.length && RP.state.room === snap.room; i++) {
      const b = await RP.test.run([steps[i]]);
      if (!b.ok) return { ok: false, failed: "walkthrough part 2, step " + i + ": " + b.failed };
    }
    if (!RP.state.inv.includes("a2_sachet")) return { ok: false, failed: "expected the sachet by step " + i };
    const changed = { room: RP.state.room, inv: RP.state.inv.slice() };
    const loaded = await RP.loadSlot(2);
    const now = { room: RP.state.room, inv: RP.state.inv, f: RP.state.f, money: RP.state.money, act: RP.state.act, clock: RP.state.clock };
    // a malformed slot reads as empty
    localStorage.setItem(Object.keys(localStorage).find(k => k.endsWith(".slot2")).replace(".slot2", ".slot3"), "{not json");
    const slot3 = RP.slots()[2];
    return { ok: true, saved, slots, snap, changed, loaded, now, slot3, keys: Object.keys(localStorage) };
  });
  if (!r.ok) check(false, "slot setup", r.failed);
  else {
    check(r.saved && !r.slots[1].empty && /^Level 2 · /.test(r.slots[1].label), "saved to slot 2", r.slots[1].label);
    check(r.slots[0].empty && r.slots[2].empty, "slots 1 and 3 empty");
    check(r.changed.room !== r.snap.room || JSON.stringify(r.changed.inv) !== JSON.stringify(r.snap.inv), "state changed after saving", r.changed.room + " " + JSON.stringify(r.changed.inv));
    check(r.loaded && r.now.room === r.snap.room, "loaded slot 2: room", r.now.room);
    check(JSON.stringify(r.now.inv) === JSON.stringify(r.snap.inv), "loaded slot 2: inventory", JSON.stringify(r.now.inv));
    check(JSON.stringify(r.now.f) === JSON.stringify(r.snap.f), "loaded slot 2: flags");
    check(r.now.money === r.snap.money && r.now.act === r.snap.act && r.now.clock === r.snap.clock, "loaded slot 2: money, level, clock");
    check(r.slot3.empty, "malformed slot JSON reads as empty");
  }
  // 2: reload; title buttons; LOAD from the title
  await p.reload();
  await p.waitForTimeout(500);
  const t = await p.evaluate(() => ({ cont: !document.querySelector("#title .split .cont").disabled, load: !document.querySelector("#title .split .load").disabled }));
  check(t.cont && t.load, "title after reload: CONTINUE and LOAD enabled", JSON.stringify(t));
  await p.click("#title .split .load");
  await p.waitForTimeout(150);
  const rows = await p.$$eval("#title .slotrow", bs => bs.map(b => ({ dis: b.disabled, text: b.textContent })));
  check(rows.length === 3 && rows[1].dis === false && rows[0].dis && rows[2].dis, "title LOAD lists 3 slots, only slot 2 pickable", rows.map(x => x.text).join(" | "));
  await p.click("#title .slotrow:nth-child(2)");
  await p.waitForTimeout(1500);
  const after = await p.evaluate(() => ({ title: !!document.getElementById("title"), room: window.RP.state.room, inv: window.RP.state.inv, f: window.RP.state.f, ctx: window.RP.audio.ctx() && window.RP.audio.ctx().state }));
  if (r.ok) {
    check(!after.title && after.room === r.snap.room, "title LOAD: in the game, room", after.room);
    check(JSON.stringify(after.inv) === JSON.stringify(r.snap.inv), "title LOAD: inventory");
    const missing = Object.keys(r.snap.f).filter(k => JSON.stringify(after.f[k]) !== JSON.stringify(r.snap.f[k]));
    check(!missing.length, "title LOAD: flags", missing.join(","));
    check(after.ctx === "running", "title LOAD: audio context running", after.ctx);
  }
  check(!errors.length, "no page errors (slots)", errors.slice(0, 5).join(" | "));
  await ctx.close();
}

/* ---------------- 3 + 4 + 5: pause, mini-game pause, mute ---------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errors = errorsOf(p);
  await p.goto("file://" + page);
  await p.waitForTimeout(300);
  await p.mouse.click(5, 5); // a user gesture, as a player would give
  await p.evaluate(() => {
    const RP = window.RP;
    RP.test.noSave = true; RP.test.setFast(false);
    document.querySelectorAll("#title").forEach(e => e.remove());
    RP.hideGame(false); RP.layout(); RP.reset(); RP.state.name = "DJ TEST";
    RP.startAct(1, { noCard: true, noIntro: true });
  });
  await p.waitForTimeout(1200);
  await p.evaluate(() => { window.RP.walkTo(560, 236); });
  await p.waitForTimeout(250);
  const a = await p.evaluate(() => { const RP = window.RP; RP.togglePause(); return { kx: RP.state.kx, ky: RP.state.ky, paused: RP.paused, ov: !!document.querySelector(".overlay.pause") }; });
  await p.waitForTimeout(500);
  const b = await p.evaluate(() => ({ kx: window.RP.state.kx, ky: window.RP.state.ky, ctx: window.RP.audio.ctx().state, paused: window.RP.paused }));
  check(a.paused && a.ov, "pause: overlay up");
  check(a.kx === b.kx && a.ky === b.ky, "pause: the kid stands still mid-walk", a.kx + "," + a.ky + " -> " + b.kx + "," + b.ky);
  check(b.ctx === "suspended", "pause: AudioContext suspended", b.ctx);
  if (shots) {
    await p.screenshot({ path: path.join(shots, "pause-desktop.png") });
  }
  // the M key while paused toggles the one mute state and the overlay's SOUND label follows
  const m0 = await p.evaluate(() => window.RP.audio.muted);
  await p.keyboard.press("m");
  const m1 = await p.evaluate(() => ({ muted: window.RP.audio.muted, snd: document.querySelector("#sentence .snd").textContent, lab: document.querySelector(".pausemenu [data-mute-label]").textContent }));
  check(m1.muted === !m0 && m1.snd === (m1.muted ? "SND OFF" : "SND ON") && m1.lab === (m1.muted ? "SOUND OFF" : "SOUND ON"), "M toggles mute everywhere", JSON.stringify(m1));
  await p.keyboard.press("m");
  // resume with Shift+P
  await p.keyboard.press("Shift+P");
  await p.waitForTimeout(400);
  const c = await p.evaluate(() => ({ kx: window.RP.state.kx, ctx: window.RP.audio.ctx().state, paused: window.RP.paused, ov: !!document.querySelector(".overlay.pause") }));
  check(!c.paused && !c.ov && c.ctx === "running", "resume (Shift+P): overlay gone, AudioContext running", c.ctx);
  check(c.kx !== b.kx, "resume: the kid walks on", b.kx + " -> " + c.kx);
  if (shots) {
    await p.screenshot({ path: path.join(shots, "bar-desktop.png") });
    await p.$("#frame").then(e => e.screenshot({ path: path.join(shots, "bar-desktop-frame.png") }));
  }
  // the sentence-bar PAUSE button
  await p.click("#sentence .pauseBtn");
  await p.waitForTimeout(100);
  const d = await p.evaluate(() => window.RP.paused);
  await p.click(".pausemenu .btn.primary");
  await p.waitForTimeout(100);
  const d2 = await p.evaluate(() => window.RP.paused);
  check(d && !d2, "PAUSE button pauses, RESUME resumes");

  // 4: beat.Match
  await p.evaluate(() => { window.RP.mg.play("beatMatch", { arcade: true, difficulty: 2 }).then(r => { window.__mgResult = r; }); });
  await p.waitForTimeout(1500);
  const grab = () => p.evaluate(() => ({ cv: [...document.querySelectorAll(".mg canvas")].map(c => c.toDataURL()).join("|").length + ":" + [...document.querySelectorAll(".mg canvas")].map(c => c.toDataURL().slice(-64)).join(""), timer: [...document.querySelectorAll(".mg *")].map(e => e.childElementCount ? "" : e.textContent).join("~") }));
  const g0 = await grab();
  await p.waitForTimeout(300);
  const g1 = await grab();
  check(g0.cv !== g1.cv, "beat.Match animates before pausing");
  await p.keyboard.press("Shift+P");
  await p.waitForTimeout(100);
  const g2 = await grab();
  const ac2 = await p.evaluate(() => ({ paused: window.RP.paused, ctx: window.RP.audio.ctx().state, save: document.querySelector(".pausemenu .btn:nth-child(2)").disabled }));
  await p.waitForTimeout(500);
  const g3 = await grab();
  check(ac2.paused && ac2.ctx === "suspended", "beat.Match: paused, AudioContext suspended", ac2.ctx);
  check(g2.cv === g3.cv && g2.timer === g3.timer, "beat.Match: platters, grid and timer stand still for 500 ms");
  check(ac2.save, "beat.Match: SAVE disabled while a mini-game runs");
  await p.keyboard.press("Pause");
  await p.waitForTimeout(400);
  const g4 = await grab();
  const ac4 = await p.evaluate(() => ({ paused: window.RP.paused, ctx: window.RP.audio.ctx().state }));
  check(!ac4.paused && ac4.ctx === "running" && g4.cv !== g3.cv, "beat.Match: resumes (Pause key), animates again", ac4.ctx);
  await p.evaluate(() => { const b = [...document.querySelectorAll(".mg button")].find(x => /GIVE UP|HANG UP/.test(x.textContent)); if (b) b.click(); });
  await p.waitForTimeout(400);
  const res = await p.evaluate(() => window.__mgResult || null);
  check(!!res && res.ok === false, "beat.Match: GIVE UP still ends it after the pause", JSON.stringify(res));

  if (shots) {
    await p.setViewportSize({ width: 390, height: 844 });
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(shots, "bar-phone.png"), fullPage: true });
    await p.evaluate(() => window.RP.togglePause());
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(shots, "pause-phone.png") });
    await p.evaluate(() => window.RP.togglePause());
  }
  check(!errors.length, "no page errors (pause)", errors.slice(0, 5).join(" | "));
  await ctx.close();
}

/* ---------------- title SOUND button ---------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errors = errorsOf(p);
  await p.goto("file://" + page);
  await p.waitForTimeout(300);
  const l0 = await p.evaluate(() => [...document.querySelectorAll("#title .menu > button")].map(b => b.textContent).find(t => /^SOUND/.test(t)));
  await p.evaluate(() => [...document.querySelectorAll("#title .menu > button")].find(b => /^SOUND/.test(b.textContent)).click());
  const l1 = await p.evaluate(() => ({ lab: [...document.querySelectorAll("#title .menu > button")].map(b => b.textContent).find(t => /^SOUND/.test(t)), muted: window.RP.audio.muted, stored: localStorage.getItem("reparte.muted") }));
  check(l0 === "SOUND ON" && l1.lab === "SOUND OFF" && l1.muted && l1.stored === "true", "title SOUND button toggles the shared mute", JSON.stringify(l1));
  await p.reload(); await p.waitForTimeout(300);
  const l2 = await p.evaluate(() => ({ lab: [...document.querySelectorAll("#title .menu > button")].map(b => b.textContent).find(t => /^SOUND/.test(t)), muted: window.RP.audio.muted }));
  check(l2.lab === "SOUND OFF" && l2.muted, "mute persists across a reload", JSON.stringify(l2));
  check(!errors.length, "no page errors (title)", errors.slice(0, 5).join(" | "));
  await ctx.close();
}

await browser.close();
console.log(failures ? failures + " FAILURE(S)" : "ALL PASS");
process.exitCode = failures ? 1 : 0;
