#!/usr/bin/env python3
"""patch_composition.py — inject metadata + timestamps at render time"""
import argparse, re

def patch(html, name, role, quote, duration):
    dur = str(int(float(duration)))
    outro_start = str(int(float(duration)) - 7)
    outro_name  = str(int(float(duration)) - 6.5)
    outro_title = str(int(float(duration)) - 6)
    outro_handle= str(int(float(duration)) - 5.5)
    outro_cta   = str(int(float(duration)) - 5)

    html = html.replace("DURATION_PLACEHOLDER", dur)
    html = html.replace("OUTRO_START", outro_start)
    html = html.replace('"OUTRO_START"', f'"+={outro_start}"')
    html = html.replace("OUTRO_NAME",  outro_name)
    html = html.replace("OUTRO_TITLE", outro_title)
    html = html.replace("OUTRO_HANDLE",outro_handle)
    html = html.replace("OUTRO_CTA",   outro_cta)

    # Also fix the GSAP string labels
    html = re.sub(r'"OUTRO_\w+"', lambda m: {
        '"OUTRO_START"':  f'"{outro_start}"',
        '"OUTRO_NAME"':   f'"{outro_name}"',
        '"OUTRO_TITLE"':  f'"{outro_title}"',
        '"OUTRO_HANDLE"': f'"{outro_handle}"',
        '"OUTRO_CTA"':    f'"{outro_cta}"',
    }.get(m.group(0), m.group(0)), html)

    html = html.replace("PARTICIPANT_NAME", name)
    html = html.replace("PARTICIPANT_ROLE", role)
    html = html.replace("PULL_QUOTE_TEXT", quote[:80])
    return html

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input",    required=True)
    p.add_argument("--output",   required=True)
    p.add_argument("--name",     default="Peserta Training")
    p.add_argument("--role",     default="AI Transformation Series · 2026")
    p.add_argument("--quote",    default="Training ini langsung bisa dipraktek!")
    p.add_argument("--duration", default="71")
    args = p.parse_args()

    with open(args.input, encoding="utf-8") as f:
        html = f.read()
    with open(args.output, "w", encoding="utf-8") as f:
        f.write(patch(html, args.name, args.role, args.quote, args.duration))
    print(f"Patched: {args.output} (duration={args.duration}s, name={args.name})")

if __name__ == "__main__":
    main()
