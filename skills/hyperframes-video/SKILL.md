# HyperFrames Production Skill — Dee Ferdinand Video Studio
# Sources: nateherkai/hyperframes-student-kit + heygen-com/hyperframes-launch-video + robonuggets/hyperframes-helper
# Updated: 2026-06-16

## THE 5 HARD RULES
1. `class="clip"` on EVERY timed element + `data-start` + `data-duration` + `data-track-index`
2. GSAP: `gsap.timeline({ paused: true })` → registered as `window.__timelines["COMPOSITION_ID"]` (key MUST match `data-composition-id` exactly)
3. NEVER call `.play()` `.pause()` or set `.currentTime` in scripts — framework owns media sync
4. NEVER use `Math.random()`, `Date.now()`, `fetch()` in GSAP scripts
5. Always extend: `tl.to({}, { duration: TOTAL }, 0)` — prevents black frames at tail

## AUDIO — CRITICAL (most common failure)

### Video audio (subject voice)
```html
<!-- WRONG: muted blocks audio extraction during render -->
<video muted src="./assets/clip.MOV" data-volume="0.85"></video>

<!-- CORRECT: no muted attribute, framework manages sync -->
<video src="./assets/clip.MOV" data-start="8" data-duration="8"
       data-track-index="9" data-volume="0.85" playsinline
       style="width:100%;height:100%;object-fit:cover;"></video>
```
**DO NOT ADD `muted` ATTRIBUTE when you want audio in the render.**
HyperFrames strips audio from `muted` elements. The framework controls playback via `data-start`/`data-volume`.

### Background music
```html
<audio data-start="0" data-duration="30" data-track-index="50"
       data-volume="0.25" src="./assets/music.mp3"></audio>
```
NEVER call `.play()` or `.pause()` on audio in scripts.

### Audio from HANDOFF.md (heygen production notes)
- `data-start`, `data-duration`, `data-track-index`, `data-volume` all required
- Browser preview may be silent due to autoplay policy — click Play in Studio
- Sub-composition timelines must be padded: `tl.to({}, { duration: SLOT_DURATION }, 0)`

## DEE FERDINAND BRAND IDENTITY

### Fonts (Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```
- **Headings / Kinetic titles:** `font-family: 'Space Grotesk', sans-serif` — weight 700-800
- **Body / captions / lower thirds:** `font-family: 'Plus Jakarta Sans', sans-serif` — weight 400-600

### Palette (Dark Premium)
```css
:root {
  --bg: #0d0d1f;           /* deep navy-black */
  --bg-2: #14142a;         /* scene backgrounds */
  --accent: #7C6FE0;       /* purple accent */
  --accent-2: #E06F9A;     /* pink accent */
  --energy: #9EF0C8;       /* energy green for wins */
  --text: #ffffff;
  --text-dim: rgba(255,255,255,0.7);
  --text-muted: rgba(255,255,255,0.5);
}
```

### Visual style: Dark Premium (from nateherkai student-kit)
- Deep bg #0d0d1f with radial glow centers
- Space Grotesk 700-900 for display, Plus Jakarta Sans for body
- Purple/pink gradient accents on key moments
- Grain overlay for cinematic texture
- `expo.out` for kinetic titles, `power3.out` for smooth entries, `back.out(1.7)` for stat pops

## CAPTION SIZES — 2X KINETIC (Dee's testimonial style)

**Testimonial video is KINETIC style = BIG, BOLD, MOVING**

| Element | Size | Weight | Font |
|---------|------|--------|------|
| Hook main | **160px** | 900 | Space Grotesk |
| Hook sub | **88px** | 700 | Plus Jakarta Sans |
| Stat counter | **140px** | 900 | Space Grotesk |
| Energy cuts | **128px** | 900 | Space Grotesk |
| CTA main | **112px** | 900 | Space Grotesk |
| Testimonial quote | **72px** | 600 | Plus Jakarta Sans italic |
| Lower third title | **40px** | 700 | Plus Jakarta Sans |
| Lower third sub | **24px** | 400 | Plus Jakarta Sans |
| Brand end name | **80px** | 800 | Space Grotesk |
| Brand end tag | **40px** | 500 | Plus Jakarta Sans |
| Brand bar persistent | **26px** | 700 | Space Grotesk |

## KINETIC MOTION PATTERNS

From motion-principles.md (nateherkai student-kit):
- Vary eases per scene — never same ease twice in a row
- Speed: 0.15-0.25s = energy/urgency, 0.3-0.5s = professional, 0.6-1.0s = cinematic
- Direction variety: `y: -60` (from above), `x: -80` (from left), `scale: 0.7` (scale in), `autoAlpha` only (no translate)
- Stagger text: multiple spans/divs, `{ stagger: 0.08 }` for word-by-word feel
- Build/breathe/resolve: stagger in → ambient drift → fast exit

### Kinetic title entry patterns (vary per scene)
```javascript
// Pattern A: slam from above (hook)
tl.from("#title", { y: -80, autoAlpha: 0, duration: 0.25, ease: "expo.out" }, 0.2);

// Pattern B: scale pop (stat)
tl.from("#stat", { scale: 0.6, autoAlpha: 0, duration: 0.4, ease: "back.out(2.5)" }, 0.3);

// Pattern C: slide from left (energy)
tl.from("#cap", { x: -100, autoAlpha: 0, duration: 0.3, ease: "power4.out" }, 0.2);

// Pattern D: letter stagger (CTA)
tl.from(".word", { y: 60, autoAlpha: 0, duration: 0.35, stagger: 0.08, ease: "power3.out" }, 0.2);

// Pattern E: opacity only (testimonial quote — calm contrast)
tl.from("#quote", { autoAlpha: 0, duration: 0.6, ease: "sine.inOut" }, 0.5);
```

### Transition patterns (from aisoc-hype + launch-video)
```javascript
// Zoom-through (dramatic, between big scenes)
tl.to("#s1", { autoAlpha: 0, scale: 1.25, duration: 0.35, ease: "power4.inOut" }, 3.95);
tl.fromTo("#s2", { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power4.inOut" }, 3.95);

// Push-slide left (editorial, between cuts)
tl.to("#s1", { autoAlpha: 0, xPercent: -18, duration: 0.3, ease: "power2.inOut" }, 3.95);
tl.fromTo("#s2", { autoAlpha: 0, xPercent: 18 }, { autoAlpha: 1, xPercent: 0, duration: 0.3, ease: "power2.inOut" }, 3.95);

// Blur crossfade (wind-down, into CTA)
tl.to("#s4", { autoAlpha: 0, filter: "blur(16px)", scale: 1.05, duration: 0.6, ease: "sine.inOut" }, 15.8);
tl.fromTo("#s5", { autoAlpha: 0, filter: "blur(16px)", scale: 0.95 }, { autoAlpha: 1, filter: "blur(0px)", scale: 1, duration: 0.6, ease: "sine.inOut" }, 15.8);

// Hard cut (energy/disruption) — just swap data-start with 0 overlap
```

## GLASS CARD RECIPE (from robonuggets)
```css
.glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.08) 100%),
              rgba(20,22,30,0.28);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 22px;
  backdrop-filter: blur(24px) saturate(160%);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.22), 0 16px 48px -12px rgba(0,0,0,0.5);
}
```

## GRAIN OVERLAY (cinematic texture)
```html
<div id="grain" style="position:absolute;inset:0;pointer-events:none;z-index:99;overflow:hidden;">
  <div style="position:absolute;top:-50%;left:-50%;width:200%;height:200%;opacity:0.06;
              background:url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E');
              animation:grain 0.5s steps(1) infinite;"></div>
</div>
<style>@keyframes grain{0%,100%{transform:translate(0,0)}10%{transform:translate(-5%,-5%)}20%{transform:translate(-10%,5%)}30%{transform:translate(5%,-10%)}50%{transform:translate(-10%,5%)}70%{transform:translate(0,10%)}90%{transform:translate(10%,5%)}}</style>
```

## LOWER THIRD (glass card style)
```html
<div id="lt" class="clip" data-start="4.6" data-duration="3.0" data-track-index="7"
     style="position:absolute;bottom:180px;left:0;padding:0 0 0 56px;">
  <div style="background:rgba(10,10,20,0.80);backdrop-filter:blur(16px) saturate(140%);
              border-left:5px solid #7C6FE0;border-radius:0 14px 14px 0;
              padding:16px 28px;display:inline-block;">
    <div style="font:700 40px/1.2 'Plus Jakarta Sans',sans-serif;color:#fff;">Purbasari Indonesia</div>
    <div style="font:400 24px/1 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.65);
                margin-top:6px;">AI Training · Juni 2026</div>
  </div>
</div>
```

## WORKING MUSIC URLS (server-accessible)

Use bensound.com free tier or freesound direct links — avoid FMA (404/503):

```javascript
// In music.js — use these as fallback chain:
const TRACKS = [
  // Try 1: bensound (free tier, requires attribution in metadata only)
  'https://www.bensound.com/bensound-music/bensound-ukulele.mp3',
  // Try 2: ccMixter direct
  'https://dig.ccmixter.org/files/airtone/56796/airtone-_retro_.mp3',
  // Fallback: generate silence with ffmpeg (already implemented)
];
```

## COMPLETE CORRECT STRUCTURE (9:16 · 1080×1920)

```html
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
* { margin:0;padding:0;box-sizing:border-box; }
body { background:#0d0d1f;overflow:hidden; }
#root { position:relative;width:1080px;height:1920px;overflow:hidden;background:#0d0d1f; }
.sc { position:absolute;inset:0; } /* scene base */
</style></head><body>
<div id="root" data-composition-id="COMP_ID" data-start="0" data-width="1080" data-height="1920">

  <!-- Scene: always wrap video in div, never animate video directly -->
  <div id="s1" class="clip sc" data-start="0" data-duration="4" data-track-index="0">
    <div id="s1vw" style="position:absolute;inset:0">
      <!-- NO muted ATTRIBUTE when you want subject audio -->
      <video data-start="0" data-duration="4" data-track-index="1" data-volume="0.9"
             src="./assets/clip.MOV" playsinline
             style="width:100%;height:100%;object-fit:cover;"></video>
    </div>
  </div>

  <!-- Caption: class=clip is mandatory -->
  <div id="cap" class="clip" data-start="0.3" data-duration="3.5" data-track-index="2"
       style="position:absolute;bottom:400px;left:0;right:0;padding:0 56px;text-align:center;
              font:900 160px/1.05 'Space Grotesk',sans-serif;color:#fff;
              text-shadow:0 4px 32px rgba(0,0,0,0.9);">Big Title</div>

  <!-- Music: no muted, no script control -->
  <audio data-start="0" data-duration="30" data-track-index="50"
         data-volume="0.25" src="./assets/music.mp3"></audio>

  <script>
    const tl = gsap.timeline({ paused: true });
    tl.from("#cap", { y: -80, autoAlpha: 0, duration: 0.25, ease: "expo.out" }, 0.3);
    // CRITICAL: extend to prevent black frames
    tl.to({}, { duration: 30 }, 0);
    // CRITICAL: key must match data-composition-id exactly
    window.__timelines = window.__timelines || {};
    window.__timelines["COMP_ID"] = tl;
  </script>
</div></body></html>
```

## RENDER COMMAND
```bash
PRODUCER_HEADLESS_SHELL_PATH=/usr/bin/chromium npx hyperframes render . -o output.mp4 -w 1 --fps 30 --quality standard
```
