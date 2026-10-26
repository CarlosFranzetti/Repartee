/* re:parteé — title screen, menus, chapter select, arcade, credits, ending, boot. */
(function () {
"use strict";
const RP = window.RP;
const { el, $, esc, mk, R, P, ell, bayer, mix, mulberry, clamp, store } = RP.u;

/* the protagonist */
RP.chars.define("kid", { name: "you", height: 96, skin: "#e0a27a", hair: { style: "messy", color: "#5a3520" },
  top: { style: "tee", color: "#17131f", print: "circle" }, bottom: { style: "jeans", color: "#2f5a96" },
  shoes: { style: "sneakers", color: "#efeaf6" }, acc: [], voice: "#ffffff" });

let titleEl = null;
// set by tools/build.mjs: links to the level pages and the full game; on a level page, level is its number
const SITE = window.RP_SITE || null;
const DEMO = SITE && SITE.level ? SITE : null;
const link = (href, text, parent, cls) => { const a = el("a", { cls, href, text }, parent); if (SITE && SITE.newTab) { a.target = "_blank"; a.rel = "noopener"; } return a; };
/* progress: finishing level n stores n + 1 in reparte.unlocked (engine completeAct). Chapter Select and the level
   pages only replay levels you've finished; Level 1's page is always open, since it is the start of the game */
const finishedLevels = () => (store.get("reparte.unlocked") || []).map(n => n - 1).filter(n => n >= 1);
const isFinished = n => finishedLevels().includes(n);
const pageOpen = n => n === 1 || !!(SITE && SITE.artifact) || isFinished(n); // claude.ai artifacts can't see progress made elsewhere, so they never lock
/* "LEVELS 1 2 3 4 5 · FULL GAME" under the title menu (the current level and locked levels are not links) */
function levelNav(box) {
  const p = el("p", { cls: "small levelnav" }, box);
  p.appendChild(document.createTextNode(DEMO ? "LEVELS " : "REPLAY A LEVEL: "));
  SITE.pages.forEach((href, i) => {
    if (DEMO && DEMO.level === i + 1) el("b", { text: String(i + 1) }, p);
    else if (pageOpen(i + 1)) link(href, String(i + 1), p).title = "Level " + (i + 1) + ": " + SITE.names[i];
    else el("span", { cls: "lockd", text: String(i + 1), title: "Locked: finish Level " + (i + 1) + " first" }, p);
    p.appendChild(document.createTextNode(" "));
  });
  if (DEMO) { p.appendChild(document.createTextNode("\u00b7 ")); link(SITE.full, "FULL GAME", p); }
}
function paintTitle(c) {
  const w = 320, h = 180, rnd = mulberry(11);
  const sky = ["#0d0826", "#160c38", "#22104a", "#36155a", "#521d66", "#6e2a6e"];
  for (let y = 0; y < h; y++) { const t = clamp(y / 130 * 5, 0, 5), i = Math.min(4, Math.floor(t)), f = Math.round((t - i) * 2) / 2; R(c, 0, y, w, 1, f >= 1 ? sky[i + 1] : f > 0 ? mix(sky[i], sky[i + 1], f) : sky[i]); }
  for (let i = 0; i < 60; i++) P(c, rnd() * w, rnd() * 70, rnd() > 0.6 ? "#ffffff" : "#9c8cff");
  ell(c, 262, 34, 9, 9, "#f2e7c4"); P(c, 259, 31, "#d8cca4"); P(c, 265, 37, "#d8cca4");
  let bx = 0;
  while (bx < w) { const bw = 8 + rnd() * 16 | 0, bh = 30 + rnd() * 50 | 0; R(c, bx, 128 - bh, bw, bh, "#1c1238"); bx += bw; }
  bx = 0;
  while (bx < w) {
    const bw = 10 + rnd() * 18 | 0, bh = 18 + rnd() * 44 | 0, top = 132 - bh;
    R(c, bx, top, bw, bh + 4, "#110a26");
    for (let y = top + 3; y < 130; y += 3) for (let x = bx + 2; x < bx + bw - 1; x += 3) if (rnd() < 0.35) P(c, x, y, ["#ffd27a", "#ffb04a", "#ff9ad5", "#9fe8ff"][rnd() * 4 | 0]);
    bx += bw + 1;
  }
  R(c, 220, 50, 16, 82, "#140c2c"); R(c, 223, 40, 10, 10, "#140c2c"); R(c, 226, 30, 4, 10, "#140c2c"); R(c, 227, 18, 2, 12, "#140c2c"); P(c, 227, 17, "#ff4040");
  for (let y = 54; y < 130; y += 4) for (let x = 222; x < 235; x += 3) if (rnd() < 0.5) P(c, x, y, "#ffe2a0");
  R(c, 0, 128, 200, 3, "#1a1030");
  [[40, 40], [140, 40]].forEach(([x, th]) => { R(c, x, 128 - th, 5, th, "#1a1030"); R(c, x - 1, 128 - th, 7, 3, "#1a1030"); });
  for (let i = 0; i <= 100; i++) { const t = i / 100; P(c, 42 + t * 100, 90 + Math.sin(t * Math.PI) * 30, "#3a2860"); }
  for (let x = 0; x < 200; x += 4) P(c, x, 127, (x / 4) % 2 ? "#ffd27a" : "#ff6cbb");
  for (let y = 132; y < h; y++) R(c, 0, y, w, 1, (y - 132) % 5 === 4 ? "#0b0720" : "#130b2e");
  for (let i = 0; i < 260; i++) { const x = rnd() * w | 0, y = 134 + rnd() * 44 | 0; R(c, x, y, 2 + rnd() * 4, 1, ["#ffd27a", "#ff6cbb", "#9fe8ff"][rnd() * 3 | 0]); }
  R(c, 0, 168, w, 12, "#2a1c30"); R(c, 0, 168, w, 1, "#4a3450");
}
/* title backdrop at 640x360: the city painted at 320x180 and doubled, the kid drawn at native size */
function paintTitleHi(c2) {
  const lo = mk(320, 180);
  paintTitle(lo.getContext("2d"));
  c2.imageSmoothingEnabled = false;
  c2.drawImage(lo, 0, 0, 640, 360);
  RP.chars.update("kid", { acc: ["headphones"], headphonesOn: true });
  RP.chars.draw(c2, { id: "kid", x: 548, y: 352, face: "back", act: "stand" }, { lx: -0.6, rim: { color: "#ff6cbb", side: 1 }, shadow: 0.4 });
  RP.chars.update("kid", { acc: [], headphonesOn: false });
}

function showTitle() {
  RP.hideGame(true);
  if (titleEl) titleEl.remove();
  const ov = titleEl = el("div", { id: "title", cls: "overlay" }, document.body);
  const cv = el("canvas", { id: "tcv", width: 640, height: 360 }, ov);
  paintTitleHi(cv.getContext("2d"));
  const box = el("div", { cls: "tbox" }, ov);
  el("h1", { cls: "logo", html: 're<span class="c">:</span>parte<span class="e">é</span>' }, box);
  el("p", { cls: "tag", text: "A PIXEL-ART DJ ADVENTURE GAME" }, box);
  el("p", { cls: "tagline", text: "From broke-ass bedroom DJ to festival headliner. One bad decision at a time." }, box);
  if (DEMO && !pageOpen(DEMO.level)) { lockedPage(box); return; }
  const menu = el("div", { cls: "menu" }, box);
  const panel = el("div", { cls: "panelbox", hidden: "" }, box);
  const go = fn => () => { RP.audio.ctx(); fn(); };
  const add = (label, fn) => { const b = el("button", { type: "button", text: label }, menu); b.addEventListener("click", go(fn)); return b; };
  // CONTINUE | NEW GAME as one split button; CONTINUE stays in place, greyed, until there is a save
  const split = el("div", { cls: "split", role: "group", "aria-label": "Play" }, menu);
  const saved = RP.hasSave();
  const bCont = el("button", { type: "button", cls: "cont", text: "CONTINUE" }, split);
  if (saved) bCont.addEventListener("click", go(async () => { closeTitle(); if (!(await RP.loadSave())) { showTitle(); } }));
  else { bCont.disabled = true; bCont.title = "No saved game yet"; }
  const bNew = el("button", { type: "button", cls: "new", text: DEMO ? "PLAY LEVEL " + DEMO.level : "NEW GAME" }, split);
  bNew.addEventListener("click", go(() => newGame(panel)));
  const first = [saved ? bCont : bNew];
  add("HOW TO PLAY", () => toggle(panel, howTo));
  if (!DEMO && Object.keys(RP.acts).length > 1) add("CHAPTER SELECT", () => { chapters(panel); themeSync(2000); });
  add("JUKEBOX", () => toggle(panel, jukebox));
  add("MINI-GAMES", () => toggle(panel, arcade));
  add("CREDITS", () => toggle(panel, credits));
  if (DEMO) el("p", { cls: "small", text: "Level " + DEMO.level + " of " + DEMO.names.length + ": " + DEMO.names[DEMO.level - 1] + ", plus all eight mini-games in the arcade. Sound on helps." }, box);
  else el("p", { cls: "small", text: "Five levels. Eight mini-games. Sound on helps." }, box);
  if (SITE) levelNav(box);
  setTimeout(() => first[0] && first[0].focus({ preventScroll: true }), 50);
  // the title theme starts on the first click or key (browsers won't play sound before that)
  themeOn = false;
  const wake = () => { themeOn = true; themeSync(0); };
  ov.addEventListener("pointerdown", wake, { once: true });
  ov.addEventListener("keydown", wake, { once: true });
}
/* title music: plays on the title once the player has clicked or pressed a key. It fades out while the jukebox is open (and during a mini-game)
   and fades back in 2 seconds after the jukebox closes. */
let themeOn = false, themeTimer = 0;
const jukeboxOpen = () => !!(titleEl && titleEl.querySelector('.panelbox[data-k="jukebox"]:not([hidden])'));
const themeWanted = () => themeOn && !!titleEl && !titleEl.hidden && !jukeboxOpen() && !preview;
function themeSync(delayMs) {
  clearTimeout(themeTimer); themeTimer = 0;
  const T = RP.audio.titleTheme;
  if (!themeWanted()) { T.stop(0.8); return; }
  if (T.running) return;
  if (delayMs) themeTimer = setTimeout(() => { themeTimer = 0; if (themeWanted()) T.start(1.5); }, delayMs);
  else T.start(1.2);
}
/* a level page you haven't finished yet: point at the full game instead of starting mid-story */
function lockedPage(box) {
  const n = DEMO.level;
  const card = el("div", { cls: "panelbox locked" }, box);
  el("h3", { text: "LEVEL " + n + " IS LOCKED" }, card);
  el("p", { text: "This page replays Level " + n + ", " + DEMO.names[n - 1] + ", once you've finished it. Play the story in the full game; finishing a level unlocks its page." }, card);
  const row = el("div", { cls: "erow" }, card);
  link(DEMO.full, "PLAY THE FULL GAME", row, "btn primary").style.textDecoration = "none";
  levelNav(box);
}
function closeTitle() { themeOn = false; clearTimeout(themeTimer); themeTimer = 0; RP.audio.titleTheme.stop(0.5); stopPreview(); if (titleEl) { titleEl.remove(); titleEl = null; } RP.hideGame(false); RP.layout(); }
function toggle(panel, fill) { stopPreview(); if (!panel.hidden && panel.dataset.k === fill.name) { panel.hidden = true; themeSync(2000); return; } panel.innerHTML = ""; panel.className = "panelbox"; panel.dataset.k = fill.name; fill(panel); panel.hidden = false; themeSync(2000); }
/* JUKEBOX: every record in the game, with a loop in its style (RP.audio.recordLoop) */
let preview = null, previewId = null;
function stopPreview() { if (preview) { try { preview.stop(); } catch (e) { /* already stopped */ } } preview = null; previewId = null; }
function jukebox(p) {
  const recs = (RP.data.records || []).slice().sort((a, b) => a.artist.localeCompare(b.artist) || a.year - b.year);
  el("h3", { text: "JUKEBOX" }, p);
  el("p", { text: recs.length + " real records from the game. Pick one to hear a loop in its style; pick it again to stop." }, p);
  const chips = el("div", { cls: "rb-chips" }, p);
  const list = el("div", { cls: "rb-list" }, p);
  const note = el("p", { cls: "rb-note" }, p);
  let genre = "all";
  const render = () => {
    list.innerHTML = "";
    recs.filter(r => genre === "all" || r.genre === genre).forEach(r => {
      const on = previewId === r.id;
      const b = el("button", { type: "button", cls: "rb-row" + (on ? " on" : ""), "aria-pressed": on ? "true" : "false" }, list);
      const cv = el("canvas", { width: 24, height: 24 }, b); RP.sleeve(cv.getContext("2d"), r, 0, 0, 24);
      const t = el("span", { cls: "rb-t" }, b);
      el("b", { text: r.artist + " – " + r.title }, t);
      el("small", { text: [r.label, r.year, r.genre, "~" + r.bpm + " BPM"].filter(Boolean).join(" · ") }, t);
      el("span", { cls: "rb-play", text: on ? "STOP" : "PLAY" }, b);
      b.addEventListener("click", () => {
        const was = on; stopPreview(); note.textContent = "";
        if (!was) { RP.audio.ctx(); try { preview = RP.audio.recordLoop(r); preview.start(); previewId = r.id; } catch (e) { /* no audio here */ } note.textContent = r.fact || ""; }
        render();
      });
    });
  };
  ["all", ...new Set(recs.map(r => r.genre))].forEach(g => {
    const c = el("button", { type: "button", cls: "rb-chip" + (g === genre ? " on" : ""), text: g.toUpperCase() }, chips);
    c.addEventListener("click", () => { genre = g; chips.querySelectorAll(".rb-chip").forEach(x => x.classList.toggle("on", x === c)); render(); });
  });
  render();
}
function howTo(p) {
  [["Pick a verb", ", then click something in the scene. Click the floor to walk."],
   ["Use or Give an item:", " pick the verb, then the item, then the thing or person."],
   ["Right-click", " (desktop) looks at things. Click or press Space while someone talks to skip ahead."],
   ["MENU", " (or use your phone) opens messages, the subway map, your record crate, your setup, and saving."],
   ["Keys:", " L look, P pick up, U use, O open, T talk, G give, Esc to cancel. H (or Tab) shows what you can click."],
   ["Mini-games", " explain their own controls. You can replay any of them from the Mini-Game Arcade."]].forEach(([b, t]) => { const q = el("p", {}, p); el("b", { text: b }, q); q.appendChild(document.createTextNode(t)); });
}
function credits(p) {
  el("h3", { text: "RE:PARTEÉ" }, p);
  el("p", { text: "Inspired by Maniac Mansion, Zak McKracken and the Alien Mindbenders, and The Secret of Monkey Island." }, p);
  el("p", { text: "All graphics are drawn in code and all music is synthesized live in your browser. No samples, no recordings." }, p);
  el("h3", { text: "REAL RECORDS, REAL PEOPLE" }, p);
  el("p", { text: "Records, labels, artists, DJs, gear and venues named in the game are real and referenced as homage. Release details were checked against Discogs and Wikipedia where possible; BPMs are approximate and in-game prices are game values, not market prices." }, p);
  el("p", { text: "Appearances and dialogue by real DJs are fictional and respectful cameos. They do not imply endorsement or involvement. Every fictional character (promoters, neighbors, bosses, rivals) is invented." }, p);
  const n = (RP.data.records || []).length;
  el("p", { text: n + " real records in the catalog." }, p);
}
async function newGame(panel) {
  panel.innerHTML = ""; panel.hidden = false; panel.dataset.k = "new";
  el("p", { text: "What's your DJ name? (Promoters will spell it wrong anyway.)" }, panel);
  const row = el("div", { cls: "namebox" }, panel);
  const inp = el("input", { type: "text", maxlength: "16", value: store.get("reparte.name") || "", placeholder: "DJ NAME", "aria-label": "DJ name" }, row);
  const go = el("button", { cls: "btn primary", type: "button", text: "START" }, row);
  const start = async () => {
    const name = (inp.value || "").trim().toUpperCase() || "DJ NOBODY";
    store.set("reparte.name", name);
    closeTitle();
    RP.reset();
    RP.state.name = name;
    await RP.startAct(DEMO ? DEMO.level : 1);
  };
  go.addEventListener("click", start);
  inp.addEventListener("keydown", e => { if (e.key === "Enter") start(); });
  setTimeout(() => inp.focus(), 30);
}
function chapters(panel) {
  panel.innerHTML = ""; panel.hidden = false; panel.dataset.k = "ch";
  const done = finishedLevels();
  el("p", { text: done.length ? "Replay any level you've finished, with a sensible starting setup." : "Nothing to replay yet. Finish a level in the story and it opens up here." }, panel);
  const list = el("div", { cls: "chapters" }, panel);
  Object.values(RP.acts).sort((a, b) => a.n - b.n).forEach(a => {
    const open = done.includes(a.n);
    const b = el("button", { type: "button" }, list);
    b.appendChild(document.createTextNode("LEVEL " + a.n + ": " + (open ? a.title : "LOCKED")));
    el("small", { text: open ? a.blurb || "" : "Finish it in the story to replay it here." }, b);
    if (!open) { b.disabled = true; return; }
    b.addEventListener("click", async () => { closeTitle(); RP.reset(); RP.state.name = store.get("reparte.name") || "DJ NOBODY"; await RP.startAct(a.n); });
  });
}
/* MINI-GAMES: a grid of cabinet tiles; picking one opens its card (what it is, where it's from, your best score)
   and PLAY starts it. Best scores are kept per mini-game */
const MG_LEVELS = { beatMatch: [1, 4, 5], crowdRead: [1, 3, 4, 5], goDigging: [1, 3], soundCheck: [2, 5], afterParty: [2], buyGear: [2, 3, 5], promoterTalk: [2, 4], makTracks: [4] };
const MG_TINT = ["#ff3fa4", "#39d0ff", "#ffd23f", "#7ef0a0", "#b18cff", "#ff9a5a"];
const bestScores = () => store.get("reparte.best") || {};
const mgName = (t, parent, cls) => el("span", { cls: "mg-name" + (cls ? " " + cls : ""), html: esc(t).replace(".", "<i>.</i>") }, parent);
const levelsOf = m => (MG_LEVELS[m.id] || []).join(" · ");
async function playMg(m) {
  titleEl.hidden = true; stopPreview(); themeSync(0);
  const r = await RP.mg.play(m.id, { arcade: true, difficulty: 2 });
  titleEl.hidden = false; themeSync(0);
  if (r && r.score != null) {
    const sc = Math.round(r.score), b = bestScores();
    if (!(b[m.id] >= sc)) { b[m.id] = sc; store.set("reparte.best", b); }
    RP.toast(m.title + ": " + (r.ok ? "cleared" : "failed") + " · score " + sc);
  }
}
function arcade(p, at) {
  const games = RP.mg.list().sort((a, b) => (a.order || 99) - (b.order || 99));
  const best = bestScores(), scoreText = m => best[m.id] != null ? "BEST " + best[m.id] : "NOT PLAYED";
  p.innerHTML = ""; p.classList.add("arc");
  el("h3", { text: "MINI-GAMES" }, p);
  if (at == null) {
    el("p", { text: "All eight from the story. Pick one to see what it is, then play it on its own." }, p);
    const grid = el("div", { cls: "arc-grid" }, p);
    games.forEach((m, i) => {
      const b = el("button", { type: "button", cls: "arc-tile", style: "--tint:" + MG_TINT[i % MG_TINT.length] }, grid);
      mgName(m.title, b);
      el("span", { cls: "arc-desc", text: m.desc || "" }, b);
      const f = el("span", { cls: "arc-foot" }, b);
      el("span", { text: "LEVEL " + levelsOf(m) }, f); el("b", { text: scoreText(m) }, f);
      b.addEventListener("click", () => arcade(p, i));
    });
    return;
  }
  // the card: one game, arrows to the neighbours, PLAY to start, ALL MINI-GAMES to go back to the grid
  const i = at, m = games[i];
  const card = el("div", { cls: "arc-spot", style: "--tint:" + MG_TINT[i % MG_TINT.length] }, p);
  const top = el("div", { cls: "arc-spot-top" }, card);
  const prev = el("button", { type: "button", cls: "arc-arrow", text: "\u25c0", "aria-label": "Previous mini-game" }, top);
  mgName(m.title, top, "big");
  const next = el("button", { type: "button", cls: "arc-arrow", text: "\u25b6", "aria-label": "Next mini-game" }, top);
  el("p", { cls: "arc-spot-desc", text: m.desc || "" }, card);
  const facts = el("p", { cls: "arc-spot-facts" }, card);
  facts.appendChild(document.createTextNode("IN LEVEL " + levelsOf(m) + " \u00b7 ")); el("b", { text: scoreText(m) }, facts);
  const row = el("div", { cls: "erow" }, card);
  const play = el("button", { type: "button", cls: "btn primary", text: "PLAY" }, row);
  const back = el("button", { type: "button", cls: "btn", text: "ALL MINI-GAMES" }, row);
  el("span", { cls: "arc-count", text: (i + 1) + " / " + games.length }, card);
  prev.addEventListener("click", () => arcade(p, (i + games.length - 1) % games.length));
  next.addEventListener("click", () => arcade(p, (i + 1) % games.length));
  play.addEventListener("click", () => playMg(m));
  back.addEventListener("click", () => arcade(p));
  card.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); arcade(p); } if (e.key === "ArrowLeft") prev.click(); if (e.key === "ArrowRight") next.click(); });
  setTimeout(() => play.focus({ preventScroll: true }), 0);
}

RP.onQuit = () => { RP.audio.stopAll(0.3); showTitle(); };
/* level pages: finishing a level (other than the last) leads here instead of into the next one */
const NEXT_TEASE = ["",
  "Plasma money, a Meserole St loft party and a dead PA.",
  "A Thursday residency at the Halcyon Room, a record fair and a rival in gold.",
  "A flight to Berlin and a 2 AM handover at Halle Neun.",
  "Headlining Harbor Lights, if the main act ever gets off the stage."];
async function levelEnding() {
  const n = DEMO.level, next = n + 1;
  RP.audio.setMusic(null);
  const ov = RP.overlay("card");
  const box = el("div", { cls: "cardbox" }, ov);
  el("div", { cls: "kicker", text: "END OF LEVEL " + n }, box);
  el("h2", { html: "TO BE <span style='color:var(--pink)'>CONTINUED</span>" }, box);
  el("p", { text: "Next up, Level " + next + ": " + DEMO.names[next - 1] + ". " + NEXT_TEASE[next - 1] }, box);
  el("p", { text: "Each level page starts you with a fresh setup. The full game carries your crate, cash and fans through all five levels." }, box);
  const row = el("div", { cls: "erow" }, box);
  // the next level's page only opens once you've finished that level; until then the story goes on in the full game
  if (pageOpen(next)) link(DEMO.pages[next - 1], "PLAY LEVEL " + next, row, "btn primary").style.textDecoration = "none";
  link(DEMO.full, pageOpen(next) ? "FULL GAME" : "PLAY THE FULL GAME", row, pageOpen(next) ? "btn" : "btn primary").style.textDecoration = "none";
  const b = el("button", { cls: "btn", type: "button", text: "BACK TO TITLE" }, row);
  await new Promise(r => b.addEventListener("click", r));
  ov.remove();
  RP.clearSave();
  showTitle();
}
RP.ending = async function () {
  if (DEMO && DEMO.level < DEMO.names.length) return levelEnding();
  RP.audio.setMusic(null);
  const ov = RP.overlay("card");
  const box = el("div", { cls: "cardbox" }, ov);
  el("div", { cls: "kicker", text: "THE END" }, box);
  el("h2", { html: "re<span style='color:var(--pink)'>:</span>parte<span style='color:var(--pink)'>é</span>" }, box);
  const S = RP.state;
  el("p", { text: (S.name || "You") + ": from a milk crate of records and a crackling mixer to a festival headline." }, box);
  el("p", { text: S.records.length + " records in the crate. " + S.followers.toLocaleString("en-US") + " fans. " + RP.u.fmtMoney(S.money) + " in the bank (for now)." }, box);
  el("p", { text: "Thanks for playing. Go dig something." }, box);
  const row = el("div", { cls: "erow" }, box);
  const b = el("button", { cls: "btn primary", type: "button", text: "BACK TO TITLE" }, row);
  await new Promise(r => b.addEventListener("click", r));
  ov.remove();
  RP.clearSave();
  showTitle();
};

/* boot; inside a claude.ai artifact viewer, keep the player's place across republishes */
function boot(data) {
  RP.boot();
  if (data && data.S && data.S.room && !data.title) {
    RP.restore(data.S).then(ok => { if (!ok) showTitle(); });
  } else showTitle();
}
function start() {
  const hot = window.claude && window.claude.hot;
  try { if (hot && hot.snapshot) hot.snapshot(() => ({ S: RP.state, title: !!titleEl })); } catch (e) { /* ignore */ }
  if (hot && hot.ready) hot.ready(boot); else boot(hot && hot.data ? hot.data : {});
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
