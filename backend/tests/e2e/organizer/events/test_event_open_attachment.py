# biblioteci playwright pentru gestionare pagini, așteptări și erori
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

# Test pentru a deschide atașamentul unui eveniment
def test_open_attachment_only(page: Page):
    page.set_default_timeout(30000)

    # 1. LOGIN
    login(page)

    # 2. Găsește evenimentul "Testare"
    title = page.locator(f"text={TARGET_TITLE}").first
    expect(title).to_be_visible(timeout=30000)
    slow(page, 400)

    # 3. Cardul evenimentului
    card = title.locator(
        f"xpath=ancestor::div[.//*[contains(normalize-space(),'Vezi Detalii')]][1]"
    )
    expect(card).to_be_visible(timeout=20000)

    # 4. Vezi Detalii
    vezi_detalii = card.locator("text=/^Vezi\\s+Detalii$/i").first
    expect(vezi_detalii).to_be_visible(timeout=20000)
    vezi_detalii.scroll_into_view_if_needed()
    slow(page, 200)
    vezi_detalii.click(force=True)
    slow(page, 900)

    # 5. Modalul de detalii
    close_btn = page.locator("text=/^Închide$/i").first
    expect(close_btn).to_be_visible(timeout=20000)

    # 6. Deschide atașamentul
    deschide = page.locator("text=/^Deschide$/i").first
    expect(deschide).to_be_visible(timeout=20000)
    deschide.scroll_into_view_if_needed()
    slow(page, 300)

    # Click pe Deschide (încearcă să deschidă în tab nou)
    try:
        # așteaptă deschiderea unui tab nou
        with page.context.expect_page(timeout=2000):
            deschide.click(force=True)
    except PlaywrightTimeoutError:
        # dacă nu s-a deschis tab nou, dă click normal
        deschide.click(force=True)

    slow(page, 4200)
