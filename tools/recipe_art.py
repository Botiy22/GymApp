"""Original flat illustrations for the recipes added in 2.31 (juices, muffins, meat roll). Not photographs.
Run from the repository root: python3 tools/recipe_art.py  -> img/recipes/<id>.webp (1448x1086) and <id>-thumb.webp (384x288).
Needs Playwright with Chromium (set GYMAPP_BROWSER_EXECUTABLE) and Pillow."""
import io, math, os, random
from pathlib import Path
W, H = 1448, 1086
def bg(seed):
    rnd = random.Random(seed)
    specks = ''.join(f'<circle cx="{rnd.uniform(0,W):.0f}" cy="{rnd.uniform(0,H):.0f}" r="{rnd.uniform(1,3.2):.1f}" fill="#b9ab98" opacity="{rnd.uniform(.08,.22):.2f}"/>' for _ in range(260))
    return (f'<defs><radialGradient id="light" cx="35%" cy="25%" r="85%"><stop offset="0" stop-color="#f4efe7"/><stop offset="1" stop-color="#ddd2c3"/></radialGradient>'
            f'<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter></defs>'
            f'<rect width="{W}" height="{H}" fill="url(#light)"/>{specks}')
def shadow(cx, cy, rx, ry, o=.22):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#5b4a37" opacity="{o}" filter="url(#soft)"/>'
def citrus(cx, cy, r, peel, flesh, rot=0):
    segs = ''.join(f'<path d="M{cx} {cy}L{cx + math.cos(math.radians(a + rot)) * r * .78:.1f} {cy + math.sin(math.radians(a + rot)) * r * .78:.1f}" stroke="#fff8e6" stroke-width="{r*.06:.1f}" opacity=".85"/>' for a in range(0, 360, 45))
    return (shadow(cx + r * .15, cy + r * .2, r * 1.02, r * .9, .25) + f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{peel}"/><circle cx="{cx}" cy="{cy}" r="{r*.88}" fill="#fff8e6"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r*.8}" fill="{flesh}"/>{segs}<circle cx="{cx}" cy="{cy}" r="{r*.12}" fill="#fff8e6"/>')
def glass(cx, top, w, h, colors, ice=True, seeds=False):
    x1, x2, bw = cx - w / 2, cx + w / 2, w * .82
    b1, b2 = cx - bw / 2, cx + bw / 2
    grad = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in colors)
    level = top + h * .14
    s = shadow(cx + 30, top + h + 10, w * .62, 40, .3)
    s += f'<defs><linearGradient id="liq{cx}" x1="0" y1="0" x2="0" y2="1">{grad}</linearGradient><linearGradient id="gl{cx}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity=".05"/><stop offset=".8" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient></defs>'
    s += f'<path d="M{x1+10} {level}L{x2-10} {level}L{b2} {top+h-18}Q{cx} {top+h+6} {b1} {top+h-18}Z" fill="url(#liq{cx})"/>'
    if ice:
        rnd = random.Random(int(cx))
        for _ in range(5):
            ix, iy, sz = rnd.uniform(x1 + 50, x2 - 110), rnd.uniform(level - 10, level + 120), rnd.uniform(60, 85)
            s += f'<rect x="{ix:.0f}" y="{iy:.0f}" width="{sz:.0f}" height="{sz*.85:.0f}" rx="14" fill="#ffffff" opacity=".28" transform="rotate({rnd.uniform(-20,20):.0f} {ix+sz/2:.0f} {iy+sz/2:.0f})"/>'
    if seeds:
        rnd = random.Random(7)
        s += ''.join(f'<ellipse cx="{rnd.uniform(b1+20,b2-20):.0f}" cy="{rnd.uniform(level+40,top+h-40):.0f}" rx="5" ry="3.5" fill="#2e2a27" opacity=".75"/>' for _ in range(90))
    s += f'<path d="M{x1} {top}L{x2} {top}L{b2} {top+h-18}Q{cx} {top+h+6} {b1} {top+h-18}Z" fill="url(#gl{cx})" stroke="#ffffff" stroke-opacity=".8" stroke-width="7"/>'
    s += f'<ellipse cx="{cx}" cy="{top}" rx="{w/2}" ry="22" fill="none" stroke="#ffffff" stroke-opacity=".85" stroke-width="7"/>'
    s += f'<path d="M{x1+34} {top+40}L{b1+26} {top+h-60}" stroke="#fff" stroke-opacity=".6" stroke-width="16" stroke-linecap="round"/>'
    return s
def carrot(x, y, ang, ln=330):
    return (f'<g transform="rotate({ang} {x} {y})">' + shadow(x + ln / 2, y + 30, ln / 2, 34, .2) +
            f'<path d="M{x} {y-34}Q{x+ln*.5} {y-30} {x+ln} {y}Q{x+ln*.5} {y+30} {x} {y+34}Q{x-14} {y} {x} {y-34}Z" fill="#ec7a2c"/>'
            + ''.join(f'<path d="M{x+ln*k:.0f} {y-22+k*14:.0f}l18 6" stroke="#c45f1c" stroke-width="6" stroke-linecap="round"/>' for k in (.2, .38, .55, .7))
            + f'<path d="M{x-6} {y}l-70 -40M{x-6} {y}l-80 6M{x-6} {y}l-60 46" stroke="#4f9d44" stroke-width="13" stroke-linecap="round"/></g>')
def beet(x, y, r):
    return (shadow(x + 20, y + 30, r * 1.05, r * .8, .25) + f'<circle cx="{x}" cy="{y}" r="{r}" fill="#7a1f45"/><circle cx="{x}" cy="{y}" r="{r*.72}" fill="#a12a5c"/>'
            f'<circle cx="{x}" cy="{y}" r="{r*.48}" fill="#7a1f45" opacity=".6"/><circle cx="{x}" cy="{y}" r="{r*.25}" fill="#b63a70"/>')
def cucumber(x, y, r):
    seeds = ''.join(f'<ellipse cx="{x + math.cos(math.radians(a)) * r * .42:.0f}" cy="{y + math.sin(math.radians(a)) * r * .42:.0f}" rx="{r*.07:.0f}" ry="{r*.12:.0f}" fill="#e9f2c9" transform="rotate({a+90} {x + math.cos(math.radians(a)) * r * .42:.0f} {y + math.sin(math.radians(a)) * r * .42:.0f})"/>' for a in range(0, 360, 40))
    return shadow(x + 14, y + 20, r, r * .8, .22) + f'<circle cx="{x}" cy="{y}" r="{r}" fill="#2f6b34"/><circle cx="{x}" cy="{y}" r="{r*.9}" fill="#cfe3a4"/><circle cx="{x}" cy="{y}" r="{r*.6}" fill="#b6d684"/>{seeds}'
def ginger(x, y):
    return shadow(x + 40, y + 30, 120, 50, .22) + f'<path d="M{x-90} {y}q20-50 70-30q30-50 70-10q50-10 60 30q-10 40-60 30q-40 30-80 0q-50 20-60-20Z" fill="#d9b277" stroke="#b58a4d" stroke-width="6"/>'
def wedge(x, y, r, color, rind, ang):
    a1, a2 = math.radians(ang - 32), math.radians(ang + 32)
    return (shadow(x + 10, y + 16, r * .7, r * .4, .2) + f'<path d="M{x} {y}L{x+math.cos(a1)*r:.0f} {y+math.sin(a1)*r:.0f}A{r} {r} 0 0 1 {x+math.cos(a2)*r:.0f} {y+math.sin(a2)*r:.0f}Z" fill="{rind}"/>'
            f'<path d="M{x} {y}L{x+math.cos(a1)*r*.88:.0f} {y+math.sin(a1)*r*.88:.0f}A{r*.88} {r*.88} 0 0 1 {x+math.cos(a2)*r*.88:.0f} {y+math.sin(a2)*r*.88:.0f}Z" fill="{color}"/>')
def leaves(x, y):
    return ''.join(f'<path d="M{x} {y}q{30*math.cos(math.radians(a)):.0f} {-120:.0f} {60*math.cos(math.radians(a)):.0f} -{170+20*abs(math.sin(math.radians(a))):.0f}q-10 90 {-55*math.cos(math.radians(a)):.0f} 170Z" fill="#4c8f43" stroke="#3a7334" stroke-width="5"/>' for a in (-50, -20, 10, 40))
def hibiscus(x, y):
    return ''.join(f'<ellipse cx="{x + math.cos(math.radians(a)) * 34:.0f}" cy="{y + math.sin(math.radians(a)) * 22:.0f}" rx="34" ry="16" fill="#8d1c34" transform="rotate({a} {x + math.cos(math.radians(a)) * 34:.0f} {y + math.sin(math.radians(a)) * 22:.0f})"/>' for a in range(0, 360, 60))
def chia_bowl(x, y):
    rnd = random.Random(3)
    return shadow(x + 20, y + 40, 150, 50, .25) + f'<ellipse cx="{x}" cy="{y}" rx="140" ry="62" fill="#f7f3ec" stroke="#d8d0c4" stroke-width="6"/><ellipse cx="{x}" cy="{y}" rx="104" ry="40" fill="#3b3633"/>' + ''.join(f'<circle cx="{x+rnd.uniform(-90,90):.0f}" cy="{y+rnd.uniform(-30,30):.0f}" r="4" fill="#8e8780"/>' for _ in range(80))
def watermelon(x, y):
    a = (shadow(x + 20, y + 40, 220, 60, .25) + f'<path d="M{x-230} {y}A230 150 0 0 0 {x+230} {y}Z" fill="#2f6b34"/><path d="M{x-205} {y}A205 128 0 0 0 {x+205} {y}Z" fill="#dfeec4"/><path d="M{x-185} {y}A185 112 0 0 0 {x+185} {y}Z" fill="#e8475c"/>')
    rnd = random.Random(5)
    return a + ''.join(f'<ellipse cx="{x+rnd.uniform(-130,130):.0f}" cy="{y+rnd.uniform(20,70):.0f}" rx="7" ry="11" fill="#2e2a27"/>' for _ in range(14))
def juice(spec):
    s = bg(spec['seed'])
    for item in spec['back']: s += item
    s += glass(724, 230, 430, 700, spec['colors'], seeds=spec.get('seeds', False))
    for item in spec['front']: s += item
    return s
def muffins():
    s = bg(11) + shadow(740, 640, 520, 250, .3) + '<ellipse cx="724" cy="560" rx="520" ry="330" fill="#faf8f4" stroke="#e4ddd2" stroke-width="10"/><ellipse cx="724" cy="560" rx="440" ry="270" fill="none" stroke="#ece6dc" stroke-width="6"/>'
    rnd = random.Random(2)
    spots = [(560, 430), (760, 400), (930, 470), (470, 600), (700, 590), (900, 640), (620, 760), (820, 790)]
    for (x, y) in sorted(spots, key=lambda p: p[1]):
        s += shadow(x + 14, y + 70, 120, 40, .25)
        s += f'<path d="M{x-105} {y+10}L{x-80} {y+105}Q{x} {y+125} {x+80} {y+105}L{x+105} {y+10}Z" fill="#8fbcd4"/>' + ''.join(f'<path d="M{x-100+k*25} {y+12}L{x-78+k*20} {y+106}" stroke="#6f9db6" stroke-width="5"/>' for k in range(9))
        s += f'<path d="M{x-118} {y+18}Q{x-126} {y-70} {x} {y-82}Q{x+126} {y-70} {x+118} {y+18}Q{x} {y+40} {x-118} {y+18}Z" fill="#9a6a45"/>'
        s += f'<path d="M{x-80} {y-40}Q{x} {y-70} {x+70} {y-36}" stroke="#b8865e" stroke-width="14" stroke-linecap="round" fill="none" opacity=".7"/>'
        s += ''.join(f'<rect x="{x+rnd.uniform(-85,70):.0f}" y="{y+rnd.uniform(-60,5):.0f}" width="{rnd.uniform(14,24):.0f}" height="{rnd.uniform(12,20):.0f}" rx="4" fill="#3b2418" transform="rotate({rnd.uniform(-30,30):.0f} {x} {y})"/>' for _ in range(7))
        s += ''.join(f'<ellipse cx="{x+rnd.uniform(-80,70):.0f}" cy="{y+rnd.uniform(-50,0):.0f}" rx="13" ry="9" fill="#e9d59c" opacity=".85"/>' for _ in range(3))
    s += shadow(1190, 300, 110, 40, .2) + '<g transform="rotate(-25 1180 260)"><path d="M1060 270q120-90 250-10q-125 40-250 10Z" fill="#f2d24b" stroke="#c9a52c" stroke-width="7"/><path d="M1300 258l22-10" stroke="#5c4a2a" stroke-width="10" stroke-linecap="round"/></g>'
    return s
def meat_roll():
    s = bg(21) + shadow(760, 650, 600, 240, .3)
    s += '<rect x="160" y="330" width="1130" height="540" rx="60" fill="#c99565"/><rect x="160" y="330" width="1130" height="540" rx="60" fill="none" stroke="#a87442" stroke-width="10"/>'
    s += ''.join(f'<path d="M190 {y}H1260" stroke="#b98656" stroke-width="5" opacity=".45"/>' for y in range(380, 850, 46))
    # the log, cheese browned on top
    s += shadow(640, 640, 340, 90, .35) + '<rect x="300" y="470" width="600" height="230" rx="115" fill="#8a4a32"/><path d="M330 500Q600 430 870 500" stroke="#f0c75a" stroke-width="34" stroke-linecap="round" fill="none"/><path d="M360 520Q600 470 850 520" stroke="#d99a3a" stroke-width="16" stroke-linecap="round" fill="none" opacity=".8"/>'
    # slices showing the spiral
    for x, y in [(980, 600), (1130, 640)]:
        s += shadow(x + 18, y + 40, 120, 60, .3) + f'<ellipse cx="{x}" cy="{y}" rx="118" ry="112" fill="#7b412c"/>'
        s += f'<path d="M{x} {y}m-8 0a20 20 0 1 1 30 18a44 44 0 1 1-58-40a70 70 0 1 1 88 70" fill="none" stroke="#d6402e" stroke-width="13"/><path d="M{x} {y}m-8 0a28 28 0 1 1 36 22a52 52 0 1 1-64-46a78 78 0 1 1 94 80" fill="none" stroke="#f2cc58" stroke-width="9"/>'
        s += f'<path d="M{x-96} {y-60}Q{x} {y-128} {x+96} {y-60}" stroke="#f0c75a" stroke-width="22" stroke-linecap="round" fill="none"/>'
    s += ''.join(f'<path d="M{x} {y}l14 -26 14 26" stroke="#4f9d44" stroke-width="9" stroke-linecap="round" fill="none"/>' for x, y in [(420, 530), (560, 505), (700, 512), (820, 535), (1000, 520), (1150, 560)])
    return s
JUICES = {
    'clip-juice-carrot-orange': dict(seed=31, colors=[(0, '#f6a640'), (1, '#e27718')],
        back=[carrot(980, 860, -18), carrot(1010, 930, -8)], front=[citrus(330, 830, 170, '#f08a1c', '#f7ad3a'), ginger(1110, 920)]),
    'clip-juice-beet-carrot': dict(seed=32, colors=[(0, '#e0587e'), (1, '#9d1f4f')],
        back=[carrot(1000, 300, 40, 300)], front=[beet(320, 820, 150), cucumber(1130, 860, 120), citrus(1160, 560, 110, '#f08a1c', '#f7ad3a')]),
    'clip-juice-pineapple-hibiscus': dict(seed=33, colors=[(0, '#a11f3c'), (.42, '#c03042'), (.55, '#f2b93b'), (1, '#f6d34e')],
        back=[], front=[wedge(330, 880, 230, '#f6d55a', '#c99a2e', -80), wedge(1180, 470, 170, '#f6d55a', '#c99a2e', -100), citrus(1120, 880, 110, '#4f9d44', '#b9dc6a'), hibiscus(1180, 650)]),
    'clip-juice-watermelon-beet': dict(seed=34, colors=[(0, '#e8475c'), (1, '#a51d3d')],
        back=[], front=[watermelon(330, 870), beet(1140, 860, 110), citrus(1130, 600, 95, '#4f9d44', '#b9dc6a'), ginger(1120, 1010)]),
    'clip-juice-cucumber-lemon-chia': dict(seed=35, colors=[(0, '#dfeec4'), (1, '#c4de9a')], seeds=True,
        back=[], front=[cucumber(320, 860, 140), citrus(1130, 820, 125, '#f2d24b', '#f7e17e'), chia_bowl(1140, 1010)]),
}
def render(pieces):
    from playwright.sync_api import sync_playwright
    from PIL import Image
    root = Path(__file__).resolve().parents[1] / 'img' / 'recipes'
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('GYMAPP_BROWSER_EXECUTABLE', '/usr/bin/chromium'), args=['--no-sandbox'])
        page = b.new_page(viewport={'width': W, 'height': H})
        for rid, body in pieces.items():
            page.set_content(f'<body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{body}</svg></body>')
            img = Image.open(io.BytesIO(page.screenshot())).convert('RGB')
            img.save(root / f'{rid}.webp', 'WEBP', quality=90)
            img.resize((384, 288), Image.LANCZOS).save(root / f'{rid}-thumb.webp', 'WEBP', quality=88)
        b.close()
    print(len(pieces), 'recipe illustrations written to', root)
if __name__ == '__main__':
    pieces = {k: juice(v) for k, v in JUICES.items()}
    pieces['clip-protein-banana-muffins'] = muffins()
    pieces['clip-pizza-meat-roll'] = meat_roll()
    render(pieces)
