/* The streaming patch: real audio for the real records, hidden behind a tap code on the title logo
   (3 taps on "re:", 2 on "parteé", 3 on "re:"; the screen flashes). With it on, the jukebox and the story's record plays stream
   the actual track instead of the synthesized loop. Resolving uses the same chain as the owner's discogs-stream app
   (youtube-search -> yt-dlp-audio, then invidious-audio), through its public Supabase functions; any failure falls back
   to the built-in loop. Audio only, no video. Mini-games always keep the synthesized loops: beat.Match, crowd.Read and
   go.Digging read phase/BPM/filters off the loop handle, which a streamed track cannot honour. */
(function () {
"use strict";
const RP = window.RP;
const audio = RP.audio;
const store = RP.u.store;
const KEY = "reparte.stream";
const FN = "https://lircvbmcqxbnjaeyrpui.supabase.co/functions/v1/";
// the discogs-stream project's publishable (anon) key: the Supabase gateway refuses function calls without it.
// It is a public browser key by design (the stream app ships it in its bundle too). Paste it in to enable streaming.
const APIKEY = "";
const ST = RP.stream = { on: !!store.get(KEY), unlocked: !!store.get(KEY + ".unlocked"), cache: {} };
ST.setOn = v => { ST.on = !!v; store.set(KEY, ST.on); };
ST.unlock = () => { ST.unlocked = true; store.set(KEY + ".unlocked", true); ST.setOn(true); };

/* ---- the tap code on the title menu ---- */
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

/* ---- resolving: artist + title -> a playable audio url (cached per record) ---- */
const post = async (fn, body, ms) => {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms || 12000);
  try {
    if (!APIKEY) return null;
    const r = await fetch(FN + fn, { method: "POST", headers: { "content-type": "application/json", apikey: APIKEY, authorization: "Bearer " + APIKEY }, body: JSON.stringify(body), signal: ac.signal });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { return null; } finally { clearTimeout(t); }
};
ST.resolve = async rec => {
  const c = ST.cache[rec.id]; if (c) return c;
  const q = rec.artist + " " + rec.title.replace(/ \(.*\)$/, "");
  const s = await post("youtube-search", { query: q, maxResults: 3 }, 12000);
  const vids = (s && (s.videos || s.results || s.items)) || [];
  const id = vids.length ? (vids[0].videoId || vids[0].id) : null;
  if (!id) return null;
  let a = await post("yt-dlp-audio", { videoId: id }, 20000);
  if (!(a && a.success && a.audioUrl)) a = await post("invidious-audio", { videoId: id }, 20000);
  if (!(a && a.success && a.audioUrl)) return null;
  const dur = Number(a.duration) || 0;
  return (ST.cache[rec.id] = { url: a.audioUrl, title: a.title || "", duration: dur });
};

/* ---- a streamed "loop": same handle shape as audio.loop, so callers can't tell ---- */
function streamed(rec, o, fallback) {
  const el = new Audio(); el.crossOrigin = "anonymous"; el.preload = "auto";
  let node = null, gain = null, filt = null, dead = false, started = false;
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
  let fb = null; // the synthesized loop takes over if the stream never arrives
  const useFallback = () => { if (dead || fb) return; fb = fallback(); if (fb) { try { fb.start(); } catch (e) { /* ignore */ } } };
  const H = {
    silent: false, output: null, streamed: true,
    start() {
      started = true;
      ST.resolve(rec).then(r => {
        if (dead) return;
        if (!r) { useFallback(); return; }
        el.src = r.url;
        // the best-matching portion: skip the intro, land a third of the way in, where the groove usually is
        const seek = r.duration > 90 ? Math.floor(r.duration / 3) : 0;
        el.addEventListener("loadedmetadata", () => { try { if (seek) el.currentTime = seek; } catch (e) { /* ignore */ } }, { once: true });
        el.addEventListener("error", () => useFallback(), { once: true });
        el.loop = true;
        el.play().catch(() => useFallback());
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
