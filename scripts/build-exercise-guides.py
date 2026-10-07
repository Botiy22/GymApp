from pathlib import Path
import json,re,subprocess
r=Path(__file__).resolve().parents[1]
data=json.loads(subprocess.check_output(['node',str(r/'scripts/catalogue-export.cjs')],text=True))
ex=data['exercises']; hu=data['hu']
def short(lines):
    useful=[re.sub(r'\s+',' ',s).strip() for s in lines if s.strip() and not re.match(r'^(repeat|ismételd|this will be your starting|ez a kiinduló)',s,re.I)]
    if len(useful)>3: useful=[useful[0],useful[len(useful)//2],useful[-1]]
    return [re.split(r'(?<=[.!?])\s+',s)[0] for s in useful]
g={e['id']:{'version':1,'reviewed':False,'summaryMethod':'source-extract'} for e in ex}
overrides=r/'data/exercise-guide-overrides.json'
if overrides.is_file():
    for id,entry in json.loads(overrides.read_text()).items():
        if id in g:g[id].update(entry)
for id,art in {'Standing_Military_Press':'press','Bent_Over_Barbell_Row':'row','Wide-Grip_Lat_Pulldown':'lat-wide','Medium_Grip_Lat_Pulldown':'lat-medium'}.items():
    g[id]['board']='img/fig/'+art+'.webp'
for e in ex:
    p=r/'img/guide'/f"{e['id']}.webp"
    if p.is_file() and not g[e['id']].get('board'):g[e['id']]['board']='img/guide/'+p.name
(r/'data/exercise-guides.js').write_text('/* Schema v1; original source descriptions are preserved. */\nwindow.EXERCISE_GUIDES = '+json.dumps(g,ensure_ascii=False,separators=(',',':'))+';\n')
def ready(v):
    return bool(v.get('board') and v['reviewed'] and all(len(v.get('steps',{}).get(lang,[]))==3 and all(isinstance(s,str) and s.strip() for s in v['steps'][lang]) for lang in ['hu','en']))
required=list(dict.fromkeys(data['planIds']+data['routineIds']))
missing=[id for id in required if not ready(g[id])]
if missing:raise ValueError('Required split/routine guides incomplete: '+', '.join(missing))
boards=sorted({v['board'] for v in g.values() if ready(v)} | {x['board'] for v in g.values() for x in v.get('variants',{}).values() if x.get('board')})
for board in boards:
    if not (r/board).is_file():raise ValueError('Missing published guide board: '+board)
sw=r/'sw.js';text=sw.read_text()
text=re.sub(r'const GUIDE_IMG = .*?;', 'const GUIDE_IMG = '+json.dumps(boards)+';',text,count=1)
sw.write_text(text)
status={'schemaVersion':1,'releaseScope':'curated-core-with-legacy-access','total':len(g),'generated':sum('board' in v for v in g.values()),'coreExercises':sum(ready(v) for v in g.values()),'requiredExercises':required,'requiredComplete':not missing,'curatedDescriptions':sum(v['reviewed'] for v in g.values()),'pending':[id for id,v in g.items() if 'board' not in v],'pendingDescriptions':[id for id,v in g.items() if not v['reviewed']]}
(r/'data/exercise-guide-status.json').write_text(json.dumps(status,indent=2))
print('Guide entries:',len(g),'boards:',status['generated'],'curated descriptions:',status['curatedDescriptions'])
