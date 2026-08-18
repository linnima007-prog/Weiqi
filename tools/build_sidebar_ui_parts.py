"""Build text-free, transparent sidebar UI atoms based on the concept mockup."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parents[1] / "public" / "ui" / "tutorial" / "sidebar-parts"
SCALE = 4


def canvas(size):
    return Image.new("RGBA", (size[0] * SCALE, size[1] * SCALE), (0, 0, 0, 0))


def save(image, name):
    image.resize((image.width // SCALE, image.height // SCALE), Image.Resampling.LANCZOS).save(OUT / name)


def rounded_button(size, selected=False):
    img = canvas(size)
    d = ImageDraw.Draw(img)
    box = (2 * SCALE, 2 * SCALE, (size[0] - 2) * SCALE, (size[1] - 2) * SCALE)
    radius = 13 * SCALE
    if selected:
        glow = canvas(size)
        gd = ImageDraw.Draw(glow)
        gd.rounded_rectangle(box, radius=radius, fill=(255, 196, 101, 110))
        glow = glow.filter(ImageFilter.GaussianBlur(7 * SCALE))
        img.alpha_composite(glow)
        d = ImageDraw.Draw(img)
        d.rounded_rectangle(box, radius=radius, fill=(88, 73, 69, 238), outline=(255, 216, 153, 255), width=1 * SCALE)
        d.rounded_rectangle((4*SCALE, 4*SCALE, (size[0]-4)*SCALE, (size[1]-4)*SCALE), radius=11*SCALE,
                            outline=(255, 231, 189, 60), width=1*SCALE)
    else:
        d.rounded_rectangle(box, radius=radius, fill=(24, 31, 51, 238), outline=(69, 78, 106, 180), width=1*SCALE)
        d.rounded_rectangle((4*SCALE, 4*SCALE, (size[0]-4)*SCALE, (size[1]-4)*SCALE), radius=11*SCALE,
                            outline=(255, 255, 255, 14), width=1*SCALE)
    return img


def sidebar_background():
    size = (330, 775)
    img = canvas(size)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((1*SCALE, 1*SCALE, 329*SCALE, 774*SCALE), radius=22*SCALE,
                        fill=(14, 20, 35, 247), outline=(62, 74, 105, 230), width=2*SCALE)
    d.rounded_rectangle((4*SCALE, 4*SCALE, 326*SCALE, 771*SCALE), radius=19*SCALE,
                        outline=(255, 255, 255, 12), width=SCALE)
    return img


def line_asset(width=280):
    img = canvas((width, 2))
    d = ImageDraw.Draw(img)
    d.line((0, SCALE, width*SCALE, SCALE), fill=(91, 102, 133, 90), width=SCALE)
    return img


def brand_icon():
    img = canvas((68, 68))
    d = ImageDraw.Draw(img)
    c = (137, 153, 205, 245)
    d.ellipse((6*SCALE, 5*SCALE, 62*SCALE, 61*SCALE), outline=(116, 132, 177, 190), width=SCALE)
    d.polygon([(15*SCALE, 28*SCALE), (34*SCALE, 18*SCALE), (54*SCALE, 28*SCALE), (34*SCALE, 38*SCALE)],
              outline=c, fill=(0, 0, 0, 0))
    d.line((20*SCALE, 32*SCALE, 20*SCALE, 42*SCALE, 34*SCALE, 49*SCALE, 49*SCALE, 41*SCALE, 49*SCALE, 32*SCALE),
           fill=c, width=2*SCALE, joint="curve")
    d.line((54*SCALE, 28*SCALE, 54*SCALE, 42*SCALE), fill=c, width=SCALE)
    d.ellipse((52*SCALE, 41*SCALE, 56*SCALE, 45*SCALE), fill=c)
    return img


def lock_icon():
    img = canvas((22, 24))
    d = ImageDraw.Draw(img)
    c = (124, 137, 178, 235)
    d.rounded_rectangle((4*SCALE, 9*SCALE, 18*SCALE, 22*SCALE), radius=3*SCALE, fill=c)
    d.arc((6*SCALE, 2*SCALE, 16*SCALE, 14*SCALE), 180, 360, fill=c, width=3*SCALE)
    d.ellipse((10*SCALE, 13*SCALE, 12*SCALE, 17*SCALE), fill=(34, 42, 66, 230))
    return img


def selected_dot():
    img = canvas((28, 28))
    d = ImageDraw.Draw(img)
    d.ellipse((2*SCALE, 2*SCALE, 26*SCALE, 26*SCALE), fill=(255, 237, 202, 255), outline=(255, 248, 230, 255), width=SCALE)
    d.ellipse((10*SCALE, 10*SCALE, 18*SCALE, 18*SCALE), fill=(151, 132, 120, 255))
    return img


def selected_pointer():
    img = canvas((14, 32))
    d = ImageDraw.Draw(img)
    glow = canvas((14, 32))
    gd = ImageDraw.Draw(glow)
    gd.polygon([(12*SCALE, 4*SCALE), (3*SCALE, 16*SCALE), (12*SCALE, 28*SCALE)], fill=(255, 220, 147, 170))
    glow = glow.filter(ImageFilter.GaussianBlur(3*SCALE))
    img.alpha_composite(glow)
    d = ImageDraw.Draw(img)
    d.polygon([(12*SCALE, 5*SCALE), (5*SCALE, 16*SCALE), (12*SCALE, 27*SCALE)], fill=(255, 228, 169, 255))
    return img


def bottom_button():
    img = canvas((86, 92))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((1*SCALE, 1*SCALE, 85*SCALE, 91*SCALE), radius=13*SCALE,
                        fill=(17, 23, 39, 220), outline=(72, 84, 116, 220), width=SCALE)
    d.rounded_rectangle((3*SCALE, 3*SCALE, 83*SCALE, 89*SCALE), radius=11*SCALE,
                        outline=(255, 255, 255, 12), width=SCALE)
    return img


def practice_icon():
    img = canvas((38, 35))
    d = ImageDraw.Draw(img)
    c = (141, 168, 239, 255)
    d.polygon([(3*SCALE, 5*SCALE), (17*SCALE, 8*SCALE), (19*SCALE, 30*SCALE), (5*SCALE, 26*SCALE)], outline=c)
    d.polygon([(35*SCALE, 5*SCALE), (21*SCALE, 8*SCALE), (19*SCALE, 30*SCALE), (33*SCALE, 26*SCALE)], outline=c)
    d.line((19*SCALE, 9*SCALE, 19*SCALE, 30*SCALE), fill=c, width=2*SCALE)
    d.line((7*SCALE, 10*SCALE, 15*SCALE, 12*SCALE), fill=c, width=SCALE)
    d.line((31*SCALE, 10*SCALE, 23*SCALE, 12*SCALE), fill=c, width=SCALE)
    return img


def progress_icon():
    img = canvas((38, 35))
    d = ImageDraw.Draw(img)
    c = (141, 168, 239, 255)
    d.rounded_rectangle((4*SCALE, 20*SCALE, 10*SCALE, 31*SCALE), radius=SCALE, fill=c)
    d.rounded_rectangle((15*SCALE, 10*SCALE, 21*SCALE, 31*SCALE), radius=SCALE, fill=c)
    d.rounded_rectangle((26*SCALE, 3*SCALE, 32*SCALE, 31*SCALE), radius=SCALE, fill=c)
    d.line((2*SCALE, 32*SCALE, 35*SCALE, 32*SCALE), fill=(101, 121, 172, 230), width=SCALE)
    return img


def faq_icon():
    img = canvas((38, 35))
    d = ImageDraw.Draw(img)
    c = (141, 168, 239, 255)
    d.ellipse((5*SCALE, 2*SCALE, 33*SCALE, 29*SCALE), fill=c)
    d.polygon([(14*SCALE, 27*SCALE), (11*SCALE, 34*SCALE), (21*SCALE, 28*SCALE)], fill=c)
    dark = (28, 35, 57, 255)
    d.arc((13*SCALE, 8*SCALE, 25*SCALE, 19*SCALE), 195, 20, fill=dark, width=3*SCALE)
    d.line((19*SCALE, 17*SCALE, 19*SCALE, 21*SCALE), fill=dark, width=3*SCALE)
    d.ellipse((17.5*SCALE, 24*SCALE, 20.5*SCALE, 27*SCALE), fill=dark)
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    assets = {
        "sidebar-background.png": sidebar_background(),
        "sidebar-separator.png": line_asset(),
        "icon-course.png": brand_icon(),
        "lesson-button-default.png": rounded_button((289, 57), False),
        "lesson-button-selected.png": rounded_button((293, 59), True),
        "lesson-selected-dot.png": selected_dot(),
        "lesson-selected-pointer.png": selected_pointer(),
        "icon-lock.png": lock_icon(),
        "bottom-button-default.png": bottom_button(),
        "icon-practice.png": practice_icon(),
        "icon-progress.png": progress_icon(),
        "icon-faq.png": faq_icon(),
    }
    for name, image in assets.items():
        save(image, name)


if __name__ == "__main__":
    main()
