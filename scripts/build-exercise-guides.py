from pathlib import Path
import json,re,subprocess
r=Path(__file__).resolve().parents[1]
data=json.loads(subprocess.check_output(['node',str(r/'scripts/catalogue-export.cjs')],text=True))
ex=data['exercises']; hu=data['hu']
def short(lines):
    useful=[re.sub(r'\s+',' ',s).strip() for s in lines if s.strip() and not re.match(r'^(repeat|ismételd|this will be your starting|ez a kiinduló)',s,re.I)]
    if len(useful)>3: useful=[useful[0],useful[len(useful)//2],useful[-1]]
    return [re.split(r'(?<=[.!?])\s+',s)[0] for s in useful]
g={e['id']:{'version':1,'steps':{'hu':short(hu.get(e['id'],['',[]])[1]),'en':short(e['i'])},'reviewed':False,'summaryMethod':'source-extract'} for e in ex}
overrides=r/'data/exercise-guide-overrides.json'
if overrides.is_file():
    for id,entry in json.loads(overrides.read_text()).items():
        if id in g:g[id].update(entry)
for id,art in {'Standing_Military_Press':'press','Bent_Over_Barbell_Row':'row','Wide-Grip_Lat_Pulldown':'lat-wide','Medium_Grip_Lat_Pulldown':'lat-medium'}.items():
    g[id]['board']='img/fig/'+art+'.webp'
for e in ex:
    p=r/'img/guide'/f"{e['id']}.webp"
    if p.is_file():g[e['id']]['board']='img/guide/'+p.name
(r/'data/exercise-guides.js').write_text('/* Schema v1; original source descriptions are preserved. */\nwindow.EXERCISE_GUIDES = '+json.dumps(g,ensure_ascii=False,separators=(',',':'))+';\n')
status={'schemaVersion':1,'total':len(g),'generated':sum('board' in v for v in g.values()),'curatedDescriptions':sum(v['reviewed'] for v in g.values()),'pending':[id for id,v in g.items() if 'board' not in v],'pendingDescriptions':[id for id,v in g.items() if not v['reviewed']]}
(r/'data/exercise-guide-status.json').write_text(json.dumps(status,indent=2))
print('Guide entries:',len(g),'boards:',status['generated'],'curated descriptions:',status['curatedDescriptions'])
