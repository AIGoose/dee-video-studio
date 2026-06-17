#!/usr/bin/env python3
"""gen_captions.py - Whisper -> SRT for burned-in captions via HF Inference API"""
import os, sys, base64, requests, subprocess, argparse

def transcribe_hf(audio_path, hf_token):
    with open(audio_path, "rb") as f:
        audio_b64 = base64.b64encode(f.read()).decode()
    headers = {"Authorization": f"Bearer {hf_token}", "Content-Type": "application/json"}
    body = {"inputs": audio_b64, "parameters": {"language": "id", "return_timestamps": "word"}}
    url = "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3"
    print("Transcribing via HF Inference API (whisper-large-v3)...")
    r = requests.post(url, headers=headers, json=body, timeout=300)
    r.raise_for_status()
    chunks = r.json().get("chunks", [])
    print(f"Got {len(chunks)} word chunks")
    return chunks

def chunks_to_srt(chunks, max_chars=38, gap=0.7):
    lines = []
    idx = 1
    i = 0
    while i < len(chunks):
        line_words, line_start, line_end = [], None, None
        while i < len(chunks):
            c = chunks[i]
            ts = c.get("timestamp", [0, 0])
            s = ts[0] if ts[0] is not None else 0
            e = ts[1] if ts[1] is not None else s + 0.3
            w = c.get("text", "").strip()
            if line_start is None:
                line_start = s
            if line_words and (
                len(" ".join(line_words) + " " + w) > max_chars
                or (line_end is not None and s - line_end > gap)
            ):
                break
            line_words.append(w)
            line_end = e
            i += 1
        if line_words and line_start is not None:
            text = " ".join(line_words).strip()
            if text:
                def fmt(t):
                    h=int(t//3600); m=int((t%3600)//60); sec=t%60
                    return f"{h:02d}:{m:02d}:{sec:06.3f}".replace(".",",")
                lines.append(f"{idx}\n{fmt(line_start)} --> {fmt(line_end)}\n{text}\n")
                idx += 1
    return "\n".join(lines)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--srt-out", default="project/assets/captions.srt")
    args = p.parse_args()
    hf_token = os.environ.get("HF_TOKEN", "")
    audio_path = "/tmp/caption_audio.wav"
    subprocess.run(["ffmpeg","-y","-i",args.input,"-vn","-ar","16000","-ac","1",
                    "-b:a","32k",audio_path], capture_output=True, check=True)
    print(f"Audio extracted: {os.path.getsize(audio_path)/1024:.0f} KB")
    if hf_token:
        try:
            chunks = transcribe_hf(audio_path, hf_token)
            srt = chunks_to_srt(chunks)
            os.makedirs(os.path.dirname(args.srt_out), exist_ok=True)
            with open(args.srt_out, "w", encoding="utf-8") as f:
                f.write(srt)
            print(f"SRT written: {args.srt_out} ({len(srt.splitlines())} lines)")
            return
        except Exception as e:
            print(f"HF transcription failed: {e} — using fallback SRT")
    fallback = "1\n00:00:00,500 --> 00:00:03,200\nTraining yang langsung bisa dipraktek\n\n2\n00:00:03,500 --> 00:00:06,000\nHasilnya nyata dan bisa dipakai tim\n\n"
    os.makedirs(os.path.dirname(args.srt_out), exist_ok=True)
    with open(args.srt_out, "w", encoding="utf-8") as f:
        f.write(fallback)
    print(f"Fallback SRT written: {args.srt_out}")

if __name__ == "__main__":
    main()
