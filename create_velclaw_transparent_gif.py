from PIL import Image, ImageDraw, ImageFilter, ImageChops
import os

SRC = "/home/ubuntu/upload/velclaw_logo_upscaled.png"
LOGO_PATH = "/home/ubuntu/upload/velclaw_logo_transparent.png"
OUT = "/home/ubuntu/upload/velclaw_logo_7color_transparent.gif"
FRAME_DIR = "/home/ubuntu/upload/velclaw_transparent_frames"
W, H = 960, 402
FPS, SECONDS = 20, 3.6

# Read the restored logo and remove only the near-black background.
source = Image.open(SRC).convert("RGB")
p = source.load()
for y in range(source.height):
    for x in range(source.width):
        r, g, b = p[x, y]
        brightness = max(r, g, b)
        a = max(0, min(255, int((brightness - 5) * 5.1)))
        p[x, y] = (r, g, b, a)
transparent_logo = source.convert("RGBA")
transparent_logo.save(LOGO_PATH, "PNG", optimize=True)

# Fit the complete mark inside the transparent canvas.
logo = transparent_logo.copy()
logo.thumbnail((900, 360), Image.Resampling.LANCZOS)
logo_x, logo_y = (W - logo.width) // 2, (H - logo.height) // 2

# Build a precise mask for the light VelClaw wordmark only.
word = Image.open(SRC).convert("RGB").crop((int(source.width * 0.34), int(source.height * 0.18), source.width, int(source.height * 0.82)))
mask_small = Image.new("L", word.size, 0)
mp, wp = mask_small.load(), word.load()
for y in range(word.height):
    for x in range(word.width):
        r, g, b = wp[x, y]
        if min(r, g, b) > 145 and max(r, g, b) - min(r, g, b) < 45:
            mp[x, y] = min(255, int((min(r, g, b) - 135) * 2.2))
mask = Image.new("L", source.size, 0)
mask.paste(mask_small, (int(source.width * 0.34), int(source.height * 0.18)))
mask = mask.resize(logo.size, Image.Resampling.LANCZOS)

colors = [(255, 25, 75), (255, 145, 25), (255, 230, 40), (50, 235, 120), (30, 215, 255), (65, 85, 255), (195, 40, 255)]
os.makedirs(FRAME_DIR, exist_ok=True)
frames = []
for i in range(int(FPS * SECONDS)):
    t = i / (int(FPS * SECONDS) - 1)
    frame = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    # Gentle logo fade/scale-in without any background fill.
    if t < 0.24:
        progress = t / 0.24
        scale = 0.88 + 0.12 * progress
        opacity = int(255 * progress)
    else:
        scale, opacity = 1.0, 255
    current = logo.resize((int(logo.width * scale), int(logo.height * scale)), Image.Resampling.LANCZOS)
    current.putalpha(current.getchannel("A").point(lambda a: a * opacity // 255))
    cx, cy = (W - current.width) // 2, (H - current.height) // 2
    frame.alpha_composite(current, (cx, cy))

    # Seven broad color bands moving slowly, clipped only to the wordmark mask.
    sweep = Image.new("RGBA", logo.size, (0, 0, 0, 0))
    sp = sweep.load()
    travel = logo.width + 900
    sweep_x = int(-650 + travel * t)
    band_width = 330
    for x in range(max(0, sweep_x - band_width), min(logo.width, sweep_x + band_width)):
        norm = (x - (sweep_x - band_width)) / (2 * band_width)
        color = colors[min(6, int(norm * 7))]
        edge = min(1.0, (x - (sweep_x - band_width)) / 70, (sweep_x + band_width - x) / 70)
        alpha = int(215 * max(0.0, edge))
        for y in range(logo.height):
            sp[x, y] = (*color, alpha)
    clipped_alpha = Image.new("L", logo.size, 0)
    clipped_alpha = ImageChops.multiply(mask, sweep.getchannel("A")) if False else mask
    # Apply the wordmark mask to the sweep alpha.
    sweep.putalpha(ImageChops.multiply(mask, sweep.getchannel("A")))
    frame.alpha_composite(sweep, (logo_x, logo_y))

    # Add a faint white highlight only inside the text mask.
    if 0.25 < t < 0.80:
        highlight = Image.new("RGBA", logo.size, (0, 0, 0, 0))
        hd = ImageDraw.Draw(highlight)
        hx = int(-220 + (logo.width + 440) * ((t - 0.25) / 0.55))
        hd.polygon([(hx, 0), (hx + 55, 0), (hx - 45, logo.height), (hx - 100, logo.height)], fill=(255, 255, 255, 35))
        highlight = highlight.filter(ImageFilter.GaussianBlur(9))
        highlight.putalpha(ImageChops.multiply(mask, highlight.getchannel("A")))
        frame.alpha_composite(highlight, (logo_x, logo_y))

    # Convert each RGBA frame to a palette GIF frame with a real transparent index.
    rgba = frame.convert("RGBA")
    pal = rgba.convert("P", palette=Image.Palette.ADAPTIVE, colors=255)
    alpha = rgba.getchannel("A")
    transparent_index = 255
    pal.info["transparency"] = transparent_index
    pix = pal.load(); ap = alpha.load()
    for yy in range(H):
        for xx in range(W):
            if ap[xx, yy] < 12:
                pix[xx, yy] = transparent_index
    frames.append(pal)

frames[0].save(OUT, save_all=True, append_images=frames[1:], duration=int(1000 / FPS), loop=0, transparency=255, disposal=2, optimize=False)
print(OUT)
print(LOGO_PATH)
