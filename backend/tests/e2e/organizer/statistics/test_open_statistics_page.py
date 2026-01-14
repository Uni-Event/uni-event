import re
# biblioteci playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "http://localhost:5173"
EMAIL = "test@gmail.com"
PASSWORD = "Test1234!"
TARGET_EVENT_TITLE = "event"

# Funcție utilitară pentru a aștepta între acțiuni
def slow(page: Page, ms=500):
    page.wait_for_timeout(ms)

# Funcție de login
def login(page: Page):
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")

    form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(form).to_be_visible(timeout=20000)

    form.locator('input[placeholder="Introduceți adresa de email"]').fill(EMAIL)
    form.locator('input[placeholder="Introduceți parola"]').fill(PASSWORD)
    form.locator('button:has-text("AUTENTIFICARE")').click()

    expect(page).not_to_have_url(re.compile(r".*/auth.*"), timeout=20000)
    expect(page.locator("text=/Panou\\s+Organizator/i")).to_be_visible(timeout=20000)

# Test pentru a deschide pagina de statistici și a interacționa cu un eveniment
def test_stats_click_event(page: Page):
    page.set_default_timeout(30000)
    login(page)

    # Din sidebar, click pe „Statistici”
    sidebar_stats = page.locator("a._navItem_reybs_61[href='/organizer/stats']")
    if sidebar_stats.count() > 0 and sidebar_stats.first.is_visible():
        sidebar_stats.first.click()
    else:
        page.locator("a[href='/organizer/stats']").first.click(force=True)

    expect(page).to_have_url(re.compile(r".*/organizer/stats.*"), timeout=20000)
    slow(page, 1500)

    # Panelul din stânga: zona cu titlul "EVENIMENTE TERMINATE"
    left_panel = page.locator(
        "xpath=//*[contains(translate(normalize-space(.),"
        "'ABCDEFGHIJKLMNOPQRSTUVWXYZĂÂÎȘȚ',"
        "'abcdefghijklmnopqrstuvwxyzăâîșț'),"
        "'evenimente terminate')]/ancestor::div[1]"
    ).first
    expect(left_panel).to_be_visible(timeout=20000)

    # Găsește evenimentul țintă și dă click pe titlu
    event_title = left_panel.get_by_text(TARGET_EVENT_TITLE, exact=True).first
    expect(event_title).to_be_visible(timeout=20000)
    event_title.scroll_into_view_if_needed()
    slow(page, 250)

    # Click pe titlu eveniment
    event_title.click(force=True)
    slow(page, 800)

    # Verificare: suntem pe pagina de statistici a evenimentului
    expect(page).to_have_url(re.compile(r".*/organizer/stats.*"), timeout=20000)
    expect(page.locator("text=/STATISTICI\\s+EVENIMENT/i").first).to_be_visible(timeout=20000)
    expect(page.locator(f"text={TARGET_EVENT_TITLE}").first).to_be_visible(timeout=20000)

    slow(page,2000)
