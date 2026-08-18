import json
import sys
from pathlib import Path

sys.path.insert(0, r"E:\Work\Weiqi\.codex-video-analysis\pydeps")

from faster_whisper import WhisperModel


VIDEO = r"D:\Download\25864310600-1-192.mp4"
OUT_DIR = Path(r"E:\Work\Weiqi\.codex-video-analysis\25864310600-1-192")
MODEL_DIR = Path(r"E:\Work\Weiqi\.codex-video-analysis\models")


def stamp(seconds: float) -> str:
    total_ms = round(seconds * 1000)
    hours, rem = divmod(total_ms, 3_600_000)
    minutes, rem = divmod(rem, 60_000)
    secs, millis = divmod(rem, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8",
    download_root=str(MODEL_DIR),
)

segments_iter, info = model.transcribe(
    VIDEO,
    language="zh",
    beam_size=5,
    vad_filter=True,
    condition_on_previous_text=True,
    initial_prompt=(
        "这是中文围棋入门教学，讲解角、边、中腹、围空、实地、效率、并、"
        "拆二、拆三、立、长、扳、断、跳和棋子间距。"
    ),
)

segments = []
for seg in segments_iter:
    item = {"start": seg.start, "end": seg.end, "text": seg.text.strip()}
    segments.append(item)
    print(f"[{seg.start:7.2f}-{seg.end:7.2f}] {item['text']}", flush=True)

OUT_DIR.mkdir(parents=True, exist_ok=True)
(OUT_DIR / "transcript.json").write_text(
    json.dumps(
        {
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration,
            "segments": segments,
        },
        ensure_ascii=False,
        indent=2,
    ),
    encoding="utf-8",
)

with (OUT_DIR / "transcript.srt").open("w", encoding="utf-8-sig") as fh:
    for index, seg in enumerate(segments, start=1):
        fh.write(
            f"{index}\n{stamp(seg['start'])} --> {stamp(seg['end'])}\n"
            f"{seg['text']}\n\n"
        )

print(
    json.dumps(
        {
            "language": info.language,
            "probability": info.language_probability,
            "duration": info.duration,
            "segments": len(segments),
        },
        ensure_ascii=False,
    ),
    flush=True,
)
