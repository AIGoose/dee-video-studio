# dee-video-studio

**HyperFrames x GitHub Actions x Hugging Face**  
Testimonial video pipeline for Dee Ferdinand AI / MAIN AI.  
No HeyGen subscription. No paid API. 100% open-source.

---

## Pipeline

```
Google Drive MOV
  → gdown download (GitHub Actions)
  → ffmpeg MOV→MP4
  → patch_composition.py (inject name/role/quote)
  → npx hyperframes render (headless Chrome + ffmpeg)
  → HuggingFace dataset: AIgoose/video-renders
```

---

## Run a render

**Actions → Render Testimonial Video → Run workflow**

| Input | What to fill |
|-------|-------------|
| `gdrive_file_id` | The ID from the Drive share URL |
| `participant_name` | For the lower-third (e.g. Budi Santoso) |
| `participant_role` | Role line (e.g. Head of Digital · PT Maju) |
| `pull_quote` | Strongest spoken line in Indonesian |

Output lands at:  
`https://huggingface.co/datasets/AIgoose/video-renders/resolve/main/renders/<filename>.mp4`

---

## One-time setup

1. **GitHub Secret**: Settings → Secrets → `HF_TOKEN` (your HF write token from hf.co/settings/tokens)
2. **Drive permission**: Set the MOV to "Anyone with the link" → Viewer

---

## Composition overlay map

| Overlay | Timing | Description |
|---------|--------|-------------|
| Name card | 0–4s | Program name + brand |
| Lower-third | 8–18s | Participant name + role |
| Pull quote | 30–48s | Strongest spoken line |
| Stat callout | 52–64s | 1,000+ professionals trained |
| Feature chips | 66–78s | 80% hands-on, langsung praktek, real output |
| Brand outro | 83–90s | Dee Ferdinand AI CTA |

---

HyperFrames: https://github.com/heygen-com/hyperframes
