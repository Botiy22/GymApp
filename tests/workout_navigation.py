"""Navigate using the visible three-section Workout menu."""
def select_workout(page, view):
    group='library' if view in ['plans','exercises','stability'] else 'training'
    if view!='history':
        menu=page.locator(f'[data-workout-menu={group}]')
        if not menu.evaluate('(d)=>d.open'):
            menu.locator('summary').click()
    page.locator(f'.workout-tabs [data-a=workout-view][data-v={view}]').click()
