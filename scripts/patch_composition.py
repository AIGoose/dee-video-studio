#!/usr/bin/env python3
"""patch_composition.py — inject participant name/role/quote before render"""
import argparse, re

def patch(html, name, role, quote):
    html = re.sub(r'Peserta Training', name, html)
    html = re.sub(r'AI Transformation Series &middot; Batch 2026', role, html)
    if quote:
        html = re.sub(
            r'(&ldquo;)(.*?)(&rdquo;)',
            lambda m: f'&ldquo;{quote}&rdquo;',
            html, flags=re.DOTALL
        )
    html = re.sub(r'Peserta &middot; AI Transformation Series', f'{name} &middot; AI Transformation Series', html)
    return html

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--name", default="Peserta Training")
    p.add_argument("--role", default="AI Transformation Series")
    p.add_argument("--quote", default="")
    args = p.parse_args()
    with open(args.input, encoding="utf-8") as f: html = f.read()
    with open(args.output, "w", encoding="utf-8") as f: f.write(patch(html, args.name, args.role, args.quote))
    print(f"Patched: {args.output}")

if __name__ == "__main__":
    main()
