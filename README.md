---
title: Dee Video Studio
emoji: 🎬
colorFrom: purple
colorTo: pink
sdk: docker
app_port: 7860
pinned: true
---

# 🎬 Dee Video Studio

**HyperFrames-powered cloud video production studio — Testimonial · Teaser · Trailer generator**

Upload photos + videos from any client event → select a workflow → render a production-ready MP4 with captions and background music. No local setup required.

## Workflows

| Workflow | Duration | Format | Best For |
|---|---|---|---|
| 🏢 Corporate Testimonial | 75s | 9:16 | Corporate AI training social proof |
| ⚡ Event Teaser | 30s | 9:16 | Upcoming event announcement |
| 🎬 Cinematic Trailer | 60s | 9:16/16:9 | Program recap, brand video |
| 🤝 Community Story | 60s | 9:16 | Community/church/NGO sessions |

## Tech Stack
- **HyperFrames** (heygen-com/hyperframes) — HTML → MP4 renderer
- **FFmpeg** — video encoding
- **Pixabay Music** — royalty-free tracks (free commercial use)
- **Node.js + Express** — API server
- **WebSocket** — real-time render progress

## API
```
GET  /api/health
GET  /api/workflows
GET  /api/music
POST /api/render   (multipart: files[], workflow, clientName, trainerName, format, musicTrack)
GET  /api/jobs/:id
GET  /api/download/:id
```

Built by Dee Ferdinand × Claude (Anthropic). HyperFrames by HeyGen — Apache 2.0.
