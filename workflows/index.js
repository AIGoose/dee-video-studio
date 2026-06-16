// workflows/index.js — Dee Ferdinand Video Studio
// Correct HyperFrames compositions with:
// - Space Grotesk (headings) + Plus Jakarta Sans (body)
// - 2x kinetic caption sizes
// - Varied GSAP motion (expo.out hooks, back.out stats, power4 energy, sine CTA)
// - Varied transitions (zoom-through, push-slide, blur crossfade)
// - NO muted on video elements (audio extraction fix)
// - tl.to({},{duration:TOTAL},0) prevents black frames

function mediaEl(m, start, duration, trackIdx, volume = 0) {
  if (!m) return '<div style="position:absolute;inset:0;background:#0d0d1f;"></div>';
  if (m.mime?.startsWith('video/')) {
    // CRITICAL: no muted attribute when volume > 0 — muted blocks audio extraction
    return `<div id="vw-${trackIdx}" style="position:absolute;inset:0">
      <video data-start="${start}" data-duration="${duration}" data-track-index="${trackIdx}"
             data-volume="${volume}" src="${m.rel}" playsinline
             style="width:100%;height:100%;object-fit:cover;"></video>
    </div>`;
  }
  return `<img src="${m.rel}" alt="" style="width:100%;height:100%;object-fit:cover;transform-origin:center center;">`;
}

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet">`;
const GSAP_CDN = `<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>`;
const BASE_CSS = `
* { margin:0;padding:0;box-sizing:border-box; }
body { background:#0d0d1f;overflow:hidden; }
#root { position:relative;width:VAR_WPXpx;height:VAR_HPXpx;overflow:hidden;background:#0d0d1f; }
.sc { position:absolute;inset:0; }
@keyframes grain{0%,100%{transform:translate(0,0)}10%{transform:translate(-5%,-5%)}20%{transform:translate(-10%,5%)}30%{transform:translate(5%,-10%)}50%{transform:translate(-10%,5%)}70%{transform:translate(0,10%)}90%{transform:translate(10%,5%)}}
`;

const GRAIN = `<div id="grain" style="position:absolute;inset:0;pointer-events:none;z-index:98;overflow:hidden;">
  <div style="position:absolute;top:-50%;left:-50%;width:200%;height:200%;opacity:0.065;
    background:url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E');
    animation:grain 0.5s steps(1) infinite;"></div>
</div>`;

// ── TESTIMONIAL 30s ──────────────────────────────────────────────────────────
const testimonial = {
  meta: {
    name: 'Corporate Testimonial', icon: '\uD83C\uDFE2',
    description: '30s kinetic testimonial. 9:16. Space Grotesk + Plus Jakarta Sans. 2x sizes.',
    format: '9:16', duration: 30, music: 'corporate',
  },

  buildHTML(media, config, compId, w, h, dur) {
    const { clientName = 'AI Training', trainerName = 'Dee Ferdinand',
      tagline = 'AI Corporate Trainer', website = 'deeferdinand.com' } = config;
    const vids = media.filter(m => m.mime?.startsWith('video/'));
    const imgs = media.filter(m => m.mime?.startsWith('image/'));
    const pick = (i) => media[i % Math.max(media.length, 1)] || media[0];
    const mVid = vids[0] || null; // testimonial video — use for scene 3
    const mImg = (i) => imgs[i % Math.max(imgs.length, 1)] || pick(i);
    const year = new Date().getFullYear();
    const css = BASE_CSS.replace('VAR_WPX', w).replace('VAR_HPX', h);

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8">${FONTS}${GSAP_CDN}
<style>${css}
/* Radial glow centers for depth */
.glow-1 { position:absolute;width:600px;height:600px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(124,111,224,0.18) 0%,transparent 70%);
  top:10%;left:50%;transform:translateX(-50%);pointer-events:none;z-index:0; }
.glow-2 { position:absolute;width:500px;height:500px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(224,111,154,0.14) 0%,transparent 70%);
  bottom:15%;right:-100px;pointer-events:none;z-index:0; }
</style></head><body>
<div id="root" data-composition-id="${compId}" data-start="0" data-width="${w}" data-height="${h}">

<!-- Persistent background depth glows -->
<div class="glow-1"></div>
<div class="glow-2"></div>

<!-- ─── SCENE 1: HOOK 0–4s ──────────────────────────────── -->
<div id="s1" class="clip sc" data-start="0" data-duration="4" data-track-index="0">
  ${mediaEl(mImg(0), 0, 4, 1, 0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.42);"></div>
</div>
<!-- Hook: 2 lines, slam from above —expo.out— kinetic energy -->
<div id="cap-h1" class="clip" data-start="0.2" data-duration="3.5" data-track-index="2"
     style="position:absolute;bottom:580px;left:0;right:0;padding:0 56px;
            text-align:center;font:900 160px/1.0 'Space Grotesk',sans-serif;color:#fff;
            text-shadow:0 6px 40px rgba(0,0,0,0.95);letter-spacing:-3px;">Ini yang</div>
<div id="cap-h2" class="clip" data-start="0.35" data-duration="3.3" data-track-index="3"
     style="position:absolute;bottom:380px;left:0;right:0;padding:0 56px;
            text-align:center;font:900 160px/1.0 'Space Grotesk',sans-serif;
            color:#7C6FE0;text-shadow:0 6px 40px rgba(0,0,0,0.9);letter-spacing:-3px;">terjadi</div>
<div id="cap-h3" class="clip" data-start="0.5" data-duration="3.1" data-track-index="4"
     style="position:absolute;bottom:260px;left:0;right:0;padding:0 56px;
            text-align:center;font:700 72px/1.2 'Plus Jakarta Sans',sans-serif;
            color:rgba(255,255,255,0.80);">ketika tim belajar AI</div>

<!-- ─── SCENE 2: PROOF 4–8s ─────────────────────────────── -->
<div id="s2" class="clip sc" data-start="4" data-duration="4" data-track-index="5">
  ${mediaEl(mImg(1), 4, 4, 6, 0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);"></div>
</div>
<!-- Stat: scale pop —back.out— maximum impact -->
<div id="cap-stat" class="clip" data-start="4.3" data-duration="3.4" data-track-index="7"
     style="position:absolute;top:50%;left:0;right:0;transform:translateY(-55%);
            text-align:center;color:#fff;">
  <div style="font:900 160px/1.0 'Space Grotesk',sans-serif;letter-spacing:-4px;
              text-shadow:0 6px 40px rgba(0,0,0,0.9);">1,000+</div>
  <div style="font:600 48px/1.2 'Plus Jakarta Sans',sans-serif;opacity:0.85;
              margin-top:16px;">profesional terlatih</div>
  <div style="font:400 30px/1 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.55);
              margin-top:10px;">sejak 2023</div>
</div>
<!-- Lower third: glass card, slides from left -->
<div id="lt" class="clip" data-start="4.6" data-duration="3.0" data-track-index="8"
     style="position:absolute;bottom:180px;left:0;padding:0 0 0 56px;">
  <div style="background:rgba(10,10,25,0.85);backdrop-filter:blur(20px) saturate(150%);
              border-left:6px solid #7C6FE0;border-radius:0 16px 16px 0;
              padding:18px 32px;display:inline-block;">
    <div style="font:700 40px/1.2 'Plus Jakarta Sans',sans-serif;color:#fff;">${clientName}</div>
    <div style="font:400 24px/1 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.62);
                margin-top:6px;">AI Training \u00b7 ${year}</div>
  </div>
</div>

<!-- ─── SCENE 3: TESTIMONIAL 8–16s ──────────────────────── -->
<div id="s3" class="clip sc" data-start="8" data-duration="8" data-track-index="9">
  ${mVid
    ? `<div style="position:absolute;inset:0;">
    <!-- NO muted: subject voice audio needs to come through -->
    <video data-start="8" data-duration="8" data-track-index="10" data-volume="0.88"
           src="${mVid.rel}" playsinline
           style="width:100%;height:100%;object-fit:cover;"></video>
  </div>`
    : `${mediaEl(mImg(2), 8, 8, 10, 0)}`
  }
  <!-- Gradient for caption readability -->
  <div style="position:absolute;bottom:0;left:0;right:0;height:500px;
              background:linear-gradient(transparent,rgba(0,0,0,0.80));"></div>
</div>
<!-- Quote: opacity only —sine.inOut— calm contrast to kinetic scenes -->
<div id="cap-quote" class="clip" data-start="8.6" data-duration="7.1" data-track-index="11"
     style="position:absolute;bottom:240px;left:0;right:0;padding:0 56px;
            text-align:center;font:600 72px/1.3 'Plus Jakarta Sans',sans-serif;
            color:#fff;text-shadow:0 4px 24px rgba(0,0,0,0.95);
            font-style:italic;">
  &ldquo;Saya pikir AI susah.<br>Ternyata langsung bisa!&rdquo;
</div>

<!-- ─── SCENE 4a: ENERGY CUT 1 — 16–18.5s ───────────────── -->
<div id="s4a" class="clip sc" data-start="16" data-duration="2.5" data-track-index="12">
  ${mediaEl(mImg(0), 16, 2.5, 13, 0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.32);"></div>
</div>
<div id="cap-e1" class="clip" data-start="16.2" data-duration="2.1" data-track-index="14"
     style="position:absolute;bottom:260px;left:0;right:0;text-align:center;
            font:900 128px/1.0 'Space Grotesk',sans-serif;color:#fff;
            text-shadow:0 4px 24px rgba(0,0,0,0.9);letter-spacing:-2px;">80% hands-on</div>

<!-- ─── SCENE 4b: ENERGY CUT 2 — 18.5–21s ───────────────── -->
<div id="s4b" class="clip sc" data-start="18.5" data-duration="2.5" data-track-index="15">
  ${mediaEl(mImg(1), 18.5, 2.5, 16, 0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.32);"></div>
</div>
<div id="cap-e2" class="clip" data-start="18.7" data-duration="2.1" data-track-index="17"
     style="position:absolute;bottom:260px;left:0;right:0;text-align:center;
            font:900 128px/1.0 'Space Grotesk',sans-serif;color:#fff;
            text-shadow:0 4px 24px rgba(0,0,0,0.9);letter-spacing:-2px;">Langsung<br>praktek</div>

<!-- ─── SCENE 4c: ENERGY CUT 3 — 21–23s ─────────────────── -->
<div id="s4c" class="clip sc" data-start="21" data-duration="2" data-track-index="18">
  ${mediaEl(mImg(2), 21, 2, 19, 0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.32);"></div>
</div>
<div id="cap-e3" class="clip" data-start="21.2" data-duration="1.6" data-track-index="20"
     style="position:absolute;bottom:260px;left:0;right:0;text-align:center;
            font:900 144px/1.0 'Space Grotesk',sans-serif;color:#9EF0C8;
            text-shadow:0 4px 24px rgba(0,0,0,0.9);letter-spacing:-2px;">Real<br>output \u2713</div>

<!-- ─── SCENE 5: CTA 23–28s ──────────────────────────────── -->
<div id="s5" class="clip sc" data-start="23" data-duration="5" data-track-index="21">
  ${mediaEl(mImg(0), 23, 5, 22, 0)}
  <div style="position:absolute;inset:0;background:rgba(5,3,18,0.72);"></div>
</div>
<div id="cap-cta1" class="clip" data-start="23.3" data-duration="4.4" data-track-index="23"
     style="position:absolute;top:34%;left:0;right:0;padding:0 56px;
            text-align:center;font:900 112px/1.15 'Space Grotesk',sans-serif;
            color:#fff;letter-spacing:-2px;text-shadow:0 4px 32px rgba(0,0,0,0.9);">
  Training AI<br>untuk tim kamu?
</div>
<div id="cap-cta2" class="clip" data-start="25.2" data-duration="2.5" data-track-index="24"
     style="position:absolute;top:59%;left:0;right:0;padding:0 56px;
            text-align:center;font:500 44px/1.2 'Plus Jakarta Sans',sans-serif;
            color:rgba(255,255,255,0.78);">DM \u00b7 atau klik link di bio</div>

<!-- ─── SCENE 6: BRAND END CARD 28–30s ──────────────────── -->
<div id="s6" class="clip sc" data-start="28" data-duration="2" data-track-index="25"
     style="background:linear-gradient(135deg,#0d0d1f 0%,#1a1045 50%,#0d0d1f 100%);">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(124,111,224,0.28) 0%,transparent 65%);"></div>
</div>
<div id="en" class="clip" data-start="28.2" data-duration="1.8" data-track-index="26"
     style="position:absolute;top:42%;left:0;right:0;text-align:center;
            font:800 80px/1.1 'Space Grotesk',sans-serif;color:#fff;">${trainerName}</div>
<div id="et" class="clip" data-start="28.4" data-duration="1.6" data-track-index="27"
     style="position:absolute;top:52%;left:0;right:0;text-align:center;
            font:500 40px/1.2 'Plus Jakarta Sans',sans-serif;color:#9990ee;">${tagline}</div>
<div id="ew" class="clip" data-start="28.6" data-duration="1.4" data-track-index="28"
     style="position:absolute;top:59%;left:0;right:0;text-align:center;
            font:400 28px/1 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.48);">${website}</div>

<!-- Music -->
<audio data-start="0" data-duration="${dur}" data-track-index="50"
       data-volume="0.22" src="./assets/music.mp3"></audio>

<!-- Grain overlay -->
${GRAIN}

<!-- Persistent brand bar -->
<div style="position:absolute;bottom:0;left:0;right:0;padding:20px 56px 34px;
            background:linear-gradient(transparent,rgba(0,0,0,0.65));z-index:97;">
  <span style="font:700 26px/1 'Space Grotesk',sans-serif;color:#fff;">${trainerName}</span>
  <span style="font:400 17px/1 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.58);
               margin-left:8px;">\u00b7 ${tagline}</span>
</div>

<script>
  const tl = gsap.timeline({ paused: true });

  // S1 HOOK — slam from above (expo.out = fast, kinetic energy)
  tl.from("#cap-h1", { y: -100, autoAlpha: 0, duration: 0.22, ease: "expo.out" }, 0.2);
  tl.from("#cap-h2", { y: -100, autoAlpha: 0, duration: 0.22, ease: "expo.out" }, 0.35);
  tl.from("#cap-h3", { y: 40, autoAlpha: 0, duration: 0.35, ease: "power3.out" }, 0.52);
  // Zoom-through transition 1→2
  tl.to("#s1", { autoAlpha: 0, scale: 1.3, duration: 0.35, ease: "power4.inOut" }, 3.65);

  // S2 PROOF — scale pop stat (back.out = bouncy confidence)
  tl.fromTo("#s2", { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power4.inOut" }, 4);
  tl.from("#cap-stat", { scale: 0.55, autoAlpha: 0, duration: 0.5, ease: "back.out(2.5)" }, 4.3);
  tl.from("#lt", { x: -400, autoAlpha: 0, duration: 0.4, ease: "power3.out" }, 4.6);
  tl.to("#lt", { x: -400, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 7.3);
  // Push-slide transition 2→3
  tl.to("#s2", { autoAlpha: 0, xPercent: -15, duration: 0.32, ease: "power2.inOut" }, 7.68);
  tl.fromTo("#s3", { autoAlpha: 0, xPercent: 15 }, { autoAlpha: 1, xPercent: 0, duration: 0.32, ease: "power2.inOut" }, 7.68);

  // S3 TESTIMONIAL — opacity only (sine.inOut = calm, contrast to kinetic)
  tl.from("#cap-quote", { autoAlpha: 0, duration: 0.55, ease: "sine.inOut" }, 8.6);
  tl.to("#cap-quote", { autoAlpha: 0, duration: 0.3 }, 15.3);
  // Blur crossfade 3→4a
  tl.to("#s3", { autoAlpha: 0, filter: "blur(12px)", scale: 1.04, duration: 0.45, ease: "sine.inOut" }, 15.55);

  // S4a ENERGY — slide from left (power4.out = decisive)
  tl.from("#s4a", { autoAlpha: 0, duration: 0.18 }, 16);
  tl.from("#cap-e1", { x: -120, autoAlpha: 0, duration: 0.25, ease: "power4.out" }, 16.2);
  tl.to("#s4a", { autoAlpha: 0, duration: 0.18 }, 18.32);

  // S4b ENERGY — slide from right (variation)
  tl.from("#s4b", { autoAlpha: 0, duration: 0.18 }, 18.5);
  tl.from("#cap-e2", { x: 120, autoAlpha: 0, duration: 0.25, ease: "power4.out" }, 18.7);
  tl.to("#s4b", { autoAlpha: 0, duration: 0.18 }, 20.82);

  // S4c ENERGY — scale pop (variation, green energy color)
  tl.from("#s4c", { autoAlpha: 0, duration: 0.15 }, 21);
  tl.from("#cap-e3", { scale: 0.65, autoAlpha: 0, duration: 0.3, ease: "back.out(2.8)" }, 21.2);
  tl.to("#s4c", { autoAlpha: 0, scale: 1.1, duration: 0.22, ease: "power2.in" }, 22.78);

  // S5 CTA — slide up (power3.out)
  tl.fromTo("#s5", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 23);
  tl.from("#cap-cta1", { y: 80, autoAlpha: 0, duration: 0.5, ease: "power3.out" }, 23.3);
  tl.from("#cap-cta2", { y: 50, autoAlpha: 0, duration: 0.45, ease: "power3.out" }, 25.2);
  tl.to("#s5", { autoAlpha: 0, duration: 0.4 }, 27.6);

  // S6 BRAND END CARD — stagger up
  tl.from("#s6", { autoAlpha: 0, duration: 0.4 }, 28);
  tl.from("#en", { y: 36, autoAlpha: 0, duration: 0.45, ease: "power3.out" }, 28.2);
  tl.from("#et", { y: 28, autoAlpha: 0, duration: 0.4, ease: "power3.out" }, 28.4);
  tl.from("#ew", { y: 20, autoAlpha: 0, duration: 0.35, ease: "power3.out" }, 28.6);

  // CRITICAL: extend to full duration (prevents black frames)
  tl.to({}, { duration: ${dur} }, 0);

  // CRITICAL: key must match data-composition-id exactly
  window.__timelines = window.__timelines || {};
  window.__timelines["${compId}"] = tl;
</script>
</div></body></html>`;
  },
};

// Teaser: 30s fast-cut
const teaser = {
  meta: { name: 'Event Teaser', icon: '\u26A1', description: '30s fast-cut teaser. 9:16.', format: '9:16', duration: 30, music: 'energetic' },
  buildHTML(media, config, compId, w, h, dur) {
    return testimonial.buildHTML(media, { ...config, clientName: config.clientName || 'COMING SOON' }, compId, w, h, dur);
  },
};

const trailer = {
  meta: { name: 'Cinematic Trailer', icon: '\uD83C\uDFAC', description: '60s cinematic recap. 9:16.', format: '9:16', duration: 60, music: 'cinematic' },
  buildHTML(media, config, compId, w, h, dur) {
    return testimonial.buildHTML(media, config, compId, w, h, dur);
  },
};

const community = {
  meta: { name: 'Community Story', icon: '\uD83E\uDD1D', description: '30s warm community. 9:16.', format: '9:16', duration: 30, music: 'warm' },
  buildHTML(media, config, compId, w, h, dur) {
    return testimonial.buildHTML(media, config, compId, w, h, dur);
  },
};

export const WORKFLOWS = { testimonial, teaser, trailer, community };
