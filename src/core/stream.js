/* The streaming patch: real audio for the real records, hidden behind a tap code on the title logo
   (3 taps on "re:", 2 on "parteé", 3 on "re:"; the screen flashes). With it on, the jukebox and the story's record
   plays play the actual record instead of the synthesized loop. Audio only, no video.

   Today it plays official 30-second previews from Apple's public iTunes Search API, straight from the browser: no
   server, no key, licensed previews. The catalog can also carry a YouTube video id per record (src/data/stream_ids.js,
   filled in by tools/stream-ids.mjs); a full-length path (an embedded player, or a serverless function that resolves
   audio) can be added on top of that later without touching this file's callers.

   Anything that fails falls back to the built-in loop. Mini-games always keep the synthesized loops: beat.Match,
   crowd.Read and go.Digging read phase/BPM/filters off the loop handle, which a stream cannot honour. */
(function () {
"use strict";
const RP = window.RP;
const audio = RP.audio;
const store = RP.u.store;
const KEY = "reparte.stream";
const ST = RP.stream = { on: !!store.get(KEY), unlocked: !!store.get(KEY + ".unlocked"), cache: {}, ids: (RP.data && RP.data.streamIds) || {} };
ST.setOn = v => { ST.on = !!v; store.set(KEY, ST.on); };
ST.unlock = () => { ST.unlocked = true; store.set(KEY + ".unlocked", true); ST.setOn(true); };

/* ---- the tap code on the title logo ---- */
const CODE = "RRRPPRRR";
let taps = "";
ST.tap = k => {
  taps = (taps + k).slice(-CODE.length);
  if (taps !== CODE) return false;
  taps = "";
  if (!ST.unlocked) ST.unlock(); else ST.setOn(!ST.on);
  ST.flash();
  return true;
};
ST.flash = () => {
  const f = document.createElement("div");
  f.style.cssText = "position:fixed;inset:0;background:#fff;opacity:.9;z-index:9999;pointer-events:none;transition:opacity .45s";
  document.body.appendChild(f);
  requestAnimationFrame(() => requestAnimationFrame(() => { f.style.opacity = "0"; }));
  setTimeout(() => f.remove(), 500);
  if (RP.toast) RP.toast(ST.on ? "STREAMING PATCH ON: the records play for real" : "STREAMING PATCH OFF");
};

/* ---- resolving: artist + title -> a preview url, cached per record ----
   iTunes Search: https://itunes.apple.com/search?term=...&media=music&entity=song&limit=N returns
   { resultCount, results: [{ artistName, trackName, previewUrl, trackTimeMillis, ... }] } with CORS open. */
const norm = s => String(s || "").toLowerCase().replace(/\(.*?\)|\[.*?\]/g, " ").replace(/feat\.?|featuring|ft\./g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const score = (rec, r) => {
  const a = norm(rec.artist), t = norm(rec.title), ra = norm(r.artistName), rt = norm(r.trackName);
  let s = 0;
  if (ra === a) s += 4; else if (ra.includes(a) || a.includes(ra)) s += 2;
  if (rt === t) s += 4; else if (rt.includes(t) || t.includes(rt)) s += 2;
  // judge "remix / live / edit" on the raw titles: norm() strips the brackets those words usually sit in
  const extra = /remix|live|karaoke|instrumental|edit|version|mix\b/i;
  if (extra.test(r.trackName || "") && !extra.test(rec.title || "")) s -= 3;
  return s;
};
ST.log = [];                                        // the last few things the patch did, for debugging in the console
const note = (...a) => { ST.log.push(a.join(" ")); if (ST.log.length > 40) ST.log.shift(); };
/* the search runs as a script tag (JSONP, "callback=") first: it needs no CORS, so it works from file:// copies
   and whenever Apple's CORS header is missing (it is for a null origin); fetch is the fallback */
let jsonpN = 0;
const jsonp = (url, ms) => new Promise((res, rej) => {
  const cb = "__rpItunes" + (++jsonpN);
  const sc = document.createElement("script");
  let called = false;
  const done = (ok, v) => { clearTimeout(tm); delete window[cb]; sc.remove(); ok ? res(v) : rej(v); };
  const tm = setTimeout(() => done(false, new Error("timeout")), ms);
  window[cb] = j => { called = true; done(true, j); };
  sc.onerror = () => done(false, new Error("script error"));
  sc.onload = () => { if (!called) done(false, new Error("no callback")); }; // loaded but never called back (not JSONP)
  sc.src = url + "&callback=" + cb; document.head.appendChild(sc);
});
const searchUrl = rec => "https://itunes.apple.com/search?term=" + encodeURIComponent(rec.artist + " " + rec.title.replace(/ \(.*\)$/, "")) + "&media=music&entity=song&limit=8";
ST.resolve = async rec => {
  const c = ST.cache[rec.id]; if (c !== undefined) return c;
  let out = null, j = null, why = "";
  try { j = await jsonp(searchUrl(rec), 8000); }
  catch (e1) {
    note("jsonp failed:", e1.message);
    const ac = new AbortController(); const tm = setTimeout(() => ac.abort(), 8000);
    try { const r = await fetch(searchUrl(rec), { signal: ac.signal }); if (r.ok) j = await r.json(); else why = "search http " + r.status; }
    catch (e2) { why = "search failed (" + (e2.message || e2) + ")"; } finally { clearTimeout(tm); }
  }
  if (j) {
    const best = (j.results || []).filter(x => x.previewUrl).map(x => [score(rec, x), x]).sort((p, q) => q[0] - p[0])[0];
    if (best && best[0] >= 4) out = { url: best[1].previewUrl, title: best[1].trackName, artist: best[1].artistName, duration: Math.round((best[1].trackTimeMillis || 0) / 1000), preview: true };
    else why = best ? "no close match (best: " + best[1].artistName + " - " + best[1].trackName + ")" : "no results";
  }
  note(rec.id, out ? "-> " + out.artist + " - " + out.title : "-> " + why);
  if (!out) ST.lastWhy = why;
  return (ST.cache[rec.id] = out);
};

/* ---- pause and background: the <audio> elements play on their own clock, so suspending the AudioContext alone
   would let them run on (silently when routed through it, audibly when not) and come back out of place. Every
   element that should be playing is in "playing"; it is paused while the game is paused or the tab is hidden. */
const playing = new Set();
const wantPlay = () => !(audio.isPaused && audio.isPaused()) && !document.hidden;
const syncEl = el => { try { if (wantPlay()) { if (el.paused && el.src) el.play().catch(() => {}); } else if (!el.paused) el.pause(); } catch (e) { /* ignore */ } };
const syncAll = () => playing.forEach(syncEl);
if (audio.onPauseChange) audio.onPauseChange(syncAll);
document.addEventListener("visibilitychange", syncAll);
// an element that is not routed through the context (no Web Audio) follows the mute switch on its own
const direct = new Set();
if (audio.onMuteChange) audio.onMuteChange(m => direct.forEach(el => { el.muted = m; }));

/* ---- a streamed "loop": same handle shape as audio.loop, so callers can't tell ----
   The element plays on its own, not through the AudioContext: routing it through createMediaElementSource needs
   CORS-clean media and a running context, and either one failing gives silence with no error. Volume, mute and
   fades are done on the element itself. */
const SILENT_WAV = (() => { // a 1-sample silent WAV, played inside the click so iOS lets this element play later
  const b = new Uint8Array(46), v = new DataView(b.buffer), w = (o, s) => { for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i); };
  w(0, "RIFF"); v.setUint32(4, 38, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, 2, true);
  let s = ""; b.forEach(x => { s += String.fromCharCode(x); }); return "data:audio/wav;base64," + btoa(s);
})();
const ERR = { 1: "aborted", 2: "network error", 3: "decode error", 4: "format not supported" };
function streamed(rec, o, fallback) {
  const el = new Audio(); el.preload = "auto";
  let dead = false, fb = null, rampT = null;
  const vol0 = Math.min(1, o.volume == null ? 0.8 : o.volume);
  el.volume = vol0; el.muted = !!audio.muted; direct.add(el);
  const useFallback = why => { if (dead || fb) return; note("fallback:", why); fb = fallback(); if (fb) { try { fb.start(); } catch (e) { /* ignore */ } } if (RP.toast && !ST.quiet && why) RP.toast("STREAM: " + why + ". Playing the loop."); };
  // unlock: a silent play() inside the user's click, so the later play() of the real file is allowed on phones
  try { el.src = SILENT_WAV; el.play().catch(() => {}); } catch (e) { /* ignore */ }
  const ramp = (to, sec, then) => {
    clearInterval(rampT);
    if (!sec) { el.volume = to; if (then) then(); return; }
    const from = el.volume, t0 = performance.now();
    rampT = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / (sec * 1000)); el.volume = from + (to - from) * k; if (k >= 1) { clearInterval(rampT); if (then) then(); } }, 30);
  };
  const H = {
    silent: false, output: null, streamed: true,
    start() {
      ST.resolve(rec).then(r => {
        if (dead) return;
        if (!r) { useFallback(ST.lastWhy || "no preview found"); return; }
        el.addEventListener("error", () => useFallback("the browser refused the preview (" + (ERR[(el.error || {}).code] || "unknown") + ")"), { once: true });
        el.src = r.url; el.loop = true; // a 30-second preview loops until stopped
        playing.add(el);
        if (wantPlay()) el.play().then(() => note("playing", r.url), e => { if (wantPlay()) useFallback("play() refused (" + (e && e.name || e) + ")"); });
        if (RP.toast && !ST.quiet) RP.toast("NOW PLAYING: " + r.artist + " - " + r.title + " (preview)");
      });
    },
    stop(fadeSec) {
      dead = true;
      if (fb) { try { fb.stop(fadeSec); } catch (e) { /* ignore */ } }
      playing.delete(el); direct.delete(el);
      const end = () => { try { el.pause(); el.removeAttribute("src"); el.load(); } catch (e) { /* ignore */ } };
      if (fadeSec > 0 && !el.paused) ramp(0, fadeSec, end); else end();
    },
    setVolume(v, ramp2) { if (fb) { try { fb.setVolume(v, ramp2); } catch (e) { /* ignore */ } } ramp(Math.max(0, Math.min(1, v)), ramp2 || 0.05); },
    setFilter(type, f) { if (fb) { try { fb.setFilter(type, f); } catch (e) { /* ignore */ } } },
    setEnergy() {}, setBpm() {}, nudge() {},
    getBpm: () => rec.bpm || 120,
    phase() { return (el.currentTime || 0) * (rec.bpm || 120) / 60; },
    onBeat() {}, connect() {}
  };
  return H;
}

/* hook recordLoop: stream outside mini-games when the patch is on; otherwise the synthesized loop as before */
const synth = audio.recordLoop;
audio.recordLoop = (r, o = {}) => {
  if (!ST.on || !r || !r.artist || (RP.mg && RP.mg.active) || o.synth) return synth(r, o);
  return streamed(r, o, () => synth(r, o));
};
})();
