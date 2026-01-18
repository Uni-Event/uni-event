import re
# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "http://localhost:5173"
EMAIL = "test@gmail.com"
PASSWORD = "Test1234!"
TARGET_EVENT = "Testare"

# Funcție utilitară pentru a aștepta între acțiuni
def slow(page: Page, ms=500):
    page.wait_for_timeout(ms)

# Funcție de login
def login(page: Page):
    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    slow(page, 700)

    form = page.locator("form").filter(has_text="Bine ai revenit!")
    expect(form).to_be_visible(timeout=20000)

    form.locator('input[placeholder="Introduceți adresa de email"]').fill(EMAIL)
    slow(page, 200)
    form.locator('input[placeholder="Introduceți parola"]').fill(PASSWORD)
    slow(page, 200)

    form.locator('button:has-text("AUTENTIFICARE")').click()
    expect(page).not_to_have_url(re.compile(r".*/auth.*"), timeout=20000)
    slow(page, 1200)

# Test pentru a gestiona un eveniment și a deschide detaliile acestuia
def test_manage_event_open_details(page: Page):
    page.set_default_timeout(30000)

    # 1. Login
    login(page)

    # 2. Click pe „Gestionează” din sidebar
    gestioneaza_btn = page.locator(
        "button:has-text('Gestionează'), a:has-text('Gestionează')"
    ).first
    expect(gestioneaza_btn).to_be_visible(timeout=20000)
    gestioneaza_btn.click(force=True)
    slow(page, 1200)

    # 3. Verificare robustă URL dashboard
    assert "/organizer/dashboard" in page.url, f"Nu sunt pe dashboard. URL actual: {page.url}"

    # 4. Găsește rândul evenimentului țintă
    event_row = page.locator(
        f"xpath=//div[.//text()[normalize-space()='{TARGET_EVENT}'] and .//button[contains(., 'Detalii')]]"
    ).first
    expect(event_row).to_be_visible(timeout=20000)
    event_row.scroll_into_view_if_needed()
    slow(page, 400)

    # 5. Click pe „Detalii”
    detalii_btn = event_row.locator("button:has-text('Detalii'), a:has-text('Detalii')").first
    expect(detalii_btn).to_be_visible(timeout=20000)
    slow(page, 250)
    detalii_btn.click(force=True)
    slow(page, 900)

    # 6. Verificare minimă: apare titlul în detalii
    expect(page.locator(f"text={TARGET_EVENT}").first).to_be_visible(timeout=20000)
