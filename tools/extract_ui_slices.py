"""Extract reusable UI slices from the supplied tutorial-screen mockup."""
from pathlib import Path
from PIL import Image, ImageDraw

SOURCE = Path(r"D:\Download\ChatGPT Image 2026年8月15日 00_40_38.png")
OUT = Path(__file__).resolve().parents[1] / "public" / "ui" / "tutorial"
CLEAN_OUT = OUT / "flat"

# x, y, width, height.  These deliberately retain the original lighting and
# edge treatment so the slices can be layered back over the room background.
SLICES = {
    "tutorial-room-background.png": (0, 0, 1672, 943),
    "tutorial-sidebar.png": (24, 84, 330, 775),
    "lesson-sheet.png": (353, 107, 1213, 754),
    "lesson-text-card.png": (425, 254, 361, 380),
    "go-board-9x9.png": (834, 190, 554, 542),
    "progress-steps.png": (1234, 138, 173, 42),
    "starter-sticky-note.png": (1419, 116, 132, 116),
    "button-hint.png": (797, 786, 157, 55),
    "button-retry.png": (978, 786, 185, 55),
    "button-continue.png": (1182, 785, 199, 57),
    "bottom-navigation.png": (52, 717, 281, 93),
}

MASKS = {
    "tutorial-sidebar.png": ("rounded", (0, 0, 330, 775), 22),
    "lesson-sheet.png": ("rounded", (0, 0, 1213, 754), 18),
    "lesson-text-card.png": ("rounded", (0, 0, 361, 380), 8),
    "go-board-9x9.png": ("rounded", (0, 0, 554, 542), 18),
    "progress-steps.png": ("rounded", (0, 0, 173, 42), 20),
    "starter-sticky-note.png": ("polygon", ((9, 12), (121, 0), (131, 102), (2, 115))),
    "button-hint.png": ("rounded", (0, 0, 157, 55), 28),
    "button-retry.png": ("rounded", (0, 0, 185, 55), 28),
    "button-continue.png": ("rounded", (0, 0, 199, 57), 28),
    "bottom-navigation.png": ("rounded", (0, 0, 281, 93), 5),
}


def alpha_mask(size, spec):
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    if spec[0] == "rounded":
        _, box, radius = spec
        draw.rounded_rectangle(box, radius=radius, fill=255)
    else:
        _, points = spec
        draw.polygon(points, fill=255)
    return mask


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    CLEAN_OUT.mkdir(parents=True, exist_ok=True)
    image = Image.open(SOURCE).convert("RGBA")
    for filename, (x, y, width, height) in SLICES.items():
        crop = image.crop((x, y, x + width, y + height))
        crop.save(OUT / filename)
        if filename in MASKS:
            crop.putalpha(alpha_mask(crop.size, MASKS[filename]))
            crop.save(CLEAN_OUT / filename)


if __name__ == "__main__":
    main()
