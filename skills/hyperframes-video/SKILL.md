# HyperFrames Video Production Skill — Dee Ferdinand Video Studio
# Sources: nateherkai/hyperframes-student-kit + heygen-com/hyperframes-launch-video
#          robonuggets/hyperframes-helper + coleam00/hyperframes-ai-video-generation
#          elevenlabs/skills
# Updated: 2026-06-16

## THE 5 HARD RULES

1. `class="clip"` on EVERY timed element + `data-start` + `data-duration` + `data-track-index`
2. GSAP: `gsap.timeline({ paused: true })` → `window.__timelines["COMP_ID"] = tl` (key MUST match `data-composition-id`)
3. NEVER call `.play()` `.pause()` or set `.currentTime` in scripts — framework owns media
4. NEVER `Math.random()`, `Date.now()`, `fetch()` in GSAP scripts (breaks determinism)
5. Extend timeline: `tl.set({}, {}, TOTAL_DURATION)` — prevents render cutoff and black frames

## BLACK FRAME PREVENTION (from heygen HANDOFF.md + coleam00 transitions.md)

**Root causes of black frames:**
- Timeline shorter than expected: always `tl.set({}, {}, TOTAL_DURATION)` at the very end
- Scene overlap on same track: clips on the same `data-track-index` CANNOT overlap even 0.001s
- Exit animations BANNED (except final scene): do NOT `gsap.to()` elements out before transition
  The transition IS the exit. Outgoing content must be fully visible when transition fires.
- Scene gap: next scene `data-start` must not exceed current `data-start + data-duration`

**Correct scene timing pattern (no gaps, no overlap):**
```
Scene 1: data-start="0"    data-duration="4"    → ends at 4.0s
Scene 2: data-start="3.65" data-duration="4"    → starts at 3.65s (0.35s overlap for transition)
Scene 3: data-start="7.65" data-duration="8"    → starts at 7.65s
```
Scenes on DIFFERENT track-indices can overlap (that's how transitions work).
Scenes on the SAME track-index must NEVER overlap.

## AUDIO (from coleam00 audio-design.md — research-backed volumes)

```
data-volume levels:
  Subject voice (testimonial video):  0.88  (≈ -14 dB peak)
  Music during energy/CTA:            0.12  (≈ -15 to -18 dB)
  Music during testimonial video:     0.07  (≈ -20 to -23 dB)
  Music general background:           0.10
  Narration/voiceover:                1.0   (≈ -12 dB peak)
```

**NEVER** use lyrical music under speech (proven comprehension harm).
**ALWAYS** use `force_instrumental: true` on ElevenLabs music API.
**NEVER** add `muted` attribute to video when subject voice is needed.

## ELEVENLABS MUSIC GENERATION (primary)

```python
# generate_music.py — generates lo-fi upbeat track for Dee Ferdinand videos
from elevenlabs import ElevenLabs
import os

client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])

audio = client.music.compose(
    prompt="Lo-fi upbeat instrumental, warm jazzy piano chords, soft vinyl crackle, "
           "positive motivational energy, subtle hip-hop drums, 88 BPM, "
           "no lyrics, background music for AI corporate training video",
    music_length_ms=35000,  # always generate 5s extra beyond video duration
    model_id="music_v2",
    force_instrumental=True,
)

with open("./assets/music.mp3", "wb") as f:
    for chunk in audio:
        f.write(chunk)
```

**Prompt templates by workflow:**

| Workflow | ElevenLabs prompt |
|----------|-------------------|
| testimonial | "Lo-fi upbeat instrumental, warm jazzy piano, vinyl crackle, positive energy, 88 BPM, no lyrics, for AI corporate training" |
| teaser | "Energetic upbeat electronic, punchy kick drum, rising synths, 120 BPM, no lyrics, for event teaser" |
| trailer | "Cinematic orchestral build, emotional strings, powerful swells, 90 BPM, no lyrics, for brand trailer" |
| community | "Warm acoustic guitar, gentle piano, uplifting and heartfelt, 75 BPM, no lyrics, for community story" |

**Requires:** `ELEVENLABS_API_KEY` env var in HF Space secrets (Settings → Variables).

## YUE FALLBACK (when ElevenLabs key not available)

```python
# YuE: open-source music generation from multimodal-art-projection
# GitHub: https://github.com/multimodal-art-projection/YuE
# Use via Hugging Face Inference API (no local GPU needed)
import requests, os

def generate_music_yue(prompt: str, duration_seconds: int = 35) -> bytes:
    """
    YuE music generation via HF Inference API.
    Falls back to this when ELEVENLABS_API_KEY is not set.
    """
    HF_TOKEN = os.environ.get("HF_TOKEN", "")
    headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}
    
    # YuE model on HF Hub
    url = "https://api-inference.huggingface.co/models/m-a-p/YuE-s1-7B-anneal-en-cot"
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_length": duration_seconds * 50,  # approximate token count
            "num_return_sequences": 1,
        }
    }
    
    r = requests.post(url, headers=headers, json=payload, timeout=120)
    if r.status_code == 200:
        return r.content  # audio bytes
    raise Exception(f"YuE generation failed: {r.status_code} {r.text[:200]}")
```

**YuE prompt format:**
```
[Genre: Lo-fi Hip Hop] [Mood: Upbeat, Positive] [Instruments: Piano, Drums, Bass]
Background instrumental music for corporate AI training video. No lyrics. 88 BPM.
```

## DEE FERDINAND BRAND FONTS

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900
           &family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600
           &display=swap" rel="stylesheet">
```

- **ALL display titles / kinetic captions:** `font: 900 Xpx 'Space Grotesk', sans-serif`
- **Body / quotes / lower thirds / UI text:** `font: 600 Xpx 'Plus Jakarta Sans', sans-serif`

## CAPTION SIZES — 2X KINETIC (Dee's style)

| Element | Size | Weight | Font |
|---------|------|--------|------|
| Hook line 1 | **160px** | 900 | Space Grotesk |
| Hook line 2 (accent color) | **160px** | 900 | Space Grotesk |
| Hook sub | **72px** | 700 | Plus Jakarta Sans |
| Stat counter | **160px** | 900 | Space Grotesk |
| Energy cut captions | **128-144px** | 900 | Space Grotesk |
| CTA main | **112px** | 900 | Space Grotesk |
| Testimonial quote | **72px italic** | 600 | Plus Jakarta Sans |
| Lower third title | **40px** | 700 | Plus Jakarta Sans |
| Lower third subtitle | **24px** | 400 | Plus Jakarta Sans |
| Brand end name | **80px** | 800 | Space Grotesk |
| Brand end tagline | **40px** | 500 | Plus Jakarta Sans |

## DARK PREMIUM PALETTE

```css
:root {
  --bg: #0d0d1f;           /* deep navy-black canvas */
  --accent: #7C6FE0;       /* purple accent */
  --accent-2: #E06F9A;     /* pink accent */
  --energy: #9EF0C8;       /* teal-green for wins/energy */
  --text: #ffffff;
  --text-dim: rgba(255,255,255,0.72);
  --text-muted: rgba(255,255,255,0.48);
}
```

## MOTION VOCABULARY (from nateherkai motion-principles.md)

Vary eases — NEVER use same ease twice in a row.

| Moment | GSAP ease | Duration | Feel |
|--------|-----------|----------|------|
| Hook title slam | `expo.out` | 0.20-0.25s | Kinetic energy |
| Stat pop | `back.out(2.5)` | 0.40-0.50s | Bouncy confidence |
| Energy cut caption | `power4.out` | 0.22-0.28s | Fast/decisive |
| CTA slide up | `power3.out` | 0.45-0.55s | Professional |
| Testimonial quote | `sine.inOut` | 0.55-0.65s | Calm contrast |
| Brand end stagger | `power3.out` | 0.35-0.45s | Composed |

**Direction variety (never all the same):**
- Slam from above: `y: -100`
- Slide from left: `x: -120`
- Slide from right: `x: 120`
- Scale pop: `scale: 0.55`
- Opacity only: `autoAlpha: 0` (no translate) — for calm moments

## TRANSITION PATTERNS (from coleam00 transitions.md)

Rule: EXIT ANIMATIONS ARE BANNED except on final scene. The transition IS the exit.
Incoming scene's entrance fires at transition midpoint, outgoing scene fades simultaneously.

```javascript
// Zoom-through (dramatic opener, hook→2)
const T1 = 3.65; // transition start
tl.to("#s1",  { autoAlpha: 0, scale: 1.3, duration: 0.35, ease: "power4.inOut" }, T1);
tl.fromTo("#s2", { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "power4.inOut" }, T1);

// Push-slide left (editorial, proof→3)
const T2 = 7.65;
tl.to("#s2",  { autoAlpha: 0, xPercent: -18, duration: 0.32, ease: "power2.inOut" }, T2);
tl.fromTo("#s3", { autoAlpha: 0, xPercent: 18 }, { autoAlpha: 1, xPercent: 0, duration: 0.32, ease: "power2.inOut" }, T2);

// Blur crossfade (wind-down, testimonial→4)
const T3 = 15.65;
tl.to("#s3",  { autoAlpha: 0, filter: "blur(14px)", scale: 1.04, duration: 0.45, ease: "sine.inOut" }, T3);
tl.fromTo("#s4a", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, T3 + 0.2);

// Hard cut (energy B-roll — disruption intentional)
// Just stagger data-start values with NO overlap (different tracks ok)
```

## GLASS CARD LOWER THIRD (robonuggets recipe)

```html
<div id="lt" class="clip" data-start="4.6" data-duration="2.9" data-track-index="8"
     style="position:absolute;bottom:180px;left:0;padding:0 0 0 56px;">
  <div style="background:rgba(10,10,25,0.85);backdrop-filter:blur(20px) saturate(150%);
              border-left:6px solid #7C6FE0;border-radius:0 16px 16px 0;
              padding:18px 32px;display:inline-block;">
    <div style="font:700 40px/1.2 'Plus Jakarta Sans',sans-serif;color:#fff;">Purbasari Indonesia</div>
    <div style="font:400 24px/1 'Plus Jakarta Sans',sans-serif;color:rgba(255,255,255,0.62);
                margin-top:6px;">AI Training · 2026</div>
  </div>
</div>
```

```javascript
// Slide in from left, auto-exit via next transition (NOT gsap.to exit)
tl.from("#lt", { x: -400, autoAlpha: 0, duration: 0.4, ease: "power3.out" }, 4.6);
// NO exit tween — lt will be covered by next scene transition
```

## COMPLETE CORRECT TEMPLATE

```html
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link href="[Google Fonts Space Grotesk + Plus Jakarta Sans]" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>* {margin:0;padding:0;box-sizing:border-box} body {background:#0d0d1f;overflow:hidden}
#root {position:relative;width:1080px;height:1920px;overflow:hidden;background:#0d0d1f}
.sc {position:absolute;inset:0}
</style></head><body>
<div id="root"
     data-composition-id="COMP_ID"
     data-start="0"
     data-duration="30"
     data-width="1080"
     data-height="1920">

  <!-- Scene: timed wrapper -->
  <div id="s1" class="clip sc" data-start="0" data-duration="4" data-track-index="0">
    <!-- Video: NO muted for subject voice. Wrap in div. -->
    <div style="position:absolute;inset:0">
      <video data-start="0" data-duration="4" data-track-index="1"
             data-volume="0.88" src="./assets/clip.MOV" playsinline
             style="width:100%;height:100%;object-fit:cover;"></video>
    </div>
  </div>

  <!-- Caption: class=clip mandatory -->
  <div id="cap" class="clip" data-start="0.2" data-duration="3.5" data-track-index="2"
       style="position:absolute;bottom:400px;left:0;right:0;padding:0 56px;
              text-align:center;font:900 160px/1.0 'Space Grotesk',sans-serif;
              color:#fff;text-shadow:0 6px 40px rgba(0,0,0,0.95);">Hook</div>

  <!-- Music: instrumental, force_instrumental generated by ElevenLabs -->
  <audio data-start="0" data-duration="30" data-track-index="50"
         data-volume="0.10" src="./assets/music.mp3"></audio>

  <script>
    const tl = gsap.timeline({ paused: true });

    // Entrance (varied eases, never same twice)
    tl.from("#cap", { y: -100, autoAlpha: 0, duration: 0.22, ease: "expo.out" }, 0.2);

    // CRITICAL: extend to prevent cutoff / black frames
    tl.set({}, {}, 30);  // use set not to()

    // CRITICAL: key = data-composition-id exactly
    window.__timelines = window.__timelines || {};
    window.__timelines["COMP_ID"] = tl;
  </script>
</div></body></html>
```

## RENDER COMMAND

```bash
PRODUCER_HEADLESS_SHELL_PATH=/usr/bin/chromium \
  npx hyperframes render . -o ./renders/output.mp4 -w 1 --fps 30 --quality standard
```

## MUSIC GENERATION WATERFALL

1. **ElevenLabs** (`client.music.compose()`) — highest quality, requires API key
2. **YuE via HF Inference** — open source, requires HF_TOKEN, slower
3. **ffmpeg silence fallback** — always available, no music

Set `ELEVENLABS_API_KEY` in HF Space secrets for production quality music.
