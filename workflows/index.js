// workflows/index.js
// All workflows produce correct HyperFrames HTML:
// - Every timed element has class="clip" + data-start + data-duration + data-track-index
// - GSAP timeline is paused: true and registered on window.__timelines[compId]
// - Video elements wrapped in divs, never animated directly
// - tl.set({},{},DURATION) extends timeline to full length

function assetRef(media, idx) {
  if (!media || !media.length) return './assets/placeholder.jpg';
  return media[idx % media.length]?.rel || './assets/placeholder.jpg';
}

function videoOrImg(m) {
  if (!m) return null;
  return m.mime?.startsWith('video/') ? 'video' : 'img';
}

function mediaEl(m, start, duration, trackIdx, volume = 0) {
  if (!m) return '';
  if (m.mime?.startsWith('video/')) {
    return `<div style="position:absolute;inset:0">
      <video data-start="${start}" data-duration="${duration}" data-track-index="${trackIdx}"
             data-volume="${volume}" src="${m.rel}" muted playsinline
             style="width:100%;height:100%;object-fit:cover;"></video>
    </div>`;
  }
  return `<img src="${m.rel}" alt="" style="width:100%;height:100%;object-fit:cover;">`;
}

// ── TESTIMONIAL (30s · 9:16) ─────────────────────────────────────────────────
const testimonial = {
  meta: {
    name: 'Corporate Testimonial', icon: '🏢',
    description: '30s social proof video. 9:16 vertical.',
    format: '9:16', duration: 30, music: 'corporate',
  },

  buildHTML(media, config, compId, w, h, dur) {
    const { clientName = 'Training Session', trainerName = 'Dee Ferdinand',
      tagline = 'AI Corporate Trainer', website = 'deeferdinand.com' } = config;
    const videos = media.filter(m => m.mime?.startsWith('video/'));
    const images = media.filter(m => m.mime?.startsWith('image/'));
    const allMedia = media;

    const m0 = allMedia[0] || null;
    const m1 = allMedia[1] || m0;
    const m2 = allMedia[2] || m0;
    const m3 = allMedia[3] || m1;
    const m4 = allMedia[4] || m2;
    const mVid = videos[0] || null; // testimonial video if available

    const clientLabel = clientName || 'AI Training';
    const year = new Date().getFullYear();

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin:0;padding:0;box-sizing:border-box; }
body { background:#000;overflow:hidden; }
#root { position:relative;width:${w}px;height:${h}px;overflow:hidden;background:#000; }
.scene { position:absolute;inset:0; }
.overlay-dark { position:absolute;inset:0;background:rgba(0,0,0,0.38); }
.overlay-gradient-bottom { position:absolute;bottom:0;left:0;right:0;height:420px;
  background:linear-gradient(transparent,rgba(0,0,0,0.75)); }
#brand-bar { position:absolute;bottom:0;left:0;right:0;padding:18px 48px 30px;
  background:linear-gradient(transparent,rgba(0,0,0,0.72));z-index:100;
  display:flex;align-items:center;gap:10px; }
</style></head><body>
<div id="root" data-composition-id="${compId}" data-start="0" data-width="${w}" data-height="${h}">

<!-- ─── SCENE 1: HOOK 0–4s ─── -->
<div id="s1" class="clip scene" data-start="0" data-duration="4" data-track-index="0">
  ${m0 ? mediaEl(m0, 0, 4, 1, 0) : ''}
  <div class="overlay-dark"></div>
</div>
<div id="cap-h1" class="clip" data-start="0.4" data-duration="3.3" data-track-index="2"
     style="position:absolute;bottom:560px;left:0;right:0;padding:0 48px;
            text-align:center;font-size:88px;font-weight:900;color:#fff;
            font-family:-apple-system,'Inter',sans-serif;line-height:1.1;
            text-shadow:0 4px 20px rgba(0,0,0,0.9);">
  Ini yang terjadi
</div>
<div id="cap-h2" class="clip" data-start="0.7" data-duration="3.0" data-track-index="3"
     style="position:absolute;bottom:440px;left:0;right:0;padding:0 48px;
            text-align:center;font-size:58px;font-weight:700;
            color:rgba(255,255,255,0.85);
            font-family:-apple-system,'Inter',sans-serif;
            text-shadow:0 3px 14px rgba(0,0,0,0.85);">
  ketika tim belajar AI
</div>

<!-- ─── SCENE 2: PROOF 4–8s ─── -->
<div id="s2" class="clip scene" data-start="4" data-duration="4" data-track-index="4">
  ${m1 ? mediaEl(m1, 4, 4, 5, 0) : '<div style="position:absolute;inset:0;background:#111;"></div>'}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.5);"></div>
</div>
<div id="cap-stat" class="clip" data-start="4.4" data-duration="3.3" data-track-index="6"
     style="position:absolute;top:50%;left:0;right:0;transform:translateY(-50%);
            text-align:center;font-family:-apple-system,'Inter',sans-serif;color:#fff;">
  <div style="font-size:104px;font-weight:900;letter-spacing:-2px;line-height:1;
              text-shadow:0 4px 24px rgba(0,0,0,0.9);">1,000+</div>
  <div style="font-size:38px;font-weight:500;opacity:0.85;margin-top:14px;">profesional terlatih</div>
  <div style="font-size:26px;color:rgba(255,255,255,0.6);margin-top:8px;">sejak 2023</div>
</div>
<div id="lt" class="clip" data-start="4.7" data-duration="2.9" data-track-index="7"
     style="position:absolute;bottom:160px;left:0;padding:0 0 0 48px;">
  <div style="background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);
              border-left:5px solid #7C6FE0;padding:14px 24px;
              border-radius:0 10px 10px 0;display:inline-block;">
    <div style="font-size:30px;font-weight:700;color:#fff;">${clientLabel}</div>
    <div style="font-size:19px;color:rgba(255,255,255,0.7);">AI Training · ${year}</div>
  </div>
</div>

<!-- ─── SCENE 3: TESTIMONIAL 8–16s ─── -->
<div id="s3" class="clip scene" data-start="8" data-duration="8" data-track-index="8">
  ${mVid
    ? `<div id="s3vw" style="position:absolute;inset:0;">
    <video data-start="8" data-duration="8" data-track-index="9" data-volume="0.85"
           src="${mVid.rel}" muted playsinline
           style="width:100%;height:100%;object-fit:cover;"></video>
  </div>`
    : `${mediaEl(m2 || m0, 8, 8, 9, 0)}<div class="overlay-dark"></div>`
  }
  <div class="overlay-gradient-bottom"></div>
</div>
<div id="cap-testi" class="clip" data-start="8.5" data-duration="7.2" data-track-index="10"
     style="position:absolute;bottom:220px;left:0;right:0;padding:0 48px;
            text-align:center;font-size:52px;font-weight:700;color:#fff;
            font-family:-apple-system,'Inter',sans-serif;line-height:1.3;
            text-shadow:0 3px 16px rgba(0,0,0,0.9);">
  &ldquo;Saya pikir AI itu susah.<br>Ternyata langsung bisa!&rdquo;
</div>

<!-- ─── SCENE 4: ENERGY B-ROLL 16–23s (3 fast cuts) ─── -->
<div id="s4a" class="clip scene" data-start="16" data-duration="2.5" data-track-index="11">
  ${mediaEl(m0 || m2, 16, 2.5, 12, 0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.28);"></div>
</div>
<div id="cap-e1" class="clip" data-start="16.3" data-duration="2.0" data-track-index="13"
     style="position:absolute;bottom:280px;left:0;right:0;text-align:center;
            font-size:72px;font-weight:900;color:#fff;
            font-family:-apple-system,'Inter',sans-serif;
            text-shadow:0 4px 16px rgba(0,0,0,0.9);">80% hands-on</div>

<div id="s4b" class="clip scene" data-start="18.5" data-duration="2.5" data-track-index="14">
  ${mediaEl(m3 || m1, 18.5, 2.5, 15, 0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.28);"></div>
</div>
<div id="cap-e2" class="clip" data-start="18.8" data-duration="2.0" data-track-index="16"
     style="position:absolute;bottom:280px;left:0;right:0;text-align:center;
            font-size:72px;font-weight:900;color:#fff;
            font-family:-apple-system,'Inter',sans-serif;
            text-shadow:0 4px 16px rgba(0,0,0,0.9);">Langsung praktek</div>

<div id="s4c" class="clip scene" data-start="21" data-duration="2" data-track-index="17">
  ${mediaEl(m4 || m2, 21, 2, 18, 0)}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.28);"></div>
</div>
<div id="cap-e3" class="clip" data-start="21.3" data-duration="1.5" data-track-index="19"
     style="position:absolute;bottom:280px;left:0;right:0;text-align:center;
            font-size:72px;font-weight:900;color:#9EF0C8;
            font-family:-apple-system,'Inter',sans-serif;
            text-shadow:0 4px 16px rgba(0,0,0,0.9);">Real output ✓</div>

<!-- ─── SCENE 5: CTA 23–28s ─── -->
<div id="s5" class="clip scene" data-start="23" data-duration="5" data-track-index="20">
  ${mediaEl(m0, 23, 5, 21, 0)}
  <div style="position:absolute;inset:0;background:rgba(8,4,24,0.62);"></div>
</div>
<div id="cap-cta1" class="clip" data-start="23.4" data-duration="4.3" data-track-index="22"
     style="position:absolute;top:36%;left:0;right:0;padding:0 48px;
            text-align:center;font-size:76px;font-weight:900;color:#fff;
            font-family:-apple-system,'Inter',sans-serif;line-height:1.15;
            text-shadow:0 4px 20px rgba(0,0,0,0.9);">
  Training AI<br>untuk tim kamu?
</div>
<div id="cap-cta2" class="clip" data-start="25" data-duration="2.7" data-track-index="23"
     style="position:absolute;top:58%;left:0;right:0;padding:0 48px;
            text-align:center;font-size:38px;font-weight:500;
            color:rgba(255,255,255,0.75);
            font-family:-apple-system,'Inter',sans-serif;">
  DM · atau klik link di bio
</div>

<!-- ─── SCENE 6: BRAND END CARD 28–30s ─── -->
<div id="s6" class="clip scene" data-start="28" data-duration="2" data-track-index="24"
     style="background:linear-gradient(135deg,#0d0d1f 0%,#1a1040 50%,#0d0d1f 100%);">
  <div style="position:absolute;inset:0;
              background:radial-gradient(ellipse at center,rgba(124,111,224,0.22) 0%,transparent 70%);"></div>
</div>
<div id="end-name" class="clip" data-start="28.2" data-duration="1.8" data-track-index="25"
     style="position:absolute;top:44%;left:0;right:0;text-align:center;
            font-size:66px;font-weight:800;color:#fff;
            font-family:-apple-system,'Inter',sans-serif;">${trainerName}</div>
<div id="end-tag" class="clip" data-start="28.4" data-duration="1.6" data-track-index="26"
     style="position:absolute;top:52%;left:0;right:0;text-align:center;
            font-size:32px;font-weight:500;color:#9990ee;
            font-family:-apple-system,'Inter',sans-serif;">${tagline}</div>
<div id="end-web" class="clip" data-start="28.6" data-duration="1.4" data-track-index="27"
     style="position:absolute;top:58.5%;left:0;right:0;text-align:center;
            font-size:24px;color:rgba(255,255,255,0.5);
            font-family:-apple-system,'Inter',sans-serif;">${website}</div>

<!-- ─── AUDIO ─── -->
<audio data-start="0" data-duration="30" data-track-index="50"
       data-volume="0.26" src="./assets/music.mp3"></audio>

<!-- ─── PERSISTENT BRAND BAR (not a clip) ─── -->
<div id="brand-bar">
  <span style="font-size:22px;font-weight:700;color:#fff;font-family:-apple-system,sans-serif;">
    ${trainerName}</span>
  <span style="font-size:15px;color:rgba(255,255,255,0.6);font-family:-apple-system,sans-serif;">
    · ${tagline}</span>
</div>

<!-- ─── GSAP ANIMATIONS ─── -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script>
  const tl = gsap.timeline({ paused: true });

  // Scene 1: Hook
  tl.from("#cap-h1", { y:50, opacity:0, duration:0.45, ease:"power3.out" }, 0.4);
  tl.from("#cap-h2", { y:35, opacity:0, duration:0.4,  ease:"power3.out" }, 0.7);
  tl.to("#s1",       { opacity:0, duration:0.3 }, 3.7);

  // Scene 2: Proof
  tl.from("#s2",       { opacity:0, duration:0.3 }, 4);
  tl.from("#cap-stat", { scale:0.72, opacity:0, duration:0.5, ease:"back.out(1.7)" }, 4.4);
  tl.from("#lt",       { x:-320, opacity:0, duration:0.4, ease:"power3.out" }, 4.7);
  tl.to("#lt",         { x:-320, opacity:0, duration:0.3, ease:"power2.in"  }, 7.3);
  tl.to("#s2",         { opacity:0, duration:0.35 }, 7.65);

  // Scene 3: Testimonial
  tl.from("#s3",         { opacity:0, duration:0.35 }, 8);
  tl.from("#cap-testi",  { y:40, opacity:0, duration:0.45, ease:"power3.out" }, 8.5);
  tl.to("#cap-testi",    { opacity:0, duration:0.3 }, 15.4);
  tl.to("#s3",           { opacity:0, duration:0.35 }, 15.65);

  // Scene 4a: Energy cut 1
  tl.from("#s4a",   { opacity:0, duration:0.18 }, 16);
  tl.from("#cap-e1",{ y:28, opacity:0, duration:0.28, ease:"power2.out" }, 16.3);
  tl.to("#s4a",     { opacity:0, duration:0.18 }, 18.32);

  // Scene 4b: Energy cut 2
  tl.from("#s4b",   { opacity:0, duration:0.18 }, 18.5);
  tl.from("#cap-e2",{ y:28, opacity:0, duration:0.28, ease:"power2.out" }, 18.8);
  tl.to("#s4b",     { opacity:0, duration:0.18 }, 20.82);

  // Scene 4c: Energy cut 3 — scale pop
  tl.from("#s4c",   { opacity:0, duration:0.15 }, 21);
  tl.from("#cap-e3",{ scale:0.78, opacity:0, duration:0.3, ease:"back.out(2)" }, 21.3);
  tl.to("#s4c",     { opacity:0, duration:0.22 }, 22.78);

  // Scene 5: CTA
  tl.from("#s5",      { opacity:0, duration:0.38 }, 23);
  tl.from("#cap-cta1",{ y:42, opacity:0, duration:0.5, ease:"power3.out" }, 23.4);
  tl.from("#cap-cta2",{ y:26, opacity:0, duration:0.45, ease:"power3.out" }, 25);
  tl.to("#s5",        { opacity:0, duration:0.4 }, 27.6);

  // Scene 6: Brand end card
  tl.from("#s6",      { opacity:0, duration:0.4 }, 28);
  tl.from("#end-name",{ y:30, opacity:0, duration:0.45, ease:"power3.out" }, 28.2);
  tl.from("#end-tag", { y:22, opacity:0, duration:0.4,  ease:"power3.out" }, 28.4);
  tl.from("#end-web", { y:16, opacity:0, duration:0.4,  ease:"power3.out" }, 28.6);

  // CRITICAL: extend timeline to full duration
  tl.set({}, {}, ${dur});

  // CRITICAL: register with exact data-composition-id
  window.__timelines = window.__timelines || {};
  window.__timelines["${compId}"] = tl;
</script>
</div></body></html>`;
  },
};

// ── TEASER (30s · 9:16) ─────────────────────────────────────────────────────
const teaser = {
  meta: {
    name: 'Event Teaser', icon: '⚡',
    description: '30s fast-cut teaser. 9:16 vertical.',
    format: '9:16', duration: 30, music: 'energetic',
  },
  buildHTML(media, config, compId, w, h, dur) {
    const { clientName = 'Next Event', trainerName = 'Dee Ferdinand',
      tagline = 'AI Corporate Trainer', website = 'deeferdinand.com' } = config;
    const m = (i) => media[i % Math.max(media.length,1)] || media[0];

    return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin:0;padding:0;box-sizing:border-box; }
body { background:#000;overflow:hidden; }
#root { position:relative;width:${w}px;height:${h}px;overflow:hidden;background:#000; }
.s { position:absolute;inset:0; }
#bb { position:absolute;bottom:0;left:0;right:0;padding:18px 48px 30px;
     background:linear-gradient(transparent,rgba(0,0,0,0.72));z-index:100; }
</style></head><body>
<div id="root" data-composition-id="${compId}" data-start="0" data-width="${w}" data-height="${h}">

<div id="s1" class="clip s" data-start="0" data-duration="3" data-track-index="0">
  ${m(0) ? `<img src="${m(0).rel}" style="width:100%;height:100%;object-fit:cover;">` : ''}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);"></div>
</div>
<div id="c1" class="clip" data-start="0.3" data-duration="2.5" data-track-index="1"
     style="position:absolute;top:42%;left:0;right:0;text-align:center;
            font-size:100px;font-weight:900;color:#fff;
            font-family:-apple-system,sans-serif;letter-spacing:-2px;
            text-shadow:0 4px 20px rgba(0,0,0,0.9);">COMING<br>SOON</div>

<div id="s2" class="clip s" data-start="3" data-duration="3" data-track-index="2">
  ${m(1) ? `<img src="${m(1).rel}" style="width:100%;height:100%;object-fit:cover;">` : ''}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);"></div>
</div>
<div id="c2" class="clip" data-start="3.3" data-duration="2.4" data-track-index="3"
     style="position:absolute;bottom:260px;left:0;right:0;text-align:center;
            font-size:68px;font-weight:900;color:#fff;
            font-family:-apple-system,sans-serif;
            text-shadow:0 3px 16px rgba(0,0,0,0.9);">${clientName}</div>

<div id="s3" class="clip s" data-start="6" data-duration="3" data-track-index="4">
  ${m(2) ? `<img src="${m(2).rel}" style="width:100%;height:100%;object-fit:cover;">` : ''}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);"></div>
</div>
<div id="c3" class="clip" data-start="6.3" data-duration="2.4" data-track-index="5"
     style="position:absolute;bottom:260px;left:0;right:0;text-align:center;
            font-size:68px;font-weight:900;color:#fff;
            font-family:-apple-system,sans-serif;
            text-shadow:0 3px 16px rgba(0,0,0,0.9);">AI Training</div>

<div id="s4" class="clip s" data-start="9" data-duration="3" data-track-index="6">
  ${m(0) ? `<img src="${m(0).rel}" style="width:100%;height:100%;object-fit:cover;">` : ''}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);"></div>
</div>
<div id="c4" class="clip" data-start="9.3" data-duration="2.4" data-track-index="7"
     style="position:absolute;bottom:260px;left:0;right:0;text-align:center;
            font-size:68px;font-weight:900;color:#9EF0C8;
            font-family:-apple-system,sans-serif;
            text-shadow:0 3px 16px rgba(0,0,0,0.9);">Hands-on. Now.</div>

<div id="s5" class="clip s" data-start="12" data-duration="3" data-track-index="8">
  ${m(1) ? `<img src="${m(1).rel}" style="width:100%;height:100%;object-fit:cover;">` : ''}
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);"></div>
</div>
<div id="c5" class="clip" data-start="12.3" data-duration="2.4" data-track-index="9"
     style="position:absolute;bottom:260px;left:0;right:0;text-align:center;
            font-size:68px;font-weight:900;color:#fff;
            font-family:-apple-system,sans-serif;
            text-shadow:0 3px 16px rgba(0,0,0,0.9);">Real results.</div>

<div id="s6" class="clip s" data-start="15" data-duration="12" data-track-index="10">
  ${m(2) ? `<img src="${m(2).rel}" style="width:100%;height:100%;object-fit:cover;">` : ''}
  <div style="position:absolute;inset:0;background:rgba(8,4,24,0.6);"></div>
</div>
<div id="c6" class="clip" data-start="15.4" data-duration="6" data-track-index="11"
     style="position:absolute;top:38%;left:0;right:0;text-align:center;
            font-size:80px;font-weight:900;color:#fff;
            font-family:-apple-system,sans-serif;line-height:1.2;
            text-shadow:0 4px 20px rgba(0,0,0,0.9);">Save your spot.<br>Link in bio.</div>

<div id="se" class="clip s" data-start="27" data-duration="3" data-track-index="12"
     style="background:linear-gradient(135deg,#0d0d1f,#1a1040,#0d0d1f);">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(124,111,224,0.2),transparent 70%);"></div>
</div>
<div id="en" class="clip" data-start="27.2" data-duration="2.8" data-track-index="13"
     style="position:absolute;top:44%;left:0;right:0;text-align:center;
            font-size:60px;font-weight:800;color:#fff;font-family:-apple-system,sans-serif;">${trainerName}</div>
<div id="et" class="clip" data-start="27.4" data-duration="2.6" data-track-index="14"
     style="position:absolute;top:52%;left:0;right:0;text-align:center;
            font-size:30px;color:#9990ee;font-family:-apple-system,sans-serif;">${tagline}</div>

<audio data-start="0" data-duration="30" data-track-index="50" data-volume="0.3"
       src="./assets/music.mp3"></audio>

<div id="bb">
  <span style="font-size:22px;font-weight:700;color:#fff;font-family:-apple-system,sans-serif;">${trainerName}</span>
  <span style="font-size:15px;color:rgba(255,255,255,0.6);font-family:-apple-system,sans-serif;"> · ${tagline}</span>
</div>

<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script>
  const tl = gsap.timeline({ paused: true });
  tl.from("#c1", { scale:0.75, opacity:0, duration:0.4, ease:"back.out(1.7)" }, 0.3);
  tl.to("#s1", { opacity:0, duration:0.2 }, 2.8);
  tl.from("#s2", { opacity:0, duration:0.2 }, 3);
  tl.from("#c2", { y:30, opacity:0, duration:0.3, ease:"power2.out" }, 3.3);
  tl.to("#s2", { opacity:0, duration:0.2 }, 5.8);
  tl.from("#s3", { opacity:0, duration:0.2 }, 6);
  tl.from("#c3", { y:30, opacity:0, duration:0.3, ease:"power2.out" }, 6.3);
  tl.to("#s3", { opacity:0, duration:0.2 }, 8.8);
  tl.from("#s4", { opacity:0, duration:0.2 }, 9);
  tl.from("#c4", { scale:0.8, opacity:0, duration:0.3, ease:"back.out(2)" }, 9.3);
  tl.to("#s4", { opacity:0, duration:0.2 }, 11.8);
  tl.from("#s5", { opacity:0, duration:0.2 }, 12);
  tl.from("#c5", { y:30, opacity:0, duration:0.3, ease:"power2.out" }, 12.3);
  tl.to("#s5", { opacity:0, duration:0.2 }, 14.8);
  tl.from("#s6", { opacity:0, duration:0.3 }, 15);
  tl.from("#c6", { y:40, opacity:0, duration:0.5, ease:"power3.out" }, 15.4);
  tl.to("#s6", { opacity:0, duration:0.35 }, 26.65);
  tl.from("#se", { opacity:0, duration:0.35 }, 27);
  tl.from("#en", { y:25, opacity:0, duration:0.4, ease:"power3.out" }, 27.2);
  tl.from("#et", { y:18, opacity:0, duration:0.35, ease:"power3.out" }, 27.4);
  tl.set({}, {}, ${dur});
  window.__timelines = window.__timelines || {};
  window.__timelines["${compId}"] = tl;
</script>
</div></body></html>`;
  },
};

// Trailer and Community reuse testimonial pattern
const trailer = { ...testimonial, meta: { ...testimonial.meta, name: 'Cinematic Trailer', icon: '🎬', duration: 60 } };
const community = { ...testimonial, meta: { ...testimonial.meta, name: 'Community Story', icon: '🤝' } };

export const WORKFLOWS = { testimonial, teaser, trailer, community };
