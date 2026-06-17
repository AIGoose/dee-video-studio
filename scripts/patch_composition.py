#!/usr/bin/env python3
"""patch_composition.py v2 - inject name/role/quote/durations"""
import argparse, re

def patch(html, name, role, quote, footage_dur, total_dur):
    fd  = int(float(footage_dur))
    td  = int(float(total_dur))
    os  = str(td - 7)   # outro start
    s1  = str(td - 6.5)
    s2  = str(td - 6)
    s3  = str(td - 5.5)
    s4  = str(td - 5)

    html = html.replace("TOTAL_DUR",   str(td))
    html = html.replace("FOOTAGE_DUR", str(fd))
    html = html.replace("OUTRO_START", os)
    html = html.replace("OUTRO_S1",    s1)
    html = html.replace("OUTRO_S2",    s2)
    html = html.replace("OUTRO_S3",    s3)
    html = html.replace("OUTRO_S4",    s4)
    html = re.sub(r'"OUTRO_START"', f'"{os}"', html)
    html = re.sub(r'"OUTRO_S1"',    f'"{s1}"', html)
    html = re.sub(r'"OUTRO_S2"',    f'"{s2}"', html)
    html = re.sub(r'"OUTRO_S3"',    f'"{s3}"', html)
    html = re.sub(r'"OUTRO_S4"',    f'"{s4}"', html)
    html = html.replace("PARTICIPANT_NAME", name)
    html = html.replace("PARTICIPANT_ROLE", role)
    q80 = (quote[:78] + "...") if len(quote) > 80 else quote
    html = html.replace("PULL_QUOTE_TEXT", q80)
    return html

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input",       required=True)
    p.add_argument("--output",      required=True)
    p.add_argument("--name",        default="Peserta Training")
    p.add_argument("--role",        default="AI Transformation Series 2026")
    p.add_argument("--quote",       default="Training ini langsung bisa dipraktek dan hasilnya nyata")
    p.add_argument("--footage-dur", default="75")
    p.add_argument("--total-dur",   default="77.5")
    args = p.parse_args()
    with open(args.input, encoding="utf-8") as f: html = f.read()
    out = patch(html, args.name, args.role, args.quote, args.footage_dur, args.total_dur)
    with open(args.output, "w", encoding="utf-8") as f: f.write(out)
    print(f"Patched OK — footage={args.footage_dur}s total={args.total_dur}s name={args.name}")
if __name__ == "__main__":
    main()
