"""Resize the owner's original A-Zuha logo into native and web assets.

Place the unchanged original at resources/azuha-logo-original.png before running.
The script never draws or invents logo geometry.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources/azuha-logo-original.png"
if not SOURCE.is_file():
    raise SystemExit("Original logo file is required: resources/azuha-logo-original.png")

logo = Image.open(SOURCE).convert("RGB")
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
BACKGROUND = "#f6faff"


def icon(size: int, fraction: float = 0.98) -> Image.Image:
    canvas = Image.new("RGB", (size, size), BACKGROUND)
    artwork = logo.copy()
    edge = round(size * fraction)
    artwork.thumbnail((edge, edge), Image.Resampling.LANCZOS)
    canvas.paste(artwork, ((size - artwork.width) // 2, (size - artwork.height) // 2))
    return canvas


def splash(width: int, height: int) -> Image.Image:
    canvas = Image.new("RGB", (width, height), BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    logo_size = round(min(width * 0.58, height * 0.30))
    artwork = icon(logo_size)
    top = (height - logo_size) // 2 - round(min(width, height) * 0.08)
    canvas.paste(artwork, ((width - logo_size) // 2, top))
    title_size = max(16, round(min(width, height) * 0.052))
    draw.text((width // 2, top + logo_size + title_size // 3), "A-Zuha Finance",
              font=ImageFont.truetype(FONT, title_size), anchor="mt", fill="#163b78")
    return canvas


icon(1024).save(ROOT / "resources/app-icon-1024.png")
icon(1024, 0.66).convert("RGBA").save(ROOT / "resources/android-foreground.png")
for size in (192, 512):
    icon(size).save(ROOT / f"public/icon-{size}.png")

android = ROOT / "android/app/src/main/res"
for density, size in (("mdpi", 48), ("hdpi", 72), ("xhdpi", 96),
                      ("xxhdpi", 144), ("xxxhdpi", 192)):
    folder = android / f"mipmap-{density}"
    folder.mkdir(exist_ok=True)
    icon(size).save(folder / "ic_launcher.png")
    icon(size).save(folder / "ic_launcher_round.png")
    icon(round(size * 108 / 48), 0.66).convert("RGBA").save(folder / "ic_launcher_foreground.png")

for path in android.glob("drawable-*/splash.png"):
    width, height = Image.open(path).size
    splash(width, height).save(path)
path = android / "drawable/splash.png"
width, height = Image.open(path).size
splash(width, height).save(path)

branding = Image.new("RGBA", (720, 180), (0, 0, 0, 0))
draw = ImageDraw.Draw(branding)
draw.text((360, 50), "A-Zuha Finance", font=ImageFont.truetype(FONT, 52),
          anchor="mt", fill="#163b78")
(android / "drawable-nodpi").mkdir(exist_ok=True)
branding.save(android / "drawable-nodpi/splash_branding.png")

icon(1024).save(ROOT / "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png")
for path in (ROOT / "ios/App/App/Assets.xcassets/Splash.imageset").glob("*.png"):
    splash(2732, 2732).save(path)
