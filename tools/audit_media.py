"""Build a prioritized illustration queue using exact exercise reference photos."""
import argparse
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def audit():
    script = """
    const fs=require('fs'),vm=require('vm');
    const context={window:{EX_HU:{},RECIPES:{items:[]}}};
    for(const file of ['data/exercises.js','data/figures.js','js/plan.js','data/additions.js'])
      vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
    const w=context.window;
    process.stdout.write(JSON.stringify({exercises:w.EXERCISES,figures:w.FIG,art:w.EX_ART,
      planned:[...w.PLAN.items,...w.EXTRA_ROUTINES.flatMap(r=>r.items)].map(i=>i.ex)}));
    """
    data = json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT))
    planned = set(data['planned'])
    queue = []
    counts = {'exercises': 0, 'drawings': 0, 'photo_pairs': 0, 'without_any_pair': 0}
    for exercise in data['exercises']:
        eid = exercise['id']
        photos = [f'img/ex/{eid}/{phase}.jpg' for phase in [0, 1]]
        photo_pair = all((ROOT / path).is_file() for path in photos)
        figure = data['figures'].get(eid)
        art = data['art'].get(eid)
        drawing = bool(art and (ROOT / f'img/fig/{art}.webp').is_file()) or bool(figure and all((ROOT / f'img/fig/{figure}-{phase}.svg').is_file() for phase in [0, 1]))
        counts['exercises'] += 1
        counts['drawings'] += drawing
        counts['photo_pairs'] += photo_pair
        counts['without_any_pair'] += not (drawing or photo_pair)
        if not drawing:
            queue.append({'id': eid, 'name': exercise['n'], 'planned': eid in planned,
                          'equipment': exercise['eq'], 'muscles': exercise['p'],
                          'references': photos if photo_pair else [],
                          'instructions': exercise['i']})
    queue.sort(key=lambda item: (not item['planned'], bool(item['references']), item['equipment'], item['id']))
    return {'coverage': counts, 'illustration_queue': queue}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, help='Write the complete production queue as JSON.')
    args = parser.parse_args()
    report = audit()
    if args.output:
        args.output.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report['coverage'], indent=2))
    print('Missing illustrations used by built-in routines:', sum(item['planned'] for item in report['illustration_queue']))
