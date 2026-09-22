"""
Generates the Listen/Slow audio for every phrase in Tamil Shikho, using
Microsoft Edge's free neural voices (the "edge-tts" package).

Setup (once):
    pip install edge-tts

Run:
    python make_audio.py
        Generates every file into ./audio-new/. Copy that folder's contents
        into ./audio/ next to index.html when you're happy with it (it will
        not overwrite ./audio/ directly, so you can compare old vs new).

    python make_audio.py --list
        Prints every Tamil (ta-IN) voice edge-tts currently has, in case
        the default voice below stops working or you want to try the other
        one.

    python make_audio.py --voice ta-IN-ValluvarNeural
        Use a specific voice instead of the default.

Each phrase gets two files, named from its "said as" (transliteration) text,
the same slug() logic app.js uses:
    audio-new/<slug>.mp3         normal speed
    audio-new/<slug>-slow.mp3    slower, for learners

Reads its word list from data/items.json (kept in sync with data/tamil.js).
"""
import argparse
import asyncio
import json
import re
import sys
from pathlib import Path

try:
    import edge_tts
except ImportError:
    sys.exit("Missing dependency. Run:  pip install edge-tts")

HERE = Path(__file__).resolve().parent
ITEMS_PATH = HERE / "data" / "items.json"
OUT_DIR = HERE / "audio-new"

DEFAULT_VOICE = "ta-IN-PallaviNeural"  # female. Alternative: ta-IN-ValluvarNeural (male)
NORMAL_RATE = "-8%"                    # edge-tts default is already brisk; slow it slightly
SLOW_RATE = "-35%"


def slug(text: str) -> str:
    """Mirrors app.js: const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')..."""
    s = text.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


async def list_voices():
    voices = await edge_tts.list_voices()
    ta_voices = [v for v in voices if v["Locale"].lower() == "ta-in"]
    if not ta_voices:
        print("No ta-IN voices were returned by edge-tts right now.")
        print("Full locale list sample:", sorted({v['Locale'] for v in voices})[:20], "...")
        return
    print("Tamil (ta-IN) voices available:")
    for v in ta_voices:
        print(f"  {v['ShortName']}  ({v['Gender']})")


async def synth(text: str, voice: str, rate: str, out_path: Path):
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(str(out_path))


async def generate(voice: str):
    if not ITEMS_PATH.exists():
        sys.exit(f"Missing {ITEMS_PATH}. Run this script from the tamil-shikho folder.")
    items = json.loads(ITEMS_PATH.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(exist_ok=True)

    print(f"Generating {len(items)} phrases x 2 speeds = {len(items) * 2} files with voice {voice}")
    print(f"Output folder: {OUT_DIR}")

    done = 0
    failed = []
    for item in items:
        ta, rom = item["te"], item["rom"]
        base = slug(rom)
        if not base:
            failed.append((rom, "empty slug"))
            continue
        normal_path = OUT_DIR / f"{base}.mp3"
        slow_path = OUT_DIR / f"{base}-slow.mp3"
        try:
            await synth(ta, voice, NORMAL_RATE, normal_path)
            await synth(ta, voice, SLOW_RATE, slow_path)
            done += 1
            print(f"  [{done}/{len(items)}] {base}")
        except Exception as e:
            failed.append((rom, str(e)))
            print(f"  FAILED: {rom} -> {e}")

    print(f"\nDone. {done} of {len(items)} phrases succeeded ({done * 2} files).")
    if failed:
        print(f"{len(failed)} failed:")
        for rom, err in failed:
            print(f"  - {rom}: {err}")
        print("\nIf every item failed with the same error, the voice name is probably")
        print("wrong or unavailable right now. Run: python make_audio.py --list")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default=DEFAULT_VOICE, help="edge-tts voice short name")
    parser.add_argument("--list", action="store_true", help="list available ta-IN voices and exit")
    args = parser.parse_args()

    if args.list:
        asyncio.run(list_voices())
        return

    asyncio.run(generate(args.voice))


if __name__ == "__main__":
    main()
