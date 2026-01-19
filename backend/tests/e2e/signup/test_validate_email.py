# biblioteci Playwright pentru gestionare pagini și așteptări
from playwright.sync_api import Page, expect

BASE_UI = "https://unievent-14dq.onrender.com"
EXISTING_EMAIL = "test@gmail.com"
PASSWORD = "Test1234!"

# pauză simplă
def _pause(page: Page, ms: int = 700):
    page.wait_for_timeout(ms)

# funcție pentru a tasta lent în câmpuri
def _type_slow(locator, text: str, delay: int = 80):
    locator.click()
    locator.press("Control+A")
    locator.type(text, delay=delay)  # delay între caractere

# Test pentru înregistrare cu email existent
def test_register_with_existing_email_ui_slow_flow(page: Page):
    page.set_default_timeout(15000)

    page.goto(f"{BASE_UI}/auth", wait_until="domcontentloaded")
    _pause(page, 800)

    # ---- NAVIGARE LA REGISTER ----
    page.locator("span", has_text="Înregistrează-te").first.click()
    _pause(page, 800)

    # ---- REGISTER ----
    register_h1 = page.get_by_role("heading", name="Înregistrează-te")
    expect(register_h1).to_be_visible(timeout=10000)

    register_form = register_h1.locator("xpath=ancestor::form[1]")
    expect(register_form).to_be_visible(timeout=10000)
    _pause(page, 600)

    nume = register_form.locator('input[placeholder="Nume"]')
    prenume = register_form.locator('input[placeholder="Prenume"]')
    email = register_form.locator('input[placeholder="Ex: student@usv.ro"]')
    parola = register_form.locator('input[placeholder="Introduceți parola"]')
    confirma = register_form.locator('input[placeholder="Confirmă parola"]')

    _type_slow(nume, "Test", delay=120); _pause(page, 500)
    _type_slow(prenume, "User", delay=120); _pause(page, 500)
    _type_slow(email, EXISTING_EMAIL, delay=90); _pause(page, 700)
    _type_slow(parola, PASSWORD, delay=120); _pause(page, 500)
    _type_slow(confirma, PASSWORD, delay=120); _pause(page, 700)

    register_form.get_by_role("button", name="CREEAZĂ CONT").click()
    _pause(page, 1000)

    # Așteptare pentru mesaj de eroare
    expect(register_h1).to_be_visible(timeout=8000)

    # mesaj de eroare (generic)
    error_msg = page.locator("text=/exist|deja|folosit|înregistrat|eroare|invalid/i").first
    expect(error_msg).to_be_visible(timeout=8000)

    _pause(page, 1500)
