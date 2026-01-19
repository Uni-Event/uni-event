# biblioteci playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "https://unievent-14dq.onrender.com"
EMAIL = "test2@gmail.com"
PASSWORD = "Test1234!"

# Funcție utilitară pentru a aștepta între acțiuni
def slow(page: Page, ms=600):
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
    slow(page, 1000)

# Test pentru a vedea detaliile unui eveniment
def test_open_event_details(page: Page):
    page.set_default_timeout(30000)

    login(page)

    TARGET_TITLE = "Testare"

    # Găsește evenimentul țintă
    event_title = page.locator(f"text={TARGET_TITLE}").first
    expect(event_title).to_be_visible(timeout=30000)
    slow(page, 600)

    # Cardul evenimentului
    card = event_title.locator(
        f"xpath=ancestor::div[.//text()[normalize-space()='{TARGET_TITLE}']][.//*[contains(normalize-space(),'Vezi Detalii')]][1]"
    )
    expect(card).to_be_visible(timeout=20000)
    slow(page, 600)

    # Click „Vezi Detalii”
    vezi_detalii_btn = card.locator(
        "button:has-text('Vezi Detalii'), a:has-text('Vezi Detalii'), div:has-text('Vezi Detalii')"
    ).first

    expect(vezi_detalii_btn).to_be_visible(timeout=20000)
    vezi_detalii_btn.scroll_into_view_if_needed()
    slow(page, 300)
    vezi_detalii_btn.click(force=True)
    slow(page, 1200)

    # Verificare: modalul de detalii s-a deschis
    inchide_btn = page.locator("text=/^Închide$/i").first
    expect(inchide_btn).to_be_visible(timeout=20000)
    slow(page, 300)
    
    # Închide modalul
    inchide_btn.click(force=True)
    slow(page, 800)

    # Verificare: modalul s-a închis
    expect(inchide_btn).not_to_be_visible(timeout=20000)
