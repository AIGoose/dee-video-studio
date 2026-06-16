# HyperFrames Video Production Skill
# For: Dee Ferdinand AI Corporate Training videos

## THE 5 HARD RULES (breaking any = broken render)

1. Every timed element MUST have `class="clip"` + `data-start` + `data-duration` + `data-track-index`
2. GSAP timeline MUST be `{ paused: true }` AND registered: `window.__timelines["COMPOSITION_ID"] = tl`
   - Key MUST exactly match `data-composition-id` on root div
3. NEVER call `.play()` `.pause()` or set `.currentTime` on video/audio in scripts
4. NEVER use `Math.random()` — use seeded PRNG for reproducibility
5. Always extend: `tl.set({}, {}, TOTAL_DURATION)` — or render cuts off at last tween

## CORRECT MINIMAL COMPOSITION

```html
<div id="root" data-composition-id="my-video" data-start="0" data-width="1080" data-height="1920">
  <!-- Timed element: MUST have class="clip" -->
  <div id="scene-1" class="clip" data-start="0" data-duration="5" data-track-index="0"
       style="position:absolute;inset:0;background:#000;">
    <!-- Wrap video, never animate video element directly -->
    <div id="vid-wrap" style="position:absolute;inset:0;">
      <video data-start="0" data-duration="5" data-track-index="1" data-volume="0.8"
             src="./assets/clip.mp4" muted playsinline
             style="width:100%;height:100%;object-fit:cover;"></video>
    </div>
  </div>
  <div id="cap" class="clip" data-start="0.3" data-duration="4.5" data-track-index="2"
       style="position:absolute;bottom:300px;left:0;right:0;text-align:center;
              font-size:72px;font-weight:900;color:#fff;">
    Caption text here
  </div>
  <audio data-start="0" data-duration="30" data-track-index="20" data-volume="0.25"
         src="./assets/music.mp3"></audio>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.from("#cap", { y: 40, opacity: 0, duration: 0.4, ease: "power3.out" }, 0.3);
    tl.set({}, {}, 30); // CRITICAL: extend to full duration
    window.__timelines = window.__timelines || {};
    window.__timelines["my-video"] = tl; // CRITICAL: key = data-composition-id
  </script>
</div>
```

## MOTION VOCABULARY
snappily = power4.out 0.2s | smoothly = power2.out 0.4s | dramatically = expo.out 0.6s
bouncy = back.out(1.7) | stat pop = back.out(2) scale from 0.75 | dreamy = sine.inOut

## 30s TESTIMONIAL STRUCTURE (9:16)
0.0–4.0s  HOOK    photo + big stacked caption, slow Ken Burns zoom
4.0–8.0s  PROOF   stat counter scale-pop + lower third client badge
8.0–16.0s STORY   testimonial video (real footage, caption below)
16.0–23.0s ENERGY 3 fast photo cuts (2-2.5s each), kinetic captions
23.0–28.0s CTA    dark overlay photo, CTA caption stack
28.0–30.0s BRAND  dark gradient end card, name + tagline + website

## COMMON BUGS
- Missing class="clip" → element always visible, overlaps everything
- window.__timelines key mismatch → static, no animation
- Animate video directly → frames stop rendering
- No tl.set at end → render stops early
- audio.play() in script → framework sync breaks
