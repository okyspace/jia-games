# Builds the Android adaptive launcher icon foreground from a photo.
# Usage: pip install pillow && python3 tools/icon/make_icon.py tools/icon/bunny.png android/app/src/main/res tools/icon/preview.png
import sys
from PIL import Image, ImageDraw

SRC = sys.argv[1]
OUT = sys.argv[2]           # android res dir
PREVIEW = sys.argv[3]
CX, CY, R = 232, 214, 168   # circle around the bunny in the source photo (447x447)
INK = (43, 45, 66, 255)
SUN = (255, 210, 63, 255)

photo = Image.open(SRC).convert('RGBA')
crop = photo.crop((CX - R, CY - R, CX + R, CY + R))

def foreground(px):
    """108dp canvas; badge is 68dp wide (inside the 72dp visible area, ~66dp safe zone plus outline)."""
    S = 4                                   # supersample for smooth edges
    big = px * S
    badge = round(big * 66 / 108)
    line = round(big * 3 / 108)
    canvas = Image.new('RGBA', (big, big), (0, 0, 0, 0))
    off = (big - badge) // 2
    # drop "pop" shadow like the app's buttons
    shadow = Image.new('L', (big, big), 0)
    ImageDraw.Draw(shadow).ellipse((off, off + line, off + badge, off + badge + line), fill=255)
    canvas.paste(Image.new('RGBA', (big, big), INK), (0, 0), shadow)
    # photo inside a circle
    pic = crop.resize((badge, badge), Image.LANCZOS)
    mask = Image.new('L', (badge, badge), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, badge - 1, badge - 1), fill=255)
    canvas.paste(pic, (off, off), mask)
    # thick cartoon outline
    ImageDraw.Draw(canvas).ellipse((off, off, off + badge, off + badge), outline=INK, width=line)
    return canvas.resize((px, px), Image.LANCZOS)

for name, px in {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}.items():
    import os
    d = os.path.join(OUT, f'mipmap-{name}')
    os.makedirs(d, exist_ok=True)
    foreground(px).save(os.path.join(d, 'ic_launcher_foreground.png'), optimize=True)

# Preview: what a launcher shows (circle mask and squircle-ish rounded square), 72dp visible area
fg = foreground(432)
bg = Image.new('RGBA', (432, 432), SUN)
full = Image.alpha_composite(bg, fg)
vis = full.crop((72, 72, 360, 360))          # inner 72dp of 108dp
prev = Image.new('RGBA', (680, 320), (240, 240, 240, 255))
for i, shape in enumerate(['circle', 'rounded']):
    m = Image.new('L', vis.size, 0)
    dr = ImageDraw.Draw(m)
    if shape == 'circle':
        dr.ellipse((0, 0, 287, 287), fill=255)
    else:
        dr.rounded_rectangle((0, 0, 287, 287), radius=70, fill=255)
    prev.paste(vis, (16 + i * 340, 16), m)
prev.save(PREVIEW)
