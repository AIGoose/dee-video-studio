// workflows/index.js — Dee Ferdinand Video Studio
// Fixed: black frames, cutoff, timing gaps, exit animation ban, autoAlpha
// Audio: no muted on video, research-backed data-volume levels
// Music: ElevenLabs lo-fi upbeat (primary) → YuE (fallback) → silence

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet">`;
const GSAP = `<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>`;

const GRAIN = `<div style="position:absolute;inset:0;pointer-events:none;z-index:98;overflow:hidden;">
  <div style="position:absolute;top:-50%;left:-50%;width:200%;height:200%;opacity:0.065;
    background:url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E');
    animation:grain 0.5s steps(1) infinite;"></div>
</div>`;

function mediaEl(m, start, dur, tIdx, vol) {
  if (!m) return '<div style="position:absolute;inset:0;background:#0d0d1f;"></div>';
  if (m.mime?.startsWith('video/')) {
    // NO muted — subject voice must come through. Framework controls via data-volume.
    return `<div style="position:absolute;inset:0">
      <video data-start="${start}" data-duration="${dur}" data-track-index="${tIdx}"
             data-volume="${vol}" src="${m.rel}" playsinline
             style="width:100%;height:100%;object-fit:cover;"></video></div>`;
  }
  return `<img src="${m.rel}" alt="" style="width:100%;height:100%;object-fit:cover;">` ;
}

// ── TESTIMONIAL 30s 9:16 ──────────────────────────────────────────────────────────
// Timing: each scene overlaps the previous by 0.35s (transition window)
// Track indices: each scene on unique track, captions on unique tracks
// NO exit animations (rule: transition IS the exit)
const testimonial = {
  meta: { name: 'Corporate Testimonial', icon: '\uD83C\uDFE2',
    description: '30s kinetic testimonial. 9:16. ElevenLabs lo-fi music.',
    format: '9:16', duration: 30, music: 'lofi-upbeat' },

  buildHTML(media, config, compId, w, h, dur) {
    const { clientName='AI Training', trainerName='Dee Ferdinand',
      tagline='AI Corporate Trainer', website='deeferdinand.com' } = config;
    const vids = media.filter(m => m.mime?.startsWith('video/'));
    const imgs = media.filter(m => m.mime?.startsWith('image/'));
    const pick = (i) => media[i % Math.max(media.length,1)] || media[0];
    const img = (i) => imgs[i % Math.max(imgs.length,1)] || pick(i);
    const mVid = vids[0] || null;
    const yr = new Date().getFullYear();

    // Strict scene timing: NO gaps, transitions overlap by 0.35s on DIFFERENT tracks
    // S1: 0-4s    S2: 3.65-8s (T1 at 3.65)    S3: 7.65-16.5s (T2 at 7.65)
    // S4a: 15.85-18.5s  S4b: 18.2-21s  S4c: 20.7-23.2s
    // S5: 22.85-28.5s (T3 at 22.85)   S6: 28.2-30.5s
    // All captions on own tracks, gap from scene start: 0.2s

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8">${FONTS}${GSAP}
<style>
* {margin:0;padding:0;box-sizing:border-box}
body {background:#0d0d1f;overflow:hidden}
#root {position:relative;width:${w}px;height:${h}px;overflow:hidden;background:#0d0d1f}
.sc {position:absolute;inset:0}
.glow-c {position:absolute;border-radius:50%;pointer-events:none}
@keyframes grain{0%,100%{transform:translate(0,0)}10%{transform:translate(-5%,-5%)}30%{transform:translate(5%,-10%)}50%{transform:translate(-10%,5%)}70%{transform:translate(0,10%)}90%{transform:translate(10%,5%)}}
</style></head><body>
<div id="root" data-composition-id="${compId}" data-start="0" data-duration="${dur}" data-width="${w}" data-height="${h}">

<!-- Persistent depth glows -->
<div class="glow-c" style="width:600px;height:600px;top:8%;left:50%;transform:translateX(-50%);
  background:radial-gradient(ellipse,rgba(124,111,224,0.16) 0%,transparent 70%);"></div>
<div class="glow-c" style="width:400px;height:400px;bottom:20%;right:-80px;
  background:radial-gradient(ellipse,rgba(224,111,154,0.12) 0%,transparent 70%);"></div>

<!-- S1 HOOK 0-4s track:0 -->
<div id="s1" class="clip sc" data-start="0" data-duration="4" data-track-index="0">
  ${mediaEl(img(0),0,4,1,0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.40);"></div>
</div>
<div id="h1" class="clip" data-start="0.2" data-duration="3.5" data-track-index="2"
  style="position:absolute;bottom:580px;left:0;right:0;padding:0 56px;text-align:center;
    font:900 160px/1.0 'Space Grotesk',sans-serif;color:#fff;
    text-shadow:0 6px 40px rgba(0,0,0,0.95);letter-spacing:-3px;">Ini yang</div>
<div id="h2" class="clip" data-start="0.35" data-duration="3.3" data-track-index="3"
  style="position:absolute;bottom:376px;left:0;right:0;padding:0 56px;text-align:center;
    font:900 160px/1.0 'Space Grotesk',sans-serif;color:#7C6FE0;
    text-shadow:0 6px 40px rgba(0,0,0,0.9);letter-spacing:-3px;">terjadi</div>
<div id="h3" class="clip" data-start="0.52" data-duration="3.1" data-track-index="4"
  style="position:absolute;bottom:260px;left:0;right:0;padding:0 56px;text-align:center;
    font:700 72px/1.2 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.82);">ketika tim belajar AI</div>

<!-- S2 PROOF 3.65-7.65s track:5 — overlaps S1 by 0.35s for zoom-through transition -->
<div id="s2" class="clip sc" data-start="3.65" data-duration="4" data-track-index="5">
  ${mediaEl(img(1),3.65,4,6,0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.52);"></div>
</div>
<div id="st" class="clip" data-start="3.95" data-duration="3.4" data-track-index="7"
  style="position:absolute;top:50%;left:0;right:0;transform:translateY(-55%);text-align:center;color:#fff;">
  <div style="font:900 160px/1.0 'Space Grotesk',sans-serif;letter-spacing:-4px;
    text-shadow:0 6px 40px rgba(0,0,0,0.9);">1,000+</div>
  <div style="font:600 48px/1.2 'Plus Jakarta Sans',sans-serif;opacity:0.85;margin-top:16px;">profesional terlatih</div>
  <div style="font:400 30px/1 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.55);margin-top:10px;">sejak 2023</div>
</div>
<div id="lt" class="clip" data-start="4.2" data-duration="3.1" data-track-index="8"
  style="position:absolute;bottom:180px;left:0;padding:0 0 0 56px;">
  <div style="background:rgba(10,10,25,0.85);backdrop-filter:blur(20px) saturate(150%);
    border-left:6px solid #7C6FE0;border-radius:0 16px 16px 0;padding:18px 32px;display:inline-block;">
    <div style="font:700 40px/1.2 'Plus Jakarta Sans',sans-serif;color:#fff;">${clientName}</div>
    <div style="font:400 24px/1 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.62);margin-top:6px;">AI Training \u00b7 ${yr}</div>
  </div>
</div>

<!-- S3 TESTIMONIAL 7.65-16.5s track:9 -->
<div id="s3" class="clip sc" data-start="7.65" data-duration="8.85" data-track-index="9">
  ${mVid
    ? `<div style="position:absolute;inset:0">
    <video data-start="7.65" data-duration="8.85" data-track-index="10"
           data-volume="0.88" src="${mVid.rel}" playsinline
           style="width:100%;height:100%;object-fit:cover;"></video></div>`
    : `${mediaEl(img(2),7.65,8.85,10,0)}`}
  <div style="position:absolute;bottom:0;left:0;right:0;height:500px;
    background:linear-gradient(transparent,rgba(0,0,0,0.82));"></div>
</div>
<div id="q" class="clip" data-start="8.2" data-duration="7.7" data-track-index="11"
  style="position:absolute;bottom:240px;left:0;right:0;padding:0 56px;text-align:center;
    font:600 72px/1.3 'Plus Jakarta Sans',sans-serif;color:#fff;font-style:italic;
    text-shadow:0 4px 24px rgba(0,0,0,0.95);">
  &ldquo;Saya pikir AI susah.<br>Ternyata langsung bisa!&rdquo;
</div>

<!-- ENERGY 4 cuts: each ~2s, hard cuts, different tracks -->
<!-- S4a: 15.85-18.5s track:12 -->
<div id="s4a" class="clip sc" data-start="15.85" data-duration="2.65" data-track-index="12">
  ${mediaEl(img(0),15.85,2.65,13,0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.30);"></div>
</div>
<div id="e1" class="clip" data-start="16.05" data-duration="2.3" data-track-index="14"
  style="position:absolute;bottom:260px;left:0;right:0;text-align:center;
    font:900 128px/1.0 'Space Grotesk',sans-serif;color:#fff;
    text-shadow:0 4px 24px rgba(0,0,0,0.9);letter-spacing:-2px;">80%<br>hands-on</div>

<!-- S4b: 18.2-21s track:15 -->
<div id="s4b" class="clip sc" data-start="18.2" data-duration="2.8" data-track-index="15">
  ${mediaEl(img(1),18.2,2.8,16,0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.30);"></div>
</div>
<div id="e2" class="clip" data-start="18.4" data-duration="2.4" data-track-index="17"
  style="position:absolute;bottom:260px;left:0;right:0;text-align:center;
    font:900 128px/1.0 'Space Grotesk',sans-serif;color:#fff;
    text-shadow:0 4px 24px rgba(0,0,0,0.9);letter-spacing:-2px;">Langsung<br>praktek</div>

<!-- S4c: 20.7-23.2s track:18 -->
<div id="s4c" class="clip sc" data-start="20.7" data-duration="2.5" data-track-index="18">
  ${mediaEl(img(2),20.7,2.5,19,0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.30);"></div>
</div>
<div id="e3" class="clip" data-start="20.9" data-duration="2.1" data-track-index="20"
  style="position:absolute;bottom:260px;left:0;right:0;text-align:center;
    font:900 144px/1.0 'Space Grotesk',sans-serif;color:#9EF0C8;
    text-shadow:0 4px 24px rgba(0,0,0,0.9);letter-spacing:-2px;">Real<br>output \u2713</div>

<!-- S5 CTA 22.85-28.5s track:21 -->
<div id="s5" class="clip sc" data-start="22.85" data-duration="5.65" data-track-index="21">
  ${mediaEl(img(0),22.85,5.65,22,0)}
  <div style="position:absolute;inset:0;background:rgba(5,3,18,0.70);"></div>
</div>
<div id="c1" class="clip" data-start="23.1" data-duration="5.1" data-track-index="23"
  style="position:absolute;top:34%;left:0;right:0;padding:0 56px;text-align:center;
    font:900 112px/1.15 'Space Grotesk',sans-serif;color:#fff;
    letter-spacing:-2px;text-shadow:0 4px 32px rgba(0,0,0,0.9);">Training AI<br>untuk tim kamu?</div>
<div id="c2" class="clip" data-start="25" data-duration="3.15" data-track-index="24"
  style="position:absolute;top:59%;left:0;right:0;padding:0 56px;text-align:center;
    font:500 44px/1.2 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.78);">DM \u00b7 atau klik link di bio</div>

<!-- S6 BRAND END 28.2-30.5s track:25 -->
<div id="s6" class="clip sc" data-start="28.2" data-duration="2.3" data-track-index="25"
  style="background:linear-gradient(135deg,#0d0d1f 0%,#1a1045 50%,#0d0d1f 100%);">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(124,111,224,0.26) 0%,transparent 65%);"></div>
</div>
<div id="en" class="clip" data-start="28.4" data-duration="2.1" data-track-index="26"
  style="position:absolute;top:42%;left:0;right:0;text-align:center;
    font:800 80px/1.1 'Space Grotesk',sans-serif;color:#fff;">${trainerName}</div>
<div id="et" class="clip" data-start="28.6" data-duration="1.9" data-track-index="27"
  style="position:absolute;top:52%;left:0;right:0;text-align:center;
    font:500 40px/1.2 'Plus Jakarta Sans',sans-serif;color:#9990ee;">${tagline}</div>
<div id="ew" class="clip" data-start="28.8" data-duration="1.7" data-track-index="28"
  style="position:absolute;top:59%;left:0;right:0;text-align:center;
    font:400 28px/1 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.48);">${website}</div>

<!-- Music: lo-fi upbeat, generated by ElevenLabs -->
<!-- Volume 0.10 during energy/CTA, see audio-design.md -->
<audio data-start="0" data-duration="${dur}" data-track-index="50"
       data-volume="0.10" src="./assets/music.mp3"></audio>

${GRAIN}

<!-- Persistent brand bar (not a clip — always visible) -->
<div style="position:absolute;bottom:0;left:0;right:0;padding:20px 56px 34px;
  background:linear-gradient(transparent,rgba(0,0,0,0.65));z-index:97;">
  <span style="font:700 26px/1 'Space Grotesk',sans-serif;color:#fff;">${trainerName}</span>
  <span style="font:400 17px/1 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.58);margin-left:8px;">\u00b7 ${tagline}</span>
</div>

<script>
  const tl = gsap.timeline({ paused: true });

  // S1 HOOK — slam from above (expo.out: kinetic, fast)
  tl.from("#h1", { y: -100, autoAlpha: 0, duration: 0.22, ease: "expo.out" }, 0.2);
  tl.from("#h2", { y: -100, autoAlpha: 0, duration: 0.22, ease: "expo.out" }, 0.35);
  tl.from("#h3", { y: 40,   autoAlpha: 0, duration: 0.35, ease: "power3.out" }, 0.52);

  // TRANSITION 1→2: Zoom-through (dramatic opener)
  // Rule: NO exit animation on s1 content — transition handles the handoff
  const T1 = 3.65;
  tl.to("#s1",  { autoAlpha: 0, scale: 1.32, duration: 0.35, ease: "power4.inOut" }, T1);
  tl.fromTo("#s2", { autoAlpha: 0, scale: 0.80 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power4.inOut" }, T1);

  // S2 PROOF — scale pop (back.out: bouncy confidence)
  tl.from("#st", { scale: 0.55, autoAlpha: 0, duration: 0.5,  ease: "back.out(2.5)" }, 3.95);
  tl.from("#lt", { x: -400,    autoAlpha: 0, duration: 0.4,  ease: "power3.out"   }, 4.2);
  // NO exit tween on #lt — transition covers it

  // TRANSITION 2→3: Push-slide left (editorial)
  const T2 = 7.65;
  tl.to("#s2",  { autoAlpha: 0, xPercent: -18, duration: 0.32, ease: "power2.inOut" }, T2);
  tl.fromTo("#s3", { autoAlpha: 0, xPercent: 18 }, { autoAlpha: 1, xPercent: 0, duration: 0.32, ease: "power2.inOut" }, T2);

  // S3 TESTIMONIAL — opacity only (sine.inOut: calm, intentional contrast)
  tl.from("#q",  { autoAlpha: 0, duration: 0.55, ease: "sine.inOut" }, 8.2);
  // NO exit tween on #q — transition handles

  // TRANSITION 3→4a: Blur crossfade (drift into energy)
  const T3 = 15.85;
  tl.to("#s3",  { autoAlpha: 0, filter: "blur(14px)", scale: 1.04, duration: 0.45, ease: "sine.inOut" }, T3);
  tl.from("#s4a",  { autoAlpha: 0, duration: 0.22 }, T3 + 0.23);

  // S4a ENERGY — slide from left (power4.out: decisive)
  tl.from("#e1", { x: -120, autoAlpha: 0, duration: 0.25, ease: "power4.out" }, 16.05);

  // S4b: Hard cut (disruption intentional) + slide from right
  tl.from("#s4b",  { autoAlpha: 0, duration: 0.18 }, 18.2);
  tl.from("#e2", { x: 120,  autoAlpha: 0, duration: 0.25, ease: "power4.out" }, 18.4);

  // S4c: Hard cut + scale pop (energy green color)
  tl.from("#s4c",  { autoAlpha: 0, duration: 0.15 }, 20.7);
  tl.from("#e3", { scale: 0.60, autoAlpha: 0, duration: 0.3, ease: "back.out(2.8)" }, 20.9);

  // TRANSITION 4→5: Hard cut into CTA
  tl.from("#s5", { autoAlpha: 0, duration: 0.25 }, 22.85);
  tl.from("#c1", { y: 80, autoAlpha: 0, duration: 0.5, ease: "power3.out" }, 23.1);
  tl.from("#c2", { y: 50, autoAlpha: 0, duration: 0.45, ease: "power3.out" }, 25);

  // TRANSITION 5→6: Brand end card
  const T5 = 28.2;
  tl.to("#s5",  { autoAlpha: 0, duration: 0.3 }, T5);
  tl.from("#s6", { autoAlpha: 0, duration: 0.3 }, T5);
  // Final scene IS allowed exit animations — but we fade in instead
  tl.from("#en", { y: 36, autoAlpha: 0, duration: 0.45, ease: "power3.out" }, 28.4);
  tl.from("#et", { y: 28, autoAlpha: 0, duration: 0.40, ease: "power3.out" }, 28.6);
  tl.from("#ew", { y: 20, autoAlpha: 0, duration: 0.35, ease: "power3.out" }, 28.8);

  // CRITICAL: extend timeline to prevent cutoff + black frames
  // Use tl.set() not tl.to() — tl.to({},{duration:X}) can conflict
  tl.set({}, {}, ${dur});

  // CRITICAL: key MUST match data-composition-id exactly
  window.__timelines = window.__timelines || {};
  window.__timelines["${compId}"] = tl;
</script>
</div></body></html>`;
  },
};

const teaser = {
  meta: { name: 'Event Teaser', icon: '\u26A1', description: '30s fast-cut teaser. 9:16. ElevenLabs energetic.', format: '9:16', duration: 30, music: 'energetic' },
  buildHTML(media, config, compId, w, h, dur) { return testimonial.buildHTML(media, config, compId, w, h, dur); },
};
const trailer = {
  meta: { name: 'Cinematic Trailer', icon: '\uD83C\uDFAC', description: '60s cinematic recap. 9:16.', format: '9:16', duration: 60, music: 'cinematic' },
  buildHTML(media, config, compId, w, h, dur) { return testimonial.buildHTML(media, config, compId, w, h, dur); },
};
const community = {
  meta: { name: 'Community Story', icon: '\uD83E\uDD1D', description: '30s warm community story. 9:16.', format: '9:16', duration: 30, music: 'warm' },
  buildHTML(media, config, compId, w, h, dur) { return testimonial.buildHTML(media, config, compId, w, h, dur); },
};

export const WORKFLOWS = { testimonial, teaser, trailer, community };
