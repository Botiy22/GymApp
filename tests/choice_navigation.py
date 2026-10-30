"""Interact with an option through its visible shared dropdown."""
def choose(page, selector, value=None):
    source=page.locator(selector).first
    menu=source.locator('xpath=ancestor::details[contains(@class,"choice-menu")]')
    if menu.count() and not menu.evaluate('(e)=>e.open'):
        menu.locator(':scope>summary').click()
    if value is None:
        source.click()
    elif menu.count():
        index=source.evaluate('(e,v)=>[...e.options].findIndex(o=>o.value===v)',str(value))
        menu.locator(f'[data-choice-index="{index}"]').click()
    else:
        source.select_option(str(value))
