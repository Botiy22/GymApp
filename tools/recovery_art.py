"""Original Reppsy line drawings for the recovery exercises in data/recovery.js (not traced from any video).
Run from the repository root: python3 tools/recovery_art.py  -> img/recovery/<name>-0.svg (start) and -1.svg (finish).
Side view, the figure faces right. Angles in degrees: 0 = straight down, positive = toward the front."""
import math
from pathlib import Path
L = dict(torso=74, neck=16, head=15, uarm=42, farm=38, thigh=56, shin=54, foot=22)
W = dict(torso=34, uarm=13, farm=11, thigh=21, shin=15, foot=9)
INK = '#1d1e24'
def pt(p, ang, ln):
    a = math.radians(ang); return (p[0] + math.sin(a) * ln, p[1] + math.cos(a) * ln)
def solve(P):
    hip = (0.0, 0.0)
    neck = pt(hip, 180 - P.get('torso', 0), L['torso'])     # up = 180 deg from down
    head = pt(neck, 180 - P.get('headt', P.get('torso', 0)), L['neck'] + L['head'])
    sh = pt(hip, 180 - P.get('torso', 0), L['torso'] - 8)
    j = dict(hip=hip, neck=neck, head=head, sh=sh)
    for s in 'nf':
        k = pt(hip, P['th' + s], L['thigh']); a = pt(k, P['sh' + s], L['shin']); t = pt(a, P.get('ft' + s, 90), L['foot'])
        e = pt(sh, P['ua' + s], L['uarm']); w = pt(e, P['fa' + s], L['farm'])
        j.update({'knee' + s: k, 'ankle' + s: a, 'toe' + s: t, 'elbow' + s: e, 'wrist' + s: w})
    return j
def seg(a, b, w, fill, stroke=INK):
    d = f'M{a[0]:.1f} {a[1]:.1f}L{b[0]:.1f} {b[1]:.1f}'
    return f'<path d="{d}" stroke="{stroke}" stroke-width="{w + 5}" stroke-linecap="round"/><path d="{d}" stroke="{fill}" stroke-width="{w}" stroke-linecap="round"/>'
def figure(P, floor=272, x0=None, shift=(0, 0)):
    j = solve(P)
    if 'anchor' in P:
        name, y = P['anchor']; dy = y - j[name][1]
    else:
        lowest = max(v[1] for k, v in j.items() if k[:-1] in ('toe', 'ankle', 'knee', 'wrist') or k in ('head', 'hip', 'sh'))
        dy = floor - lowest - 4
    dx = (x0 if x0 is not None else P.get('x', 150)) + shift[0]; dy += shift[1]
    j = {k: (v[0] + dx, v[1] + dy) for k, v in j.items()}
    out = []
    far, near = '#d9dbe2', '#ffffff'
    out.append(seg(j['sh'], j['elbowf'], W['uarm'], far) + seg(j['elbowf'], j['wristf'], W['farm'], far))
    out.append(seg(j['hip'], j['kneef'], W['thigh'], far) + seg(j['kneef'], j['anklef'], W['shin'], far) + seg(j['anklef'], j['toef'], W['foot'], far))
    # torso: hip to shoulder, slightly wider at the chest
    out.append(seg(j['hip'], j['sh'], W['torso'], near))
    out.append(seg(j['sh'], j['neck'], 10, near))
    out.append(f'<circle cx="{j["head"][0]:.1f}" cy="{j["head"][1]:.1f}" r="{L["head"]}" fill="{near}" stroke="{INK}" stroke-width="2.6"/>')
    out.append(seg(j['hip'], j['kneen'], W['thigh'], near) + seg(j['kneen'], j['anklen'], W['shin'], near) + seg(j['anklen'], j['toen'], W['foot'], near))
    out.append(seg(j['sh'], j['elbown'], W['uarm'], near) + seg(j['elbown'], j['wristn'], W['farm'], near))
    out.append(f'<circle cx="{j["wristn"][0]:.1f}" cy="{j["wristn"][1]:.1f}" r="6.5" fill="{near}" stroke="{INK}" stroke-width="2.4"/>')
    return ''.join(out), j
def band(a, b, color='#e5484d', w=7):
    return f'<path d="M{a[0]:.1f} {a[1]:.1f}L{b[0]:.1f} {b[1]:.1f}" stroke="{color}" stroke-width="{w}" stroke-linecap="round" opacity=".95"/>'
def loop(c, color='#e5484d', rx=13, ry=6):
    return f'<ellipse cx="{c[0]:.1f}" cy="{c[1]:.1f}" rx="{rx}" ry="{ry}" fill="none" stroke="{color}" stroke-width="5"/>'
def svg(body, w=300, h=300, floor=272, props=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w*2}" height="{h*2}" fill="none" stroke-linejoin="round">'
            f'<rect width="{w}" height="{h}" fill="#ffffff"/><path d="M14 {floor}H{w-14}" stroke="#c9ccd5" stroke-width="3" stroke-linecap="round"/>{props}{body}</svg>')

RED, BLUE = '#e5484d', '#3b6fe0'
HIPS = dict(uan=-35, fan=55, uaf=-30, faf=50)          # hands on hips
def S(**k):
    d = dict(torso=0, thn=0, shn=0, thf=0, shf=0, uan=6, fan=20, uaf=-6, faf=14); d.update(k); return d
def post(x, top=112):
    return f'<path d="M{x} {top}V272" stroke="#8b8e99" stroke-width="9" stroke-linecap="round"/><path d="M{x-14} 272H{x+14}" stroke="#8b8e99" stroke-width="5" stroke-linecap="round"/>'
def box(x1, x2, top, label=''):
    return f'<rect x="{x1}" y="{top}" width="{x2-x1}" height="{272-top}" rx="5" fill="#eceef3" stroke="#8b8e99" stroke-width="3"/>'
def rail(x, y=150):
    return f'<path d="M{x} {y}V272M{x-30} {y}H{x+30}" stroke="#8b8e99" stroke-width="7" stroke-linecap="round"/>'
def mat(x1=40, x2=260):
    return f'<rect x="{x1}" y="268" width="{x2-x1}" height="7" rx="3" fill="#cfd3dc"/>'
def cone(x):
    return f'<path d="M{x-11} 271L{x} 240L{x+11} 271Z" fill="#f2a65a" stroke="#1d1e24" stroke-width="2.5"/>'
def ball(c):
    return f'<circle cx="{c[0]:.1f}" cy="{c[1]:.1f}" r="15" fill="#f2a65a" stroke="#1d1e24" stroke-width="2.6"/>'
EX = {}
def ex(name):
    def deco(fn): EX[name] = fn; return fn
    return deco

@ex('banded-squat')
def _(ph):
    P = S(uan=70, fan=95, uaf=65, faf=90) if ph == 0 else S(torso=35, thn=92, shn=-28, thf=92, shf=-28, uan=80, fan=95, uaf=75, faf=92)
    b, j = figure(P); return b + loop(((j['kneen'][0] + j['kneef'][0]) / 2 - 3, j['kneen'][1] - 10), RED, 15, 7), ''
@ex('tke')
def _(ph):
    P = S(thn=16, shn=-16, thf=-8, shf=-8, **HIPS) if ph == 0 else S(thn=4, shn=2, thf=-8, shf=-8, **HIPS)
    b, j = figure(P, x0=130); return band(j['kneen'], (255, j['kneen'][1] + 2), RED) + b + loop(j['kneen'], RED, 9, 6), post(258)
@ex('banded-split-squat')
def _(ph):
    P = S(torso=12, thn=28, shn=-4, thf=-32, shf=-14, ftf=40, uan=70, fan=70, uaf=64, faf=66) if ph == 0 else S(torso=14, thn=84, shn=-4, thf=-6, shf=-92, ftf=-40, uan=72, fan=72, uaf=66, faf=68)
    b, j = figure(P, x0=140); return band(j['kneen'], (255, 254), RED) + b + loop(j['kneen'], RED, 9, 6), post(258, 162)
@ex('hamstring-hold')
def _(ph):
    P = S(**HIPS) if ph == 0 else S(thn=-8, shn=-105, ftn=-10, **HIPS)
    b, j = figure(P, x0=140); return band(j['anklen'], (258, 260), RED) + b, post(258, 222)
@ex('single-leg-balance')
def _(ph):
    P = S(**HIPS) if ph == 0 else S(thn=88, shn=-2, **HIPS)
    b, j = figure(P, x0=160); return band((42, 260), j['anklef'], RED) + b + loop(j['anklef'], RED, 8, 5), post(40, 222)
@ex('single-leg-squat-hold')
def _(ph):
    P = S(torso=8, thn=-22, shn=-55, **HIPS) if ph == 0 else S(torso=24, thf=38, shf=-24, thn=-10, shn=-62, **HIPS)
    b, j = figure(P, x0=160); return band((42, 260), j['anklef'], RED) + b + loop(j['anklef'], RED, 8, 5), post(40, 222)
@ex('quadruped-kickback')
def _(ph):
    base = dict(torso=88, uan=2, fan=0, uaf=-2, faf=0, thf=-2, shf=-90, ftf=-160)
    P = dict(base, thn=0, shn=-90, ftn=-160) if ph == 0 else dict(base, thn=-92, shn=-92, ftn=-10)
    b, j = figure(P, x0=110); return band(j['wristn'], j['anklen'], BLUE, 6) + b, mat()
@ex('knee-drive')
def _(ph):
    P = S(torso=6, thn=48, shn=0, thf=-14, shf=-14, **HIPS) if ph == 0 else S(torso=10, thn=70, shn=-32, thf=-16, shf=-16, **HIPS)
    b, j = figure(P, x0=140); step = box(j['anklen'][0] - 28, j['toen'][0] + 16, j['toen'][1] + 4)
    return band((40, 250), (j['kneen'][0] * .35 + j['anklen'][0] * .65, j['kneen'][1] * .35 + j['anklen'][1] * .65), BLUE, 6) + b, step + post(38, 222)
@ex('march-hold')
def _(ph):
    P = S(**HIPS) if ph == 0 else S(thn=92, shn=0, **HIPS)
    b, j = figure(P, x0=150); return band((150, 269), j['anklen'], BLUE, 6) + b, '<circle cx="150" cy="269" r="5" fill="#8b8e99"/>'
@ex('split-stance-hold')
def _(ph):
    P = S(torso=8, thn=24, shn=-4, thf=-24, shf=-24, ftf=60, **HIPS) if ph == 0 else S(torso=22, thn=52, shn=-14, thf=-22, shf=-40, ftf=40, **HIPS)
    b, j = figure(P, x0=150); return band((40, 260), j['anklef'], '#7b5cd6', 6) + b + loop(j['anklef'], '#7b5cd6', 8, 5), post(38, 222)
@ex('foot-taps')
def _(ph):
    P = S(thf=10, shf=-10, thn=4, shn=-4, ftn=110, **HIPS) if ph == 0 else S(torso=8, thf=24, shf=-20, thn=40, shn=38, **HIPS)
    b, j = figure(P, x0=150); return band((40, j['kneef'][1]), j['kneef'], BLUE, 6) + b + loop(j['kneef'], BLUE, 9, 6), post(38, 172)
@ex('step-down')
def _(ph):
    P = dict(S(thn=10, shn=-4, ftn=100, uan=40, fan=60, uaf=35, faf=55), anchor=('anklef', 236)) if ph == 0 else dict(S(torso=22, thf=44, shf=-28, thn=34, shn=18, ftn=80, uan=70, fan=80, uaf=60, faf=75), anchor=('anklef', 236))
    b, j = figure(P, x0=104); return b, box(60, 140, 244)

@ex('split-squat-hold')
def _(ph):
    P = S(torso=12, thn=28, shn=-4, thf=-32, shf=-14, ftf=40, uan=70, fan=70, uaf=64, faf=66) if ph == 0 else S(torso=14, thn=80, shn=-6, thf=-10, shf=-86, ftf=-40, uan=72, fan=72, uaf=66, faf=68)
    b, j = figure(P, x0=140); return b, rail(250, 172)
@ex('plate-balance-swing')
def _(ph):
    P = S(thn=-34, shn=-50, **HIPS) if ph == 0 else S(thn=34, shn=20, **HIPS)
    P['anchor'] = ('anklef', 254)
    b, j = figure(P, x0=160); return band((42, 252), j['anklef'], BLUE, 6) + b + loop(j['anklef'], BLUE, 8, 5), '<rect x="128" y="260" width="62" height="12" rx="4" fill="#4a4d57"/>' + post(40, 218)
@ex('sl-rdl-reach')
def _(ph):
    P = S(thn=-10, shn=-30, uan=10, fan=10, uaf=-5, faf=0) if ph == 0 else S(torso=78, thf=10, shf=-8, thn=-88, shn=-88, ftn=0, uan=20, fan=22, uaf=10, faf=12)
    b, j = figure(P, x0=140); return b, cone(255)
@ex('ball-reverse-lunge')
def _(ph):
    P = S(uan=30, fan=150, uaf=26, faf=146) if ph == 0 else S(torso=4, thf=78, shf=-4, thn=-14, shn=-96, ftn=-40, uan=30, fan=150, uaf=26, faf=146)
    b, j = figure(P, x0=150); return b + ball((j['wristn'][0] + 6, j['wristn'][1] - 6)), ''
@ex('lying-leg-raise')
def _(ph):
    P = dict(torso=-90, headt=-90, thn=90, shn=90, thf=90, shf=90, ftn=180, ftf=180, uan=88, fan=90, uaf=88, faf=90) if ph == 0 else dict(torso=-90, headt=-90, thn=178, shn=178, thf=176, shf=176, ftn=268, ftf=268, uan=88, fan=90, uaf=88, faf=90)
    b, j = figure(P, x0=170); return b, mat(30, 280)

if __name__ == '__main__':
    out = Path(__file__).resolve().parents[1] / 'img' / 'recovery'
    out.mkdir(parents=True, exist_ok=True)
    for name, fn in EX.items():
        for phase in (0, 1):
            body, props = fn(phase)
            (out / f'{name}-{phase}.svg').write_text(svg(body, props=props) + '\n')
    print(len(EX) * 2, 'drawings written to', out)
