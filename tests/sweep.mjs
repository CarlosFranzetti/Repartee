// Game-logic sweep: replays each act's main walkthrough in fast mode and, after EVERY step, probes the
// current room (every visible hotspot/actor x every verb, plus use/give with every inventory item and
// inventory x inventory). State is restored after each probe action so the walkthrough is not derailed.
// Collects exceptions, stuck busy states, impossible states, generic-fallback look/talk lines, dead
// inventory and never-visible hotspots.
// usage: node tests/sweep.mjs [--page dist/index.html] [--act N] [--cap SECONDS_PER_ACT] [--out DIR] [--walk KEY] [--quiet]
import { createRequire } from "module";
import path from "path";
import fs from "fs";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node-tools/node_modules/playwright");
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i >= 0 ? args[i + 1] : d; };
const page = path.resolve(opt("page", path.join(root, "dist/index.html")));
const onlyAct = opt("act") ? +opt("act") : null;
const capMs = +opt("cap", 240) * 1000;
const outDir = opt("out", null);
const STUCK_MS = 3000;

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

async function newPage() {
  const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto("file://" + page);
  await p.waitForTimeout(300);
  return p;
}

/* ---------- in-page library ---------- */
function installSweep(STUCK_MS) {
  const RP = window.RP;
  const SW = window.__sw = { ctx: "", perr: [], cerr: [], done: new Set(), restoreDrift: 0 };
  window.addEventListener("error", e => SW.perr.push({ ctx: SW.ctx, msg: String(e.message || e.error) }));
  window.addEventListener("unhandledrejection", e => SW.perr.push({ ctx: SW.ctx, msg: "unhandledrejection: " + String(e.reason && e.reason.stack || e.reason) }));
  const ce = console.error.bind(console);
  console.error = (...a) => { SW.cerr.push({ ctx: SW.ctx, msg: a.map(x => (x && x.stack) || String(x)).join(" ") }); ce(...a); };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const VERBS = ["look", "pickup", "use", "open", "talk", "push", "close", "give", "pull"];
  const GENERIC_TALK_ACTOR = ["They're busy.", "Not now. They look busy.", "They don't seem interested in talking to me."];
  const GENERIC_LOOK_RE = /^[^:]+: It's .+\. Pretty much what it looks like\.$/;

  SW.init = async act => {
    RP.test.noSave = true; RP.test.setFast(true);
    document.querySelectorAll("#title").forEach(e => e.remove());
    RP.hideGame(false); RP.layout(); RP.reset(); RP.state.name = "DJ TEST";
    await RP.startAct(act, { noCard: true });
    RP.test.errors.length = 0;
  };
  SW.visible = () => {
    const cur = RP.curRoom(), S = RP.state;
    const hots = [], actors = [];
    for (const h of cur.def.hotspots || []) {
      if (!(h.r || h.rects || h.poly)) continue;
      let v = true; try { v = !h.vis || h.vis(S); } catch (e) { v = true; }
      if (v) hots.push(h.id);
    }
    for (const a of cur.actors) {
      if (!a.clickable || a.crowd) continue;
      let v = true; try { v = !a.vis || a.vis(S); } catch (e) { v = true; }
      if (v) actors.push(a.id);
    }
    return { hots, actors };
  };
  SW.allDefined = room => {
    const d = RP.rooms[room]; if (!d) return [];
    return (d.hotspots || []).filter(h => h.r || h.rects || h.poly).map(h => h.id);
  };
  SW.targetStatus = id => {
    const cur = RP.curRoom(), S = RP.state;
    if (id === "self") return "ok";
    const h = (cur.def.hotspots || []).find(x => x.id === id);
    const a = cur.actors.find(x => x.id === id);
    if (a) { let v = true; try { v = !a.vis || a.vis(S); } catch (e) { } return v ? "ok" : "actor-hidden"; }
    if (!h) return "missing";
    if (!(h.r || h.rects || h.poly)) return "no-geometry";
    let v = true; try { v = !h.vis || h.vis(S); } catch (e) { }
    return v ? "ok" : "hidden";
  };

  function snapshot() {
    const cur = RP.curRoom(), kid = RP.actor("kid"), S = RP.state;
    return {
      s: JSON.stringify(S), room: cur.id, kx: kid.x, ky: kid.y, kf: kid.face,
      actors: cur.actors.filter(a => !a.crowd).map(a => ({ id: a.id, x: a.x, y: a.y, face: a.face, act: a.act, expr: a.expr, name: a.name, vis: a.vis, clickable: a.clickable })),
      answers: RP.test.answers.slice(), mgQ: RP.test.mgQ.slice(), travelQ: RP.test.travelQ.slice()
    };
  }
  async function settle() { const t0 = performance.now(); while (RP.test.isBusy() && performance.now() - t0 < 5000) await sleep(0); }
  async function restore(sn) {
    const S = RP.state;
    const put = () => { for (const k of Object.keys(S)) delete S[k]; Object.assign(S, JSON.parse(sn.s)); };
    put();
    const cur0 = RP.curRoom();
    if (cur0.id !== sn.room) { await RP.goto(sn.room, sn.kx, sn.ky, sn.kf, { instant: true }); await settle(); put(); }
    const cur = RP.curRoom(), kid = RP.actor("kid");
    kid.x = sn.kx; kid.y = sn.ky; kid.face = sn.kf; kid.path = []; kid.walking = false; kid.act = "stand"; kid.onArrive = null;
    for (const s of sn.actors) { const a = cur.actors.find(x => x.id === s.id); if (a) { a.x = s.x; a.y = s.y; a.face = s.face; a.act = s.act; a.expr = s.expr; a.name = s.name; a.vis = s.vis; a.clickable = s.clickable; a.path = []; a.walking = false; } }
    RP.test.answers.length = 0; RP.test.answers.push(...sn.answers);
    RP.test.mgQ.length = 0; RP.test.mgQ.push(...sn.mgQ);
    RP.test.travelQ.length = 0; RP.test.travelQ.push(...sn.travelQ);
    RP.refreshInv && RP.refreshInv();
    if (JSON.stringify(RP.state) !== sn.s) SW.restoreDrift++;
  }

  function invariants(pre) {
    const S = RP.state, bad = [];
    if (!Number.isFinite(S.money)) bad.push("money not finite: " + S.money);
    else if (S.money < 0 && !(pre.money < 0)) bad.push("money negative: " + S.money);
    if (!Number.isFinite(S.followers) || (S.followers < 0 && !(pre.followers < 0))) bad.push("followers invalid: " + S.followers);
    const dupI = S.inv.filter((x, i) => S.inv.indexOf(x) !== i);
    if (dupI.length && !(pre.dupI && pre.dupI.length)) bad.push("duplicate inventory items: " + dupI.join(","));
    const unk = S.inv.filter(x => !RP.items[x]);
    if (unk.length) bad.push("unknown inventory item(s): " + unk.join(","));
    const dupR = S.records.filter((x, i) => S.records.indexOf(x) !== i);
    if (dupR.length && !(pre.dupR && pre.dupR.length)) bad.push("duplicate records: " + dupR.join(","));
    for (const r of S.records) { let ok = true; try { ok = !!RP.rec(r); } catch (e) { ok = false; } if (!ok) { bad.push("unknown record id: " + r); break; } }
    if (!RP.rooms[S.room]) bad.push("state room does not exist: " + S.room);
    return bad;
  }
  const pre = () => { const S = RP.state; return { money: S.money, followers: S.followers, dupI: S.inv.filter((x, i) => S.inv.indexOf(x) !== i), dupR: S.records.filter((x, i) => S.records.indexOf(x) !== i) }; };

  async function runAction(info) {
    const { v, target, item } = info;
    SW.ctx = JSON.stringify({ room: info.room, v, target, item });
    const p0 = pre();
    RP.test.errors.length = 0; SW.perr.length = 0; SW.cerr.length = 0;
    RP.test.answers.length = 0; for (let i = 0; i < 12; i++) RP.test.answers.push(0);
    RP.test.mgQ.length = 0; RP.test.travelQ.length = 0;
    const logStart = RP.test.log.length;
    let done = false;
    RP.test.act(v, target, item || null).then(() => { done = true; }, e => { done = true; RP.test.errors.push("act rejected: " + e); });
    const t0 = performance.now();
    while (!done && performance.now() - t0 < STUCK_MS) await sleep(0);
    const out = { findings: [], texts: [], stuck: false };
    if (!done) { out.stuck = true; out.findings.push({ type: "stuck", detail: "act() not finished after " + STUCK_MS + "ms, busy=" + RP.test.isBusy() }); return out; }
    await sleep(0);
    out.texts = RP.test.log.slice(logStart);
    const errs = RP.test.errors.slice();
    const seen = new Set(errs.map(e => e.split("\n")[0]));
    for (const e of errs) out.findings.push({ type: "error", detail: e.split("\n").slice(0, 4).join(" | ") });
    for (const e of SW.perr.concat(SW.cerr)) { const l = e.msg.split("\n")[0]; if (!seen.has(l)) { seen.add(l); out.findings.push({ type: "error", detail: "(page) " + e.msg.split("\n").slice(0, 3).join(" | ") }); } }
    for (const b of invariants(p0)) out.findings.push({ type: "invariant", detail: b });
    return out;
  }

  SW.probe = async ctxIn => {
    const res = { findings: [], info: [], newKeys: [], actions: 0, capped: false, stuck: null };
    const S = RP.state, cur = RP.curRoom(), room = cur.id;
    const vis = SW.visible();
    const visHash = vis.hots.concat(vis.actors).sort().join(",");
    const invHash = S.inv.slice().sort().join(",");
    const sn = snapshot();
    const skip = new Set(ctxIn.skip || []);
    const base = room + "|" + visHash;
    const targets = vis.hots.concat(vis.actors.filter(a => !vis.hots.includes(a))).concat(["self"]);
    const actions = [];
    for (const id of targets) {
      const hd = (cur.def.hotspots || []).find(h => h.id === id);
      const isActor = !!cur.actors.find(a => a.id === id);
      const verbs = VERBS.slice(); if (hd && hd.exit) verbs.push("walk");
      for (const v of verbs) actions.push({ key: base + "|" + v + "|" + id, v, target: { hot: id, x: 320, y: 230 }, tid: "hot:" + id, isActor });
    }
    for (const id of S.inv) for (const v of VERBS) actions.push({ key: room + "|inv|" + invHash + "|" + v + "|" + id, v, target: { inv: id }, tid: "inv:" + id });
    if (S.inv.length) {
      for (const id of targets) {
        const isActor = !!cur.actors.find(a => a.id === id);
        for (const it of S.inv) for (const v of ["use", "give"]) actions.push({ key: base + "|" + invHash + "|" + v + "|" + id + "|" + it, v, target: { hot: id, x: 320, y: 230 }, tid: "hot:" + id, item: it, isActor });
      }
      for (const a of S.inv) for (const b of S.inv) if (a !== b) actions.push({ key: room + "|inv|" + invHash + "|use|" + a + "|" + b, v: "use", target: { inv: a }, tid: "inv:" + a, item: b });
    }
    for (const a of actions) {
      if (SW.done.has(a.key)) continue;
      if (Date.now() > ctxIn.deadline) { res.capped = true; break; }
      const sk = room + "|" + a.v + "|" + a.tid + "|" + (a.item || "");
      if (skip.has(sk)) continue;
      SW.done.add(a.key); res.newKeys.push(a.key); res.actions++;
      const out = await runAction({ room, v: a.v, target: a.target, item: a.item });
      if (out.stuck) { res.stuck = { skipKey: sk }; res.findings.push({ type: "stuck", room, verb: a.v, target: a.tid, item: a.item || null, detail: out.findings[0].detail }); return res; }
      for (const f of out.findings) res.findings.push(Object.assign({ room, verb: a.v, target: a.tid, item: a.item || null }, f));
      if (a.tid.startsWith("hot:") && !a.item) {
        const id = a.tid.slice(4);
        if (a.v === "look" && out.texts.some(t => GENERIC_LOOK_RE.test(t))) res.info.push({ type: "generic-look", room, target: id, text: out.texts.find(t => GENERIC_LOOK_RE.test(t)) });
        if (a.v === "talk" && a.isActor && out.texts.some(t => GENERIC_TALK_ACTOR.some(g => t.endsWith(": " + g)))) res.info.push({ type: "generic-talk-actor", room, target: id });
      }
      if (a.tid.startsWith("inv:") && !a.item && a.v === "look") {
        const id = a.tid.slice(4), it = RP.items[id] || {};
        if (it.look == null && it.desc == null) res.info.push({ type: "item-no-look", room, target: id });
      }
      await restore(sn);
      if (RP.test.isBusy()) await settle();
    }
    SW.ctx = "";
    return res;
  };

  SW.step = async (key, i) => {
    const steps = RP.walkthroughs[key];
    const st = steps[i];
    SW.ctx = JSON.stringify({ walkStep: i, step: String(st[0]) + (typeof st[1] === "string" ? " " + st[1] : "") });
    RP.test.errors.length = 0; SW.perr.length = 0; SW.cerr.length = 0;
    const out = { i, step: st.map(x => typeof x === "function" ? "[fn]" : x), targetStatus: null };
    if (typeof st[1] === "string" && st[1].startsWith("hot:") && !["answers", "mg", "travel", "goto", "wait", "expect", "run"].includes(st[0])) out.targetStatus = SW.targetStatus(st[1].slice(4));
    out.roomBefore = RP.state.room;
    const t0 = performance.now();
    let r = null;
    RP.test.run([st]).then(x => { r = x; });
    while (!r && performance.now() - t0 < 30000) await sleep(5);
    if (!r) { out.fail = "walkthrough step did not finish within 30s (busy=" + RP.test.isBusy() + ")"; out.hang = true; return out; }
    if (!r.ok) out.fail = r.failed;
    await sleep(0);
    out.pageErrs = SW.perr.concat(SW.cerr).map(e => e.msg.split("\n").slice(0, 3).join(" | "));
    const S = RP.state;
    out.room = S.room; out.act = S.act; out.inv = S.inv.slice(); out.money = S.money;
    out.vis = SW.visible(); out.invariants = invariants({ money: 0, followers: 0 });
    return out;
  };
  SW.replay = async (key, upTo) => {
    const r = await RP.test.run(RP.walkthroughs[key].slice(0, upTo + 1));
    return { ok: r.ok, failed: r.failed };
  };
}

/* ---------- orchestration ---------- */
const all = {};
const probe0 = await newPage();
const actList = await probe0.evaluate(() => Object.keys(window.RP.acts).map(Number).sort((a, b) => a - b));
await probe0.close();
const acts = onlyAct ? [onlyAct] : actList;

async function sweepAct(N) {
  const key = opt("walk", "act" + N);
  const rep = { act: N, walk: key, steps: 0, probeActions: 0, defects: [], info: [], capped: false, ms: 0, pageResets: 0, roomsSeen: [] };
  const doneKeys = new Set();
  const skip = new Set();
  const deadline = Date.now() + capMs;
  const t0 = Date.now();
  let p = null, nSteps = 0;
  const startPage = async upTo => {
    if (p) await p.close().catch(() => { });
    p = await newPage();
    await p.evaluate(installSweep, STUCK_MS);
    await p.evaluate(a => window.__sw.init(a), N);
    nSteps = await p.evaluate(k => (window.RP.walkthroughs[k] || []).length, key);
    if (upTo >= 0) {
      await p.evaluate(keys => keys.forEach(k => window.__sw.done.add(k)), [...doneKeys]);
      const r = await p.evaluate(({ k, u }) => window.__sw.replay(k, u), { k: key, u: upTo });
      if (!r.ok) rep.defects.push({ severity: "high", type: "walkthrough-replay-failed", detail: r.failed, step: upTo });
    }
  };
  await startPage(-1);
  if (!nSteps) { rep.defects.push({ severity: "high", type: "no-walkthrough", detail: "RP.walkthroughs." + key + " missing" }); await p.close(); return rep; }
  rep.steps = nSteps;
  const seenVis = {};
  const addVis = (room, v) => { const s = seenVis[room] || (seenVis[room] = new Set()); v.hots.forEach(x => s.add(x)); v.actors.forEach(x => s.add(x)); };
  const roomsEntered = new Set();
  const itemsSeen = new Set(), itemsUsed = new Set();
  {
    const st = await p.evaluate(() => ({ room: window.RP.state.room, inv: window.RP.state.inv.slice(), v: window.__sw.visible() }));
    roomsEntered.add(st.room); st.inv.forEach(x => itemsSeen.add(x)); addVis(st.room, st.v);
  }
  for (let i = 0; i < nSteps; i++) {
    let out = null;
    for (let attempt = 0; attempt < 3 && !out; attempt++) {
      try { out = await Promise.race([p.evaluate(({ k, i }) => window.__sw.step(k, i), { k: key, i }), new Promise((_, rej) => setTimeout(() => rej(new Error("evaluate timeout 90s")), 90000))]); }
      catch (e) {
        rep.defects.push({ severity: "high", type: "page-hang-or-crash", step: i, detail: String(e.message || e).split("\n")[0] });
        rep.pageResets++;
        try { await startPage(i - 1); } catch (e2) { break; }
      }
    }
    if (!out) { rep.defects.push({ severity: "high", type: "step-unrecoverable", step: i }); break; }
    const stepDesc = JSON.stringify(out.step);
    if (out.fail) {
      rep.defects.push({ severity: "high", type: out.hang ? "walkthrough-step-hang" : "walkthrough-step-failed", step: i, stepDesc, room: out.roomBefore, detail: out.fail });
      break;
    }
    for (const e of out.pageErrs || []) rep.defects.push({ severity: "high", type: "page-error-in-walkthrough", step: i, stepDesc, room: out.roomBefore, detail: e });
    if (out.targetStatus && out.targetStatus !== "ok") rep.defects.push({ severity: "med", type: "walkthrough-targets-unclickable", step: i, stepDesc, room: out.roomBefore, detail: "target " + out.step[1] + " is '" + out.targetStatus + "' when the step runs (the engine still runs its handler, but a player could not click it)" });
    for (const b of out.invariants || []) rep.defects.push({ severity: "high", type: "invariant-in-walkthrough", step: i, stepDesc, room: out.room, detail: b });
    const st = out.step;
    if (["use", "give"].includes(st[0])) { if (st[2]) itemsUsed.add(st[2]); if (typeof st[1] === "string" && st[1].startsWith("inv:")) itemsUsed.add(st[1].slice(4)); }
    (out.inv || []).forEach(x => itemsSeen.add(x));
    roomsEntered.add(out.room);
    addVis(out.room, out.vis);
    if (out.act !== N) { rep.endedInAct = out.act; rep.completedAtStep = i; break; }
    if (Date.now() > deadline) { rep.capped = true; continue; }
    let guard = 0;
    while (guard++ < 40) {
      let pr;
      try {
        pr = await Promise.race([p.evaluate(c => window.__sw.probe(c), { deadline, skip: [...skip] }), new Promise((_, rej) => setTimeout(() => rej(new Error("probe timeout 180s")), 180000))]);
      } catch (e) {
        rep.defects.push({ severity: "high", type: "page-hang-or-crash-in-probe", step: i, room: out.room, detail: String(e.message || e).split("\n")[0] });
        rep.pageResets++;
        if (rep.pageResets > 15) break;
        await startPage(i);
        continue;
      }
      pr.newKeys.forEach(k => doneKeys.add(k));
      rep.probeActions += pr.actions;
      for (const f of pr.findings) rep.defects.push(Object.assign({ severity: "high", step: i, stepDesc }, f));
      for (const f of pr.info) rep.info.push(Object.assign({ step: i }, f));
      if (pr.capped) rep.capped = true;
      if (pr.stuck) { skip.add(pr.stuck.skipKey); rep.pageResets++; await startPage(i); continue; }
      break;
    }
    if (!args.includes("--quiet")) process.stdout.write(`\r  act ${N}: step ${i + 1}/${nSteps} room=${out.room} actions=${rep.probeActions} defects=${rep.defects.length}      `);
  }
  try { rep.restoreDrift = await p.evaluate(() => window.__sw.restoreDrift); } catch (e) { rep.restoreDrift = null; }
  rep.ms = Date.now() - t0;
  const rooms = await p.evaluate(a => Object.values(window.RP.rooms).filter(r => r.act === a).map(r => ({ id: r.id, hots: window.__sw.allDefined(r.id) })), N).catch(() => []);
  rep.roomsSeen = [...roomsEntered];
  rep.unvisitedRooms = rooms.filter(r => !roomsEntered.has(r.id)).map(r => r.id);
  rep.unseenHotspots = [];
  for (const r of rooms) if (roomsEntered.has(r.id)) {
    const seen = seenVis[r.id] || new Set();
    const miss = [...new Set(r.hots.filter(h => !seen.has(h)))];
    if (miss.length) rep.unseenHotspots.push({ room: r.id, ids: miss });
  }
  rep.deadItems = [...itemsSeen].filter(x => !itemsUsed.has(x) && x !== "phone");
  rep.itemsSeen = [...itemsSeen]; rep.itemsUsed = [...itemsUsed];
  await p.close();
  process.stdout.write("\n");
  return rep;
}

for (const N of acts) {
  console.log("sweeping act " + N + " ...");
  all[N] = await sweepAct(N);
}
await browser.close();

/* ---------- reporting ---------- */
function dedupeDefects(list) {
  const m = new Map();
  for (const d of list) { const k = [d.type, d.room, d.verb, d.target, d.item, d.detail].join("|"); if (!m.has(k)) m.set(k, Object.assign({ count: 0 }, d)); m.get(k).count++; }
  return [...m.values()];
}
const json = { page, generated: new Date().toISOString(), acts: Object.fromEntries(Object.entries(all).map(([n, r]) => [n, Object.assign({}, r, { defects: dedupeDefects(r.defects) })])) };
console.log("\nact | steps | probe actions | defects (unique) | info | dead items | unvisited rooms | capped | restore drift | secs");
let md = "# Sweep report\n\nPage: `" + page + "`\n\n| act | steps | probe actions | defects (unique) | info | dead items | unvisited rooms | capped | restore drift | secs |\n|---|---|---|---|---|---|---|---|---|---|\n";
for (const [n, r] of Object.entries(json.acts)) {
  const row = [n, r.steps, r.probeActions, r.defects.length, r.info.length, r.deadItems.length, (r.unvisitedRooms || []).length, r.capped, r.restoreDrift, Math.round(r.ms / 1000)];
  console.log(row.join(" | ")); md += "| " + row.join(" | ") + " |\n";
}
for (const [n, r] of Object.entries(json.acts)) {
  md += `\n## Act ${n}\n\n### Defects\n`;
  if (!r.defects.length) md += "none\n";
  for (const d of r.defects) md += `- **${d.type}** step ${d.step ?? "-"} room \`${d.room ?? "-"}\` verb \`${d.verb ?? "-"}\` target \`${d.target ?? "-"}\` item \`${d.item ?? "-"}\` x${d.count}: ${String(d.detail).slice(0, 400)}${d.stepDesc ? " (walk step " + d.stepDesc + ")" : ""}\n`;
  md += "\n### Generic look / talk fallbacks (informational)\n";
  const gi = [...new Map(r.info.map(i => [i.type + "|" + i.room + "|" + i.target, i])).values()];
  if (!gi.length) md += "none\n"; else for (const i of gi) md += `- ${i.type} \`${i.room}\` \`${i.target}\`\n`;
  md += `\n### Dead inventory (held at some point, never used/given in the walkthrough)\n${r.deadItems.join(", ") || "none"}\n`;
  md += `\n### Rooms of the act never entered by the walkthrough\n${(r.unvisitedRooms || []).join(", ") || "none"}\n`;
  md += `\n### Hotspots never visible in visited rooms\n`;
  if (!r.unseenHotspots.length) md += "none\n"; else for (const u of r.unseenHotspots) md += `- \`${u.room}\`: ${u.ids.join(", ")}\n`;
}
const dir = outDir || path.dirname(page);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "report.json"), JSON.stringify(json, null, 1));
fs.writeFileSync(path.join(dir, "report.md"), md);
console.log("wrote " + path.join(dir, "report.md") + " and report.json");
process.exitCode = Object.values(json.acts).some(r => r.defects.length) ? 1 : 0;
