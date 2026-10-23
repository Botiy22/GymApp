"""Private planner editing/import/sync and bilingual page checks in real Chromium."""
import json
import unittest
import test_responsive_polish as responsive
import test_profile_sharing as sharing

class DailyPlannerBrowser(unittest.TestCase):
    setUpClass=classmethod(responsive.ResponsivePolish.setUpClass.__func__)
    tearDownClass=classmethod(responsive.ResponsivePolish.tearDownClass.__func__)
    page=responsive.ResponsivePolish.page
    bounds=responsive.ResponsivePolish.bounds
    auth_page=sharing.ProfileSharing.auth_page

    def open_planner(self,page):
        page.locator('#tabbar [data-tab=goals]').click()
        page.locator('.planner-scroll').wait_for()
        page.evaluate('()=>__gym.A["planner-day"]({dataset:{d:"2026-10-22"}})')

    def ics(self,title='Swim',hour='090000'):
        return f'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:fixture-event\r\nDTSTART:20261022T{hour}Z\r\nDTEND:20261022T110000Z\r\nSUMMARY:{title}\r\nEND:VEVENT\r\nEND:VCALENDAR'

    def test_create_repeat_edit_complete_undo_delete_and_backup(self):
        page,errors=self.page(320,844,'hu',20);self.open_planner(page)
        page.locator('[data-a=planner-new][data-kind=gym]').click()
        page.locator('[name=title]').fill('My gym session');page.locator('[name=date]').fill('2026-10-22')
        page.locator('[name=start]').fill('09:00');page.locator('[name=end]').fill('10:30');page.locator('[name=repeat]').select_option('weekly');page.locator('[name=note]').fill('Upper body')
        self.bounds(page,'activity form 320 HU larger text')
        page.locator('button[form=planner-event-form]').click();self.assertEqual(page.locator('.planner-event').count(),1)
        page.locator('.planner-done').click();self.assertTrue(page.locator('.planner-event').evaluate('(e)=>e.classList.contains("complete")'))
        page.reload();page.wait_for_function('()=>!!window.__gym');self.open_planner(page)
        self.assertEqual(page.locator('.planner-event.complete').count(),1)
        page.locator('.planner-done').click();self.assertEqual(page.locator('.planner-event.complete').count(),0)
        page.locator('[data-a=planner-shift][data-d="7"]').click();self.assertEqual(page.locator('.planner-event').count(),1);self.assertEqual(page.locator('.planner-event.complete').count(),0)
        page.locator('.planner-event-main').click();page.locator('[name=title]').fill('Updated session');page.locator('button[form=planner-event-form]').click()
        exported=page.evaluate('JSON.parse(Store.exportJSON()).data.planner');self.assertEqual(exported['events'][0]['title'],'Updated session')
        page.evaluate('()=>{const stale=Store.cloudDoc(),e=Store.d.planner.events[0];e.done["2026-10-22"]={value:true,at:Date.now()+1};Store.save();const merged=Cloud.merge(Store.cloudDoc(),stale);Store.adopt(merged)}')
        page.locator('.planner-event-main').click();page.on('dialog',lambda d:d.accept());page.locator('[data-a=planner-delete]').click()
        self.assertEqual(page.evaluate('Store.d.planner.events.length'),0);self.assertTrue(page.evaluate('Object.keys(Store.d.del).some(k=>k.startsWith("pe_"))'));self.assertEqual(errors,[])

    def test_calendar_file_cancel_import_resync_escape_and_safe_text(self):
        page,errors=self.page();self.open_planner(page);page.locator('[data-a=planner-calendar]').click()
        page.locator('[data-in=planner-ics]').evaluate('(e)=>e.dispatchEvent(new Event("cancel",{bubbles:true}))')
        self.assertTrue(page.locator('#sheet').evaluate('(e)=>e.open'))
        page.locator('[data-in=planner-ics]').set_input_files({'name':'routine.ics','mimeType':'text/calendar','buffer':self.ics('<Gym & swim>').encode()})
        page.wait_for_function('()=>Store.d.planner.events.length===1')
        self.assertEqual(page.locator('.planner-event-main b').inner_text(),'<Gym & swim>');self.assertEqual(page.locator('.planner-event-main b *').count(),0)
        page.locator('.planner-done').click();page.locator('[data-a=planner-calendar]').click()
        page.locator('[data-in=planner-ics]').set_input_files({'name':'routine.ics','mimeType':'text/calendar','buffer':self.ics('Moved swim','100000').encode()})
        page.wait_for_function('()=>Store.d.planner.events[0]?.title==="Moved swim"');self.assertEqual(page.evaluate('Store.d.planner.sources.length'),1);self.assertEqual(page.locator('.planner-event.complete').count(),1)
        page.locator('[data-a=planner-calendar]').click();page.keyboard.press('Escape');page.wait_for_function('()=>!document.querySelector("#sheet").open');self.assertFalse(page.locator('#view').evaluate('(e)=>e.inert'));self.assertEqual(errors,[])

    def test_phone_light_dark_large_text_overlap_and_week_scroll(self):
        for width,lang,size in [(320,'hu',20),(390,'en',16),(844,'en',16)]:
            page,errors=self.page(width,844,lang,size,light=lang=='hu');self.open_planner(page)
            page.evaluate('()=>{const start=+new Date(__gym.ui.plannerDate+"T09:00");Store.d.planner.events=Array.from({length:3},(_,i)=>({id:"pe_"+i,title:"A very long activity title that must fit",start:start+i*600000,end:start+5400000,category:"swim",repeat:"none",updatedAt:Date.now()}));Store.save();__gym.render()}')
            self.bounds(page,'overlapping day timetable');self.assertEqual(page.locator('.planner-event').count(),3)
            page.locator('[data-a=planner-view][data-v=week]').click()
            self.assertTrue(page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
            self.assertGreater(page.locator('.planner-scroll').evaluate('(e)=>e.scrollWidth'),800)
            page.locator('.planner-scroll').evaluate('(e)=>e.scrollLeft=300');page.locator('[data-a=planner-view][data-v=day]').click();self.bounds(page,'return to day')
            page.screenshot(path=f'/tmp/reppsy-planner-{width}-{lang}.png');self.assertEqual(errors,[])

    def test_live_calendar_connection_refresh_failure_and_private_url(self):
        page,calls,errors=self.auth_page();self.open_planner(page);feed={'raw':self.ics(),'fail':False,'calls':0}
        def remote(route):
            feed['calls']+=1
            if feed['fail']:route.fulfill(status=502,json={'code':'plannerSyncFailed'})
            else:route.fulfill(json={'ics':feed['raw']})
        page.route('**/functions/v1/calendar-feed',remote)
        page.locator('[data-a=planner-calendar]').click();page.locator('#planner-calendar-form [name=name]').fill('Private calendar')
        secret='https://calendar.google.com/calendar/ical/private-token/basic.ics';page.locator('[name=url]').fill(secret)
        page.locator('#planner-calendar-form .btn').click();page.wait_for_function('()=>Store.d.planner.sources.some(s=>s.kind==="feed")&&!__gym.ui.calendarBusy')
        self.assertNotIn('private-token',page.evaluate('Store.exportJSON()'));self.assertNotIn('private-token',page.evaluate('JSON.stringify(Store.cloudDoc())'))
        page.locator('.planner-done').click();feed['raw']=self.ics('Updated swim','100000')
        page.locator('[data-a=planner-calendar]').click();page.locator('[data-a=planner-sync-one]').click()
        page.wait_for_function('()=>Store.d.planner.events[0]?.title==="Updated swim"&&!__gym.ui.calendarBusy');self.assertTrue(page.evaluate('Object.values(Store.d.planner.events[0].done)[0].value'))
        feed['fail']=True;page.locator('[data-a=planner-sync-one]').click();page.wait_for_function('()=>__gym.ui.calendarStatus==="plannerSyncFailed"&&!__gym.ui.calendarBusy')
        self.assertEqual(page.evaluate('Store.d.planner.events[0].title'),'Updated swim');page.wait_for_timeout(250);self.assertEqual(feed['calls'],3)
        feed['fail']=False;feed['raw']=self.ics('Automatically refreshed','100000')
        page.locator('[data-a=sheet-close]').click()
        page.evaluate('()=>{__gym.ui.calendarAttempt=0;Store.d.planner.sources[0].syncedAt=Date.now()-16*60000}')
        page.locator('#tabbar [data-tab=food]').click();page.locator('#tabbar [data-tab=goals]').click()
        page.wait_for_function('()=>Store.d.planner.events[0]?.title==="Automatically refreshed"&&!__gym.ui.calendarBusy')
        self.assertEqual(feed['calls'],4)
        page.locator('[data-a=planner-calendar]').click()
        page.on('dialog',lambda d:d.accept());page.locator('[data-a=planner-disconnect]').click();self.assertEqual(page.evaluate('Store.d.planner.events.length'),0);self.assertNotIn('private-token',page.evaluate('localStorage.getItem("gymapp.v1.calendar."+Cloud.user.id)'));self.assertEqual(errors,[])

    def test_missing_calendar_service_retains_link_and_explains_import(self):
        page,calls,errors=self.auth_page();self.open_planner(page)
        page.route('**/functions/v1/calendar-feed',lambda r:r.fulfill(status=404,json={'code':'NOT_FOUND'}))
        page.locator('[data-a=planner-calendar]').click();url='https://calendar.google.com/calendar/ical/fixture/basic.ics';page.locator('[name=url]').fill(url)
        page.locator('#planner-calendar-form .btn').click();page.wait_for_function('()=>__gym.ui.calendarError==="plannerCalendarSetup"&&!__gym.ui.calendarBusy')
        self.assertEqual(page.locator('[name=url]').input_value(),url);self.assertEqual(page.evaluate('Store.d.planner.sources.length'),0);self.assertIn('.ics',page.locator('.planner-calendar-error').inner_text());self.assertEqual(errors,[])

    def test_neptun_connection_preserves_query_and_sets_provider_name(self):
        page,calls,errors=self.auth_page();self.open_planner(page)
        query='https://neptun.bme.hu/hallgatoi/api/Calendar/CalendarExportFileToSyncronization?id=synthetic-fixture.ics'
        received=[]
        def feed(route):
            received.append(route.request.post_data_json['url'])
            route.fulfill(json={'ics':self.ics('Fixture university lecture')})
        page.route('**/functions/v1/calendar-feed',feed)
        page.locator('[data-a=planner-calendar]').click();page.locator('#sheet details').last.locator('summary').click();self.assertIn('BME Neptun',page.locator('#sheet').inner_text())
        page.locator('[name=url]').fill(query);page.locator('#planner-calendar-form .btn').click()
        page.wait_for_function('()=>Store.d.planner.sources.length===1&&!__gym.ui.calendarBusy')
        self.assertEqual(received,[query]);self.assertEqual(page.evaluate('Store.d.planner.sources[0].name'),'BME Neptun')
        self.assertEqual(page.evaluate('Store.d.planner.events[0].title'),'Fixture university lecture')
        self.assertNotIn('synthetic-fixture.ics',page.evaluate('Store.exportJSON()'));self.assertEqual(errors,[])
