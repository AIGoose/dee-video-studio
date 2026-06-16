#!/usr/bin/env python3
"""
watch_gdrive.py -- Give Claude the ability to WATCH Google Drive videos.

Based on bradautomates/claude-video (MIT). Adapted for private Google Drive.
Pipeline:
  1. Download .MOV/.MP4 from Google Drive (gdown or direct)
  2. Extract frames at auto-scaled fps (same budget as claude-video)
  3. Transcribe: Groq whisper-large-v3 -> OpenAI whisper-1 -> HF Inference
  4. Clean transcript (Indonesian filler words + repetitions)
  5. Score segments -> find best testimonial quote
  6. Print frame paths + transcript for Claude to Read

Usage:
  python3 watch_gdrive.py --local /tmp/video.MOV
  python3 watch_gdrive.py --local /tmp/video.MOV --start 0:23 --end 0:45
  python3 watch_gdrive.py --file-id DRIVE_ID  (shared files only)
  python3 watch_gdrive.py --file-id DRIVE_ID --resolution 1024  (read on-screen text)

Dependencies: ffmpeg, ffprobe, pip install gdown
API keys (at least one): GROQ_API_KEY or OPENAI_API_KEY or HF_TOKEN
"""
from __future__ import annotations
import argparse, json, os, re, subprocess, sys, tempfile
from pathlib import Path

MAX_FPS = 2.0
FILLERS_ID = {
    "eh","ehm","umm","hmm","hm","uh","itu","ya","kan","gitu","jadi",
    "terus","emang","kayak","kaya","oke","nah","tuh","deh","sih","loh","dong"
}
OUTCOME   = ["sekarang","bisa","ternyata","langsung","akhirnya","berhasil"]
SURPRISE  = ["tidak sangka","kaget","ternyata","wow","luar biasa","gak nyangka"]
TRANSFORM = ["dulu","sebelum","awalnya","pikir","tadinya","berubah"]
RECOMMEND = ["rekomen","sarankan","wajib","harus coba","semua orang","tim kamu"]


def download_gdrive(file_id: str, dest_dir: Path) -> Path:
    """Download from Google Drive. gdown for shared files."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    out = dest_dir / f"{file_id}.mov"
    r = subprocess.run(
        ["python3","-m","gdown",f"https://drive.google.com/uc?id={file_id}","-O",str(out)],
        capture_output=True, timeout=300
    )
    if r.returncode == 0 and out.exists() and out.stat().st_size > 10000:
        print(f"[gdrive] Downloaded: {out.name} ({out.stat().st_size//1024}KB)", file=sys.stderr)
        return out
    import urllib.request
    url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm=t"
    urllib.request.urlretrieve(url, out)
    if out.exists() and out.stat().st_size > 10000:
        print(f"[gdrive] Direct: {out.name}", file=sys.stderr)
        return out
    raise SystemExit(
        f"Cannot download {file_id}.\n"
        "If private: use Composio GOOGLEDRIVE_DOWNLOAD_FILE then --local path."
    )


def get_duration(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe","-v","quiet","-print_format","json","-show_format",str(path)],
        capture_output=True, text=True
    )
    return float(json.loads(r.stdout).get("format",{}).get("duration",0))


def auto_fps(duration: float, max_frames: int = 80) -> tuple[float, int]:
    """Same frame budget as bradautomates/claude-video"""
    if   duration <= 30:  target = 30
    elif duration <= 60:  target = 40
    elif duration <= 180: target = 60
    elif duration <= 600: target = 80
    else:                 target = 100
    target = min(target, max_frames, 100)
    fps = min(target / max(duration, 1), MAX_FPS)
    return fps, target


def extract_frames(
    video: Path, out_dir: Path, fps: float,
    resolution: int = 512, start: float | None = None, end: float | None = None
) -> list[dict]:
    out_dir.mkdir(parents=True, exist_ok=True)
    cmd = ["ffmpeg","-i",str(video)]
    if start: cmd += ["-ss", str(start)]
    if end:   cmd += ["-to", str(end)]
    cmd += ["-vf", f"fps={fps:.4f},scale={resolution}:-2",
            "-q:v","3", str(out_dir/"frame_%06d.jpg"), "-y", "-loglevel","error"]
    subprocess.run(cmd, check=True)
    base = start or 0.0
    return [{"path": str(f), "timestamp_seconds": base + i/fps}
            for i, f in enumerate(sorted(out_dir.glob("frame_*.jpg")))]


def fmt_time(s: float) -> str:
    t = int(round(s)); h,r = divmod(t,3600); m,s2 = divmod(r,60)
    return f"{h}:{m:02d}:{s2:02d}" if h else f"{m:02d}:{s2:02d}"


def extract_audio(video: Path, dest: Path) -> Path:
    subprocess.run([
        "ffmpeg","-i",str(video),"-ar","16000","-ac","1",
        "-c:a","libmp3lame","-b:a","32k",str(dest),"-y","-loglevel","error"
    ], check=True)
    return dest


def _multipart(fields: dict, file_field: str, file_path: Path, file_ct: str, boundary: str) -> bytes:
    body = b""
    for k, v in fields.items():
        body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode()
    body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"{file_field}\"; filename=\"{file_path.name}\"\r\nContent-Type: {file_ct}\r\n\r\n".encode()
    body += file_path.read_bytes()
    body += f"\r\n--{boundary}--\r\n".encode()
    return body


def transcribe_groq(audio: Path, key: str) -> list[dict]:
    import urllib.request, ssl
    boundary = "----WatchGroq"
    body = _multipart(
        {"model": "whisper-large-v3", "response_format": "verbose_json",
         "timestamp_granularities[]": "segment"},
        "file", audio, "audio/mpeg", boundary
    )
    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/audio/transcriptions", data=body,
        headers={"Authorization":f"Bearer {key}","Content-Type":f"multipart/form-data; boundary={boundary}"}
    )
    with urllib.request.urlopen(req, context=ssl.create_default_context(), timeout=120) as r:
        d = json.loads(r.read())
    return [{"start":s["start"],"end":s["end"],"text":s["text"].strip()} for s in d.get("segments",[])]


def transcribe_openai(audio: Path, key: str) -> list[dict]:
    import urllib.request, ssl
    boundary = "----WatchOAI"
    body = _multipart({"model":"whisper-1","response_format":"verbose_json"},"file",audio,"audio/mpeg",boundary)
    req = urllib.request.Request(
        "https://api.openai.com/v1/audio/transcriptions", data=body,
        headers={"Authorization":f"Bearer {key}","Content-Type":f"multipart/form-data; boundary={boundary}"}
    )
    with urllib.request.urlopen(req, context=ssl.create_default_context(), timeout=120) as r:
        d = json.loads(r.read())
    return [{"start":s["start"],"end":s["end"],"text":s["text"].strip()} for s in d.get("segments",[])]


def transcribe_hf(audio: Path) -> list[dict]:
    import urllib.request, ssl
    hft = os.environ.get("HF_TOKEN","")
    req = urllib.request.Request(
        "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
        data=audio.read_bytes(),
        headers={"Content-Type":"audio/mpeg",**(({"Authorization":f"Bearer {hft}"}) if hft else {})}
    )
    with urllib.request.urlopen(req, context=ssl.create_default_context(), timeout=180) as r:
        d = json.loads(r.read())
    return [{"start":c["timestamp"][0] or 0,"end":c["timestamp"][1] or 0,"text":c["text"].strip()}
            for c in d.get("chunks",[]) if c.get("text","").strip()]


def transcribe(video: Path, work: Path) -> list[dict]:
    audio = extract_audio(video, work/"audio.mp3")
    if k := os.environ.get("GROQ_API_KEY"):
        try:
            print("[watch] Groq whisper-large-v3...", file=sys.stderr)
            segs = transcribe_groq(audio, k)
            if segs: print(f"[watch] {len(segs)} segments via Groq", file=sys.stderr); return segs
        except Exception as e: print(f"[watch] Groq failed: {e}", file=sys.stderr)
    if k := os.environ.get("OPENAI_API_KEY"):
        try:
            print("[watch] OpenAI whisper-1...", file=sys.stderr)
            segs = transcribe_openai(audio, k)
            if segs: print(f"[watch] {len(segs)} segments via OpenAI", file=sys.stderr); return segs
        except Exception as e: print(f"[watch] OpenAI failed: {e}", file=sys.stderr)
    print("[watch] HF Inference whisper-large-v3...", file=sys.stderr)
    segs = transcribe_hf(audio)
    print(f"[watch] {len(segs)} segments via HF", file=sys.stderr)
    return segs


def clean(segs: list[dict]) -> list[dict]:
    out = []
    for seg in segs:
        words = seg["text"].strip().split()
        while words and words[0].lower().rstrip(",.!?") in FILLERS_ID: words.pop(0)
        while words and words[-1].lower().rstrip(",.!?") in FILLERS_ID: words.pop()
        text = re.sub(r'\b(\w+)(\s+\1)+\b', r'\1', " ".join(words), flags=re.IGNORECASE).strip()
        if len(text) > 3: out.append({**seg, "text": text})
    return out


def best_quote(segs: list[dict]) -> dict:
    best_s, best_i = 0, 0
    for i, seg in enumerate(segs):
        t = seg["text"].lower(); s = 0
        s += sum(2 for m in OUTCOME if m in t)
        s += sum(3 for m in SURPRISE if m in t)
        s += sum(2 for m in TRANSFORM if m in t)
        s += sum(3 for m in RECOMMEND if m in t)
        if any(c.isdigit() for c in t): s += 2
        dur = (seg.get("end") or 0) - (seg.get("start") or 0)
        if 8 <= dur <= 18: s += 2
        if s > best_s: best_s, best_i = s, i
    seg = segs[best_i]
    start, end = seg.get("start",0), seg.get("end",0)
    if (end-start) < 8 and best_i+1 < len(segs):
        n = segs[best_i+1]
        if n.get("end",0)-start <= 15: end=n["end"]; seg={**seg,"text":seg["text"]+" "+n["text"]}
    t = seg["text"].lower()
    qtype = "transformation"
    if any(m in t for m in SURPRISE): qtype = "surprise"
    elif any(m in t for m in OUTCOME): qtype = "outcome"
    elif any(m in t for m in RECOMMEND): qtype = "recommendation"
    return {"quote":seg["text"],"start":round(start,1),"end":round(end,1),
            "duration":round(end-start,1),"type":qtype}


def report(source, video, duration, frames, segs, quote, work):
    fps = len(frames)/max(duration,1)
    print(); print("# watch_gdrive: video report"); print()
    print(f"- **Source:** {source}")
    print(f"- **File:** {video.name}")
    print(f"- **Duration:** {fmt_time(duration)} ({duration:.1f}s)")
    print(f"- **Frames:** {len(frames)} @ {fps:.3f} fps")
    print(f"- **Transcript:** {len(segs)} segments (cleaned)")
    print(); print("## Frames"); print()
    print("**Read each frame path with the Read tool to see the video.**")
    print(f"Frames at: `{work/'frames'}`"); print()
    for f in frames: print(f"- `{f['path']}` (t={fmt_time(f['timestamp_seconds'])})")
    print(); print("## Transcript"); print()
    print("```")
    for seg in segs: print(f"[{fmt_time(seg.get('start',0))}] {seg['text']}")
    print("```")
    print(); print("## Best Testimonial Quote"); print()
    print(f"**Type:** {quote['type']}")
    print(f"**Timestamp:** {fmt_time(quote['start'])} -> {fmt_time(quote['end'])} ({quote['duration']}s)")
    print(f'**Quote:** "{quote["quote"]}"')
    print(); print("---"); print(f"_Work dir: `{work}`_")


def parse_time_str(s: str | None) -> float | None:
    if not s: return None
    p = s.split(":")
    if len(p)==1: return float(p[0])
    if len(p)==2: return int(p[0])*60+float(p[1])
    return int(p[0])*3600+int(p[1])*60+float(p[2])


def main():
    ap = argparse.ArgumentParser(description="Watch Google Drive video for Claude")
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--file-id", help="Google Drive file ID")
    src.add_argument("--local",   help="Local video path")
    ap.add_argument("--start",      help="Focus start (SS or MM:SS)")
    ap.add_argument("--end",        help="Focus end (SS or MM:SS)")
    ap.add_argument("--resolution", type=int, default=512)
    ap.add_argument("--max-frames", type=int, default=80)
    ap.add_argument("--out-dir")
    args = ap.parse_args()

    work = Path(args.out_dir).expanduser() if args.out_dir else Path(tempfile.mkdtemp(prefix="watch-gdrive-"))
    work.mkdir(parents=True, exist_ok=True)
    print(f"[watch] working dir: {work}", file=sys.stderr)

    video = (Path(args.local).expanduser().resolve() if args.local
             else download_gdrive(args.file_id, work/"download"))
    if not video.exists(): raise SystemExit(f"File not found: {video}")
    source = str(video) if args.local else f"drive://{args.file_id}"

    start_sec, end_sec = parse_time_str(args.start), parse_time_str(args.end)
    duration = get_duration(video)
    eff_dur = (end_sec or duration) - (start_sec or 0)
    fps, _ = auto_fps(eff_dur, args.max_frames)

    print(f"[watch] {int(fps*eff_dur)} frames at {fps:.3f}fps over {eff_dur:.1f}s...", file=sys.stderr)
    frames = extract_frames(video, work/"frames", fps, args.resolution, start_sec, end_sec)
    print(f"[watch] {len(frames)} frames extracted", file=sys.stderr)

    segs_raw = transcribe(video, work)
    if start_sec or end_sec:
        lo, hi = start_sec or 0, end_sec or float("inf")
        segs_raw = [s for s in segs_raw if s.get("end",0)>=lo and s.get("start",0)<=hi]
    segs = clean(segs_raw)
    quote = (best_quote(segs) if segs else
             {"quote":"N/A","start":0,"end":0,"duration":0,"type":"none"})

    report(source, video, duration, frames, segs, quote, work)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
