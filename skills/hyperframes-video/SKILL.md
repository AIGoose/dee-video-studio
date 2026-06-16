---
name: hyperframes-video
description: "Build production-ready HyperFrames HTML video compositions for testimonials, teasers, trailers, and community stories. Use when the user mentions 'hyperframes video,' 'testimonial video,' 'HyperFrames composition,' 'render MP4 from HTML,' 'kinetic caption video,' 'Dee Ferdinand video,' 'corporate training video,' 'event teaser video,' or wants to build any HTML-to-MP4 video from Google Drive footage. Also trigger when the user says 'build me a video for [client],' 'make a 30 second testimonial,' or 'create a social proof video.' IMPORTANT: Do NOT ask clarifying questions before acting. Scan Google Drive -> run watch_gdrive.py to WATCH and transcribe each video -> analyze -> present brief -> build on confirmation."
metadata:
  version: 3.0.0
  author: Dee Ferdinand x Claude
  sources:
    - bradautomates/claude-video (MIT)
    - nateherkai/hyperframes-student-kit
    - heygen-com/hyperframes-launch-video
    - coleam00/hyperframes-ai-video-generation
    - elevenlabs/skills
---

# HyperFrames Video Production Skill v3

**ACT-FIRST: Scan Drive -> Watch videos -> Transcribe -> Analyze -> Brief -> Build**

v3 core upgrade: Claude can now WATCH every Google Drive video using `scripts/watch_gdrive.py`
Based on bradautomates/claude-video (MIT) -- extracts frames + transcribes + finds best quote.

---

## PIPELINE

### PHASE 1 -- Scan Google Drive

```
Tool: GOOGLEDRIVE_FIND_FILE (Composio, account: tomoxi)
Scan: 2026/[EventFolder]/Testimoni/ -> .MOV files
Also: Video/ and Foto/ subfolders
Report: "Found X video(s), Y photo(s)" then proceed immediately.
```

### PHASE 2 -- Download Videos

For each .MOV, download to /tmp/[client-slug]/:

```bash
# Option A: Composio (private files)
# Tool: GOOGLEDRIVE_DOWNLOAD_FILE account=tomoxi file_id=[id]

# Option B: Direct (shared files)
python3 -c "import requests; r=requests.get('https://drive.google.com/uc?export=download&id=FILE_ID&confirm=t',stream=True); open('/tmp/video.MOV','wb').write(r.content)"
```

### PHASE 3 -- Watch + Transcribe Each Video

```bash
# Install deps (once)
pip install gdown --break-system-packages
# Set at least one key:
export GROQ_API_KEY=...    # preferred (groq.com free tier)
export OPENAI_API_KEY=...  # fallback
# HF_TOKEN used automatically as final fallback

# Run for each video
python3 ${SKILL_DIR}/scripts/watch_gdrive.py \\
  --local /tmp/purbasari/testimoni_1.MOV --resolution 512

# Focus on a specific moment
python3 ${SKILL_DIR}/scripts/watch_gdrive.py \\
  --local /tmp/purbasari/testimoni_1.MOV --start 0:23 --end 0:45
```

Script outputs:
- Frame paths -> READ each with the Read tool to see the video visually
- Timestamped transcript (cleaned)
- Best testimonial quote with exact timestamp

Sample output:
```
# watch_gdrive: video report
- Duration: 00:47 (47.2s)
- Frames: 28 @ 0.593 fps
- Transcript: 18 segments (cleaned)

## Frames
- `/tmp/watch-gdrive-xxx/frames/frame_000001.jpg` (t=00:01)
...

## Transcript
[00:01] Pertama kali dengar AI, saya pikir ini susah
[00:05] Tapi setelah training, ternyata langsung bisa dipakai
...

## Best Testimonial Quote
Type: outcome
Timestamp: 00:05 -> 00:17 (12s)
Quote: "Setelah training, ternyata langsung bisa dipakai. Sekarang bisa buat konten sendiri"
```

### PHASE 4 -- Analyze + Present Brief (ONE confirmation)

```
BRIEF -- [Client Name]
VIDEOS WATCHED: testimoni_1.MOV (47s, 18 segments)
BEST QUOTE: "[exact quote]" (0:05-0:17, type: outcome)
VISUAL: [describe what frames showed at that moment]
PHOTOS: 28 available for B-roll
RECOMMENDATION: Testimonial 30s | Dark Premium | ElevenLabs lo-fi 88bpm
Say "go" to build.
```

### PHASE 5 -- Style

Read references/styles.md. Auto-assign:
- Corporate + high energy -> Dark Premium (Space Grotesk 160px, #0d0d1f)
- Community/GKI/church -> Warm Documentary (Plus Jakarta 80px, warm brown)
- Teaser/public event -> Bold Editorial (Space Grotesk 128px, white bg)

### PHASE 6 -- Build Composition

Read references/composition.md. Use exact timestamp from watch_gdrive report:

```html
<video data-start="7.65" data-duration="8.85" data-track-index="10"
       data-volume="0.88" src="./assets/testimoni_1.MOV" playsinline
       style="width:100%;height:100%;object-fit:cover;"></video>
```

### PHASE 7 -- Push GitHub + Render HF

Push index.html + meta.json via Composio GITHUB_COMMIT_MULTIPLE_FILES.
POST to https://aigoose-hyperframes-video-studio.hf.space/api/render.
Poll /api/jobs/[id] until done. Share hf_url.

---

## watch_gdrive.py Architecture

Based on bradautomates/claude-video (MIT). Key adaptations:

| Component     | claude-video original   | watch_gdrive adaptation             |
|---------------|-------------------------|-------------------------------------|
| Download      | yt-dlp (public URLs)    | gdown + direct auth (private Drive) |
| Frames        | auto-scaled fps budget  | same logic (<=30s=30f, <=60s=40f)   |
| Transcription | Groq -> OpenAI Whisper  | same + HF Inference fallback        |
| Cleanup       | rolling-duplicate dedup | + Indonesian filler removal         |
| Analysis      | none                    | + best quote extraction (6 markers) |

Transcription waterfall:
1. Groq whisper-large-v3 (GROQ_API_KEY) -- fastest, cheapest
2. OpenAI whisper-1 (OPENAI_API_KEY) -- reliable fallback
3. HF Inference whisper-large-v3 (HF_TOKEN) -- free, already set in Space

---

## THE 5 HARD RULES

1. class="clip" on EVERY timed element + data-start + data-duration + data-track-index
2. gsap.timeline({ paused: true }) -> window.__timelines["COMP_ID"] = tl
3. NEVER .play() .pause() .currentTime in scripts
4. NEVER Math.random(), Date.now(), fetch() in GSAP
5. tl.set({}, {}, TOTAL_DURATION) at the very end

NO muted on video when subject voice is needed.
EXIT ANIMATIONS BANNED except final scene.

---

## REFERENCE FILES

- scripts/watch_gdrive.py  -- Run on every Drive video to watch + transcribe
- references/composition.md -- HTML template, GSAP patterns, scene timing
- references/music.md       -- ElevenLabs API code, YuE fallback
- references/styles.md      -- Dark Premium / Warm Documentary / Bold Editorial
- references/transcription.md -- Quote extraction algorithm detail
- references/workflows.md   -- Scene structures for all 4 video types

## CONNECTIONS

| Tool       | When             | How                                            |
|------------|------------------|------------------------------------------------|
| Drive      | Scan + download  | Composio GOOGLEDRIVE_FIND_FILE account=tomoxi  |
| GitHub     | Push composition | Composio GITHUB_COMMIT_MULTIPLE_FILES AIGoose/ |
| HF Space   | Render video     | POST aigoose-hyperframes-video-studio.hf.space |
| ElevenLabs | Music            | POST /v1/music with xi-api-key header          |
| Groq/OAI   | Transcription    | watch_gdrive.py auto waterfall                 |

## INSTALL watch_gdrive.py

```bash
curl -o watch_gdrive.py https://raw.githubusercontent.com/AIGoose/dee-video-studio/main/skills/hyperframes-video/scripts/watch_gdrive.py
pip install gdown --break-system-packages
python3 watch_gdrive.py --local /path/to/video.MOV
```
