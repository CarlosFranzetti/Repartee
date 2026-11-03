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
ST.resolve = async rec => {
  const c = ST.cache[rec.id]; if (c !== undefined) return c;
  const term = encodeURIComponent(rec.artist + " " + rec.title.replace(/ \(.*\)$/, ""));
  const ac = new AbortController(); const tm = setTimeout(() => ac.abort(), 8000);
  let out = null;
  try {
    const r = await fetch("https://itunes.apple.com/search?term=" + term + "&media=music&entity=song&limit=8", { signal: ac.signal });
    if (r.ok) {
      const j = await r.json();
      const best = (j.results || []).filter(x => x.previewUrl).map(x => [score(rec, x), x]).sort((p, q) => q[0] - p[0])[0];
      if (best && best[0] >= 4) out = { url: best[1].previewUrl, title: best[1].trackName, artist: best[1].artistName, duration: Math.round((best[1].trackTimeMillis || 0) / 1000), preview: true };
    }
  } catch (e) { out = null; } finally { clearTimeout(tm); }
  return (ST.cache[rec.id] = out);
};

/* ---- a streamed "loop": same handle shape as audio.loop, so callers can't tell ---- */
function streamed(rec, o, fallback) {
  const el = new Audio(); el.crossOrigin = "anonymous"; el.preload = "auto";
  let node = null, gain = null, filt = null, dead = false;
  const vol0 = o.volume == null ? 0.8 : o.volume;
  const c = audio.ctx();
  // route through the music bus when the context exists, so the mute switch and the bus volume still apply
  if (c) {
    try {
      node = c.createMediaElementSource(el); gain = c.createGain(); gain.gain.value = vol0;
      filt = c.createBiquadFilter(); filt.type = "allpass"; filt.frequency.value = 20000;
      node.connect(filt); filt.connect(gain); gain.connect(audio.buses().music);
    } catch (e) { node = null; el.volume = Math.min(1, vol0); }
  } else el.volume = Math.min(1, vol0);
  let fb = null; // the synthesized loop takes over if the preview never arrives
  const useFallback = () => { if (dead || fb) return; fb = fallback(); if (fb) { try { fb.start(); } catch (e) { /* ignore */ } } };
  const H = {
    silent: false, output: null, streamed: true,
    start() {
      ST.resolve(rec).then(r => {
        if (dead) return;
        if (!r) { useFallback(); return; }
        el.src = r.url; el.loop = true; // a 30-second preview loops until stopped
        el.addEventListener("error", () => useFallback(), { once: true });
        el.play().catch(() => useFallback());
        if (RP.toast && !ST.quiet) RP.toast("NOW PLAYING: " + r.artist + " - " + r.title + " (preview)");
      });
    },
    stop(fadeSec) {
      dead = true;
      if (fb) { try { fb.stop(fadeSec); } catch (e) { /* ignore */ } }
      const end = () => { try { el.pause(); el.src = ""; } catch (e) { /* ignore */ } try { gain && gain.disconnect(); } catch (e) { /* ignore */ } };
      if (gain && c && fadeSec > 0) { const t = c.currentTime; gain.gain.setValueAtTime(gain.gain.value, t); gain.gain.linearRampToValueAtTime(0.0001, t + fadeSec); setTimeout(end, fadeSec * 1000 + 50); }
      else end();
    },
    setVolume(v, ramp) {
      if (fb) { try { fb.setVolume(v, ramp); } catch (e) { /* ignore */ } }
      if (gain && c) { const t = c.currentTime; gain.gain.cancelScheduledValues(t); gain.gain.setValueAtTime(gain.gain.value, t); gain.gain.linearRampToValueAtTime(Math.max(0.0001, v), t + (ramp || 0.05)); }
      else el.volume = Math.max(0, Math.min(1, v));
    },
    setFilter(type, f) { if (fb) { try { fb.setFilter(type, f); } catch (e) { /* ignore */ } } if (filt) { filt.type = type || "allpass"; filt.frequency.value = f || 20000; } },
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
