---
name: hyperframes-video
description: "Build production-ready HyperFrames HTML video compositions for testimonials, teasers, trailers, and community stories. Use when the user mentions 'hyperframes video,' 'testimonial video,' 'HyperFrames composition,' 'render MP4 from HTML,' 'kinetic caption video,' 'Dee Ferdinand video,' 'corporate training video,' 'event teaser video,' 'video with GSAP,' or wants to build any HTML-to-MP4 video. Also trigger when the user says 'build me a video for [client],' 'make a 30 second testimonial,' 'create a social proof video,' or references any event folder in Google Drive or GitHub. IMPORTANT: Do NOT ask clarifying questions before acting — scan available assets, transcribe, analyze, present a brief, then build immediately on confirmation."
metadata:
  version: 2.0.0
  author: Dee Ferdinand × Claude
---

# HyperFrames Video Production Skill v2

**ACT-FIRST RULE: Never ask questions before scanning. Always scan → transcribe → analyze → brief → confirm → build.**

This skill produces correct HyperFrames HTML compositions with:
- Auto transcription + intelligent quote extraction
- 3 brand-matched visual styles
- ElevenLabs lo-fi music generation
- Direct GitHub push + HuggingFace render
- Zero black frames, correct audio

---

## PIPELINE (6 phases — execute in order, no skipping)

### PHASE 1 — Asset Ingestion

**Auto-detect from 3 sources (in priority order):**

**Source A — Google Drive (via Composio)**
```
Account: tomoxi (tomoxi.marketing@gmail.com)
Tool: GOOGLEDRIVE_FIND_FILE
Path: 2026/[EventFolder]/
Subfolders: Video/ → .MOV files (testimonial clips)
            Foto/  → .JPG files (B-roll photos)
            Testimoni/ → .MOV files (raw testimonial recordings)
```
→ Download all .MOV + .JPG files, save to `/tmp/[client-slug]/`

**Source B — GitHub (via Composio)**
```
Tool: GITHUB_GET_REPOSITORY_CONTENT
Repo: AIGoose/dee-video-studio
Path: projects/[client-slug]/assets/
```

**Source C — Direct upload (user uploads in chat)**
→ Files already in context, save to `/tmp/[client-slug]/`

→ Always report: `"Found X videos, Y photos from [source]"` then proceed immediately.

---

### PHASE 2 — Transcription + Cleaning

For every .MOV in the Testimoni/ folder:

**Transcribe via Whisper (HF Inference)** — see `references/transcription.md` for full code

**Clean:** Remove fillers ("eh", "umm", "itu", "ya", "kan", "gitu"), repetitions, false starts

**Analyze for best moments:**
1. Find the single best 10–15s quote (most emotional/concrete/surprising)
2. Identify the strongest outcome statement ("sekarang saya bisa...")
3. Rate overall energy: low/medium/high → maps to style suggestion
4. Suggest duration: <2min raw → 15s. 2–5min → 30s. 5min+ → 45–60s

---

### PHASE 3 — Intelligent Brief (ONE confirmation point)

Present this brief — **do not ask multiple questions**:

```
📋 VIDEO BRIEF — [Client Name]

SOURCE: [X videos, Y photos from Drive/GitHub/upload]

TRANSCRIPT ANALYSIS:
Best quote: "[actual quote from transcript]" (at 0:42)
Strongest moment: [describe]
Energy level: High → recommended style: Dark Premium

RECOMMENDED BUILD:
• Type: Corporate Testimonial
• Duration: 30s
• Style: Dark Premium (Space Grotesk, kinetic 160px, dark #0d0d1f)
• Music: ElevenLabs lo-fi upbeat 88 BPM
• Quote to use: "[best quote]"

Say "go" to build this, or adjust any parameter above.
```

**If user says "go" or any affirmative → immediately proceed to Phase 4.**

---

### PHASE 4 — Style Selection

Read `references/styles.md` for full CSS/GSAP per style.

| Style | When | Caption | Palette |
|-------|------|---------|--------|
| **Dark Premium** | Corporate, high energy | 160px Space Grotesk | #0d0d1f + purple |
| **Warm Documentary** | Community, GKI, intimate | 80px Plus Jakarta | Warm brown + amber |
| **Bold Editorial** | Teaser, launch, public event | 128px Space Grotesk | White + black |

---

### PHASE 5 — Build + Push to GitHub

Read `references/composition.md` — do not build from memory.

**Commit via Composio:**
```
Tool: GITHUB_COMMIT_MULTIPLE_FILES
Repo: AIGoose/dee-video-studio
Files: projects/[client-slug]/index.html + meta.json
```

---

### PHASE 6 — Render via HuggingFace

```python
import requests, time
r = requests.post(
    "https://aigoose-hyperframes-video-studio.hf.space/api/render",
    files=[("files", ("testimoni.MOV", open(video_path,"rb"), "video/quicktime")),
           ("files", ("foto_1.JPG", open(photo_path,"rb"), "image/jpeg"))],
    data={"workflow":"testimonial","clientName":CLIENT,"trainerName":"Dee Ferdinand",
          "tagline":"AI Corporate Trainer","website":"deeferdinand.com",
          "format":"9:16","musicTrack":"auto","duration":"30"}
)
job_id = r.json()["jobId"]
while True:
    job = requests.get(f"https://aigoose-hyperframes-video-studio.hf.space/api/jobs/{job_id}").json()
    if job["status"] == "done": print(f"\u2705 {job['hf_url']}"); break
    if job["status"] == "error": raise Exception(job["error"])
    time.sleep(15)
```

---

## THE 5 HARD RULES

1. `class="clip"` on EVERY timed element + `data-start` + `data-duration` + `data-track-index`
2. `gsap.timeline({ paused: true })` → `window.__timelines["COMP_ID"] = tl`
3. NEVER `.play()` `.pause()` `.currentTime` — framework controls media
4. NEVER `Math.random()`, `Date.now()`, `fetch()` in GSAP scripts
5. `tl.set({}, {}, TOTAL_DURATION)` at the very end

**NO `muted` on video when subject voice is needed.**
**EXIT ANIMATIONS BANNED** (except final scene).

---

## REFERENCE FILES

- `references/composition.md` — HTML template, GSAP patterns, transitions
- `references/music.md` — ElevenLabs API, YuE fallback, prompts
- `references/styles.md` — Dark Premium / Warm Documentary / Bold Editorial
- `references/transcription.md` — Whisper, cleaning, quote extraction
- `references/workflows.md` — Scene structures for all 4 video types

## CONNECTIONS

| Tool | When | How |
|------|------|-----|
| Google Drive | Scan assets | Composio `GOOGLEDRIVE_FIND_FILE` account=tomoxi |
| GitHub | Push composition | Composio `GITHUB_COMMIT_MULTIPLE_FILES` AIGoose/dee-video-studio |
| HF Space | Render | POST aigoose-hyperframes-video-studio.hf.space/api/render |
| ElevenLabs | Music | POST /v1/music xi-api-key header |
| Whisper | Transcribe | HF Inference openai/whisper-large-v3 |
