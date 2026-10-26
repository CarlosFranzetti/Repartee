// Blind-play harness: lets someone (a person at a terminal, or an agent) play a level page through the
// game's real controls, one command at a time, while the browser records a video.
//
//   node tools/blindplay.mjs serve --level 1 --port 7101 --out runs/level1     start a session (keeps running)
//     add --unlock for Levels 2-5: their pages stay locked until the level is finished, so this marks all finished
//   node tools/blindplay.mjs --port 7101 <command> [args] [--why "what I'm thinking"] [--wait ms]
//
// Game time is frozen between commands, so thinking time never costs anything in timed scenes or
// mini-games, and those frozen stretches are cut out of the video afterwards (tools/blindplay-cut.mjs).
// The game's sound is captured too: everything sent to the AudioContext's speakers is tapped and logged
// with wall-clock timestamps (audio.raw), and the cutter lays it back under the cut video.
// Each command runs the game until it settles (walking and dialogue done, or a choice / card / mini-game
// waiting for input), then freezes it again and prints what the player saw: new dialogue, the room,
// what is clickable, the inventory, any choices, overlay or mini-game text, and a screenshot path.
// --why shows on screen as a caption for the length of that command.
//
// Commands:
//   look                         just report (no time passes)
//   labels                       press H: the game labels everything clickable for a moment
//   do <verb> <target>           verbs: look, pickup, use, open, close, push, pull, talk, give
//   use <item> <target>          Use <item> with <target> (a thing in the room or another item)
//   give <item> <target>         Give <item> to <target>
//   walk <target>                walk to a thing or through an exit
//   choose <n | text>            pick a dialogue option (1-based number or part of its text)
//   click <text>                 click a visible button or link by its text (cards, MENU, phone, mini-games)
//   clickxy <x> <y>              click a point in the screenshot (viewport pixels)
//   drag <x1> <y1> <x2> <y2> [ms]
//   slider <name | number> <value>  drag a slider (as listed under SLIDERS) to a value
//   key <key> [holdMs]           press (or hold) a key, e.g. key Space, key ArrowLeft 400
//   type <text>                  type into the focused text box
//   wait <ms>                    let time run (a mini-game, a scene)
//   stop                         end the session and finish the video file
import { createRequire } from "module";
import http from "http";
import fs from "fs";
import path from "path";
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf("--" + k); return i >= 0 ? argv[i + 1] : d; };
const port = +opt("port", 7101);

if (argv[0] !== "serve") {
  // ---------------------------------------------------------------- client
  const rest = []; let why = "", wait = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--port") { i++; continue; }
    if (argv[i] === "--why") { why = argv[++i] || ""; continue; }
    if (argv[i] === "--wait") { wait = +argv[++i]; continue; }
    rest.push(argv[i]);
  }
  const body = JSON.stringify({ cmd: rest[0] || "look", args: rest.slice(1), why, wait });
  const req = http.request({ host: "127.0.0.1", port, method: "POST", path: "/", headers: { "content-type": "application/json" }, timeout: 600000 }, res => {
    let d = ""; res.on("data", c => d += c); res.on("end", () => { process.stdout.write(d + "\n"); });
  });
  req.on("error", e => { console.error("no session on port " + port + " (" + e.message + ")"); process.exitCode = 1; });
  req.end(body);
} else {
  // ---------------------------------------------------------------- server
  const { chromium } = require("/opt/node-tools/node_modules/playwright");
  const level = +opt("level", 1);
  const out = path.resolve(opt("out", path.join(root, "runs", "level" + level)));
  const page0 = path.resolve(opt("page", path.join(root, "dist", "level" + level + ".html")));
  fs.mkdirSync(path.join(out, "shots"), { recursive: true });
  const VW = 1280, VH = 820;

  // time shim: performance.now / Date.now / rAF / timers / audio / CSS animations all stop while frozen
  const SHIM = `(() => {
    const realRAF = window.requestAnimationFrame.bind(window), realST = window.setTimeout.bind(window);
    const realPN = performance.now.bind(performance), realDN = Date.now.bind(Date), base = Date.now() - realPN();
    let frozen = false, frozenAt = 0, lost = 0;
    const vnow = () => (frozen ? frozenAt : realPN()) - lost;
    performance.now = vnow;
    Date.now = () => Math.round(base + vnow());
    let seq = 1; const timers = new Map(), rafs = new Map();
    window.setTimeout = (fn, ms, ...a) => { const id = seq++; timers.set(id, { due: vnow() + Math.max(0, +ms || 0), fn, a, every: 0 }); return id; };
    window.setInterval = (fn, ms, ...a) => { const id = seq++, every = Math.max(4, +ms || 0); timers.set(id, { due: vnow() + every, fn, a, every }); return id; };
    window.clearTimeout = window.clearInterval = id => { timers.delete(id); };
    window.requestAnimationFrame = cb => { const id = seq++; rafs.set(id, cb); return id; };
    window.cancelAnimationFrame = id => { rafs.delete(id); };
    const tick = () => {
      if (!frozen) {
        const t = vnow();
        const due = [...timers.entries()].filter(e => e[1].due <= t).sort((p, q) => p[1].due - q[1].due);
        for (const [id, v] of due) {
          if (!timers.has(id)) continue;
          if (v.every) v.due += v.every; else timers.delete(id);
          try { typeof v.fn === "function" ? v.fn(...v.a) : (0, eval)(v.fn); } catch (e) { console.error(e); }
        }
      }
      realST(tick, 4);
    };
    realST(tick, 4);
    const frame = () => {
      if (!frozen && rafs.size) { const cbs = [...rafs.values()]; rafs.clear(); const t = vnow(); for (const cb of cbs) { try { cb(t); } catch (e) { console.error(e); } } }
      realRAF(frame);
    };
    realRAF(frame);
    // audio: every context's speakers go through a tap that copies the mix into timestamped stereo chunks
    const AC = window.AudioContext || window.webkitAudioContext, ctxs = [], aud = [];
    if (AC) {
      const W = class extends AC {
        constructor(...a) {
          super(...a); ctxs.push(this);
          const tap = this.createGain(); tap.connect(super.destination);
          const rec = this.createScriptProcessor(4096, 2, 2); tap.connect(rec); rec.connect(super.destination);
          rec.onaudioprocess = e => {
            const L = e.inputBuffer.getChannelData(0), R = e.inputBuffer.numberOfChannels > 1 ? e.inputBuffer.getChannelData(1) : L;
            const out = new Int16Array(L.length * 2);
            for (let i = 0; i < L.length; i++) { out[2 * i] = Math.max(-1, Math.min(1, L[i])) * 32767; out[2 * i + 1] = Math.max(-1, Math.min(1, R[i])) * 32767; }
            aud.push([realDN(), this.sampleRate, out]);
          };
          this.__tap = tap; this.__rec = rec;
        }
        get destination() { return this.__tap || super.destination; }
      };
      window.AudioContext = W; window.webkitAudioContext = W;
    }
    window.__audPull = () => aud.splice(0).map(([t, sr, d]) => {
      const u = new Uint8Array(d.buffer); let bin = "";
      for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      return [t, sr, btoa(bin)];
    });
    window.__freeze = on => {
      if (on && !frozen) { frozenAt = realPN(); frozen = true; document.getAnimations().forEach(a => a.pause()); ctxs.forEach(c => c.state === "running" && c.suspend()); }
      else if (!on && frozen) { lost += realPN() - frozenAt; frozen = false; document.getAnimations().forEach(a => a.playState === "paused" && a.play()); ctxs.forEach(c => c.state === "suspended" && c.resume()); }
    };
    window.__isFrozen = () => frozen;
  })();`;

  // on-screen extras for the video: a cursor that follows the mouse, a caption box, a log of what was said
  const OVERLAY = `(() => {
    window.__bpLog = [];
    addEventListener("DOMContentLoaded", () => {
      const st = document.createElement("style");
      st.textContent = "#bpCursor{position:fixed;z-index:2147483647;pointer-events:none;width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:22px solid #fff;transform:translate(-9px,-1px) rotate(-28deg);transform-origin:9px 0;filter:drop-shadow(0 0 2px #000) drop-shadow(0 0 1px #000)}" +
        "#bpCursor.down{border-bottom-color:#ff6cbb}" +
        "#bpCap{position:fixed;left:50%;bottom:6px;transform:translateX(-50%);z-index:2147483646;pointer-events:none;max-width:1180px;background:rgba(8,5,20,.88);border:1px solid #39d0ff;color:#e9f8ff;font:19px/1.35 var(--ui,monospace);padding:6px 14px;text-align:center;box-sizing:border-box}" +
        "#bpCap b{color:#39d0ff;font-weight:normal;letter-spacing:.08em;margin-right:8px}" +
        "#bpCap:empty{display:none}";
      document.head.appendChild(st);
      const cur = document.createElement("div"); cur.id = "bpCursor"; cur.style.left = "-50px"; document.body.appendChild(cur);
      const cap = document.createElement("div"); cap.id = "bpCap"; document.body.appendChild(cap);
      addEventListener("mousemove", e => { cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px"; }, true);
      addEventListener("mousedown", () => cur.classList.add("down"), true);
      addEventListener("mouseup", () => cur.classList.remove("down"), true);
      window.__caption = t => { cap.innerHTML = ""; if (!t) return; const b = document.createElement("b"); b.textContent = "THINKING"; cap.appendChild(b); cap.appendChild(document.createTextNode(t)); };
      new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains("toastItem")) window.__bpLog.push("[notice] " + n.textContent); }))).observe(document.body, { childList: true, subtree: true });
    });
  })();`;

  const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, recordVideo: { dir: out, size: { width: VW, height: VH } } });
  await ctx.addInitScript(SHIM + OVERLAY);
  // level pages 2+ open only after that level is finished; --unlock marks every level finished so the page plays
  if (argv.includes("--unlock")) await ctx.addInitScript(() => { try { if (!localStorage.getItem("reparte.unlocked")) localStorage.setItem("reparte.unlocked", JSON.stringify([2, 3, 4, 5, 6])); } catch (e) { /* no storage */ } });
  const page = await ctx.newPage();
  const T0 = Date.now();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("file://" + page0);
  await page.waitForTimeout(1200);
  // log every speech bubble with its speaker
  await page.evaluate(() => {
    const RP = window.RP;
    const who = id => {
      if (id === "kid") return (RP.S().name || "YOU");
      if (id === "nar") return "NARRATOR";
      const a = RP.actor && RP.actor(id);
      if (a) { if (a.name) return typeof a.name === "function" ? a.name(RP.S()) : a.name; const d = RP.chars.get(a.char); if (d && d.name) return d.name; }
      const d = RP.chars.get && RP.chars.get(id);
      if (d && d.name) return d.name;
      const base = String(id).replace(/^a\d_/, "");
      return base.endsWith("_phone") ? base.slice(0, -6) + " (phone)" : base.replace(/_/g, " ");
    };
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
      if (n.classList && n.classList.contains("line")) window.__bpLog.push(String(who(n.dataset.who || "kid")).toUpperCase() + ": " + n.textContent);
    }))).observe(document.getElementById("talk"), { childList: true });
  });
  await page.evaluate(() => window.__freeze(true));

  // pull the captured sound out of the page a few times a second and append it to audio.raw:
  // records of [float64 wall-clock ms][uint32 sample rate][uint32 frames][frames x 2 int16]
  const audFile = path.join(out, "audio.raw");
  let pulling = false;
  async function pullAudio() {
    if (pulling) return; pulling = true;
    try {
      const chunks = await page.evaluate(() => window.__audPull ? window.__audPull() : []);
      for (const [t, sr, b64] of chunks) {
        const data = Buffer.from(b64, "base64"), head = Buffer.alloc(16);
        head.writeDoubleLE(t, 0); head.writeUInt32LE(sr, 8); head.writeUInt32LE(data.length / 4, 12);
        fs.appendFileSync(audFile, Buffer.concat([head, data]));
      }
    } catch (e) { /* page closing */ } finally { pulling = false; }
  }
  const audTimer = setInterval(pullAudio, 300);

  const segments = [];
  let shotN = 0, lastRoom = null, cmdN = 0;
  const logFile = path.join(out, "session.jsonl");
  const writeSegs = () => fs.writeFileSync(path.join(out, "segments.json"), JSON.stringify({ t0: T0, segments }, null, 1));

  const status = () => page.evaluate(() => {
    const RP = window.RP, visible = e => e && !e.hidden && e.offsetParent !== null;
    const ch = document.getElementById("choices"), ov = document.getElementById("overlays");
    const ovButtons = ov ? [...ov.querySelectorAll("button,a")].filter(visible).length : 0;
    return {
      busy: RP.test.isBusy(), mg: !!RP.mg.active, choices: visible(ch) && ch.childElementCount > 0, ovButtons,
      title: !!document.getElementById("title") && !document.getElementById("title").hidden, speaking: !!document.querySelector("#talk .line"),
      moving: !!(RP.kid && RP.kid.path && RP.kid.path.length)
    };
  });
  async function settle(minMs, mgMs) {
    const start = Date.now();
    await page.waitForTimeout(minMs);
    let calm = 0;
    while (Date.now() - start < 300000) {
      const s = await status();
      if (s.mg) { if (Date.now() - start >= mgMs) return; }
      else if (s.title || s.choices || (s.ovButtons && !s.speaking)) { if (++calm >= 3) return; }
      else if (!s.busy && !s.speaking && !s.moving) { if (++calm >= 4) return; }
      else calm = 0;
      await page.waitForTimeout(120);
    }
  }
  async function running(why, fn, minMs = 300, mgMs = 1200) {
    await page.evaluate(t => window.__caption(t), why || "");
    // the thought stays up long enough to read before anything moves. Outside mini-games the scene keeps
    // running meanwhile (music and idle animation carry on, so the cut video plays smoothly); in a mini-game
    // it waits on the paused screen and that wait is left out of the video, so no timer is ever charged for it
    const readMs = why ? Math.max(900, Math.min(2600, 500 + why.length * 35)) : 0;
    const inMg = await page.evaluate(() => !!(window.RP && window.RP.mg.active));
    if (inMg && readMs) await page.waitForTimeout(readMs);
    await page.evaluate(() => window.__freeze(false));
    const s = (Date.now() - T0) / 1000;
    if (!inMg && readMs) await page.waitForTimeout(readMs);
    try { await fn(); await settle(minMs, mgMs); await page.waitForTimeout(350); }
    finally {
      await page.evaluate(() => window.__freeze(true));
      segments.push([s, (Date.now() - T0) / 1000, why || ""]);
      writeSegs();
    }
  }

  // ---- finding things on screen
  const sceneInfo = () => page.evaluate(() => {
    const RP = window.RP, S = RP.S(), cur = RP.curRoom();
    if (!cur || document.getElementById("title")) return null;
    const ev = (v, ...a) => typeof v === "function" ? v(...a) : v;
    const r = document.getElementById("cv").getBoundingClientRect();
    const things = [];
    (cur.def.hotspots || []).forEach(h => {
      if (h.vis && !h.vis(S)) return;
      let rs = h.rects ? ev(h.rects, S) : h.r ? [ev(h.r, S)] : null;
      if (h.poly) { const p = ev(h.poly, S), xs = p.map(q => q[0]), ys = p.map(q => q[1]); rs = [[Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]]; }
      if (!rs || !rs.length) return;
      if (h.floor) return;
      things.push({ name: h.name ? String(ev(h.name, S)) : h.id, exit: !!h.exit, rects: rs, z: h.z == null ? 10 : h.z });
    });
    cur.actors.forEach(a => {
      if (!a.clickable || !a.bounds || (a.vis && !a.vis(S))) return;
      let n = a.name ? ev(a.name, S) : null; if (!n) { const d = RP.chars.get(a.char); n = d ? d.name : a.id; }
      things.push({ name: String(n), person: true, rects: [a.bounds], z: a.hotZ == null ? 80 : a.hotZ });
    });
    return { things, camX: cur.camX, W: RP.W, SH: RP.SH, rect: { left: r.left, top: r.top, width: r.width, height: r.height }, room: cur.def.name ? String(ev(cur.def.name, S)) : cur.id };
  });
  const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  function pick(list, name) {
    const raw = String(name).trim(), n = norm(name);
    if (!n) { const alt = raw.replace(/-/g, "\u2212"); return list.filter(t => String(t.name).trim() === raw || String(t.name).trim() === alt); }
    let m = list.filter(t => String(t.name).trim().toLowerCase() === raw.toLowerCase());
    if (!m.length) m = list.filter(t => norm(t.name) === n);
    if (!m.length) m = list.filter(t => norm(t.name).startsWith(n));
    if (!m.length) m = list.filter(t => norm(t.name).includes(n));
    if (!m.length) m = list.filter(t => n.includes(norm(t.name)) && norm(t.name).length > 2);
    return m;
  }
  const sentence = () => page.evaluate(() => (document.getElementById("sent") || {}).textContent || "");
  async function moveTo(x, y) { await page.mouse.move(x, y, { steps: 14 }); }
  async function clickAt(x, y) { await moveTo(x, y); await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); }
  // click a thing in the room: scroll toward it if it is off screen, aim at a point the game says is it
  async function clickThing(name) {
    for (let tries = 0; tries < 5; tries++) {
      const si = await sceneInfo();
      if (!si) throw new Error("no room on screen");
      const m = pick(si.things, name);
      if (!m.length) throw new Error("nothing called \"" + name + "\" here. Clickable: " + si.things.map(t => t.name).join(", "));
      const t = m.sort((a, b) => b.z - a.z)[0];
      const [rx, ry, rw, rh] = t.rects[0];
      const pts = [[0.5, 0.5], [0.5, 0.3], [0.3, 0.5], [0.7, 0.5], [0.5, 0.7], [0.25, 0.25], [0.75, 0.75], [0.75, 0.25], [0.25, 0.75]];
      const toScreen = (x, y) => [si.rect.left + (x - si.camX) / si.W * si.rect.width, si.rect.top + y / si.SH * si.rect.height];
      const [cx] = toScreen(rx + rw / 2, 0);
      if (cx < si.rect.left + 8 || cx > si.rect.left + si.rect.width - 8) {
        // off screen: walk toward that side first (a player would)
        const kid = await page.evaluate(() => [window.RP.kid.x, window.RP.kid.y]);
        const tx = Math.max(si.camX + 20, Math.min(si.camX + si.W - 20, rx + rw / 2));
        await page.evaluate(([x, y]) => window.RP.walkTo(x, y), [tx, kid[1]]);
        await settle(400, 0);
        continue;
      }
      for (const [fx, fy] of pts) {
        const [x, y] = toScreen(rx + rw * fx, ry + rh * fy);
        await moveTo(x, y);
        const s = await sentence();
        if (norm(s).includes(norm(t.name))) { await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); return t.name; }
      }
      const [x, y] = toScreen(rx + rw / 2, ry + rh / 2);
      await clickAt(x, y);
      return t.name;
    }
    throw new Error("could not reach \"" + name + "\"");
  }
  async function clickInv(name, exact) {
    const items = await page.$$eval("#inv button.slot:not(.empty)", bs => bs.map((b, i) => ({ i, name: b.getAttribute("aria-label") || b.textContent, short: b.textContent })));
    let m = items.filter(x => norm(x.name) === norm(name) || norm(x.short) === norm(name));
    if (!m.length && !exact) m = pick(items, name);
    if (!m.length && !exact) m = pick(items.map(x => ({ ...x, name: x.short })), name);
    if (!m.length) return null;
    const b = (await page.$$("#inv button.slot:not(.empty)"))[m[0].i];
    const bb = await b.boundingBox();
    await clickAt(bb.x + bb.width / 2, bb.y + bb.height / 2);
    return m[0].name;
  }
  const VERBS = { look: "Look at", lookat: "Look at", examine: "Look at", pickup: "Pick up", pick: "Pick up", take: "Pick up", get: "Pick up", use: "Use", open: "Open", close: "Close", push: "Push", pull: "Pull", talk: "Talk to", talkto: "Talk to", speak: "Talk to", give: "Give" };
  async function clickVerb(v) {
    const label = VERBS[norm(v).replace(/ /g, "")];
    if (!label) throw new Error("unknown verb \"" + v + "\" (verbs: look, pickup, use, open, close, push, pull, talk, give)");
    const b = page.locator("#verbs button", { hasText: new RegExp("^\\s*" + label + "\\s*$", "i") }).first();
    const bb = await b.boundingBox();
    if (!bb) throw new Error("the verbs are not available right now");
    await clickAt(bb.x + bb.width / 2, bb.y + bb.height / 2);
  }
  async function clickTarget(name) {
    const inv = await clickInv(name, true); if (inv) return inv;
    try { return await clickThing(name); }
    catch (e) { const inv2 = await clickInv(name); if (inv2) return inv2; throw e; }
  }
  async function clickText(text) {
    const cands = await page.evaluate(() => {
      const vis = e => e.offsetParent !== null || getComputedStyle(e).position === "fixed";
      // whatever is on top (mini-game, card, phone, title menu, dialogue choices) wins over the verb bar
      const top = e => !!e.closest(".mg-wrap, #overlays, #title, #choices");
      return [...document.querySelectorAll("button, a, [role=button], input[type=button]")].filter(e => vis(e) && !e.disabled).map((e, i) => {
        const r = e.getBoundingClientRect();
        return { i, top: top(e), name: (e.innerText || e.value || e.getAttribute("aria-label") || e.title || "").trim().replace(/\s+/g, " "), x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
      }).filter(c => c.name && c.w > 0 && c.h > 0);
    });
    let m = pick(cands.filter(c => c.top), text);
    if (!m.length) m = pick(cands, text);
    if (!m.length) throw new Error("no button \"" + text + "\". Buttons on screen: " + cands.map(c => c.name).slice(0, 40).join(" | "));
    // bring that one into view (long lists scroll), then click its centre
    const at = await page.evaluate(i => {
      const vis = e => e.offsetParent !== null || getComputedStyle(e).position === "fixed";
      const e = [...document.querySelectorAll("button, a, [role=button], input[type=button]")].filter(e => vis(e) && !e.disabled)[i];
      e.scrollIntoView({ block: "nearest" });
      const r = e.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2];
    }, m[0].i);
    await clickAt(at[0], at[1]);
    return m[0].name;
  }

  // ---- what the player sees
  async function report(extra) {
    const si = await sceneInfo();
    const st = await page.evaluate(() => {
      const RP = window.RP, S = RP.S();
      const vis = e => e && !e.hidden && e.offsetParent !== null;
      const txt = e => (e ? e.innerText : "").replace(/\n{2,}/g, "\n").trim();
      const said = window.__bpLog.splice(0);
      const ch = document.getElementById("choices");
      const choices = vis(ch) ? [...ch.querySelectorAll("button")].map(b => b.textContent) : [];
      const ov = document.getElementById("overlays"), title = document.getElementById("title");
      const mg = document.querySelector(".mg-wrap");
      const inv = [...document.querySelectorAll("#inv button.slot:not(.empty)")].map(b => b.getAttribute("aria-label"));
      const scope = mg || (ov && ov.childElementCount ? ov : null);
      const buttons = scope ? [...scope.querySelectorAll("button, a, [role=button]")].filter(e => e.offsetParent !== null && !e.disabled).map(e => (e.innerText || e.getAttribute("aria-label") || e.title || "").trim().replace(/\s+/g, " ")).filter(Boolean) : [];
      const sliders = scope ? [...scope.querySelectorAll("input[type=range]")].filter(e => e.offsetParent !== null).map((e, i) => (i + 1) + ". " + (e.getAttribute("aria-label") || "slider") + " = " + e.value + " (" + e.min + " to " + e.max + ")") : [];
      return {
        said, choices, inv, buttons, sliders, hud: (document.getElementById("hud") || {}).textContent || "",
        title: title && !title.hidden && !document.querySelector(".mg-wrap") ? txt(title.querySelector(".tbox")) : null,
        overlay: ov && ov.childElementCount && !mg ? txt(ov).slice(0, 2500) : null,
        minigame: mg ? txt(mg).slice(0, 3500) : null,
        frozen: window.__isFrozen()
      };
    });
    const file = path.join(out, "shots", String(++shotN).padStart(4, "0") + ".png");
    await page.screenshot({ path: file });
    const lines = [];
    if (extra) lines.push(extra);
    if (st.said.length) lines.push("WHAT HAPPENED:\n  " + st.said.join("\n  "));
    if (st.title) lines.push("TITLE SCREEN:\n" + st.title);
    if (st.minigame) lines.push("MINI-GAME ON SCREEN (text):\n" + st.minigame);
    else if (st.overlay) lines.push("ON SCREEN (overlay):\n" + st.overlay);
    if (st.buttons.length) lines.push("BUTTONS: " + st.buttons.map(b => "[" + b + "]").join(" "));
    if (st.sliders.length) lines.push("SLIDERS: " + st.sliders.join("; "));
    if (st.choices.length) lines.push("CHOOSE ONE:\n" + st.choices.map((c, i) => "  " + (i + 1) + ". " + c).join("\n"));
    if (si && !st.minigame && !st.title) {
      if (si.room !== lastRoom) lines.push("(new location)");
      lastRoom = si.room;
      lines.push("ROOM: " + si.room + (st.hud ? "   [" + st.hud + "]" : ""));
      lines.push("CLICKABLE: " + si.things.map(t => t.name + (t.exit ? " (exit)" : t.person ? " (person)" : "")).join(", "));
      lines.push("INVENTORY: " + (st.inv.join(", ") || "(empty)"));
    }
    if (errors.length) lines.push("PAGE ERRORS: " + errors.splice(0).join(" | "));
    lines.push("SCREENSHOT: " + file);
    return lines.join("\n");
  }

  async function handle({ cmd, args, why, wait }) {
    cmdN++;
    const a = args || [];
    const W8 = wait != null ? wait : 1200;
    fs.appendFileSync(logFile, JSON.stringify({ n: cmdN, t: (Date.now() - T0) / 1000, cmd, args: a, why }) + "\n");
    switch ((cmd || "look").toLowerCase()) {
      case "look": case "state": return report();
      case "labels": await running(why, async () => { await page.keyboard.press("h"); await page.waitForTimeout(2200); }, 200, 0); return report();
      case "do": {
        if (a.length < 2) throw new Error("usage: do <verb> <target>");
        let hit;
        await running(why, async () => { await clickVerb(a[0]); hit = await clickTarget(a.slice(1).join(" ")); }, 300, W8);
        return report("(" + VERBS[norm(a[0]).replace(/ /g, "")] + " " + hit + ")");
      }
      case "use": case "give": {
        if (a.length < 2) throw new Error("usage: " + cmd + " <item> <target>");
        let it, hit;
        await running(why, async () => {
          await clickVerb(cmd);
          it = await clickInv(a[0]);
          if (!it) throw new Error("you are not carrying \"" + a[0] + "\"");
          const busy = await page.evaluate(() => window.RP.test.isBusy());
          if (!busy) hit = await clickTarget(a.slice(1).join(" "));
        }, 300, W8);
        return report("(" + (cmd === "use" ? "Use " + it + (hit ? " with " + hit : "") : "Give " + it + " to " + hit) + ")");
      }
      case "walk": case "go": {
        let hit;
        await running(why, async () => { hit = await clickThing(a.join(" ")); }, 300, W8);
        return report("(Walk to " + hit + ")");
      }
      case "choose": {
        const q = a.join(" ");
        await running(why, async () => {
          const opts = await page.$$("#choices button");
          if (!opts.length) throw new Error("no choice is on screen");
          let i = /^\d+$/.test(q) ? +q - 1 : -1;
          if (i < 0) { const texts = await Promise.all(opts.map(o => o.textContent())); i = texts.findIndex(t => norm(t).includes(norm(q))); }
          if (i < 0 || i >= opts.length) throw new Error("no such option: " + q);
          await opts[i].scrollIntoViewIfNeeded();
          const bb = await opts[i].boundingBox();
          await clickAt(bb.x + bb.width / 2, bb.y + bb.height / 2);
        }, 300, W8);
        return report();
      }
      case "click": { let n; await running(why, async () => { n = await clickText(a.join(" ")); }, 300, W8); return report("(clicked " + n + ")"); }
      case "clickxy": await running(why, () => clickAt(+a[0], +a[1]), 300, W8); return report();
      case "drag": await running(why, async () => { await moveTo(+a[0], +a[1]); await page.mouse.down(); await page.mouse.move(+a[2], +a[3], { steps: Math.max(8, Math.round((+a[4] || 400) / 16)) }); await page.mouse.up(); }, 300, W8); return report();
      case "slider": {
        await running(why, async () => {
          const sl = await page.$$("input[type=range]");
          const vis = [];
          for (const e of sl) if (await e.isVisible()) vis.push(e);
          let el = null;
          if (/^\d+$/.test(a[0])) el = vis[+a[0] - 1];
          else for (const e of vis) { const l = (await e.getAttribute("aria-label")) || ""; if (norm(l).includes(norm(a[0]))) { el = e; break; } }
          if (!el) throw new Error("no slider " + a[0]);
          // glide the value there in steps (the same input events a drag fires; works for rotated faders too)
          const bb = await el.boundingBox();
          await moveTo(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down();
          const [v0, mn, mx] = await el.evaluate(e => [+e.value, +e.min, +e.max]);
          const target = Math.max(mn, Math.min(mx, +a[1]));
          for (let k = 1; k <= 12; k++) {
            await el.evaluate((e, v) => { e.value = String(v); e.dispatchEvent(new Event("input", { bubbles: true })); }, v0 + (target - v0) * k / 12);
            await page.waitForTimeout(30);
          }
          await el.evaluate(e => e.dispatchEvent(new Event("change", { bubbles: true })));
          await page.mouse.up();
        }, 300, W8);
        return report();
      }
      case "key": await running(why, async () => { if (a[1]) { await page.keyboard.down(a[0]); await page.waitForTimeout(+a[1]); await page.keyboard.up(a[0]); } else await page.keyboard.press(a[0]); }, 200, W8); return report();
      case "type": await running(why, () => page.keyboard.type(a.join(" "), { delay: 70 }), 200, 300); return report();
      case "wait": await running(why, () => page.waitForTimeout(Math.min(60000, +a[0] || 1000)), 0, 0); return report();
      case "stop": {
        writeSegs();
        clearInterval(audTimer); await pullAudio();
        await page.close(); await ctx.close();
        const v = fs.readdirSync(out).filter(f => f.endsWith(".webm")).map(f => path.join(out, f));
        setTimeout(() => browser.close().then(() => process.exit(0)), 300);
        return "session closed. video: " + v.join(", ") + "\nsegments: " + path.join(out, "segments.json");
      }
      default: throw new Error("unknown command " + cmd);
    }
  }

  let queue = Promise.resolve();
  http.createServer((req, res) => {
    let d = ""; req.on("data", c => d += c);
    req.on("end", () => {
      queue = queue.then(async () => {
        let text;
        try { text = await handle(JSON.parse(d || "{}")); }
        catch (e) { text = "ERROR: " + (e.message || e) + "\n" + (await report().catch(() => "")); }
        res.end(text);
      });
    });
  }).listen(port, "127.0.0.1", () => console.log("blindplay level " + level + " on port " + port + ", recording to " + out));
}
