---
title: Hyperframes Video Studio
emoji: 🎬
colorFrom: purple
colorTo: pink
sdk: docker
app_port: 7860
pinned: true
---

# 🎬 Hyperframes Video Studio

**Cloud video production studio powered by HyperFrames — Testimonial · Teaser · Trailer generator**

Upload photos + videos from any client event → select a workflow → render a production-ready MP4 with captions and background music. No local setup required.

🔗 **Live:** https://aigoose-hyperframes-video-studio.hf.space

---

## Workflows

| Workflow | Duration | Format | Best For |
|---|---|---|---|
| 🏢 Corporate Testimonial | 75s | 9:16 | Corporate AI training social proof |
| ⚡ Event Teaser | 30s | 9:16 | Upcoming event announcement |
| 🎬 Cinematic Trailer | 60s | 9:16/16:9 | Program recap, brand video |
| 🤝 Community Story | 60s | 9:16 | Community/church/NGO sessions |

---

## How It Works

1. **Upload** photos and videos from your event (drag & drop)
2. **Select** workflow type (Testimonial / Teaser / Trailer / Community)
3. **Fill** project details — client name, trainer name, tagline
4. **Choose** background music (auto-matched or manual)
5. **Render** — HyperFrames builds the composition and encodes MP4
6. **Download** the finished video

---

## Tech Stack

- **[HyperFrames](https://github.com/heygen-com/hyperframes)** (heygen-com) — HTML → MP4 rendering engine, Apache 2.0
- **[FFmpeg](https://github.com/FFmpeg/FFmpeg)** — video encoding
- **Chromium** — headless browser for frame rendering
- **Node.js + Express** — REST API server
- **WebSocket** — real-time render progress
- **Pixabay Music** — 6 royalty-free tracks (free commercial use)

## Reference Repos

| Repo | Purpose |
|---|---|
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | Core HTML→MP4 engine |
| [heygen-com/hyperframes-launches](https://github.com/heygen-com/hyperframes-launches) | Production composition examples |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | Agentic video pipeline patterns |
| [mifi/editly](https://github.com/mifi/editly) | Declarative clip assembly |
| [wzk1015/video-bgm-generation](https://github.com/wzk1015/video-bgm-generation) | AI video→music matching |

---

## Background Music Library

| Track | Mood | BPM | Auto-assigned to |
|---|---|---|---|
| corporate-motivation.mp3 | Corporate | 120 | Testimonial |
| inspiring-cinematic.mp3 | Cinematic | 90 | Trailer |
| upbeat-community.mp3 | Upbeat | 128 | Community |
| warm-documentary.mp3 | Warm | 75 | Community Story |
| tech-corporate.mp3 | Tech | 110 | Teaser |
| action-sport.mp3 | Energetic | 145 | Event Teaser |

All tracks: Pixabay License — free commercial use, no attribution required.

---

## API

```bash
GET  /api/health          # Health check
GET  /api/workflows       # List workflows
GET  /api/music           # List music tracks
POST /api/render          # Start render job (multipart/form-data)
GET  /api/jobs/:id        # Poll job status
GET  /api/download/:id    # Download MP4
```

WebSocket: `wss://aigoose-hyperframes-video-studio.hf.space?job=JOB_ID`

---

Built by Dee Ferdinand × Claude (Anthropic). HyperFrames by HeyGen — Apache 2.0.
