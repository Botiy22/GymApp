"""Real browser regression checks; fixtures contain invented test data, never user plans."""
import functools
import http.server
import json
import hashlib
import os
from pathlib import Path
import tempfile
import threading
from urllib.parse import urlsplit
import unittest
from xml.sax.saxutils import escape
import zipfile
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]


def xlsx(path, sheets, shared=False):
    """Produce actual OOXML archives, with inline or shared strings and optional merged cells."""
    pool = []
    entries = {}
    for number, sheet in enumerate(sheets, 1):
        name, rows = sheet[:2]
        merges = sheet[2] if len(sheet) > 2 else []
        body = []
        for ri, row in enumerate(rows, 1):
            cells = []
            for ci, value in enumerate(row):
                if value is None:
                    continue
                col = ''
                n = ci + 1
                while n:
                    n, rem = divmod(n - 1, 26)
                    col = chr(65 + rem) + col
                ref = f'{col}{ri}'
                if isinstance(value, dict):
                    saved = f'<v>{value["cached"]}</v>' if value.get('cached') is not None else ''
                    cells.append(f'<c r="{ref}"><f>{escape(value["formula"])}</f>{saved}</c>')
                elif isinstance(value, (int, float)):
                    cells.append(f'<c r="{ref}"><v>{value}</v></c>')
                elif shared:
                    if value not in pool:
                        pool.append(value)
                    cells.append(f'<c r="{ref}" t="s"><v>{pool.index(value)}</v></c>')
                else:
                    cells.append(f'<c r="{ref}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>')
            body.append(f'<row r="{ri}">'+''.join(cells)+'</row>')
        merge_xml = '<mergeCells>'+''.join(f'<mergeCell ref="{ref}"/>' for ref in merges)+'</mergeCells>' if merges else ''
        entries[f'xl/worksheets/sheet{number}.xml'] = '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+''.join(body)+'</sheetData>'+merge_xml+'</worksheet>'
    entries['xl/workbook.xml'] = '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+''.join(f'<sheet name="{escape(sheet[0])}" sheetId="{i}" r:id="rId{i}"/>' for i, sheet in enumerate(sheets, 1))+'</sheets></workbook>'
    entries['xl/_rels/workbook.xml.rels'] = '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+''.join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>' for i in range(1, len(sheets)+1))+'</Relationships>'
    entries['[Content_Types].xml'] = '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+''.join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1, len(sheets)+1))+'</Types>'
    entries['_rels/.rels'] = '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'
    if shared:
        entries['xl/sharedStrings.xml'] = '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+''.join('<si><t>'+escape(v)+'</t></si>' for v in pool)+'</sst>'
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        for key, value in entries.items():
            z.writestr(key, value)
    return str(path)


def pdf(path, rows=None):
    lines = ['Day 1', 'Barbell bench press 3 x 8 rest 90 sec', 'Monday', 'Breakfast kcal 200 protein 10 carbs 20 fat 5', 'Oats 50 g']
    rows = rows if rows is not None else [[(50,line)] for line in lines]
    stream = '\n'.join(f'BT /F1 12 Tf {x} {760-i*22} Td ({text}) Tj ET' for i, cells in enumerate(rows) for x,text in cells).encode()
    objects = [b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>', b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', f'<< /Length {len(stream)} >>\nstream\n'.encode()+stream+b'\nendstream']
    data = b'%PDF-1.4\n'
    offsets = [0]
    for i, obj in enumerate(objects, 1):
        offsets.append(len(data)); data += f'{i} 0 obj\n'.encode()+obj+b'\nendobj\n'
    at = len(data)
    data += f'xref\n0 {len(offsets)}\n0000000000 65535 f \n'.encode()+b''.join(f'{o:010d} 00000 n \n'.encode() for o in offsets[1:])
    data += f'trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\nstartxref\n{at}\n%%EOF\n'.encode()
    path.write_bytes(data)
    return str(path)


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        legacy = getattr(self.server, 'legacy_payloads', None)
        path = urlsplit(self.path).path
        if legacy and path in legacy:
            data = legacy[path].encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html' if path in ['/', '/index.html'] else 'text/javascript')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers(); self.wfile.write(data)
        else:
            super().do_GET()
    def log_message(self, *args):
        pass


class AppBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix='gymapp-browser-')
        cls.files = Path(cls.tmp.name)
        handler = functools.partial(QuietHandler, directory=str(ROOT))
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True); cls.thread.start()
        cls.url = f'http://127.0.0.1:{cls.server.server_port}'
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch(executable_path=os.environ.get('GYMAPP_BROWSER_EXECUTABLE', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
        cls.hu_file = xlsx(cls.files/'hungarian.xlsx', [
            ('Edzésterv', [['Nap','Gyakorlat','Sorozat','Ismétlés','Pihenő (mp)','RIR'], ['Felsőtest','Barbell bench press',3,'8–10',90,2], [None,'Pull-up',3,'6–8',120,1]], ['A2:A3']),
            ('Étrend', [['Nap','Étkezés','Étel','Gramm','kcal','Fehérje (g)','Szénhidrát (g)','Zsír (g)'], ['Hétfő','Reggeli','Zab',60,240,8,40,5], [None,None,'Tej',200,100,6,10,3], ['Szerda','Ebéd','Csirkemell',180,300,45,0,8]], ['A2:A3','B2:B3'])])
        cls.en_file = xlsx(cls.files/'english.xlsx', [
            ('Upper', [['Exercise','Sets','Reps','Rest (min)'], ['Barbell bench press',3,'8',1.5]]),
            ('Lower', [['Exercise','Sets','Reps','Rest (sec)'], ['Barbell Full Squat',2,'10',0]]),
            ('Friday', [['Meal','Food','Quantity (g)','kcal/100g','Protein (g/100g)','Carbs (g/100g)','Fat (g/100g)'], ['Lunch','Test oats','60,5',400,10,65,5], ['Lunch','Test milk',200,50,3,5,1.5]])], shared=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close(); cls.pw.stop(); cls.server.shutdown(); cls.server.server_close(); cls.tmp.cleanup()

    def setUp(self):
        self.server.legacy_payloads = None
        self.context = self.browser.new_context(viewport={'width':390,'height':844}, locale='en-GB', service_workers='block')
        self.context.route('**/js/config.js', lambda route: route.fulfill(content_type='text/javascript', body='window.CLOUD = {};'))
        self.page = self.context.new_page(); self.errors = []
        self.page.on('pageerror', lambda e:self.errors.append(str(e)))
        self.page.goto(self.url, wait_until='networkidle')

    def tearDown(self):
        self.context.close()
        self.assertEqual([], self.errors, 'Unexpected browser JavaScript errors')

    def upload(self, *files):
        if not self.page.locator('#pdf-plan-dialog').count():
            self.page.locator('[data-a="pdf-plan"]').first.click()
        self.page.locator('[data-pdf="files"]').set_input_files(list(files))
        expect(self.page.locator('[data-pdf="advanced"]')).to_be_visible(timeout=30000)
        return json.loads(self.page.locator('[data-pdf="json"]').input_value())

    def add(self):
        expect(self.page.locator('[data-pdf="apply"]')).to_be_enabled()
        self.page.locator('[data-pdf="apply"]').click()
        expect(self.page.locator('.import-success')).to_be_visible()

    def data(self):
        return self.page.evaluate('() => JSON.parse(JSON.stringify(Store.d))')

    def test_hungarian_xlsx_adds_workouts_and_meals_and_persists(self):
        before = self.data()
        self.page.evaluate('''() => {const r=Store.d.routines[0];__gym.A['w-tick']({dataset:{id:r.id}});Store.d.food['2026-10-05']=[{id:'test-diary',name:'Existing diary food',kcal:100,p:10,c:5,f:2,g:50,src:'manual',t:0}];Store.save();}''')
        protected = self.data()
        raw = self.upload(self.hu_file)
        self.assertEqual(1,len(raw['routines'])); self.assertEqual(2,len(raw['routines'][0]['items']))
        meal = raw['plan']['days'][0]['meals'][0]
        self.assertEqual({'kcal':340,'p':14,'c':50,'f':8}, {k:meal[k] for k in ['kcal','p','c','f']})
        self.add(); self.page.locator('[data-pdf="open-meals"]').click()
        expect(self.page.locator('.meal-week')).to_contain_text('Reggeli')
        expect(self.page.locator('.meal-week')).to_contain_text('Wednesday')
        self.page.reload(); after = self.data()
        self.assertEqual(len(before['routines'])+1,len(after['routines']))
        self.assertEqual(protected['workouts'],after['workouts']); self.assertEqual(protected['food'],after['food'])
        self.assertTrue(set(r['id'] for r in before['routines']).issubset(r['id'] for r in after['routines']))
        self.page.locator('[data-tab="food"]').click(); self.page.locator('[data-v="plan"]').click()
        expect(self.page.locator('.meal-week')).to_contain_text('340 kcal')

    def test_shared_strings_sheet_names_decimal_comma_per100_and_zero_rest(self):
        raw=self.upload(self.en_file)
        self.assertEqual(['Upper','Lower'],[r['name'] for r in raw['routines']])
        self.assertEqual(90,raw['routines'][0]['items'][0]['rest']);self.assertEqual(0,raw['routines'][1]['items'][0]['rest'])
        m=raw['plan']['days'][4]['meals'][0]
        self.assertEqual(60.5,m['items'][0]['g']);self.assertEqual(342,m['kcal']);self.assertEqual(12.1,m['p']);self.assertEqual(49.3,m['c']);self.assertEqual(6,m['f'])
        self.add()
        self.assertEqual(342,self.data()['plan']['days'][4]['meals'][0]['kcal'])

    def test_two_files_append_to_existing_plan(self):
        self.upload(self.hu_file);self.add();self.page.locator('[data-pdf="close"]').click()
        first=self.data()
        self.upload(self.en_file);self.add();after=self.data()
        self.assertEqual(first['plan']['days'][0]['meals'],after['plan']['days'][0]['meals'])
        self.assertEqual(len(first['routines'])+2,len(after['routines']))
        self.assertEqual(1,len(after['plan']['days'][4]['meals']))
        self.page.locator('[data-pdf="close"]').click()
        combined=self.upload(self.hu_file,self.en_file)
        self.assertEqual(3,len(combined['routines']));self.assertEqual(3,sum(len(d['meals']) for d in combined['plan']['days']))

    def test_replace_meal_plan_requires_confirmation_and_keeps_diary(self):
        self.upload(self.hu_file);self.add();self.page.locator('[data-pdf="close"]').click()
        self.upload(self.en_file);self.page.locator('[data-pdf="meal-mode"]').select_option('replace')
        def dismiss(dialog): dialog.dismiss()
        self.page.on('dialog',dismiss);self.page.locator('[data-pdf="apply"]').click()
        self.assertEqual(1,len(self.data()['plan']['days'][0]['meals']))
        self.page.remove_listener('dialog',dismiss);self.page.on('dialog',lambda d:d.accept());self.add()
        self.assertEqual(0,len(self.data()['plan']['days'][0]['meals']))
        self.assertEqual(1,len(self.data()['plan']['days'][4]['meals']))

    def test_incomplete_meals_do_not_block_selected_workouts(self):
        path=xlsx(self.files/'incomplete.xlsx', [('Upper',[['Exercise','Sets','Reps','Rest (sec)'],['Barbell bench press',3,'10',90]]),('Monday',[['Meal','Food','Grams','kcal','Protein','Carbs','Fat'],['Lunch','Test food',100,200,20,None,None]])])
        raw=self.upload(path);self.assertIsNone(raw['plan']['days'][0]['meals'][0]['f'])
        expect(self.page.locator('[data-pdf="apply"]')).to_be_disabled()
        self.page.locator('[data-pdf="meals"]').uncheck();self.add()
        self.assertIsNone(self.data()['plan'])

    def test_fill_missing_values_and_exercise_match(self):
        path=xlsx(self.files/'details.xlsx',[('Upper',[['Exercise','Sets','Reps'],['Unrecognized bench',3,'8']])])
        self.upload(path);expect(self.page.locator('[data-pdf="apply"]')).to_be_disabled()
        self.page.locator('[data-ex]').fill('Barbell bench press · Barbell Bench Press - Medium Grip')
        # Use the actual datalist label, including the localized exercise name.
        label=self.page.locator('#import-exercises option').evaluate_all("els => els.find(e=>e.value.includes('Barbell Bench Press - Medium Grip')).value")
        self.page.locator('[data-ex]').fill(label);self.page.locator('[data-ex]').press('Tab')
        self.page.locator('[data-pdf="default-rest"]').click();self.add()
        self.assertEqual(90,self.data()['routines'][0]['items'][0]['rest'])

    def test_missing_weekday_requires_scheduling(self):
        path=xlsx(self.files/'no-day.xlsx',[('Diet',[['Meal','Food','Grams','kcal','Protein','Carbs','Fat'],['Lunch','Test food',100,200,20,20,4]])])
        raw=self.upload(path);self.assertEqual(1,len(raw['unassignedMeals']))
        expect(self.page.locator('[data-pdf="apply"]')).to_be_disabled()
        self.page.locator('[data-assign]').select_option('5');self.add()
        self.assertEqual(1,len(self.data()['plan']['days'][5]['meals']))

    def test_manual_column_mapping(self):
        path=xlsx(self.files/'custom.xlsx',[('Custom upper',[['Movement title','Rounds','Count','Pause'],['Barbell bench press',3,8,90]])])
        self.upload(path);expect(self.page.locator('[data-pdf="apply"]')).to_be_disabled()
        for k,v in [('ex','0'),('sets','1'),('reps','2'),('rest','3')]:self.page.locator('[data-map-key="'+k+'"]').select_option(v)
        self.page.locator('[data-pdf="map"]').click();self.add()
        self.assertEqual(90,self.data()['routines'][0]['items'][0]['rest'])

    def test_limits_never_silently_drop_meals(self):
        self.upload(self.hu_file);self.add();self.page.locator('[data-pdf="close"]').click()
        self.page.evaluate("() => {const d=Store.d.plan.days[0],m=d.meals[0];d.meals=Array.from({length:10},(_,i)=>({...m,id:'old-'+i,name:'Meal '+i}));Store.save();}")
        self.upload(self.hu_file);self.page.locator('[data-pdf="apply"]').click()
        expect(self.page.locator('[data-pdf="status"]')).to_contain_text('10 meals')
        self.assertEqual(10,len(self.data()['plan']['days'][0]['meals']))
        expect(self.page.locator('.import-success')).to_have_count(0)

    def test_storage_failure_has_no_false_success_and_retry_does_not_duplicate(self):
        self.upload(self.hu_file);before=len(self.data()['routines'])
        self.page.evaluate("() => {window.savedSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='gymapp.v1')throw new DOMException('Quota','QuotaExceededError');return savedSetItem.call(this,k,v);};}")
        self.page.locator('[data-pdf="apply"]').click()
        expect(self.page.locator('[data-pdf="status"]')).to_contain_text('could not be saved')
        expect(self.page.locator('.import-success')).to_have_count(0)
        self.assertEqual(before,len(self.data()['routines']))
        self.assertIsNone(self.data()['plan'])
        self.page.evaluate('() => {Storage.prototype.setItem=window.savedSetItem;}');self.add()
        self.assertEqual(before+1,len(self.data()['routines']));self.assertEqual(1,len(self.data()['plan']['days'][0]['meals']))

    def test_same_file_can_be_selected_again(self):
        self.upload(self.hu_file)
        self.page.locator('[data-pdf="files"]').set_input_files(self.en_file)
        expect(self.page.locator('[data-pdf="workout-count"]')).to_have_text('2 workout days')
        self.page.locator('[data-pdf="files"]').set_input_files(self.hu_file)
        expect(self.page.locator('[data-pdf="workout-count"]')).to_have_text('1 workout day')

    def test_cached_formulas_and_missing_cache_are_distinct(self):
        path=xlsx(self.files/'formulas.xlsx',[('Monday',[['Meal','Food','Grams','kcal','Protein','Carbs','Fat'],['Lunch','Test food',100,{'formula':'1+199','cached':200},20,20,{'formula':'2+2','cached':None}]])])
        raw=self.upload(path);m=raw['plan']['days'][0]['meals'][0]
        self.assertEqual(200,m['kcal']);self.assertIsNone(m['f']);expect(self.page.locator('[data-pdf="apply"]')).to_be_disabled()
        self.page.locator('[data-path="plan.days.0.meals.0.f"]').fill('4');self.page.locator('[data-path="plan.days.0.meals.0.f"]').press('Tab');self.add()

    def test_pdf_reader_worker_and_text_import(self):
        raw=self.upload(pdf(self.files/'plan.pdf'))
        self.assertEqual(1,len(raw['routines']));self.assertEqual(1,len(raw['plan']['days'][0]['meals']))
        self.assertEqual(200,raw['plan']['days'][0]['meals'][0]['kcal']);self.add()

    def test_pdf_calorie_columns_meal_totals_and_macro_summary(self):
        # Generated fixture uses the same column/summary layout, invented foods.
        rows=[[(50,'MONDAY - REST DAY')],[(50,'Breakfast')],
              [(50,'Food'),(360,'Amount'),(470,'kcal')],
              [(50,'Test oats'),(360,'50 g'),(470,'200')],
              [(50,'Test milk'),(360,'100 g'),(470,'60')],
              [(50,'Meal total'),(470,'260')],
              [(50,'Meal macros: 15.2 g protein / 36.5 g carbs / 7.0 g fat')],
              [(50,'Meal 2')],[(50,'Food'),(360,'Amount'),(470,'kcal')],
              [(50,'Test rice'),(360,'60 g'),(470,'210')],
              [(50,'Meal total'),(470,'210')],
              [(50,'Meal macros: 4.0 g protein / 45.0 g carbs / 0.8 g fat')],
              [(50,'Daily total: 470 kcal / 19.2 g protein / 81.5 g carbs / 7.8 g fat')],
              [(50,'FIXED RULES')],[(50,'Breakfast: weigh test oats dry.')],[(50,'Dinner: weigh test milk separately.')]]
        raw=self.upload(pdf(self.files/'calorie-table.pdf',rows));day=raw['plan']['days'][0]
        self.assertEqual(2,len(day['meals']))
        self.assertEqual({'kcal':470,'p':19.2,'c':81.5,'f':7.8},day['total'])
        m=day['meals'][0]
        self.assertEqual([200,60],[i['kcal'] for i in m['items']])
        self.assertEqual(['Test oats','Test milk'],[i['n'] for i in m['items']])
        self.assertEqual((260,15.2,36.5,7),(m['kcal'],m['p'],m['c'],m['f']))
        self.assertIn('Breakfast: weigh test oats dry.',raw['plan']['notes'])
        self.add();self.page.locator('[data-pdf="close"]').click();self.page.reload(wait_until='networkidle')
        saved=self.data()['plan']['days'][0]['meals'][0]
        self.assertEqual((260,15.2,36.5,7),(saved['kcal'],saved['p'],saved['c'],saved['f']))

    def test_pdf_unlabelled_numbers_do_not_become_calories(self):
        rows=[[(50,'Monday')],[(50,'Breakfast')],
              [(50,'Food'),(360,'Amount'),(470,'Price')],
              [(50,'Test oats'),(360,'50 g'),(470,'200')],
              [(50,'Meal total'),(470,'200')],
              [(50,'Meal macros: 10 g protein / 20 g carbs / 5 g fat')]]
        raw=self.upload(pdf(self.files/'unlabelled-table.pdf',rows));m=raw['plan']['days'][0]['meals'][0]
        self.assertIsNone(m['kcal']);self.assertIsNone(m['items'][0]['kcal'])
        self.assertEqual(1,len(m['items']))
        expect(self.page.locator('[data-pdf="apply"]')).to_be_disabled()

    def test_docx_text_import(self):
        path=self.files/'plan.docx'
        lines=['Day 1','Barbell bench press 3 x 8 rest 90 sec','Monday','Breakfast kcal 200 protein 10 carbs 20 fat 5','Oats 50 g']
        with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED) as z:z.writestr('word/document.xml','<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+''.join('<w:p><w:r><w:t>'+escape(l)+'</w:t></w:r></w:p>' for l in lines)+'</w:body></w:document>')
        raw=self.upload(str(path));self.assertEqual(1,len(raw['routines']));self.add()

    def test_corrupt_and_oversized_files_show_errors(self):
        self.page.locator('[data-a="pdf-plan"]').first.click()
        for file in [{'name':'broken.xlsx','mimeType':'application/octet-stream','buffer':b'not-a-zip'},{'name':'large.xlsx','mimeType':'application/octet-stream','buffer':b'x'*(12*1024*1024+1)}]:
            self.page.locator('[data-pdf="files"]').set_input_files(file)
            expect(self.page.locator('[data-pdf="retry"]')).to_be_visible()
            expect(self.page.locator('[data-pdf="apply"]')).to_be_disabled()
            expect(self.page.locator('.import-success')).to_have_count(0)
        self.assertIsNone(self.data()['plan'])

    def test_release_history_is_visible_and_version_matches(self):
        self.page.locator('[data-a="settings"]').first.click();self.page.locator('[data-a="release-notes"]').click()
        expect(self.page.locator('#sheet')).to_contain_text('2.6.1')
        expect(self.page.locator('#sheet')).to_contain_text('20261008.3')
        expect(self.page.locator('#sheet')).to_contain_text('Excel columns')

    def test_file_reader_fallback_for_xlsx_and_json_backup(self):
        self.page.evaluate('() => {File.prototype.arrayBuffer=undefined;File.prototype.text=undefined;}')
        self.upload(self.hu_file);self.add();self.page.locator('[data-pdf="close"]').click()
        exported=self.page.evaluate('() => Store.exportJSON()')
        self.page.on('dialog',lambda d:d.accept())
        self.page.locator('[data-a="settings"]').first.click()
        self.page.locator('[data-in="import"]').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':exported.encode()})
        expect(self.page.locator('#sheet')).not_to_be_visible()
        self.assertEqual(1,len(self.data()['plan']['days'][0]['meals']))
        self.assertEqual('Felsőtest',self.data()['routines'][0]['name'])

    def test_import_preserves_active_workout(self):
        self.page.locator('[data-a="w-start"]').first.click()
        active=self.data()['active']
        expected_reload=self.page.evaluate('() => Store.clean(Store.d).active')
        self.page.locator('[data-a="w-min"]').click()
        self.upload(self.hu_file);self.add()
        self.assertEqual(active,self.data()['active'])
        self.page.reload();self.assertEqual(expected_reload,self.data()['active'])

    def test_imported_meal_can_be_logged_and_undone(self):
        self.upload(self.hu_file);self.add();self.page.locator('[data-pdf="open-meals"]').click()
        self.page.locator('[data-v="diary"]').click()
        self.page.evaluate('() => {__gym.ui.foodDate="2026-10-05";__gym.render();}')
        self.page.locator('[data-a="pm-tick"]').first.click()
        self.assertEqual(340,self.data()['food']['2026-10-05'][0]['kcal'])
        self.page.reload();self.page.locator('[data-tab="food"]').click()
        self.page.evaluate('() => {__gym.ui.foodDate="2026-10-05";__gym.render();}')
        expect(self.page.locator('[data-a="pm-tick"]').first).to_have_attribute('aria-checked','true')
        self.page.locator('[data-a="pm-tick"]').first.click()
        self.assertEqual([],self.data()['food'].get('2026-10-05',[]))

    def test_imported_workout_can_be_started_logged_and_finished(self):
        self.upload(self.hu_file);self.add();self.page.locator('[data-pdf="open-workouts"]').click()
        self.page.locator('[data-a="r-open"]').first.click();self.page.locator('#sheet [data-a="w-start"]').click()
        expect(self.page.locator('#sheet')).not_to_be_visible()
        self.page.locator('[data-in="w-kg"]').first.fill('40');self.page.locator('[data-in="w-reps"]').first.fill('8')
        self.page.locator('[data-a="w-check"]').first.click()
        self.page.on('dialog',lambda d:d.accept());self.page.locator('[data-a="w-finish"]').click()
        expect(self.page.locator('#sheet')).to_contain_text('Workout done')
        self.assertIsNone(self.data()['active'])
        workout=self.data()['workouts'][-1]
        self.assertEqual('Felsőtest',workout['name']);self.assertEqual(40,workout['entries'][0]['sets'][0]['kg'])
        self.page.reload();self.assertEqual(workout,self.data()['workouts'][-1])

    def test_invalid_advanced_json_does_not_corrupt_preview(self):
        self.upload(self.hu_file);self.page.locator('[data-pdf="advanced"] > summary').click()
        self.page.locator('[data-pdf="advanced"] details').last.locator('summary').click()
        self.page.locator('[data-pdf="json"]').fill('{"app":"gymapp","kind":"plan","routines":[],"plan":{}}')
        self.page.locator('[data-pdf="rebuild"]').click()
        expect(self.page.locator('[data-pdf="status"]')).to_have_text('Invalid plan JSON.')
        expect(self.page.locator('[data-pdf="apply"]')).to_be_disabled()

    def start_legacy_shell(self):
        self.context.close()
        old_release="globalThis.GYM_RELEASE={version:'2.3.1',build:'20261007.8',cacheId:'v2.3.1-20261007.8'};"
        old_index=(ROOT/'index.html').read_text().replace('<script src="js/plan-sheet.js"></script>', '').replace('<link rel="stylesheet" href="css/design.css">','')
        old_worker=(ROOT/'sw.js').read_text().replace("'css/design.css', 'js/plan-sheet.js',",'')
        old_manifest=json.loads((ROOT/'release-manifest.json').read_text())
        old_manifest.update(version='2.3.1',build='20261007.8')
        for path,content in [('./',old_index),('index.html',old_index),('js/release.js',old_release)]:
            old_manifest['assets'][path]=hashlib.sha256(content.encode()).hexdigest()
        self.server.legacy_payloads={'/':old_index,'/index.html':old_index,'/sw.js':old_worker,'/js/release.js':old_release,'/release-manifest.json':json.dumps(old_manifest)}
        self.context=self.browser.new_context(viewport={'width':390,'height':844},service_workers='allow')
        self.context.add_init_script("Object.defineProperty(window,'CLOUD',{value:{},writable:false});")
        self.page=self.context.new_page();self.page.on('pageerror',lambda e:self.errors.append(str(e)))
        self.page.goto(self.url,wait_until='networkidle')
        self.page.evaluate('async () => {await navigator.serviceWorker.ready;}')
        self.page.reload(wait_until='networkidle')
        self.assertEqual('2.3.1',self.page.evaluate('() => GYM_RELEASE.version'))

    def test_update_from_old_shell_then_offline_xlsx_import(self):
        self.start_legacy_shell()
        self.upload(self.hu_file);self.add();self.page.locator('[data-pdf="close"]').click()
        before=self.data()
        self.server.legacy_payloads=None
        self.page.locator('[data-a="settings"]').first.click()
        with self.page.expect_navigation(wait_until='networkidle',timeout=45000):self.page.locator('[data-a="update-now"]').click()
        self.assertEqual('2.6.1',self.page.evaluate('() => GYM_RELEASE.version'))
        self.assertEqual(before['routines'],self.data()['routines']);self.assertEqual(before['plan'],self.data()['plan'])
        cached=self.page.evaluate("async () => {const c=await caches.open(GYM_RELEASE.cacheId.replace(/^/,'gym-shell-'));const keys=await c.keys();return keys.map(r=>new URL(r.url).pathname);}")
        for path in ['/css/design.css','/js/plan-sheet.js','/js/strength-ranks.js','/js/profile.js','/js/social.js','/css/profile.css','/vendor/jszip/jszip.min.js','/vendor/pdfjs/pdf.worker.min.mjs']:self.assertIn(path,cached)
        self.context.set_offline(True);self.page.reload(wait_until='load')
        expect(self.page.locator('[data-a="pdf-plan"]').first).to_be_visible()
        self.upload(self.en_file);self.add()
        self.assertEqual(len(before['routines'])+2,len(self.data()['routines']))
        self.assertEqual(1,len(self.data()['plan']['days'][4]['meals']))
        self.page.locator('[data-pdf="close"]').click()
        self.upload(pdf(self.files/'offline.pdf'));self.add()
        self.context.set_offline(False)

    def test_update_rejects_stale_parser_then_recovers_without_data_loss(self):
        self.start_legacy_shell()
        self.upload(self.hu_file);self.add();self.page.locator('[data-pdf="close"]').click()
        before=self.data()
        # A CDN serves current metadata and one stale parser. Hash verification
        # must reject this release, keep the working cache and allow a retry.
        self.server.legacy_payloads={'/js/pdf-local.js':(ROOT/'js/pdf-local.js').read_text()+'\n/* stale deployed module */'}
        self.page.locator('[data-a="settings"]').first.click()
        self.page.locator('[data-a="update-now"]').click()
        expect(self.page.locator('#update-status')).to_contain_text('Could not update',timeout=45000)
        self.assertEqual('2.3.1',self.page.evaluate('() => GYM_RELEASE.version'))
        self.assertEqual(before,self.data())
        self.page.reload(wait_until='networkidle')
        self.assertEqual('2.3.1',self.page.evaluate('() => GYM_RELEASE.version'))
        self.server.legacy_payloads=None
        self.page.locator('[data-a="settings"]').first.click()
        with self.page.expect_navigation(wait_until='networkidle',timeout=45000):
            self.page.locator('[data-a="update-now"]').click()
        self.assertEqual('2.6.1',self.page.evaluate('() => GYM_RELEASE.version'))
        self.assertEqual(before['routines'],self.data()['routines'])
        self.assertEqual(before['plan'],self.data()['plan'])
        self.assertEqual('updateSuccess',self.page.evaluate('() => __gym.ui.updateStatus'))
        rows=[[(50,'Monday')],[(50,'Breakfast')],[(50,'Food'),(360,'Amount'),(470,'kcal')],
              [(50,'Test oats'),(360,'50 g'),(470,'200')],[(50,'Meal total'),(470,'200')],
              [(50,'Meal macros: 10 g protein / 20 g carbs / 5 g fat')]]
        raw=self.upload(pdf(self.files/'updated-calories.pdf',rows));m=raw['plan']['days'][0]['meals'][0]
        self.assertEqual((200,10,20,5),(m['kcal'],m['p'],m['c'],m['f']))
        self.assertEqual(1,len(m['items']))
        self.add()

    def test_ready_update_offers_restart_without_discarding_open_preview(self):
        self.start_legacy_shell();self.upload(self.hu_file)
        self.server.legacy_payloads=None
        self.page.evaluate('async () => {const reg=await navigator.serviceWorker.getRegistration();await reg.update();}')
        expect(self.page.locator('#ready-update')).to_be_visible(timeout=45000)
        expect(self.page.locator('#pdf-plan-dialog')).to_be_visible()
        self.assertEqual('2.3.1',self.page.evaluate('() => GYM_RELEASE.version'))
        self.page.locator('[data-pdf="close"]').click()
        with self.page.expect_navigation(wait_until='networkidle',timeout=45000):
            self.page.locator('[data-a="update-restart"]').click()
        self.assertEqual('2.6.1',self.page.evaluate('() => GYM_RELEASE.version'))
        expect(self.page.locator('#ready-update')).to_have_count(0)

    def test_release_manifest_matches_every_published_file(self):
        data=json.loads((ROOT/'release-manifest.json').read_text())
        self.assertEqual(self.page.evaluate('() => GYM_RELEASE.version'),data['version'])
        self.assertEqual(self.page.evaluate('() => GYM_RELEASE.build'),data['build'])
        for path,digest in data['assets'].items():
            self.assertEqual(digest,hashlib.sha256((ROOT/('index.html' if path=='./' else path)).read_bytes()).hexdigest(),path+' requires regenerating the release manifest')

    def test_compact_header_upload_is_available_on_all_pages(self):
        for tab in ['home','food','goals','profile']:
            self.page.locator('[data-tab="'+tab+'"]').click()
            button=self.page.locator('.top-actions [data-a="pdf-plan"]')
            expect(button).to_be_visible();expect(button).to_have_attribute('aria-label','Upload a plan (PDF, Excel or Word)')
            box=button.bounding_box();self.assertAlmostEqual(44,box['width'],places=1);self.assertAlmostEqual(44,box['height'],places=1)
            button.click();expect(self.page.locator('#pdf-plan-dialog')).to_be_visible()
            self.page.locator('[data-pdf="close"]').click()

    def test_meal_plan_days_and_diary_plan_can_be_collapsed(self):
        self.upload(self.hu_file);self.add();self.page.locator('[data-pdf="open-meals"]').click()
        expect(self.page.locator('.meal-week > details')).to_have_count(7)
        day=self.page.locator('[data-meal-day="0"]')
        self.assertFalse(day.evaluate('(el) => el.open'))
        day.locator(':scope > summary').click();expect(day.locator('.meal-plan-row')).to_be_visible()
        day.locator(':scope > summary').click();expect(day.locator('.meal-plan-row')).not_to_be_visible()
        self.page.locator('[data-v="diary"]').click()
        self.page.evaluate('() => {__gym.ui.foodDate="2026-10-05";__gym.render();}')
        plan=self.page.locator('.daily-plan');self.assertTrue(plan.evaluate('(el) => el.open'))
        plan.locator(':scope > summary').click();expect(plan.locator('[data-a="pm-tick"]')).not_to_be_visible()
        plan.locator(':scope > summary').click();plan.locator('[data-a="pm-tick"]').click()
        self.assertEqual(340,self.data()['food']['2026-10-05'][0]['kcal'])

    def test_rank_thresholds_ignore_warmups_ticks_variants_and_unfinished_sets(self):
        values=self.page.evaluate("""() => {
          const ex='Barbell_Bench_Press_-_Medium_Grip';
          const rank=(kg,extra={})=>StrengthRanks.summary([{id:'test',entries:[{ex,sets:[{kg,reps:1,...extra}]}]}])[0].tier;
          const boundaries=[0,19.5,20,39.5,40,60,80,100,139.5,140].map(kg=>rank(kg));
          const ignored=StrengthRanks.summary([
            {tick:true,entries:[{ex,sets:[{kg:200,reps:1}]}]},
            {entries:[{ex,sets:[{kg:200,reps:1,w:true},{kg:200,reps:1,done:false},{kg:100,reps:0}]}]},
            {entries:[{ex:'Dumbbell_Bench_Press',sets:[{kg:200,reps:1}]}]}
          ])[0];
          return {boundaries,ignored:ignored.tier,tiers:StrengthRanks.tiers.map(t=>t.en),ids:StrengthRanks.tracks.map(t=>t.ex),catalogue:EXERCISES.map(e=>e.id)};
        }""")
        self.assertEqual([-1,-1,0,0,1,2,3,4,4,5],values['boundaries'])
        self.assertEqual(-1,values['ignored'])
        self.assertEqual(['Spark','Ember','Steel','Sentinel','Titan','Apex'],values['tiers'])
        self.assertTrue(set(values['ids']).issubset(values['catalogue']))

    def test_finish_workout_expands_volume_and_unlocks_persistent_rank(self):
        self.page.locator('[data-a="w-start"]').first.click()
        self.page.locator('[data-a="w-warm"][data-i="0"][data-j="0"]').click()
        for j,kg,reps in [(0,'200','3'),(1,'100','5')]:
            self.page.locator('[data-in="w-kg"][data-i="0"][data-j="'+str(j)+'"]').fill(kg)
            self.page.locator('[data-in="w-reps"][data-i="0"][data-j="'+str(j)+'"]').fill(reps)
            self.page.locator('[data-a="w-check"][data-i="0"][data-j="'+str(j)+'"]').click()
        self.page.on('dialog',lambda dialog:dialog.accept())
        self.page.locator('[data-a="w-finish"]').click()
        expect(self.page.locator('.rank-unlocks')).to_contain_text('Titan')
        expect(self.page.locator('.badge-unlocks')).to_contain_text('First rep')
        expect(self.page.locator('.badge-unlocks')).to_contain_text('Triple digits')
        expect(self.page.locator('.volume-total b')).to_have_text('500')
        self.page.locator('.volume-total').click()
        details=self.page.locator('[data-volume]')
        self.assertTrue(details.evaluate('(el) => el.open'))
        expect(details).to_contain_text('100 kg × 5');expect(details).not_to_contain_text('200 kg')
        self.page.locator('#sheet [data-a="open-ranks"]').click()
        expect(self.page.locator('.profile-stats b').nth(2)).to_have_text('500 kg')
        bench=self.page.locator('[data-rank="bench"]')
        expect(bench.locator('.rank-heading b')).to_have_text('Titan')
        expect(bench.locator('.rank-next')).to_have_text('Next: Apex at 140 kg · 40 kg to go')
        self.page.reload(wait_until='networkidle')
        self.page.locator('[data-tab="profile"]').click();self.page.locator('[data-a="profile-ranks"]').click()
        expect(self.page.locator('[data-rank="bench"] .rank-heading b')).to_have_text('Titan')
        self.page.locator('[data-tab="home"]').click();self.page.locator('.workout-tabs [data-a="workout-view"][data-v="history"]').click()
        self.page.locator('.workout-history .workout-volume > summary').click()
        expect(self.page.locator('.volume-breakdown')).to_contain_text('100 kg × 5')
        self.page.locator('.history-title').click();self.page.locator('[data-a="wk-del"]').click()
        self.page.locator('[data-tab="profile"]').click();self.page.locator('[data-a="profile-ranks"]').click()
        expect(self.page.locator('[data-rank="bench"] .rank-heading b')).to_have_text('Unranked')

    def test_workout_jump_select_scrolls_to_chosen_exercise(self):
        self.page.locator('[data-a="w-start"]').first.click()
        jump=self.page.locator('.workout-jump')
        self.assertGreaterEqual(jump.bounding_box()['y'],self.page.locator('.w-head').bounding_box()['y']+self.page.locator('.w-head').bounding_box()['height']-1)
        self.assertTrue(self.page.locator('[data-in="w-jump"]').evaluate('(el) => {const box=el.getBoundingClientRect();return el.contains(document.elementFromPoint(box.x+box.width/2,box.y+box.height/2));}'))
        self.page.locator('[data-in="w-jump"]').select_option('5')
        self.page.wait_for_timeout(500)
        row=self.page.locator('[data-ex-index="5"]')
        self.assertGreater(self.page.locator('.w-body').evaluate('(el) => el.scrollTop'),0)
        self.assertGreaterEqual(row.bounding_box()['y'],self.page.locator('.workout-jump').bounding_box()['y'])
        self.assertLess(row.bounding_box()['y'],350)
        expect(self.page.locator('.workout-completion')).to_contain_text('0/')
        self.page.locator('[data-a="w-min"]').click()
        expect(self.page.locator('[data-a="w-open"]')).to_be_visible()

    def test_workout_sections_are_responsive_in_both_languages_and_themes(self):
        for width in [320,390,768,1280]:
            self.page.set_viewport_size({'width':width,'height':844})
            for lang in ['en','hu']:
                self.page.evaluate('(lang) => {Store.d.settings.lang=lang;__gym.render();}',lang)
                for theme in ['deep','light']:
                    self.page.evaluate('(theme) => {__gym.A["set-bg"]({dataset:{v:theme}});}',theme)
                    for tab in ['train','plans','exercises','history']:
                        self.page.locator('[data-a="workout-view"][data-v="'+tab+'"]').first.click()
                        self.assertFalse(self.page.evaluate('() => document.documentElement.scrollWidth>innerWidth+1'),(width,lang,theme,tab))
                        expect(self.page.locator('.workout-tabs [data-v="'+tab+'"]')).to_have_attribute('aria-pressed','true')

    def test_import_preview_has_space_and_owns_scroll(self):
        # Begin with a scrolled page; closing must restore this exact position.
        self.page.evaluate("() => {document.body.style.minHeight='2000px';window.scrollTo(0,180);}")
        before=self.page.evaluate('() => scrollY')
        # Open at this scroll position without clicking the offscreen header.
        self.page.evaluate('() => __gym.A["pdf-plan"]()')
        self.upload(self.hu_file)
        for width,height,minimum in [(390,844,440),(320,568,250),(844,390,150)]:
            self.page.set_viewport_size({'width':width,'height':height})
            content=self.page.locator('[data-pdf="content"]')
            expect(content).to_be_visible()
            self.page.wait_for_timeout(250)
            self.assertGreaterEqual(content.bounding_box()['height'],minimum)
            footer=self.page.locator('[data-pdf="footer"]').bounding_box()
            self.assertLessEqual(content.bounding_box()['y']+content.bounding_box()['height'],footer['y']+1)
            self.assertLessEqual(footer['y']+footer['height'],height)
            content.evaluate('(el) => el.scrollTop=0')
            content.hover();self.page.mouse.wheel(0,600);self.page.wait_for_timeout(150)
            self.assertGreater(content.evaluate('(el) => el.scrollTop'),0)
            self.assertEqual('fixed',self.page.evaluate('() => getComputedStyle(document.body).position'))
            self.assertEqual('-180px',self.page.evaluate('() => document.body.style.top'))
            self.page.mouse.move(2,2);self.page.mouse.wheel(0,700)
            self.page.evaluate('() => window.scrollTo(0,700)')
            self.assertEqual(0,self.page.evaluate('() => scrollY'))
        self.page.locator('[data-pdf="close"]').click()
        self.assertEqual(before,self.page.evaluate('() => scrollY'))
        self.assertEqual('',self.page.evaluate('() => document.body.style.position'))
        self.assertEqual('',self.page.evaluate('() => document.documentElement.style.overflow'))
        self.page.evaluate('() => window.scrollTo(0,350)')
        self.assertEqual(350,self.page.evaluate('() => scrollY'))

    def test_import_cancel_restores_existing_styles_and_can_reopen(self):
        self.page.evaluate("() => {document.body.style.overflow='auto';document.documentElement.style.overflow='visible';}")
        self.page.locator('[data-a="pdf-plan"]').first.click()
        self.assertGreater(self.page.locator('[data-pdf="content"]').bounding_box()['height'],440)
        self.page.keyboard.press('Escape')
        expect(self.page.locator('#pdf-plan-dialog')).to_have_count(0)
        self.assertEqual('auto',self.page.evaluate('() => document.body.style.overflow'))
        self.assertEqual('visible',self.page.evaluate('() => document.documentElement.style.overflow'))
        self.upload(self.hu_file);self.add();self.page.locator('[data-pdf="open-workouts"]').click()
        expect(self.page.locator('#pdf-plan-dialog')).to_have_count(0)
        self.assertEqual('',self.page.evaluate('() => document.body.style.position'))
        self.assertEqual('auto',self.page.evaluate('() => document.body.style.overflow'))

    def test_import_tracks_reduced_visible_viewport(self):
        self.upload(self.hu_file)
        self.page.wait_for_timeout(250)
        # Model the smaller, offset visible viewport caused by an onscreen keyboard.
        self.page.evaluate("() => {Object.defineProperty(visualViewport,'height',{configurable:true,value:460});Object.defineProperty(visualViewport,'offsetTop',{configurable:true,value:100});visualViewport.dispatchEvent(new Event('resize'));}")
        box=self.page.locator('#pdf-plan-dialog').bounding_box()
        self.assertGreaterEqual(box['y'],112)
        self.assertLessEqual(box['y']+box['height'],548)
        self.assertGreater(self.page.locator('[data-pdf="content"]').bounding_box()['height'],140)
        self.page.locator('[data-pdf="close"]').click()
        self.assertEqual('',self.page.evaluate('() => document.body.style.position'))

    def test_exercise_zoom_locks_background_until_last_sheet_closes(self):
        self.page.evaluate("() => {document.body.style.minHeight='2400px';document.body.style.overflow='auto';document.documentElement.style.overflow='visible';document.querySelector('#coach').inert=true;window.scrollTo(0,180);}")
        self.page.evaluate('() => __gym.A["ex-open"]({dataset:{id:"Romanian_Deadlift"}})')
        body=self.page.locator('#sheet .sheet-body')
        body.hover();self.page.mouse.wheel(0,500);self.page.wait_for_timeout(200)
        self.assertGreater(body.evaluate('(el) => el.scrollTop'),0)
        self.page.locator('.drawing-phase').first.click()
        expect(self.page.locator('.drawing-zoom img')).to_be_visible()
        self.page.mouse.move(2,2);self.page.mouse.wheel(0,700);self.page.wait_for_timeout(150)
        self.assertEqual('-180px',self.page.evaluate('() => document.body.style.top'))
        self.assertEqual(0,self.page.evaluate('() => scrollY'))
        self.assertTrue(self.page.locator('#view').evaluate('(el) => el.inert'))
        # A background action cannot run, even if delivered by an old mobile browser.
        nav=self.page.locator('#tabbar').inner_html()
        self.page.locator('#tabbar [data-a]').first.evaluate('(el) => el.click()')
        self.assertEqual(nav,self.page.locator('#tabbar').inner_html())
        self.page.locator('[data-a="sheet-back"]').click()
        expect(self.page.locator('.drawing-pair')).to_be_visible()
        self.assertEqual('fixed',self.page.evaluate('() => document.body.style.position'))
        self.page.locator('[data-a="sheet-close"]').click()
        expect(self.page.locator('#sheet')).not_to_be_visible()
        self.assertEqual(180,self.page.evaluate('() => scrollY'))
        self.assertFalse(self.page.locator('#view').evaluate('(el) => el.inert'))
        self.assertTrue(self.page.locator('#coach').evaluate('(el) => el.inert'))
        self.assertEqual('auto',self.page.evaluate('() => document.body.style.overflow'))
        self.assertEqual('visible',self.page.evaluate('() => document.documentElement.style.overflow'))
        self.page.mouse.move(100,200);self.page.mouse.wheel(0,400);self.page.wait_for_timeout(200)
        self.assertGreater(self.page.evaluate('() => scrollY'),180)

    def test_upload_over_sheet_keeps_page_locked_when_underlying_sheet_closes(self):
        self.page.evaluate("() => {document.body.style.minHeight='2400px';window.scrollTo(0,160);__gym.A.settings();}")
        self.page.locator('#sheet [data-a="pdf-plan"]').click()
        self.upload(self.hu_file);self.add()
        expect(self.page.locator('#sheet')).not_to_be_visible()
        expect(self.page.locator('#pdf-plan-dialog')).to_be_visible()
        self.assertEqual('fixed',self.page.evaluate('() => document.body.style.position'))
        self.assertEqual('-160px',self.page.evaluate('() => document.body.style.top'))
        self.assertTrue(self.page.locator('#view').evaluate('(el) => el.inert'))
        self.page.locator('[data-pdf="close"]').click()
        self.assertEqual('',self.page.evaluate('() => document.body.style.position'))
        self.assertEqual(160,self.page.evaluate('() => scrollY'))
        self.assertFalse(self.page.locator('#view').evaluate('(el) => el.inert'))

    def test_zoom_over_active_workout_keeps_workout_scroll_and_inputs(self):
        self.page.locator('[data-a="w-start"]').first.click()
        scroller=self.page.locator('.w-body')
        scroller.evaluate('(el) => el.scrollTop=320')
        before=scroller.evaluate('(el) => el.scrollTop')
        self.page.evaluate('() => __gym.A["ex-open"]({dataset:{id:"Romanian_Deadlift"}})')
        self.page.locator('.drawing-phase').first.click()
        self.page.mouse.move(2,2);self.page.mouse.wheel(0,600);self.page.wait_for_timeout(150)
        self.assertEqual(before,scroller.evaluate('(el) => el.scrollTop'))
        self.assertTrue(self.page.locator('#workout').evaluate('(el) => el.inert'))
        self.page.keyboard.press('Escape')
        expect(self.page.locator('#sheet')).not_to_be_visible()
        self.assertEqual(before,scroller.evaluate('(el) => el.scrollTop'))
        self.assertFalse(self.page.locator('#workout').evaluate('(el) => el.inert'))
        scroller.hover();self.page.mouse.wheel(0,400);self.page.wait_for_timeout(200)
        self.assertGreater(scroller.evaluate('(el) => el.scrollTop'),before)

    def test_every_builtin_routine_exercise_has_loaded_start_end_images(self):
        ids=sorted({i['ex'] for r in self.data()['routines'] if r['builtin'] for i in r['items']})
        for eid in ids:
            self.page.evaluate('(id) => __gym.A["ex-open"]({dataset:{id}})',eid)
            images=self.page.locator('#sheet .drawing-pair img')
            expect(images).to_have_count(2)
            for image in images.all():
                self.assertGreater(image.evaluate('(el) => el.decode().then(() => el.naturalWidth)'),0,eid)
            self.page.locator('[data-a="sheet-close"]').click()
            expect(self.page.locator('#sheet')).not_to_be_visible()
        self.page.evaluate('() => __gym.A["ex-open"]({dataset:{id:"Romanian_Deadlift"}})')
        expect(self.page.locator('.figcap')).to_contain_text('Photo')
        expect(self.page.locator('.drawing-phase').first).to_have_attribute('data-source','img/ex/Romanian_Deadlift/0.jpg')
        self.page.locator('.drawing-phase').nth(1).click()
        expect(self.page.locator('.drawing-zoom img')).to_have_attribute('src','img/ex/Romanian_Deadlift/1.jpg')

    def test_broken_drawing_falls_back_to_exact_exercise_photos(self):
        self.page.route('**/img/fig/0211-*.svg',lambda route:route.abort())
        self.page.evaluate('() => __gym.A["ex-open"]({dataset:{id:"Barbell_Curl"}})')
        for phase in [0,1]:
            button=self.page.locator('.drawing-phase').nth(phase)
            expect(button.locator('img')).to_have_attribute('src','img/ex/Barbell_Curl/'+str(phase)+'.jpg')
            self.assertGreater(button.locator('img').evaluate('(el) => el.decode().then(() => el.naturalWidth)'),0)
            expect(button).to_be_enabled()
        self.page.locator('.drawing-phase').nth(1).click()
        expect(self.page.locator('.drawing-zoom img')).to_have_attribute('src','img/ex/Barbell_Curl/1.jpg')

    def test_custom_workout_symbols_and_lower_icon_persist(self):
        self.page.locator('[data-a="workout-view"][data-v="plans"]').first.click()
        symbols=[]
        for name in ['push','pull','legs','upper','lower']:
            icon=self.page.locator('.rtile[data-id="'+name+'"] .routine-symbol')
            expect(icon).to_have_count(1)
            symbols.append(icon.evaluate('(el) => el.innerHTML'))
        self.assertEqual(5,len(set(symbols)))
        self.page.locator('[data-a="r-open"][data-id="upper"]').click()
        self.page.locator('[data-a="r-edit"]').click()
        self.page.locator('[data-a="re-icon"][data-v="lower"]').click()
        expect(self.page.locator('[data-a="re-icon"][data-v="lower"]')).to_have_attribute('aria-pressed','true')
        self.page.locator('[data-a="re-save"]').click()
        self.page.reload(wait_until='networkidle')
        self.page.locator('[data-a="workout-view"][data-v="plans"]').first.click()
        self.assertEqual('lower',next(r for r in self.data()['routines'] if r['id']=='upper')['icon'])
        expect(self.page.locator('.rtile[data-id="upper"]')).to_have_class(__import__('re').compile('.*ic-lower.*'))

    def test_new_bottom_navigation_and_nested_exercise_library(self):
        self.assertEqual(['Workout','Food','Settings','Goals','Profile'],self.page.locator('#tabbar button').all_text_contents())
        expect(self.page.locator('#tabbar [data-tab="lib"]')).to_have_count(0)
        self.page.locator('[data-a="workout-view"][data-v="exercises"]').click()
        self.page.locator('[data-in="lib-q"]').fill('Romanian Deadlift')
        expect(self.page.locator('#lib-list')).to_contain_text('Romanian Deadlift')
        self.page.locator('#lib-list [data-a="ex-open"]').first.click()
        expect(self.page.locator('.drawing-pair')).to_be_visible()
        self.page.locator('[data-a="sheet-close"]').click()
        expect(self.page.locator('#sheet')).not_to_be_visible()
        self.page.locator('[data-tab="goals"]').click()
        expect(self.page.locator('.habit-card')).to_be_visible()
        self.page.locator('[data-a="goals-view"][data-v="progress"]').click()
        expect(self.page.locator('[data-f="bw"]')).to_be_visible()
        self.page.locator('#tabbar [data-a="settings"]').click()
        expect(self.page.locator('#sheet')).to_contain_text('Appearance')

    def test_profile_photo_bio_color_and_draft_survive_save_and_reload(self):
        import base64
        self.page.locator('[data-tab="profile"]').click();self.page.locator('[data-a="profile-edit"]').click()
        photo=self.files/'profile-fixture.png'
        content=self.page.evaluate("() => {const c=document.createElement('canvas');c.width=120;c.height=100;const x=c.getContext('2d');x.fillStyle='#aabbee';x.fillRect(0,0,120,100);return c.toDataURL('image/png').split(',')[1];}")
        photo.write_bytes(base64.b64decode(content))
        self.page.locator('[name="displayName"]').fill('Boti <strong>Gym</strong>')
        self.page.locator('#sheet [name="username"]').fill('Boti_Gym')
        self.page.locator('[name="bio"]').fill('Working on my next milestone.')
        self.page.locator('[data-in="profile-photo"]').set_input_files(str(photo))
        expect(self.page.locator('.avatar-edit img')).to_be_visible()
        expect(self.page.locator('[name="displayName"]')).to_have_value('Boti <strong>Gym</strong>')
        self.page.locator('[data-a="profile-color"][data-v="violet"]').click()
        expect(self.page.locator('[name="bio"]')).to_have_value('Working on my next milestone.')
        self.page.locator('button[form="profile-edit-form"]').click()
        expect(self.page.locator('#sheet')).not_to_be_visible()
        self.page.reload(wait_until='networkidle');self.page.locator('[data-tab="profile"]').click()
        expect(self.page.locator('.profile-identity h2')).to_have_text('Boti <strong>Gym</strong>')
        expect(self.page.locator('.profile-identity h2 strong')).to_have_count(0)
        expect(self.page.locator('.profile-cover')).to_have_class(__import__('re').compile('.*theme-violet.*'))
        self.assertGreater(self.page.locator('.profile-avatar img').evaluate('(el) => el.decode().then(() => el.naturalWidth)'),0)
        self.assertEqual('boti_gym',self.data()['settings']['publicProfile']['username'])
        self.page.locator('[data-a="profile-edit"]').click();self.page.locator('[data-a="profile-photo-remove"]').click()
        self.page.locator('button[form="profile-edit-form"]').click()
        expect(self.page.locator('#sheet')).not_to_be_visible()
        expect(self.page.locator('.profile-avatar img')).to_have_count(0)

    def test_profile_calorie_clock_uses_today_target_and_active_budget(self):
        self.page.evaluate("() => {const d=Store.d,k=__gym.ui.foodDate;d.settings.targets={kcal:1600,p:120,c:200,f:60};d.settings.addActive=true;d.act[k]={kcal:200,steps:5000};d.food[k]=[{id:'calorie-test',name:'Meal',g:300,kcal:900,p:45,c:100,f:30,t:Date.now()}];__gym.ui.foodDate='2020-01-01';Store.save();}")
        self.page.locator('[data-tab="profile"]').click()
        expect(self.page.locator('[data-calorie-total]')).to_have_text('900')
        expect(self.page.locator('[data-calorie-goal]')).to_have_text('of 1,800 kcal')
        expect(self.page.locator('.calorie-remaining')).to_have_text('900 kcal remaining')
        expect(self.page.locator('.dial-tick')).to_have_count(60)
        expect(self.page.locator('.dial-tick.filled')).to_have_count(30)
        self.page.evaluate("() => {const k=Object.keys(Store.d.food)[0];Store.d.food[k][0].kcal=2000;__gym.render();}")
        expect(self.page.locator('.dial-tick.filled')).to_have_count(60)
        expect(self.page.locator('.calorie-remaining')).to_have_text('200 kcal above your target')
        self.page.evaluate('() => {Store.d.settings.targets=null;__gym.render();}')
        expect(self.page.locator('[data-calorie-goal]')).to_have_text('No target set')
        expect(self.page.locator('.dial-tick.filled')).to_have_count(0)

    def test_badges_are_earned_and_selected_individually_with_four_slot_limit(self):
        self.page.evaluate("""() => {const now=Date.now()-10000;Store.d.workouts=Array.from({length:10},(_,i)=>({id:'badge'+i,name:'Fixture',start:now-i*86400000-60000,end:now-i*86400000,entries:[{ex:'Barbell_Bench_Press_-_Medium_Grip',sets:[{kg:100,reps:100,w:false}]},{ex:'Barbell_Full_Squat',sets:[{kg:20,reps:5,w:false}]},{ex:'Barbell_Deadlift',sets:[{kg:40,reps:5,w:false}]},{ex:'Standing_Military_Press',sets:[{kg:10,reps:5,w:false}]}]}));Store.save();} """)
        self.page.locator('[data-tab="profile"]').click();self.page.locator('[data-a="profile-badges"]').first.click()
        expect(self.page.locator('[data-id="fifty"]')).to_be_disabled()
        for bid in ['bench','first','days','volume']:self.page.locator('.badge-choice[data-id="'+bid+'"]').click()
        self.assertEqual(['bench','first','days','volume'],self.data()['settings']['publicProfile']['showcase'])
        self.page.locator('.badge-choice[data-id="ten"]').click()
        self.assertEqual(4,len(self.data()['settings']['publicProfile']['showcase']))
        self.page.locator('.badge-choice[data-id="days"]').click()
        self.page.locator('.badge-choice[data-id="ten"]').click()
        self.page.locator('[data-a="sheet-close"]').click();expect(self.page.locator('#sheet')).not_to_be_visible()
        self.assertEqual(['bench','first','volume','ten'],self.page.locator('.profile-showcase [data-badge]').evaluate_all('(els)=>els.map(el=>el.dataset.badge)'))
        self.page.reload();self.page.locator('[data-tab="profile"]').click()
        expect(self.page.locator('.profile-showcase .achievement')).to_have_count(4)
        self.page.evaluate('() => {Store.d.workouts=[];Store.save();__gym.render();}')
        expect(self.page.locator('.profile-showcase .achievement')).to_have_count(0)

    def test_profile_save_failure_keeps_previous_profile_and_retries(self):
        self.page.locator('[data-tab="profile"]').click();self.page.locator('[data-a="profile-edit"]').click()
        self.page.locator('[name="displayName"]').fill('Retry profile')
        self.page.evaluate("() => {window.fixtureOriginalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='gymapp.v1')throw new DOMException('Quota full','QuotaExceededError');return fixtureOriginalSet.call(this,k,v);};}")
        self.page.locator('button[form="profile-edit-form"]').click()
        expect(self.page.locator('.profile-edit-error')).to_be_visible()
        self.assertEqual('',self.data()['settings']['publicProfile']['displayName'])
        self.page.evaluate('() => {Storage.prototype.setItem=fixtureOriginalSet;}')
        self.page.locator('button[form="profile-edit-form"]').click();expect(self.page.locator('#sheet')).not_to_be_visible()
        self.assertEqual('Retry profile',self.data()['settings']['publicProfile']['displayName'])

    def test_profile_cleaning_and_cloud_merge_preserve_private_profile_fields(self):
        result=self.page.evaluate("""() => {const dirty={username:'invalid name',displayName:'<img src=x>',bio:'b'.repeat(300),avatar:'data:image/svg+xml;base64,AAAA',theme:'evil',showcase:['first','first','fake','bench']};const clean=Store.clean({settings:{publicProfile:dirty}}).settings.publicProfile;const merged=Cloud.merge({settings:{publicProfile:{displayName:'Older'}},mt:{settings:1}},{settings:{publicProfile:{displayName:'Newer'}},mt:{settings:2}});return {clean,merged:merged.settings.publicProfile};} """)
        self.assertEqual('',result['clean']['username']);self.assertEqual('',result['clean']['avatar'])
        self.assertEqual('mint',result['clean']['theme']);self.assertEqual(160,len(result['clean']['bio']))
        self.assertEqual(['first','bench'],result['clean']['showcase']);self.assertEqual('Newer',result['merged']['displayName'])

    def test_profile_and_navigation_fit_mobile_in_both_languages_and_themes(self):
        for width in [320,390,768,1280]:
            self.page.set_viewport_size({'width':width,'height':844})
            for lang in ['en','hu']:
                for theme in ['deep','light']:
                    self.page.evaluate('(args)=>{Store.d.settings.lang=args[0];__gym.A["set-bg"]({dataset:{v:args[1]}})}',[lang,theme])
                    self.page.locator('[data-tab="profile"]').click()
                    self.assertFalse(self.page.evaluate('()=>document.documentElement.scrollWidth>innerWidth+1'),(width,lang,theme))
                    for button in self.page.locator('#tabbar button').all():
                        box=button.bounding_box();self.assertGreaterEqual(box['width'],44);self.assertGreaterEqual(box['height'],44)
                    self.page.locator('[data-a="profile-edit"]').click()
                    self.assertFalse(self.page.locator('#sheet').evaluate('(el)=>el.scrollWidth>el.clientWidth+1'))
                    self.page.locator('[data-a="sheet-close"]').click();expect(self.page.locator('#sheet')).not_to_be_visible()

    def start_social_fixture(self,handler):
        uid='00000000-0000-4000-8000-000000000001'
        self.context.route('**/js/config.js',lambda route:route.fulfill(content_type='text/javascript',body='window.CLOUD='+json.dumps({'url':self.url,'key':'fixture-publishable-key-no-secrets'})+';'))
        self.page.evaluate('(session)=>localStorage.setItem("gymapp.v1.session",JSON.stringify(session))',{'access_token':'fixture-user-token','refresh_token':'fixture-refresh','expires_at':int(__import__('time').time())+3600,'user':{'id':uid,'email':'fixture@example.test'}})
        def api(route):
            self.assertEqual('Bearer fixture-user-token',route.request.headers.get('authorization'))
            path=urlsplit(route.request.url).path
            if '/rpc/' in path:
                name=path.rsplit('/',1)[-1]
                body=route.request.post_data_json
                result,status=handler(name,body)
            else:result,status=([{'updated_at':'2026-10-08T00:00:00Z'}] if route.request.method=='POST' else []),200
            route.fulfill(status=status,content_type='application/json',body=json.dumps(result))
        self.context.route('**/rest/v1/**',api)
        self.page.reload(wait_until='networkidle')
        self.page.locator('[data-tab="profile"]').click()

    def test_social_profile_publish_requests_acceptance_and_friend_view(self):
        me='00000000-0000-4000-8000-000000000001';other='00000000-0000-4000-8000-000000000002'
        incoming=[{'request_id':other,'user_id':other,'username':'friend'}];outgoing=[];friends=[];published=[]
        def handler(name,body):
            if name=='social_dashboard':
                rows=[{'user_id':me,'username':'fixture','display_name':'Fixture','avatar':'','theme':'mint','score':105,'days':1}]
                if friends:rows.append({'user_id':other,'username':'friend','display_name':'Friend','avatar':'','theme':'violet','score':110,'days':1})
                return {'profile':{'username':'fixture'},'incoming':incoming,'outgoing':outgoing,'friends':friends,'leaderboard':rows},200
            if name=='social_save_profile':published.append(body);return {'username':body['p_username']},200
            if name=='social_request_friend':outgoing.append({'request_id':other,'user_id':other,'username':body['p_username']});return {'id':other},200
            if name=='social_respond_friend':
                self.assertTrue(body['p_accept']);incoming.clear();friends.append({'user_id':other,'username':'friend'});return {'ok':True},200
            if name=='social_view_profile':return {'username':'friend','display_name':'Friend','bio':'Keep going','avatar':'','theme':'violet','badges':['first'],'stats':{'badges':['first'],'score':110,'days':1,'highest':0}},200
            if name=='social_remove_friend':friends.clear();return {'ok':True},200
            raise AssertionError(name)
        self.start_social_fixture(handler)
        expect(self.page.locator('.leaderboard li')).to_have_count(1)
        self.page.locator('[data-a="profile-edit"]').click()
        self.page.locator('#sheet [name="username"]').fill('fixture');self.page.locator('[name="displayName"]').fill('Fixture')
        self.page.locator('button[form="profile-edit-form"]').click();expect(self.page.locator('#sheet')).not_to_be_visible()
        self.assertEqual('fixture',published[-1]['p_username']);self.assertEqual([],published[-1]['p_badges'])
        self.page.locator('[data-a="friend-respond"][data-accept="true"]').click()
        expect(self.page.locator('.leaderboard li')).to_have_count(2)
        expect(self.page.locator('.leaderboard li').first).to_contain_text('Friend')
        self.page.locator('.leaderboard [data-a="friend-profile"][data-id="'+other+'"]').click()
        expect(self.page.locator('#sheet')).to_contain_text('Keep going')
        expect(self.page.locator('#sheet .profile-showcase')).to_contain_text('First rep')
        self.page.locator('[data-a="sheet-close"]').click();expect(self.page.locator('#sheet')).not_to_be_visible()
        self.page.locator('#friend-username').fill('new_friend');self.page.locator('.friend-search button').click()
        expect(self.page.locator('.friend-list').first).to_contain_text('Sent requests')
        self.page.locator('.friend-list').last.locator('summary').click()
        self.page.on('dialog',lambda dialog:dialog.accept());self.page.locator('[data-a="friend-remove"]').last.click()
        expect(self.page.locator('.leaderboard li')).to_have_count(1)

    def test_social_missing_migration_and_username_conflict_keep_local_edits(self):
        mode=['missing']
        def handler(name,body):
            if mode[0]=='missing':return {'code':'PGRST202','message':'Could not find public.social_dashboard'},404
            if name=='social_save_profile':return {'code':'23505','message':'duplicate username'},409
            return {'profile':None,'incoming':[],'outgoing':[],'friends':[],'leaderboard':[]},200
        self.start_social_fixture(handler)
        expect(self.page.locator('.social-status')).to_contain_text('Friends are not available yet')
        self.page.locator('[data-a="profile-edit"]').click();self.page.locator('#sheet [name="username"]').fill('taken_name')
        self.page.locator('[name="bio"]').fill('Saved here even if offline.')
        mode[0]='conflict';self.page.locator('button[form="profile-edit-form"]').click()
        expect(self.page.locator('.profile-edit-error')).to_contain_text('username is taken')
        self.assertEqual('Saved here even if offline.',self.data()['settings']['publicProfile']['bio'])
        self.page.locator('[data-a="sheet-close"]').click();expect(self.page.locator('#sheet')).not_to_be_visible()
        expect(self.page.locator('.profile-bio')).to_have_text('Saved here even if offline.')
        self.assertEqual('',self.page.evaluate('()=>document.body.style.position'))

    def test_layout_and_navigation_in_both_themes(self):
        self.upload(self.hu_file)
        for width in [320,390,768,1280]:
            self.page.set_viewport_size({'width':width,'height':844})
            overflow=self.page.evaluate("() => {const d=document.querySelector('#pdf-plan-dialog');return {page:document.documentElement.scrollWidth>innerWidth+1,dialog:d.scrollWidth>d.clientWidth+1,footer:d.querySelector('[data-pdf=apply]').getBoundingClientRect().bottom>innerHeight};}")
            self.assertEqual({'page':False,'dialog':False,'footer':False},overflow)
            self.assertLessEqual(self.page.locator('[data-pdf="workouts"]').bounding_box()['width'],20)
        self.page.locator('[data-pdf="close"]').click()
        for width in [320,390,768,1280]:
            self.page.set_viewport_size({'width':width,'height':844})
            for theme in ['aurora','deep','plain','light']:
                self.page.evaluate('(theme) => {__gym.A["set-bg"]({dataset:{v:theme}});}',theme)
                for tab in ['home','food','goals','profile']:
                    self.page.locator('[data-tab="'+tab+'"]').click()
                    self.assertFalse(self.page.evaluate('() => document.documentElement.scrollWidth>innerWidth+1'))


if __name__ == '__main__':
    unittest.main(verbosity=2)
