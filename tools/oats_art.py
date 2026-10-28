"""Original illustrations for the overnight-oats recipes (2.36.0): a layered glass jar on a neutral stone surface,
toppings per recipe. Writes img/recipes/<id>.webp (1448x1086) and <id>-thumb.webp (384x288). Drawn here, no photos copied.
Run: python3 tools/oats_art.py"""
import math, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parents[1] / 'img' / 'recipes'
W, H, S = 1448, 1086, 2                      # drawn at 2x, then downscaled for smooth edges

def stone(seed):
    rnd = random.Random(seed); w, h = W * S, H * S
    yy = Image.linear_gradient('L').resize((w, h))                       # light from the top left
    xx = Image.linear_gradient('L').rotate(90).resize((w, h))
    shade = Image.blend(yy, xx, .5)
    im = Image.composite(Image.new('RGB', (w, h), (190, 176, 156)), Image.new('RGB', (w, h), (232, 222, 204)), shade)
    for scale, amt in ((48, .10), (16, .07), (5, .05)):                  # mottled stone at three scales
        n = Image.effect_noise((max(8, w // scale), max(8, h // scale)), 60).resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(2 * S))
        im = Image.blend(im, Image.merge('RGB', [n.point(lambda v: v * .9 + 30), n.point(lambda v: v * .85 + 28), n.point(lambda v: v * .78 + 24)]), amt)
    dr = ImageDraw.Draw(im, 'RGBA')
    for _ in range(2600):
        x, y, r = rnd.randrange(w), rnd.randrange(h), rnd.uniform(1, 3.2) * S / 2
        dr.ellipse([x - r, y - r, x + r, y + r], fill=rnd.choice([(150, 136, 116, 55), (245, 238, 226, 70), (176, 160, 138, 45)]))
    return im

def wavy(x0, x1, y, amp, ph, n=40):
    return [(x0 + (x1 - x0) * i / n, y + math.sin(i * .55 + ph) * amp + math.sin(i * 1.7 + ph * 2) * amp * .4) for i in range(n + 1)]

def jar(im, spec, seed):
    rnd = random.Random(seed); im = im.convert('RGBA'); w2 = W * S
    cx, top, bot, hw = int(W * S * .47), 170 * S, 990 * S, 330 * S
    l, r, rad, ey = cx - hw, cx + hw, 90 * S, 70 * S                      # ey: half height of the ellipses (seen slightly from above)
    sh = Image.new('L', im.size, 0); ImageDraw.Draw(sh).ellipse([l - 10 * S, bot - 60 * S, r + 230 * S, bot + 80 * S], fill=150)
    im.paste((70, 58, 46, 255), (0, 0), sh.filter(ImageFilter.GaussianBlur(45 * S)).point(lambda v: v * .6))
    food = Image.new('RGBA', im.size, (0, 0, 0, 0)); fd = ImageDraw.Draw(food, 'RGBA')
    mask = Image.new('L', im.size, 0); md = ImageDraw.Draw(mask)
    md.rounded_rectangle([l + 12 * S, top + 40 * S, r - 12 * S, bot - 12 * S], radius=rad, fill=255)
    y = bot
    layers = spec['layers']; total = sum(hh for _, hh, _ in layers); scale = (bot - top - 230 * S) / (total * S)
    for k, (colour, height, speck) in enumerate(layers):
        y0 = y - height * S * scale
        poly = wavy(l, r, y0, 9 * S, seed + k) + [(r, y + 40 * S), (l, y + 40 * S)]
        fd.polygon(poly, fill=colour + (255,))
        for _ in range(int(speck * 2.2)):
            sx, sy = rnd.uniform(l + 20 * S, r - 20 * S), rnd.uniform(y0 + 10 * S, y - 6 * S); sr = rnd.uniform(5, 13) * S
            a = rnd.uniform(0, math.pi)
            fd.ellipse([sx - sr, sy - sr * .45, sx + sr, sy + sr * .45], fill=spec.get('speck', (196, 168, 120)) + (rnd.randint(120, 210),))
        fd.line(wavy(l, r, y0, 9 * S, seed + k), fill=tuple(max(0, c - 28) for c in colour) + (130,), width=4 * S)
        y = y0
    surface = y
    food.putalpha(Image.composite(food.getchannel('A'), Image.new('L', im.size, 0), mask))
    sd = ImageDraw.Draw(food, 'RGBA')                                       # the top surface, seen from above
    sd.ellipse([l + 14 * S, surface - ey, r - 14 * S, surface + ey], fill=layers[-1][0] + (255,))
    sd.ellipse([l + 14 * S, surface - ey, r - 14 * S, surface + ey], outline=tuple(max(0, c - 30) for c in layers[-1][0]) + (120,), width=4 * S)
    tops = []
    for kind, colour, n, size in spec['top']:
        for _ in range(int(n * 1.7)):
            t = rnd.uniform(0, 2 * math.pi); rr = math.sqrt(rnd.uniform(0, 1)) * .93
            tx, ty = cx + math.cos(t) * rr * (hw - 70 * S), surface + math.sin(t) * rr * (ey - 18 * S) - (1 - rr) * 26 * S
            tops.append((ty, kind, colour, tx, size * rnd.uniform(.85, 1.2) * S * 2.1, rnd.uniform(0, math.pi)))
    for ty, kind, colour, tx, s_, a in sorted(tops):                        # back to front
        if kind == 'disc':
            sd.ellipse([tx - s_ + 3 * S, ty - s_ * .6 + 5 * S, tx + s_ + 3 * S, ty + s_ * .6 + 5 * S], fill=(80, 60, 40, 60))
            sd.ellipse([tx - s_, ty - s_ * .6, tx + s_, ty + s_ * .6], fill=colour + (255,), outline=(222, 196, 126, 255), width=3 * S)
            for q in range(6): sd.ellipse([tx + math.cos(q) * s_ * .3 - 3 * S, ty + math.sin(q) * s_ * .18 - 2 * S, tx + math.cos(q) * s_ * .3 + 3 * S, ty + math.sin(q) * s_ * .18 + 2 * S], fill=(196, 160, 96, 180))
        elif kind == 'berry':
            sd.ellipse([tx - s_ + 3 * S, ty - s_ + 6 * S, tx + s_ + 3 * S, ty + s_ + 6 * S], fill=(60, 30, 40, 70))
            sd.ellipse([tx - s_, ty - s_, tx + s_, ty + s_], fill=colour + (255,)); sd.ellipse([tx - s_ * .5, ty - s_ * .6, tx - s_ * .05, ty - s_ * .2], fill=(255, 255, 255, 90))
        elif kind == 'cube':
            sd.rounded_rectangle([tx - s_ + 3 * S, ty - s_ * .8 + 6 * S, tx + s_ + 3 * S, ty + s_ * .8 + 6 * S], radius=int(s_ * .3), fill=(90, 60, 30, 60))
            sd.rounded_rectangle([tx - s_, ty - s_ * .8, tx + s_, ty + s_ * .8], radius=int(s_ * .3), fill=colour + (255,))
            sd.line([tx - s_ * .6, ty - s_ * .45, tx + s_ * .4, ty - s_ * .45], fill=(255, 255, 255, 110), width=4 * S)
        elif kind == 'nut':
            sd.chord([tx - s_, ty - s_ * .7, tx + s_, ty + s_ * .7], 0, 360, fill=colour + (255,))
            for q in (-.4, 0, .4): sd.arc([tx - s_ * .7, ty - s_ * .5 + q * s_, tx + s_ * .7, ty + s_ * .5 + q * s_], 200, 340, fill=(96, 62, 30, 210), width=3 * S)
        elif kind == 'flake':
            sd.polygon([(tx - s_, ty), (tx - s_ * .1, ty - s_ * .45), (tx + s_ * .9, ty + s_ * .05), (tx, ty + s_ * .4)], fill=colour + (255,), outline=(220, 214, 200, 255))
        elif kind == 'dust':
            sd.ellipse([tx - s_, ty - s_ * .6, tx + s_, ty + s_ * .6], fill=colour + (140,))
        elif kind == 'drizzle':
            pts = [(tx - s_ * 4 + i * s_ * .65, ty + math.sin(i * 1.4 + a) * s_ * .5) for i in range(13)]
            sd.line(pts, fill=colour + (235,), width=int(s_ * .5), joint='curve')
    im.alpha_composite(food)
    g = Image.new('RGBA', im.size, (0, 0, 0, 0)); gd = ImageDraw.Draw(g, 'RGBA')    # glass
    gd.rounded_rectangle([l, top, r, bot], radius=rad, fill=(255, 255, 255, 18), outline=(255, 255, 255, 170), width=8 * S)
    gd.ellipse([l, top - ey, r, top + ey], outline=(255, 255, 255, 200), width=8 * S)
    gd.ellipse([l + 10 * S, top - ey + 10 * S, r - 10 * S, top + ey - 10 * S], outline=(150, 160, 165, 70), width=3 * S)
    gd.rounded_rectangle([l + 42 * S, top + 80 * S, l + 82 * S, bot - 120 * S], radius=20 * S, fill=(255, 255, 255, 70))
    gd.rounded_rectangle([r - 70 * S, top + 140 * S, r - 50 * S, top + 420 * S], radius=10 * S, fill=(255, 255, 255, 55))
    edge = Image.new('L', im.size, 0); ed = ImageDraw.Draw(edge)
    ed.rounded_rectangle([l, top, l + 40 * S, bot], radius=20 * S, fill=60); ed.rounded_rectangle([r - 40 * S, top, r, bot], radius=20 * S, fill=60)
    g.paste((40, 50, 55, 255), (0, 0), edge.filter(ImageFilter.GaussianBlur(14 * S)))
    im.alpha_composite(g)
    sp = ImageDraw.Draw(im, 'RGBA'); sx, sy = r + 175 * S, bot - 30 * S         # a spoon beside the jar
    sp.line([(sx + 8 * S, sy + 10 * S), (sx + 168 * S, sy - 352 * S)], fill=(90, 80, 70, 28), width=26 * S)
    sp.line([(sx, sy), (sx + 160 * S, sy - 360 * S)], fill=(200, 196, 188, 255), width=24 * S)
    sp.ellipse([sx - 62 * S, sy - 38 * S, sx + 52 * S, sy + 70 * S], fill=(214, 210, 202, 255), outline=(168, 162, 152, 255), width=5 * S)
    sp.ellipse([sx - 40 * S, sy - 18 * S, sx + 6 * S, sy + 20 * S], fill=(255, 255, 255, 90))
    return im.convert('RGB')

OATS = (226, 205, 168)
SPECS = {
    'oats-choco-pb': {'layers': [(OATS, 230, 60), ((126, 86, 62), 190, 30), ((150, 104, 76), 60, 0)], 'speck': (110, 76, 52),
        'top': [('disc', (243, 226, 168), 7, 30), ('drizzle', (176, 120, 66), 3, 14), ('dust', (90, 58, 40), 14, 5)]},
    'oats-apple-cinnamon': {'layers': [(OATS, 220, 70), ((244, 240, 229), 200, 0), ((236, 214, 170), 70, 20)], 'speck': (176, 130, 80),
        'top': [('cube', (234, 222, 160), 9, 18), ('cube', (196, 60, 52), 4, 15), ('nut', (168, 118, 70), 6, 20), ('dust', (150, 92, 50), 30, 4), ('drizzle', (226, 168, 62), 2, 10)]},
    'oats-berry-turo': {'layers': [(OATS, 210, 60), ((240, 232, 230), 150, 0), ((176, 92, 132), 90, 40)], 'speck': (130, 40, 90),
        'top': [('berry', (64, 70, 140), 9, 15), ('berry', (196, 40, 70), 7, 17), ('berry', (120, 30, 70), 5, 13), ('drizzle', (226, 168, 62), 2, 10)]},
    'oats-mango-coconut': {'layers': [(OATS, 220, 60), ((247, 245, 238), 180, 0), ((246, 190, 70), 60, 0)], 'speck': (200, 170, 120),
        'top': [('cube', (248, 178, 40), 12, 20), ('flake', (250, 248, 240), 18, 14), ('dust', (60, 60, 60), 10, 3)]},
    'oats-tiramisu': {'layers': [(OATS, 140, 50), ((168, 124, 90), 120, 30), ((245, 238, 226), 140, 0), ((120, 82, 58), 30, 0)], 'speck': (110, 76, 52),
        'top': [('dust', (92, 58, 38), 70, 6)]},
}

def main():
    for i, (rid, spec) in enumerate(SPECS.items()):
        if rid == 'oats-berry-turo':  # Replaced by a reviewed generated photo; preserve it.
            continue
        im = jar(stone(i + 7), spec, i + 3).resize((W, H), Image.LANCZOS)
        im.save(OUT / f'{rid}.webp', 'WEBP', quality=92, method=6)
        im.resize((384, 288), Image.LANCZOS).save(OUT / f'{rid}-thumb.webp', 'WEBP', quality=90, method=6)
        print('wrote', rid)

if __name__ == '__main__':
    main()
