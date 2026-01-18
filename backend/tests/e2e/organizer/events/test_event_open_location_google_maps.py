import re
# biblioteci Playwright pentru gestionare pagini, așteptări și excepții
from playwright.sync_api import Page, expect, TimeoutError as PlaywrightTimeoutError

BASE_UI = "http://localhost:5173"
EMAIL = "test@gmail.com"
PASSWORD = "Test1234!"
TARGET_TITLE = "Testare" 

# Funcție utilitară pentru a aștepta între acțiuni
def slow(page: Page, ms=500):
    page.wait_for_timeout(ms)

# Funcție de login
def login(page: Page):
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    slow(page, 700)

    login_form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(login_form).to_be_visible(timeout=20000)

    login_form.locator('input[placeholder="Introduceți adresa de email"]').fill(EMAIL)
    slow(page, 200)
    login_form.locator('input[placeholder="Introduceți parola"]').fill(PASSWORD)
    slow(page, 200)

    login_form.locator('button:has-text("AUTENTIFICARE")').click()
    expect(page).not_to_have_url("**/auth", timeout=20000)
    slow(page, 1200)

# Funcție pentru a deschide modalul de detalii al evenimentului
def open_event_details(page: Page, title_text: str):
    title = page.locator(f"text={title_text}").first
    expect(title).to_be_visible(timeout=30000)
    slow(page, 300)

    card = title.locator(
        f"xpath=ancestor::div[.//text()[normalize-space()='{title_text}']][.//*[contains(normalize-space(),'Vezi Detalii')]][1]"
    )
    expect(card).to_be_visible(timeout=20000)

    vezi_detalii = card.locator("text=/^Vezi\\s+Detalii$/i").first
    expect(vezi_detalii).to_be_visible(timeout=20000)
    vezi_detalii.scroll_into_view_if_needed()
    slow(page, 200)
    vezi_detalii.click(force=True)
    slow(page, 900)

    expect(page.locator("text=/^Închide$/i").first).to_be_visible(timeout=20000)

# Funcție pentru a accepta consimțământul Google dacă este prezent
def accept_google_consent_if_present(p: Page):
    p.wait_for_load_state("domcontentloaded")

    if "consent.google.com" not in (p.url or ""):
        return

    accept_btn = p.get_by_role("button", name="Acceptă tot")
    reject_btn = p.get_by_role("button", name="Respinge tot")

    if accept_btn.count() == 0:
        accept_btn = p.locator(
            "button:has-text('Acceptă tot'), button:has-text('Accepta tot'), button:has-text('Accept all')"
        )
    if reject_btn.count() == 0:
        reject_btn = p.locator("button:has-text('Respinge tot'), button:has-text('Reject all')")

    if accept_btn.count() > 0 and accept_btn.first.is_visible():
        accept_btn.first.click(force=True)
    elif reject_btn.count() > 0 and reject_btn.first.is_visible():
        reject_btn.first.click(force=True)
    else:
        p.locator("button:visible").first.click(force=True)

    p.wait_for_load_state("domcontentloaded")

# Test pentru a deschide locația unui eveniment în Google Maps
def test_open_location_in_google_maps(page: Page):
    page.set_default_timeout(30000)

    login(page)
    open_event_details(page, TARGET_TITLE)

    # Cardul locației
    loc_label = page.locator("text=/^Locație$/i").first
    expect(loc_label).to_be_visible(timeout=20000)

    location_card = loc_label.locator("xpath=ancestor::div[.//text()[contains(.,'Aula')]][1]")
    expect(location_card).to_be_visible(timeout=20000)
    location_card.scroll_into_view_if_needed()
    slow(page, 250)

    # Deschide detaliile locației
    chevron = location_card.locator("button, [role='button']").last
    expect(chevron).to_be_visible(timeout=20000)
    slow(page, 200)
    chevron.click(force=True)
    slow(page, 900)

    # Link Google Maps
    maps_link = page.locator("text=/Deschide\\s+în\\s+Google\\s+Maps/i").first
    expect(maps_link).to_be_visible(timeout=20000)
    maps_link.scroll_into_view_if_needed()
    slow(page, 250)

    # Click pe link și așteaptă deschiderea unui tab nou
    with page.context.expect_page(timeout=8000) as pinfo:
        maps_link.click(force=True)

    maps_page = pinfo.value
    maps_page.wait_for_load_state("domcontentloaded")

    # Acceptă consimțământul Google dacă apare
    accept_google_consent_if_present(maps_page)

    # Așteaptă puțin pentru încărcare
    maps_page.wait_for_timeout(800)

    # Verifică URL-ul Google Maps
    expect(maps_page).to_have_url(re.compile(r"https?://(www\.)?google\.com/maps.*"), timeout=20000)

    slow(page, 4200)

    # Închide tabul Google Maps
    maps_page.close()
