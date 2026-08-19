#!/usr/bin/env python3
"""
Regenerates the social share card and the Person-schema portrait from one source
photo, so a copy change is an edit to the CONTENT block below plus a re-run
rather than a redesign in an image editor.

    python3 scripts/generate-og.py

Outputs
    public/assets/images/og-default.png                          1200x630 share card
    public/assets/images/deepak-kumar-react-developer-india.jpg  square portrait

The two images are deliberately different shapes because they feed different
consumers. og-default.png goes to OpenGraph/Twitter (app/seo_config.ts) and is
rendered as a wide card by LinkedIn, Slack and WhatsApp. The portrait goes to
Person.image in the schema.org block, which is what Google's Knowledge Panel
reads, and that gets cropped square -- so it carries no text at all.

Deliberately number-free: any figure baked into a static PNG (years of
experience, users served, products shipped) goes stale without warning, and
share cards are cached for months by the platforms above.

Text blocks are positioned by flowing real glyph metrics (see stack_block), not
by fixed y-offsets. Fixed offsets collided the descender of "Deepak" with the
line below it, and would break again on any copy or font change.

Requires Pillow. Fonts resolve from the system; see FONT_CANDIDATES.
"""

import os
import sys

from PIL import Image, ImageDraw, ImageFont

# ── CONTENT ───────────────────────────────────────────────────────────────────
# Edit these, re-run, commit the PNGs. Keep it free of numbers and of anything
# tied to "now" -- see the module docstring.

EYEBROW = "SENIOR SOFTWARE ENGINEER  ·  NEW DELHI, INDIA"
NAME = "Deepak Kumar"
STACK = "React · Node.js · Next.js"
ACCENT_LINE = "Generative AI"
TAGLINE = "Building production systems for enterprise media, healthcare, SaaS and adtech."
URL = "officialdeepak.in"

# ── PATHS ─────────────────────────────────────────────────────────────────────

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, "public", "assets", "images")

SOURCE = os.path.join(IMAGES, "profile.png")
OUT_CARD = os.path.join(IMAGES, "og-default.png")
OUT_PORTRAIT = os.path.join(IMAGES, "deepak-kumar-react-developer-india.jpg")

# Google wants structured-data images at 1200px+ on the longest side. The
# portrait is capped by the source rather than upscaled, since interpolating
# adds no detail the crawler can use -- swap in a larger SOURCE to lift it.
# Keep PORTRAIT_SIZE in app/seo_config.ts in step with what this prints.
PORTRAIT_TARGET = 1200

# ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
# Measured off the original card so a regenerate stays on-brand.

W, H = 1200, 630

BG = (243, 242, 242)
INK = (32, 30, 29)
MUTED = (120, 117, 116)
ACCENT = (0, 136, 176)

MARGIN = 64
RULE_RIGHT = 1136          # rules stop short of the bleed edge, mirroring MARGIN
TEXT_RIGHT = 660           # left column wraps before the photo

RULE_TOP_Y, RULE_TOP_H = 64, 6
RULE_THIN_Y, RULE_THIN_H = 112, 2
RULE_BOTTOM_Y, RULE_BOTTOM_H = 558, 2

# Ink-top positions: where the first painted pixel of a block lands, which is
# what the eye aligns to. Blocks below NAME flow from the one above by gap.
EYEBROW_INK_TOP = 89
NAME_INK_TOP = 192
GAP_NAME_STACK = 10
GAP_STACK_ACCENT = 17
GAP_ACCENT_TAGLINE = 42
TAGLINE_LEADING = 36
URL_INK_TOP = 578

PHOTO_BOX = (720, 100, 1149, 529)   # left, top, right, bottom (inclusive)

EYEBROW_TRACKING = 1.6     # extra px between characters, small-caps feel

# Sizes chosen so ink heights match the original card exactly:
# name 79px, stack 38px, accent 29px, tagline 25px, eyebrow 15px, url 17px.
SIZE_EYEBROW = 16
SIZE_NAME = 78
SIZE_STACK = 38
SIZE_ACCENT = 38
SIZE_TAGLINE = 25
SIZE_URL = 16

FONT_CANDIDATES = {
    "bold": [
        "/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    ],
    "regular": [
        "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    ],
}

warnings = []


def load_font(weight, size):
    for path in FONT_CANDIDATES[weight]:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    raise SystemExit(
        f"No {weight} serif font found. Install fonts-noto-core or edit FONT_CANDIDATES."
    )


def stack_block(draw, ink_top, text, font, fill, tracking=0.0):
    """
    Paint one line so its topmost ink lands on ink_top, and report the row its
    lowest ink occupies. Callers chain these with an explicit gap, which is what
    keeps a descender off the line beneath it whatever the copy says.
    """
    bbox = draw.textbbox((0, 0), text, font=font)
    y = ink_top - bbox[1]

    if tracking:
        x = MARGIN
        for ch in text:
            draw.text((x, y), ch, font=font, fill=fill)
            x += draw.textlength(ch, font=font) + tracking
        width = x - MARGIN - tracking
    else:
        draw.text((MARGIN, y), text, font=font, fill=fill)
        width = bbox[2] - bbox[0]

    if MARGIN + width > TEXT_RIGHT:
        warnings.append(
            f'"{text[:34]}..." is {round(MARGIN + width - TEXT_RIGHT)}px wider than '
            f"the text column and will run under the photo."
        )

    return ink_top + (bbox[3] - bbox[1])


def wrap(draw, text, font, max_width):
    lines, current = [], ""
    for word in text.split():
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=font) <= max_width or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def cover_crop(img, width, height):
    """Scale to fill then crop, anchored top-centre so the face is never cut."""
    scale = max(width / img.width, height / img.height)
    resized = img.resize(
        (max(1, round(img.width * scale)), max(1, round(img.height * scale))),
        Image.LANCZOS,
    )
    left = (resized.width - width) // 2
    return resized.crop((left, 0, left + width, height))


def build_card(source):
    card = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(card)

    f_eyebrow = load_font("regular", SIZE_EYEBROW)
    f_name = load_font("bold", SIZE_NAME)
    f_stack = load_font("bold", SIZE_STACK)
    f_accent = load_font("bold", SIZE_ACCENT)
    f_tagline = load_font("regular", SIZE_TAGLINE)
    f_url = load_font("regular", SIZE_URL)

    draw.rectangle(
        [MARGIN, RULE_TOP_Y, RULE_RIGHT, RULE_TOP_Y + RULE_TOP_H - 1], fill=INK
    )
    stack_block(draw, EYEBROW_INK_TOP, EYEBROW, f_eyebrow, MUTED, EYEBROW_TRACKING)

    # Photo goes down before the thin rule, which crosses over its top edge.
    left, top, right, bottom = PHOTO_BOX
    card.paste(cover_crop(source, right - left + 1, bottom - top + 1), (left, top))
    draw.rectangle(
        [MARGIN, RULE_THIN_Y, RULE_RIGHT, RULE_THIN_Y + RULE_THIN_H - 1], fill=INK
    )

    bottom_ink = stack_block(draw, NAME_INK_TOP, NAME, f_name, INK)
    bottom_ink = stack_block(draw, bottom_ink + GAP_NAME_STACK, STACK, f_stack, INK)
    bottom_ink = stack_block(
        draw, bottom_ink + GAP_STACK_ACCENT, ACCENT_LINE, f_accent, ACCENT
    )

    ink_top = bottom_ink + GAP_ACCENT_TAGLINE
    for i, line in enumerate(wrap(draw, TAGLINE, f_tagline, TEXT_RIGHT - MARGIN)):
        bottom_ink = stack_block(
            draw, ink_top + i * TAGLINE_LEADING, line, f_tagline, MUTED
        )
    if bottom_ink >= RULE_BOTTOM_Y - 12:
        warnings.append(
            f"TAGLINE runs to y={bottom_ink}, colliding with the footer rule at "
            f"y={RULE_BOTTOM_Y}. Shorten it."
        )

    draw.rectangle(
        [MARGIN, RULE_BOTTOM_Y, RULE_RIGHT, RULE_BOTTOM_Y + RULE_BOTTOM_H - 1], fill=INK
    )
    stack_block(draw, URL_INK_TOP, URL, f_url, ACCENT)

    return card


def build_portrait(source):
    size = min(PORTRAIT_TARGET, min(source.width, source.height))
    return cover_crop(source, size, size), size


def main():
    if not os.path.exists(SOURCE):
        raise SystemExit(f"Source photo not found: {SOURCE}")

    source = Image.open(SOURCE).convert("RGB")

    build_card(source).save(OUT_CARD, "PNG", optimize=True)
    print(f"  ✓ {os.path.relpath(OUT_CARD, ROOT)}  {W}x{H}")

    portrait, size = build_portrait(source)
    portrait.save(OUT_PORTRAIT, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"  ✓ {os.path.relpath(OUT_PORTRAIT, ROOT)}  {size}x{size}")

    if size < PORTRAIT_TARGET:
        warnings.append(
            f"Portrait is {size}px; Google prefers {PORTRAIT_TARGET}px+ for "
            f"Person.image. Source is only {source.width}x{source.height} -- replace "
            f"{os.path.relpath(SOURCE, ROOT)} with a larger original and re-run."
        )

    for w in warnings:
        print(f"\n  ! {w}", file=sys.stderr)


if __name__ == "__main__":
    main()
