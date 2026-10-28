"""Publish reviewed image-generator outputs; never synthesize or redraw image content.

Input JSON: {"foods": [{"id", "path"}], "recovery": [{"id", "path"}]}.
Food photos stay whole, with a whole-frame thumbnail. Recovery input is one
explicit start/finish board per movement, never a food atlas. Each SVG is a
self-contained viewport over the SAME encoded board (no pixel compositing),
so the existing phase URLs work in previews, exercise details and offline zoom.
"""
import argparse
import base64
import hashlib
import io
import json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]


def publish(manifest):
    records=[]
    for entry in manifest.get('foods',[]):
        source=Path(entry['path']);rid=entry['id'];image=Image.open(source).convert('RGB')
        source_size=image.size
        if image.size!=(1448,1086):
            # Generation can differ by a pixel. Normalize the whole frame, never crop.
            if max(abs(image.width-1448),abs(image.height-1086))>2:
                raise ValueError(f'{rid}: expected near-native 1448x1086 image, got {image.size}')
            image=image.resize((1448,1086),Image.Resampling.LANCZOS)
        dest=ROOT/'img/recipes'/f'{rid}.webp'
        image.save(dest,'WEBP',quality=92,method=6)
        image.resize((384,288),Image.Resampling.LANCZOS).save(dest.with_name(rid+'-thumb.webp'),'WEBP',quality=90,method=6)
        records.append({'id':rid,'kind':'food-photo','source':source.name,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'size':list(image.size),'source_size':list(source_size)})
    for entry in manifest.get('recovery',[]):
        folder=entry.get('folder','recovery')
        if folder not in ('recovery','library'): raise ValueError('Invalid art folder')
        source=Path(entry['path']);rid=entry['id'];image=Image.open(source).convert('RGB')
        if image.size!=(1536,1024):
            raise ValueError(f'{rid}: expected a reviewed equal-half 1536x1024 movement board, got {image.size}')
        buffer=io.BytesIO();image.save(buffer,'WEBP',quality=92,method=6)
        embedded=base64.b64encode(buffer.getvalue()).decode()
        for phase in (0,1):
            # Two independent portrait viewports preserve the paired artwork exactly.
            svg=(f'<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1024">'
                 f'<title>Movement illustration · {rid} · {"Finish" if phase else "Start"}</title>'
                 f'<rect width="768" height="1024" fill="#fff"/>'
                 f'<image x="{-768*phase}" y="0" width="1536" height="1024" href="data:image/webp;base64,{embedded}"/>'
                 '</svg>\n')
            (ROOT/'img'/folder/f'{rid}-{phase}.svg').write_text(svg,encoding='utf-8',newline='\n')
        records.append({'id':rid,'kind':'recovery-pair','source':source.name,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'size':list(image.size),'phase_size':[768,1024]})
    return records


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('manifest',type=Path);parser.add_argument('--provenance',type=Path)
    args=parser.parse_args();records=publish(json.loads(args.manifest.read_text()))
    if args.provenance:
        args.provenance.write_text(json.dumps({'date':json.loads(args.manifest.read_text()).get('date','2026-10-24'),'generator':'OpenAI image generation','records':records},indent=2)+'\n')
    print(f'Published {len(records)} individually generated art assets')
